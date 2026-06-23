// 集成测试：使用 data.js 中的真实员工数据，验证 matchFilter 命中数量
// 模拟 setup 环境和 global.window，避免浏览器依赖
global.window = global;
require('./data.js');   // data.js 使用 (function(){ ... window.OC_DATA = ... })()

// 重新实现 matchFilter (与 app.js 一致)
function matchFilter(state, item, cfg) {
  if (!state) return true;
  if (cfg.search && state.q) {
    const q = String(state.q).toLowerCase().trim();
    if (q) {
      const fields = cfg.search.fields || ['name'];
      const hay = fields.map(f => String(item[f] || '')).join(' ').toLowerCase();
      if (hay.indexOf(q) < 0) return false;
    }
  }
  let pass = true;
  (cfg.chips || []).forEach(g => {
    if (!pass) return;
    const arr = state[g.key] || [];
    if (arr.length === 0) return;
    const val = item[g.key];
    const arr2 = Array.isArray(val) ? val : (val == null ? [] : [val]);
    const any = arr2.some(v => arr.indexOf(String(v)) >= 0 || arr.indexOf(v) >= 0);
    if (!any) pass = false;
  });
  if (!pass) return false;
  (cfg.select || []).forEach(g => {
    if (!pass) return;
    const def = (g.options[0] && g.options[0].value);
    if (state[g.key] === def || state[g.key] == null) return;
    if (item[g.key] !== state[g.key]) pass = false;
  });
  if (!pass) return false;
  (cfg.date || []).forEach(g => {
    if (!pass) return;
    if (!state[g.key]) return;
    if (item[g.key] !== state[g.key]) pass = false;
  });
  return pass;
}

const D = (global.MOCK && global.MOCK) || (global.window && global.window.MOCK);
if (!D || !D.EMPLOYEES) { console.log('FAIL  data.js 未暴露 MOCK'); process.exit(1); }

const cfg = { chips: [
  { key: 'kind',  options: [{value: 'pro'}, {value: 'generic'}] },
  { key: 'flags', options: [{value: 'featured'}, {value: 'hot'}, {value: 'new'}] }
]};

const cases = [
  { name: '总员工数 = 12',              st: { kind: [], flags: [] },                     expect: 12 },
  { name: '专业员工 = 6',                st: { kind: ['pro'], flags: [] },                expect: 6 },
  { name: '通用员工 = 6',                st: { kind: ['generic'], flags: [] },            expect: 6 },
  { name: '推荐(包含 featured) = 8',   st: { kind: [], flags: ['featured'] },           expect: 8 },
  { name: '热门(包含 hot) = 5',          st: { kind: [], flags: ['hot'] },                expect: 5 },
  { name: '最近发布(包含 new) = 4',      st: { kind: [], flags: ['new'] },                expect: 4 },
  { name: '专业 + 热门 = 2',             st: { kind: ['pro'], flags: ['hot'] },           expect: 2 },
  { name: '通用 + 热门 = 3',             st: { kind: ['generic'], flags: ['hot'] },       expect: 3 },
  { name: '专业 + (推荐 OR 热门) = 5', st: { kind: ['pro'], flags: ['featured','hot'] }, expect: 5 }
];

let pass = 0, fail = 0;
for (const c of cases) {
  const got = D.EMPLOYEES.filter(e => matchFilter(c.st, e, cfg)).length;
  if (got === c.expect) { pass++; console.log('PASS  ' + c.name + '  (got=' + got + ')'); }
  else { fail++; console.log('FAIL  ' + c.name + '  expect=' + c.expect + ' got=' + got); }
}
console.log('---');
console.log('Total: ' + (pass+fail) + '  Pass: ' + pass + '  Fail: ' + fail);
process.exit(fail === 0 ? 0 : 1);
