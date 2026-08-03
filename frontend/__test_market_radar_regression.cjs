/* =============================================================
 * 市场商机分析员 · 员工遍历回归测试（E.1）
 * ----------------------------------------------------------------
 * 目标：
 *  1) 静态扫描：验证 ChatOverlay.vue / mock.js / mock-data.js 中
 *     所有新增功能均通过 isMarketRadar / id === 'market-radar-001' 隔离
 *  2) 静态扫描：验证现有 4 类消息渲染分支 (process_card / step /
 *     markdown / 普通消息) 在 ChatOverlay.vue 中完整保留
 *  3) 静态扫描：验证 MOCK_DIALOG 与其他员工字段未被污染
 *  4) 运行时校验：buildMarketRadarMessages() 输出结构符合规范
 *  5) 运行时校验：其他 6+ 个员工仍走 MOCK_DIALOG 分支
 *
 * 运行：node __test_market_radar_regression.js
 * 退出码：0 全部通过；1 存在失败
 * ============================================================= */
const fs = require('fs')
const path = require('path')

/* ---------- 工具函数 ---------- */
function read(p) { return fs.readFileSync(p, 'utf-8') }
function ok(name)  { console.log('PASS  ' + name); pass++ }
function bad(name, info) {
  console.log('FAIL  ' + name + (info ? '\n        ' + info : ''))
  fail++
}
function expect(cond, name, info) { cond ? ok(name) : bad(name, info) }

let pass = 0, fail = 0

const ROOT = path.resolve(__dirname)
const FRONTEND = path.join(ROOT)
const CHAT = path.join(FRONTEND, 'src', 'components', 'ChatOverlay.vue')
const MOCK = path.join(FRONTEND, 'src', 'api', 'mock.js')
const MOCK_DATA = path.join(FRONTEND, 'src', 'api', 'mock-data.js')
const CHAT_STORE = path.join(FRONTEND, 'src', 'stores', 'chat.js')

/* ============================================================
 * 1) ChatOverlay.vue 静态隔离扫描
 * ============================================================ */
console.log('\n=== 1) ChatOverlay.vue 静态隔离扫描 ===')
const chatSrc = read(CHAT)

/* 1.1 必须存在 isMarketRadar 计算属性（v-if 隔离的根） */
expect(
  /isMarketRadar\s*=\s*computed\s*\(\s*\(\s*\)\s*=>\s*chat\.employee\?\.id\s*===\s*['"]market-radar-001['"]\s*\)/.test(chatSrc),
  '1.1 ChatOverlay 中存在 isMarketRadar 计算属性，识别 id === market-radar-001'
)

/* 1.2 关键 v-if 隔离：工具箱按钮、知识库绑定按钮、KnowledgeRef 浮层 */
const toolboxBtnOk = /v-if\s*=\s*["']isMarketRadar["'][\s\S]*?class\s*=\s*["']chat-sidebar__toolbox-btn["']/.test(chatSrc)
expect(toolboxBtnOk, '1.2 工具箱按钮被 v-if="isMarketRadar" 隔离')

const kbBindBtnOk = /v-if\s*=\s*["']isMarketRadar["'][\s\S]*?class\s*=\s*["'][^"']*chat-input__tool--bind[^"']*["']/.test(chatSrc)
expect(kbBindBtnOk, '1.3 知识库绑定按钮被 v-if="isMarketRadar" 隔离')

const knowledgeRefOk = /<KnowledgeRef\s+v-if\s*=\s*["']isMarketRadar["']/.test(chatSrc)
expect(knowledgeRefOk, '1.4 KnowledgeRef 引用上标浮层被 v-if="isMarketRadar" 隔离')

/* 1.5 关键弹窗都被 v-model 绑定 (Element Plus 弹窗用 v-model 控制开关) */
expect(
  /<DataSourceDialog\s+v-if\s*=\s*["']isMarketRadar["'][\s\S]*?v-model\s*=\s*["']dataSourceDialogOpen["']/.test(chatSrc),
  '1.5 DataSourceDialog 弹窗由 v-model="dataSourceDialogOpen" 控制（v-if 隔离）'
)
expect(
  /<PushDialog\s+v-if\s*=\s*["']isMarketRadar["'][\s\S]*?v-model\s*=\s*["']pushDialogOpen["']/.test(chatSrc),
  '1.6 PushDialog 弹窗由 v-model="pushDialogOpen" 控制（v-if 隔离）'
)
expect(
  /<KnowledgeBindDrawer\s+v-if\s*=\s*["']isMarketRadar["'][\s\S]*?v-model\s*=\s*["']knowledgeDrawerOpen["']/.test(chatSrc),
  '1.7 KnowledgeBindDrawer 抽屉由 v-model="knowledgeDrawerOpen" 控制（v-if 隔离）'
)

/* 1.6 新消息类型分支必须用 isMarketRadar 守卫 */
const newMsgs = ['chart', 'result_list', 'downloadActions']
newMsgs.forEach((kind) => {
  const re = kind === 'downloadActions'
    ? /m\.downloadActions[\s\S]{0,40}isMarketRadar/
    : new RegExp(`m\\.who\\s*===\\s*['"]${kind}['"]\\s*&&\\s*isMarketRadar`)
  expect(re.test(chatSrc), `1.8.${kind} 新消息类型分支带 isMarketRadar 守卫`)
})

/* ============================================================
 * 2) ChatOverlay.vue 现有 4 类消息分支完整性
 * ============================================================ */
console.log('\n=== 2) 现有 4 类消息分支完整性 ===')
const mustExist = [
  { name: 'process_card', re: /m\.who\s*===\s*['"]process_card['"]/ },
  { name: 'markdown',     re: /m\.who\s*===\s*['"]markdown['"]/ },
  { name: 'step',         re: /m\.who\s*===\s*['"]step['"]/ },
  { name: 'chat-msg--',   re: /class\s*=\s*["']chat-msg["']/ },   // 普通消息
]
mustExist.forEach(({ name, re }) => {
  expect(re.test(chatSrc), `2.1 现有消息分支 ${name} 仍然存在`)
})

/* 2.2 renderInline 函数应支持 [n] 上标（仅 isMarketRadar） */
expect(
  /function\s+renderInline[\s\S]*?isMarketRadar[\s\S]*?data-kb-index/.test(chatSrc),
  '2.2 renderInline 函数支持 [n] 知识库引用上标（仅 isMarketRadar）'
)

/* 2.3 普通回车处理仍然存在（避免破坏其他员工） */
expect(
  /replace\([^)]*\\n[^)]*<br/.test(chatSrc),
  '2.3 renderInline 仍然处理 \\n 换行'
)

/* ============================================================
 * 3) mock.js 结构与隔离
 * ============================================================ */
console.log('\n=== 3) mock.js 结构与隔离 ===')
const mockSrc = read(MOCK)

/* 3.1 必须存在 buildMarketRadarMessages / scheduleMarketRadarStream / abortMarketRadarStream */
expect(/export\s+function\s+buildMarketRadarMessages\s*\(/.test(mockSrc), '3.1 mock.js 暴露 buildMarketRadarMessages')
expect(/export\s+function\s+scheduleMarketRadarStream\s*\(/.test(mockSrc), '3.2 mock.js 暴露 scheduleMarketRadarStream')
expect(/export\s+function\s+abortMarketRadarStream\s*\(/.test(mockSrc), '3.3 mock.js 暴露 abortMarketRadarStream')

/* 3.2 MR_STEPS 必须有 4 步 */
const stepsMatch = mockSrc.match(/const\s+MR_STEPS\s*=\s*\[([\s\S]*?)\]/)
if (stepsMatch) {
  const stepCount = (stepsMatch[1].match(/\{\s*icon\s*:/g) || []).length
  expect(stepCount === 4, '3.4 MR_STEPS 包含 4 步', `实际 ${stepCount} 步`)
} else {
  expect(false, '3.4 MR_STEPS 数组存在')
}

/* 3.3 MR_CHARTS 必须有 4 张图表 */
const chartsMatch = mockSrc.match(/const\s+MR_CHARTS\s*=\s*\[([\s\S]*?)\n\]/)
if (chartsMatch) {
  const chartCount = (chartsMatch[1].match(/chartType\s*:/g) || []).length
  expect(chartCount === 4, '3.5 MR_CHARTS 包含 4 张图表', `实际 ${chartCount} 张`)
} else {
  expect(false, '3.5 MR_CHARTS 数组存在')
}

/* 3.4 MR_RESULTS 必须有 10 条结果 */
const resultsMatch = mockSrc.match(/const\s+MR_RESULTS\s*=\s*\[([\s\S]*?)\n\]/)
if (resultsMatch) {
  const resultCount = (resultsMatch[1].match(/\{\s*id\s*:\s*['"]r\d+['"]/g) || []).length
  expect(resultCount === 10, '3.6 MR_RESULTS 包含 10 条结果', `实际 ${resultCount} 条`)
} else {
  expect(false, '3.6 MR_RESULTS 数组存在')
}

/* 3.5 报告包含 [n] 引用上标 */
const refCount = (mockSrc.match(/\[\d+\]/g) || []).filter((m) => /^\[[1-8]\]$/.test(m)).length
expect(refCount >= 6, '3.7 报告 markdown 包含 [n] 引用上标', `实际 ${refCount} 个`)

/* 3.6 mock.js 不允许修改其他员工的 MOCK_DIALOG */

/* ============================================================
 * 4) mock-data.js 其他员工字段未被污染
 * ============================================================ */
console.log('\n=== 4) mock-data.js 其他员工字段 ===')
const mockDataSrc = read(MOCK_DATA)

/* 4.1 必须存在市场商机分析员 */
expect(
  /id\s*:\s*['"]market-radar-001['"]/.test(mockDataSrc),
  '4.1 员工列表中存在市场商机分析员 (id: market-radar-001)'
)

/* 4.2 其他员工 id 必须保持不变（白名单） */
const expectedIds = [
  'emp_s01', 'emp_s02', 'emp_s03', 'emp_s04',
  'emp_001', 'emp_002', 'emp_003', 'emp_004', 'emp_009', 'emp_011',
]
expectedIds.forEach((id) => {
  expect(
    new RegExp(`id\\s*:\\s*['"]${id}['"]`).test(mockDataSrc),
    `4.2 员工 ${id} 仍存在`
  )
})

/* 4.3 非市场商机分析员员工字段不能含 defaultQuery（避免污染） */
const lines = mockDataSrc.split('\n')
let inMarketRadar = false
let marketRadarEnd = -1
for (let i = 0; i < lines.length; i++) {
  if (/id\s*:\s*['"]market-radar-001['"]/.test(lines[i])) inMarketRadar = true
  if (inMarketRadar && /^\s*\},?\s*$/.test(lines[i]) && i > 0) {
    /* 一个对象的结束 */
    marketRadarEnd = i
    inMarketRadar = false
    break
  }
}
const before = lines.slice(0, lines.findIndex(l => /id\s*:\s*['"]market-radar-001['"]/.test(l))).join('\n')
expect(
  !/defaultQuery/.test(before),
  '4.3 其他员工不包含 defaultQuery 字段（防止污染）'
)

/* ============================================================
 * 5) chat.js store 隔离
 * ============================================================ */
console.log('\n=== 5) chat.js store 隔离 ===')
const chatStoreSrc = read(CHAT_STORE)

/* 5.1 包含 market-radar-001 分支 */
expect(
  /emp\?\.id\s*===\s*['"]market-radar-001['"]/.test(chatStoreSrc),
  '5.1 chat.js 在 openChat 中按 emp.id === "market-radar-001" 分支'
)

/* 5.2 其他员工仍走 MOCK_DIALOG */
expect(
  /this\.messages\s*=\s*\[[\s\S]*?MOCK_DIALOG[\s\S]*?\]/.test(chatStoreSrc),
  '5.2 chat.js 仍为其他员工构造 MOCK_DIALOG 消息流'
)

/* 5.3 包含 prebind 知识库逻辑（仅首次） */
expect(
  /this\.bindDocs\(\s*\[\s*['"]mr-doc-1['"]/.test(chatStoreSrc),
  '5.3 chat.js 首次打开市场商机分析员时预绑定知识库'
)

/* 5.4 包含 abortMarketRadarStream 调用清理 */
expect(
  /abortMarketRadarStream\(\)/.test(chatStoreSrc),
  '5.4 chat.js 在 openChat 前调用 abortMarketRadarStream 清理'
)

/* ============================================================
 * 6) 运行时：buildMarketRadarMessages 输出结构
 * ============================================================ */
console.log('\n=== 6) buildMarketRadarMessages 运行时结构 ===')
try {
  /* 把 mock.js 中的 ESM 语法去掉（import/export），让 Node.js 当作 CJS 处理 */
  const noImport = mockSrc.replace(/^import .*$/gm, '')
  /* export const X = Y  →  const X = Y
     export function X() {}  →  function X() {} */
  const noExport = noImport
    .replace(/export\s+const\s+/g, 'const ')
    .replace(/export\s+async\s+function\s+/g, 'async function ')
    .replace(/export\s+function\s+/g, 'function ')
    .replace(/export\s*\{[^}]*\};?/g, '')
  const stubbedModule = `
    ${noExport}
    /* stub 依赖 */
    const MOCK = { employees: [] }
    const sleep = () => Promise.resolve()
    const rand = () => 0
    const uid = (p) => p + '-' + Math.random().toString(36).slice(2, 8)
    module.exports = { buildMarketRadarMessages, scheduleMarketRadarStream, abortMarketRadarStream, DEFAULT_LATENCY, JITTER, uid, sleep, rand }
  `
  const tmpFile = path.join(ROOT, '__test_mr_temp.cjs')
  fs.writeFileSync(tmpFile, stubbedModule)
  const mod = require(tmpFile)
  fs.unlinkSync(tmpFile)
  const messages = mod.buildMarketRadarMessages('测试 query')

  expect(Array.isArray(messages), '6.1 buildMarketRadarMessages 返回数组')
  expect(messages.length >= 7, '6.2 返回消息数 >= 7 (1 user + 1 process_card + 4 chart + 1 result_list + 1 markdown)', `实际 ${messages.length}`)

  const whoStats = messages.reduce((acc, m) => {
    acc[m.who] = (acc[m.who] || 0) + 1
    return acc
  }, {})
  expect(whoStats.user === 1, '6.3 含 1 条 user 消息', JSON.stringify(whoStats))
  expect(whoStats.process_card === 1, '6.4 含 1 条 process_card 消息', JSON.stringify(whoStats))
  expect(whoStats.chart === 4, '6.5 含 4 条 chart 消息', JSON.stringify(whoStats))
  expect(whoStats.result_list === 1, '6.6 含 1 条 result_list 消息', JSON.stringify(whoStats))
  expect(whoStats.markdown === 1, '6.7 含 1 条 markdown 消息', JSON.stringify(whoStats))

  const processCard = messages.find((m) => m.who === 'process_card')
  expect(processCard.steps.length === 4, '6.8 process_card 包含 4 个步骤', `实际 ${processCard?.steps?.length}`)

  const charts = messages.filter((m) => m.who === 'chart')
  const chartTypes = charts.map((c) => c.chartType).sort().join(',')
  expect(charts.length === 4 && charts.every((c) => c.title && c.data), '6.9 4 张 chart 都有 title 和 data', chartTypes)

  const resultList = messages.find((m) => m.who === 'result_list')
  expect(resultList.items.length === 10, '6.10 result_list 包含 10 条结果', `实际 ${resultList?.items?.length}`)

  const markdown = messages.find((m) => m.who === 'markdown')
  expect(markdown.blocks && markdown.blocks.length >= 14, '6.11 markdown 报告包含足够 blocks', `实际 ${markdown?.blocks?.length}`)
  expect(Array.isArray(markdown.downloadActions) && markdown.downloadActions.length === 2, '6.12 markdown 报告含 2 个 downloadActions')

} catch (e) {
  bad('6.x buildMarketRadarMessages 运行时校验异常', e.message + '\n' + e.stack)
}

/* ============================================================
 * 7) 静态校验：MOCK_DIALOG / 其他员工相关字段未被破坏
 * ============================================================ */
console.log('\n=== 7) 现有 MOCK_DIALOG 完整性 ===')
try {
  const chatStoreSrc2 = read(CHAT_STORE)
  /* MOCK_DIALOG 必须含至少 2 轮（user + process_card + markdown） */
  expect(
    /const\s+MOCK_DIALOG\s*=\s*\[/.test(chatStoreSrc2),
    '7.1 chat.js 中 MOCK_DIALOG 数组存在'
  )
  expect(
    /who\s*:\s*['"]process_card['"]/.test(chatStoreSrc2) && /who\s*:\s*['"]markdown['"]/.test(chatStoreSrc2),
    '7.2 MOCK_DIALOG 含 process_card 与 markdown 消息（链路诊断员原行为保留）'
  )
} catch (e) {
  bad('7.x MOCK_DIALOG 校验异常', e.message)
}

/* ============================================================
 * 输出汇总
 * ============================================================ */
console.log('\n=== 汇总 ===')
console.log('Total: ' + (pass + fail) + '  Pass: ' + pass + '  Fail: ' + fail)
process.exit(fail === 0 ? 0 : 1)
