
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

/* 7 章节深度分析报告（markdown blocks） */
const MR_MARKDOWN_BLOCKS = [
  { kind: 'h2', text: '1. 检索结果概述' },
  { kind: 'p',  text: '本次共采集 <b>86 条</b>有效商机信号，覆盖 <b>政府采购网</b>、<b>企业招投标平台</b>、<b>行业资讯网站</b>、<b>企业内部知识库</b> 4 类数据源；筛除已过期 / 重复 / 不相关信号后，<b>保留 10 条</b>高匹配度商机（详见上方结果列表）。检索策略与命中规则详见《招投标操作指引》[1] 与《应答模板 2026》[2]。' },
  { kind: 'h2', text: '2. 市场格局' },
  { kind: 'p',  text: '从招标主体看，<b>政府部门及事业单位</b>占比 68%，<b>央国企</b>占比 22%，<b>民营 / 第三方</b>占比 10%。从地域看，<b>北京 / 四川 / 陕西</b>位列三甲，三地合计占 32%。竞品格局与历史中标份额见《竞品分析》[3]。' },
  { kind: 'h2', text: '3. 高价值商机' },
  { kind: 'p',  text: '建议重点跟进以下 3 条（按综合价值评分排序）：' },
  { kind: 'ol', items: [
    '<b>四川省自然资源厅 卫星遥感影像统筹采购</b>（¥1.2 亿 / 3 年 · 政府背景 · 现金流稳定）',
    '<b>广东海事局 海洋卫星通信终端采购</b>（¥1860 万 · 海洋场景门槛高 · 毛利率高）',
    '<b>中国地震局 第二代形变监测 InSAR 服务</b>（¥1450 万 / 年 · 长期合作 · 续约率 > 85%）',
  ] },
  { kind: 'p',  text: '打分依据见《客户案例：某省自然资源厅 3 年合作复盘》[4]；资质与产品力评估见《高分专项甲级资质材料清单》[5] 与《InSAR 形变监测产品白皮书》[6]。' },
  { kind: 'h2', text: '4. 时间窗口' },
  { kind: 'p',  text: '近 30 天新增商机 18 条，下一波投标高峰期预计在 <b>8 月 15 日 - 9 月 10 日</b>（与财政预算执行周期吻合）。建议在 <b>8 月 5 日前</b>完成重点项目的标书框架与现场踏勘。' },
  { kind: 'h2', text: '5. 风险与壁垒' },
  { kind: 'p',  text: '主要风险：① <b>高分专项资质</b>门槛（部分项目要求甲级测绘资质）；② <b>数据保密</b>审查趋严；③ <b>地方性条款</b>差异大。政策合规性核对建议参考《2026 卫星互联网行业政策汇编》[7]。' },
  { kind: 'h2', text: '6. 关键数据' },
  { kind: 'p',  text: '本次检索总标讯金额 <b>¥3.86 亿</b>，平均单笔 <b>¥449 万</b>，中位数 <b>¥280 万</b>，P75 为 <b>¥720 万</b>。高分遥感类标讯平均金额比行业整体高 <b>23%</b>。报价区间速查请见《商务标报价区间速查表 2026》[8]。' },
  { kind: 'h2', text: '7. 行动建议' },
  { kind: 'ol', items: [
    '<b>本周内</b>：完成高分专项甲级资质材料的版本对齐与现场核查清单',
    '<b>2 周内</b>：组织四川、广东两个重点项目的现场踏勘与客户走访',
    '<b>4 周内</b>：完成 3 份标书技术方案初稿 + 内部评审',
    '<b>持续</b>：在工具箱 - 消息推送 中配置「标讯 / 政策」实时订阅，避免遗漏后续商机',
  ] },
  /* ============ 参考资料小节（C.7 · 自动列出已绑定条目）============ */
  { kind: 'h2', text: '参考资料' },
  { kind: 'p',  text: '本报告综合引用了以下内部资料，编号 [n] 与上标对应：' },
  { kind: 'ol', items: [
    '《卫星互联网招投标操作指引 v2.1》— 运控中心 · SOP 库',
    '《政府遥感采购项目应答模板 2026》— 运控中心 · SOP 库',
    '《竞品分析：航天科技 / 中电科 / 长光卫星》— 战略部 · 竞品库',
    '《客户案例：某省自然资源厅 3 年合作复盘》— 市场部 · 案例库',
    '《高分专项甲级资质材料清单》— 市场部 · 资质库',
    '《InSAR 形变监测产品白皮书》— 技术中心 · 产品库',
    '《2026 卫星互联网行业政策汇编》— 战略部 · 政策库',
    '《商务标报价区间速查表 2026》— 市场部 · 报价库',
  ] },
  { kind: 'p',  text: '<i>本报告基于内部知识库（已绑定 3 篇）与公开数据综合研判，仅供内部决策参考。点击上方 [n] 上标可查看资料详情。</i>' },
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

    /* stub 依赖 */
    const MOCK = { employees: [] }
    const sleep = () => Promise.resolve()
    const rand = () => 0
    const uid = (p) => p + '-' + Math.random().toString(36).slice(2, 8)
    module.exports = { buildMarketRadarMessages, scheduleMarketRadarStream, abortMarketRadarStream, MR_STEPS: (() => { try { return eval('MR_STEPS') } catch { return [] } })(), DEFAULT_LATENCY, JITTER }
  