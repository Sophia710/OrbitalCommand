// 回归测试：模拟其它使用 buildFilterBar 的页面，验证 matchFilter 改动不破坏现有行为
// 测试 select / date / 搜索 / chip 单选 等场景

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

const tests = [
  // 之前 matchFilter 中的关键 bug: forEach 内的 return false 不会终止外层
  // 验证：单 chip 不匹配必须返回 false
  ['回归: 单 chip 不匹配应 false', { q: '', kind: ['generic'] }, { kind: 'pro' },
    { chips: [{ key: 'kind', options: [{value: 'pro'}, {value: 'generic'}] }] }, false],

  // select 默认值不过滤
  ['回归: select 默认值不过滤', { q: '', status: 'all' }, { status: 'pending' },
    { select: [{ key: 'status', options: [{value: 'all'}, {value: 'pending'}, {value: 'done'}] }] }, true],

  // select 非默认值过滤
  ['回归: select 非默认过滤命中', { q: '', status: 'pending' }, { status: 'pending' },
    { select: [{ key: 'status', options: [{value: 'all'}, {value: 'pending'}, {value: 'done'}] }] }, true],

  ['回归: select 非默认过滤未命中', { q: '', status: 'pending' }, { status: 'done' },
    { select: [{ key: 'status', options: [{value: 'all'}, {value: 'pending'}, {value: 'done'}] }] }, false],

  // 搜索
  ['回归: 搜索命中', { q: '报告' }, { name: '运营报告生成' },
    { search: { fields: ['name'] } }, true],

  ['回归: 搜索未命中', { q: '不存在的关键词' }, { name: '运营报告生成' },
    { search: { fields: ['name'] } }, false],

  // 多 chip group AND
  ['回归: 多 chip group AND 命中', { q: '', status: ['published'], kind: ['pro'] },
    { status: 'published', kind: 'pro' },
    { chips: [
        { key: 'status', options: [{value: 'draft'}, {value: 'published'}] },
        { key: 'kind',   options: [{value: 'pro'}, {value: 'generic'}] }
      ] }, true],

  ['回归: 多 chip group AND 任一不满足', { q: '', status: ['published'], kind: ['generic'] },
    { status: 'published', kind: 'pro' },
    { chips: [
        { key: 'status', options: [{value: 'draft'}, {value: 'published'}] },
        { key: 'kind',   options: [{value: 'pro'}, {value: 'generic'}] }
      ] }, false],

  // date
  ['回归: date 命中', { q: '', day: '2026-06-16' }, { day: '2026-06-16' },
    { date: [{ key: 'day' }] }, true],

  ['回归: date 不命中', { q: '', day: '2026-06-16' }, { day: '2026-06-15' },
    { date: [{ key: 'day' }] }, false],

  // 空 state 不过滤
  ['回归: 空 state 全部通过', {}, { anything: 'x' }, { chips: [{ key: 'kind' }] }, true],

  // null state
  ['回归: null state 全部通过', null, { x: 1 }, {}, true]
];

let pass = 0, fail = 0;
for (const [name, st, item, cfg, expected] of tests) {
  const got = matchFilter(st, item, cfg);
  if (got === expected) { pass++; console.log('PASS  ' + name); }
  else { fail++; console.log('FAIL  ' + name + '  expected=' + expected + ' got=' + got); }
}
console.log('---');
console.log('Total: ' + (pass+fail) + '  Pass: ' + pass + '  Fail: ' + fail);
process.exit(fail === 0 ? 0 : 1);
