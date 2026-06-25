<template>
  <header class="topbar">
    <div class="topbar__left">
      <!-- 移动端：抽屉按钮 -->
      <button class="iconbtn mobile-only" @click="emit('toggleDrawer')" aria-label="打开菜单">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <path d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
      <!-- 桌面端：折叠按钮 -->
      <button
        id="sidebarToggle"
        class="iconbtn desktop-only"
        @click="emit('toggleSidebar')"
        :aria-label="appStore.sidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18M3 12h18M3 18h18"/>
        </svg>
      </button>

      <nav class="breadcrumb desktop-only" aria-label="面包屑">
        <template v-for="(seg, i) in breadcrumbTrail" :key="seg.id || i">
          <span v-if="i > 0" class="breadcrumb__sep">/</span>
          <a
            v-if="seg.clickable && i < breadcrumbTrail.length - 1"
            class="breadcrumb__item"
            @click="goCrumb(seg.id)"
          >{{ seg.label }}</a>
          <span
            v-else
            class="breadcrumb__item breadcrumb__item--current"
            :id="i === breadcrumbTrail.length - 1 ? 'breadcrumbCurrent' : undefined"
          >{{ seg.label }}</span>
        </template>
      </nav>
    </div>

    <div class="topbar__search">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="7"/>
        <path d="m21 21-4.3-4.3"/>
      </svg>
      <input
        v-model="query"
        type="text"
        placeholder="搜索员工、Skill、知识库、文档…"
        @input="onSearch"
      />
      <kbd class="desktop-only">⌘K</kbd>
    </div>

    <div class="topbar__right">
      <!-- 通知（带 badge） -->
      <div class="notif-wrap">
        <button
          class="iconbtn iconbtn--badge"
          :class="{ active: notifOpen }"
          aria-label="通知"
          @click="notifOpen = !notifOpen"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          </svg>
          <span v-if="notifCount" class="iconbtn__badge">{{ notifCount }}</span>
        </button>
        <transition name="popover">
          <div v-if="notifOpen" class="notif-panel" @click.stop>
            <div class="notif-head">
              <span>通知</span>
              <button v-if="userStore.notifications.length" class="link-btn" @click="userStore.clearNotifications()">全部已读</button>
            </div>
            <div v-if="!userStore.notifications.length" class="notif-empty">暂无新通知</div>
            <div v-for="n in userStore.notifications" :key="n.id" class="notif-item">
              <div class="notif-title">{{ n.title }}</div>
              <div class="notif-desc">{{ n.desc }}</div>
              <div class="notif-time">{{ n.time }}</div>
            </div>
          </div>
        </transition>
      </div>

      <!-- 帮助 -->
      <button
        id="helpBtn"
        class="iconbtn desktop-only"
        aria-label="帮助"
        title="帮助中心"
        @click="onHelp"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <path d="M12 17h.01"/>
        </svg>
      </button>

      <!-- 主题切换 -->
      <button
        id="themeToggle"
        class="iconbtn"
        :class="{ 'is-switching': switching }"
        :aria-label="appStore.theme === 'dark' ? '切换浅色' : '切换深色'"
        @click="onToggleTheme"
      >
        <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
        </svg>
        <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>

      <!-- 设置 -->
      <button
        id="settingsBtn"
        class="iconbtn"
        aria-label="设置"
        title="系统设置"
        @click="goSettings"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.36.16.66.43.86.77s.27.71.24 1.09c.6.16 1.07.66 1.27 1.27.2.6.13 1.27-.24 1.82l-.06.06a1.65 1.65 0 0 0-.33 1.82V15z"/>
        </svg>
      </button>

      <!-- 退出 -->
      <button
        id="logoutBtn"
        class="iconbtn desktop-only"
        aria-label="退出"
        title="退出登录"
        @click="onLogout"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <path d="M16 17l5-5-5-5"/>
          <path d="M21 12H9"/>
        </svg>
      </button>

      <!-- 用户 chip（对齐 prototype copy 样式，LZ 头像 + 姓名 + 职位） -->
      <div class="user-chip">
        <div class="avatar">
          <span>{{ userStore.initials || 'LZ' }}</span>
          <i class="avatar__status"></i>
        </div>
        <div class="user-chip__text hide-on-narrow">
          <div class="user-chip__name">{{ userStore.name || '李正' }}</div>
          <div class="user-chip__role">{{ userStore.title || '运营主管' }}</div>
        </div>
      </div>
    </div>

    <!-- 弹层遮罩 -->
    <div v-if="notifOpen" class="popover-mask" @click="notifOpen = false" />
  </header>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import { MOCK } from '@/api/mock-data'

const emit = defineEmits(['toggleSidebar', 'toggleDrawer'])
const appStore = useAppStore()
const userStore = useUserStore()
const toast = useToastStore()
const route = useRoute()
const router = useRouter()

const query = ref(appStore.topbarQuery || '')
const notifOpen = ref(false)
const switching = ref(false)

watch(query, (v) => appStore.setTopbarQuery(v))
function onSearch(v) { appStore.setTopbarQuery(v) }

// 通知数量（badge）：与 prototype copy 的 "3" 对齐
const notifCount = computed(() => userStore.notifications?.length || 0)

/* 完整面包屑链：根据当前路由解析归属,支持父级 + 子级 + 三级孙级多级导航
 * 返回 { id, label, clickable }[] 数组,最后一项为当前页(不可点击)
 *
 * 设计原则:面包屑与侧边栏严格对齐,只显示从根到当前页的路径,
 * 不再以"工作台"作为强制前缀,避免在选择其他导航项时出现多余的"工作台"层级 */
const breadcrumbTrail = computed(() => {
  const name = String(route.name || '').toLowerCase()
  const path = route.path.replace(/^\//, '').toLowerCase()
  // 工作台为根页面,面包屑仅显示"工作台"一项,与侧边栏选中态一致
  if (name === 'workbench' || path === 'workbench') {
    return [{ id: 'workbench', label: '工作台', clickable: false }]
  }
  // 0) 特殊处理:知识库文档管理 (KbDocuments 路由)
  //    归到 智能中心 → 知识库 → 个人知识库 → 文档管理
  if (name === 'kbdocuments' || path.startsWith('personal-kb/')) {
    return [
      { id: 'smart-center', label: '智能中心',  clickable: true },
      { id: 'knowledge',    label: '知识库',    clickable: true },
      { id: 'personal-kb',  label: '个人知识库', clickable: true },
      { id: 'kb-docs',      label: '文档管理',  clickable: false },
    ]
  }
  // 0.5) 特殊处理:专栏详情 (ColumnDetail 路由)
  //    归到 智能中心 → 知识库 → 专栏订阅 → 专栏详情
  //    注意: /columns/:id 需与 /columns(市场)/columns/article/:id 区分
  if (
    name === 'columndetail' ||
    (path.startsWith('columns/') &&
     !path.startsWith('columns/article/') &&
     path !== 'columns')
  ) {
    return [
      { id: 'smart-center', label: '智能中心', clickable: true },
      { id: 'knowledge',    label: '知识库',   clickable: true },
      { id: 'columns',      label: '专栏订阅', clickable: true },
      { id: 'column',       label: '专栏详情', clickable: false },
    ]
  }
  // 0.6) 特殊处理:专栏文章详情 (ColumnArticle 路由)
  //    归到 智能中心 → 知识库 → 专栏订阅 → 文章详情
  if (name === 'columnarticle' || path.startsWith('columns/article/')) {
    return [
      { id: 'smart-center', label: '智能中心', clickable: true },
      { id: 'knowledge',    label: '知识库',   clickable: true },
      { id: 'columns',      label: '专栏订阅', clickable: true },
      { id: 'article',      label: '文章详情', clickable: false },
    ]
  }
  // 1) 优先匹配三级孙项(智能中心 → 知识库 → 个人知识库/专栏订阅)
  for (const parent of MOCK.nav) {
    if (!Array.isArray(parent.children)) continue
    for (const child of parent.children) {
      if (!Array.isArray(child.children)) continue
      const grand = child.children.find((gc) => {
        const gcid = gc.id.toLowerCase()
        return name === gcid || path === gcid
      })
      if (grand) {
        return [
          { id: parent.id, label: parent.label, clickable: true },
          { id: child.id,  label: child.label,  clickable: true },
          { id: grand.id,  label: grand.label,  clickable: false },
        ]
      }
    }
  }
  // 2) 匹配二级子项(若命中,返回 [父级, 子级] 两段)
  for (const parent of MOCK.nav) {
    if (!Array.isArray(parent.children)) continue
    const child = parent.children.find((c) => {
      const cid = c.id.toLowerCase()
      const cRouteId = cid === 'my-employees' ? 'myemployees' : cid
      return name === cRouteId || path === cid
    })
    if (child) {
      return [
        { id: parent.id, label: parent.label, clickable: true },
        { id: child.id,  label: child.label,  clickable: false },
      ]
    }
  }
  // 3) 匹配顶级叶子项(返回单项)
  for (const n of MOCK.nav) {
    const id = n.id.toLowerCase()
    const routeId = id === 'my-employees' ? 'myemployees' : id
    if (name === routeId || path === id) {
      return [{ id: n.id, label: n.label, clickable: false }]
    }
  }
  // 4) 默认 fallback: 未匹配到导航时(例如 404),面包屑显示"工作台"
  return [{ id: 'workbench', label: '工作台', clickable: false }]
})

/* 面包屑中间项点击:跳转到对应层级页面。
 *
 * 实现要点:
 *   1. 递归搜索整个 nav 树(顶级 / 子级 / 孙级),
 *      解决子级、孙级面包屑项(如"知识库""个人知识库")在顶级数组中找不到的问题
 *   2. 命中项若含子级,默认跳到第一个子级,
 *      保证点击行为可见且不会跳到空白页(父级无独立路由) */
function goCrumb(id) {
  // 在 nav 树中递归查找目标 id
  const findInNav = (list, targetId) => {
    for (const n of list) {
      if (n.id === targetId) return n
      if (Array.isArray(n.children)) {
        const found = findInNav(n.children, targetId)
        if (found) return found
      }
    }
    return null
  }
  const target = findInNav(MOCK.nav, id)
  if (!target) return
  if (Array.isArray(target.children) && target.children.length) {
    router.push(`/${target.children[0].id}`)
  } else {
    router.push(`/${id}`)
  }
}

function onToggleTheme() {
  switching.value = true
  setTimeout(() => (switching.value = false), 320)
  appStore.toggleTheme()
}

function onHelp() {
  toast.info('帮助中心正在准备中…')
}

function onLogout() {
  toast.success('已退出（演示）')
}

function goSettings() {
  router.push('/settings')
}

function onKey(e) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    const el = document.querySelector('.topbar__search input')
    el?.focus()
  }
  if (e.key === 'Escape') notifOpen.value = false
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
/* =====================================================
   1:1 对齐 prototype copy（class 命名遵循 BEM）
   ===================================================== */
.topbar {
  /* 真固定定位：相对视口，滚动时保持在主区域顶部 */
  position: fixed;
  top: 0;
  left: var(--sidebar-current-w, var(--sidebar-w));
  right: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 14px 28px;
  background: linear-gradient(180deg, var(--surface) 0%, var(--surface-2) 100%);
  border-bottom: 1px solid var(--line);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  /* 与侧边栏展开/收起同步：left 与宽度联动 */
  transition: left var(--dur-side) var(--ease-soft);
  /* 启用 GPU 合成 */
  transform: translate3d(0, 0, 0);
}

/* ============== LEFT ============== */
.topbar__left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  /* 让面包屑整体可被压缩,避免在窄屏下挤占 search 区域 */
  min-width: 0;
  flex-wrap: nowrap;
  overflow: hidden;
  /* 限制单行并允许子项省略号(中间项) */
  white-space: nowrap;
  text-overflow: ellipsis;
}
.breadcrumb__item {
  color: var(--ink-3);
  cursor: pointer;
  user-select: none;
  /* 平滑的颜色与下划线过渡,跨浏览器一致 */
  transition:
    color var(--dur-fast) var(--ease),
    text-shadow var(--dur-fast) var(--ease);
  text-decoration: none;
  border-radius: 4px;
  padding: 2px 4px;
  margin: -2px -4px;
  /* 中间项 hover 显示下划线提示可点击 */
  position: relative;
}
.breadcrumb__item:hover {
  color: var(--ink);
  text-shadow: 0 0 1px var(--ink-2);
}
.breadcrumb__item:active { transform: translateY(0.5px); }
.breadcrumb__item--current {
  color: var(--ink);
  font-weight: 500;
  cursor: default;
  /* 切换 current 时用 <Transition> 包裹不会闪烁 — 走 CSS 渐变更稳 */
  animation: crumbCurrentIn var(--dur-base) var(--ease) both;
}
.breadcrumb__sep {
  color: var(--ink-4);
  user-select: none;
  font-weight: 400;
}
@keyframes crumbCurrentIn {
  0%   { opacity: 0; transform: translateY(-2px); }
  100% { opacity: 1; transform: translateY(0);    }
}

/* ============== SEARCH ============== */
.topbar__search {
  flex: 1;
  max-width: 480px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 10px;
  margin: 0 auto;
  /* 60fps: 仅动画 border / box-shadow（无 layout 开销） */
  transition:
    border-color var(--dur-fast) var(--ease),
    box-shadow var(--dur-fast) var(--ease);
}
.topbar__search:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-soft);
}
.topbar__search svg {
  width: 16px;
  height: 16px;
  color: var(--ink-3);
  flex-shrink: 0;
}
.topbar__search input {
  flex: 1;
  background: transparent;
  border: 0;
  outline: 0;
  font-size: 13.5px;
  color: var(--ink);
  min-width: 0;
}
.topbar__search input::placeholder { color: var(--ink-3); }
.topbar__search kbd {
  font-family: var(--font-mono);
  font-size: 10.5px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--surface-3);
  color: var(--ink-3);
  border: 1px solid var(--line);
}

/* ============== RIGHT ============== */
.topbar__right { display: flex; align-items: center; gap: 12px; }
.iconbtn {
  position: relative;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: var(--ink-2);
  background: transparent;
  border: 0;
  cursor: pointer;
  /* 60fps */
  transition:
    background-color var(--dur-fast) var(--ease),
    color var(--dur-fast) var(--ease),
    transform var(--dur-fast) var(--ease);
}
.iconbtn:hover { background: var(--surface-2); color: var(--ink); }
.iconbtn:active { transform: scale(0.92); }
.iconbtn svg { width: 18px; height: 18px; }
.iconbtn__badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--danger);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 999px;
  padding: 0 4px;
  border: 2px solid var(--bg);
}

/* ============== THEME TOGGLE ============== */
#themeToggle .icon-sun,
#themeToggle .icon-moon {
  width: 18px;
  height: 18px;
  transition:
    transform 0.32s var(--ease),
    opacity 0.22s var(--ease);
}
/* 与静态原型保持一致：亮色只显 sun，暗色只显 moon */
html[data-theme="light"] #themeToggle .icon-moon { display: none; }
html[data-theme="dark"]  #themeToggle .icon-sun  { display: none; }
#themeToggle:hover { color: var(--accent); }
#themeToggle.is-switching .icon-sun,
#themeToggle.is-switching .icon-moon {
  transform: rotate(180deg) scale(0.6);
  opacity: 0;
}

/* ============== USER CHIP ============== */
.user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 12px 4px 4px;
  border-radius: 999px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  transition:
    background-color var(--dur-fast) var(--ease),
    border-color var(--dur-fast) var(--ease),
    transform var(--dur-fast) var(--ease);
  cursor: pointer;
}
.user-chip:hover { background: var(--surface-3); border-color: var(--line-2); }
.user-chip:active { transform: scale(0.97); }
.avatar {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}
.avatar__status {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 9px;
  height: 9px;
  background: var(--ok);
  border-radius: 50%;
  border: 2px solid var(--bg);
  box-shadow: 0 0 8px var(--ok);
}
.user-chip__text { display: flex; flex-direction: column; line-height: 1.2; }
.user-chip__name { font-size: 12.5px; font-weight: 500; color: var(--ink); }
.user-chip__role { font-size: 10.5px; color: var(--ink-3); letter-spacing: 0.04em; }

/* ============== NOTIF POPOVER ============== */
.notif-wrap { position: relative; }
.notif-panel {
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  width: 320px;
  min-width: 280px;
  background: var(--surface);
  border: 1px solid var(--line-2);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  backdrop-filter: var(--glass-blur);
  z-index: 30;
  overflow: hidden;
  transform: translate3d(0, 0, 0);
}
.popover-enter-active,
.popover-leave-active {
  transition:
    opacity var(--dur-fast) var(--ease-out),
    transform var(--dur-fast) var(--ease-out);
  will-change: opacity, transform;
}
.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: translate3d(0, -6px, 0);
}
.notif-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid var(--line);
  font-weight: 600;
  font-size: 13px;
}
.notif-empty { padding: 32px 0; text-align: center; color: var(--ink-3); font-size: 12.5px; }
.notif-item {
  padding: 10px 14px;
  border-bottom: 1px solid var(--line);
  transition: background-color var(--dur-fast) var(--ease);
  cursor: pointer;
}
.notif-item:hover { background: var(--surface-2); }
.notif-item:last-child { border-bottom: 0; }
.notif-title { font-size: 13px; font-weight: 500; }
.notif-desc { font-size: 12px; color: var(--ink-2); margin-top: 2px; }
.notif-time {
  font-size: 11px;
  color: var(--ink-3);
  font-family: var(--font-mono);
  margin-top: 4px;
}
.popover-mask {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: transparent;
}

.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-2);
  padding: 4px 8px;
  border-radius: 6px;
  background: transparent;
  border: 0;
  cursor: pointer;
  transition:
    color var(--dur-fast) var(--ease),
    background-color var(--dur-fast) var(--ease);
}
.link-btn:hover { color: var(--accent); background: var(--accent-soft); }

/* ============== RESPONSIVE ============== */
.mobile-only  { display: none; }
.desktop-only { display: inline-flex; }
.hide-on-narrow { display: initial; }

@media (max-width: 768px) {
  .mobile-only  { display: inline-flex; }
  .desktop-only { display: none; }
  .hide-on-narrow { display: none; }
  /* 移动端：侧边栏为抽屉，主区域占满宽度，topbar left 归零 */
  .topbar { padding: 12px 16px; gap: 10px; left: 0; }
  .topbar__search { max-width: none; }
}
@media (max-width: 480px) {
  .user-chip__text { display: none; }
}
</style>
