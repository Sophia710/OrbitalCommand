/**
 * Mock 引擎（前端纯 Promise 模拟）
 * ----------------------------------------------------------------------
 *  - delay / ok / fail / page / uid 等基础工具
 *  - 统一"伪请求"：dispatch 携带 800ms 延迟 + 随机抖动
 *  - 业务接口在 /api 目录下基于此引擎注册
 *  - 提供 schema 校验：每个 handler 可选声明 params / body 校验规则
 *  - 统一响应结构：{ code, message, data, ts }
 *  - 错误处理：校验失败 → code:400；未注册 → code:404；handler 抛错 → code:500
 */

import { sleep, rand, uid } from '@/utils'
import { MOCK } from './mock-data'

export const DEFAULT_LATENCY = 800
export const JITTER = 350

/* ---------------- 工具函数 ---------------- */

export function delay(ms = DEFAULT_LATENCY) {
  return sleep(ms + rand(0, JITTER))
}

export function ok(data, message = 'OK') {
  return { code: 0, message, data, ts: Date.now() }
}

export function fail(message = '操作失败', code = 1, data = null) {
  return { code, message, data, ts: Date.now() }
}

export function page(list, pageNo = 1, pageSize = 10) {
  const start = (pageNo - 1) * pageSize
  return {
    list: list.slice(start, start + pageSize),
    total: list.length,
    pageNo,
    pageSize,
  }
}

/* ---------------- 参数校验 ---------------- */

/**
 * 简易校验器：校验失败抛出 Error，错误信息形如 "[fieldName] reason"
 *  rules: { fieldName: [type, required, customFn] }
 *  - type: 'string' | 'number' | 'boolean' | 'array' | 'object'
 *  - required: boolean
 *  - customFn: (value) => true | string
 */
export function validate(data, rules = {}) {
  if (!rules || Object.keys(rules).length === 0) return
  for (const [field, [type, required, customFn]] of Object.entries(rules)) {
    const value = data?.[field]
    if (value === undefined || value === null || value === '') {
      if (required) throw new Error(`[${field}] 必填`)
      continue
    }
    if (type && !checkType(value, type)) {
      throw new Error(`[${field}] 类型错误，期望 ${type}`)
    }
    if (typeof customFn === 'function') {
      const r = customFn(value)
      if (r !== true) throw new Error(`[${field}] ${r || '校验失败'}`)
    }
  }
}

function checkType(value, type) {
  switch (type) {
    case 'string':  return typeof value === 'string'
    case 'number':  return typeof value === 'number' && !Number.isNaN(value)
    case 'boolean': return typeof value === 'boolean'
    case 'array':   return Array.isArray(value)
    case 'object':  return typeof value === 'object' && !Array.isArray(value)
    default:        return true
  }
}

/* ---------------- 路由注册 + 分发 ---------------- */

export const MOCK_ROUTES = {}

/**
 * 注册一个 mock 路由
 * @param {string} methodPath e.g. 'GET /employees/list'
 * @param {object} config
 * @param {object} config.params  query 参数校验规则
 * @param {object} config.body    body 校验规则
 * @param {function} config.handler 业务处理函数 ({ params, body }) => any
 */
export function registerRoute(methodPath, config) {
  MOCK_ROUTES[methodPath] = config
}

/**
 * 把带 :param 占位符的路由 pattern 编译成正则
 *  仅匹配 :name（字母/数字/下划线），不跨越 /
 * @returns {{ regex: RegExp, names: string[] } | null}
 */
function compilePattern(pattern) {
  const names = []
  const regexStr = pattern.replace(/:[a-zA-Z_][a-zA-Z0-9_]*/g, (m) => {
    names.push(m.slice(1))
    return '([^/]+)'
  })
  return { regex: new RegExp(`^${regexStr}$`), names }
}

/**
 * 在 MOCK_ROUTES 中按 method + path 查找匹配项
 *  1) 先做精确字符串匹配（静态路由走快路径）
 *  2) 失败则遍历含 :param 的路由，做正则匹配并抽取路径参数
 * @returns {{ config: object, pathParams: object } | null}
 */
function resolveRoute(method, path) {
  const upper = method.toUpperCase()
  const key = `${upper} ${path}`
  if (MOCK_ROUTES[key]) return { config: MOCK_ROUTES[key], pathParams: {} }

  for (const [routeKey, config] of Object.entries(MOCK_ROUTES)) {
    const idx = routeKey.indexOf(' ')
    if (idx < 0) continue
    const m = routeKey.slice(0, idx)
    const pattern = routeKey.slice(idx + 1)
    if (m !== upper || !pattern.includes(':')) continue
    const compiled = compilePattern(pattern)
    if (!compiled) continue
    const match = path.match(compiled.regex)
    if (!match) continue
    const pathParams = {}
    compiled.names.forEach((name, i) => {
      try { pathParams[name] = decodeURIComponent(match[i + 1]) }
      catch { pathParams[name] = match[i + 1] }
    })
    return { config, pathParams }
  }
  return null
}

/**
 * 分发一个 mock 请求
 * @returns Promise<{ code, message, data, ts }>
 */
export async function dispatch(method, path, payload = {}) {
  const key = `${method.toUpperCase()} ${path}`
  const resolved = resolveRoute(method, path)

  await delay()

  if (!resolved) {
    return fail(`mock 路由未注册: ${key}`, 404)
  }

  const { config, pathParams } = resolved
  try {
    // 路径参数（:id 等）合并到 params，使 handler / validate 都能直接读取
    const mergedParams = { ...(payload.params || {}), ...pathParams }
    validate(mergedParams, config.params)
    validate(payload.body, config.body)
    const result = await config.handler({ params: mergedParams, body: payload.body, pathParams })
    if (result && typeof result === 'object' && 'code' in result) return result
    return ok(result)
  } catch (e) {
    const msg = e?.message || 'mock 异常'
    // 校验错误按 400 返回，其他按 500
    const code = msg.startsWith('[') ? 400 : 500
    return fail(msg, code)
  }
}

export { MOCK, uid }

/* ============================================================
 * 市场商机分析员 · 对话流生成器
 *  ----------------------------------------------------------------
 *  仅在 chat.openChat(emp) 命中 id === 'market-radar-001' 时被调用
 *  4 步 process_card → 4 chart → 1 result_list → 1 markdown
 *  步骤状态通过 setTimeout 流式从 pending → running → done
 *  其他员工不调用本函数，零影响
 * ============================================================ */
let _mrId = 1
const _mrNewId = () => `mr-${Date.now().toString(36)}-${_mrId++}`
const _MR_TIMERS = new Set()
function _mrSchedule(fn, delay) {
  const id = setTimeout(() => {
    _MR_TIMERS.delete(id)
    fn()
  }, delay)
  _MR_TIMERS.add(id)
  return id
}
/** 清理所有挂起的流式任务（切换员工 / 关闭对话时调用） */
export function abortMarketRadarStream() {
  for (const id of _MR_TIMERS) clearTimeout(id)
  _MR_TIMERS.clear()
}

/* 4 步执行步骤模板（按实施计划 D.2 标准化执行） */
const MR_STEPS = [
  { icon: 'think',  text: '正在解析任务需求与意图…',      time: '0.4s' },
  { icon: 'read',   text: '正在检索数据源与知识库…',      time: '0.6s' },
  { icon: 'think',  text: '正在研判与价值评估…',          time: '0.5s' },
  { icon: 'verify', text: '正在生成结构化报告…',          time: '0.4s' },
]

/* 4 张图表（按实施计划 D.2：pie / bar / radar / bar） */
const MR_CHARTS = [
  {
    id: 'mr-chart-1',
    chartType: 'pie',
    title: '数据源信号构成',
    desc: '本次检索覆盖 4 类数据源 86 条信号。',
    data: [
      { name: '政府采购网', value: 38, color: '#8b5cf6' },
      { name: '企业招投标平台', value: 24, color: '#22d3ee' },
      { name: '行业资讯网站', value: 14, color: '#fbbf24' },
      { name: '企业内部知识库', value: 10, color: '#10b981' },
    ],
  },
  {
    id: 'mr-chart-2',
    chartType: 'bar',
    title: '区域标讯分布 Top 6',
    desc: '遥感 / 卫星地面应用标讯区域分布。',
    data: {
      categories: ['北京', '四川', '陕西', '广东', '湖北', '上海'],
      series: [{ name: '标讯数', data: [12, 9, 7, 6, 5, 4], color: '#06b6d4' }],
    },
  },
  {
    id: 'mr-chart-3',
    chartType: 'radar',
    title: '市场吸引力六维评估',
    desc: '从政策热度、招标频次、金额规模、竞争密度、技术门槛、付款条件 6 维度评分（满分 5）。',
    data: {
      indicators: [
        { name: '政策热度', max: 5 },
        { name: '招标频次', max: 5 },
        { name: '金额规模', max: 5 },
        { name: '竞争密度', max: 5 },
        { name: '技术门槛', max: 5 },
        { name: '付款条件', max: 5 },
      ],
      series: [
        {
          name: '当前机会',
          value: [4.6, 4.2, 4.4, 3.0, 4.5, 3.8],
          color: '#8b5cf6',
        },
        {
          name: '行业均值',
          value: [3.4, 3.2, 3.5, 3.8, 3.6, 3.4],
          color: '#22d3ee',
        },
      ],
    },
  },
  {
    id: 'mr-chart-4',
    chartType: 'bar',
    title: '项目金额区间分布',
    desc: '近 30 天遥感 / 卫星地面应用标讯金额分布。',
    data: {
      categories: ['< 100 万', '100-500 万', '500-1000 万', '1000-3000 万', '> 3000 万'],
      series: [{ name: '项目数', data: [22, 31, 18, 12, 3], color: '#f59e0b' }],
    },
  },
]

/* 检索结果列表（10 条） */
const MR_RESULTS = [
  { id: 'r1',  title: '2026 年遥感影像应急保障服务采购项目',         meta: '北京市应急管理局 · 已中标1次 · 2026-07-22', summary: '面向北京及周边地区的高分辨率遥感影像应急保障服务，预算 860 万，要求 6 小时内完成影像获取与处理交付。', tag: '高分遥感' },
  { id: 'r2',  title: '四川省自然资源厅 卫星遥感影像统筹采购项目',     meta: '四川省自然资源厅 · 公开招标 · 2026-07-21', summary: '覆盖四川省 21 个市州，年度卫星遥感影像采购，单价预算 1.2 亿，3 年期框架协议。', tag: '高分遥感' },
  { id: 'r3',  title: '陕西省生态环境厅 大气环境卫星遥感监测项目',     meta: '陕西省生态环境厅 · 公开招标 · 2026-07-20', summary: '基于高分系列卫星的 PM2.5、O3 等污染物遥感反演，预算 480 万，6 个月交付周期。', tag: '环境监测' },
  { id: 'r4',  title: '广东海事局 海洋卫星通信终端采购项目',          meta: '广东海事局 · 已中标1次 · 2026-07-19', summary: '面向南海海域的船载 VSAT 终端采购，含 5 年运维，预算 1860 万。', tag: '卫星通信' },
  { id: 'r5',  title: '湖北农业农村厅 高分专项农业监测服务',          meta: '湖北省农业农村厅 · 公开招标 · 2026-07-18', summary: '覆盖江汉平原、鄂东岗地主要农业区，提供季度农作物长势与灾情遥感监测。', tag: '农业监测' },
  { id: 'r6',  title: '上海市规划资源局 城市变化检测平台建设',        meta: '上海市规划资源局 · 公开招标 · 2026-07-17', summary: '基于多源卫星影像的城市级季度变化检测平台，含模型、平台、运维，预算 920 万。', tag: '城市治理' },
  { id: 'r7',  title: '中国地震局 第二代形变监测 InSAR 服务采购',      meta: '中国地震局 · 已中标1次 · 2026-07-15', summary: '全国 12 个重点断裂带 InSAR 时序形变监测，3 年期服务合同，预算 1450 万 / 年。', tag: '灾害监测' },
  { id: 'r8',  title: '某省林业局 森林防火卫星监测能力提升项目',      meta: '某省林业局 · 公开招标 · 2026-07-14', summary: '基于红外 / 高分融合的森林火点识别与蔓延预测平台，预算 660 万。', tag: '灾害监测' },
  { id: 'r9',  title: '生态环境部卫星环境应用中心 数据治理专项',      meta: '生态环境部 · 公开招标 · 2026-07-12', summary: '多源生态环境遥感数据治理与质量控制体系建设，预算 380 万。', tag: '环境监测' },
  { id: 'r10', title: '中国地质调查局 西部山区地质灾害遥感调查',      meta: '中国地质调查局 · 公开招标 · 2026-07-10', summary: '面向西部 7 省的高陡边坡 InSAR 隐患识别，预算 720 万，9 个月交付。', tag: '灾害监测' },
]

/* 市场多维度深度分析报告 + 投标策略制定报告（markdown blocks） */
const MR_MARKDOWN_BLOCKS = [
  /* ===== 引言 ===== */
  { kind: 'p', text: '好的，基于您提供的遥感卫星相关标讯检索结果，我将严格遵循技能框架，为您呈现专业、客观的市场分析与投标策略建议。' },

  /* ===== 市场多维度深度分析报告 ===== */
  { kind: 'h2', text: '市场多维度深度分析报告' },

  { kind: 'h3', text: '1. 检索结果整体概述' },
  { kind: 'p',  text: '本次检索共获取 <b>30 条</b>标讯，时间跨度为近一个月。所有标讯均为 <b>中相关</b>，未发现高相关或低相关条目，表明数据聚焦于遥感卫星应用领域，但缺乏直接涉及卫星制造、发射等核心环节的项目。数据来源为 <b>标讯汇聚库</b> 和 <b>阿里云招中标</b>，样本量中等，足以支撑对遥感应用市场的趋势判断，但需注意数据可能存在地域和时间上的偏差。' },

  /* ===== 2. 市场格局与需求画像 ===== */
  { kind: 'h3', text: '2. 市场格局与需求画像' },
  { kind: 'ul', items: [
    '<b>领域分布：</b>最活跃的细分赛道为 <b>遥感影像统筹与数据服务</b>，如贵州省的遥感影像统筹等项目。其次是 <b>生态环境遥感监测体系建设</b>（广东）和 <b>实景三维建设</b>（厦门），显示出从基础数据获取向行业深化应用转型的趋势。',
    '<b>采购主体画像：</b>采购单位以 <b>政府机关</b> 和 <b>事业单位</b> 为主，典型代表为 <b>贵州省自然资源厅</b>、<b>厦门市自然资源和规划局</b>，以及潜在的生态环境部门。这类采购主体预算稳定，项目周期长，对供应商的资质和过往业绩要求严格。',
    '<b>区域热力：</b>需求呈现 <b>多点分布</b> 特征。<b>贵州省</b> 因连续发布大额遥感影像统筹项目而成为当前最热区域，金额合计超 <b>3800 万元</b>。<b>广东省</b> 和 <b>福建省</b> 紧随其后，分别聚焦于生态环境监测和实景三维建设，体现了不同区域的差异化政策导向。',
    '<b>金额分层：</b>项目预算呈现 <b>两极分化</b> 态势。<b>大额标杆项目</b> 为贵州省遥感影像统筹项目，金额在 <b>1800-2000 万元</b> 区间。<b>主流区间</b> 集中在 <b>100-300 万元</b>，如厦门实景三维建设（195万）和湖北路网数据建设（225万）。<b>小额零散</b> 项目在本轮检查中表现不突出。',
  ] },

  /* ===== 3. 高价值商机识别 ===== */
  { kind: 'h3', text: '3. 高价值商机识别' },
  { kind: 'p', text: '基于现有数据，筛选出以下 3 个最具代表性的商机进行深度分析：' },
  { kind: 'ul', items: [
    '<b>广东省生态环境遥感监测体系建设（合成孔径雷达和热红外技术建设）</b>：核心需求是建设先进的SAR和热红外遥感监测能力，技术门槛高。采购单位未明确，预算和截止时间待查，但项目本身代表前沿技术方向，与本方在雷达遥感领域的技术能力高度匹配，是树立行业标杆的绝佳机会。',
    '<b>厦门市2026年地形级实景三维建设</b>：核心需求是获取0.1米分辨率航空遥感影像，预算 <b>195万元</b>。采购单位为厦门市自然资源和规划局，截止时间需立即查询。该项目金额适中，技术要求明确，是进入福建市场的理想切入点，竞争窗口预计在一个月内。',
    '<b>贵州省遥感影像统筹（2026年度）项目</b>：虽然已公布中标结果，但其 <b>1967万</b>和 <b>1842万</b> 的体量揭示了省级自然资源部门对遥感数据的持续、大规模采购需求。应将其视为 <b>标杆案例</b>，研究其技术要求和评标标准，为后续跟进其他省份同类项目做准备。',
  ] },

  /* ===== 4. 共性特征与趋势洞察 ===== */
  { kind: 'h3', text: '4. 共性特征与趋势洞察' },
  { kind: 'ul', items: [
    '<b>需求共性：</b>采购内容高度集中于 <b>高分辨率航空/卫星遥感影像</b>、<b>实景三维数据</b> 和 <b>特定遥感监测能力</b>（如SAR、热红外）。技术要求强调数据精度、覆盖范围和处理效率，服务模式趋向于"数据+平台+应用"的一体化解决方案。',
    '<b>政策与技术趋势：</b>项目普遍体现 <b>实景三维中国</b>、<b>数字政府</b> 和 <b>生态文明建设</b> 等国家战略导向。技术上，<b>国产化</b> 要求日益凸显，合成孔径雷达（SAR）等新型遥感技术正从科研走向业务化应用。',
    '<b>时间规律：</b>检索结果显示，年中是遥感类项目集中发布和开标的时期，可能与财政年度预算批复和执行周期相关。<b>6月至8月</b> 是关键的投标窗口期。',
  ] },

  /* ===== 5. 风险与壁垒分析 ===== */
  { kind: 'h3', text: '5. 风险与壁垒分析' },
  { kind: 'ul', items: [
    '<b>资质门槛：</b>项目普遍要求具备 <b>测绘资质（甲级为佳）</b>、<b>ISO 质量体系认证</b>，部分涉及涉密项目还需 <b>保密资质</b>。实景三维等项目对过往 <b>同类项目业绩</b> 有严格要求。',
    '<b>竞争强度：</b>从贵州项目中标结果看，<b>飞燕航空遥感技术有限公司</b> 等头部企业竞争力强劲，市场集中度较高。低价竞争风险存在，但技术方案和综合实力的权重更高。',
    '<b>履约风险：</b>项目 <b>交付周期长</b>（通常跨年），<b>验收标准严格</b>（如影像分辨率、覆盖完整性），且项目地点可能分散，对供应商的项目管理和区域服务能力构成挑战。',
    '<b>合规风险：</b>需警惕招标文件中可能存在的 <b>技术参数倾向性</b> 或 <b>业绩要求排他性</b>，这可能是潜在质疑投诉点。',
  ] },

  /* ===== 6. 关键数据速览 ===== */
  { kind: 'h3', text: '6. 关键数据速览' },
  { kind: 'table', headers: ['核心指标', '数据'], rows: [
    ['<b>数据总量</b>',         '30 条'],
    ['<b>活跃领域 Top3</b>',   '遥感影像统筹、生态环境遥感监测、实景三维建设'],
    ['<b>活跃区域 Top3</b>',   '贵州、广东、福建'],
    ['<b>主流金额区间</b>',     '100 - 2000 万元'],
    ['<b>紧急截止项目数</b>',   '1 个（厦门实景三维，需立即确认截止日期）'],
  ] },

  /* ===== 7. 明确行动建议 ===== */
  { kind: 'h3', text: '7. 明确行动建议' },
  { kind: 'ul', items: [
    '<b>优先级排序：</b><b>立即跟进</b> 厦门市实景三维建设项目，确认截止时间并启动投标流程。<b>重点观察</b> 广东省生态环境遥感监测项目，一旦发布完整招标文件，立即投入资源。<b>保持关注</b> 其他省份的遥感影像统筹项目，将贵州项目作为模板进行策略储备。',
    '<b>关键下一步：</b><b>下载并研读</b> 厦门项目的招标文件，分析评分标准。<b>主动联系</b> 广东省项目的潜在采购单位（如广东省生态环境厅），提前了解需求。<b>内部评估</b> 现有资质（测绘、保密、ISO等）与项目要求的匹配度，启动缺失资质的补办或升级流程。',
  ] },

  /* ===== 投标策略制定报告 ===== */
  { kind: 'h2', text: '投标策略制定报告' },

  { kind: 'h3', text: '1. 投标定位' },
  { kind: 'ul', items: [
    '<b>主攻赛道：</b>建议主攻 <b>政府级遥感影像统筹与实景三维建设</b> 项目，这类项目金额大、示范效应强，是公司收入和品牌的核心来源。<b>执行要点：</b>组建专门团队，深度研究贵州、福建等省份的招标模式。<b>预期效果：</b>拿下1-2个省级标杆项目，奠定市场地位。',
    '<b>辅攻赛道：</b>辅攻 <b>生态环境遥感监测</b> 等垂直行业应用项目，这类项目技术门槛高，利润空间大。<b>执行要点：</b>与生态环境领域的科研院所或系统集成商建立合作。<b>预期效果：</b>形成行业解决方案，开辟新增长点。',
    '<b>目标客户分层：</b><b>核心客户</b> 为各省自然资源厅和市级自然资源与规划局。<b>机会客户</b> 为生态环境、应急管理、农业农村等部门。<b>观察客户</b> 为大型能源、基建类国企。',
  ] },

  { kind: 'h3', text: '2. 差异化竞争策略' },
  { kind: 'ul', items: [
    '<b>技术差异化：</b>突出在 <b>SAR</b>、<b>热红外</b> 等新型遥感数据处理方面的技术优势，以及在 <b>实景三维自动化建模</b> 方面的效率优势。<b>执行要点：</b>在技术方案中嵌入成功案例，展示自主知识产权的算法和软件。<b>预期效果：</b>在技术评分上拉开与竞争对手的差距。',
    '<b>商务差异化：</b>提供 <b>灵活的付款条件</b>（如按数据交付节点付款）和 <b>更短的交付周期承诺</b>。<b>执行要点：</b>优化内部生产流程，制定有竞争力的报价策略（基准价或合理下浮）。<b>预期效果：</b>提升客户满意度和中标概率。',
    '<b>资质差异化：</b>若缺少 <b>甲级测绘资质</b> 或 <b>涉密信息系统集成资质</b>，需立即启动申请或寻找具备该资质的联合体伙伴。<b>执行要点：</b>列出资质补办清单和时间表，优先解决核心项目门槛。<b>预期效果：</b>消除投标资格障碍，拓宽可参与项目范围。',
  ] },

  { kind: 'h3', text: '3. 联合体与生态策略' },
  { kind: 'ul', items: [
    '<b>联合体策略：</b>在 <b>广东生态环境监测项目</b> 等涉及多学科交叉的项目中，建议联合 <b>本地系统集成商</b> 或 <b>生态环境研究机构</b>。<b>执行要点：</b>选择在广东本地有深厚客户关系和项目实施经验的伙伴，明确分工和利益分配。<b>预期效果：</b>弥补本地服务短板，提升方案完整性和中标率。',
    '<b>潜在合作伙伴：</b>优先选择 <b>具有CMMI认证的系统集成商</b> 或 <b>省级环境监测中心下属企业</b>。<b>执行要点：</b>建立合作伙伴评估标准，提前签署合作意向书。<b>预期效果：</b>形成稳定的生态圈，共同开拓市场。',
  ] },

  { kind: 'h3', text: '4. 时间与资源排期' },
  { kind: 'ul', items: [
    '<b>近期（1周内）：</b>全力跟进 <b>厦门实景三维项目</b>，完成标书购买、现场踏勘和答疑。<b>执行要点：</b>投入2名资深售前和1名商务人员。<b>预期效果：</b>确保按时、高质量递交投标文件。',
    '<b>中期（1个月内）：</b>重点准备 <b>广东省生态环境遥感监测项目</b>，提前组建项目团队，完成技术方案初稿。<b>执行要点：</b>投入3-5人的核心团队，进行技术预研和案例包装。<b>预期效果：</b>在项目正式挂网后，能在一周内完成高质量标书。',
    '<b>远期（1-3个月）：</b>持续监控 <b>其他省份的遥感影像统筹</b> 招标预告，建立客户关系。<b>执行要点：</b>安排市场人员定期拜访目标客户，收集情报。<b>预期效果：</b>建立3-5个潜在项目的销售管道。',
  ] },

  { kind: 'h3', text: '5. 风险规避与质疑准备' },
  { kind: 'ul', items: [
    '<b>常见废标点规避：</b>严格检查 <b>投标文件密封</b>、<b>签字盖章</b>、<b>授权委托书</b> 等细节。<b>执行要点：</b>建立标书交叉审核机制，使用投标文件检查清单。<b>预期效果：</b>将因低级错误废标的概率降至零。',
    '<b>质疑/投诉策略：</b>若发现招标文件存在 <b>明显倾向性参数</b>（如指定特定型号传感器）或 <b>不合理的业绩要求</b>，应在投标截止前5个工作日提出书面质疑。<b>执行要点：</b>收集市场主流产品参数作为证据，联合其他潜在供应商共同质疑。<b>预期效果：</b>修正不合理条款，创造公平竞争环境。',
    '<b>竞争对手应对：</b>警惕竞争对手可能采取的 <b>低价阻击</b> 或 <b>技术方案抄袭</b>。<b>执行要点：</b>在技术方案中设置核心算法或流程的"技术壁垒"，不公开全部细节；商务报价上采用"合理低价+增值服务"的组合策略。<b>预期效果：</b>降低被简单模仿和价格战冲击的风险。',
  ] },

  { kind: 'h3', text: '6. 标书撰写要点' },
  { kind: 'ul', items: [
    '<b>评分标准预判：</b>根据过往项目经验，预判评分重点为 <b>技术方案（40-50%）</b>、<b>项目业绩（20-30%）</b>、<b>价格（10-20%）</b>。<b>执行要点：</b>将80%的精力投入技术方案编写，确保方案深度和针对性。<b>预期效果：</b>在关键得分项上获得高分。',
    '<b>技术方案包装：</b>重点包装 <b>技术路线先进性</b>、<b>项目实施保障体系</b> 和 <b>售后服务响应能力</b>。<b>执行要点：</b>使用图表、流程图和案例数据直观展示方案优势，设立本地化服务团队。<b>预期效果：</b>让评标专家直观感受到方案的可靠性和先进性。',
    '<b>报价策略设计：</b>采用 <b>分项报价</b> 方式，将数据获取、处理、平台建设等费用清晰列出。<b>执行要点：</b>在保证合理利润的前提下，对核心数据获取环节采取微利策略，对增值服务（如培训、运维）设定较高利润。<b>预期效果：</b>在总价上形成竞争力，同时保障项目整体盈利。',
  ] },
]

/**
 * 构建市场商机分析员对话流（4 步 + 4 chart + 1 result_list + 1 markdown）
 *  - 该函数返回的消息流不直接包含可运行动画，需要 chat.js 把它挂到 store 后
 *    调用 scheduleMarketRadarStream(messages) 启动步骤状态切换
 *  - 所有消息使用稳定的 id，刷新后保持一致
 *  - 任何字段缺失都不会破坏其他员工
 */
export function buildMarketRadarMessages(query = '') {
  const now = new Date()
  const t = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  const queryText = String(query || '').trim() || '请帮我找近期遥感 / 卫星地面应用相关的招标商机，时间范围：近一个月'

  return [
    /* ============ 用户消息 ============ */
    { id: _mrNewId(), who: 'user', text: queryText, t },

    /* ============ 4 步 process_card（pending → done 流式）============ */
    {
      id: _mrNewId(),
      who: 'process_card',
      title: '数字员工执行中',
      progress: '0/4',
      steps: MR_STEPS.map((s, i) => ({
        id: `mr-step-${i + 1}`,
        icon: s.icon,
        text: s.text,
        time: '-',
        status: 'pending',
      })),
      t,
    },

    /* ============ 4 张图表（按 D.2 顺序）============ */
    ...MR_CHARTS.map((c) => ({
      id: _mrNewId(),
      who: 'chart',
      chartType: c.chartType,
      title: c.title,
      desc: c.desc,
      data: c.data,
      t,
    })),

    /* ============ 检索结果列表 ============ */
    {
      id: _mrNewId(),
      who: 'result_list',
      title: '高匹配商机 · 前 10 条',
      total: 86,
      highCount: 32,
      midCount: 41,
      items: MR_RESULTS,
      t,
    },

    /* ============ 7 章节深度分析报告（含下载 actions）============ */
    {
      id: _mrNewId(),
      who: 'markdown',
      title: '深度分析报告',
      blocks: MR_MARKDOWN_BLOCKS,
      actions: ['like', 'dislike', 'regenerate'],
      /* 扩展字段：供 DownloadBar 渲染（不污染其他员工） */
      downloadActions: [
        { type: 'word',  label: '下载 Word' },
        { type: 'excel', label: '下载 Excel' },
      ],
      t,
    },
  ]
}

/**
 * 启动 4 步 process_card 的流式状态切换
 *  - 每 200ms 推进一步：pending → running → done
 *  - 全部完成后自动更新 progress 文本
 *  - 该函数依赖外部传入最新的 messages 数组（避免闭包旧值）
 *  - 切换员工 / 关闭对话前请调用 abortMarketRadarStream() 清理
 */
export function scheduleMarketRadarStream(chatStore, processCardId) {
  if (!chatStore || !processCardId) return
  const message = chatStore.messages.find((m) => m.id === processCardId)
  if (!message || message.who !== 'process_card') return

  const stepCount = message.steps.length
  message.steps.forEach((s) => { s.status = 'pending' })
  message.progress = `0/${stepCount}`

  let i = 0
  const runOne = () => {
    if (i >= stepCount) {
      message.progress = `${stepCount}/${stepCount}`
      return
    }
    const step = message.steps[i]
    step.status = 'running'
    _mrSchedule(() => {
      step.status = 'done'
      message.progress = `${i + 1}/${stepCount}`
      i += 1
      _mrSchedule(runOne, 200)
    }, 220)
  }
  _mrSchedule(runOne, 200)
}
