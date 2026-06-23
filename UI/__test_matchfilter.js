// 单元测试：matchFilter (plaza 场景)
// 验证 kind/generic 命中、flags 数组命中、不匹配项被过滤
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

const cfg = { chips: [
  { key: 'kind',  options: [{value: 'pro'}, {value: 'generic'}] },
  { key: 'flags', options: [{value: 'featured'}, {value: 'hot'}, {value: 'new'}] }
]};

const tests = [
  // [name, state, item, expected]
  ['通用员工筛选命中',      { q: '', kind: ['generic'], flags: [] },                          { kind: 'generic', flags: ['hot', 'featured'] }, true],
  ['通用员工筛选未命中',    { q: '', kind: ['generic'], flags: [] },                          { kind: 'pro',     flags: ['hot'] }, false],
  ['特性=hot 命中(数组)',   { q: '', kind: ['pro'],     flags: ['hot'] },                     { kind: 'pro',     flags: ['hot', 'featured'] }, true],
  ['特性=hot 不命中(数组)', { q: '', kind: ['pro'],     flags: ['hot'] },                     { kind: 'pro',     flags: ['new'] }, false],
  ['kind+flags 组合命中',   { q: '', kind: ['generic'], flags: ['hot'] },                     { kind: 'generic', flags: ['hot'] }, true],
  ['kind+flags 组合不命中', { q: '', kind: ['generic'], flags: ['hot'] },                     { kind: 'pro',     flags: ['hot'] }, false],
  ['无筛选全部通过',        { q: '', kind: [],          flags: [] },                          { kind: 'pro',     flags: [] }, true],
  ['字符串字段单值匹配',    { q: '', kind: ['generic'], flags: [] },                          { kind: 'generic', flags: [] }, true]
];

let pass = 0, fail = 0;
for (const [name, st, item, expected] of tests) {
  const got = matchFilter(st, item, cfg);
  if (got === expected) { pass++; console.log('PASS  ' + name); }
  else { fail++; console.log('FAIL  ' + name + '  expected=' + expected + ' got=' + got); }
}
console.log('---');
console.log('Total: ' + (pass+fail) + '  Pass: ' + pass + '  Fail: ' + fail);
process.exit(fail === 0 ? 0 : 1);
