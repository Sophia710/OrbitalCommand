/* OrbitalCommand · Application Logic */
(function () {
  'use strict';
  const D = window.MOCK;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const el = (tag, attrs, ...children) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null) continue;
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    }
    for (const c of children.flat()) {
      if (c == null) continue;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return node;
  };
  const fmt = (n) => typeof n === 'number' ? n.toLocaleString() : n;
  const SVG = (path) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">' + path + '</svg>';

  const state = { route: 'dashboard', theme: (localStorage.getItem('oc_theme') || 'dark'), chatOpen: false, charts: {} };

  function routeAlias(id) {
    return { 'dashboard': 'dashboard', 'plaza': 'plaza', 'my-employees': 'my', 'create': 'create', 'data': 'data',
             'tasks': 'tasks', 'files': 'files', 'review': 'review', 'audit': 'audit', 'settings': 'settings' }[id] || id;
  }
  function ICON(name) {
    const M = {
      home: '<path d="M3 12 12 3l9 9"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
      grid: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.4"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><path d="M14 20c0-2 2-3.5 4-3.5s4 1.5 4 3.5"/>',
      user: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>',
      plus: '<path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="9"/>',
      chart: '<path d="M3 3v18h18"/><path d="M7 14l3-3 4 4 5-7"/>',
      folder: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
      activity: '<path d="M3 12h4l3-9 4 18 3-9h4"/>',
      check: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
      shield: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
      settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.36.16.66.43.86.77s.27.71.24 1.09c.6.16 1.07.66 1.27 1.27.2.6.13 1.27-.24 1.82l-.06.06a1.65 1.65 0 0 0-.33 1.82V15z"/>',
    };
    return SVG(M[name] || '');
  }

  /* ============== SIDEBAR ============== */
  function buildSidebar() {
    const nav = $('.sidebar__nav[aria-label="主导航"]');
    const aux = $('.sidebar__nav[aria-label="管理导航"]');
    nav.innerHTML = ''; aux.innerHTML = '';
    D.NAV.filter(n => n.group === 'main').forEach(n => nav.appendChild(navItem(n)));
    D.NAV.filter(n => n.group === 'aux').forEach(n => aux.appendChild(navItem(n)));
  }
  function navItem(n) {
    const a = el('a', { class: 'nav__item', href: '#' + routeAlias(n.id), 'data-route': routeAlias(n.id) },
      el('span', { class: 'nav__icon', html: ICON(n.icon) }),
      el('span', { class: 'nav__label' }, n.label),
      n.count != null ? el('span', { class: 'nav__count' }, String(n.count)) : null);
    a.addEventListener('click', (e) => { e.preventDefault(); navigate(routeAlias(n.id)); });
    return a;
  }
  function setActiveNav() {
    $$('.nav__item').forEach(a => a.classList.toggle('is-active', a.dataset.route === state.route));
    const cur = D.NAV.find(n => routeAlias(n.id) === state.route);
    const bc = $('#breadcrumbCurrent');
    if (bc) bc.textContent = cur ? cur.label : '';
  }

  /* ============== THEME ============== */
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    try { localStorage.setItem('oc_theme', state.theme); } catch (e) {}
    // 切换过渡：临时开启全局颜色过渡 220ms
    const root = document.documentElement;
    root.classList.add('is-theme-transitioning');
    clearTimeout(applyTheme._t);
    applyTheme._t = setTimeout(() => root.classList.remove('is-theme-transitioning'), 260);
  }
  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    // 图标旋转切换动画
    const btn = $('#themeToggle');
    if (btn) {
      btn.classList.add('is-switching');
      setTimeout(() => btn.classList.remove('is-switching'), 280);
    }
    render();
  }

  /* ============== ROUTE ============== */
  function navigate(route) {
    if (state.route === route) return;
    state.route = route;
    history.replaceState(null, '', '#' + route);
    setActiveNav();
    closeChat();
    render();
  }

  function render() {
    Object.values(state.charts).forEach(c => { try { c.destroy(); } catch (e) {} });
    state.charts = {};
    const c = $('#content');
    c.innerHTML = '';
    c.classList.add('view-enter');
    setTimeout(() => c.classList.remove('view-enter'), 400);
    const map = {
      dashboard: renderDashboard, plaza: renderPlaza, my: renderMyEmployees, create: renderCreate,
      data: renderData, files: renderFiles, tasks: renderTasks, review: renderReview,
      audit: renderAudit, settings: renderSettings,
    };
    (map[state.route] || renderDashboard)(c);
  }

  /* ============== HELPERS ============== */
  function btn(label, variant, onClick, iconHtml, size) {
    const cls = ['btn', 'btn--' + (variant || 'ghost'), size].filter(Boolean).join(' ');
    const b = el('button', { class: cls, type: 'button' });
    if (iconHtml) b.insertAdjacentHTML('afterbegin', '<span class="btn__icon">' + iconHtml + '</span>');
    if (label) b.appendChild(document.createTextNode(label));
    if (onClick) b.addEventListener('click', onClick);
    return b;
  }
  function pageHead(title, desc, actions) {
    return el('div', { class: 'page-head' },
      el('div', { class: 'page-head__left' },
        el('h1', { class: 'page-head__title' }, title),
        desc ? el('p', { class: 'page-head__desc' }, desc) : null),
      actions ? el('div', { class: 'page-head__actions' }, ...actions) : null);
  }
  function panel(title, hint, actions, body) {
    return el('section', { class: 'panel' },
      el('header', { class: 'panel__head' },
        el('div', {},
          el('h3', { class: 'panel__title' }, title),
          hint ? el('p', { class: 'panel__hint' }, hint) : null),
        actions ? el('div', { class: 'panel__actions' }, ...actions) : null),
      el('div', { class: 'panel__body' }, body));
  }
  function legend(text, color) {
    return el('span', { class: 'legend', html: '<i style="background:' + color + '"></i>' + text });
  }
  function chartBase() {
    const tk = getComputedStyle(document.documentElement);
    return {
      ink: tk.getPropertyValue('--ink-2').trim(),
      ink3: tk.getPropertyValue('--ink-3').trim(),
      line: tk.getPropertyValue('--line').trim(),
      accent: tk.getPropertyValue('--accent').trim(),
    };
  }

  /* ============== TOAST / MODAL ============== */
  function toast(text, type) {
    const root = $('#toastRoot');
    const ic = type === 'info'
      ? SVG('<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>')
      : SVG('<path d="M20 6 9 17l-5-5"/>');
    const t = el('div', { class: 'toast__item' }, el('i', { html: ic }), el('span', {}, text));
    root.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(8px)'; setTimeout(() => t.remove(), 300); }, 2400);
  }
  /* ============== MODAL (enhanced lifecycle) ============== */
  const modalStack = [];   // stack of { panel, onClose, prevFocus }
  function openModal(title, body, footer, opts) {
    opts = opts || {};
    const root = $('#modalRoot');
    // Tear down any previous single-slot content safely
    root.innerHTML = '';
    const size = opts.size || 'md';        // sm | md | lg | xl | full
    const closable = opts.closable !== false;
    const prevFocus = document.activeElement;
    const backdrop = el('div', { class: 'modal__backdrop' });
    const closeBtn = el('button', { class: 'iconbtn', 'aria-label': '关闭', html: SVG('<path d="M18 6 6 18M6 6l12 12"/>'), onclick: () => closeModal() });
    const panel = el('div', { class: 'modal__panel modal__panel--' + size, role: 'dialog', 'aria-modal': 'true', tabindex: '-1' },
      el('div', { class: 'modal__head' },
        el('div', { class: 'modal__title' }, title),
        closable ? closeBtn : null),
      el('div', { class: 'modal__body' }, body),
      footer ? el('div', { class: 'modal__foot' }, ...footer) : null);
    root.appendChild(backdrop);
    root.appendChild(panel);
    root.classList.add('is-open');
    document.body.classList.add('modal-open');
    const entry = { panel, backdrop, onClose: opts.onClose, prevFocus };
    modalStack.push(entry);
    // Bind interactions
    if (closable) backdrop.addEventListener('click', closeModal);
    panel.addEventListener('keydown', trapTab);
    // Focus the first focusable element (or the panel itself)
    setTimeout(() => {
      const focusables = panel.querySelectorAll('input, select, textarea, button, [tabindex]:not([tabindex="-1"])');
      (focusables[0] || panel).focus();
    }, 30);
    return entry;
  }
  function closeModal() {
    if (!modalStack.length) return;
    const entry = modalStack.pop();
    const root = $('#modalRoot');
    // Animate out
    entry.panel.classList.add('is-leaving');
    entry.backdrop.classList.add('is-leaving');
    setTimeout(() => {
      if (modalStack.length === 0) {
        root.classList.remove('is-open');
        root.innerHTML = '';
        document.body.classList.remove('modal-open');
      } else {
        // Remove only the topmost entry
        entry.panel.remove();
        entry.backdrop.remove();
      }
      if (entry.onClose) try { entry.onClose(); } catch (e) {}
      // Restore focus
      if (entry.prevFocus && entry.prevFocus.focus) {
        try { entry.prevFocus.focus(); } catch (e) {}
      }
    }, 180);
  }
  // Keyboard: ESC closes topmost; Tab is trapped within panel
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalStack.length) { e.preventDefault(); closeModal(); }
  });
  function trapTab(e) {
    if (e.key !== 'Tab') return;
    const focusables = Array.from(e.currentTarget.querySelectorAll(
      'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    )).filter(n => n.offsetParent !== null);
    if (focusables.length === 0) { e.preventDefault(); return; }
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ============== FILTER (unified multi-condition component) ============== */
  // buildFilterBar(config) - returns { node, getState, setState, reset, refresh }
  // config:
  //   id            - string for sessionStorage key
  //   chips         - [{ key, label, options: [{value,label}] }]
  //   search        - { placeholder, fields: ['name','desc'] } (optional)
  //   select        - [{ key, label, options }] (optional)
  //   date          - [{ key, label }] (optional)
  //   onChange      - (state) => void
  function buildFilterBar(cfg) {
    cfg = cfg || {};
    const id = 'oc_filter_' + (cfg.id || 'default');
    let state = loadState(id, cfg) || defaultsFor(cfg);
    const root = el('div', { class: 'filter-bar' });
    const summary = el('div', { class: 'filter-bar__summary' });
    const chipRow = el('div', { class: 'filter-bar__chips' });
    const controls = el('div', { class: 'filter-bar__controls' });
    root.appendChild(controls);
    root.appendChild(chipRow);
    root.appendChild(summary);

    // Search
    if (cfg.search) {
      const wrap = el('div', { class: 'filter-bar__search' },
        el('span', { html: SVG('<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>') }),
        el('input', { type: 'text', placeholder: cfg.search.placeholder || '搜索…', value: state.q || '' }));
      const input = wrap.querySelector('input');
      let t = null;
      input.addEventListener('input', (e) => {
        clearTimeout(t);
        t = setTimeout(() => { state.q = e.target.value; emit(); }, 120);
      });
      controls.appendChild(wrap);
    }

    // Chip groups
    (cfg.chips || []).forEach(group => {
      const row = el('div', { class: 'filter-bar__chipgroup' },
        el('span', { class: 'filter-bar__chipprompt' }, group.label + '：'));
      const opts = group.options || [];
      opts.forEach(o => {
        const active = (state[group.key] || []).indexOf(o.value) >= 0;
        const c = el('button', { class: 'filter-chip' + (active ? ' is-active' : ''), type: 'button' }, o.label);
        c.addEventListener('click', () => {
          const arr = state[group.key] || (state[group.key] = []);
          const i = arr.indexOf(o.value);
          if (i >= 0) arr.splice(i, 1); else arr.push(o.value);
          c.classList.toggle('is-active');
          emit();
        });
        row.appendChild(c);
      });
      controls.appendChild(row);
    });

    // Selects
    (cfg.select || []).forEach(group => {
      const wrap = el('label', { class: 'filter-bar__select' },
        el('span', {}, group.label + '：'),
        (() => {
          const sel = el('select', {});
          (group.options || []).forEach(o => {
            const opt = el('option', { value: o.value }, o.label);
            if (state[group.key] === o.value) opt.setAttribute('selected', '');
            sel.appendChild(opt);
          });
          sel.addEventListener('change', () => { state[group.key] = sel.value; emit(); });
          return sel;
        })());
      controls.appendChild(wrap);
    });

    // Date inputs
    (cfg.date || []).forEach(group => {
      const wrap = el('label', { class: 'filter-bar__date' },
        el('span', {}, group.label + '：'),
        (() => {
          const inp = el('input', { type: 'date', value: state[group.key] || '' });
          inp.addEventListener('change', () => { state[group.key] = inp.value; emit(); });
          return inp;
        })());
      controls.appendChild(wrap);
    });

    // Reset
    const resetBtn = el('button', { class: 'filter-bar__reset', type: 'button', html:
      SVG('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>') + '<span>重置</span>' });
    resetBtn.addEventListener('click', () => { state = defaultsFor(cfg); refresh(); emit(true); });
    controls.appendChild(resetBtn);

    function renderChips() {
      chipRow.innerHTML = '';
      const flat = [];
      (cfg.chips || []).forEach(g => {
        (state[g.key] || []).forEach(v => {
          const opt = g.options.find(o => o.value === v);
          flat.push({ key: g.key, value: v, label: g.label + ':' + (opt ? opt.label : v) });
        });
      });
      (cfg.select || []).forEach(g => {
        if (state[g.key] && state[g.key] !== (g.options[0] && g.options[0].value)) {
          const opt = g.options.find(o => o.value === state[g.key]);
          flat.push({ key: g.key, value: state[g.key], label: g.label + ':' + (opt ? opt.label : state[g.key]) });
        }
      });
      (cfg.date || []).forEach(g => {
        if (state[g.key]) flat.push({ key: g.key, value: state[g.key], label: g.label + ':' + state[g.key] });
      });
      if (cfg.search && state.q) flat.push({ key: 'q', value: state.q, label: '关键词:' + state.q });
      flat.forEach(f => {
        const pill = el('span', { class: 'filter-pill' }, f.label,
          el('button', { class: 'filter-pill__x', 'aria-label': '移除', html: SVG('<path d="M18 6 6 18M6 6l12 12"/>') }));
        pill.querySelector('button').addEventListener('click', () => {
          if (f.key === 'q') { state.q = ''; }
          else if ((cfg.chips || []).some(c => c.key === f.key)) {
            state[f.key] = (state[f.key] || []).filter(v => v !== f.value);
          } else {
            const def = (cfg.select || []).find(s => s.key === f.key);
            state[f.key] = def && def.options[0] ? def.options[0].value : '';
          }
          refresh(); emit();
        });
        chipRow.appendChild(pill);
      });
      summary.innerHTML = '';
      const total = activeCount();
      const c = el('span', { class: 'filter-bar__count' },
        total > 0 ? '已应用 ' + total + ' 个条件' : '未应用筛选');
      summary.appendChild(c);
    }
    function activeCount() {
      let n = 0;
      (cfg.chips || []).forEach(g => { n += (state[g.key] || []).length; });
      (cfg.select || []).forEach(g => { const def = (g.options[0] && g.options[0].value); if (state[g.key] !== def) n++; });
      (cfg.date || []).forEach(g => { if (state[g.key]) n++; });
      if (cfg.search && state.q) n++;
      return n;
    }
    function refresh() {
      // Update chip active states
      $$('.filter-chip', controls).forEach(c => c.classList.remove('is-active'));
      (cfg.chips || []).forEach(g => {
        const active = new Set(state[g.key] || []);
        const idx = (g.options || []).findIndex(o => active.has(o.value));
        // Re-evaluate buttons in this group
        const row = controls.querySelectorAll('.filter-bar__chipgroup')[(cfg.chips || []).indexOf(g)];
        if (!row) return;
        Array.from(row.querySelectorAll('.filter-chip')).forEach((btn, i) => {
          const opt = g.options[i];
          if (opt && active.has(opt.value)) btn.classList.add('is-active');
        });
      });
      // Update search input
      const sin = controls.querySelector('.filter-bar__search input');
      if (sin) sin.value = state.q || '';
      // Update selects
      (cfg.select || []).forEach(g => {
        const rows = controls.querySelectorAll('.filter-bar__select select');
        // find by value
        const sels = Array.from(rows);
        // we cannot directly map, but we re-set value
        sels.forEach(s => { if (s.options[0] && s.options[0].parentElement && s.parentElement === controls) { /* noop */ } });
      });
      // Update dates
      (cfg.date || []).forEach(g => {
        const rows = controls.querySelectorAll('.filter-bar__date input[type=date]');
        rows.forEach(r => { r.value = state[g.key] || ''; });
      });
      renderChips();
    }
    function emit(resetting) {
      saveState(id, state);
      renderChips();
      if (cfg.onChange) cfg.onChange(state, !!resetting);
    }
    renderChips();
    return {
      node: root,
      getState: () => Object.assign({}, state),
      setState: (next) => { state = Object.assign({}, defaultsFor(cfg), next); refresh(); emit(); },
      reset: () => { state = defaultsFor(cfg); refresh(); emit(true); },
      refresh
    };
  }
  function defaultsFor(cfg) {
    const o = { q: '' };
    (cfg.chips || []).forEach(g => { o[g.key] = []; });
    (cfg.select || []).forEach(g => { o[g.key] = (g.options[0] && g.options[0].value) || ''; });
    (cfg.date || []).forEach(g => { o[g.key] = ''; });
    return o;
  }
  function loadState(id, cfg) {
    try {
      const raw = sessionStorage.getItem(id);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const def = defaultsFor(cfg);
      // Merge: keep only known keys
      const out = Object.assign({}, def);
      Object.keys(def).forEach(k => { if (parsed[k] !== undefined) out[k] = parsed[k]; });
      return out;
    } catch (e) { return null; }
  }
  function saveState(id, state) {
    try { sessionStorage.setItem(id, JSON.stringify(state)); } catch (e) {}
  }
  // Generic match function for filter state against an item
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

  /* Expose globals */
  window.OC = { navigate, toggleTheme, openModal, closeModal, toast, openChat, closeChat, buildFilterBar, matchFilter };

  /* ============== DASHBOARD ============== */
  function renderDashboard(root) {
    const hero = el('section', { class: 'view__hero' },
      el('div', { class: 'hero__text' },
        el('div', { class: 'hero__eyebrow' }, el('span', { class: 'hero__eyebrow-dot' }), 'OrbitalCommand · Live Status'),
        el('h2', { class: 'hero__title', html: '欢迎回来，<span class="hero__name">' + D.USER.name + '</span>' }),
        el('p', { class: 'hero__desc' }, '当前星座系统运行平稳，138 颗在轨卫星健康度 96.4%。今天有 17 条告警待处理，' +
                '1,248 个任务已完成，平均响应 4.2 分钟 — 比昨日提升 8.4%。'),
        el('div', { class: 'hero__actions' },
          btn('打开员工广场', 'primary', () => navigate('plaza'), ICON('grid')),
          btn('查看任务监控', 'ghost', () => navigate('tasks'), ICON('activity'))),
      ),
      el('div', { class: 'hero__visual' }, orbitStage()));
    root.appendChild(hero);

    const kpiRow = el('div', { class: 'kpi-row' });
    D.KPIS.forEach((k, i) => {
      kpiRow.appendChild(el('div', { class: 'kpi-card' },
        el('div', { class: 'kpi-card__head' },
          el('span', { class: 'kpi-card__label' }, k.label),
          el('span', { class: 'trend ' + (k.up ? 'trend--up' : 'trend--down') }, k.trend)),
        el('div', { class: 'kpi-card__value', html: k.value + (k.unit ? '<small>' + k.unit + '</small>' : '') }),
        el('canvas', { class: 'kpi-card__chart', 'data-kpi-chart': i, height: 36 }),
        el('div', { class: 'kpi-card__foot', html: k.desc })));
    });
    root.appendChild(kpiRow);

    const g1 = el('div', { class: 'grid-2col' });
    g1.appendChild(panel('链路流量趋势', '近 24 小时 · 单位 Gbps', null, el('canvas', { height: 240, id: 'chart-traffic' })));
    g1.appendChild(panel('波束负载', '实时波束利用率 (%)', null, el('canvas', { height: 240, id: 'chart-beam' })));
    root.appendChild(g1);

    const tasks = el('ul', { class: 'task-list' });
    D.TASKS.forEach(t => {
      const cls = t.status === 'done' ? 'is-done' : t.status === 'fail' ? 'is-fail' : '';
      tasks.appendChild(el('li', {},
        el('span', { class: 'task-list__id' }, t.id),
        el('span', { class: 'task-list__title' }, t.title),
        el('span', { class: 'task-list__meta' }, t.agent),
        el('div', { class: 'task-list__bar ' + cls }, el('span', { style: 'width:' + t.progress + '%' })),
        el('span', { class: 'task-list__meta' }, t.time)));
    });
    const alarms = el('div', { class: 'alarm-list' });
    D.ALARMS.forEach(a => {
      alarms.appendChild(el('div', { class: 'alarm-item alarm-item--' + a.sev },
        el('span', { class: 'alarm-item__sev' }, a.sev),
        el('div', { class: 'alarm-item__body' },
          el('div', { class: 'alarm-item__title' }, a.title),
          el('div', { class: 'alarm-item__meta' }, a.target)),
        el('span', { class: 'alarm-item__time' }, a.time)));
    });
    const g2 = el('div', { class: 'grid-2col' });
    g2.appendChild(panel('进行中的任务', '实时 · 自动刷新', null, tasks));
    g2.appendChild(panel('待处理告警', '高危 → 低危', null, alarms));
    root.appendChild(g2);

    const cgrid = el('div', { class: 'constellation-grid' });
    D.SAT_HEALTH.forEach(s => {
      cgrid.appendChild(el('div', { class: 'sat-cell sat-cell--' + s.state, title: s.name }, s.name));
    });
    root.appendChild(panel('星座健康度', '在轨 138 颗 · 颜色表示状态',
      [legend('正常', 'var(--ok)'), legend('告警', 'var(--warn)'), legend('严重', 'var(--danger)'), legend('失联', 'var(--ink-4)')],
      cgrid));

    const g3 = el('div', { class: 'grid-2col' });
    g3.appendChild(panel('区域接入热力', '近 7 天 · 8 大区', null,
      el('canvas', { height: 240, id: 'chart-heatmap' })));
    g3.appendChild(panel('推荐数字员工', '基于你的工作上下文', null,
      el('div', { class: 'grid-3col', style: 'gap:12px' },
        ...D.EMPLOYEES.slice(0, 3).map(e => el('div', { class: 'emp-card', style: 'padding:16px' },
          el('div', { class: 'emp-card__head' },
            el('div', { class: 'emp-card__avatar', style: '--c1:' + e.c.c1 + ';--c2:' + e.c.c2 }, e.name.slice(0, 1)),
            el('div', { class: 'emp-card__title' },
              el('div', { class: 'emp-card__name' }, e.name),
              el('div', { class: 'emp-card__role' }, e.role))),
          el('div', { class: 'emp-card__actions' },
            btn('立即对话', 'primary', function () { openChat(e); })))))));
    root.appendChild(g3);

    setTimeout(() => {
      initKpiSparklines();
      initChartTraffic();
      initChartBeam();
      initChartHeatmap();
    }, 0);
  }

  function orbitStage() {
    const stage = el('div', { class: 'orbit-stage' });
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 400 400');
    svg.classList.add('orbit-stage__svg');
    [120, 160, 200].forEach((r, i) => {
      const e = document.createElementNS(svgNS, 'ellipse');
      e.setAttribute('cx', 200); e.setAttribute('cy', 200);
      e.setAttribute('rx', r); e.setAttribute('ry', r * 0.6);
      e.setAttribute('fill', 'none');
      e.setAttribute('stroke', 'var(--accent)');
      e.setAttribute('stroke-width', '0.8');
      e.setAttribute('opacity', 0.25);
      e.setAttribute('transform', 'rotate(' + (i * 30) + ' 200 200)');
      svg.appendChild(e);
    });
    for (let i = 0; i < 3; i++) {
      const c = document.createElementNS(svgNS, 'circle');
      c.setAttribute('cx', 200); c.setAttribute('cy', 200);
      c.setAttribute('r', 40);
      c.setAttribute('class', 'orbit-pulse');
      c.style.animationDelay = (i * 1) + 's';
      svg.appendChild(c);
    }
    const core = document.createElementNS(svgNS, 'circle');
    core.setAttribute('cx', 200); core.setAttribute('cy', 200);
    core.setAttribute('r', 16);
    core.setAttribute('class', 'orbit-core');
    svg.appendChild(core);
    stage.appendChild(svg);
    const sats = [
      { label: 'GW-03', x: 304, y: 230 },
      { label: 'TC-02', x: 60,  y: 165 },
      { label: 'B-12',  x: 132, y: 110 },
      { label: 'S-073', x: 280, y: 70 },
    ];
    sats.forEach((s, i) => {
      stage.appendChild(el('div', { class: 'sat-pin', style: '--x:' + s.x + 'px;--y:' + s.y + 'px;--d:' + (i * 0.8) + 's' },
        el('i'), s.label));
    });
    return stage;
  }

  function initKpiSparklines() {
    $$('[data-kpi-chart]').forEach((cv, i) => {
      const k = D.KPIS[i];
      const { accent } = chartBase();
      const g = (ctx) => { const g = ctx.createLinearGradient(0, 0, 0, 40); g.addColorStop(0, accent + '88'); g.addColorStop(1, accent + '00'); return g; };
      state.charts['kpi-' + i] = new Chart(cv, {
        type: 'line',
        data: { labels: k.series.map((_, i) => i),
          datasets: [{ data: k.series, borderColor: accent, backgroundColor: g(cv.getContext('2d')), fill: true, tension: 0.4, borderWidth: 1.5, pointRadius: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } },
      });
    });
  }
  function initChartTraffic() {
    const cv = $('#chart-traffic'); if (!cv) return;
    const { ink, line } = chartBase();
    state.charts.traffic = new Chart(cv, {
      type: 'line',
      data: { labels: Array.from({ length: 24 }, (_, i) => i + 'h'),
        datasets: D.LINES.map(l => ({ label: l.name, data: l.data, borderColor: l.color, backgroundColor: l.color + '22', tension: 0.4, borderWidth: 1.6, fill: true, pointRadius: 0 })) },
      options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
        plugins: { legend: { labels: { color: ink, font: { family: 'JetBrains Mono', size: 11 } } }, tooltip: { backgroundColor: '#0b0d18cc', borderColor: line, borderWidth: 1 } },
        scales: { x: { ticks: { color: ink, font: { family: 'JetBrains Mono', size: 10 } }, grid: { color: line + '55' } }, y: { ticks: { color: ink, font: { family: 'JetBrains Mono', size: 10 } }, grid: { color: line + '55' } } } },
    });
  }
  function initChartBeam() {
    const cv = $('#chart-beam'); if (!cv) return;
    const { ink, line, accent } = chartBase();
    state.charts.beam = new Chart(cv, {
      type: 'bar',
      data: { labels: D.BEAM_LABELS,
        datasets: [{ label: '波束利用率 (%)', data: D.BEAM_LOAD,
          backgroundColor: D.BEAM_LOAD.map(v => v > 80 ? '#f43f5e' : v > 60 ? '#fbbf24' : accent),
          borderRadius: 4, borderSkipped: false }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: { x: { ticks: { color: ink, font: { family: 'JetBrains Mono', size: 10 } }, grid: { display: false } }, y: { max: 100, ticks: { color: ink, font: { family: 'JetBrains Mono', size: 10 }, callback: v => v + '%' }, grid: { color: line + '55' } } } },
    });
  }
  function initChartHeatmap() {
    const cv = $('#chart-heatmap'); if (!cv) return;
    const { ink, line } = chartBase();
    const h = D.HEATMAP;
    const data = [];
    h.days.forEach((d, di) => h.regions.forEach((r, ri) => data.push({ x: d, y: r, v: h.data[di][ri] })));
    if (!Chart.controllers.matrix) {
      state.charts.heat = new Chart(cv, {
        type: 'bar',
        data: { labels: h.regions, datasets: h.days.map((d, i) => ({ label: d, data: h.data[i], backgroundColor: '#8b5cf6' + '66' })) },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: ink } } }, scales: { x: { ticks: { color: ink } }, y: { ticks: { color: ink } } } },
      });
      return;
    }
    state.charts.heat = new Chart(cv, {
      type: 'matrix',
      data: { datasets: [{ label: '接入强度', data,
        backgroundColor(c) { const v = c.dataset.data[c.dataIndex].v; const a = Math.min(1, v / 100); return 'rgba(139, 92, 246, ' + (0.15 + a * 0.75) + ')'; },
        borderColor: 'rgba(255,255,255,0.05)', borderWidth: 1,
        width: ({ chart }) => (chart.chartArea && chart.chartArea.width / h.days.length) - 2,
        height: ({ chart }) => (chart.chartArea && chart.chartArea.height / h.regions.length) - 2,
      }] },
      options: { responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false },
          tooltip: { backgroundColor: '#0b0d18cc', borderColor: line, borderWidth: 1,
            callbacks: { title: (it) => it[0].raw.x, label: (it) => it.raw.y + ' · ' + it.raw.v } } },
        scales: { x: { type: 'category', labels: h.days, ticks: { color: ink, font: { family: 'JetBrains Mono', size: 10 } }, grid: { display: false } },
                  y: { type: 'category', labels: h.regions, offset: true, ticks: { color: ink, font: { family: 'JetBrains Mono', size: 10 } }, grid: { display: false } } } },
    });
  }

  /* ============== PLAZA ============== */
  function renderPlaza(root) {
    const heroes = el('section', { class: 'plaza-hero' },
      el('div', { class: 'plaza-hero__text' },
        el('h3', {}, '员工广场 · 探索与订阅数字员工'),
        el('p', {}, '面向卫星互联网场景的专业与通用数字员工，覆盖链路诊断、干扰分析、载荷健康、报告生成、数据分析等领域。订阅后可加入我的员工，与团队共享使用。'),
        el('div', { class: 'plaza-hero__stats' },
          el('div', {}, el('b', {}, '48'), el('span', {}, '在岗员工')),
          el('div', {}, el('b', {}, '6'),  el('span', {}, '领域覆盖')),
          el('div', {}, el('b', {}, '12.8k'), el('span', {}, '本月调用'))),
      el('div', { class: 'plaza-hero__art' },
        el('div', { class: 'floating-cards' },
          el('div', { class: 'float-card float-card--1' }, '🛰️ 链路诊断员'),
          el('div', { class: 'float-card float-card--2' }, '📡 干扰分析员'),
          el('div', { class: 'float-card float-card--3' }, '📊 报告生成员'),
          el('div', { class: 'float-card float-card--4' }, '🧠 知识助理')))));

    const grid = el('div', { class: 'plaza-grid' });
    const empty = el('div', { class: 'plaza-empty', style: 'display:none' },
      el('div', { class: 'plaza-empty__icon', html: SVG('<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>') }),
      el('h4', {}, '没有匹配的员工'),
      el('p', {}, '尝试调整筛选条件或重置搜索'));
    const renderGrid = function (state) {
      grid.innerHTML = '';
      let visible = 0;
      D.EMPLOYEES.forEach(e => {
        if (matchFilter(state, e, plazaCfg)) {
          grid.appendChild(buildEmpCard(e));
          visible++;
        }
      });
      empty.style.display = visible === 0 ? 'flex' : 'none';
    };
    const plazaCfg = {
      id: 'plaza',
      search: { placeholder: '搜索员工名称、能力或关键词…', fields: ['name', 'role', 'desc', 'tags'] },
      chips: [
        { key: 'kind', label: '类型', options: [
          { value: 'pro', label: '专业员工' },
          { value: 'generic', label: '通用员工' }
        ]},
        { key: 'domain', label: '领域', options: [
          { value: 'terminal',  label: '终端' },
          { value: 'link',      label: '星地链路' },
          { value: 'payload',   label: '载荷' },
          { value: 'full-link', label: '全链路' }
        ]},
        { key: 'flags', label: '特性', options: [
          { value: 'featured', label: '推荐' },
          { value: 'new', label: '最近发布' },
          { value: 'hot', label: '热门' }
        ]}
      ]
    };
    const filter = buildFilterBar(Object.assign({}, plazaCfg, { onChange: renderGrid }));
    renderGrid(filter.getState());

    root.appendChild(heroes);
    root.appendChild(filter.node);
    root.appendChild(grid);
    root.appendChild(empty);
  }
  function buildEmpCard(e) {
    return el('article', { class: 'emp-card' },
      el('div', { class: 'emp-card__head' },
        el('div', { class: 'emp-card__avatar', style: `--c1:${e.c.c1};--c2:${e.c.c2}` }, e.name.slice(0, 1)),
        el('div', { class: 'emp-card__title' },
          el('div', { class: 'emp-card__name' }, e.name),
          el('div', { class: 'emp-card__role' }, e.role)),
        el('span', { class: 'emp-card__tag' + (e.kind === 'generic' ? ' emp-card__tag--generic' : '') }, e.kind === 'pro' ? '专业员工' : '通用员工')),
      el('p', { class: 'emp-card__desc' }, e.desc),
      el('div', { class: 'emp-card__capabilities' },
        ...e.caps.map(c => el('span', { class: 'emp-card__cap' }, c))),
      el('div', { class: 'emp-card__meta' },
        el('span', { html: '<b>' + e.users.toLocaleString() + '</b> 用户 · <b>' + e.calls + '</b> 调用' }),
        el('span', { class: 'emp-card__rating', html: '<i>★</i> ' + e.rating })),
      el('div', { class: 'emp-card__actions' },
        btn('立即对话', 'primary', () => openChat(e), ICON('user')),
        btn('订阅', 'ghost', () => toast('已订阅：' + e.name, 'info'), ICON('plus'))));
  }

  /* ============== MY EMPLOYEES ============== */
  function renderMyEmployees(root) {
    root.appendChild(pageHead('我的员工', '管理你创建或订阅的数字员工 · ' + D.MY_EMPLOYEES.length + ' 位',
      [btn('创建员工', 'primary', () => navigate('create'), ICON('plus')), btn('导入配置', 'ghost', null, ICON('plus'))]));

    const tabs = el('div', { class: 'my-tabs' },
      el('button', { class: 'my-tab is-active' }, '全部', el('span', {}, String(D.MY_EMPLOYEES.length))),
      el('button', { class: 'my-tab' }, '我创建的', el('span', {}, String(D.MY_EMPLOYEES.filter(m => m.kind === 'mine').length))),
      el('button', { class: 'my-tab' }, '我订阅的', el('span', {}, String(D.MY_EMPLOYEES.filter(m => m.kind === 'subscribed').length))));
    root.appendChild(tabs);

    const grid = el('div', { class: 'my-grid' });
    const empty = el('div', { class: 'plaza-empty', style: 'display:none' },
      el('div', { class: 'plaza-empty__icon', html: SVG('<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>') }),
      el('h4', {}, '没有匹配的员工'),
      el('p', {}, '尝试调整筛选条件或重置搜索'));
    const myCfg = {
      id: 'my',
      search: { placeholder: '搜索员工名称或最近任务…', fields: ['name', 'last'] },
      chips: [
        { key: 'kind', label: '类型', options: [
          { value: 'mine', label: '我创建' },
          { value: 'subscribed', label: '我订阅' }
        ]}
      ]
    };
    const renderMyGrid = function (state) {
      grid.innerHTML = '';
      let visible = 0;
      D.MY_EMPLOYEES.forEach(m => {
        if (matchFilter(state, m, myCfg)) {
          grid.appendChild(el('article', { class: 'my-emp-card', style: `--c1:${m.c.c1};--c2:${m.c.c2}` },
            el('div', { class: 'my-emp-card__head' },
              el('div', { class: 'emp-card__avatar', style: `--c1:${m.c.c1};--c2:${m.c.c2}` }, m.name.slice(-2, -1)),
              el('div', { class: 'my-emp-card__title', style: 'flex:1' },
                el('div', { class: 'my-emp-card__name' }, m.name),
                el('div', { class: 'my-emp-card__role' }, m.kind === 'mine' ? '我创建 · 1.2.0' : '我订阅 · 官方'))),
            el('div', { class: 'my-emp-card__body' },
              el('div', { class: 'my-emp-card__last' }, el('b', {}, '最近：'), m.last),
              el('div', { class: 'my-emp-card__stats' },
                el('div', { class: 'my-emp-card__stat' }, el('b', {}, String(m.calls)), el('span', {}, '调用次数')),
                el('div', { class: 'my-emp-card__stat' }, el('b', {}, String(m.doc)),  el('span', {}, '知识库')),
                el('div', { class: 'my-emp-card__stat' }, el('b', {}, m.rating.toFixed(1)), el('span', {}, '评分'))),
              el('div', { class: 'my-emp-card__actions' },
                btn('开始对话', 'primary', () => openChat({ name: m.name, c: m.c }), ICON('user')),
                btn('编辑', 'ghost', null, ICON('settings'))))));
          visible++;
        }
      });
      empty.style.display = visible === 0 ? 'flex' : 'none';
    };
    const filter = buildFilterBar(Object.assign({}, myCfg, { onChange: renderMyGrid }));
    renderMyGrid(filter.getState());
    root.appendChild(filter.node);
    root.appendChild(grid);
    root.appendChild(empty);
  }

  /* ============== CREATE EMPLOYEE ============== */
  // PRD §6.2.4：智能体配置页 = 顶部预览 + 左侧表单（基础属性 / 智能体配置 / 高级参数） + 右侧实时对话样例
  function renderCreate(root) {
    // ===== 顶部预览条 =====
    const head = el('div', { class: 'create-header' },
      el('div', { class: 'create-header__left' },
        el('div', { class: 'create-header__logo' }, '链'),
        el('div', {},
          el('div', { class: 'create-header__name' }, '链路健康巡检员（草稿）'),
          el('div', { class: 'create-header__sub' },
            el('span', { class: 'chip chip--ok' }, '草稿'),
            el('span', {}, 'L4 · 高度自主'),
            el('span', {}, '信关站 · 链路方向'),
            el('span', {}, '最近编辑：刚刚')))),
      el('div', { class: 'create-header__actions' },
        btn('保存草稿', 'ghost', () => toast('已保存草稿', 'info'), ICON('folder')),
        btn('试运行', 'ghost', () => toast('已启动试运行（示例）', 'info'), ICON('activity')),
        btn('保存', 'primary', () => toast('配置已保存', 'info'), ICON('check')),
        btn('发布到广场', 'primary', () => toast('已提交发布审核', 'info'), ICON('send'))));

    // ===== 工作区 =====
    const ws = el('div', { class: 'create-ws' });
    const formCol = el('div', { class: 'create-form-col' });
    const previewCol = el('div', { class: 'create-preview-col' });

    // ----- 左：基础属性 -----
    formCol.appendChild(buildFormCard('基础属性', null,
      el('div', { class: 'form-grid' },
        el('div', { class: 'field' }, el('span', {}, '员工名称'),
          el('input', { value: '链路健康巡检员' })),
        el('div', { class: 'field' }, el('span', {}, '领域'),
          el('select', {}, el('option', {}, '终端'), el('option', { selected: '' }, '星地链路'), el('option', {}, '载荷'), el('option', {}, '全链路'))),
        el('div', { class: 'field' }, el('span', {}, '可见范围'),
          el('select', {}, el('option', { selected: '' }, '团队内部'), el('option', {}, '全员可见'), el('option', {}, '仅自己'))),
        el('div', { class: 'field field--full' }, el('span', {}, '简介'),
          el('textarea', { rows: 2 }, '面向信关站链路的自动巡检与异常识别，覆盖指标采集、根因定位、处置建议生成。')),
        el('div', { class: 'field field--full' }, el('span', {}, '标签'),
          el('div', { class: 'tag-input' },
            el('span', { class: 'tag' }, '链路诊断', el('i', {}, '×')),
            el('span', { class: 'tag' }, '信关站', el('i', {}, '×')),
            el('span', { class: 'tag' }, '巡检', el('i', {}, '×')),
            el('input', { placeholder: '+ 添加标签' }))))));

    // ----- 左：智能体配置 -----
    formCol.appendChild(buildFormCard('智能体配置', '选择底层模型与推理能力',
      el('div', { class: 'form-grid' },
        el('div', { class: 'field' }, el('span', {}, '模型'),
          el('select', {}, el('option', {}, 'Qwen2.5-72B'), el('option', { selected: '' }, 'DeepSeek-V3'), el('option', {}, 'Llama-3.3-70B'))),
        el('div', { class: 'field' }, el('span', {}, '自主级别'),
          el('select', {}, el('option', {}, 'L1 · 辅助执行'), el('option', {}, 'L2 · 半自主执行'), el('option', {}, 'L3 · 条件自主'), el('option', { selected: '' }, 'L4 · 高度自主'))),
        el('div', { class: 'field' }, el('span', {}, '白盒推理'),
          el('select', {}, el('option', { selected: '' }, '开启 · 展示推理步骤'), el('option', {}, '关闭'))),
        el('div', { class: 'field' }, el('span', {}, '多轮记忆'),
          el('select', {}, el('option', { selected: '' }, '开启 · 持久化'), el('option', {}, '会话级'))),
        el('div', { class: 'field field--full' }, el('span', {}, '系统提示词 (System Prompt)'),
          el('textarea', { rows: 4 }, '你是「链路健康巡检员」，负责信关站链路的自动巡检与异常识别。请使用简明专业的中文回答，所有指标与判断需引用具体来源。')),
        el('div', { class: 'field' }, el('span', {}, '人工兜底'),
          el('select', {}, el('option', { selected: '' }, '高风险操作需人工审核'), el('option', {}, '低风险自动执行'))))));

    // ----- 左：高级参数 -----
    formCol.appendChild(buildFormCard('高级参数', '微调推理质量与吞吐',
      el('div', { class: 'form-grid' },
        el('div', { class: 'field' }, el('span', {}, 'Temperature'), el('input', { value: '0.3' })),
        el('div', { class: 'field' }, el('span', {}, 'Top-P'), el('input', { value: '0.9' })),
        el('div', { class: 'field' }, el('span', {}, '最大 Tokens'), el('input', { value: '8192' })),
        el('div', { class: 'field' }, el('span', {}, '超时（秒）'), el('input', { value: '60' })),
        el('div', { class: 'field' }, el('span', {}, '并发上限'), el('input', { value: '8' })),
        el('div', { class: 'field' }, el('span', {}, '知识库召回 Top-K'), el('input', { value: '5' })))));

    // ----- 左：关联资产 -----
    formCol.appendChild(buildFormCard('关联资产', '挂载本员工可调用的 Skill 与知识库',
      el('div', { class: 'asset-list' },
        el('div', { class: 'asset-row' },
          el('div', {}, el('div', { class: 'asset-row__title' }, '查询链路指标'), el('div', { class: 'asset-row__desc' }, 'API · 信关站 GW-03 北向接口')),
          el('span', { class: 'chip chip--ok' }, '已挂载')),
        el('div', { class: 'asset-row' },
          el('div', {}, el('div', { class: 'asset-row__title' }, '生成诊断报告'), el('div', { class: 'asset-row__desc' }, 'Skill · 输出结构化报告')),
          el('span', { class: 'chip chip--ok' }, '已挂载')),
        el('div', { class: 'asset-row' },
          el('div', {}, el('div', { class: 'asset-row__title' }, '链路指标库'), el('div', { class: 'asset-row__desc' }, '知识库 · 128 份文档')),
          el('span', { class: 'chip chip--ok' }, '已挂载')),
        el('button', { class: 'link-btn' }, '+ 关联 Skill / 知识库'))));

    // ----- 右：实时对话样例预览 -----
    const chatPreview = el('div', { class: 'create-chat' },
      el('div', { class: 'create-chat__head' },
        el('div', { class: 'create-chat__agent' },
          el('div', { class: 'create-chat__avatar' }, '链'),
          el('div', {},
            el('div', { class: 'create-chat__name' }, '链路健康巡检员'),
            el('div', { class: 'create-chat__status' }, '● 模拟会话 · L4 自主'))),
        el('button', { class: 'iconbtn', 'aria-label': '重置', html: SVG('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'), onclick: () => renderPreview() })),
      el('div', { class: 'create-chat__body', id: 'createChatBody' },
        el('div', { class: 'create-chat__msg create-chat__msg--user' }, '请对信关站 GW-03 的北向接口做一次健康巡检。'),
        el('div', { class: 'create-chat__msg create-chat__msg--agent' },
          el('div', {}, '好的，我正在拉取 GW-03 北向接口最近 24h 的指标。'),
          el('ol', { class: 'create-chat__steps' },
            el('li', {}, '采集：丢包率 0.04%、时延均值 38ms、抖动 4ms'),
            el('li', {}, '对比：与近 7 日基线持平，无显著劣化'),
            el('li', {}, '判断：当前状态健康，无异常需处置')))),
      el('div', { class: 'create-chat__input' },
        el('input', { placeholder: '输入指令模拟一次调用…' }),
        el('button', { class: 'btn btn--primary' }, '发送')));
    function renderPreview() {
      const body = $('#createChatBody');
      if (body) body.innerHTML = '<div class="create-chat__msg create-chat__msg--user">请对信关站 GW-03 的北向接口做一次健康巡检。</div>' +
        '<div class="create-chat__msg create-chat__msg--agent"><div>好的，我正在拉取 GW-03 北向接口最近 24h 的指标。</div>' +
        '<ol class="create-chat__steps"><li>采集：丢包率 0.04%、时延均值 38ms、抖动 4ms</li>' +
        '<li>对比：与近 7 日基线持平，无显著劣化</li><li>判断：当前状态健康，无异常需处置</li></ol></div>';
    }
    previewCol.appendChild(chatPreview);
    previewCol.appendChild(el('div', { class: 'create-preview__hint' },
      el('div', { class: 'create-preview__hint-title' }, '实时预览说明'),
      el('ul', {},
        el('li', {}, '右侧基于当前模型 / 提示词 / 知识库配置，模拟一次真实调用样例'),
        el('li', {}, '调整左侧表单可即时看到推理步骤与输出风格变化'),
        el('li', {}, '完整工作流编排请在「工作流画布」中配置（高级模式）'))));

    ws.appendChild(formCol); ws.appendChild(previewCol);
    root.appendChild(head);
    root.appendChild(ws);
  }

  // 通用：表单卡片容器
  function buildFormCard(title, sub, body) {
    return el('section', { class: 'form-card' },
      el('div', { class: 'form-card__head' },
        el('h4', {}, title),
        sub ? el('span', { class: 'form-card__sub' }, sub) : null),
      body);
  }

  function paneBasic(p) {
    const body = el('div', { class: 'create-pane__body' });
    const card1 = el('section', { class: 'form-card' },
      el('h4', {}, '基础信息'),
      el('div', { class: 'form-grid' },
        el('div', { class: 'field' }, el('span', {}, '员工名称 *'), el('input', { value: '链路健康巡检员 · 信关站方向', placeholder: '请输入员工名称' })),
        el('div', { class: 'field' }, el('span', {}, '员工类型'), el('select', {}, el('option', {}, '专业员工'), el('option', {}, '通用员工'))),
        el('div', { class: 'field field--full' }, el('span', {}, '一句话描述'), el('input', { value: '面向信关站链路，自动采集关键指标、识别异常并生成处置建议' })),
        el('div', { class: 'field field--full' }, el('span', {}, '详细说明'), el('textarea', { rows: 3 }, '支持 GW-01 ~ GW-04 的实时接入，可配置巡检策略、告警阈值与升级策略。'))));
    const card2 = el('section', { class: 'form-card' },
      el('h4', {}, '标签与归属'),
      el('div', { class: 'form-grid' },
        el('div', { class: 'field' }, el('span', {}, '领域标签'),
          el('div', { class: 'tag-input' }, el('span', { class: 'tag' }, '链路诊断', el('i', {}, '×')), el('span', { class: 'tag' }, '信关站', el('i', {}, '×')), el('span', { class: 'tag' }, '巡检', el('i', {}, '×')), el('input', { placeholder: '+ 添加标签' }))),
        el('div', { class: 'field' }, el('span', {}, '所属团队'), el('select', {}, el('option', {}, '运控中心'), el('option', {}, '网络运维组'))),
        el('div', { class: 'field' }, el('span', {}, '可见范围'), el('select', {}, el('option', {}, '团队内部'), el('option', {}, '全员可见'), el('option', {}, '仅自己')))));
    const card3 = el('section', { class: 'form-card' },
      el('h4', {}, '头像与视觉'),
      el('div', { class: 'form-grid' },
        el('div', { class: 'field' }, el('span', {}, '头像'),
          el('div', { class: 'avatar-field' },
            el('div', { class: 'avatar-field__preview' }, '链'),
            el('span', { class: 'avatar-field__hint' }, '默认采用系统统一品牌主色（紫罗兰），仅展示员工名首字。后续开放自定义头像后将在此上传。')))));
    body.appendChild(card1); body.appendChild(card2); body.appendChild(card3);
    p.appendChild(body);
  }

  function paneAgent(p) {
    const body = el('div', { class: 'create-pane__body' });
    body.appendChild(el('section', { class: 'form-card' },
      el('h4', {}, '模型与推理'),
      el('div', { class: 'form-grid' },
        el('div', { class: 'field' }, el('span', {}, '基础模型'), el('select', {}, el('option', {}, 'Qwen 2.5 72B (开源 · 本地化)'), el('option', {}, 'DeepSeek V3'), el('option', {}, 'GLM-4'))),
        el('div', { class: 'field' }, el('span', {}, '温度 (Temperature)'), el('input', { type: 'range', class: 'slider', min: '0', max: '20', value: '7' })),
        el('div', { class: 'field' }, el('span', {}, '最大 Tokens'), el('input', { value: '8192' })),
        el('div', { class: 'field' }, el('span', {}, 'Top-P'), el('input', { value: '0.9' })),
        el('div', { class: 'field field--full' }, el('span', {}, '系统提示词 (System Prompt)'),
          el('textarea', { rows: 5 }, '你是「链路健康巡检员」，负责信关站链路的自动巡检与异常识别。请使用简明专业的中文回答，所有指标与判断需引用具体来源。')))));
    body.appendChild(el('section', { class: 'form-card' },
      el('h4', {}, '自主能力'),
      el('div', { class: 'form-grid' },
        el('div', { class: 'field' }, el('span', {}, '自主级别'),
          el('select', {}, el('option', {}, 'L1 · 辅助执行'), el('option', {}, 'L2 · 半自主执行'), el('option', {}, 'L3 · 条件自主'), el('option', { selected: '' }, 'L4 · 高度自主'))),
        el('div', { class: 'field' }, el('span', {}, '白盒推理'), el('select', {}, el('option', { selected: '' }, '开启 · 展示推理步骤'), el('option', {}, '关闭'))),
        el('div', { class: 'field' }, el('span', {}, '多轮记忆'), el('select', {}, el('option', { selected: '' }, '开启 · 持久化'), el('option', {}, '会话级'))),
        el('div', { class: 'field' }, el('span', {}, '人工兜底'), el('select', {}, el('option', { selected: '' }, '高风险操作需人工审核'), el('option', {}, '低风险自动执行'))))));
    p.appendChild(body);
  }

  function paneSkills(p) {
    const body = el('div', { class: 'create-pane__body' });
    const grid = el('div', { class: 'skills-grid' });
    const counter = el('div', { class: 'skills-toolbar' });
    const skillCfg = {
      id: 'skills',
      search: { placeholder: '搜索技能名称或描述…', fields: ['name', 'desc'] },
      chips: [
        { key: 'group', label: '分组', options: [
          { value: 'core', label: '核心' },
          { value: 'domain', label: '领域' },
          { value: 'tool', label: '工具' }
        ]},
        { key: 'on', label: '状态', options: [
          { value: 'true', label: '已启用' },
          { value: 'false', label: '未启用' }
        ]}
      ]
    };
    const renderGrid = function (state) {
      grid.innerHTML = '';
      let visible = 0, enabled = 0;
      D.SKILLS.forEach(s => {
        // Map boolean to string for filter
        const item = Object.assign({}, s, { on: s.on ? 'true' : 'false' });
        if (matchFilter(state, item, skillCfg)) {
          grid.appendChild(el('article', { class: 'skill-card' + (s.on ? ' is-on' : '') },
            el('div', { class: 'skill-card__head' },
              el('div', { class: 'skill-card__icon' }, s.icon),
              el('div', { class: 'skill-card__toggle' })),
            el('div', { class: 'skill-card__name' }, s.name),
            el('div', { class: 'skill-card__desc' }, s.desc),
            el('div', { class: 'skill-card__foot' },
              el('span', {}, '分组：' + s.group),
              el('span', {}, '调用：' + s.calls))));
          visible++;
          if (s.on) enabled++;
        }
      });
      counter.innerHTML = '';
      counter.appendChild(el('div', { class: 'skills-filter' },
        el('span', { html: '共 <b style="color:var(--ink);margin:0 4px">' + visible + '</b> 个技能 · 已启用 <b style="color:var(--ok);margin:0 4px">' + enabled + '</b> 个' })));
    };
    const filter = buildFilterBar(Object.assign({}, skillCfg, { onChange: renderGrid }));
    body.appendChild(filter.node);
    body.appendChild(counter);
    body.appendChild(grid);
    renderGrid(filter.getState());
    p.appendChild(body);
  }

  function paneCanvas(p) {
    const body = el('div', { class: 'create-pane__body' });
    body.appendChild(el('div', { class: 'canvas-toolbar' },
      el('div', { class: 'canvas-toolbar__left' },
        el('div', { class: 'canvas-title' }, '工作流：链路异常诊断'),
        el('span', { class: 'canvas-divider' }),
        el('button', { class: 'link-btn' }, '+ 新建节点')),
      el('div', { class: 'canvas-toolbar__right' },
        btn('试运行', 'ghost', null, ICON('activity')),
        btn('保存', 'primary', () => toast('工作流已保存', 'info'), ICON('check')))));

    const stage = el('div', { class: 'canvas-stage' });
    const palette = el('aside', { class: 'canvas-nodes' },
      el('h6', {}, '节点面板'),
      el('div', { class: 'palette-group' },
        el('span', { class: 'palette-group__label' }, '触发器'),
        el('button', { class: 'palette-node', html: '<i style="--c:#8b5cf6">⚡</i> 触发器' }),
        el('button', { class: 'palette-node', html: '<i style="--c:#22d3ee">⏰</i> 定时' }),
        el('button', { class: 'palette-node', html: '<i style="--c:#10b981">📥</i> 事件监听' })),
      el('div', { class: 'palette-group' },
        el('span', { class: 'palette-group__label' }, 'AI 能力'),
        el('button', { class: 'palette-node', html: '<i style="--c:#a78bfa">🧠</i> LLM 推理' }),
        el('button', { class: 'palette-node', html: '<i style="--c:#22d3ee">📚</i> 知识库' }),
        el('button', { class: 'palette-node', html: '<i style="--c:#fbbf24">🔀</i> 条件路由' })),
      el('div', { class: 'palette-group' },
        el('span', { class: 'palette-group__label' }, '工具与执行'),
        el('button', { class: 'palette-node', html: '<i style="--c:#34d399">⚙️</i> 调用 Skill' }),
        el('button', { class: 'palette-node', html: '<i style="--c:#f87171">👤</i> 人工审核' }),
        el('button', { class: 'palette-node', html: '<i style="--c:#06b6d4">📤</i> 消息回复' })));

    const board = el('div', { class: 'canvas-board' });
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 940 540');
    svg.classList.add('canvas-svg');
    // dot grid
    for (let x = 0; x < 940; x += 28) for (let y = 0; y < 540; y += 28) {
      const d = document.createElementNS(svgNS, 'circle');
      d.setAttribute('cx', x); d.setAttribute('cy', y); d.setAttribute('r', 1); d.classList.add('dotgrid-dot');
      svg.appendChild(d);
    }
    // edges
    D.CANVAS_EDGES.forEach(e => {
      const from = D.CANVAS_NODES.find(n => n.id === e.from), to = D.CANVAS_NODES.find(n => n.id === e.to);
      if (!from || !to) return;
      const l = document.createElementNS(svgNS, 'path');
      const x1 = from.x + 140, y1 = from.y + 28, x2 = to.x, y2 = to.y + 28;
      const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2 - 40;
      l.setAttribute('d', 'M ' + x1 + ' ' + y1 + ' C ' + cx + ' ' + y1 + ', ' + cx + ' ' + y2 + ', ' + x2 + ' ' + y2);
      l.classList.add('canvas-edge');
      svg.appendChild(l);
    });
    board.appendChild(svg);
    const nodeEls = {};
    D.CANVAS_NODES.forEach(n => {
      const node = el('div', { class: 'canvas-node canvas-node--' + n.kind, style: 'left:' + n.x + 'px;top:' + n.y + 'px', 'data-nid': n.id },
        el('div', { class: 'canvas-node__icon' }, n.icon),
        el('div', {},
          el('div', { class: 'canvas-node__title' }, n.title),
          el('div', { class: 'canvas-node__desc' }, n.desc)));
      node.addEventListener('click', () => selectNode(n.id));
      nodeEls[n.id] = node;
      board.appendChild(node);
    });
    stage.appendChild(palette); stage.appendChild(board);

    // 右侧属性面板
    const inspector = el('aside', { class: 'canvas-inspector' });
    function selectNode(nid) {
      Object.values(nodeEls).forEach(el => el.classList.remove('is-selected'));
      const target = nodeEls[nid]; if (target) target.classList.add('is-selected');
      const n = D.CANVAS_NODES.find(x => x.id === nid);
      if (!n) return;
      inspector.innerHTML = '';
      inspector.appendChild(el('div', { class: 'inspector__head' },
        el('div', { class: 'inspector__head-left' },
          el('div', { class: 'inspector__icon canvas-node--' + n.kind }, n.icon),
          el('div', {},
            el('div', { class: 'inspector__title' }, n.title),
            el('div', { class: 'inspector__kind' }, kindLabel(n.kind)))),
        el('div', { class: 'inspector__id' }, 'ID: ' + n.id)));
      inspector.appendChild(el('div', { class: 'inspector__form' },
        el('div', { class: 'field' }, el('span', {}, '节点名称'),
          el('input', { value: n.title })),
        el('div', { class: 'field' }, el('span', {}, '描述'),
          el('textarea', { rows: 2 }, n.desc)),
        renderInspectorForKind(n),
        el('div', { class: 'inspector__actions' },
          el('button', { class: 'link-btn', onclick: () => toast('已复制节点 ' + n.id, 'info') }, '复制'),
          el('button', { class: 'link-btn link-btn--danger', onclick: () => toast('已删除节点（示例）', 'info') }, '删除'))));
    }
    function kindLabel(k) {
      return ({ trigger: '触发器', llm: 'AI 推理', kb: '知识库', skill: 'Skill 调用', approve: '人工审核', output: '输出' })[k] || k;
    }
    function renderInspectorForKind(n) {
      if (n.kind === 'llm') {
        return el('div', {},
          el('div', { class: 'field' }, el('span', {}, '模型'), el('select', {}, el('option', {}, 'Qwen2.5-72B'), el('option', {}, 'DeepSeek-V3'), el('option', {}, 'Llama-3.3-70B'))),
          el('div', { class: 'field' }, el('span', {}, 'Temperature'), el('input', { value: '0.3' })),
          el('div', { class: 'field field--full' }, el('span', {}, 'Prompt 模板'), el('textarea', { rows: 3 }, '请根据以下输入完成链路异常诊断：{{input}}')));
      }
      if (n.kind === 'kb') {
        return el('div', { class: 'field' }, el('span', {}, '知识库'), el('select', {}, el('option', {}, '链路指标库'), el('option', {}, '故障案例库')));
      }
      if (n.kind === 'skill') {
        return el('div', { class: 'field' }, el('span', {}, 'Skill'), el('select', {}, el('option', {}, '查询链路指标'), el('option', {}, '生成诊断报告')));
      }
      if (n.kind === 'trigger') {
        return el('div', { class: 'field' }, el('span', {}, '触发条件'), el('select', {}, el('option', {}, '接口调用'), el('option', {}, '定时调度')));
      }
      if (n.kind === 'approve') {
        return el('div', { class: 'field' }, el('span', {}, '审批人'), el('select', {}, el('option', {}, '运营主管'), el('option', {}, '网络运维组')));
      }
      if (n.kind === 'output') {
        return el('div', { class: 'field' }, el('span', {}, '输出渠道'), el('select', {}, el('option', {}, 'Web 控制台'), el('option', {}, 'Webhook')));
      }
      return el('div', { class: 'field' }, el('span', {}, '参数'), el('input', { value: '默认' }));
    }
    // 默认空态
    inspector.appendChild(el('div', { class: 'inspector__empty' },
      el('div', { class: 'inspector__empty-icon' }, '👈'),
      el('div', { class: 'inspector__empty-text' }, '点击画布上的节点查看与编辑属性'),
      el('div', { class: 'inspector__empty-hint' }, '支持：触发器 / AI 推理 / 知识库 / Skill / 人工审核 / 输出')));
    stage.appendChild(inspector);

    body.appendChild(stage);
    p.appendChild(body);
  }

  function paneKB(p) {
    const layout = el('div', { class: 'kb-layout' });
    const tree = el('aside', { class: 'kb-tree' },
      el('div', { class: 'kb-tree__head' }, el('h5', {}, '知识库'), el('span', { class: 'link-btn' }, '+ 新建分类')),
      el('div', { class: 'kb-tree__list' },
        ...D.KB_TREE.map((n, i) => el('div', { class: 'kb-tree__item' + (i === 0 ? ' is-active' : '') },
          el('span', { class: 'kb-tree__icon' }, n.icon),
          el('span', {}, n.name),
          el('span', { class: 'kb-tree__count' }, String(n.count))))));

    const main = el('div', { class: 'kb-main' });
    const toolbar = el('div', { class: 'kb-toolbar' },
      el('h4', {}, '全部文档 ', el('span', { class: 'muted' }, '· 共 128 份')),
      el('div', { class: 'kb-toolbar__right' },
        btn('上传文档', 'primary', () => toast('已打开文档上传', 'info'), ICON('plus')),
        el('span', { class: 'link-btn' }, '批量管理')));
    const tw = el('div', { class: 'kb-table-wrap' },
      el('table', { class: 'kb-table' },
        el('thead', {}, el('tr', {},
          el('th', {}, '文档名'),
          el('th', {}, '类型'),
          el('th', {}, '大小'),
          el('th', {}, '更新时间'),
          el('th', {}, '状态'),
          el('th', {}, '操作'))),
        el('tbody', {},
          ...D.KB_DOCS.map(d => el('tr', {},
            el('td', {}, el('div', { class: 'kb-doc__name' }, el('i', {}, d.icon), d.name)),
            el('td', {}, d.type),
            el('td', {}, d.size),
            el('td', {}, d.updated),
            el('td', {}, el('span', { class: 'chip' + (d.status === 'parsing' ? '' : ' is-active') }, d.status === 'parsing' ? '解析中' : '已就绪')),
            el('td', {}, el('span', { class: 'link-btn' }, '编辑'), el('span', { class: 'link-btn' }, '重解析'), el('span', { class: 'link-btn' }, '删除')))))));
    main.appendChild(toolbar); main.appendChild(tw);

    layout.appendChild(tree); layout.appendChild(main);
    const body = el('div', { class: 'create-pane__body' }); body.appendChild(layout);
    p.appendChild(body);
  }

  function paneTest(p) {
    const body = el('div', { class: 'create-pane__body' });
    const runner = el('div', { class: 'test-runner' });
    const head = el('div', { class: 'test-runner__head' },
      el('div', {}, el('h4', {}, '试运行'), el('p', {}, '模拟一次完整任务执行，验证工作流与知识库效果')),
      el('div', { class: 'test-runner__actions' },
        btn('清空', 'ghost', null, ICON('check')),
        btn('运行', 'primary', () => runTest(p), ICON('activity'))));
    const input = el('div', { class: 'test-runner__input' },
      el('textarea', { placeholder: '请输入测试问题，例如：GW-03 北向接口丢包率异常，请帮我定位根因…' },
        'GW-03 北向接口丢包率从 5 分钟前开始超过 5%，帮我定位一下根因。'));
    const trace = el('div', { class: 'test-runner__trace' },
      el('div', { class: 'trace-step trace-step--done' },
        el('div', { class: 'trace-step__num' }, '1'),
        el('div', { class: 'trace-step__body' },
          el('div', { class: 'trace-step__title' }, '输入解析'),
          el('div', { class: 'trace-step__detail' }, 'intent: link_diagnose · entities: [GW-03, loss_rate, 5min]')),
        el('span', { class: 'trace-step__time' }, '12ms')),
      el('div', { class: 'trace-step trace-step--done' },
        el('div', { class: 'trace-step__num' }, '2'),
        el('div', { class: 'trace-step__body' },
          el('div', { class: 'trace-step__title' }, '数据采集 · skill(link.metrics)'),
          el('div', { class: 'trace-step__detail' }, 'pull(gw03, 30m) · 24 项指标 · 3 条告警 · 耗时 0.4s')),
        el('span', { class: 'trace-step__time' }, '412ms')),
      el('div', { class: 'trace-step trace-step--done' },
        el('div', { class: 'trace-step__num' }, '3'),
        el('div', { class: 'trace-step__body' },
          el('div', { class: 'trace-step__title' }, '知识库检索 · skill(rag)'),
          el('div', { class: 'trace-step__detail' }, 'top-3 docs · CCSDS 131.0-B, 链路设计指南 v3.2, 案例 #2025-04-12')),
        el('span', { class: 'trace-step__time' }, '186ms')),
      el('div', { class: 'trace-step trace-step--run' },
        el('div', { class: 'trace-step__num' }, '4'),
        el('div', { class: 'trace-step__body' },
          el('div', { class: 'trace-step__title' }, '根因推断 · llm(qwen2.5-72b)'),
          el('div', { class: 'trace-step__detail' }, '正在生成根因推断… ', el('span', { class: 'typing-dots' }, el('i'), el('i'), el('i')))),
        el('span', { class: 'trace-step__time' }, '运行中')));
    runner.appendChild(head); runner.appendChild(input); runner.appendChild(trace);
    body.appendChild(runner);
    p.appendChild(body);
  }
  function runTest(pane) {
    toast('试运行启动', 'info');
  }

  /* ============== DATA APPLICATION ============== */
  function renderData(root) {
    root.appendChild(pageHead('数据应用', '统一指标看板与自助分析能力 · 多源接入、可视化与导出。',
      [btn('新建看板', 'primary', () => toast('已打开看板编辑器', 'info'), ICON('plus')),
       btn('导出报告', 'ghost', null, ICON('chart'))]));

    const toolbar = el('div', { class: 'data-toolbar' },
      el('div', { class: 'data-toolbar__filters' },
        el('span', { class: 'data-toolbar__label' }, '数据域：'),
        ...['链路指标', '波束健康', '终端接入', 'TTC 测控', '运营告警'].map((t, i) => el('button', { class: 'chip' + (i === 0 ? ' is-active' : '') }, t))),
      el('div', { class: 'seg-toggle' },
        el('button', { class: 'is-active' }, '近 24h'),
        el('button', {}, '近 7 天'),
        el('button', {}, '近 30 天'),
        el('button', {}, '自定义')));
    root.appendChild(toolbar);

    const kpis = el('div', { class: 'data-kpis' });
    D.DATA_KPIS.forEach(k => {
      kpis.appendChild(el('div', { class: 'data-kpi' },
        el('em', { class: 'trend ' + (k.up ? 'trend--up' : 'trend--down') }, k.trend),
        el('span', {}, k.label),
        el('strong', { html: k.value + '<small> ' + k.unit + '</small>' })));
    });
    root.appendChild(kpis);

    const g1 = el('div', { class: 'grid-2col' });
    g1.appendChild(panel('网络拓扑', '信关站 · 测控站 · NOC · 实时链路状态', null, topologySVG()));
    g1.appendChild(panel('运维任务甘特', '今日 · 08:00 - 22:00', null, ganttChart()));
    root.appendChild(g1);

    const g2 = el('div', { class: 'grid-2col' });
    g2.appendChild(panel('区域 × 时段接入热力', '近 7 天 · 8 大区 · 单位 Mbps', null, heatmapHTML()));
    g2.appendChild(panel('波束轨迹对比', '正常基线 vs 实际轨迹 · 24h', null, trajectorySVG()));
    root.appendChild(g2);

    const dataRows = [
      { dim: 'GW-01',      metric: '链路可用度', val: '99.97%', trend: '+0.02%', yoy: '+0.31%', health: 'ok',     time: '14:22:18' },
      { dim: 'GW-03',      metric: '链路可用度', val: '99.41%', trend: '-0.12%', yoy: '-0.04%', health: 'warn',   time: '14:22:18' },
      { dim: '北向接口',   metric: '丢包率',     val: '5.21%',  trend: '+4.83%', yoy: '+1.12%', health: 'danger', time: '14:22:18' },
      { dim: '波束 B-12',  metric: 'E1/Es/No',   val: '12.4 dB',trend: '-0.6 dB',yoy: '+0.1 dB',health: 'warn',   time: '14:22:14' },
      { dim: '终端 #SN-9', metric: '注册时延',   val: '1.8 s',  trend: '+0.4 s', yoy: '-0.2 s', health: 'ok',     time: '14:22:08' },
      { dim: 'B-08',       metric: '波束利用率', val: '94%',    trend: '+6%',    yoy: '+12%',   health: 'danger', time: '14:22:01' },
      { dim: 'NOC 北京',   metric: '用户活跃数', val: '2,164',  trend: '+29',    yoy: '+186',   health: 'ok',     time: '14:21:55' },
      { dim: 'GW-02',      metric: '链路可用度', val: '99.86%', trend: '+0.01%', yoy: '+0.22%', health: 'ok',     time: '14:21:42' },
      { dim: '波束 B-05',  metric: '波束利用率', val: '82%',    trend: '-3%',    yoy: '+4%',    health: 'ok',     time: '14:21:30' },
      { dim: 'TTC-03',     metric: '计划冲突',   val: '0',      trend: '0',      yoy: '0',      health: 'ok',     time: '14:21:18' },
    ];
    const dataCfg = {
      id: 'data',
      search: { placeholder: '搜索指标、维度或值…', fields: ['metric', 'dim', 'val'] },
      chips: [
        { key: 'health', label: '健康度', options: [
          { value: 'ok',     label: '正常' },
          { value: 'warn',   label: '关注' },
          { value: 'danger', label: '告警' }
        ]}
      ]
    };
    const tbody = el('tbody', {});
    const counter = el('div', { class: 'data-table__count' });
    const renderRows = function (state) {
      tbody.innerHTML = '';
      let visible = 0;
      dataRows.forEach(r => {
        if (matchFilter(state, r, dataCfg)) {
          tbody.appendChild(el('tr', {},
            el('td', {}, r.metric),
            el('td', {}, r.dim),
            el('td', { class: 'data-table__mono' }, r.val),
            el('td', { class: 'data-table__mono' }, r.trend),
            el('td', { class: 'data-table__mono' }, r.yoy),
            el('td', {}, el('span', { class: 'chip chip--' + r.health }, r.health === 'ok' ? '正常' : r.health === 'warn' ? '关注' : '告警')),
            el('td', { class: 'data-table__mono' }, r.time)));
          visible++;
        }
      });
      counter.innerHTML = '';
      counter.appendChild(el('span', {},
        '共 ' + visible + ' / ' + dataRows.length + ' 条指标'));
    };
    const filter = buildFilterBar(Object.assign({}, dataCfg, { onChange: renderRows }));
    renderRows(filter.getState());

    const table = el('div', { class: 'panel' },
      el('header', { class: 'panel__head' },
        el('div', {}, el('h3', { class: 'panel__title' }, '关键指标明细'),
          el('p', { class: 'panel__hint' }, '支持钻取与导出 · 当前数据域：链路指标')),
        counter),
      el('div', { class: 'panel__body' },
        filter.node,
        el('div', { class: 'kb-table-wrap' },
          el('table', { class: 'data-table' },
            el('thead', {}, el('tr', {},
              el('th', {}, '指标'), el('th', {}, '维度'), el('th', {}, '当前值'),
              el('th', {}, '环比'), el('th', {}, '同比'), el('th', {}, '健康度'), el('th', {}, '更新时间'))),
            tbody))));
    root.appendChild(table);
  }

  function topologySVG() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const wrap = el('div', { style: 'position:relative' });
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 800 320');
    svg.classList.add('topology');
    D.TOPO_LINKS.forEach(l => {
      const a = D.TOPO_NODES.find(n => n.id === l.from), b = D.TOPO_NODES.find(n => n.id === l.to);
      if (!a || !b) return;
      const ln = document.createElementNS(svgNS, 'line');
      ln.setAttribute('x1', a.x); ln.setAttribute('y1', a.y);
      ln.setAttribute('x2', b.x); ln.setAttribute('y2', b.y);
      ln.classList.add('topo-link' + (l.active ? ' topo-link--active' : ''));
      svg.appendChild(ln);
    });
    D.TOPO_NODES.forEach(n => {
      const colors = { core: 'var(--accent)', gw: '#22d3ee', tc: '#a78bfa', noc: '#10b981' };
      const isCore = n.kind === 'core';
      const c = document.createElementNS(svgNS, 'circle');
      c.setAttribute('cx', n.x); c.setAttribute('cy', n.y);
      c.setAttribute('r', isCore ? 12 : 9);
      c.classList.add('topo-node' + (isCore ? ' topo-node--core' : ''));
      c.style.setProperty('--c', colors[n.kind]);
      svg.appendChild(c);
      const t = document.createElementNS(svgNS, 'text');
      t.setAttribute('x', n.x); t.setAttribute('y', n.y + (isCore ? 28 : 24));
      t.setAttribute('text-anchor', 'middle');
      t.classList.add('topo-text');
      t.textContent = n.label;
      svg.appendChild(t);
    });
    wrap.appendChild(svg);
    return wrap;
  }

  function ganttChart() {
    const w = el('div', { class: 'gantt' });
    w.appendChild(el('div', { class: 'gantt__time-axis' },
      el('div', { class: 'gantt__label' }, '任务'),
      el('div', { class: 'gantt__time-ticks' }, ...D.GANTT_TICKS.map(t => el('span', {}, t)))));
    D.GANTT.forEach(g => {
      const startPct = g.start / 32 * 100;
      const spanPct = g.span / 32 * 100;
      w.appendChild(el('div', { class: 'gantt__row' },
        el('div', { class: 'gantt__label', style: '--c:' + g.color },
          el('i', { style: '--c:' + g.color }),
          g.name + ' · ', el('span', { style: 'color:var(--ink-3); font-family: var(--font-mono); font-size: 10.5px' }, g.unit)),
        el('div', { class: 'gantt__track' },
          el('div', { class: 'gantt__bar gantt__bar--' + g.status, style: 'left:' + startPct + '%; width:' + spanPct + '%; --c:' + g.color },
            g.status === 'done' ? '100%' : Math.round(g.span * 0.6) + 'm'))));
    });
    return w;
  }

  function heatmapHTML() {
    const wrap = el('div', { class: 'heatmap' });
    const y = el('div', { class: 'heatmap__y' }, ...D.HEATMAP.regions.map(r => el('span', {}, r)));
    const main = el('div', { class: 'heatmap__main' });
    const x = el('div', { class: 'heatmap__x' }, ...Array.from({ length: 24 }, (_, i) => el('span', {}, String(i).padStart(2, '0'))));
    main.appendChild(x);
    D.HEATMAP.data.forEach((row, ri) => {
      const r = el('div', { class: 'heatmap__row' });
      row.forEach((v, hi) => {
        const a = Math.min(1, v / 100);
        const c = 'rgba(139,92,246,' + (0.08 + a * 0.85) + ')';
        r.appendChild(el('div', { class: 'heat-cell', style: '--c:' + c, title: D.HEATMAP.regions[ri] + ' · ' + hi + 'h · ' + v + ' Mbps' }));
      });
      main.appendChild(r);
    });
    main.appendChild(el('div', { class: 'heatmap-legend' }, '低 ', el('div', { class: 'heatmap-legend__bar' }), ' 高'));
    wrap.appendChild(y); wrap.appendChild(main);
    return wrap;
  }

  function trajectorySVG() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const t = D.TRAJ;
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + t.w + ' ' + t.h);
    svg.classList.add('trajectory');
    // grid
    for (let i = 1; i < 4; i++) {
      const ln = document.createElementNS(svgNS, 'line');
      ln.setAttribute('x1', t.cx); ln.setAttribute('y1', t.cy - t.r * (i / 4));
      ln.setAttribute('x2', t.w - 20); ln.setAttribute('y2', t.cy - t.r * (i / 4));
      ln.classList.add('traj-grid');
      svg.appendChild(ln);
    }
    // axis
    const ax = document.createElementNS(svgNS, 'line');
    ax.setAttribute('x1', t.cx); ax.setAttribute('y1', t.cy);
    ax.setAttribute('x2', t.w - 20); ax.setAttribute('y2', t.cy);
    ax.classList.add('traj-axis');
    svg.appendChild(ax);
    // series
    t.series.forEach(s => {
      const pts = [];
      for (let i = 0; i < s.points; i++) {
        const x = 60 + i * 18;
        const y = t.cy - Math.sin(i * 0.5 + s.phase) * t.r * s.amp - i * 0.3;
        pts.push(x + ',' + y);
      }
      const p = document.createElementNS(svgNS, 'polyline');
      p.setAttribute('points', pts.join(' '));
      p.classList.add('traj-curve' + (s.active ? ' traj-curve--active' : ''));
      p.style.setProperty('--c', s.color);
      svg.appendChild(p);
      // end marker
      const last = pts[pts.length - 1].split(',');
      const m = document.createElementNS(svgNS, 'circle');
      m.setAttribute('cx', last[0]); m.setAttribute('cy', last[1]);
      m.setAttribute('r', 3.5);
      m.classList.add('traj-marker');
      m.style.setProperty('--c', s.color);
      svg.appendChild(m);
    });
    // legend
    const lg = el('div', { style: 'display:flex;gap:14px;padding:0 6px;font-size:11px;color:var(--ink-2);font-family:var(--font-mono)' },
      el('span', { html: '<i style="display:inline-block;width:8px;height:2px;background:#22d3ee;margin-right:6px"></i>正常基线' }),
      el('span', { html: '<i style="display:inline-block;width:8px;height:2px;background:#8b5cf6;margin-right:6px"></i>实际轨迹' }));
    const wrap = el('div', {}, svg, lg);
    return wrap;
  }

  /* ============== FILES ============== */
  function renderFiles(root) {
    root.appendChild(pageHead('文件中心', '统一管理所有上传的文档、报告与导出物 · 与知识库联动。',
      [btn('上传文件', 'primary', () => toast('已打开文件上传', 'info'), ICON('plus'))]));

    const toolbar = el('div', { class: 'files-toolbar' },
      el('div', { class: 'files-tabs' },
        ...['全部', 'PDF', 'DOCX', 'XLSX', '图片', '其他'].map((t, i) => el('button', { class: i === 0 ? 'is-active' : '' }, t))),
      el('div', { class: 'files-search' },
        el('span', { html: SVG('<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>') }),
        el('input', { placeholder: '搜索文件名、标签…' })));
    root.appendChild(toolbar);

    const layout = el('div', { class: 'files-layout' });
    const tree = el('aside', { class: 'files-tree' },
      el('h6', {}, '分类'),
      el('ul', {},
        el('li', { class: 'is-active' }, el('span', {}, '📁'), '全部文件', el('span', {}, '128')),
        el('li', {}, el('span', {}, '📄'), '运营报告', el('span', {}, '36')),
        el('li', {}, el('span', {}, '📚'), '标准规范', el('span', {}, '42')),
        el('li', {}, el('span', {}, '🛠️'), '故障案例', el('span', {}, '28')),
        el('li', {}, el('span', {}, '🎓'), '培训材料', el('span', {}, '14')),
        el('li', {}, el('span', {}, '📦'), '其他',     el('span', {}, '8'))),
      el('h6', {}, '标签'),
      el('ul', {},
        el('li', {}, el('span', {}, '#'), '链路', el('span', {}, '24')),
        el('li', {}, el('span', {}, '#'), '信关站', el('span', {}, '18')),
        el('li', {}, el('span', {}, '#'), '终端', el('span', {}, '12'))));

    const grid = el('div', { class: 'files-grid' });
    const empty = el('div', { class: 'plaza-empty', style: 'display:none' },
      el('div', { class: 'plaza-empty__icon', html: SVG('<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>') }),
      el('h4', {}, '没有匹配的文件'),
      el('p', {}, '尝试调整筛选条件或重置搜索'));
    const fileCfg = {
      id: 'files',
      search: { placeholder: '搜索文件名、类型或时间…', fields: ['name', 'type', 'time'] },
      chips: [
        { key: 'type', label: '类型', options: [
          { value: 'PDF', label: 'PDF' },
          { value: 'DOCX', label: 'DOCX' },
          { value: 'XLSX', label: 'XLSX' },
          { value: 'IMG', label: '图片' },
          { value: 'OTHER', label: '其他' }
        ]}
      ]
    };
    const renderFilesGrid = function (state) {
      grid.innerHTML = '';
      let visible = 0;
      D.FILES.forEach(f => {
        if (matchFilter(state, f, fileCfg)) {
          grid.appendChild(el('article', { class: 'file-card' },
            el('div', { class: 'file-card__icon', style: '--c:' + f.c }, f.type.slice(0, 1)),
            el('div', { class: 'file-card__name' }, f.name),
            el('div', { class: 'file-card__meta' }, el('span', {}, f.type + ' · ' + f.size), el('span', {}, f.time))));
          visible++;
        }
      });
      empty.style.display = visible === 0 ? 'flex' : 'none';
    };
    const filter = buildFilterBar(Object.assign({}, fileCfg, { onChange: renderFilesGrid }));
    renderFilesGrid(filter.getState());
    layout.appendChild(tree); layout.appendChild(grid);
    root.appendChild(filter.node);
    root.appendChild(layout);
    root.appendChild(empty);
  }

  /* ============== TASKS ============== */
  function renderTasks(root) {
    root.appendChild(pageHead('任务监控', '全链路追踪员工任务的执行、状态与资源消耗。',
      [btn('筛选', 'ghost', null, ICON('chart')), btn('导出', 'ghost', null, ICON('chart'))]));

    const stats = el('div', { class: 'tasks-stats' },
      el('div', {}, el('span', {}, '运行中'), el('strong', {}, '5', el('small', {}, ' 个'))),
      el('div', {}, el('span', {}, '已完成'), el('strong', {}, '128', el('small', {}, ' 个'))),
      el('div', {}, el('span', {}, '失败'),   el('strong', {}, '2',  el('small', {}, ' 个'))),
      el('div', {}, el('span', {}, '平均耗时'), el('strong', {}, '4.2', el('small', {}, ' min'))),
      el('div', {}, el('span', {}, '成功率'),  el('strong', {}, '98.5', el('small', {}, ' %'))));
    root.appendChild(stats);

    const g = el('div', { class: 'grid-2col' });
    g.appendChild(panel('任务甘特图', '今日 · 08:00 - 22:00', null, ganttChart()));
    g.appendChild(panel('任务执行趋势', '近 24 小时 · 完成 / 失败 / 进行中', null,
      el('canvas', { height: 220, id: 'chart-tasktrend' })));
    root.appendChild(g);

    const list = el('ul', { class: 'task-list' });
    D.TASKS.forEach(t => {
      const cls = t.status === 'done' ? 'is-done' : t.status === 'fail' ? 'is-fail' : '';
      list.appendChild(el('li', {},
        el('span', { class: 'task-list__id' }, t.id),
        el('span', { class: 'task-list__title' }, t.title),
        el('span', { class: 'task-list__meta' }, t.agent),
        el('div', { class: 'task-list__bar ' + cls }, el('span', { style: 'width:' + t.progress + '%' })),
        el('span', { class: 'task-list__meta' }, t.time)));
    });
    root.appendChild(panel('任务明细', '点击任务查看白盒推理与工具调用链路', null, list));

    setTimeout(initChartTaskTrend, 0);
  }
  function initChartTaskTrend() {
    const cv = $('#chart-tasktrend'); if (!cv) return;
    const { ink, line, accent } = chartBase();
    state.charts.tasktrend = new Chart(cv, {
      type: 'line',
      data: { labels: Array.from({ length: 24 }, (_, i) => i + 'h'),
        datasets: [
          { label: '完成', data: Array.from({ length: 24 }, (_, i) => 40 + Math.round(Math.sin(i * 0.5) * 12 + Math.random() * 8)), borderColor: '#10b981', backgroundColor: '#10b98122', fill: true, tension: 0.4, borderWidth: 1.6, pointRadius: 0 },
          { label: '失败', data: Array.from({ length: 24 }, () => Math.round(Math.random() * 4)), borderColor: '#f43f5e', backgroundColor: '#f43f5e22', fill: true, tension: 0.4, borderWidth: 1.6, pointRadius: 0 },
          { label: '运行中', data: Array.from({ length: 24 }, () => 3 + Math.round(Math.random() * 4)), borderColor: accent, backgroundColor: accent + '22', fill: true, tension: 0.4, borderWidth: 1.6, pointRadius: 0 },
        ] },
      options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
        plugins: { legend: { labels: { color: ink, font: { family: 'JetBrains Mono', size: 11 } } } },
        scales: { x: { ticks: { color: ink, font: { family: 'JetBrains Mono', size: 10 } }, grid: { color: line + '55' } }, y: { ticks: { color: ink, font: { family: 'JetBrains Mono', size: 10 } }, grid: { color: line + '55' } } } },
    });
  }

  /* ============== REVIEW ============== */
  function renderReview(root) {
    root.appendChild(pageHead('审核中心', '对员工上架、知识库更新、变更进行合规审核 · ' + D.REVIEWS.length + ' 条待审。',
      [btn('批量通过', 'primary', null, ICON('check')), btn('策略配置', 'ghost', null, ICON('settings'))]));

    const list = el('div', { class: 'review-list' });
    D.REVIEWS.forEach(r => {
      list.appendChild(el('article', { class: 'review-card' },
        el('div', { class: 'review-card__head' },
          el('div', { class: 'review-card__avatar', style: '--c1:' + r.c1 + ';--c2:' + r.c2 }, r.name.slice(0, 1)),
          el('div', { class: 'review-card__title' },
            el('div', { class: 'review-card__name' }, r.name),
            el('div', { class: 'review-card__sub' }, r.sub)),
          el('span', { class: 'chip' + (r.tag === '用户自建' ? ' is-active' : '') }, r.tag)),
        el('div', { class: 'review-card__body' }, r.desc),
        el('div', { class: 'review-card__meta' }, el('span', {}, r.meta)),
        el('div', { class: 'review-card__actions' },
          btn('通过并上架', 'primary', () => toast('已通过：' + r.name, 'info'), ICON('check')),
          btn('驳回', 'ghost', null, ICON('check')),
          btn('查看详情', 'outline', null, ICON('user')))));
    });
    root.appendChild(list);
  }

  /* ============== AUDIT ============== */
  function renderAudit(root) {
    root.appendChild(pageHead('审计日志', '所有用户与系统操作的完整审计轨迹 · 支持检索与导出。',
      [btn('导出', 'ghost', null, ICON('chart'))]));

    const auditCfg = {
      id: 'audit',
      search: { placeholder: '搜索目标对象、IP 或用户…', fields: ['target', 'ip', 'user'] },
      select: [
        { key: 'user', label: '用户', options: [
          { value: '全部', label: '全部' },
          { value: '星小智', label: '星小智' },
          { value: '王雪', label: '王雪' },
          { value: '张博', label: '张博' },
          { value: '陈默', label: '陈默' },
          { value: '系统', label: '系统' }
        ]},
        { key: 'action', label: '操作', options: [
          { value: '全部', label: '全部' },
          { value: 'EDIT_EMPLOYEE', label: 'EDIT_EMPLOYEE' },
          { value: 'PUBLISH_EMPLOYEE', label: 'PUBLISH_EMPLOYEE' },
          { value: 'APPROVE', label: 'APPROVE' },
          { value: 'UPLOAD_KB', label: 'UPLOAD_KB' },
          { value: 'CREATE_EMPLOYEE', label: 'CREATE_EMPLOYEE' },
          { value: 'RUN_TASK', label: 'RUN_TASK' },
          { value: 'AUTO_REVIEW', label: 'AUTO_REVIEW' },
          { value: 'BACKUP', label: 'BACKUP' }
        ]}
      ],
      date: [
        { key: 'date', label: '时间' }
      ]
    };

    const tbody = el('tbody', {});
    const counter = el('div', { class: 'audit-count' });
    const tableWrap = el('div', { class: 'panel' },
      el('div', { class: 'panel__head' },
        el('h4', {}, '审计记录'),
        counter),
      el('div', { class: 'panel__body' },
        el('div', { class: 'kb-table-wrap' },
          el('table', { class: 'data-table' },
            el('thead', {}, el('tr', {},
              el('th', {}, '时间戳'),
              el('th', {}, '用户'),
              el('th', {}, '操作'),
              el('th', {}, '目标对象'),
              el('th', {}, '源 IP'),
              el('th', {}, '结果'))),
            tbody))));

    const renderRows = function (state) {
      tbody.innerHTML = '';
      let visible = 0;
      D.AUDIT.forEach(a => {
        // map date prefix to item.date
        const date = a.ts.slice(0, 10);
        const item = Object.assign({}, a, { date: date });
        if (matchFilter(state, item, auditCfg)) {
          tbody.appendChild(el('tr', {},
            el('td', { class: 'data-table__mono' }, a.ts),
            el('td', {}, a.user),
            el('td', {}, el('span', { class: 'chip' }, a.action)),
            el('td', {}, a.target),
            el('td', { class: 'data-table__mono' }, a.ip),
            el('td', {}, el('span', { class: 'chip is-active' }, '成功'))));
          visible++;
        }
      });
      counter.innerHTML = '';
      counter.appendChild(el('span', { class: 'audit-count__text' },
        '共 ' + visible + ' / ' + D.AUDIT.length + ' 条记录'));
    };
    const filter = buildFilterBar(Object.assign({}, auditCfg, { onChange: renderRows }));
    renderRows(filter.getState());

    root.appendChild(filter.node);
    root.appendChild(tableWrap);
  }

  /* ============== SETTINGS ============== */
  function renderSettings(root) {
    root.appendChild(pageHead('系统设置', '主题外观、模型与权限、审计与备份配置。',
      [btn('保存更改', 'primary', () => toast('设置已保存', 'info'), ICON('check'))]));

    const grid = el('div', { class: 'settings-grid' });
    grid.appendChild(panel('外观与主题', '调整界面明暗主题', null,
      el('div', { class: 'settings-body' },
        el('div', { class: 'setting-item' },
          el('div', {}, el('h5', {}, '明暗主题'), el('p', {}, '深色模式更适合长时间监控，浅色模式适合文档阅读')),
          el('div', { class: 'seg-toggle' },
            el('button', { class: state.theme === 'dark' ? 'is-active' : '', onclick: () => { state.theme = 'dark'; applyTheme(); render(); } }, '深色'),
            el('button', { class: state.theme === 'light' ? 'is-active' : '', onclick: () => { state.theme = 'light'; applyTheme(); render(); } }, '浅色'))),
        el('div', { class: 'setting-item' },
          el('div', {}, el('h5', {}, '动态背景'), el('p', {}, '启用星轨与极光动效')),
          el('div', { class: 'seg-toggle' }, el('button', { class: 'is-active' }, '开启'), el('button', {}, '关闭'))))));

    grid.appendChild(panel('模型与推理', '配置大模型、向量库与白盒推理策略', null,
      el('div', { class: 'settings-body' },
        el('div', { class: 'setting-item' },
          el('div', {}, el('h5', {}, '基础模型'), el('p', {}, '默认 Qwen 2.5 72B (开源 · 本地化)')),
          el('div', {}, el('select', {}, el('option', {}, 'Qwen 2.5 72B'), el('option', {}, 'DeepSeek V3'), el('option', {}, 'GLM-4')))),
        el('div', { class: 'setting-item' },
          el('div', {}, el('h5', {}, '白盒推理'), el('p', {}, '展示完整的推理步骤与工具调用链路')),
          el('div', { class: 'seg-toggle' }, el('button', { class: 'is-active' }, '开启'), el('button', {}, '关闭'))),
        el('div', { class: 'setting-item' },
          el('div', {}, el('h5', {}, '向量库'), el('p', {}, 'Milvus / PGVector 兼容')),
          el('div', {}, el('span', { class: 'chip is-active' }, 'Milvus · 已连接'))))));

    grid.appendChild(panel('权限与安全', '用户角色、API Key 与审计', null,
      el('div', { class: 'settings-body' },
        el('div', { class: 'setting-item' },
          el('div', {}, el('h5', {}, '默认角色'), el('p', {}, '管理员 / 普通用户')),
          el('div', {}, el('span', { class: 'chip is-active' }, '管理员 · 2 人'), el('span', { class: 'chip' }, '普通用户 · 18 人'))),
        el('div', { class: 'setting-item' },
          el('div', {}, el('h5', {}, 'API Key'), el('p', {}, 'RESTful API · OpenAPI 3.0 · OAuth 2.0')),
          el('div', {}, btn('生成', 'outline', null, ICON('plus')))),
        el('div', { class: 'setting-item' },
          el('div', {}, el('h5', {}, '备份与快照'), el('p', {}, '每日凌晨自动备份 · 保留 30 天')),
          el('div', {}, el('span', { class: 'chip' }, '下次备份：06-18 03:00'))))));

    root.appendChild(grid);
  }

  /* ============== CHAT ============== */
  let chatState = null;
  function openChat(emp) {
    if (!emp) emp = D.EMPLOYEES[0];
    chatState = { emp: emp, messages: D.CHAT_MESSAGES.slice(), history: D.CHAT_HISTORY.slice() };
    const overlay = el('div', { class: 'chat-overlay', id: 'chatOverlay' });
    const side = el('aside', { class: 'chat-sidebar' },
      el('div', { class: 'chat-sidebar__head' },
        el('button', { class: 'iconbtn', 'aria-label': '返回', html: SVG('<path d="M19 12H5M12 19l-7-7 7-7"/>'), onclick: closeChat }),
        el('div', { class: 'chat-sidebar__title' }, '历史任务'),
        el('button', { class: 'iconbtn iconbtn--accent', 'aria-label': '新建会话', title: '新建会话',
          html: SVG('<path d="M12 5v14M5 12h14"/>'),
          onclick: () => startNewChatSession(emp) })),
      buildChatHistory(chatState.history));
    const main = el('section', { class: 'chat-main' },
      el('div', { class: 'chat-main__head' },
        el('div', { class: 'chat-main__agent' },
          el('div', { class: 'chat-main__agent-avatar', style: '--c1:' + emp.c.c1 + ';--c2:' + emp.c.c2 }, emp.name.slice(0, 1)),
          el('div', {},
            el('div', { class: 'chat-main__agent-name' }, emp.name),
            el('div', { class: 'chat-main__agent-status' }, '● 在线 · 推理中' ))),
        el('div', { style: 'display:flex;align-items:center;gap:8px' },
          btn('查看流程', 'ghost', null, ICON('activity')),
          btn('新建任务', 'outline', null, ICON('plus')))),
      buildChatStream(chatState.messages),
      buildChatInput(emp));
    overlay.appendChild(side); overlay.appendChild(main);
    document.body.appendChild(overlay);
    state.chatOpen = true;
    setTimeout(() => {
      const sm = $('.chat-stream'); if (sm) sm.scrollTop = sm.scrollHeight;
    }, 0);
  }
  function buildChatHistory(history) {
    const wrap = el('div', { class: 'chat-history' });
    history.forEach(g => {
      const grp = el('div', { class: 'chat-history__group' });
      grp.appendChild(el('div', { class: 'chat-history__date' }, g.date));
      g.items.forEach(it => {
        const node = el('div', { class: 'chat-history__item' },
          el('div', {}, it.title),
          el('div', { class: 'preview' }, it.preview));
        grp.appendChild(node);
      });
      wrap.appendChild(grp);
    });
    return wrap;
  }
  function buildChatStream(messages) {
    const stream = el('div', { class: 'chat-stream' });
    messages.forEach(m => {
      if (m.who === 'step') {
        stream.appendChild(el('div', { class: 'chat-step' },
          el('div', { class: 'chat-step__head' }, el('i', { html: SVG('<path d="M9 11l3 3L22 4"/>') }), m.title),
          el('div', { class: 'chat-step__body' }, m.detail)));
        return;
      }
      const isUser = m.who === 'user';
      const msg = el('div', { class: 'chat-msg chat-msg--' + m.who + (m.thinking ? ' chat-msg--thinking' : '') },
        el('div', { class: 'chat-bubble', html: m.text + (m.thinking ? ' <span class="typing-dots"><i></i><i></i><i></i></span>' : '') }),
        m.t ? el('span', { class: 'chat-msg__time' }, m.t) : null);
      if (m.suggest) {
        const s = el('div', { class: 'chat-suggest' });
        m.suggest.forEach(t => s.appendChild(el('button', { onclick: () => suggestClick(t) }, t)));
        msg.appendChild(s);
      }
      stream.appendChild(msg);
    });
    return stream;
  }
  function buildChatInput(emp) {
    const box = el('div', { class: 'chat-input' },
      el('div', { class: 'chat-input__box' },
        el('div', { class: 'chat-input__tools' },
          el('button', { 'aria-label': '附件', html: SVG('<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>') }),
          el('button', { 'aria-label': '语音', html: SVG('<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>') })),
        el('textarea', { placeholder: '向 ' + emp.name + ' 提问… (Enter 发送 · Shift+Enter 换行)' }),
        el('button', { class: 'chat-send', 'aria-label': '发送', html: SVG('<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>') })),
      el('div', { class: 'chat-input__foot' },
        el('span', {}, '当前员工 · ' + emp.name + ' · 知识库 12 份 · 工具 4 个'),
        el('span', {}, '白盒推理 · 已启用')));
    return box;
  }
  function suggestClick(t) { toast('已发送建议：' + t, 'info'); }
  function closeChat() {
    const co = $('#chatOverlay'); if (co) co.remove();
    state.chatOpen = false;
  }
  // 新建会话：插入历史项 + 重置消息流
  function startNewChatSession(emp) {
    if (!chatState) return;
    const now = new Date();
    const stamp = now.getFullYear() + '-' + pad(now.getMonth()+1) + '-' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes());
    const newItem = { id: 'h-' + Date.now(), title: '新会话 · ' + stamp, time: '刚刚', active: true, emp: emp.id };
    // mark all others inactive
    chatState.history.forEach(h => h.active = false);
    chatState.history.unshift(newItem);
    chatState.messages = [{
      role: 'agent',
      text: '你好，我是「' + emp.name + '」。请告诉我你要处理的任务，例如：' + (emp.caps && emp.caps[0] ? emp.caps[0] : '执行一次链路巡检') + '。',
      steps: []
    }];
    // re-render overlay
    const old = $('#chatOverlay');
    if (old) old.remove();
    openChat(emp);
    // 高亮新会话
    setTimeout(() => {
      const item = $$('.chat-history__item').find ? $$('.chat-history__item').find(n => n.classList.contains('is-active')) : null;
    }, 30);
    toast('已新建会话', 'success');
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  /* ============== INIT ============== */
  function bindGlobalEvents() {
    $('#sidebarToggle').addEventListener('click', () => $('#app').classList.toggle('is-collapsed'));
    $('#themeToggle').addEventListener('click', toggleTheme);
    const help = $('#helpBtn'); if (help) help.addEventListener('click', () => openHelp());
    const setBtn = $('#settingsBtn'); if (setBtn) setBtn.addEventListener('click', () => navigate('settings'));
    const logout = $('#logoutBtn'); if (logout) logout.addEventListener('click', () => openLogout());
    $$('.breadcrumb__item').forEach(b => b.addEventListener('click', () => navigate(b.dataset.route)));
    // expose to topbar user
    const uc = $('.user-chip'); if (uc) uc.addEventListener('click', () => toast('已打开账户菜单 (示例)', 'info'));
    // hash routing
    window.addEventListener('hashchange', () => {
      const h = location.hash.replace('#', ''); if (h && h !== state.route) navigate(h);
    });
  }

  /* Topbar helpers */
  function openHelp() {
    const body = el('div', { class: 'help-list' },
      el('div', { class: 'help-item' }, el('div', { class: 'help-item__title' }, '快速开始'), el('div', { class: 'help-item__desc' }, '了解如何在 5 分钟内雇佣并启用第一个数字员工')),
      el('div', { class: 'help-item' }, el('div', { class: 'help-item__title' }, '员工广场'), el('div', { class: 'help-item__desc' }, '浏览并雇佣内置的专业 / 通用数字员工')),
      el('div', { class: 'help-item' }, el('div', { class: 'help-item__title' }, '创建员工'), el('div', { class: 'help-item__desc' }, '零代码拖拽式自定义数字员工，并支持发布到员工广场（管理员审核）')),
      el('div', { class: 'help-item' }, el('div', { class: 'help-item__title' }, '主题切换'), el('div', { class: 'help-item__desc' }, '点击右上角 ☀/🌙 切换浅色 / 深色，偏好自动持久化')));
    openModal({ title: '帮助中心', size: 'sm', body });
  }
  function openLogout() {
    const body = el('div', {},
      el('p', { class: 'modal__lead' }, '确认要退出当前账号「李正」吗？'),
      el('p', { class: 'modal__note' }, '退出后将清除当前会话的临时状态（主题偏好会保留）。'));
    openModal({
      title: '退出确认',
      size: 'xs',
      body,
      footer: [
        { label: '取消', variant: 'ghost', onclick: closeModal },
        { label: '退出', variant: 'primary', onclick: () => { closeModal(); toast('已退出登录（示例）', 'success'); } }
      ]
    });
  }
  function init() {
    applyTheme();
    buildSidebar();
    setActiveNav();
    bindGlobalEvents();
    const initial = location.hash.replace('#', '');
    if (initial && D.NAV.find(n => routeAlias(n.id) === initial)) state.route = initial;
    render();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
