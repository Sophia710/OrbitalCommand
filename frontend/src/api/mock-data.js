/**
 * OrbitalCommand · 共享 Mock 数据池
 * 全部数据在此集中维护，业务接口只读 + 必要的内存变更
 */

const D = (n) => String(n).padStart(2, '0')
const NOW = Date.now()
const MIN = 60 * 1000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

/* ============ 导航 ============ */
// 与 prototype copy 的 static index.html 一致：
//   主导航 = 工作台 / 数字员工(展开含 员工广场/我的员工/创建员工) / 智能中心(展开含 技能/知识库) / 任务监控
//   管理导航 = 审核中心 / 审计日志
//   注:原"指挥中心"已合并到"工作台"根路径,直接渲染原 Dashboard 页面内容
//   注:"系统设置"入口已从侧边栏移除(避免与顶部用户菜单重复);
//        仍可通过 /settings 路由访问,详见 router/index.js 与 TopBar 用户下拉菜单
//   注:"智能体"模块已整体移除(2026-06 全量下线),侧边栏"智能中心"分组现仅含 技能 / 知识库
//   注:"专栏订阅"已下线(2026-07 全量下线),"知识库"由原"个人知识库"承接,直接挂在"智能中心"下
const NAV = [
  { id: 'workbench',     label: '工作台',     icon: 'Odometer',       desc: '总览与监控',          count: null, group: 'main' },
  {
    id: 'employees',
    label: '数字员工',
    icon: 'Group',
    desc: '员工广场 / 我的员工 / 创建员工',
    count: null,
    group: 'main',
    children: [
      { id: 'plaza',        label: '员工广场', icon: 'UserFilled', desc: '发现与订阅数字员工', count: 10 },
      { id: 'my-employees', label: '我的员工', icon: 'Star',       desc: '管理我创建/订阅的',  count: 5 },
      { id: 'create',       label: '创建员工', icon: 'MagicStick', desc: '零代码自定义',       count: null },
    ],
  },
  {
    id: 'smart-center',
    label: '智能中心',
    icon: 'Sparkles',
    desc: '技能 / 知识库',
    count: null,
    group: 'main',
    children: [
      { id: 'skills',    label: '技能',   icon: 'MagicStick',  desc: '管理可复用技能',      count: 24 },
      { id: 'knowledge', label: '知识库', icon: 'Folder',      desc: '个人知识库 · 文档管理', count: 18 },
    ],
  },
  { id: 'tasks',         label: '任务监控',   icon: 'Connection',     desc: '全链路任务追踪',      count: 5,    live: true, group: 'main' },
  { id: 'review',        label: '审核中心',   icon: 'Stamp',          desc: '员工上架审核',        count: 1,    group: 'aux' },
  { id: 'audit',         label: '审计日志',   icon: 'Document',       desc: '操作与合规审计',      count: null, group: 'aux' },
]

/* ============ 用户 ============ */
const USER = {
  id: 'u_001',
  name: '星小智',
  role: 'admin',
  title: '系统管理员',
  team: '运控中心 · 高级工程师',
  avatar: '🛰️',
}

/* ============ 工作台 ============ */
const KPIS = [
  { key: 'sats',     label: '在轨卫星',     value: 138,  unit: '颗',  trend: 2.3,  up: true,  series: [128,130,131,132,134,135,136,137,138,138,138,138], desc: '本周新增 3 颗备份星' },
  { key: 'terminal', label: '在线用户终端', value: 2164, unit: '台',  trend: 12.6, up: true,  series: [1850,1900,1940,1980,2010,2040,2080,2100,2120,2135,2150,2164], desc: '日活 89% · 健康度 96%' },
  { key: 'tasks',    label: '今日完成任务', value: 1248, unit: '次',  trend: 8.4,  up: true,  series: [980,1050,1100,1120,1130,1180,1200,1210,1220,1235,1244,1248], desc: '平均耗时 4.2 分钟' },
  { key: 'alarms',   label: '待处理告警',   value: 17,   unit: '条',  trend: -23,  up: false, series: [38,35,33,30,28,26,25,22,20,19,18,17], desc: '高危 2 · 中危 8 · 低危 7' },
]

const ALARMS = [
  { id: 'a1', ts: '14:22:18', sev: 'high', title: '信关站 GW-03 北向接口丢包率 > 5%', target: '信关站 GW-03 · 北向接口', time: '14:22:18' },
  { id: 'a2', ts: '14:18:02', sev: 'mid',  title: '波束 B-12 用户接入时延持续偏高',   target: '载荷 L2 · 波束 B-12',     time: '14:18:02' },
  { id: 'a3', ts: '14:11:47', sev: 'mid',  title: '测控站 TC-02 上下行功率告警',     target: 'TTC · 测控站 TC-02',      time: '14:11:47' },
  { id: 'a4', ts: '14:05:23', sev: 'low',  title: '用户终端 SN-90213 启动时间偏长',  target: '终端 SN-90213',            time: '14:05:23' },
  { id: 'a5', ts: '13:58:11', sev: 'low',  title: '载荷 A1 温度传感器数据漂移',     target: '载荷 L1 · 温度传感',       time: '13:58:11' },
]

const TASKS = [
  // 字段: id / title / agent(执行人 → 数字员工名占位,旧版为智能体) / progress / status / time
  { id: 'T-2026-0617-01', title: '信关站链路异常诊断',     agent: '链路诊断员',     progress: 78,  status: 'run',  time: '00:42' },
  { id: 'T-2026-0617-02', title: 'Ka 频段用户终端干扰分析', agent: '全链路编排员',   progress: 100, status: 'done', time: '02:14' },
  { id: 'T-2026-0617-03', title: '载荷健康度周报生成',     agent: '全链路编排员',   progress: 100, status: 'done', time: '01:36' },
  { id: 'T-2026-0617-04', title: 'TTC 测控计划自动编排',   agent: '全链路编排员',   progress: 45,  status: 'run',  time: '01:08' },
  { id: 'T-2026-0617-05', title: '测控站天线校准参数核查', agent: '链路诊断员',     progress: 12,  status: 'run',  time: '00:24' },
  { id: 'T-2026-0617-06', title: '星上软件在轨升级策略评估', agent: '载荷分析员',   progress: 0,   status: 'wait', time: '等待资源' },
  { id: 'T-2026-0617-07', title: '用户终端 OTA 灰度发布', agent: '终端管理助理',   progress: 100, status: 'fail', time: '回滚' },
]

const TRAFFIC_HOURS = Array.from({ length: 24 }, (_, i) => `${D(i)}:00`)
const LINES = [
  { name: '上行流量', data: Array.from({length:24}, (_,i) => Math.round(45 + Math.sin(i*0.6)*16 + Math.random()*8)), color: '#8b5cf6' },
  { name: '下行流量', data: Array.from({length:24}, (_,i) => Math.round(60 + Math.sin(i*0.6)*20 + Math.random()*12 + (i>=18&&i<=22?18:0))), color: '#22d3ee' },
  { name: '测控流量', data: Array.from({length:24}, (_,i) => Math.round(10 + Math.random()*4)), color: '#fbbf24' },
]
const BEAM_LOAD = Array.from({ length: 16 }, (_, i) => Math.round(40 + Math.random() * 55))
const BEAM_LABELS = Array.from({ length: 16 }, (_, i) => `B${D(i + 1)}`)

const SAT_HEALTH = Array.from({ length: 64 }, (_, i) => {
  const r = Math.random()
  if (r < 0.78) return { name: `S${D(i + 1).padStart(3, '0')}`, state: 'ok' }
  if (r < 0.92) return { name: `S${D(i + 1).padStart(3, '0')}`, state: 'warn' }
  if (r < 0.97) return { name: `S${D(i + 1).padStart(3, '0')}`, state: 'danger' }
  return { name: `S${D(i + 1).padStart(3, '0')}`, state: 'off' }
})

const COVERAGE = Array.from({ length: 24 * 7 }, (_, i) => {
  const h = i % 24, d = Math.floor(i / 24)
  const v = Math.max(20, 80 - Math.abs(13 - h) * 4 + (d === 0 ? -18 : d === 6 ? 14 : 0) + Math.random() * 12)
  return Math.round(v)
})
const REGIONS = ['北京', '上海', '广州', '成都', '西安', '武汉', '沈阳', '昆明']
const COVERAGE_DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

/* ============ 员工 ============ */
const SKILLS = ['链路诊断', '干扰分析', 'OTA 升级', '遥测解析', '故障定位', '报告生成', '参数调优', '数据回放', '频谱分析', '网管告警', '测控编排', '终端验证', '标准比对']

/* ============================================================
 * 员工二级分类 · 员工卡数据模型
 * ------------------------------------------------------------
 *  kind: 'super'         超级员工（S 级 · 旗舰综合能力体）
 *  kind: 'professional'  专业员工（A 级 · 场景专家）
 *  tier:    序号，仅作展示排序用
 *  series:  超级员工专属字段，标识其 4 大固定类别之一
 * ============================================================ */
const SUPER_SERIES = [
  { key: 'terminal',   label: '用户终端智能化测试' },
  { key: 'satnet',     label: '星地网络智能化测试' },
  { key: 'payload',    label: '卫星载荷智能化测试' },
  { key: 'fullchain',  label: '全链路智能化验收与运维测试' },
]

const EMPLOYEES = [
  /* ============ 超级员工 · S 级（4 个固定类别）============ */
  { id: 'emp_s01', kind: 'super', tier: 1, series: 'terminal',  domain: '终端',     name: '用户终端智能测试官', avatar: '#6366f1', accent: '#a5b4fc', tags: ['终端验证', 'OTA 升级', '标准比对', '回归基线'], description: '面向 CPE、模组、终端芯片的全生命周期智能化测试，统一功能 / 性能 / 一致性 / OTA 四大维度的脚本生成、缺陷回放与回归闭环。', skills: ['终端验证', 'OTA 升级', '标准比对'], publisher: 'AEROS · 旗舰', status: 'published', version: '5.0.0', usage: 28134, rating: 5.0, reviews: 482, createdAt: NOW - 120*DAY },
  { id: 'emp_s02', kind: 'super', tier: 2, series: 'satnet',    domain: '星地链路', name: '星地网络智能测试官', avatar: '#0ea5e9', accent: '#7dd3fc', tags: ['链路诊断', '故障定位', '数据回放', '干扰分析'], description: '覆盖协议一致性、性能基准、故障注入与回放、干扰源定位，端到端输出星地网络健康度评分与处置建议。',         skills: ['链路诊断', '故障定位', '数据回放'], publisher: 'AEROS · 旗舰', status: 'published', version: '5.0.0', usage: 24819, rating: 4.9, reviews: 411, createdAt: NOW - 110*DAY },
  { id: 'emp_s03', kind: 'super', tier: 3, series: 'payload',   domain: '载荷',     name: '卫星载荷智能测试官', avatar: '#14b8a6', accent: '#5eead4', tags: ['遥测解析', '参数调优', '频谱分析', 'EIRP 标定'], description: 'EIRP / G/T 标定、波束跳变、接口验证、异常诊断一体化执行，载荷级高风险操作具备自动审批与回滚能力。',           skills: ['遥测解析', '参数调优', '频谱分析'], publisher: 'AEROS · 旗舰', status: 'published', version: '5.0.0', usage: 19283, rating: 4.9, reviews: 326, createdAt: NOW - 100*DAY },
  { id: 'emp_s04', kind: 'super', tier: 4, series: 'fullchain', domain: '全链路',   name: '全链路智能验收官',   avatar: '#8b5cf6', accent: '#c4b5fd', tags: ['跨域编排', '验收剧本', '根因分析', '运维自动化'], description: '编排跨域测试 / 跨域数据关联 / 根因分析 / 运维剧本自动执行，端到端验收与 7×24 智能运维一体化。',                   skills: ['测控编排', '故障定位', '报告生成'], publisher: 'AEROS · 旗舰', status: 'published', version: '5.0.0', usage: 32410, rating: 5.0, reviews: 587, createdAt: NOW - 130*DAY },

  /* ============ 专业员工 · A 级（场景专家）============ */
  { id: 'emp_001', kind: 'professional', domain: '终端',     name: '终端验证员', avatar: '#8b5cf6', accent: '#d946ef', tags: ['OTA 升级', '终端验证', '标准比对'], description: '面向 CPE、模组、终端芯片的智能化测试，覆盖功能/性能/一致性/OTA 全流程。', skills: ['链路诊断', 'OTA 升级', '终端验证'], publisher: 'AEROS', status: 'published', version: '2.4.1', usage: 12480, rating: 4.9, reviews: 218, createdAt: NOW - 30*DAY },
  { id: 'emp_002', kind: 'professional', domain: '星地链路', name: '链路诊断员',  avatar: '#06b6d4', accent: '#22d3ee', tags: ['链路诊断', '故障定位', '数据回放'], description: '执行协议一致性、性能基准、故障注入与回放，输出网络健康度评分。',       skills: ['链路诊断', '故障定位', '数据回放'], publisher: 'AEROS', status: 'published', version: '3.0.2', usage: 8972,  rating: 4.8, reviews: 174, createdAt: NOW - 25*DAY },
  { id: 'emp_003', kind: 'professional', domain: '载荷',     name: '载荷分析员', avatar: '#10b981', accent: '#a3e635', tags: ['遥测解析', '参数调优', '频谱分析'], description: 'EIRP / G/T、波束跳变、接口验证、异常诊断；高风险操作需人工审批。',           skills: ['遥测解析', '参数调优'], publisher: 'AEROS', status: 'published', version: '1.8.0', usage: 5621,  rating: 4.7, reviews: 96,  createdAt: NOW - 20*DAY },
  { id: 'emp_004', kind: 'professional', domain: '全链路',   name: '全链路编排员',     avatar: '#f59e0b', accent: '#fde047', tags: ['测控编排', '故障定位', '报告生成'], description: '编排跨域测试、跨域数据关联、根因分析、运维剧本自动执行。',                       skills: ['测控编排', '故障定位'], publisher: 'AEROS', status: 'published', version: '4.2.0', usage: 15320, rating: 5.0, reviews: 312, createdAt: NOW - 60*DAY },
  { id: 'emp_009', kind: 'professional', domain: '星地链路', name: '干扰分析员',   avatar: '#d946ef', accent: '#f0abfc', tags: ['干扰分析', '频谱分析'],         description: '频谱监测、干扰源定位、信号质量评估，输出干扰处理建议。',                         skills: ['频谱分析', '干扰分析'], publisher: '运控中心',     status: 'rejected', version: '0.3.0', usage: 0,     rating: 0,   reviews: 0,   createdAt: NOW - 1*DAY },
  { id: 'emp_011', kind: 'professional', domain: '终端',     name: '终端管理助理',             avatar: '#fbbf24', accent: '#fde047', tags: ['OTA 升级', '终端验证'],         description: '终端批量管理、灰度发布、配置下发、健康监控。',                                   skills: ['OTA 升级', '终端验证'], publisher: '运控中心', status: 'published', version: '2.0.0', usage: 6210, rating: 4.8, reviews: 92, createdAt: NOW - 12*DAY },
]

const MY_EMPLOYEES = EMPLOYEES.slice(0, 5).map((e) => ({ ...e, hiredAt: NOW - 2 * DAY, source: 'subscribed' }))

/* ============================================================
 * 我的员工草稿 / 自创建员工
 * ------------------------------------------------------------
 *  status: 'draft'      仅保存,未提交发布
 *          'pending'    已提交审核
 *          'published'  已激活(发布成功)
 *          'rejected'   审核被驳回
 *  activated: boolean   是否对外可被订阅/使用
 * ============================================================ */
const MY_DRAFTS = [
  { id: 'draft_001', kind: 'professional', domain: '星地链路', name: '链路健康巡检员', avatar: '#06b6d4', accent: '#22d3ee', tags: ['链路诊断', '信关站', '巡检'], description: '面向信关站链路的自动巡检与异常识别,覆盖指标采集、根因定位、处置建议生成。', skills: ['链路诊断', '故障定位', '数据回放'], version: '0.1.0', status: 'draft', activated: false, createdAt: NOW - 2*HOUR, updatedAt: NOW - 18*MIN, publisher: '当前用户', source: 'mine' },
  { id: 'draft_002', kind: 'professional', domain: '载荷',     name: '遥测智能解析员', avatar: '#10b981', accent: '#a3e635', tags: ['遥测解析', '参数调优'], description: '基于历史遥测大数据的载荷参数自动调优与异常预警。', skills: ['遥测解析', '参数调优', '频谱分析'], version: '0.2.1', status: 'pending', activated: false, createdAt: NOW - 2*DAY,  updatedAt: NOW - 4*HOUR, publisher: '当前用户', source: 'mine' },
  { id: 'draft_003', kind: 'professional', domain: '终端',     name: '终端灰度发布助理', avatar: '#f59e0b', accent: '#fde047', tags: ['OTA 升级', '终端验证', '灰度'], description: '终端固件灰度发布与回滚,实时健康度监控。', skills: ['OTA 升级', '终端验证'], version: '1.0.0', status: 'published', activated: true, createdAt: NOW - 7*DAY,  updatedAt: NOW - 1*DAY,  publisher: '当前用户', source: 'mine' },
  { id: 'draft_004', kind: 'professional', domain: '全链路',   name: '跨域根因分析员', avatar: '#8b5cf6', accent: '#c4b5fd', tags: ['根因分析', '故障定位', '跨域'], description: '跨域告警关联与故障树驱动的根因分析。', skills: ['故障定位', '根因分析'], version: '0.3.0', status: 'rejected', activated: false, createdAt: NOW - 5*DAY,  updatedAt: NOW - 3*DAY, publisher: '当前用户', source: 'mine' },
]

/* ============ 知识库条目 ============ */
const KB = [
  { id: 'kb_001', title: '《星地链路 QoS 策略手册 v3.2》', category: '手册', size: '2.4 MB', updatedAt: '2026-06-12' },
  { id: 'kb_002', title: 'CCSDS 131.0-B 关键章节速查',   category: '标准', size: '96 KB',  updatedAt: '2026-06-05' },
  { id: 'kb_003', title: 'CPE Ka 频段吞吐量测试规范',    category: '测试', size: '124 KB', updatedAt: '2026-06-14' },
  { id: 'kb_004', title: '信关站 GW-03 故障处置剧本',     category: '剧本', size: '64 KB',  updatedAt: '2026-06-10' },
  { id: 'kb_005', title: 'SLA 计算口径与归因规则',        category: '规范', size: '32 KB',  updatedAt: '2026-06-08' },
]

/* ============================================================
 * 智能中心 · 技能数据集
 * ------------------------------------------------------------
 *  技能是面向"数字员工"的可复用能力单元,字段与后端 skills 表一致:
 *    id / name / description / category / tags / usage_count /
 *    employees_count(原 agents_count,改名为"关联员工数") / trend / createdAt
 * ============================================================ */
const SKILL_CATEGORIES = {
  office:    { key: 'office',    label: '办公效率', color: '#2563eb' },
  dev:       { key: 'dev',       label: '研发辅助', color: '#0891b2' },
  test:      { key: 'test',      label: '测试工具', color: '#059669' },
  ops:       { key: 'ops',       label: '运维工具', color: '#ea580c' },
  marketing: { key: 'marketing', label: '运营工具', color: '#db2777' },
  general:   { key: 'general',   label: '通用',     color: '#607D8B' },
}
const SKILL_TEMPLATES = [
  { name: '链路诊断',      cat: 'ops',       desc: '基于遥测+告警的星地链路根因诊断,输出影响范围与处置建议。', hot: true },
  { name: '干扰分析',      cat: 'ops',       desc: '频谱监测数据驱动的干扰源识别与影响域评估,支持多源融合。' },
  { name: '雨衰建模',      cat: 'ops',       desc: '基于 ITU-R P.618 的雨衰衰减预测,可对接实测做模型校准。' },
  { name: '路由切换评估',  cat: 'ops',       desc: '评估低轨星座路由切换对端到端业务的影响,提供切换窗口建议。' },
  { name: 'OTA 升级',      cat: 'test',      desc: '用户终端固件灰度发布、配置下发与回滚能力。' },
  { name: '终端协议一致性', cat: 'test',      desc: '3GPP / CCSDS / DVB-S2X 等协议栈一致性自动化校验。', hot: true },
  { name: '大规模接入压测', cat: 'test',      desc: '模拟海量终端并发接入,评估信令面与用户面承载能力。' },
  { name: '终端功耗基线',  cat: 'test',      desc: '基于工况的终端功耗建模与异常检测。' },
  { name: 'AI 推理压测',   cat: 'dev',       desc: '星载 AI 处理器在多精度(INT8/FP16/FP32)下的推理性能基准。' },
  { name: '在轨模型更新',  cat: 'dev',       desc: '支持模型切片上传、灰度生效与回滚。' },
  { name: '射频自动化测试', cat: 'test',      desc: '转发器 EIRP / G/T / 相位噪声等射频指标自动化测试。' },
  { name: '基带解调分析',  cat: 'dev',       desc: '面向 DVB-S2X 高阶调制的解调性能与码流分析。' },
  { name: '极端环境可靠',  cat: 'test',      desc: '空间辐射 / 热真空 / 振动环境下的载荷功能可靠性验证。' },
  { name: '健康度评估',    cat: 'ops',       desc: '基于遥测大数据的卫星平台+载荷+链路综合健康度评分。' },
  { name: '故障预测',      cat: 'dev',       desc: 'LSTM+物理模型融合的故障预测,支持剩余寿命估计。' },
  { name: 'SLA 监控',      cat: 'ops',       desc: '端到端业务可用性、时延、抖动等 SLA 指标实时监控。', hot: true },
  { name: '根因分析',      cat: 'ops',       desc: '跨域告警关联与故障树驱动的根因分析。' },
  { name: '安全加固',      cat: 'ops',       desc: '针对星地链路的抗干扰、抗截获、抗欺骗能力加固与演练。' },
  { name: '合规审计',      cat: 'office',    desc: '对接工信部 / 国密等合规要求的自动化审计与报告生成。' },
  { name: '报告生成',      cat: 'office',    desc: '多类型文档生成、模板化输出、数据可视化。', hot: true },
  { name: 'NL2SQL',        cat: 'dev',       desc: '自然语言转 SQL,支持多源数据查询。' },
  { name: '日志检索',      cat: 'dev',       desc: '海量遥测/操作日志的智能检索、聚合与异常洞察。' },
  { name: '多语种翻译',    cat: 'office',    desc: '中英俄西法多语种互译,航天术语库支持。' },
  { name: '会议纪要',      cat: 'office',    desc: '实时转写、自动摘要、行动项提取与责任人对齐。' },
  { name: '客户分群',      cat: 'marketing', desc: '基于使用行为与画像的客户自动分群与精准触达建议。' },
  { name: '活动文案生成',  cat: 'marketing', desc: '围绕产品特性的多风格营销文案生成,适配多渠道。' },
]
/* 技能分类的标签池(原依赖智能体 AGENT_TEMPLATES,改为本地静态标签池,避免耦合) */
const SKILL_CATEGORY_TAGS = {
  office:    ['办公效率', '模板化', '协同'],
  dev:       ['研发辅助', '代码生成', '调试'],
  test:      ['测试工具', '回归', '压测'],
  ops:       ['运维工具', '监控', '告警'],
  marketing: ['运营工具', '用户分群', '触达'],
  general:   ['通用', '可组合', '跨域'],
}
const SKILLS_FULL = SKILL_TEMPLATES.map((t, i) => {
  const cat = SKILL_CATEGORIES[t.cat]
  return {
    id: `skill-${String(i + 1).padStart(3, '0')}`,
    name: t.name,
    description: t.desc,
    category: t.cat,
    categoryLabel: cat.label,
    categoryColor: cat.color,
    tags: (SKILL_CATEGORY_TAGS[t.cat] || SKILL_CATEGORY_TAGS.general).slice(0, 3),
    employees_count: 2 + (i * 3) % 12,
    usage_count: Math.round(500 + (i * 211) % 18000),
    trend: Array.from({ length: 7 }, (_, k) => Math.round(60 + Math.sin(k * 0.7 + i) * 22 + ((i * k) % 18))),
    createdAt: NOW - ((i * 11 + 20) * DAY),
    status: i % 9 === 8 ? 'draft' : i % 7 === 6 ? 'maintenance' : 'active',
    is_hot: Boolean(t.hot),
  }
})

/* ============================================================
 * 智能中心 · 知识库(含个人知识库 + 团队知识库)
 * ------------------------------------------------------------
 *  与后端 knowledge_bases + documents schema 严格对齐
 *    kb.id / name / description / visibility / document_count
 *       / creator_name / created_at / updated_at
 *    doc.id / knowledge_base_id / filename / format / size_bytes
 *       / parse_status / uploader_name / upload_time
 *  visibility: private(个人) | public(公开) | organization(团队)
 *  parse_status: pending | parsing | completed | failed
 * ============================================================ */
const VISIBILITY_LABELS = {
  private:     { key: 'private',     label: '个人',     tone: 'tone-purple' },
  organization:{ key: 'organization',label: '团队',     tone: 'tone-blue'   },
  public:      { key: 'public',      label: '公开',     tone: 'tone-green'  },
}
const KNOWLEDGE_BASE_CATEGORIES = [
  { key: 'protocol',   name: '协议标准', icon: 'protocol',     color: '#5b8def' },
  { key: 'test',       name: '测试报告', icon: 'lab',          color: '#16a34a' },
  { key: 'design',     name: '设计文档', icon: 'architecture', color: '#8b5cf6' },
  { key: 'ops',        name: '运维剧本', icon: 'playbook',     color: '#f59e0b' },
  { key: 'training',   name: '训练样本', icon: 'model',        color: '#ec4899' },
  { key: 'security',   name: '安全攻防', icon: 'shield',       color: '#f25c54' },
  { key: 'custom',     name: '通用自定义', icon: 'custom',     color: '#6b7280' },
]
const KNOWLEDGE_BASES = [
  { id: 'kb-001', name: '协议规范库',           description: '收录卫星通信领域国际标准(ITU-R)、行业标准及企业内部规范文档。', visibility: 'organization', category: 'protocol', document_count: 142, color_theme: '#5b8def', tags: ['ITU-R', '3GPP', 'CCSDS'], creator_name: 'Alex Chen', created_at: '2025-09-12 09:30', updated_at: '2026-06-18 14:22' },
  { id: 'kb-002', name: '测试报告归档',         description: '历次终端入网测试、网络性能测试、载荷验证测试的报告汇总与分析。', visibility: 'private',     category: 'test',     document_count: 856, color_theme: '#16a34a', tags: ['回归', '验收', '压测'],       creator_name: 'Alex Chen', created_at: '2025-04-03 11:08', updated_at: '2026-06-20 08:55' },
  { id: 'kb-003', name: '系统设计文档',         description: '总体架构设计、各分系统接口定义、部署运维手册等技术文档。',       visibility: 'public',      category: 'design',   document_count:  45, color_theme: '#8b5cf6', tags: ['架构', '接口', '部署'],         creator_name: 'Alex Chen', created_at: '2025-06-21 16:42', updated_at: '2026-05-30 10:14' },
  { id: 'kb-004', name: '运维剧本与故障处置',   description: '高发故障的处置剧本、回滚方案、应急操作流程。',                   visibility: 'private',     category: 'ops',      document_count:  78, color_theme: '#f59e0b', tags: ['故障', '回滚', '应急'],         creator_name: 'Alex Chen', created_at: '2025-11-08 13:21', updated_at: '2026-06-21 17:09' },
  { id: 'kb-005', name: '终端入网评测记录',     description: '手机直连、CPE、模组等终端的入网评测原始记录与日志。',           visibility: 'organization', category: 'test',     document_count: 234, color_theme: '#16a34a', tags: ['CPE', '模组', '入网'],         creator_name: 'Alex Chen', created_at: '2025-07-19 10:55', updated_at: '2026-06-17 09:30' },
  { id: 'kb-006', name: '星地链路损伤样本',     description: '历年雨衰、大气闪烁、多普勒频移的实测样本与参数库。',             visibility: 'organization', category: 'training', document_count: 167, color_theme: '#ec4899', tags: ['雨衰', '闪烁', '多普勒'],       creator_name: 'Alex Chen', created_at: '2025-08-25 14:11', updated_at: '2026-06-15 11:48' },
  { id: 'kb-007', name: '载荷 AI 模型仓库',     description: '在轨 AI 推理模型的版本仓库、训练样本与评估报告。',               visibility: 'private',     category: 'training', document_count:  56, color_theme: '#ec4899', tags: ['AI', 'INT8', '在轨'],           creator_name: 'Alex Chen', created_at: '2025-12-04 09:18', updated_at: '2026-06-19 16:02' },
  { id: 'kb-008', name: '安全攻防演练归档',     description: '红蓝对抗演练的攻击向量、复盘报告与修复记录。',                   visibility: 'organization', category: 'security', document_count:  42, color_theme: '#f25c54', tags: ['红蓝', '漏洞', '复盘'],         creator_name: 'Alex Chen', created_at: '2025-10-30 15:34', updated_at: '2026-06-12 13:55' },
  { id: 'kb-009', name: '运维值班周报',         description: '运控中心值班人员产出的周报、运行趋势与异常摘要。',               visibility: 'private',     category: 'ops',      document_count: 128, color_theme: '#f59e0b', tags: ['周报', 'SLA', '趋势'],         creator_name: 'Alex Chen', created_at: '2025-03-17 08:42', updated_at: '2026-06-21 18:01' },
  { id: 'kb-010', name: '客户支持知识库',       description: '面向客户与现场支持人员的常见问题与答复库。',                     visibility: 'public',      category: 'custom',   document_count:  89, color_theme: '#6b7280', tags: ['FAQ', '客户', '支持'],         creator_name: 'Alex Chen', created_at: '2025-05-29 11:24', updated_at: '2026-06-10 09:33' },
  { id: 'kb-011', name: '验收与回归测试用例',   description: '终端 / 网络 / 载荷 / 全链路的回归与验收测试用例集合。',           visibility: 'organization', category: 'test',     document_count: 312, color_theme: '#16a34a', tags: ['回归', '验收', '用例集'],       creator_name: 'Alex Chen', created_at: '2025-06-08 14:50', updated_at: '2026-06-22 08:15' },
  { id: 'kb-012', name: '频谱监测与干扰样本',   description: '全网频谱监测的原始数据、干扰源识别结果与处置记录。',             visibility: 'organization', category: 'training', document_count: 198, color_theme: '#ec4899', tags: ['频谱', '干扰', '识别'],         creator_name: 'Alex Chen', created_at: '2025-09-22 16:08', updated_at: '2026-06-18 19:42' },
  { id: 'kb-013', name: '星载软件升级记录',     description: '星载软件在轨升级的版本、操作窗口、回归结果汇总。',               visibility: 'private',     category: 'ops',      document_count:  64, color_theme: '#f59e0b', tags: ['升级', '在轨', '回归'],         creator_name: 'Alex Chen', created_at: '2025-11-30 10:14', updated_at: '2026-06-19 12:20' },
  { id: 'kb-014', name: '运维 SOP 模板库',      description: '标准运维流程(SOP)与最佳实践模板,可快速复用。',                 visibility: 'public',      category: 'ops',      document_count:  38, color_theme: '#f59e0b', tags: ['SOP', '流程', '模板'],         creator_name: 'Alex Chen', created_at: '2025-04-18 09:55', updated_at: '2026-05-28 17:30' },
  { id: 'kb-015', name: '项目交付文档',         description: '重点项目的设计、交付、验收、培训材料汇总。',                     visibility: 'private',     category: 'design',   document_count: 156, color_theme: '#8b5cf6', tags: ['交付', '验收', '培训'],         creator_name: 'Alex Chen', created_at: '2025-02-12 14:40', updated_at: '2026-06-16 10:22' },
  { id: 'kb-016', name: '客户案例与最佳实践',   description: '标杆客户的实施案例、复盘与最佳实践总结。',                       visibility: 'public',      category: 'custom',   document_count:  52, color_theme: '#6b7280', tags: ['案例', '最佳实践', '复盘'],       creator_name: 'Alex Chen', created_at: '2025-10-15 11:38', updated_at: '2026-06-14 15:17' },
  { id: 'kb-017', name: '应急响应剧本',         description: '面向重大故障、突发事件的应急响应剧本与升级机制。',               visibility: 'organization', category: 'ops',      document_count:  29, color_theme: '#f59e0b', tags: ['应急', '故障', '升级'],         creator_name: 'Alex Chen', created_at: '2025-08-08 16:22', updated_at: '2026-06-11 14:05' },
  { id: 'kb-018', name: '研发实验记录',         description: '研发阶段的实验设计、过程数据与结论记录。',                       visibility: 'private',     category: 'training', document_count:  87, color_theme: '#ec4899', tags: ['实验', '数据', '结论'],         creator_name: 'Alex Chen', created_at: '2025-07-30 13:12', updated_at: '2026-06-22 09:48' },
]

/* 文档版本历史(每个文档 1-3 个历史版本) */
const DOCUMENT_VERSIONS = {}
const DOCUMENT_SHARES = {}

/* 共享元数据(分享链接 / 访问权限) */
const SHARED_LINKS = {}
const DOCUMENTS = [
  { id: 'doc-001', knowledge_base_id: 'kb-001', filename: 'ITU-R S.2172-VLEO系统技术标准.pdf',  format: 'pdf',  size_bytes: 2458624, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-05-12 10:23' },
  { id: 'doc-002', knowledge_base_id: 'kb-001', filename: '3GPP Release 17 NTN技术规范.pdf',      format: 'pdf',  size_bytes: 5234890, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-05-15 14:08' },
  { id: 'doc-003', knowledge_base_id: 'kb-001', filename: '星间激光链路接口协议_v2.3.docx',      format: 'docx', size_bytes:  892456, parse_status: 'parsing',   uploader_name: 'Alex Chen', upload_time: '2026-06-20 09:11' },
  { id: 'doc-004', knowledge_base_id: 'kb-001', filename: 'Ka波段波束成形算法说明.txt',           format: 'txt',  size_bytes:   45678, parse_status: 'failed',    uploader_name: 'Alex Chen', upload_time: '2026-06-08 16:35' },
  { id: 'doc-005', knowledge_base_id: 'kb-001', filename: 'DVB-S2X卫星调制标准详解.pdf',          format: 'pdf',  size_bytes: 3456789, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-04-22 11:47' },
  { id: 'doc-006', knowledge_base_id: 'kb-002', filename: '2025-Q1终端入网测试总报告.pdf',         format: 'pdf',  size_bytes: 8765432, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-04-05 09:00' },
  { id: 'doc-007', knowledge_base_id: 'kb-002', filename: '大规模接入压力测试_10000终端.pdf',     format: 'pdf',  size_bytes: 6543210, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-04-12 15:22' },
  { id: 'doc-008', knowledge_base_id: 'kb-002', filename: '星地链路雨衰仿真测试报告.docx',         format: 'docx', size_bytes: 1234567, parse_status: 'parsing',   uploader_name: 'Alex Chen', upload_time: '2026-06-19 10:18' },
  { id: 'doc-009', knowledge_base_id: 'kb-002', filename: 'AI载荷推理性能基准测试.pdf',           format: 'pdf',  size_bytes: 4567890, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-05-26 13:55' },
  { id: 'doc-010', knowledge_base_id: 'kb-002', filename: '安全攻防演练报告_2026H1.pdf',           format: 'pdf',  size_bytes: 5678901, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-06-30 16:00' },
  { id: 'doc-011', knowledge_base_id: 'kb-002', filename: '端到端业务验收_视频通话.pdf',           format: 'pdf',  size_bytes: 3456789, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-03-19 14:33' },
  { id: 'doc-012', knowledge_base_id: 'kb-002', filename: '星座组网路由切换测试.txt',             format: 'txt',  size_bytes:  234567, parse_status: 'failed',    uploader_name: 'Alex Chen', upload_time: '2026-02-28 11:08' },
  { id: 'doc-013', knowledge_base_id: 'kb-003', filename: '卫星互联网总体架构设计V3.0.pdf',         format: 'pdf',  size_bytes:12345678, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-01-15 09:45' },
  { id: 'doc-014', knowledge_base_id: 'kb-003', filename: '地面站网管系统接口定义.xlsx',           format: 'xlsx', size_bytes:  987654, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-02-08 15:12' },
  { id: 'doc-015', knowledge_base_id: 'kb-003', filename: '运营运维操作手册.pdf',                  format: 'pdf',  size_bytes: 5678901, parse_status: 'parsing',   uploader_name: 'Alex Chen', upload_time: '2026-06-18 10:25' },
  { id: 'doc-016', knowledge_base_id: 'kb-004', filename: '信关站GW-03 故障处置剧本.md',           format: 'md',   size_bytes:   64210, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-05-30 14:08' },
  { id: 'doc-017', knowledge_base_id: 'kb-004', filename: '波束B-12 异常处置流程.md',               format: 'md',   size_bytes:   48562, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-04-22 11:19' },
  { id: 'doc-018', knowledge_base_id: 'kb-004', filename: '载荷电源异常应急回滚.md',                format: 'md',   size_bytes:   52344, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-03-12 16:42' },
  { id: 'doc-019', knowledge_base_id: 'kb-007', filename: '星载YOLOv8s 量化模型.bin',              format: 'bin',  size_bytes: 24862144,parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-06-12 09:18' },
  { id: 'doc-020', knowledge_base_id: 'kb-007', filename: '星载模型评估报告_2026Q2.pdf',           format: 'pdf',  size_bytes: 1235678, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-06-21 17:30' },
  { id: 'doc-021', knowledge_base_id: 'kb-009', filename: '2026-W23 运控周报.pdf',                  format: 'pdf',  size_bytes:  345678, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-06-08 18:00' },
  { id: 'doc-022', knowledge_base_id: 'kb-009', filename: '2026-W24 运控周报.pdf',                  format: 'pdf',  size_bytes:  398721, parse_status: 'pending',   uploader_name: 'Alex Chen', upload_time: '2026-06-15 18:00' },
  { id: 'doc-023', knowledge_base_id: 'kb-010', filename: 'CPE设备常见问题FAQ.md',                  format: 'md',   size_bytes:   32456, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-05-10 14:22' },
  { id: 'doc-024', knowledge_base_id: 'kb-011', filename: '回归用例集_终端.xlsx',                    format: 'xlsx', size_bytes:  645321, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-04-30 11:00' },
  { id: 'doc-025', knowledge_base_id: 'kb-011', filename: '回归用例集_网络.xlsx',                    format: 'xlsx', size_bytes:  823456, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-05-02 13:42' },
  { id: 'doc-026', knowledge_base_id: 'kb-012', filename: 'Ka频段干扰样本_2026Q1.zip',               format: 'zip',  size_bytes: 67890123,parse_status: 'parsing',   uploader_name: 'Alex Chen', upload_time: '2026-06-21 20:14' },
  { id: 'doc-027', knowledge_base_id: 'kb-013', filename: '星载软件V4.2.0 升级报告.md',              format: 'md',   size_bytes:   78910, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-05-25 16:00' },
  { id: 'doc-028', knowledge_base_id: 'kb-014', filename: 'SOP_用户终端入网流程.md',                 format: 'md',   size_bytes:   45621, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-04-12 10:00' },
  { id: 'doc-029', knowledge_base_id: 'kb-015', filename: '项目交付总览_2026.xlsx',                  format: 'xlsx', size_bytes:  234567, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-06-12 14:30' },
  { id: 'doc-030', knowledge_base_id: 'kb-018', filename: '星载AI推理加速实验笔记.md',              format: 'md',   size_bytes:   67891, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-06-15 11:25' },
  { id: 'doc-031', knowledge_base_id: 'kb-001', filename: '卫星通信频段分配示意图.png',            format: 'png',  size_bytes:  524288, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-06-10 14:08' },
  { id: 'doc-032', knowledge_base_id: 'kb-001', filename: 'Ka频段波形演示动画.mp4',                format: 'mp4',  size_bytes: 8455008, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-06-12 09:32' },
  { id: 'doc-033', knowledge_base_id: 'kb-006', filename: '雨衰实测样本_2026Q1.csv',                format: 'csv',  size_bytes:  245678, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-04-18 16:42' },
  { id: 'doc-034', knowledge_base_id: 'kb-011', filename: '自动化测试脚本.py',                       format: 'py',   size_bytes:   32456, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-05-30 10:18' },
  { id: 'doc-035', knowledge_base_id: 'kb-016', filename: '客户A部署架构图.jpg',                    format: 'jpg',  size_bytes:  312456, parse_status: 'completed', uploader_name: 'Alex Chen', upload_time: '2026-06-18 11:25' },
]

/* 文档元数据补充:tags / version / share / content_index
   --------------------------------------------------------------
   在原 DOCUMENTS 列表之后,统一补充增强字段(避免编辑 30+ 行):
   - tags: 文档标签,用于分类检索
   - version: 文档当前版本号
   - share: 共享状态 (private / link / public)
   - shared_with: 已分享的成员 / 链接
   - content_index: 索引的纯文本摘要(模拟 RAG 索引内容)
   - last_modified: 最近一次修改时间
*/
const DOC_TAGS = {
  'doc-001': ['ITU-R', 'S系列', 'VLEO'],
  'doc-002': ['3GPP', 'R17', 'NTN'],
  'doc-003': ['激光', '链路', '协议'],
  'doc-004': ['Ka', '波束', '算法'],
  'doc-005': ['DVB-S2X', '调制'],
  'doc-006': ['Q1', '入网', '汇总'],
  'doc-007': ['压测', '1万终端', '性能'],
  'doc-008': ['雨衰', '仿真'],
  'doc-009': ['AI', '推理', '基准'],
  'doc-010': ['安全', '攻防', '2026H1'],
  'doc-011': ['端到端', '视频通话', '验收'],
  'doc-012': ['星座', '路由'],
  'doc-013': ['架构', 'V3.0', '总体'],
  'doc-014': ['网管', '接口', '地面站'],
  'doc-015': ['运维', '操作手册'],
  'doc-016': ['信关站', 'GW-03'],
  'doc-017': ['波束B-12'],
  'doc-018': ['电源', '应急', '回滚'],
  'doc-019': ['YOLOv8s', '量化', '模型'],
  'doc-020': ['评估', '2026Q2'],
  'doc-021': ['周报', 'W23'],
  'doc-022': ['周报', 'W24'],
  'doc-023': ['CPE', 'FAQ'],
  'doc-024': ['回归', '终端'],
  'doc-025': ['回归', '网络'],
  'doc-026': ['Ka', '干扰', 'Q1'],
  'doc-027': ['V4.2.0', '升级'],
  'doc-028': ['SOP', '入网'],
  'doc-029': ['交付', '2026'],
  'doc-030': ['AI', '推理', '加速'],
  'doc-031': ['频段', '示意图'],
  'doc-032': ['Ka', '波形', '演示'],
  'doc-033': ['雨衰', '实测', '2026Q1'],
  'doc-034': ['自动化', '脚本'],
  'doc-035': ['客户A', '架构'],
}

const DOC_VERSIONS = {
  'doc-001': '3.2.0', 'doc-002': '17.0.0', 'doc-003': '2.3.1', 'doc-004': '1.4.0',
  'doc-005': '1.2.0', 'doc-006': '1.0.0', 'doc-007': '2.1.0', 'doc-008': '1.0.3',
  'doc-009': '1.5.0', 'doc-010': '1.0.0', 'doc-011': '1.0.0', 'doc-012': '0.9.2',
  'doc-013': '3.0.0', 'doc-014': '2.0.0', 'doc-015': '1.8.0', 'doc-016': '1.2.0',
  'doc-017': '1.0.0', 'doc-018': '1.0.0', 'doc-019': '1.0.0', 'doc-020': '1.0.0',
  'doc-021': '1.0.0', 'doc-022': '0.1.0', 'doc-023': '2.4.0', 'doc-024': '3.1.0',
  'doc-025': '3.0.0', 'doc-026': '1.0.0', 'doc-027': '4.2.0', 'doc-028': '1.5.0',
  'doc-029': '1.2.0', 'doc-030': '0.8.0', 'doc-031': '1.0.0', 'doc-032': '1.0.0',
  'doc-033': '1.0.0', 'doc-034': '1.2.0', 'doc-035': '1.0.0',
}

/* 共享权限: private / link / public */
const DOC_SHARE = {
  'doc-001': { mode: 'public',   link: 'https://kb.aeros.dev/s/d-001-x7q9' },
  'doc-002': { mode: 'link',     link: 'https://kb.aeros.dev/s/d-002-m4p2' },
  'doc-005': { mode: 'public',   link: 'https://kb.aeros.dev/s/d-005-r3k1' },
  'doc-013': { mode: 'link',     link: 'https://kb.aeros.dev/s/d-013-b8n5' },
  'doc-023': { mode: 'public',   link: 'https://kb.aeros.dev/s/d-023-w2z6' },
  'doc-027': { mode: 'link',     link: 'https://kb.aeros.dev/s/d-027-j6t9' },
  'doc-029': { mode: 'public',   link: 'https://kb.aeros.dev/s/d-029-f4h2' },
}

/* 已分享的成员(团队 / 组织) */
const DOC_SHARED_MEMBERS = {
  'doc-002': [{ name: '李工', avatar: '#4CAF50' }, { name: '陈博士', avatar: '#2196F3' }],
  'doc-013': [{ name: '张工', avatar: '#FF5722' }, { name: '王工', avatar: '#9C27B0' }, { name: '吴博士', avatar: '#0288D1' }],
  'doc-027': [{ name: '周博士', avatar: '#3F51B5' }],
  'doc-029': [{ name: '黄 PM', avatar: '#00BCD4' }, { name: '李工', avatar: '#4CAF50' }],
}

/* 文档内容索引(纯文本,用于内容搜索) */
const DOC_CONTENT_INDEX = {
  'doc-001': 'ITU-R S.2172 标准涵盖甚低地球轨道(VLEO)卫星通信系统的技术规范,包括频谱分配、干扰协调、调制方式与系统参数。文档详细说明了 VLEO 系统在 Ka 频段的链路预算、姿态控制与多普勒补偿算法,并对接入流程与认证机制给出建议。',
  'doc-002': '3GPP Release 17 NTN(非地面网络)技术规范定义了终端通过卫星接入 5G 核心网的完整协议栈,包括时序同步、随机接入、切换流程、QoS 映射等关键机制。文档重点解决了 NTN 场景下的大时延、大多普勒频移与频繁切换三大工程挑战。',
  'doc-003': '星间激光链路(ISL)接口协议 v2.3,定义了卫星星座节点间通过激光建立通信链路的物理层、链路层与网络层规范,涵盖波束指向、捕获跟踪、调制编码与流量控制。',
  'doc-004': 'Ka 波段波束成形算法说明文档,介绍自适应波束成形、混合波束成形与数字波束成形三种实现路径,以及对应的相位控制矩阵与权重更新机制。',
  'doc-005': 'DVB-S2X 卫星调制标准详解,涵盖 QPSK/8PSK/16APSK/32APSK/64APSK 等多种调制方式,以及对应的前向纠错编码(FEC)、帧结构与自适应编码调制(ACM)机制。',
  'doc-006': '2025 年第一季度终端入网测试总报告,统计了 3 个月内的 1247 台终端入网测试结果,涉及 CPE、手机直连、模组三大类,通过率 94.2%,主要问题集中在时频同步与波束切换。',
  'doc-007': '大规模接入压力测试报告,模拟 1 万台终端同时接入场景,验证系统在高并发场景下的吞吐、时延与控制面稳定性,核心网 CPU 峰值达 78%。',
  'doc-008': '星地链路雨衰仿真测试报告,基于 ITU-R P.618 雨衰模型,结合北京、广州、海南三地实测数据,验证不同降雨强度下的链路可用度。',
  'doc-009': 'AI 载荷推理性能基准测试,在 Xilinx Versal 与华为昇腾 NPU 上对比 YOLOv8s、ResNet50、BERT-base 三个模型的吞吐量、时延与功耗。',
  'doc-010': '2026 年上半年安全攻防演练报告,红队通过 12 个攻击向量成功渗透,蓝队完成全部复盘与漏洞修复,平均修复时间 MTTR 为 4.2 小时。',
  'doc-011': '端到端视频通话业务验收报告,从注册、寻呼、媒体协商到媒体传输全流程打通,实测端到端时延 386ms,画面流畅度 58fps。',
  'doc-012': '星座组网路由切换测试,模拟 60 颗低轨卫星在不同轨道面的星间路由切换场景,验证路由收敛时间与业务中断时长。',
  'doc-013': '卫星互联网总体架构设计 V3.0,涵盖接入网、承载网、核心网、业务平台四大域,以及对应的网管、安全、运维支撑体系。',
  'doc-014': '地面站网管系统接口定义,采用 NETCONF/YANG 模型,定义配置管理、告警管理、性能管理三大类接口。',
  'doc-015': '运营运维操作手册,涵盖日常巡检、故障处置、版本升级、数据备份与恢复等运维操作的标准流程。',
  'doc-016': '信关站 GW-03 故障处置剧本,记录 2025 年至今的 7 次重大故障处置过程,形成标准化的应急响应与回滚流程。',
  'doc-017': '波束 B-12 异常处置流程文档,针对该波束出现的高发故障模式,提供诊断步骤、处置动作与回归验证方法。',
  'doc-018': '载荷电源异常应急回滚 SOP,提供从告警识别、影响评估、应急隔离到在轨回滚的完整流程。',
  'doc-019': '星载 YOLOv8s 量化模型权重,INT8 量化后模型大小 24.8MB,在轨推理时延 28ms,支持 80 类目标检测。',
  'doc-020': '星载模型 2026Q2 评估报告,统计 3 个月内的在轨推理结果与精度回退情况,模型 mAP 维持在 0.62。',
  'doc-021': '2026 年第 23 周运控周报,本周内 7 个事件、3 个告警、整体 SLA 99.92%,新增 2 个 SOP。',
  'doc-022': '2026 年第 24 周运控周报(草稿),本周新增 5 个事件,主要包括 1 个 P1 级别的链路抖动。',
  'doc-023': 'CPE 设备常见问题 FAQ,涵盖注册失败、信号弱、时延高、网速慢等 18 个高频问题的标准答复。',
  'doc-024': '终端入网回归测试用例集,共 124 个用例,覆盖 2G/3G/4G/5G/NTN 等多种接入模式。',
  'doc-025': '网络性能回归测试用例集,共 187 个用例,涵盖吞吐量、时延、抖动、丢包率四大类指标。',
  'doc-026': 'Ka 频段干扰样本 2026Q1,包含 1245 条干扰事件原始数据,可用于干扰模式识别算法训练。',
  'doc-027': '星载软件 V4.2.0 升级报告,涉及 12 个模块的 bug 修复与 5 项新功能,回归通过率 98.6%。',
  'doc-028': 'SOP:用户终端入网流程标准操作规范,从需求受理、配置下发、终端验证到业务验收的完整流程。',
  'doc-029': '2026 年项目交付总览,涵盖 18 个在建项目、36 个交付节点的进度与风险状态。',
  'doc-030': '星载 AI 推理加速实验笔记,记录在 FPGA / NPU / GPU 三种硬件上的 INT8 量化与算子优化过程。',
  'doc-031': '卫星通信频段分配示意图,展示 L/S/C/X/Ku/Ka 频段在卫星通信、地面通信、雷达等不同应用中的分配。',
  'doc-032': 'Ka 频段波形演示动画,直观展示 QPSK、8PSK、16APSK 三种调制方式的星座图与频谱特征。',
  'doc-033': '雨衰实测样本 2026Q1,包含北京、广州、海南三地 90 天的分钟级降雨强度与链路衰减数据。',
  'doc-034': '自动化测试脚本(Python),封装常用的链路质量检测、告警注入、性能基线采集等操作。',
  'doc-035': '客户 A 部署架构图,展示客户 A 的核心网、信关站、终端三层部署与对接关系。',
}

/* 为每篇文档注入增强字段(在原数组上 mutate) */
DOCUMENTS.forEach((d) => {
  d.tags = DOC_TAGS[d.id] || []
  d.version = DOC_VERSIONS[d.id] || '1.0.0'
  d.share = DOC_SHARE[d.id] || { mode: 'private', link: '' }
  d.shared_members = DOC_SHARED_MEMBERS[d.id] || []
  d.content_index = DOC_CONTENT_INDEX[d.id] || ''
  d.last_modified = d.upload_time
  d.modifier_name = d.uploader_name
  d.chunk_count = Math.round(20 + (d.size_bytes || 0) / 50000)
  d.token_count = Math.round(((d.size_bytes || 0) / 4))
})

/* 注:专栏订阅(Columns / 专栏文章 / buildArticleContent / buildArticleList)已下线(2026-07 全量下线),
 *   详见 router/index.js 与 smart-center.js 路由与 API 同步清理。
 *   原"个人知识库"功能已整体迁移到"知识库"导航,路由 /knowledge 直接渲染原 PersonalKb.vue 内容。 */

/* ============ 文件树 ============ */
const FILES = [
  { id: 'f1', pid: null,    name: '产品手册',          type: 'folder' },
  { id: 'f2', pid: 'f1',    name: 'CCSDS-131.0-B.md', type: 'doc',     size: '96 KB' },
  { id: 'f3', pid: 'f1',    name: '链路-QoS-手册.pdf', type: 'pdf',     size: '2.4 MB' },
  { id: 'f4', pid: null,    name: '测试用例',          type: 'folder' },
  { id: 'f5', pid: 'f4',    name: 'Ka-吞吐测试.md',    type: 'doc',     size: '124 KB' },
  { id: 'f6', pid: 'f4',    name: 'OTA-灰度方案.md',   type: 'doc',     size: '52 KB' },
  { id: 'f7', pid: null,    name: '运维剧本',          type: 'folder' },
  { id: 'f8', pid: 'f7',    name: '信关站-GW03.md',    type: 'doc',     size: '64 KB' },
  { id: 'f9', pid: 'f7',    name: '波束故障处置.md',   type: 'doc',     size: '48 KB' },
  { id: 'f10', pid: null,   name: '固件',              type: 'folder' },
  { id: 'f11', pid: 'f10',  name: 'CPE-FW-v2.4.1.bin', type: 'firmware', size: '12.8 MB' },
]

/* ============ 审核中心 ============ */
// 注:priority(优先级)字段已于 2026-07 永久移除,审核项不再携带优先级
const REVIEWS = [
  { id: 'r1', employeeName: 'Ka 频段专项测试员',  submitter: '张工',  domain: '终端',     status: 'pending',  submittedAt: '2026-06-15 10:24', description: '针对 Ka 频段链路的专项测试与链路预算计算' },
  { id: 'r3', employeeName: '异常告警收敛员',    submitter: '王研',  domain: '运维',     status: 'rejected', submittedAt: '2026-06-14 09:11', description: '告警风暴智能聚类、抑制与自动派单' },
  { id: 'r4', employeeName: '链路质量评估员',    submitter: '赵组',  domain: '星地网络', status: 'approved', submittedAt: '2026-06-13 16:40', description: '链路质量评估与趋势预测' },
]

/* ============ 审计日志 ============ */
const AUDITS = [
  { id: 'au1', ts: '2026-06-17 09:18:32', user: '张工', action: 'CONFIG',  resource: '信关站 BJ-02 / EIRP 阈值',  result: 'success', ip: '10.21.4.18' },
  { id: 'au2', ts: '2026-06-17 09:14:02', user: '李组', action: 'CREATE',  resource: '员工 Ka 频段专项测试员',     result: 'success', ip: '10.21.4.22' },
  { id: 'au3', ts: '2026-06-17 09:08:51', user: '系统',  action: 'EXECUTE', resource: 'CPE Ka 频段吞吐量验证',         result: 'success', ip: '127.0.0.1' },
  { id: 'au4', ts: '2026-06-17 08:55:20', user: '王研', action: 'APPROVE', resource: '员工 链路质量评估员',           result: 'success', ip: '10.21.4.31' },
  { id: 'au5', ts: '2026-06-17 08:42:14', user: '孙工', action: 'EXECUTE', resource: '下载 SLA-Calculation-Rules.md', result: 'success', ip: '10.21.4.45' },
  { id: 'au6', ts: '2026-06-17 08:30:09', user: '张工', action: 'EXECUTE', resource: '信关站 BJ-02 性能基准',         result: 'failed',  ip: '10.21.4.18' },
  { id: 'au7', ts: '2026-06-17 07:50:00', user: '系统',  action: 'EXECUTE', resource: '知识库基线备份 v2.4.1',         result: 'success', ip: '127.0.0.1' },
  { id: 'au8', ts: '2026-06-17 07:32:11', user: '钱研', action: 'REJECT',  resource: '员工 异常告警收敛员',           result: 'success', ip: '10.21.4.50' },
  { id: 'au9', ts: '2026-06-17 06:18:00', user: '系统',  action: 'EXECUTE', resource: '夜间健康巡检',                  result: 'success', ip: '127.0.0.1' },
  { id: 'au10',ts: '2026-06-17 05:10:24', user: '李组', action: 'UPDATE',  resource: '系统设置 / 大模型',            result: 'success', ip: '10.21.4.22' },
  { id: 'au11',ts: '2026-06-17 04:42:18', user: '王研', action: 'DELETE',  resource: '文件 BJ-02-OLD-2024.yaml',     result: 'success', ip: '10.21.4.31' },
  { id: 'au12',ts: '2026-06-17 03:24:01', user: '张工', action: 'LOGIN',   resource: '主控台',                        result: 'success', ip: '10.21.4.18' },
]

/* ============ 系统设置 ============ */
const SETTINGS = {
  profile: { name: USER.name, role: USER.role, theme: 'dark' },
  models:  { default: 'qwen3-235b', temperature: 0.7, maxTokens: 8192, topP: 0.9, systemPrefix: '你是一名严谨的卫星互联网工程师...' },
  system:  { latency: 800, jitter: 350, pageSize: 10, streaming: true, telemetry: true },
  roles: [
    { key: 'admin',  label: '系统管理员', desc: '全部权限' },
    { key: 'ops',    label: '运控工程师', desc: '运控相关操作' },
    { key: 'review', label: '审核员',     desc: '员工上架审核' },
    { key: 'user',   label: '普通用户',   desc: '只读 + 基础对话' },
  ],
  languages: [
    { key: 'zh-CN', label: '简体中文' },
    { key: 'en-US', label: 'English' },
    { key: 'ja-JP', label: '日本語' },
  ],
}

/* ============================================================
 * 导航计数动态解析
 * ------------------------------------------------------------
 * 将 NAV 数组中的硬编码 count 替换为来自实际数据的真实数量,
 * 避免 badge 数字与列表数据不一致(2026-07 修复:技能 badge 由 24 修正为 26)。
 *   plaza          → EMPLOYEES 总数
 *   my-employees   → MY_EMPLOYEES 总数
 *   skills         → SKILL_TEMPLATES 总数(技能中心列表的来源)
 *   knowledge      → KNOWLEDGE_BASES 总数
 *   tasks          → TASKS 中非 done 的活跃任务数(run / wait / fail)
 *   review         → REVIEWS 总数
 * ============================================================ */
const NAV_COUNT_RESOLVERS = {
  plaza:        () => EMPLOYEES.length,
  'my-employees': () => MY_EMPLOYEES.length,
  skills:       () => SKILL_TEMPLATES.length,
  knowledge:    () => KNOWLEDGE_BASES.length,
  tasks:        () => TASKS.filter((t) => t.status !== 'done').length,
  review:       () => REVIEWS.length,
}
function resolveNavCounts(list) {
  return list.map((item) => {
    const next = { ...item }
    if (Array.isArray(item.children) && item.children.length) {
      next.children = resolveNavCounts(item.children)
    } else {
      const resolver = NAV_COUNT_RESOLVERS[item.id]
      if (resolver) next.count = resolver()
    }
    return next
  })
}
const NAV_RESOLVED = resolveNavCounts(NAV)

export const MOCK = {
  // 全局
  nav: NAV_RESOLVED,
  user: USER,

  // 业务
  kpis: KPIS,
  alarms: ALARMS,
  tasks: TASKS,
  trafficHours: TRAFFIC_HOURS,
  lines: LINES,
  beamLoad: BEAM_LOAD,
  beamLabels: BEAM_LABELS,
  satHealth: SAT_HEALTH,
  coverage: COVERAGE,
  regions: REGIONS,
  coverageDays: COVERAGE_DAYS,

  // 员工
  skills: SKILLS,
  superSeries: SUPER_SERIES,
  employees: EMPLOYEES,
  myEmployees: MY_EMPLOYEES,
  myDrafts: MY_DRAFTS,

  // 知识
  kb: KB,
  files: FILES,

  // 治理
  reviews: REVIEWS,
  audits: AUDITS,
  settings: SETTINGS,

  // 智能中心
  // 注:智能体模块已下线,以下不再导出 agentCategoryLabels / agentCategoryKeys / agents
  // 注:专栏订阅已下线,以下不再导出 columnCategories / columns / articlesContent /
  //     buildArticleContent / buildArticleList
  skillCategories: SKILL_CATEGORIES,
  skillsFull: SKILLS_FULL,
  knowledgeBases: KNOWLEDGE_BASES,
  documents:      DOCUMENTS,
  knowledgeBaseCategories: KNOWLEDGE_BASE_CATEGORIES,
  documentVersions: DOCUMENT_VERSIONS,
  documentShares:   DOCUMENT_SHARES,
  sharedLinks:      SHARED_LINKS,
  visibilityLabels: VISIBILITY_LABELS,
}

export default MOCK
