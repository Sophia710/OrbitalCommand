/* OrbitalCommand · Mock Data */
window.MOCK = (function () {
  const ACCENT_SETS = [
    { c1: '#8b5cf6', c2: '#d946ef' },
    { c1: '#06b6d4', c2: '#22d3ee' },
    { c1: '#10b981', c2: '#a3e635' },
    { c1: '#f59e0b', c2: '#fde047' },
    { c1: '#f43f5e', c2: '#fb7185' },
    { c1: '#3b82f6', c2: '#60a5fa' },
    { c1: '#a78bfa', c2: '#c4b5fd' },
    { c1: '#14b8a6', c2: '#5eead4' },
  ];
  const pickAccent = (i) => ACCENT_SETS[i % ACCENT_SETS.length];
  const initials = (n) => n.slice(0, 1);

  /* ============ NAV / GLOBAL ============ */
  const NAV = [
    { id: 'dashboard',  label: '指挥中心',   icon: 'home',       desc: '总览与监控',           count: null, group: 'main' },
    { id: 'plaza',      label: '员工广场',   icon: 'grid',       desc: '发现与订阅数字员工',   count: 48,   group: 'main' },
    { id: 'my-employees', label: '我的员工', icon: 'user',       desc: '管理我创建/订阅的员工', count: 12,   group: 'main' },
    { id: 'create',     label: '创建员工',   icon: 'plus',       desc: '零代码自定义',         count: null, group: 'main' },
    { id: 'data',       label: '数据应用',   icon: 'chart',      desc: '看板与自助分析',       count: null, group: 'main' },
    { id: 'tasks',      label: '任务监控',   icon: 'activity',   desc: '全链路任务追踪',       count: 5,    group: 'aux' },
    { id: 'files',      label: '文件中心',   icon: 'folder',     desc: '上传与管理文档',       count: null, group: 'aux' },
    { id: 'review',     label: '审核中心',   icon: 'check',      desc: '员工上架审核',         count: 3,    group: 'aux' },
    { id: 'audit',      label: '审计日志',   icon: 'shield',     desc: '操作与合规审计',       count: null, group: 'aux' },
    { id: 'settings',   label: '系统设置',   icon: 'settings',   desc: '主题、模型与权限',     count: null, group: 'admin' },
  ];

  /* ============ USER ============ */
  const USER = {
    name: '星小智',
    role: 'admin',
    title: '系统管理员',
    team: '运控中心 · 高级工程师',
    avatar: '#8b5cf6',
  };

  /* ============ DASHBOARD ============ */
  const KPIS = [
    { label: '在轨卫星',  value: '138',  unit: '颗',  trend: '+2.3%',  up: true,  series: [128,130,131,132,134,135,136,137,138,138,138,138], desc: '本周新增 3 颗备份星' },
    { label: '在线用户终端', value: '2,164', unit: '台', trend: '+12.6%', up: true,  series: [1850,1900,1940,1980,2010,2040,2080,2100,2120,2135,2150,2164], desc: '日活 89% · 健康度 96%' },
    { label: '今日完成任务', value: '1,248', unit: '次', trend: '+8.4%',  up: true,  series: [980,1050,1100,1120,1130,1180,1200,1210,1220,1235,1244,1248], desc: '平均耗时 4.2 分钟' },
    { label: '待处理告警', value: '17',   unit: '条',  trend: '-23%',  up: false, series: [38,35,33,30,28,26,25,22,20,19,18,17], desc: '高危 2 · 中危 8 · 低危 7' },
  ];

  const TASKS = [
    { id: 'T-2026-0617-01', title: '信关站链路异常诊断', agent: '链路诊断员 · 卫通7号', progress: 78, status: 'run',  time: '00:42' },
    { id: 'T-2026-0617-02', title: 'Ka 频段用户终端干扰分析', agent: '干扰分析员 · 卫通12号', progress: 100, status: 'done', time: '02:14' },
    { id: 'T-2026-0617-03', title: '载荷健康度周报生成', agent: '报告生成员', progress: 100, status: 'done', time: '01:36' },
    { id: 'T-2026-0617-04', title: 'TTC 测控计划自动编排', agent: '任务编排助理', progress: 45, status: 'run', time: '01:08' },
    { id: 'T-2026-0617-05', title: '测控站天线校准参数核查', agent: '测控分析员', progress: 12, status: 'run', time: '00:24' },
    { id: 'T-2026-0617-06', title: '星上软件在轨升级策略评估', agent: '载荷分析员', progress: 0, status: 'wait', time: '等待资源' },
    { id: 'T-2026-0617-07', title: '用户终端 OTA 灰度发布', agent: '终端管理助理', progress: 100, status: 'fail', time: '回滚' },
  ];

  const ALARMS = [
    { sev: 'high', title: '信关站 GW-03 北向接口丢包率 > 5%', target: '信关站 GW-03 · 北向接口', time: '14:22:18' },
    { sev: 'mid',  title: '波束 B-12 用户接入时延持续偏高', target: '载荷 L2 · 波束 B-12', time: '14:18:02' },
    { sev: 'mid',  title: '测控站 TC-02 上下行功率告警', target: 'TTC · 测控站 TC-02', time: '14:11:47' },
    { sev: 'low',  title: '用户终端 SN-90213 启动时间偏长', target: '终端 SN-90213', time: '14:05:23' },
    { sev: 'low',  title: '载荷 A1 温度传感器数据漂移', target: '载荷 L1 · 温度传感', time: '13:58:11' },
  ];

  const TRAFFIC = Array.from({ length: 24 }, (_, i) => {
    const base = 60 + Math.sin(i * 0.6) * 20 + Math.random() * 12;
    const peak = (i >= 18 && i <= 22) ? 18 : 0;
    return Math.round(base + peak);
  });
  const LINES = [
    { name: '上行流量',  data: TRAFFIC.map(v => Math.round(v * 0.7 + Math.random() * 8)), color: '#8b5cf6' },
    { name: '下行流量',  data: TRAFFIC, color: '#22d3ee' },
    { name: '测控流量',  data: TRAFFIC.map(v => Math.round(v * 0.15 + 8)), color: '#fbbf24' },
  ];

  const BEAM_LOAD = Array.from({ length: 16 }, (_, i) => Math.round(40 + Math.random() * 55));
  const BEAM_LABELS = Array.from({ length: 16 }, (_, i) => `B${(i + 1).toString().padStart(2, '0')}`);

  const SAT_HEALTH = Array.from({ length: 32 }, (_, i) => {
    const r = Math.random();
    if (r < 0.78) return { name: 'S' + (i + 1).toString().padStart(3, '0'), state: 'ok' };
    if (r < 0.92) return { name: 'S' + (i + 1).toString().padStart(3, '0'), state: 'warn' };
    if (r < 0.97) return { name: 'S' + (i + 1).toString().padStart(3, '0'), state: 'danger' };
    return { name: 'S' + (i + 1).toString().padStart(3, '0'), state: 'off' };
  });
  // add 32 more
  for (let i = 32; i < 64; i++) {
    const r = Math.random();
    if (r < 0.82) SAT_HEALTH.push({ name: 'S' + (i + 1).toString().padStart(3, '0'), state: 'ok' });
    else if (r < 0.92) SAT_HEALTH.push({ name: 'S' + (i + 1).toString().padStart(3, '0'), state: 'warn' });
    else if (r < 0.96) SAT_HEALTH.push({ name: 'S' + (i + 1).toString().padStart(3, '0'), state: 'danger' });
    else SAT_HEALTH.push({ name: 'S' + (i + 1).toString().padStart(3, '0'), state: 'off' });
  }

  const COVERAGE = Array.from({ length: 24 * 7 }, (_, i) => {
    const h = i % 24, d = Math.floor(i / 24);
    const v = Math.max(20, 80 - Math.abs(13 - h) * 4 + (d === 0 ? -18 : d === 6 ? 14 : 0) + Math.random() * 12);
    return Math.round(v);
  });
  const REGIONS = ['北京', '上海', '广州', '成都', '西安', '武汉', '沈阳', '昆明'];

  /* ============ EMPLOYEES (plaza) ============ */
  // 专业员工按 PRD 四类领域划分：终端 (terminal) / 星地链路 (link) / 载荷 (payload) / 全链路 (full-link)
  const EMPLOYEES = [
    { id: 'e-001', name: '链路诊断员',   role: '星地链路异常诊断 · 卫通方向', kind: 'pro',     domain: 'link',      rating: 4.9, users: 1287, calls: '1.2 万', desc: '面向信关站与地面段，自动采集链路指标、定位异常并给出处置建议。', caps: ['链路指标分析', '异常根因定位', '处置建议生成'], flags: ['featured', 'hot'], c: pickAccent(0) },
    { id: 'e-002', name: '干扰分析员',   role: '星地链路 · Ka/Ku 频段干扰', kind: 'pro',     domain: 'link',      rating: 4.8, users: 962,  calls: '8.4 千', desc: '针对用户终端与波束的同频/邻频干扰进行智能识别与影响域评估。', caps: ['频谱分析', '干扰识别', '影响域评估'], flags: ['featured', 'new'], c: pickAccent(1) },
    { id: 'e-003', name: '载荷分析员',   role: '在轨载荷 · 健康度评估',     kind: 'pro',     domain: 'payload',   rating: 4.9, users: 743,  calls: '6.1 千', desc: '在轨载荷遥测分析、健康度评估与软件升级策略生成。', caps: ['遥测解析', '健康度评估', '升级策略'], flags: ['featured'], c: pickAccent(2) },
    { id: 'e-004', name: '测控分析员',   role: '全链路 · TTC 测控计划编排', kind: 'pro',     domain: 'full-link', rating: 4.7, users: 512,  calls: '3.8 千', desc: '面向测控站的计划自动编排、冲突检测与窗口优选。', caps: ['计划编排', '冲突检测', '窗口优选'], flags: ['new'], c: pickAccent(3) },
    { id: 'e-005', name: '终端管理助理', role: '终端 · 用户终端 OTA 运维',  kind: 'pro',     domain: 'terminal',  rating: 4.8, users: 1567, calls: '1.8 万', desc: '用户终端固件/配置灰度发布、健康巡检与现场支撑。', caps: ['OTA 发布', '终端巡检', '工单协同'], flags: ['hot'], c: pickAccent(4) },
    { id: 'e-006', name: '全链路指挥员', role: '全链路 · 跨域协同编排',     kind: 'pro',     domain: 'full-link', rating: 4.6, users: 894,  calls: '7.2 千', desc: '面向复杂运营流程的多员工协同编排与执行跟踪。', caps: ['流程编排', '员工协同', '执行跟踪'], flags: ['featured'], c: pickAccent(5) },
    { id: 'e-007', name: '报告生成员',   role: '运营周报 · 自动化',         kind: 'generic', domain: '',          rating: 4.8, users: 1820, calls: '2.1 万', desc: '聚合多源数据，自动生成结构化运营/运维报告。', caps: ['数据聚合', '模板填充', '图表生成'], flags: ['hot'], c: pickAccent(6) },
    { id: 'e-008', name: '数据分析员',   role: '运营数据 · 自助分析',       kind: 'generic', domain: '',          rating: 4.7, users: 1024, calls: '9.5 千', desc: '支持自然语言查询，秒级生成数据看板与洞察。', caps: ['自然语言查询', '看板生成', '洞察建议'], flags: ['featured', 'new'], c: pickAccent(7) },
    { id: 'g-001', name: '通用助理',     role: '日常问答 · 通用任务',       kind: 'generic', domain: '',          rating: 4.9, users: 3220, calls: '5.6 万', desc: '面向团队的通用对话与文档处理助理，支持多轮上下文与工具调用。', caps: ['多轮对话', '文档处理', '工具调用'], flags: ['hot', 'featured'], c: pickAccent(0) },
    { id: 'g-002', name: '翻译助理',     role: '多语种翻译 · 文档级',       kind: 'generic', domain: '',          rating: 4.7, users: 1840, calls: '2.4 万', desc: '支持中英俄阿西等 12 个语种，文档级翻译与术语一致性保障。', caps: ['多语种', '文档级', '术语库'], flags: ['featured'], c: pickAccent(1) },
    { id: 'g-003', name: '日程助理',     role: '会议 · 提醒 · 协同',       kind: 'generic', domain: '',          rating: 4.6, users: 1230, calls: '1.8 万', desc: '自动安排会议、跨时区协调、提醒与会议纪要生成。', caps: ['日程安排', '会议纪要', '提醒管理'], flags: ['new'], c: pickAccent(2) },
    { id: 'g-004', name: '知识助理',     role: '企业知识 · 检索问答',       kind: 'generic', domain: '',          rating: 4.8, users: 2010, calls: '3.1 万', desc: '企业知识库统一检索与问答，支持多源异构文档。', caps: ['知识检索', '多源融合', '可追溯'], flags: ['hot', 'featured'], c: pickAccent(3) },
  ];

  const MY_EMPLOYEES = [
    { id: 'me-001', name: '我创建的 · 链路健康巡检',  kind: 'mine',     rating: 4.8, last: '信关站 GW-03 北向接口巡检报告', calls: 184, doc: 12, c: pickAccent(0) },
    { id: 'me-002', name: '我创建的 · 终端日志分析',  kind: 'mine',     rating: 4.7, last: 'SN-90821 启动异常分析', calls: 96,  doc: 8,  c: pickAccent(1) },
    { id: 'me-003', name: '我订阅的 · 报告生成员',    kind: 'subscribed', rating: 4.8, last: '本周运营周报 v2.3', calls: 312, doc: 24, c: pickAccent(2) },
    { id: 'me-004', name: '我订阅的 · 链路诊断员',    kind: 'subscribed', rating: 4.9, last: '异常根因报告 R-2026-0617-04', calls: 207, doc: 18, c: pickAccent(3) },
    { id: 'me-005', name: '我创建的 · 干扰排查助手',  kind: 'mine',     rating: 4.6, last: 'Ka 频段同频干扰源定位', calls: 78,  doc: 5,  c: pickAccent(4) },
    { id: 'me-006', name: '我创建的 · 测控计划助理',  kind: 'mine',     rating: 4.7, last: '明日测控计划 v0.8', calls: 56,  doc: 3,  c: pickAccent(5) },
  ];

  /* ============ SKILLS ============ */
  const SKILLS = [
    { id: 'sk-rag',    name: '知识库检索 (RAG)',    desc: '基于向量的私有知识检索与引用',  on: true,  group: 'core',   calls: '12.4k', icon: '📚' },
    { id: 'sk-code',   name: '代码执行',           desc: '在沙箱中安全执行 Python/Shell',  on: true,  group: 'core',   calls: '8.2k',  icon: '⌨️' },
    { id: 'sk-web',    name: '联网搜索',           desc: '受控的公网信息检索与摘要',        on: false, group: 'core',   calls: '5.6k',  icon: '🌐' },
    { id: 'sk-doc',    name: '文档解析',           desc: 'PDF/Word/Excel/PPT 解析',         on: true,  group: 'core',   calls: '14.1k', icon: '📄' },
    { id: 'sk-ttc',    name: 'TTC 协议解析',       desc: 'CCSDS 链路层协议解析与校验',      on: true,  group: 'domain', calls: '1.2k',  icon: '🛰️' },
    { id: 'sk-link',   name: '链路指标分析',       desc: 'E1/Es/No、时延、丢包率等',         on: true,  group: 'domain', calls: '2.4k',  icon: '📡' },
    { id: 'sk-tm',     name: '遥测时序分析',       desc: '载荷/平台遥测的时序异常检测',     on: true,  group: 'domain', calls: '1.8k',  icon: '📈' },
    { id: 'sk-fw',     name: '固件签名校验',       desc: '终端固件完整性、签名、版本',      on: false, group: 'domain', calls: '0.6k',  icon: '🔐' },
    { id: 'sk-chart',  name: '图表生成',           desc: 'ECharts/Chart.js 图表生成',        on: true,  group: 'tools',  calls: '4.1k',  icon: '📊' },
    { id: 'sk-mail',   name: '邮件与通知',         desc: '邮件、IM、Webhook 通知',           on: true,  group: 'tools',  calls: '2.7k',  icon: '✉️' },
    { id: 'sk-form',   name: '工单创建',           desc: '运维工单与流程触发',              on: true,  group: 'tools',  calls: '1.4k',  icon: '🎫' },
    { id: 'sk-sql',    name: 'SQL 查询',           desc: '结构化数据自助查询',              on: true,  group: 'tools',  calls: '3.3k',  icon: '🗃️' },
  ];

  /* ============ KNOWLEDGE BASE ============ */
  const KB_TREE = [
    { id: 'all',  name: '全部文档',  count: 128, icon: '📚' },
    { id: 'std',  name: '标准规范',  count: 42,  icon: '📐' },
    { id: 'op',   name: '运营手册',  count: 36,  icon: '📖' },
    { id: 'fail', name: '故障案例',  count: 28,  icon: '🛠️' },
    { id: 'train',name: '培训材料',  count: 14,  icon: '🎓' },
    { id: 'std-ccsds', name: 'CCSDS 协议', count: 12, icon: '🛰️', parent: 'std' },
    { id: 'std-link',  name: '链路设计',   count: 18, icon: '📡', parent: 'std' },
    { id: 'std-term',  name: '终端规范',   count: 12, icon: '🔌', parent: 'std' },
  ];
  const KB_DOCS = [
    { name: 'CCSDS 131.0-B 链路层协议规范', type: 'PDF', size: '8.4 MB', updated: '2026-06-14', status: 'parsed', icon: '📄' },
    { name: 'Ka 频段卫星通信链路设计指南 v3.2', type: 'PDF', size: '12.1 MB', updated: '2026-06-10', status: 'parsed', icon: '📘' },
    { name: '信关站运维操作手册 2026 版', type: 'DOCX', size: '4.6 MB', updated: '2026-05-28', status: 'parsed', icon: '📝' },
    { name: '用户终端现场故障案例集 (Q1)', type: 'PDF', size: '6.2 MB', updated: '2026-05-20', status: 'parsing', icon: '🛠️' },
    { name: '载荷在轨异常处置 SOP', type: 'MD', size: '320 KB', updated: '2026-05-15', status: 'parsed', icon: '📋' },
    { name: '测控站天线校准规范', type: 'PDF', size: '3.1 MB', updated: '2026-05-10', status: 'parsed', icon: '📐' },
    { name: '运营值班交接清单 v2.1', type: 'XLSX', size: '180 KB', updated: '2026-05-08', status: 'parsed', icon: '📊' },
    { name: '2026 Q1 链路健康度报告', type: 'PDF', size: '5.6 MB', updated: '2026-04-30', status: 'parsed', icon: '📈' },
  ];

  /* ============ CANVAS (workflow) ============ */
  const CANVAS_NODES = [
    { id: 'n1', kind: 'trigger', icon: '⚡', title: '用户提问',  desc: 'trigger: chat_input',      x: 60,  y: 80 },
    { id: 'n2', kind: 'llm',     icon: '🧠', title: '意图理解',  desc: 'llm: qwen2.5-72b',         x: 240, y: 60 },
    { id: 'n3', kind: 'cond',    icon: '🔀', title: '意图路由',  desc: 'condition: if/else',       x: 240, y: 200 },
    { id: 'n4', kind: 'skill',   icon: '📚', title: '知识库检索', desc: 'skill: rag.search',       x: 420, y: 60 },
    { id: 'n5', kind: 'skill',   icon: '📡', title: '链路指标',  desc: 'skill: link.metrics',      x: 420, y: 200 },
    { id: 'n6', kind: 'llm',     icon: '✍️', title: '结果综合',  desc: 'llm: qwen2.5-72b',         x: 620, y: 130 },
    { id: 'n7', kind: 'approval',icon: '👤', title: '人工审核',  desc: 'human: high-risk',         x: 620, y: 280 },
    { id: 'n8', kind: 'skill',   icon: '📤', title: '回复用户',  desc: 'skill: chat.reply',        x: 820, y: 130 },
  ];
  const CANVAS_EDGES = [
    { from: 'n1', to: 'n2' },
    { from: 'n2', to: 'n3' },
    { from: 'n3', to: 'n4' },
    { from: 'n3', to: 'n5' },
    { from: 'n4', to: 'n6' },
    { from: 'n5', to: 'n6' },
    { from: 'n6', to: 'n7' },
    { from: 'n6', to: 'n8' },
  ];

  /* ============ DATA APPLICATION ============ */
  const DATA_KPIS = [
    { label: '吞吐量 (Gbps)', value: '12.84', unit: 'Gbps', trend: '+5.4%', up: true },
    { label: '时延 (ms)',    value: '36.2',  unit: 'ms',   trend: '-2.1%', up: false },
    { label: '丢包率 (%)',   value: '0.018', unit: '%',    trend: '-12%',  up: false },
    { label: '可用度 (%)',   value: '99.97', unit: '%',    trend: '+0.04', up: true },
    { label: '用户数 (k)',   value: '216.4', unit: 'k',    trend: '+3.2%', up: true },
    { label: '波束利用率 (%)', value: '78.6', unit: '%',   trend: '+1.8%', up: true },
  ];

  // heatmap: 8 regions x 7 days x 24 hours
  const HEATMAP = {
    regions: ['北京', '上海', '广州', '成都', '西安', '武汉', '沈阳', '昆明'],
    days: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    data: (function () {
      const out = [];
      for (let d = 0; d < 7; d++) {
        const row = [];
        for (let h = 0; h < 24; h++) {
          const base = 30 + Math.sin(h * 0.5) * 25 + (h >= 9 && h <= 22 ? 25 : 0);
          const v = Math.max(5, Math.round(base + (d >= 5 ? -15 : 0) + Math.random() * 18));
          row.push(v);
        }
        out.push(row);
      }
      return out;
    })(),
  };

  // topology (network)
  const TOPO_NODES = [
    { id: 'core', label: '运控中心', x: 400, y: 160, kind: 'core' },
    { id: 'gw1',  label: '信关站 GW-01', x: 200, y: 60,  kind: 'gw' },
    { id: 'gw2',  label: '信关站 GW-02', x: 600, y: 60,  kind: 'gw' },
    { id: 'gw3',  label: '信关站 GW-03', x: 200, y: 260, kind: 'gw' },
    { id: 'gw4',  label: '信关站 GW-04', x: 600, y: 260, kind: 'gw' },
    { id: 'tc1',  label: '测控站 TC-01', x: 80,  y: 160, kind: 'tc' },
    { id: 'tc2',  label: '测控站 TC-02', x: 720, y: 160, kind: 'tc' },
    { id: 'noc1', label: 'NOC 北京',     x: 320, y: 40,  kind: 'noc' },
    { id: 'noc2', label: 'NOC 上海',     x: 480, y: 280, kind: 'noc' },
  ];
  const TOPO_LINKS = [
    { from: 'core', to: 'gw1' }, { from: 'core', to: 'gw2' },
    { from: 'core', to: 'gw3' }, { from: 'core', to: 'gw4' },
    { from: 'core', to: 'tc1' }, { from: 'core', to: 'tc2' },
    { from: 'core', to: 'noc1' }, { from: 'core', to: 'noc2' },
    { from: 'gw1', to: 'gw2', active: true },
  ];

  // gantt
  const GANTT = [
    { name: '信关站链路异常诊断',    start: 0,  span: 18, status: 'run',  color: '#8b5cf6',  unit: '链路诊断员' },
    { name: '干扰源识别与定位',     start: 4,  span: 14, status: 'run',  color: '#22d3ee',  unit: '干扰分析员' },
    { name: '运营周报生成',         start: 8,  span: 10, status: 'done', color: '#10b981',  unit: '报告生成员' },
    { name: '测控计划编排',         start: 12, span: 20, status: 'run',  color: '#a78bfa',  unit: '任务编排助理' },
    { name: '终端 OTA 灰度发布',     start: 18, span: 12, status: 'wait', color: '#fbbf24',  unit: '终端管理助理' },
    { name: '载荷健康度评估',       start: 22, span: 14, status: 'wait', color: '#f43f5e',  unit: '载荷分析员' },
  ];
  const GANTT_TICKS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

  // trajectory (radar)
  const TRAJ = (function () {
    const w = 800, h = 240;
    const r = 90;
    const cx = 120, cy = h / 2;
    const series = [
      { name: '正常基线', color: '#22d3ee', active: false, points: 24, amp: 0.2, phase: 0 },
      { name: '实际轨迹', color: '#8b5cf6', active: true,  points: 36, amp: 0.45, phase: 0.4 },
    ];
    const xAxis = Array.from({ length: 10 }, (_, i) => 60 + i * 70);
    return { w, h, r, cx, cy, series, xAxis };
  })();

  /* ============ FILES ============ */
  const FILES = [
    { name: '链路异常诊断报告 0617.pdf', type: 'PDF',  size: '2.1 MB', time: '14:22', c: '#f43f5e' },
    { name: '运营周报 v2.3.docx',       type: 'DOCX', size: '1.4 MB', time: '11:08', c: '#22d3ee' },
    { name: '波束利用率分析.xlsx',     type: 'XLSX', size: '480 KB', time: '09:35', c: '#10b981' },
    { name: '测控站天线校准数据.json', type: 'JSON', size: '320 KB', time: '08:50', c: '#fbbf24' },
    { name: '终端固件 v3.1.8.zip',     type: 'ZIP',  size: '128 MB', time: '昨日', c: '#8b5cf6' },
    { name: 'Ka 频段干扰源定位.md',     type: 'MD',   size: '64 KB',  time: '昨日', c: '#a78bfa' },
    { name: '会议纪要 · 0616.md',       type: 'MD',   size: '12 KB',  time: '前日', c: '#06b6d4' },
    { name: '信关站巡检清单.xlsx',     type: 'XLSX', size: '92 KB',  time: '前日', c: '#10b981' },
  ];

  /* ============ REVIEW ============ */
  const REVIEWS = [
    { name: '波束健康度分析员',   sub: '提交人：王雪 · 卫星运维组', tag: '通用员工',   desc: '基于历史波束遥测，提供波束健康度评估、趋势预测与异常预警。知识库引用 12 份标准规范与 8 份历史案例。', meta: 'v0.8 · 3 技能 · 2 知识库', c1: '#22d3ee', c2: '#06b6d4' },
    { name: '干扰排查助手',       sub: '提交人：星小智 · 运营值班组', tag: '用户自建',   desc: '面向一线值班员的频段干扰快速定位工具，结合实时频谱与历史案例，平均定位耗时 4.2 分钟。', meta: 'v1.2 · 5 技能 · 1 知识库', c1: '#f43f5e', c2: '#fb7185' },
    { name: 'Ka 频段链路规划员',   sub: '提交人：陈默 · 网络规划组', tag: '通用员工',   desc: '面向 Ka 频段网络规划场景，提供波束配置、链路预算与容量评估输出。', meta: 'v1.0 · 4 技能 · 3 知识库', c1: '#10b981', c2: '#34d399' },
    { name: '终端日志分析员',     sub: '提交人：赵欣 · 用户终端组', tag: '用户自建',   desc: '针对用户终端日志的智能分析，定位启动失败、注册失败、链路抖动等典型问题。', meta: 'v0.9 · 3 技能 · 1 知识库', c1: '#8b5cf6', c2: '#d946ef' },
  ];

  /* ============ AUDIT ============ */
  const AUDIT = [
    { ts: '2026-06-17 14:22:18', user: '星小智', action: 'EDIT_EMPLOYEE', target: '链路诊断员 / 节点 n3', ip: '10.18.32.41' },
    { ts: '2026-06-17 14:18:02', user: '王雪',   action: 'PUBLISH_EMPLOYEE', target: '波束健康度分析员 v0.8', ip: '10.18.32.78' },
    { ts: '2026-06-17 14:11:47', user: '张博',   action: 'APPROVE',         target: '干扰排查助手 v1.2',     ip: '10.18.32.55' },
    { ts: '2026-06-17 13:58:11', user: '系统',   action: 'AUTO_REVIEW',     target: '终端日志分析员 v0.9',   ip: '—' },
    { ts: '2026-06-17 13:42:00', user: '陈默',   action: 'UPLOAD_KB',       target: 'Ka 频段链路设计指南 v3.2', ip: '10.18.32.92' },
    { ts: '2026-06-17 13:18:33', user: '星小智', action: 'CREATE_EMPLOYEE', target: '终端日志分析员',         ip: '10.18.32.41' },
    { ts: '2026-06-17 12:54:08', user: '系统',   action: 'BACKUP',          target: 'config-snapshot-0617',  ip: '—' },
    { ts: '2026-06-17 12:30:11', user: '王雪',   action: 'RUN_TASK',        target: 'T-2026-0617-01',         ip: '10.18.32.78' },
  ];

  /* ============ CHAT HISTORY ============ */
  const CHAT_HISTORY = [
    { date: '今天', items: [
      { id: 'c-01', title: '信关站 GW-03 北向接口丢包', preview: '链路诊断员 · 14:22', agent: '链路诊断员' },
      { id: 'c-02', title: '波束 B-12 时延异常分析',     preview: '干扰分析员 · 11:08', agent: '干扰分析员' },
      { id: 'c-03', title: '本周运营周报生成',           preview: '报告生成员 · 09:30',  agent: '报告生成员' },
    ]},
    { date: '昨天', items: [
      { id: 'c-04', title: '测控计划冲突检测',           preview: '任务编排助理 · 17:42', agent: '任务编排助理' },
      { id: 'c-05', title: '用户终端 OTA 灰度策略',      preview: '终端管理助理 · 15:18', agent: '终端管理助理' },
      { id: 'c-06', title: 'Ka 频段链路预算复核',        preview: '数据分析员 · 10:22',   agent: '数据分析员' },
    ]},
    { date: '更早', items: [
      { id: 'c-07', title: '信关站 SOP 修订',            preview: '通用助理 · 06-15',     agent: '通用助理' },
      { id: 'c-08', title: '测控站培训材料整理',         preview: '知识助理 · 06-14',     agent: '知识助理' },
    ]},
  ];

  /* ============ CHAT MESSAGES (current session) ============ */
  const CHAT_MESSAGES = [
    { who: 'bot', t: '14:22:05', text: '你好，星小智。我是 <b>链路诊断员 · 卫通7号</b>，已为你接入信关站 GW-03 的实时链路指标。可以告诉我你关心的具体问题。' },
    { who: 'bot', text: '建议先从以下方向开始：', suggest: ['分析北向接口丢包率', '定位异常根因', '生成处置建议'] },
    { who: 'user', t: '14:22:18', text: 'GW-03 北向接口丢包率从 5 分钟前开始超过 5%，帮我定位一下根因。' },
    { who: 'bot', t: '14:22:21', text: '正在调取最近 30 分钟的链路指标与告警上下文…', thinking: true },
    { who: 'bot', t: '14:22:38', text: '已定位到 3 个可疑因素，按可信度排序：' },
    { who: 'step', title: '数据采集', detail: 'pull(gw03, 30m) · 指标 24 项 · 告警 3 条' },
    { who: 'step', title: '相关分析', detail: 'corr(loss, peer_latency) = 0.86 · corr(loss, fec) = 0.21' },
    { who: 'step', title: '根因推断', detail: 'RCA #1 上游对端路由抖动（可信度 0.78）' },
    { who: 'bot', t: '14:22:44', text: '<b>初步结论：</b>北向接口丢包率升高主要由 <b>上游对端路由抖动</b> 引发（可信度 78%），次要因素为本地 FEC 纠错压力上升。建议先与上游运营商确认路由事件，同时启用本地 FEC 加强策略。' },
  ];

  return {
    NAV, USER, KPIS, TASKS, ALARMS, TRAFFIC, LINES, BEAM_LOAD, BEAM_LABELS, SAT_HEALTH, COVERAGE, REGIONS,
    EMPLOYEES, MY_EMPLOYEES, SKILLS, KB_TREE, KB_DOCS,
    CANVAS_NODES, CANVAS_EDGES,
    DATA_KPIS, HEATMAP, TOPO_NODES, TOPO_LINKS, GANTT, GANTT_TICKS, TRAJ,
    FILES, REVIEWS, AUDIT,
    CHAT_HISTORY, CHAT_MESSAGES,
  };
})();
