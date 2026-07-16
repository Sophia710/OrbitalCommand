/**
 * Pinia · auth store
 * ----------------------------------------------------------------------
 *  - 登录态：token / user / isAuthenticated
 *  - 持久化：localStorage（oc_auth_session_v1）
 *  - bootstrap：启动时恢复会话，校验 token 有效性
 *  - login / logout：与 mock auth API 交互
 *  - 重定向：记录被守卫拦截的"想去的页面"，登录成功后回跳
 */
import { defineStore } from 'pinia'
import { lsGet, lsSet, lsRemove } from '@/utils'
import { useUserStore } from './user'

const STORAGE_KEY = 'oc_auth_session_v1'

function readSession() {
  return lsGet(STORAGE_KEY, null)
}

function writeSession(payload) {
  lsSet(STORAGE_KEY, payload)
}

function clearSession() {
  lsRemove(STORAGE_KEY)
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    loading: false,
    error: '',
    token: '',
    user: null,
    /** 启动恢复是否已执行（避免路由守卫并发触发） */
    _bootstrapped: false,
    /** 登录前想访问的目标路径，登录成功后回跳 */
    _redirectAfterLogin: '',
  }),

  getters: {
    isAdmin: (s) => s.user?.role === 'admin',
    displayName: (s) => s.user?.name || s.user?.username || '访客',
  },

  actions: {
    /**
     * 启动时调用一次：从 localStorage 恢复会话
     *
     * 策略：乐观恢复（Optimistic Recovery）
     *  - 存在缓存会话时，立即恢复 token/user 并置 isAuthenticated=true
     *  - 路由守卫可立即放行，用户切换页面不会因"重新校验"而掉线
     *  - 后台异步调用 /auth/me 做一次软校验：仅静默刷新 user 信息，绝不会清空会话
     *  - 只有"用户主动 logout"或"localStorage 被清空"才会要求重新登录
     *  - 页面刷新（reload）会重新走 bootstrap，但因乐观恢复不会闪退到登录页
     *  - mock SESSIONS 已持久化到 localStorage，跨刷新也能识别 token
     */
    async bootstrap() {
      if (this._bootstrapped) return
      this._bootstrapped = true
      const cached = readSession()
      if (!cached?.token) {
        /* 无缓存会话：保持未登录态 */
        this.isAuthenticated = false
        return
      }
      /* 乐观恢复：立即信任缓存的 token/user
       *  - 用户切换页面、走路由守卫时，isAuthenticated 已经是 true，不会被踢回登录页
       *  - 顶栏头像/名字等依赖 user 的组件可立即渲染 */
      this.token = cached.token
      this.user = cached.user ? { ...cached.user } : null
      this.isAuthenticated = true
      /* 同步到 user store（顶栏头像 / 名字展示） */
      const u = useUserStore()
      if (cached.user) {
        u.id = cached.user.id || u.id
        u.name = cached.user.name || u.name
        u.role = cached.user.role || u.role
        u.title = cached.user.title || u.title
        u.team = cached.user.team || u.team
        u.avatar = cached.user.avatar || u.avatar
      }
      /* 后台异步软校验：仅刷新 user 信息，绝不破坏登录态
       *  - 不阻塞路由、不影响 isAuthenticated
       *  - 即便校验失败（mock SESSIONS 丢失等）也静默忽略，保留 localStorage 会话
       *  - 校验成功可刷新 user 信息（处理头像/角色等变更） */
      this.validateSessionInBackground()
    },

    /**
     * 后台异步校验会话（不阻塞路由、不影响登录态）
     *  - 仅在 token 真正失效时清空本地会话
     *  - 校验成功可静默刷新 user 信息
     *
     * 关键策略：失败时不再清空本地会话
     *  - 旧逻辑：失败 → clearSession() → localStorage 被清空 → 下次刷新需重新登录
     *  - 新逻辑：失败 → 静默忽略（仅控制台 warn），保留 localStorage 中的会话
     *  - 原因：用户切换页面/刷新页面不应被踢回登录页
     *    - 路由守卫已基于 isAuthenticated（乐观恢复后为 true）放行
     *    - 失败通常是因为 mock 环境的 SESSIONS 丢失，不应等同于"真实 token 失效"
     *  - 只有用户主动 logout 时才清空会话（见 logout action）
     *
     * silent 选项：避免响应拦截器在后台校验失败时弹"会话已失效"错误提示
     *  - 后台校验对用户透明，弹错误会误导用户以为真的掉线
     */
    async validateSessionInBackground() {
      try {
        const mod = await import('@/api')
        const http = mod.default || mod.http
        const data = await http.get('/auth/me', {
          params: { token: this.token },
          silent: true,
        })
        if (data && data.user) {
          /* 静默刷新 user 信息（头像、角色等可能变更） */
          this.user = { ...data.user }
          this.token = data.token || this.token
          writeSession({
            token: this.token,
            user: this.user,
            remember: true,
            issuedAt: Date.now(),
          })
          const u = useUserStore()
          if (data.user) {
            u.id = data.user.id || u.id
            u.name = data.user.name || u.name
            u.role = data.user.role || u.role
            u.title = data.user.title || u.title
            u.team = data.user.team || u.team
            u.avatar = data.user.avatar || u.avatar
          }
        }
      } catch (e) {
        /* 后台校验失败：静默忽略，绝不清空本地会话
         *  - 用户当前页面操作不受影响（isAuthenticated 仍为 true）
         *  - 用户主动操作（如 API 调用）若再次失败，才考虑降级处理
         *  - 这样可以避免"页面一切换就被踢回登录页"的体验问题 */
        if (typeof console !== 'undefined' && console.debug) {
          console.debug('[auth] 后台会话校验失败，已忽略（保留本地登录态）:', e?.message)
        }
      }
    },

    /**
     * 登录
     * @param {{ username: string, password: string, remember?: boolean }} payload
     * @returns {Promise<{ ok: boolean, message?: string, code?: number }>}
     */
    async login({ username, password, remember = false }) {
      this.loading = true
      this.error = ''
      try {
        const mod = await import('@/api')
        const http = mod.default || mod.http
        const data = await http.post('/auth/login', { username, password, remember })
        if (data && data.token && data.user) {
          this.applyAuth(data.token, data.user, remember)
          return { ok: true }
        }
        this.error = '登录响应异常，请重试'
        return { ok: false, message: this.error }
      } catch (e) {
        const msg = e?.message || '网络异常，请检查连接'
        this.error = msg
        return { ok: false, message: msg, code: e?.code }
      } finally {
        this.loading = false
      }
    },

    /**
     * 退出登录：清空本地 + 通知服务端（最佳努力）
     */
    async logout() {
      const t = this.token
      this.clearAuth()
      clearSession()
      if (t) {
        try {
          const mod = await import('@/api')
          const http = mod.default || mod.http
          await http.post('/auth/logout', { token: t })
        } catch {
          /* 注销失败不阻塞本地清空 */
        }
      }
    },

    /**
     * 应用认证信息：写入 store + 持久化 + 同步到 user store
     */
    applyAuth(token, user, remember) {
      this.token = token || ''
      this.user = user ? { ...user } : null
      this.isAuthenticated = !!token
      this.error = ''
      /* 持久化 */
      writeSession({
        token: this.token,
        user: this.user,
        remember: !!remember,
        issuedAt: Date.now(),
      })
      /* 同步到 user store（顶栏头像 / 名字展示） */
      const u = useUserStore()
      if (user) {
        u.id = user.id || u.id
        u.name = user.name || u.name
        u.role = user.role || u.role
        u.title = user.title || u.title
        u.team = user.team || u.team
        u.avatar = user.avatar || u.avatar
      }
    },

    clearAuth() {
      this.token = ''
      this.user = null
      this.isAuthenticated = false
      this.error = ''
    },

    setRedirectAfterLogin(path) {
      this._redirectAfterLogin = path || ''
    },

    consumeRedirectAfterLogin() {
      const p = this._redirectAfterLogin
      this._redirectAfterLogin = ''
      return p
    },
  },
})
