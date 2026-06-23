<template>
  <div
    class="app-layout"
    :class="{
      'is-mobile-open': appStore.mobileDrawerOpen,
      'is-collapsed': appStore.sidebarCollapsed && !appStore.mobileDrawerOpen
    }"
  >
    <!-- 侧边栏（桌面端固定，移动端抽屉） -->
    <aside class="app-sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
      <div class="sidebar__brand">
        <div class="brand__logo" aria-hidden="true">
          <svg viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="3" class="brand__core" />
            <ellipse cx="20" cy="20" rx="14" ry="5" class="brand__ring brand__ring--1" transform="rotate(30 20 20)" />
            <ellipse cx="20" cy="20" rx="14" ry="5" class="brand__ring brand__ring--2" transform="rotate(-30 20 20)" />
            <ellipse cx="20" cy="20" rx="14" ry="5" class="brand__ring brand__ring--3" />
            <circle cx="32" cy="13" r="1.5" class="brand__sat" />
            <circle cx="9"  cy="27" r="1"   class="brand__sat" />
          </svg>
        </div>
        <div class="brand__text" :class="{ 'is-collapsed-hide': appStore.sidebarCollapsed }">
          <div class="brand__title">OrbitalCommand</div>
          <div class="brand__subtitle">卫星互联网 · 数字员工</div>
        </div>
      </div>

      <nav class="sidebar__nav" aria-label="主导航">
        <template v-for="item in navGroups.main" :key="item.id">
          <!-- 父级:有 children 的导航,渲染为可展开的组 -->
          <div
            v-if="Array.isArray(item.children) && item.children.length"
            class="nav__group"
            :class="{ 'is-open': isGroupOpen(item.id), 'is-active': isGroupActive(item) }"
          >
            <a
              class="nav__item nav__item--parent"
              :class="{ 'is-active': isGroupActive(item) }"
              :href="'#' + item.id"
              @click.prevent="toggleGroup(item.id)"
              :aria-expanded="isGroupOpen(item.id)"
            >
              <span class="nav__icon" v-html="iconSvg(item.icon)"></span>
              <span class="nav__label" :class="{ 'is-collapsed-hide': appStore.sidebarCollapsed }">{{ item.label }}</span>
              <span
                class="nav__chevron"
                :class="{ 'is-collapsed-hide': appStore.sidebarCollapsed }"
                :style="{ transform: isGroupOpen(item.id) ? 'rotate(90deg)' : 'rotate(0deg)' }"
                aria-hidden="true"
              >›</span>
            </a>
            <!-- 二级子导航 -->
            <div
              v-show="isGroupOpen(item.id)"
              class="nav__sub"
              :class="{ 'is-collapsed-hide': appStore.sidebarCollapsed }"
            >
              <template v-for="child in item.children" :key="child.id">
                <!-- 嵌套子分组:二级项本身还有 children(如 智能中心 → 知识库 → 个人知识库/专栏订阅) -->
                <div
                  v-if="Array.isArray(child.children) && child.children.length"
                  class="nav__group nav__group--nested"
                  :class="{ 'is-open': isGroupOpen(child.id), 'is-active': isGroupActive(child) }"
                >
                  <a
                    class="nav__item nav__item--child nav__item--parent nav__item--nested"
                    :class="{ 'is-active': isGroupActive(child) }"
                    :href="'#' + child.id"
                    @click.prevent="toggleGroup(child.id)"
                    :aria-expanded="isGroupOpen(child.id)"
                  >
                    <span class="nav__icon nav__icon--sm" v-html="iconSvg(child.icon)"></span>
                    <span class="nav__label nav__label--child">{{ child.label }}</span>
                    <span
                      class="nav__chevron nav__chevron--sm"
                      :style="{ transform: isGroupOpen(child.id) ? 'rotate(90deg)' : 'rotate(0deg)' }"
                      aria-hidden="true"
                    >›</span>
                  </a>
                  <!-- 三级子导航 -->
                  <div
                    v-show="isGroupOpen(child.id)"
                    class="nav__sub nav__sub--nested"
                  >
                    <a
                      v-for="grand in child.children"
                      :key="grand.id"
                      class="nav__item nav__item--child nav__item--grand"
                      :class="{ 'is-active': activeRoute === grand.id }"
                      :href="'#' + grand.id"
                      @click.prevent="onSelect(grand.id)"
                    >
                      <span class="nav__icon nav__icon--xs" v-html="iconSvg(grand.icon)"></span>
                      <span class="nav__label nav__label--grand">{{ grand.label }}</span>
                      <span
                        v-if="grand.count != null"
                        class="nav__count nav__count--grand"
                      >{{ grand.count }}</span>
                    </a>
                  </div>
                </div>
                <!-- 普通二级叶子项 -->
                <a
                  v-else
                  class="nav__item nav__item--child"
                  :class="{ 'is-active': activeRoute === child.id }"
                  :href="'#' + child.id"
                  @click.prevent="onSelect(child.id)"
                >
                  <span class="nav__icon nav__icon--sm" v-html="iconSvg(child.icon)"></span>
                  <span class="nav__label nav__label--child">{{ child.label }}</span>
                  <span
                    v-if="child.count != null"
                    class="nav__count nav__count--child"
                  >{{ child.count }}</span>
                </a>
              </template>
            </div>
          </div>
          <!-- 普通叶子项:沿用旧渲染逻辑 -->
          <a
            v-else
            class="nav__item"
            :class="{ 'is-active': activeRoute === item.id }"
            :href="'#' + item.id"
            @click.prevent="onSelect(item.id)"
          >
            <span class="nav__icon" v-html="iconSvg(item.icon)"></span>
            <span class="nav__label" :class="{ 'is-collapsed-hide': appStore.sidebarCollapsed }">{{ item.label }}</span>
            <span
              v-if="item.count != null"
              class="nav__count"
              :class="[
                { 'nav__count--live': item.live, 'is-collapsed-hide': appStore.sidebarCollapsed }
              ]"
            >{{ item.count }}</span>
            <span v-if="item.live && appStore.sidebarCollapsed" class="nav__pulse" />
          </a>
        </template>
      </nav>

      <div class="sidebar__divider"></div>

      <nav class="sidebar__nav" aria-label="管理导航">
        <a
          v-for="item in navGroups.aux"
          :key="item.id"
          class="nav__item"
          :class="{ 'is-active': activeRoute === item.id }"
          :href="'#' + item.id"
          @click.prevent="onSelect(item.id)"
        >
          <span class="nav__icon" v-html="iconSvg(item.icon)"></span>
          <span class="nav__label" :class="{ 'is-collapsed-hide': appStore.sidebarCollapsed }">{{ item.label }}</span>
          <span
            v-if="item.count != null"
            class="nav__count"
            :class="[
              { 'nav__count--live': item.live, 'is-collapsed-hide': appStore.sidebarCollapsed }
            ]"
          >{{ item.count }}</span>
          <span v-if="item.live && appStore.sidebarCollapsed" class="nav__pulse" />
        </a>
      </nav>

      <div class="sidebar__footer" :class="{ 'is-collapsed-hide': appStore.sidebarCollapsed }">
        <div class="system-card">
          <div class="system-card__row">
            <span class="system-card__label">系统状态</span>
            <span class="status-pill status-pill--ok">
              <span class="status-pill__dot"></span>运行中
            </span>
          </div>
          <div class="system-card__metric">
            <div v-for="m in systemMetrics" :key="m.label" class="metric-mini">
              <span class="metric-mini__label">{{ m.label }}</span>
              <div class="metric-mini__bar">
                <span :style="{ '--w': m.w, '--c': m.color || 'var(--ok)' }" />
              </div>
              <span class="metric-mini__val">{{ m.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主体 -->
    <div class="app-main">
      <TopBar @toggle-sidebar="appStore.toggleSidebar()" @toggle-drawer="appStore.openMobileDrawer()" />

      <div class="app-content">
        <div class="app-content-body">
          <slot />
        </div>
      </div>
    </div>

    <!-- 移动端抽屉遮罩 -->
    <div v-if="appStore.mobileDrawerOpen" class="mobile-mask" @click="appStore.closeMobileDrawer()" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { MOCK } from '@/api/mock-data'
import TopBar from './TopBar.vue'

const appStore = useAppStore()
const route = useRoute()
const router = useRouter()

/* 解析当前路由命中的导航 id：
 * - 优先匹配叶子节点（子项）
 * - 若未命中叶子但命中父节点，也返回父节点 id（用于高亮父级）
 */
const activeRoute = computed(() => {
  const name = String(route.name || '').toLowerCase()
  const path = route.path.replace(/^#?\/*/, '').toLowerCase()
  for (const n of MOCK.nav) {
    const id = n.id.toLowerCase()
    const routeId = id === 'my-employees' ? 'myemployees' : id
    if (name === routeId || path === id) return n.id
    if (Array.isArray(n.children)) {
      for (const c of n.children) {
        const cid = c.id.toLowerCase()
        const cRouteId = cid === 'my-employees' ? 'myemployees' : cid
        if (name === cRouteId || path === cid) return c.id
        // 三级孙项(如 智能中心 → 知识库 → 个人知识库/专栏订阅)
        if (Array.isArray(c.children)) {
          for (const gc of c.children) {
            const gcid = gc.id.toLowerCase()
            if (name === gcid || path === gcid) return gc.id
          }
        }
      }
    }
  }
  return name === 'myemployees' ? 'my-employees' : 'dashboard'
})

/* 父级展开状态：默认全部展开。
 * 若当前激活的是某个父级下的子项(含 3 级),自动展开其所有祖先父级。 */
const expanded = ref(new Set(
  MOCK.nav
    .filter((n) => Array.isArray(n.children) && n.children.length)
    .flatMap((n) => [n.id, ...n.children.filter((c) => Array.isArray(c.children) && c.children.length).map((c) => c.id)])
))
watch(
  () => activeRoute.value,
  (cur) => {
    // 1) 直接父级
    const parent = MOCK.nav.find((n) => Array.isArray(n.children) && n.children.some((c) => c.id === cur))
    if (parent) expanded.value.add(parent.id)
    // 2) 中间父级(祖父 -> 父级 -> 当前孙)
    for (const gp of MOCK.nav) {
      if (!Array.isArray(gp.children)) continue
      const mid = gp.children.find((m) => Array.isArray(m.children) && m.children.some((gc) => gc.id === cur))
      if (mid) {
        expanded.value.add(gp.id)
        expanded.value.add(mid.id)
      }
    }
  },
  { immediate: true }
)
function toggleGroup(id) {
  if (expanded.value.has(id)) expanded.value.delete(id)
  else expanded.value.add(id)
  // 触发响应式更新
  expanded.value = new Set(expanded.value)
}
function isGroupOpen(id) { return expanded.value.has(id) }
/* 父级激活判断:自身选中 / 任一直接子项选中 / 任一孙项选中 */
function isGroupActive(item) {
  if (activeRoute.value === item.id) return true
  if (!Array.isArray(item.children)) return false
  for (const c of item.children) {
    if (c.id === activeRoute.value) return true
    if (Array.isArray(c.children) && c.children.some((gc) => gc.id === activeRoute.value)) return true
  }
  return false
}

const navGroups = computed(() => {
  const groups = { main: [], aux: [] }
  for (const item of MOCK.nav) {
    if (groups[item.group]) groups[item.group].push(item)
  }
  return groups
})

const systemMetrics = [
  { label: 'CPU',  value: '42%', w: '42%' },
  { label: 'GPU',  value: '68%', w: '68%', color: 'var(--accent)' },
  { label: '存储', value: '31%', w: '31%' },
]

// 图标库（与 prototype copy 保持一致）
const ICON_PATHS = {
  home:        '<path d="M3 12 12 3l9 9"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  grid:        '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.4"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><path d="M14 20c0-2 2-3.5 4-3.5s4 1.5 4 3.5"/>',
  user:        '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>',
  plus:        '<path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="9"/>',
  chart:       '<path d="M3 3v18h18"/><path d="M7 14l3-3 4 4 5-7"/>',
  folder:      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  activity:    '<path d="M3 12h4l3-9 4 18 3-9h4"/>',
  check:       '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  shield:      '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  settings:    '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.36.16.66.43.86.77s.27.71.24 1.09c.6.16 1.07.66 1.27 1.27.2.6.13 1.27-.24 1.82l-.06.06a1.65 1.65 0 0 0-.33 1.82V15z"/>',
  // 兼容 Element Plus 图标名（来自 mock-data.js）
  Odometer:    '<path d="M3 12 12 3l9 9"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  UserFilled:  '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>',
  // 智能体 — AI 芯片(中央方形内核 + 四向引脚),表达智能处理/计算
  Cpu:         '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
  Star:        '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
  MagicStick:  '<path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="9"/>',
  DataAnalysis:'<path d="M3 3v18h18"/><path d="M7 14l3-3 4 4 5-7"/>',
  Connection:  '<path d="M3 12h4l3-9 4 18 3-9h4"/>',
  // 智能中心 — 4 角 AI 闪光星(智能/AI 通用视觉符号),内含小卫星闪光强化"中心+智能"双重语义
  Sparkles:    '<path d="M12 3l1.6 7.4L21 12l-7.4 1.6L12 21l-1.6-7.4L3 12l7.4-1.6z"/><path d="M19 3l.6 1.8L21.5 5.4l-1.9.6L19 8l-.6-2-1.9-.6 1.9-.6z"/>',
  Folder:      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  Stamp:       '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  Document:    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h6"/>',
  Setting:     '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.36.16.66.43.86.77s.27.71.24 1.09c.6.16 1.07.66 1.27 1.27.2.6.13 1.27-.24 1.82l-.06.06a1.65 1.65 0 0 0-.33 1.82V15z"/>',
  // 数字员工 — 多人群组
  Group:       '<circle cx="9" cy="8" r="3.2"/><path d="M2 20c0-3 3-5 7-5s7 2 7 5"/><circle cx="17" cy="9" r="2.4"/><path d="M15 13.5c2.5 0 6 1.2 6 3.5"/>',
  // 智能中心 — 知识库/专栏相关
  Reading:     '<path d="M2 4h6a4 4 0 0 1 4 4v12"/><path d="M22 4h-6a4 4 0 0 0-4 4v12"/><path d="M2 4v15h6a4 4 0 0 1 4 1"/>',
}
function iconSvg(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name] || ICON_PATHS.grid}</svg>`
}

function onSelect(id) {
  router.push(`/${id === 'my-employees' ? 'my-employees' : id}`)
  appStore.closeMobileDrawer()
}
</script>

<style scoped>
/* =====================================================
   1:1 对齐 prototype copy（class 命名遵循 BEM）
   ===================================================== */
.app-layout {
  position: relative;
  min-height: 100vh;
  /* 当前侧边栏宽度（展开 = --sidebar-w；收起 = --sidebar-w-mini） */
  --sidebar-current-w: var(--sidebar-w);
  /* 不再使用 grid：aside 改为 fixed 定位，由 .app-main 的 margin-left 预留空间 */
}
.app-layout.is-collapsed {
  --sidebar-current-w: var(--sidebar-w-mini);
}
.app-sidebar {
  /* 真固定定位：相对视口，滚动时保持位置不变 */
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: var(--sidebar-current-w);
  z-index: 10;
  display: flex;
  flex-direction: column;
  padding: 20px 14px;
  background: linear-gradient(180deg, var(--surface) 0%, var(--surface-2) 100%);
  border-right: 1px solid var(--line);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  /* 桌面端折叠动画 · 移动端抽屉动画统一使用同一令牌 */
  transition:
    width var(--dur-side) var(--ease-soft),
    transform var(--dur-side) var(--ease-soft);
  will-change: width, transform;
  /* 内容超出 100vh 时由 sidebar 自身承接滚动，但保持不出现独立 nav 滚动条 */
  overflow: hidden;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--line-2) transparent;
}
.app-sidebar::-webkit-scrollbar { width: 6px; }
.app-sidebar::-webkit-scrollbar-track { background: transparent; }
.app-sidebar::-webkit-scrollbar-thumb { background: var(--line-2); border-radius: 3px; }
.app-sidebar::-webkit-scrollbar-thumb:hover { background: var(--ink-3); }

/* ============== BRAND ============== */
.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px 20px;
  height: 66px;
}
.brand__logo {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  transition: transform var(--dur-base) var(--ease-spring);
}
.brand__logo:hover { transform: rotate(8deg) scale(1.05); }
.brand__logo svg { width: 100%; height: 100%; }
.brand__core { fill: var(--accent); }
.brand__ring { stroke: var(--accent); stroke-width: 0.8; opacity: 0.6; fill: none; }
.brand__sat  { fill: var(--accent-2); }
.brand__text {
  line-height: 1.2;
  min-width: 0;
  /* 内容随侧边栏宽度同步淡出 + 收回，避免截断/突兀 */
  max-width: 200px;
  opacity: 1;
  transform: translateZ(0);
  transition:
    opacity var(--dur-side) var(--ease-soft),
    max-width var(--dur-side) var(--ease-soft),
    transform var(--dur-side) var(--ease-soft);
}
.brand__title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--ink);
}
.brand__subtitle {
  font-size: 11px;
  color: var(--ink-3);
  letter-spacing: 0.04em;
  margin-top: 2px;
}

/* ============== NAV ============== */
.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  /* 关键修复：不强制 flex:1 也不设 overflow-y:auto
     避免主导航内部产生独立滚动条
     内容超出时由 .app-sidebar 整体承接滚动 */
  flex: 0 0 auto;
  min-height: 0;
  overflow: visible;
}
.sidebar__nav + .sidebar__divider { margin-top: 12px; }
.sidebar__divider {
  height: 1px;
  background: var(--line);
  margin: 16px 8px;
}
.nav__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  color: var(--ink-2);
  font-size: 13.5px;
  font-weight: 500;
  /* 60fps: 仅过渡颜色/背景/transform */
  transition:
    background-color var(--dur-fast) var(--ease),
    color var(--dur-fast) var(--ease),
    transform var(--dur-fast) var(--ease);
  cursor: pointer;
  text-decoration: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  /* 防止 flex 子项因 min-width:auto 而撑出容器 */
  min-width: 0;
}
.nav__item:hover { background: var(--surface-2); color: var(--ink); }
.nav__item:active { transform: scale(0.98); }
.nav__item.is-active {
  color: var(--ink);
  background: linear-gradient(90deg, var(--accent-soft), transparent 80%);
}
.nav__item.is-active::before {
  content: '';
  position: absolute;
  left: 0; top: 8px; bottom: 8px;
  width: 2px;
  background: var(--accent);
  border-radius: 2px;
  box-shadow: 0 0 12px var(--accent-glow);
  animation: activeBarIn var(--dur-slow) var(--ease-spring) both;
}
@keyframes activeBarIn {
  0%   { transform: scaleY(0.3); opacity: 0; }
  100% { transform: scaleY(1);   opacity: 1; }
}
.nav__icon {
  width: 20px;
  height: 20px;
  display: inline-flex;
  flex-shrink: 0;
  color: var(--ink-2);
  transition: color var(--dur-fast) var(--ease);
}
.nav__icon :deep(svg) { width: 100%; height: 100%; }
.nav__item.is-active .nav__icon { color: var(--accent); }
.nav__label {
  flex: 1 1 0;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* 文字内容随侧边栏宽度同步淡出 + 收回 */
  max-width: 180px;
  opacity: 1;
  transform: translateZ(0);
  transition:
    opacity var(--dur-side) var(--ease-soft),
    max-width var(--dur-side) var(--ease-soft),
    transform var(--dur-side) var(--ease-soft);
}
.nav__count {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--surface-3);
  color: var(--ink-2);
  letter-spacing: 0.04em;
  /* 数字徽标随侧边栏宽度同步淡出 + 收回 */
  max-width: 60px;
  opacity: 1;
  overflow: hidden;
  transform: translateZ(0);
  transition:
    background-color var(--dur-fast) var(--ease),
    color var(--dur-fast) var(--ease),
    opacity var(--dur-side) var(--ease-soft),
    max-width var(--dur-side) var(--ease-soft),
    padding var(--dur-side) var(--ease-soft),
    transform var(--dur-side) var(--ease-soft);
}
/* 折叠时统一淡出 + 收回占位，避免内容截断/突兀 */
.is-collapsed-hide {
  opacity: 0 !important;
  pointer-events: none;
  transform: translateZ(0);
}
/* 文字类元素（brand__text / nav__label）：随宽度收回 */
.brand__text.is-collapsed-hide,
.nav__label.is-collapsed-hide {
  max-width: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}
/* 徽标/计数：随宽度收回 */
.nav__count.is-collapsed-hide {
  max-width: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}
/* 底部信息卡：随高度收回 */
.sidebar__footer.is-collapsed-hide {
  max-height: 0 !important;
  padding-top: 0 !important;
}
.nav__count--live {
  background: var(--accent);
  color: #fff;
  position: relative;
}
.nav__count--live::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 999px;
  border: 1px solid var(--accent);
  animation: livePing 1.6s ease-out infinite;
}
@keyframes livePing {
  0%   { transform: scale(1);   opacity: 0.7; }
  100% { transform: scale(1.6); opacity: 0; }
}
.nav__pulse {
  display: none;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent-glow);
}
.app-layout.is-collapsed .nav__item.is-active .nav__pulse {
  display: block;
  animation: livePing 1.8s ease-out infinite;
}

/* ============== 父级 + 二级子导航 ============== */
.nav__group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: relative;
}
/* 父级项与基础 .nav__item 样式一致;右侧用 chevron 替代 count 位置 */
.nav__item--parent {
  cursor: pointer;
}
.nav__chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  font-size: 16px;
  line-height: 1;
  color: var(--ink-3);
  margin-left: auto;
  transition:
    transform var(--dur-base) var(--ease-spring),
    color var(--dur-fast) var(--ease),
    opacity var(--dur-side) var(--ease-soft);
}
.nav__item--parent:hover .nav__chevron,
.nav__group.is-open .nav__chevron { color: var(--ink); }

/* 二级子菜单容器 */
.nav__sub {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin: 2px 0 4px 12px;
  padding: 4px 0 4px 10px;
  border-left: 1px dashed var(--line-2);
  /* 展开/收起动画(高度过渡) */
  animation: navSubIn var(--dur-base) var(--ease) both;
}
@keyframes navSubIn {
  0%   { opacity: 0; transform: translateY(-4px); }
  100% { opacity: 1; transform: translateY(0);    }
}

/* 二级项视觉降级(更小内边距、更小图标、更小字号) */
.nav__item--child {
  padding: 7px 10px;
  font-size: 12.5px;
  gap: 10px;
  border-radius: 8px;
}
.nav__icon--sm {
  width: 16px;
  height: 16px;
}
.nav__label--child {
  font-weight: 500;
  font-size: 12.5px;
  max-width: 160px;
}
.nav__count--child {
  font-size: 9.5px;
  padding: 1px 6px;
  letter-spacing: 0.04em;
}
/* 子项激活态:左侧细线 + primary 渐变背景(与一级一致但更弱) */
.nav__item--child.is-active {
  color: var(--ink);
  background: linear-gradient(90deg, var(--accent-soft), transparent 70%);
}
.nav__item--child.is-active::before {
  content: '';
  position: absolute;
  left: -1px; top: 6px; bottom: 6px;
  width: 2px;
  background: var(--accent);
  border-radius: 2px;
  box-shadow: 0 0 10px var(--accent-glow);
}
/* 父级激活态:即使未点击展开,只要有子项激活,父级也高亮 */
.nav__group.is-active > .nav__item--parent {
  color: var(--ink);
  background: linear-gradient(90deg, var(--accent-soft), transparent 80%);
}
.nav__group.is-active > .nav__item--parent::before {
  content: '';
  position: absolute;
  left: 0; top: 8px; bottom: 8px;
  width: 2px;
  background: var(--accent);
  border-radius: 2px;
  box-shadow: 0 0 12px var(--accent-glow);
  animation: activeBarIn var(--dur-slow) var(--ease-spring) both;
}

/* 父级展开时,折叠侧边栏下隐藏整组子菜单 */
.app-layout.is-collapsed .nav__sub { display: none !important; }

/* ============== 三级嵌套(二级项本身又是父级,如 知识库) ============== */
.nav__group--nested {
  /* 嵌套时不需要外间距,延续 .nav__sub 的视觉 */
  gap: 1px;
}
.nav__item--nested {
  /* 让二级项的"可点击父级"与普通二级项视觉一致 */
  position: relative;
}
.nav__chevron--sm {
  width: 14px;
  height: 14px;
  font-size: 14px;
  margin-left: auto;
  color: var(--ink-3);
  transition:
    transform var(--dur-base) var(--ease-spring),
    color var(--dur-fast) var(--ease);
}
.nav__item--nested:hover .nav__chevron--sm,
.nav__group--nested.is-open .nav__chevron--sm { color: var(--ink); }

/* 三级容器:更小缩进,与虚线分层 */
.nav__sub--nested {
  margin: 2px 0 4px 8px;
  padding: 2px 0 2px 8px;
  border-left: 1px dashed var(--line-2);
  animation: navSubIn var(--dur-base) var(--ease) both;
}

/* 三级叶子项:更小字号 + 最小内边距 */
.nav__item--grand {
  padding: 5px 8px;
  font-size: 11.5px;
  gap: 8px;
  border-radius: 6px;
}
.nav__icon--xs {
  width: 14px;
  height: 14px;
}
.nav__label--grand {
  font-size: 11.5px;
  font-weight: 500;
  max-width: 140px;
}
.nav__count--grand {
  font-size: 9px;
  padding: 0 5px;
  letter-spacing: 0.04em;
}
/* 三级项激活态:沿用渐变 + 左侧细线(更细) */
.nav__item--grand.is-active {
  color: var(--ink);
  background: linear-gradient(90deg, var(--accent-soft), transparent 60%);
}
.nav__item--grand.is-active::before {
  content: '';
  position: absolute;
  left: -1px; top: 4px; bottom: 4px;
  width: 2px;
  background: var(--accent);
  border-radius: 2px;
  box-shadow: 0 0 8px var(--accent-glow);
}
/* 嵌套父级(如 知识库)激活:任何三级子项激活时高亮 */
.nav__group--nested.is-active > .nav__item--nested {
  color: var(--ink);
  background: linear-gradient(90deg, var(--accent-soft), transparent 70%);
}
.nav__group--nested.is-active > .nav__item--nested::before {
  content: '';
  position: absolute;
  left: 0; top: 6px; bottom: 6px;
  width: 2px;
  background: var(--accent);
  border-radius: 2px;
  box-shadow: 0 0 10px var(--accent-glow);
  animation: activeBarIn var(--dur-slow) var(--ease-spring) both;
}
/* 折叠侧边栏时隐藏三级 */
.app-layout.is-collapsed .nav__sub--nested { display: none !important; }

/* ============== FOOTER / SYSTEM CARD ============== */
.sidebar__footer {
  margin-top: auto;
  padding-top: 16px;
  /* 防止 footer 被 flex 压缩，内容始终完整可见 */
  flex: 0 0 auto;
  /* 折叠时与侧边栏宽度同步淡出 + 收回 */
  max-height: 240px;
  opacity: 1;
  overflow: hidden;
  transform: translateZ(0);
  transition:
    opacity var(--dur-side) var(--ease-soft),
    max-height var(--dur-side) var(--ease-soft),
    padding-top var(--dur-side) var(--ease-soft),
    transform var(--dur-side) var(--ease-soft);
}
.system-card {
  padding: 14px;
  border-radius: var(--radius);
  background: var(--surface-2);
  border: 1px solid var(--line);
}
.system-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.system-card__label {
  font-size: 11px;
  color: var(--ink-3);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--surface-3);
  color: var(--ink-2);
}
.status-pill--ok { color: var(--ok); }
.status-pill--ok .status-pill__dot { background: var(--ok); box-shadow: 0 0 8px var(--ok); }
.status-pill__dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--ink-3);
}
.system-card__metric { display: flex; flex-direction: column; }
.metric-mini {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  font-size: 11px;
}
.metric-mini__label {
  width: 32px;
  color: var(--ink-3);
  font-family: var(--font-mono);
}
.metric-mini__bar {
  flex: 1;
  height: 4px;
  background: var(--line);
  border-radius: 2px;
  overflow: hidden;
}
.metric-mini__bar span {
  display: block;
  height: 100%;
  width: var(--w, 50%);
  background: var(--ok);
  border-radius: 2px;
  transition: width 1s var(--ease);
}
.metric-mini__bar span[style*="--c"] { background: var(--c, var(--ok)); }
.metric-mini__val {
  width: 32px;
  text-align: right;
  font-family: var(--font-mono);
  color: var(--ink-2);
}

/* ============== MAIN ============== */
.app-main {
  min-width: 0;
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  /* 为 fixed 侧边栏预留空间，使用 --sidebar-current-w 同步展开/收起 */
  margin-left: var(--sidebar-current-w);
  /* 与侧边栏同步过渡 */
  transition: margin-left var(--dur-side) var(--ease-soft);
}
.app-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  /* 为 fixed 顶部栏预留空间，避免内容被覆盖 */
  padding-top: var(--topbar-h);
}
.app-content-body {
  flex: 1;
  min-width: 0;
  margin-top: 0;
  margin-bottom: 0;
  padding: 32px var(--content-pad) var(--sp-8);
  transform: translate3d(0, 0, 0);
}

.mobile-mask {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 19;
  /* 与抽屉滑入同步 */
  animation: mobileMaskIn var(--dur-side) var(--ease-soft) both;
}
@keyframes mobileMaskIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ============== RESPONSIVE ============== */
@media (max-width: 768px) {
  /* 移动端：主区域占满，避开 fixed 侧边栏的占位 */
  .app-main { margin-left: 0; }
  .app-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    width: var(--sidebar-w) !important;
    transform: translate3d(-100%, 0, 0);
    transition: transform var(--dur-side) var(--ease-soft);
    z-index: 20;
    box-shadow: var(--shadow-lg);
  }
  .app-sidebar.collapsed { transform: translate3d(-100%, 0, 0); }
  .app-layout.is-mobile-open .app-sidebar { transform: translate3d(0, 0, 0); }
  .mobile-mask {
    display: block;
    /* 移动端遮罩淡入，与抽屉同步 */
    transition: opacity var(--dur-side) var(--ease-soft);
  }
  /* 移动端打开抽屉时，强制显示完整内容（不折叠） */
  .app-layout.is-mobile-open .is-collapsed-hide {
    opacity: 1 !important;
    max-width: none !important;
    max-height: none !important;
    pointer-events: auto;
  }
  .app-layout.is-mobile-open .brand__text { max-width: 200px; }
  .app-layout.is-mobile-open .nav__label { max-width: 180px; }
  .app-layout.is-mobile-open .nav__count { max-width: 60px; padding: 2px 7px; }
  .app-layout.is-mobile-open .sidebar__footer { max-height: 240px; padding-top: 16px; }
}
</style>
