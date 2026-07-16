import { createRouter, createWebHashHistory } from 'vue-router'
import { MOCK } from '@/api/mock-data'
import { useAuthStore } from '@/stores/auth'

/**
 * 路由表：与原 prototype 保持 10 个业务页面 + 404
 * - 使用 Hash 模式，便于静态部署与 file:// 演示
 * - meta.title 用于设置 document.title
 * - meta.icon / meta.group 用于侧边栏分组渲染
 *
 * 性能优化：
 *   1. 路由组件预加载（首屏空闲时）
 *   2. 复用单次组件实例，避免重复加载
 *   3. scrollBehavior 记忆浏览位置
 */
// 路由组件映射（懒加载），仅在触发预加载时通过动态 import() 解析
// 注:智能体模块已下线,移除 /agents 路由
// 注:专栏订阅已下线(2026-07),移除 /columns /columns/:id /columns/article/:id
// 注:原 /personal-kb 已迁移到 /knowledge(2026-07 个人知识库整体并入知识库),
//    旧路径保留重定向以兼容历史书签
const routeImports = {
  '/skills':         () => import('@/views/Skills.vue'),
  '/knowledge':      () => import('@/views/PersonalKb.vue'),
  '/knowledge/documents/:id': () => import('@/views/KbDocuments.vue'),
  '/plaza':          () => import('@/views/Plaza.vue'),
  '/my-employees':   () => import('@/views/MyEmployees.vue'),
  '/create':         () => import('@/views/Create.vue'),
  '/data':           () => import('@/views/DataView.vue'),
  '/tasks':          () => import('@/views/Tasks.vue'),
  '/files':          () => import('@/views/Files.vue'),
  '/review':         () => import('@/views/Review.vue'),
  '/audit':          () => import('@/views/Audit.vue'),
  '/settings':       () => import('@/views/Settings.vue'),
}

const routes = [
  /* 根路径：直接重定向到 /login
   *   - 未登录用户：直达登录页，无需经历"进入工作台 → 会话失效 → 提示退出 → 跳转登录"的繁琐流程
   *   - 已登录用户：登录页守卫会自动重定向到 /workbench（见下方 beforeEach）
   *   - 此设计将"是否已登录"的判断集中到登录页守卫，避免根路径与守卫逻辑冲突 */
  { path: '/', redirect: '/login' },
  // 旧路径兼容:早期版本使用 /dashboard,统一重定向到 /workbench
  { path: '/dashboard', redirect: '/workbench' },
  // 旧路径兼容:原 /personal-kb 已迁到 /knowledge,旧路径重定向到新路径
  { path: '/personal-kb', redirect: '/knowledge' },
  { path: '/personal-kb/:pathMatch(.*)*', redirect: (to) => `/knowledge/${to.params.pathMatch || ''}`.replace(/\/$/, '') || '/knowledge' },
  // 旧路径兼容:专栏订阅已下线,相关路径重定向到知识库首页
  { path: '/columns', redirect: '/knowledge' },
  { path: '/columns/:pathMatch(.*)*', redirect: '/knowledge' },

  // 登录页：public meta，独立布局（App.vue 中条件渲染，不使用 AppLayout）
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', group: 'aux', icon: 'Lock', public: true, hidden: true },
  },

  {
    path: '/workbench',
    name: 'Workbench',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '工作台', group: 'main', icon: 'Odometer' },
  },
  // 注:智能体路由(/agents)已下线,详见 mock-data.js 导航注释
  {
    path: '/skills',
    name: 'Skills',
    component: () => import('@/views/Skills.vue'),
    meta: { title: '技能', group: 'main', icon: 'MagicStick' },
  },
  // 原"个人知识库"已整体迁入"知识库"导航
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: () => import('@/views/PersonalKb.vue'),
    meta: { title: '知识库', group: 'main', icon: 'Folder' },
  },
  {
    path: '/knowledge/:id/documents',
    name: 'KbDocuments',
    component: () => import('@/views/KbDocuments.vue'),
    meta: { title: '知识库文档', group: 'main', icon: 'Folder', hidden: true },
  },
  // 注:专栏订阅路由(/columns /columns/:id /columns/article/:id)已下线(2026-07)
  {
    path: '/plaza',
    name: 'Plaza',
    component: () => import('@/views/Plaza.vue'),
    meta: { title: '员工广场', group: 'main', icon: 'UserFilled' },
  },
  {
    path: '/my-employees',
    name: 'MyEmployees',
    component: () => import('@/views/MyEmployees.vue'),
    meta: { title: '我的员工', group: 'main', icon: 'Star' },
  },
  {
    path: '/create',
    name: 'Create',
    component: () => import('@/views/Create.vue'),
    meta: { title: '创建员工', group: 'main', icon: 'MagicStick' },
  },
  {
    path: '/data',
    name: 'Data',
    component: () => import('@/views/DataView.vue'),
    meta: { title: '数据应用', group: 'main', icon: 'DataAnalysis' },
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('@/views/Tasks.vue'),
    meta: { title: '任务监控', group: 'aux', icon: 'Connection' },
  },
  {
    path: '/files',
    name: 'Files',
    component: () => import('@/views/Files.vue'),
    meta: { title: '文件中心', group: 'aux', icon: 'Folder' },
  },
  {
    path: '/review',
    name: 'Review',
    component: () => import('@/views/Review.vue'),
    meta: { title: '审核中心', group: 'aux', icon: 'Stamp' },
  },
  {
    path: '/audit',
    name: 'Audit',
    component: () => import('@/views/Audit.vue'),
    meta: { title: '审计日志', group: 'aux', icon: 'Document' },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: { title: '系统设置', group: 'admin', icon: 'Setting' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '信号丢失 · 404', group: 'aux', icon: 'WarningFilled' },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },
})

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = `${to.meta.title} · OrbitalCommand`
  }
})

/* ============================================================
 * 全局路由守卫：登录鉴权
 *  - 首次导航时 await bootstrap，确保 /auth/me 校验完成后再判断登录态
 *    避免"乐观 isAuthenticated=true"导致的"先进入工作台 → 后台校验失败 → 才退出"的延迟问题
 *  - public 路由（如 /login）始终放行；已登录访问 /login 时跳工作台
 *  - 受保护路由：未登录 → 重定向到 /login，并通过 query.redirect 记录原目标
 * ============================================================ */
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  if (!auth._bootstrapped) {
    /* 启动恢复是异步的；首屏路由等待 bootstrap 完成后再做鉴权决策 */
    try {
      await auth.bootstrap()
    } catch { /* 静默 */ }
  }

  const isPublic = !!to.meta?.public

  if (isPublic) {
    if (to.name === 'Login' && auth.isAuthenticated) {
      return next({ path: '/workbench', replace: true })
    }
    return next()
  }

  if (!auth.isAuthenticated) {
    auth.setRedirectAfterLogin(to.fullPath || '/workbench')
    return next({ path: '/login', query: { redirect: to.fullPath }, replace: true })
  }

  next()
})

/* ============================================================
 * 路由预加载：在浏览器空闲时段（requestIdleCallback）提前加载
 * 所有非首屏的路由组件，用户点击导航时即可「零等待」切换
 *
 * 实现说明：
 *   - 通过 `Promise.resolve().then(...)` 包裹动态 import，
 *     既能让 Rollup 静态分析正确解析路径，又能在单次预加载失败
 *     时不影响其他路由。
 * ============================================================ */

function preloadRoute(path) {
  const loader = routeImports[path]
  if (!loader) return
  // 使用 Promise.resolve 包裹，确保异常被静默吞噬（演示预加载失败不影响首屏）
  Promise.resolve()
    .then(() => loader())
    .catch(() => { /* 预加载失败：忽略，等用户点击时再走正常流程 */ })
}

export function startRoutePreload() {
  // 优先使用 requestIdleCallback，降级至 setTimeout
  const ric = (typeof window !== 'undefined' && window.requestIdleCallback)
    || ((cb) => setTimeout(cb, 1200))
  ric(() => {
    // 排除首屏（Workbench）与通配路由
    Object.keys(routeImports).forEach(preloadRoute)
  })
}

export { MOCK }
export default router
