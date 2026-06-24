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
//   主导航 = 指挥中心 / 智能中心(展开含 智能体/技能/知识库) / 数字员工(展开含 员工广场/我的员工/创建员工) / 数据应用 / 文件中心 / 任务监控
//   管理导航 = 审核中心 / 审计日志 / 系统设置
const NAV = [
  { id: 'dashboard',     label: '指挥中心',   icon: 'Odometer',       desc: '总览与监控',          count: null, group: 'main' },
  {
    id: 'smart-center',
    label: '智能中心',
    icon: 'Sparkles',
    desc: '智能体 / 技能 / 知识库',
    count: null,
    group: 'main',
    children: [
      { id: 'agents',        label: '智能体',     icon: 'Cpu',         desc: '发现与订阅智能体',    count: 36 },
      { id: 'skills',        label: '技能',       icon: 'MagicStick',  desc: '管理可复用技能',      count: 24 },
      {
        id: 'knowledge',
        label: '知识库',
        icon: 'Folder',
        desc: '个人知识库 / 专栏订阅',
        count: null,
        // 嵌套子分组:个人知识库 + 专栏订阅
        children: [
          { id: 'personal-kb',  label: '个人知识库', icon: 'Document',  desc: '管理个人文档',        count: 18 },
          { id: 'columns',      label: '专栏订阅',   icon: 'Reading',   desc: '订阅专家专栏',        count: 7  },
        ],
      },
    ],
  },
  {
    id: 'employees',
    label: '数字员工',
    icon: 'Group',
    desc: '员工广场 / 我的员工 / 创建员工',
    count: null,
    group: 'main',
    children: [
      { id: 'plaza',        label: '员工广场', icon: 'UserFilled', desc: '发现与订阅数字员工', count: 48 },
      { id: 'my-employees', label: '我的员工', icon: 'Star',       desc: '管理我创建/订阅的',  count: 12 },
      { id: 'create',       label: '创建员工', icon: 'MagicStick', desc: '零代码自定义',       count: null },
    ],
  },
  { id: 'data',          label: '数据应用',   icon: 'DataAnalysis',   desc: '看板与自助分析',      count: null, group: 'main' },
  { id: 'files',         label: '文件中心',   icon: 'Folder',         desc: '上传与管理文档',      count: null, group: 'main' },
  { id: 'tasks',         label: '任务监控',   icon: 'Connection',     desc: '全链路任务追踪',      count: 5,    live: true, group: 'main' },
  { id: 'review',        label: '审核中心',   icon: 'Stamp',          desc: '员工上架审核',        count: 3,    group: 'aux' },
  { id: 'audit',         label: '审计日志',   icon: 'Document',       desc: '操作与合规审计',      count: null, group: 'aux' },
  { id: 'settings',      label: '系统设置',   icon: 'Setting',        desc: '主题、模型与权限',    count: null, group: 'aux' },
]

/* ============ 用户 ============ */
const USER = {
  id: 'u_001',
  name: '李航宇',
  role: 'admin',
  title: '系统管理员',
  team: '运控中心 · 高级工程师',
  avatar: '🛰️',
}

/* ============ 指挥中心 ============ */
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
  { id: 'T-2026-0617-01', title: '信关站链路异常诊断',   agent: '链路诊断员 · 卫通7号',  progress: 78,  status: 'run',  time: '00:42' },
  { id: 'T-2026-0617-02', title: 'Ka 频段用户终端干扰分析', agent: '干扰分析员 · 卫通12号', progress: 100, status: 'done', time: '02:14' },
  { id: 'T-2026-0617-03', title: '载荷健康度周报生成',   agent: '报告生成员',             progress: 100, status: 'done', time: '01:36' },
  { id: 'T-2026-0617-04', title: 'TTC 测控计划自动编排', agent: '任务编排助理',           progress: 45,  status: 'run',  time: '01:08' },
  { id: 'T-2026-0617-05', title: '测控站天线校准参数核查', agent: '测控分析员',           progress: 12,  status: 'run',  time: '00:24' },
  { id: 'T-2026-0617-06', title: '星上软件在轨升级策略评估', agent: '载荷分析员',         progress: 0,   status: 'wait', time: '等待资源' },
  { id: 'T-2026-0617-07', title: '用户终端 OTA 灰度发布', agent: '终端管理助理',           progress: 100, status: 'fail', time: '回滚' },
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
 * 员工三级分类 · 员工卡数据模型
 * ------------------------------------------------------------
 *  kind: 'super'         超级员工（S 级 · 旗舰综合能力体）
 *  kind: 'professional'  专业员工（A 级 · 场景专家）
 *  kind: 'general'       通用智能体（B 级 · 通用能力）
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
  { id: 'emp_s01', kind: 'super', tier: 1, series: 'terminal',  domain: '终端',     name: '天枢 · 用户终端智能测试官', avatar: '#6366f1', accent: '#a5b4fc', tags: ['终端验证', 'OTA 升级', '标准比对', '回归基线'], description: '面向 CPE、模组、终端芯片的全生命周期智能化测试，统一功能 / 性能 / 一致性 / OTA 四大维度的脚本生成、缺陷回放与回归闭环。', skills: ['终端验证', 'OTA 升级', '标准比对'], publisher: 'AEROS · 旗舰', status: 'published', version: '5.0.0', usage: 28134, rating: 5.0, reviews: 482, createdAt: NOW - 120*DAY },
  { id: 'emp_s02', kind: 'super', tier: 2, series: 'satnet',    domain: '星地链路', name: '天璇 · 星地网络智能测试官', avatar: '#0ea5e9', accent: '#7dd3fc', tags: ['链路诊断', '故障定位', '数据回放', '干扰分析'], description: '覆盖协议一致性、性能基准、故障注入与回放、干扰源定位，端到端输出星地网络健康度评分与处置建议。',         skills: ['链路诊断', '故障定位', '数据回放'], publisher: 'AEROS · 旗舰', status: 'published', version: '5.0.0', usage: 24819, rating: 4.9, reviews: 411, createdAt: NOW - 110*DAY },
  { id: 'emp_s03', kind: 'super', tier: 3, series: 'payload',   domain: '载荷',     name: '天玑 · 卫星载荷智能测试官', avatar: '#14b8a6', accent: '#5eead4', tags: ['遥测解析', '参数调优', '频谱分析', 'EIRP 标定'], description: 'EIRP / G/T 标定、波束跳变、接口验证、异常诊断一体化执行，载荷级高风险操作具备自动审批与回滚能力。',           skills: ['遥测解析', '参数调优', '频谱分析'], publisher: 'AEROS · 旗舰', status: 'published', version: '5.0.0', usage: 19283, rating: 4.9, reviews: 326, createdAt: NOW - 100*DAY },
  { id: 'emp_s04', kind: 'super', tier: 4, series: 'fullchain', domain: '全链路',   name: '天权 · 全链路智能验收官',   avatar: '#8b5cf6', accent: '#c4b5fd', tags: ['跨域编排', '验收剧本', '根因分析', '运维自动化'], description: '编排跨域测试 / 跨域数据关联 / 根因分析 / 运维剧本自动执行，端到端验收与 7×24 智能运维一体化。',                   skills: ['测控编排', '故障定位', '报告生成'], publisher: 'AEROS · 旗舰', status: 'published', version: '5.0.0', usage: 32410, rating: 5.0, reviews: 587, createdAt: NOW - 130*DAY },

  /* ============ 专业员工 · A 级（场景专家）============ */
  { id: 'emp_001', kind: 'professional', domain: '终端',     name: '终端验证员 · 天线一号', avatar: '#8b5cf6', accent: '#d946ef', tags: ['OTA 升级', '终端验证', '标准比对'], description: '面向 CPE、模组、终端芯片的智能化测试，覆盖功能/性能/一致性/OTA 全流程。', skills: ['链路诊断', 'OTA 升级', '终端验证'], publisher: 'AEROS · 平台', status: 'published', version: '2.4.1', usage: 12480, rating: 4.9, reviews: 218, createdAt: NOW - 30*DAY },
  { id: 'emp_002', kind: 'professional', domain: '星地链路', name: '链路诊断员 · 卫通7号',  avatar: '#06b6d4', accent: '#22d3ee', tags: ['链路诊断', '故障定位', '数据回放'], description: '执行协议一致性、性能基准、故障注入与回放，输出网络健康度评分。',       skills: ['链路诊断', '故障定位', '数据回放'], publisher: 'AEROS · 平台', status: 'published', version: '3.0.2', usage: 8972,  rating: 4.8, reviews: 174, createdAt: NOW - 25*DAY },
  { id: 'emp_003', kind: 'professional', domain: '载荷',     name: '载荷分析员 · 卫通12号', avatar: '#10b981', accent: '#a3e635', tags: ['遥测解析', '参数调优', '频谱分析'], description: 'EIRP / G/T、波束跳变、接口验证、异常诊断；高风险操作需人工审批。',           skills: ['遥测解析', '参数调优'], publisher: 'AEROS · 平台', status: 'published', version: '1.8.0', usage: 5621,  rating: 4.7, reviews: 96,  createdAt: NOW - 20*DAY },
  { id: 'emp_004', kind: 'professional', domain: '全链路',   name: '全链路编排员 · 中央',     avatar: '#f59e0b', accent: '#fde047', tags: ['测控编排', '故障定位', '报告生成'], description: '编排跨域测试、跨域数据关联、根因分析、运维剧本自动执行。',                       skills: ['测控编排', '故障定位'], publisher: 'AEROS · 平台', status: 'published', version: '4.2.0', usage: 15320, rating: 5.0, reviews: 312, createdAt: NOW - 60*DAY },
  { id: 'emp_009', kind: 'professional', domain: '星地链路', name: '干扰分析员 · 卫通12号',   avatar: '#d946ef', accent: '#f0abfc', tags: ['干扰分析', '频谱分析'],         description: '频谱监测、干扰源定位、信号质量评估，输出干扰处理建议。',                         skills: ['频谱分析', '干扰分析'], publisher: '运控中心',     status: 'rejected', version: '0.3.0', usage: 0,     rating: 0,   reviews: 0,   createdAt: NOW - 1*DAY },
  { id: 'emp_011', kind: 'professional', domain: '终端',     name: '终端管理助理',             avatar: '#fbbf24', accent: '#fde047', tags: ['OTA 升级', '终端验证'],         description: '终端批量管理、灰度发布、配置下发、健康监控。',                                   skills: ['OTA 升级', '终端验证'], publisher: '运控中心', status: 'published', version: '2.0.0', usage: 6210, rating: 4.8, reviews: 92, createdAt: NOW - 12*DAY },

  /* ============ 通用智能体 · B 级（通用能力）============ */
  { id: 'emp_005', kind: 'general',      domain: '通用',     name: '报告生成员',               avatar: '#f43f5e', accent: '#fb7185', tags: ['报告生成', '模板渲染'],                description: '多类型文档生成、模板化输出、数据可视化、多源信息整合。',                         skills: ['报告生成'], publisher: 'AEROS · 平台', status: 'published', version: '1.5.3', usage: 7133,  rating: 4.6, reviews: 88,  createdAt: NOW - 15*DAY },
  { id: 'emp_006', kind: 'general',      domain: '通用',     name: '数据洞察员',               avatar: '#3b82f6', accent: '#60a5fa', tags: ['NL2SQL', '指标计算', '归因分析'], description: 'NL 查询、指标计算、趋势 / 异常 / 归因、看板、预测分析。',                         skills: ['NL2SQL'], publisher: 'AEROS · 平台', status: 'published', version: '3.2.0', usage: 12209, rating: 4.9, reviews: 201, createdAt: NOW - 10*DAY },
  { id: 'emp_007', kind: 'general',      domain: '通用',     name: '任务编排助理',             avatar: '#a78bfa', accent: '#c4b5fd', tags: ['多步骤', '定时', '触发器'],      description: '多步骤任务规划、跨员工调度、定时与触发器、异常处理。',                           skills: ['测控编排'], publisher: 'AEROS · 平台', status: 'published', version: '2.1.0', usage: 9842,  rating: 4.8, reviews: 144, createdAt: NOW - 8*DAY },
  { id: 'emp_008', kind: 'general',      domain: '通用',     name: '日志洞察助理',             avatar: '#14b8a6', accent: '#5eead4', tags: ['日志', '检索', '聚合'],          description: '海量遥测/操作日志的智能检索、聚合与异常洞察。',                                 skills: ['故障定位'], publisher: 'AEROS · 平台', status: 'pending',  version: '0.6.0', usage: 1024,  rating: 0,   reviews: 0,   createdAt: NOW - 3*DAY },
  { id: 'emp_010', kind: 'general',      domain: '通用',     name: '翻译助理',                 avatar: '#22d3ee', accent: '#67e8f9', tags: ['翻译', '多语种', '术语库'],     description: '中英俄西法多语种互译，航天术语库支持。',                                          skills: ['报告生成'], publisher: 'AEROS · 平台', status: 'published', version: '1.0.0', usage: 4521,  rating: 4.7, reviews: 67,  createdAt: NOW - 5*DAY },
  { id: 'emp_012', kind: 'general',      domain: '通用',     name: '会议纪要员',               avatar: '#fb7185', accent: '#fda4af', tags: ['NLP', '摘要', '行动项'],        description: '实时转写、自动摘要、行动项提取、责任人对齐。',                                   skills: ['报告生成'], publisher: 'AEROS · 平台', status: 'pending', version: '0.4.0', usage: 320, rating: 0, reviews: 0, createdAt: NOW - 2*DAY },
]

const MY_EMPLOYEES = EMPLOYEES.slice(0, 5).map((e) => ({ ...e, hiredAt: NOW - 2 * DAY, source: 'subscribed' }))

/* ============ 知识库条目 ============ */
const KB = [
  { id: 'kb_001', title: '《星地链路 QoS 策略手册 v3.2》', category: '手册', size: '2.4 MB', updatedAt: '2026-06-12' },
  { id: 'kb_002', title: 'CCSDS 131.0-B 关键章节速查',   category: '标准', size: '96 KB',  updatedAt: '2026-06-05' },
  { id: 'kb_003', title: 'CPE Ka 频段吞吐量测试规范',    category: '测试', size: '124 KB', updatedAt: '2026-06-14' },
  { id: 'kb_004', title: '信关站 GW-03 故障处置剧本',     category: '剧本', size: '64 KB',  updatedAt: '2026-06-10' },
  { id: 'kb_005', title: 'SLA 计算口径与归因规则',        category: '规范', size: '32 KB',  updatedAt: '2026-06-08' },
]

/* ============================================================
 * 智能中心 · 智能体数据集
 * ------------------------------------------------------------
 *  与后端 agents 表 schema 对齐：
 *    id / name / description / category / icon / color_theme / status
 *    + 使用量 usage_count(从 conversations 关联聚合)
 *    + 关联技能 tags
 *  category 取值: terminal | network | payload | e2e
 *  status   取值: active | maintenance | draft
 * ============================================================ */
const AGENT_CATEGORY_LABELS = {
  terminal: '用户终端智能化测试',
  network:  '星地网络智能化测试',
  payload:  '卫星载荷智能化测试',
  e2e:      '全链路智能化验收与运维测试',
}
const AGENT_CATEGORY_KEYS = ['terminal', 'network', 'payload', 'e2e']
const AGENT_TEMPLATES = [
  // 终端类
  { category: 'terminal', icon: 'smartphone',     color_theme: '#4CAF50', tags: ['终端验证', '协议一致性', '信号质量'] },
  { category: 'terminal', icon: 'router',         color_theme: '#8BC34A', tags: ['终端验证', '接口兼容', '协议一致性'] },
  { category: 'terminal', icon: 'groups',         color_theme: '#CDDC39', tags: ['大规模接入', '信令分析', '拥塞控制'] },
  { category: 'terminal', icon: 'sim_card',       color_theme: '#7CB342', tags: ['SIM 配置', 'OTA 升级', '参数调优'] },
  { category: 'terminal', icon: 'cell_tower',     color_theme: '#66BB6A', tags: ['小区切换', '邻区测量', '接入时延'] },
  { category: 'terminal', icon: 'sensors',        color_theme: '#AED581', tags: ['传感器', 'IoT', '低功耗'] },
  { category: 'terminal', icon: 'developer_mode', color_theme: '#9CCC65', tags: ['固件验证', '驱动兼容', '功能回归'] },
  { category: 'terminal', icon: 'phone_iphone',   color_theme: '#43A047', tags: ['手机直连', '波束跟踪', '功耗分析'] },
  { category: 'terminal', icon: 'battery_charging_full', color_theme: '#558B2F', tags: ['续航测试', '功耗基线', '休眠策略'] },
  // 网络类
  { category: 'network',  icon: 'speed',          color_theme: '#2196F3', tags: ['网络性能', '吞吐', '时延'] },
  { category: 'network',  icon: 'cloud_sync',     color_theme: '#03A9F4', tags: ['链路损伤', '雨衰', '多普勒'] },
  { category: 'network',  icon: 'hub',            color_theme: '#00BCD4', tags: ['星座组网', '拓扑', '路由切换'] },
  { category: 'network',  icon: 'router',         color_theme: '#0288D1', tags: ['网络诊断', 'QoS', '策略路由'] },
  { category: 'network',  icon: 'sync_alt',       color_theme: '#039BE5', tags: ['时频同步', '时间同步', '网同步'] },
  { category: 'network',  icon: 'graphic_eq',     color_theme: '#0277BD', tags: ['频谱监测', '干扰分析', '信号识别'] },
  { category: 'network',  icon: 'cable',          color_theme: '#01579B', tags: ['光传输', '信关站', '承载网'] },
  { category: 'network',  icon: 'settings_ethernet', color_theme: '#29B6F6', tags: ['以太网', 'IPSec', 'VLAN'] },
  { category: 'network',  icon: 'tune',           color_theme: '#4FC3F7', tags: ['参数调优', '链路预算', '容量规划'] },
  // 载荷类
  { category: 'payload',  icon: 'psychology',     color_theme: '#9C27B0', tags: ['AI 推理', '模型更新', '在轨算法'] },
  { category: 'payload',  icon: 'settings_input_antenna', color_theme: '#673AB7', tags: ['射频', '基带', '调制解调'] },
  { category: 'payload',  icon: 'thermostat',     color_theme: '#3F51B5', tags: ['极端环境', '辐射', '热真空'] },
  { category: 'payload',  icon: 'memory',         color_theme: '#5E35B1', tags: ['星载存储', '数据回放', '压缩'] },
  { category: 'payload',  icon: 'precision_manufacturing', color_theme: '#7E57C2', tags: ['姿轨控', '执行机构', '推力器'] },
  { category: 'payload',  icon: 'solar_power',    color_theme: '#9575CD', tags: ['能源系统', '太阳能', '蓄电池'] },
  { category: 'payload',  icon: 'radar',          color_theme: '#B39DDB', tags: ['SAR', '测控', '雷达载荷'] },
  { category: 'payload',  icon: 'auto_awesome',   color_theme: '#8E24AA', tags: ['智能调度', '任务编排', '资源管理'] },
  { category: 'payload',  icon: 'scatter_plot',   color_theme: '#AB47BC', tags: ['遥测解析', '异常检测', '趋势分析'] },
  // 全链路类
  { category: 'e2e',      icon: 'health_and_safety', color_theme: '#FF5722', tags: ['在轨运维', '健康度', '故障预测'] },
  { category: 'e2e',      icon: 'shield',         color_theme: '#E91E63', tags: ['安全攻防', '红蓝对抗', '漏洞修复'] },
  { category: 'e2e',      icon: 'task_alt',       color_theme: '#FF9800', tags: ['端到端验收', '业务贯通', '回归基线'] },
  { category: 'e2e',      icon: 'monitor_heart',  color_theme: '#F44336', tags: ['SLA 监控', '告警收敛', '根因定位'] },
  { category: 'e2e',      icon: 'analytics',      color_theme: '#FF7043', tags: ['性能分析', '基线建模', '异常洞察'] },
  { category: 'e2e',      icon: 'rocket_launch',  color_theme: '#EC407A', tags: ['发射支持', '早期在轨', '状态评估'] },
  { category: 'e2e',      icon: 'cyclone',        color_theme: '#D81B60', tags: ['应急响应', '故障恢复', '业务切换'] },
  { category: 'e2e',      icon: 'workspace_premium', color_theme: '#FF8A65', tags: ['质量评估', '达标率', '改进建议'] },
  { category: 'e2e',      icon: 'fact_check',     color_theme: '#FFAB91', tags: ['合规检查', '审计支持', '报告生成'] },
]
const AGENT_NAME_POOL = {
  terminal: ['终端', 'CPE', '模组', 'SIM', '基站', 'IoT', 'OTA'],
  network:  ['网络', '链路', '星座', '路由', '时频', '频谱', '传输'],
  payload:  ['AI', '射频', '载荷', '存储', '姿轨控', '能源', '雷达'],
  e2e:      ['运维', '安全', '验收', '监控', '分析', '应急', '合规'],
}
const STATUS_DIST = ['active', 'active', 'active', 'active', 'active', 'active', 'active', 'maintenance', 'draft']

function _buildAgents() {
  // 在 12 个种子基础上扩展到 36,字段与后端 schema 严格一致
  const base = [
    { id: 'agent-001', name: '手机直连卫星终端测试',        description: '针对手机直连卫星场景的终端功能、信号质量、功耗等全方位智能化测试，支持多频段、多制式终端自动适配验证。' },
    { id: 'agent-002', name: '便携/固定终端功能兼容性测试',  description: '覆盖便携式用户终端与固定地面站的协议兼容性、接口一致性及业务功能自动化测试。' },
    { id: 'agent-003', name: '终端大规模接入模拟',           description: '模拟海量终端同时接入场景下的信令风暴、资源调度和拥塞控制等压力测试。' },
    { id: 'agent-004', name: '网络性能/压力测试',            description: '对星地融合网络的吞吐量、时延、抖动等关键指标进行智能化性能基准测试与极限压测。' },
    { id: 'agent-005', name: '星地链路损伤仿真',            description: '模拟雨衰、大气闪烁、多普勒频移等链路损伤条件下的传输可靠性智能评估。' },
    { id: 'agent-006', name: '星座组网仿真测试',             description: '基于数字孪生技术对低轨星座拓扑动态变化、路由切换及星间链路进行全链路仿真验证。' },
    { id: 'agent-007', name: 'AI载荷性能/功能测试',          description: '面向星载AI处理器的推理性能、能效比及在轨模型更新功能的自动化测试框架。' },
    { id: 'agent-008', name: '射频/基带自动化测试',          description: '覆盖卫星转发器射频特性、基带调制解调参数的全自动化测试与异常检测。' },
    { id: 'agent-009', name: '极端环境可靠测试',             description: '模拟空间辐射、热真空循环等极端环境下卫星载荷的功能可靠性与寿命预测测试。' },
    { id: 'agent-010', name: '在轨运维与故障预测',           description: '利用遥测大数据进行健康状态评估、异常根因分析及故障预测性维护的智能运维系统。' },
    { id: 'agent-011', name: '安全与攻击测试',               description: '针对星地链路的窃听、干扰、欺骗等攻击场景进行红蓝对抗演练与安全加固验证。' },
    { id: 'agent-012', name: '端到端业务验收测试',           description: '从用户终端到应用服务器的完整业务链路验收测试，覆盖语音、视频、物联网等多类业务场景。' },
  ]
  const seededIds = new Set(base.map((a) => a.id))
  const all = [...base]
  // 再补足到 36 条
  let nextId = 13
  for (const tpl of AGENT_TEMPLATES) {
    if (all.length >= 36) break
    if (all.find((a) => a.category === tpl.category && a.id === `agent-${String(nextId - 1).padStart(3, '0')}`)) continue
    const cat = tpl.category
    const pool = AGENT_NAME_POOL[cat]
    const seed = pool[(nextId - 1) % pool.length]
    const tag = tpl.tags[0]
    const id = `agent-${String(nextId).padStart(3, '0')}`
    if (seededIds.has(id)) { nextId++; continue }
    const descMap = {
      terminal: `面向 ${tag} 场景的智能化测试能力,提供脚本生成、缺陷回放与回归闭环。`,
      network:  `覆盖 ${tag} 维度的星地网络智能化测试,支持性能基准与异常诊断。`,
      payload:  `针对 ${tag} 类载荷的自动化验证与在轨异常检测,支持多频段、多模式。`,
      e2e:      `端到端 ${tag} 业务验收与运维智能化,贯通"终端-网络-载荷-业务"全链路。`,
    }
    all.push({
      id,
      name: `${seed}智能体 ${String.fromCharCode(0x4e00 + ((nextId * 7) % 30))}号`,
      description: descMap[cat],
      category: cat,
      icon: tpl.icon,
      color_theme: tpl.color_theme,
      status: STATUS_DIST[nextId % STATUS_DIST.length],
      tags: tpl.tags,
    })
    nextId++
  }
  // 注入后端模型中的额外字段(usage_count / publisher / version / createdAt)
  return all.map((a, i) => ({
    ...a,
    publisher: ['AEROS · 旗舰', 'AEROS · 平台', '运控中心', '网络中心', '载荷研究院'][i % 5],
    version: `${2 + (i % 4)}.${(i * 3) % 10}.${(i * 7) % 10}`,
    usage_count: Math.round(800 + ((i * 137) % 26000)),
    rating: a.status === 'draft' ? 0 : (4.5 + ((i * 11) % 50) / 100).toFixed(1) * 1,
    createdAt: NOW - ((i * 7 + 30) * DAY),
  }))
}
const AGENTS = _buildAgents()

/* ============================================================
 * 智能中心 · 技能数据集
 * ------------------------------------------------------------
 *  技能是从智能体能力中抽象出来的"可复用单元",每个技能可被
 *  多个智能体调用。后端目前未独立建表,这里以独立数据集形式
 *  维护,字段含义与后端 agent.tags + 关联统计一致。
 *    id / name / description / category / tags / usage_count /
 *    agents_count / trend (近 7 天调用趋势) / createdAt
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
const SKILLS_FULL = SKILL_TEMPLATES.map((t, i) => {
  const cat = SKILL_CATEGORIES[t.cat]
  return {
    id: `skill-${String(i + 1).padStart(3, '0')}`,
    name: t.name,
    description: t.desc,
    category: t.cat,
    categoryLabel: cat.label,
    categoryColor: cat.color,
    tags: AGENT_TEMPLATES.filter((a) => a.category === t.cat || t.cat === 'general').slice(0, 3).map((a) => a.tags[0]).filter(Boolean),
    agents_count: 2 + (i * 3) % 12,
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

/* ============================================================
 * 智能中心 · 专栏订阅数据集
 * ------------------------------------------------------------
 *  专栏 = 专家产出的系列内容,字段语义清晰即可:
 *    id / title / author / author_title / description /
 *    category / subscribers / articles_count / cover_color /
 *    tags / latest_title / latest_at / status
 * ============================================================ */
const COLUMN_CATEGORIES = {
  terminal: { key: 'terminal', label: '终端',  color: '#4CAF50' },
  network:  { key: 'network',  label: '网络',  color: '#2196F3' },
  payload:  { key: 'payload',  label: '载荷',  color: '#9C27B0' },
  e2e:      { key: 'e2e',      label: '全链路', color: '#FF5722' },
  ops:      { key: 'ops',      label: '运维运营', color: '#00BCD4' },
  ai:       { key: 'ai',       label: 'AI 与算法', color: '#3F51B5' },
}
const COLUMNS = [
  { id: 'col-001', title: '星地链路一席谈',       author: '陈博士', author_title: '通信系统总师',  category: 'network',  description: '从工程视角拆解星地链路的物理层、协议层与运维挑战,每两周更新。', subscribers: 1820, articles_count: 48, cover_color: '#2196F3', tags: ['链路预算', '雨衰', '多普勒'], latest_title: 'Ka波段雨衰建模与实测校准', latest_at: '2026-06-20' },
  { id: 'col-002', title: '终端协议深潜',         author: '李工',   author_title: '终端协议专家',  category: 'terminal', description: '3GPP NTN / CCSDS / DVB-S2X 协议栈解读与一致性测试经验。',     subscribers: 1342, articles_count: 36, cover_color: '#4CAF50', tags: ['协议一致性', '3GPP', 'OTA'], latest_title: 'R17 NTN 时序对齐机制详解', latest_at: '2026-06-18' },
  { id: 'col-003', title: '在轨 AI 实验室',       author: '周博士', author_title: '星载 AI 负责人', category: 'ai',       description: '星载 AI 推理、模型更新、能效优化的实战记录。',                 subscribers: 2210, articles_count: 27, cover_color: '#3F51B5', tags: ['AI 推理', '模型更新', '能效比'], latest_title: 'INT8 量化在轨部署的精度回退治理', latest_at: '2026-06-19' },
  { id: 'col-004', title: '卫星载荷故障录',       author: '王工',   author_title: '载荷可靠性专家', category: 'payload', description: '卫星载荷真实故障案例、复盘与可靠性改进经验。',                subscribers:  987, articles_count: 31, cover_color: '#9C27B0', tags: ['故障复盘', '可靠性', '寿命预测'], latest_title: '电源控制器异常导致载荷下线的处置', latest_at: '2026-06-15' },
  { id: 'col-005', title: '全链路 SLA 实战',      author: '张工',   author_title: '运维架构师',  category: 'e2e',      description: '端到端 SLA 设计、监控、告警收敛与根因分析的体系化建设。',       subscribers: 1567, articles_count: 22, cover_color: '#FF5722', tags: ['SLA', '告警', '根因'], latest_title: '告警风暴的七步收敛法', latest_at: '2026-06-17' },
  { id: 'col-006', title: '卫星互联网产品说',     author: '黄 PM',  author_title: '产品总监',    category: 'ops',      description: '面向客户的卫星互联网产品设计、交付与商业化思考。',             subscribers:  726, articles_count: 18, cover_color: '#00BCD4', tags: ['产品', '商业化', '客户成功'], latest_title: 'CPE 设备交付的隐藏成本', latest_at: '2026-06-12' },
  { id: 'col-007', title: '星座组网随笔',         author: '吴博士', author_title: '星座系统总师', category: 'network',  description: '低轨星座的拓扑、路由、时频同步以及仿真验证经验分享。',         subscribers: 2014, articles_count: 41, cover_color: '#0288D1', tags: ['星座', '路由', '时频同步'], latest_title: 'Walker 星座的相位规划对业务时延的影响', latest_at: '2026-06-21' },
]

/* ============================================================
 * 智能中心 · 专栏订阅 · 文章内容池
 * ------------------------------------------------------------
 *  文章 = 专栏下的具体内容,字段:
 *    id / column_id / title / author / author_title /
 *    cover_color / category / published_at / reading_minutes /
 *    likes / tags / summary / sections[]
 *  sections 元素 = { heading, paragraph, bullets? }
 *  详情页(ArticleDetail.vue)按此结构渲染
 * ============================================================ */
const ARTICLES_CONTENT = {
  'col-001-art-1': {
    title: 'Ka波段雨衰建模与实测校准',
    summary: 'Ka 波段雨衰是影响星地链路可用度最关键的因素之一。本文结合近一年的实测数据,给出一种工程可落地的雨衰预测与校准方法,显著降低链路可用度的统计偏差。',
    sections: [
      {
        heading: '一、背景与意义',
        paragraph: 'Ka 波段(26.5–40 GHz)因其宽带宽、波束窄、可复用性高等优势,已经成为高通量卫星(HTS)的核心工作频段。然而,雨滴对 Ka 波段信号的吸收与散射所导致的雨衰,是星地链路可用度最敏感的扰动源。统计显示,在亚热带湿润气候区,Ka 波段年平均雨衰可达 6–10 dB,瞬时雨衰可超过 20 dB,链路可用度若不补偿将下降到 95% 以下,远低于商用卫星互联网对 99.5% 的可用度要求。',
        bullets: [
          '雨衰随雨强、滴谱、温度、海拔的耦合变化复杂,纯经验模型误差大',
          '链路可用度提升需 4–6 dB 上下行的动态补偿,UPC 算法的精度至关重要',
          '实测数据稀缺,不同地域的校准参数差异大,无法简单复用通用模型',
        ],
      },
      {
        heading: '二、关键方法',
        paragraph: '我们提出 "经验模型 + 实测滚动校准" 的两步法。第一步采用 ITU-R P.618 推荐模型计算基础雨衰;第二步利用信关站近 30 天的实测信标数据,基于最小二乘动态校准模型参数。校准后,平均绝对误差从 1.8 dB 下降到 0.5 dB,链路可用度评估偏差从 ±3.2% 收窄到 ±0.8%。',
        bullets: [
          '采用滚动窗口 30 天,平衡数据量与季节敏感性',
          '结合雨量计与信标数据,提高校准样本的代表性',
          '实现自动闭环:每日定时校准 + 异常告警,无需人工干预',
        ],
      },
      {
        heading: '三、实测效果与总结',
        paragraph: '在某 7 个信关站、4 个气候带的近一年部署中,本方法将雨衰预测的均方根误差从 2.1 dB 降低到 0.6 dB,链路可用度评估的偏差下降到 0.8% 以内,显著优于纯经验模型。本方法也已封装为标准 API,可在 NOC 侧对接链路预算与 SLA 监控平台。',
        bullets: [
          '7 信关站 / 4 气候带 / 12 个月验证',
          '雨衰预测 RMSE 从 2.1 → 0.6 dB',
          '链路可用度评估偏差从 ±3.2% → ±0.8%',
        ],
      },
    ],
    tags: ['链路预算', '雨衰', 'Ka 波段', '可用度'],
  },
  'col-002-art-1': {
    title: 'R17 NTN 时序对齐机制详解',
    summary: 'R17 NTN 引入了一套完整的时序对齐机制,用于解决卫星高速运动带来的多普勒与传播时延变化问题。本文从协议栈、时序窗到实测一致性逐层拆解。',
    sections: [
      {
        heading: '一、问题背景',
        paragraph: 'NTN(Non-Terrestrial Network)在 3GPP R17 正式成为研究项。LEO 卫星以约 7.5 km/s 速度运动,导致终端接收的下行频率与帧起始时刻在毫秒级持续变化,传统 LTE/NR 的时序假设被打破。R17 通过系统信息广播 SIB、网络控制的定时提前(Timing Advance)与 K_offset 三件套,把时序对齐的精度约束到 symbol 级。',
        bullets: [
          '多普勒频偏最大可达 ±24 kHz(LEO @ Ka)',
          '传播时延变化率可达 ±50 ns/s,常规 TA 调整不适用',
          'R17 引入的 K_offset 配合 SIB19/31,完成传播时延预补偿',
        ],
      },
      {
        heading: '二、协议细节',
        paragraph: '在 R17 中,UE 启动时先通过 SIB19/31 读取当前服务波束的星历(ephemeris)与 K_offset,自行完成 "下行帧到达时刻 + 上行 TA" 的联合推算,实现免随机接入的预同步。',
        bullets: [
          'SIB19 广播波束的星历与 K_offset 索引',
          'UE 侧基于 SIB+ephemeris 计算自身位置与时延',
          'K_mac 反馈给 gNB 后,接入时延从秒级降低到 200 ms 以内',
        ],
      },
      {
        heading: '三、实测一致性',
        paragraph: '我们在 5 款主流芯片平台 + 2 款 NTN 终端上做了一致性测试,R17 时序对齐机制在 LEO 场景下平均接入时延 184 ms,优于 3GPP 目标 300 ms;多普勒频偏校正误差 < 0.3 ppm,满足 R17 协议一致性要求。',
        bullets: [
          '5 款芯片 / 2 款终端一致性测试',
          '平均接入时延 184 ms(优于 3GPP 300 ms 目标)',
          '多普勒校正误差 < 0.3 ppm',
        ],
      },
    ],
    tags: ['3GPP', 'NTN', '时序', 'R17'],
  },
  'col-003-art-1': {
    title: 'INT8 量化在轨部署的精度回退治理',
    summary: 'INT8 量化是把大型模型搬上星的最常见手段,但精度回退是拦路虎。本文给出在轨量化 + 端云协同的治理思路。',
    sections: [
      {
        heading: '一、量化损失溯源',
        paragraph: 'INT8 量化在大多数视觉任务上损失 < 1%,但在遥感目标检测、长尾样本等敏感任务上损失可达 4–8%。根本原因在于:激活分布的离群值(outlier)对量化粒度的破坏,以及敏感通道未做混合精度保护。',
        bullets: [
          '激活 outliers 集中在 < 1% 的通道',
          '未做 per-channel 缩放,粒度太粗',
          '敏感通道未做 FP16 旁路',
        ],
      },
      {
        heading: '二、端云协同治理',
        paragraph: '我们采用 "在轨 INT8 + 地面 FP16 影子模型" 的端云协同策略:星上 INT8 推理,关键 case 的特征回传地面影子模型做对照与回灌校准。回退 case 触发后自动生成新的 PTQ 校准集,定期 OTA 推送。',
        bullets: [
          '在轨 INT8 推理,满足实时性 + 功耗预算',
          '地面 FP16 影子模型,提供精度基准',
          '回退 case 自动回灌,周级 OTA 校准',
        ],
      },
      {
        heading: '三、效果与展望',
        paragraph: '本方法已在 3 颗 LEO 卫星上持续运行 8 个月,平均精度回退从 4.3% 下降到 0.7%,任务成功率从 91% 提升到 99.2%。下一步我们将探索 INT4 + 稀疏化,把星载模型的算力需求再压低 30%。',
        bullets: [
          '3 颗 LEO 卫星 / 8 个月验证',
          '平均精度回退 4.3% → 0.7%',
          '任务成功率 91% → 99.2%',
        ],
      },
    ],
    tags: ['AI 推理', 'INT8', '量化', '端云协同'],
  },
}

/* 对未配置 content 的文章,使用通用占位内容(避免 NPE,保持视觉一致) */
function buildArticleContent(articleId, columnId) {
  if (ARTICLES_CONTENT[articleId]) return ARTICLES_CONTENT[articleId]
  const col = COLUMNS.find((c) => c.id === columnId) || {}
  return {
    title: col.latest_title || '暂无标题',
    summary: `本文聚焦「${col.title || '该专栏'}」的核心议题,系统梳理工程实践中的关键决策与典型陷阱,供工程团队参考。`,
    sections: [
      {
        heading: '一、背景与意义',
        paragraph: `${col.title || '本专栏'}在工程实践中长期面临若干共性挑战。本文将逐一拆解,帮助团队在系统设计阶段规避常见误区。`,
        bullets: ['问题一:多源数据融合的一致性', '问题二:在轨资源约束下的实时性', '问题三:可观测性与可回溯性'],
      },
      {
        heading: '二、关键方法',
        paragraph: '我们提出 "分层治理 + 闭环验证" 的方法论,把复杂的端到端流程拆解为可独立验证的子模块,通过统一的契约打通模块间的协作。',
        bullets: ['模块契约 + 自动化回归', '影子流量 + 灰度发布', '统一的可观测与告警策略'],
      },
      {
        heading: '三、总结与展望',
        paragraph: '本方法在某大型系统中已经验证,核心指标提升 20–40%。后续我们将继续在工具链与生态层面做深做实,把方法论沉淀为可复用的平台能力。',
        bullets: ['核心指标 +20–40%', '工具链 / 平台化沉淀', '下一步:跨域扩展'],
      },
    ],
    tags: (col.tags || ['实战', '工程', '体系化']).slice(0, 4),
  }
}

/**
 * 派生某专栏的文章列表(供 /columns/:id/articles 使用)
 * 1) 优先从 ARTICLES_CONTENT 抽取该 column 下的精校文章
 * 2) 不足部分用 buildArticleContent 兜底补齐,序列号递增
 * 3) 按 published_at 倒序
 *
 * @param {string} columnId
 * @param {number} [limit=20]
 * @returns {Array<{ id, title, summary, published_at, reading_minutes, column_id, column_title, cover_color, author, author_title, category, tags, likes, views }>}
 */
function buildArticleList(columnId, limit = 20) {
  const col = COLUMNS.find((c) => c.id === columnId)
  if (!col) return []

  /* 第 1 步:从内容池抽取该专栏文章 */
  const collected = []
  const prefix = `${columnId}-art-`
  for (const [key, content] of Object.entries(ARTICLES_CONTENT)) {
    if (key.startsWith(prefix)) {
      const seq = parseInt(key.slice(prefix.length), 10) || 1
      collected.push({
        id: key,
        seq,
        title: content.title,
        summary: content.summary,
        sections: content.sections,
        tags: content.tags || col.tags,
      })
    }
  }
  collected.sort((a, b) => a.seq - b.seq)

  /* 第 2 步:兜底补齐到 limit */
  while (collected.length < limit) {
    const seq = collected.length + 1
    const id = `${columnId}-art-${seq}`
    /* 避免与已有 id 冲突 */
    if (collected.some((x) => x.id === id)) break
    const content = buildArticleContent(id, columnId)
    collected.push({
      id,
      seq,
      title: content.title,
      summary: content.summary,
      sections: content.sections,
      tags: content.tags || col.tags,
    })
  }

  /* 第 3 步:组装展示字段 + 倒序 */
  const now = Date.now()
  return collected
    .map((a, idx) => {
      const stepDays = 7 + (a.seq - 1) * 3
      return {
        id: a.id,
        title: a.title,
        summary: a.summary,
        published_at: new Date(now - (a.seq - 1) * stepDays * 24 * 60 * 60 * 1000).toISOString(),
        reading_minutes: 6 + ((a.seq * 3) % 12),
        column_id: col.id,
        column_title: col.title,
        cover_color: col.cover_color,
        author: col.author,
        author_title: col.author_title,
        category: col.category,
        tags: a.tags || col.tags,
        likes: 50 + ((a.seq * 37) % 380),
        views: 1200 + ((a.seq * 233) % 6000),
        /* 内部使用,render 时不展示 */
        _seq: a.seq,
      }
    })
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
}

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
const REVIEWS = [
  { id: 'r1', employeeName: 'Ka 频段专项测试员',  submitter: '张工',  domain: '终端',     priority: 'P1', status: 'pending',  submittedAt: '2026-06-15 10:24', description: '针对 Ka 频段链路的专项测试与链路预算计算' },
  { id: 'r2', employeeName: '日志洞察助理',      submitter: '李组',  domain: '通用',     priority: 'P2', status: 'pending',  submittedAt: '2026-06-15 14:02', description: '海量遥测/操作日志的智能检索、聚合与异常洞察' },
  { id: 'r3', employeeName: '异常告警收敛员',    submitter: '王研',  domain: '运维',     priority: 'P3', status: 'rejected', submittedAt: '2026-06-14 09:11', description: '告警风暴智能聚类、抑制与自动派单' },
  { id: 'r4', employeeName: '链路质量评估员',    submitter: '赵博',  domain: '星地网络', priority: 'P2', status: 'approved', submittedAt: '2026-06-13 16:40', description: '链路质量评估与趋势预测' },
  { id: 'r5', employeeName: '会议纪要员',         submitter: '钱研',  domain: '通用',     priority: 'P3', status: 'pending',  submittedAt: '2026-06-15 18:32', description: '实时转写、自动摘要、行动项提取' },
]

/* ============ 审计日志 ============ */
const AUDITS = [
  { id: 'au1', ts: '2026-06-17 09:18:32', user: '张工', action: 'CONFIG',  resource: '信关站 BJ-02 / EIRP 阈值',  result: 'success', ip: '10.21.4.18' },
  { id: 'au2', ts: '2026-06-17 09:14:02', user: '李组', action: 'CREATE',  resource: '员工 Ka 频段专项测试员',     result: 'success', ip: '10.21.4.22' },
  { id: 'au3', ts: '2026-06-17 09:08:51', user: '系统',  action: 'EXECUTE', resource: 'CPE Ka 频段吞吐量验证',         result: 'success', ip: '127.0.0.1' },
  { id: 'au4', ts: '2026-06-17 08:55:20', user: '王研', action: 'APPROVE', resource: '员工 链路质量评估员',           result: 'success', ip: '10.21.4.31' },
  { id: 'au5', ts: '2026-06-17 08:42:14', user: '赵博', action: 'EXECUTE', resource: '下载 SLA-Calculation-Rules.md', result: 'success', ip: '10.21.4.45' },
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

export const MOCK = {
  // 全局
  nav: NAV,
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

  // 知识
  kb: KB,
  files: FILES,

  // 治理
  reviews: REVIEWS,
  audits: AUDITS,
  settings: SETTINGS,

  // 智能中心
  agentCategoryLabels: AGENT_CATEGORY_LABELS,
  agentCategoryKeys:   AGENT_CATEGORY_KEYS,
  agents:    AGENTS,
  skillCategories: SKILL_CATEGORIES,
  skillsFull: SKILLS_FULL,
  knowledgeBases: KNOWLEDGE_BASES,
  documents:      DOCUMENTS,
  knowledgeBaseCategories: KNOWLEDGE_BASE_CATEGORIES,
  documentVersions: DOCUMENT_VERSIONS,
  documentShares:   DOCUMENT_SHARES,
  sharedLinks:      SHARED_LINKS,
  visibilityLabels: VISIBILITY_LABELS,
  columnCategories: COLUMN_CATEGORIES,
  columns: COLUMNS,
  articlesContent: ARTICLES_CONTENT,
  buildArticleContent,
  buildArticleList,
}

export default MOCK
