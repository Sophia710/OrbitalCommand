/**
 * 认证模块 · Mock API
 * ----------------------------------------------------------------------
 *  - POST /auth/login   用户名/密码登录 → 返回 token + user
 *  - GET  /auth/me      根据 token 拉取当前用户信息
 *  - POST /auth/logout  注销 token（模拟服务端失效）
 *
 * 演示账号（与设计稿保持一致）：
 *   admin / 123456     管理员（默认）
 *   demo  / 123456     演示账号
 *   guest / 123456     只读访客
 *
 * 错误码约定：
 *   1001  账号或密码错误（细分:账号不存在 vs 密码错误）
 *   1002  账号已停用
 *   1003  登录失败次数过多，请稍后重试
 *
 * 会话持久化说明：
 *   SESSIONS 持久化到 localStorage（oc_mock_sessions_v1），用于模拟"服务端 session"。
 *   - 页面刷新后仍能识别之前颁发的 token，避免"一切换就掉线"
 *   - 用户主动 logout / 失败计数等变更实时写回 localStorage
 *   - 真实后端应使用 Redis/DB 等，本文件仅作前端 mock 用途
 */
import { registerRoute, delay } from './mock'
import { MOCK } from './mock-data'

/* ---------------- 演示账号库 ---------------- */
const DEMO_USERS = [
  { username: 'admin', password: '123456', role: 'admin',  name: '星小智',  title: '系统管理员',       team: '运控中心 · 高级工程师' },
  { username: 'demo',  password: '123456', role: 'viewer', name: '演示账号', title: '访客',             team: '运控中心' },
  { username: 'guest', password: '123456', role: 'viewer', name: '访客用户', title: '只读访客',         team: '运控中心' },
]

/* ---------------- 持久化 SESSIONS（模拟服务端 session） ---------------- */
/* 使用 localStorage 持久化会话，跨页面刷新不丢失
 *  - key:  oc_mock_sessions_v1
 *  - value: { [token]: sessionObj }
 * 设计上模拟真实后端的"会话表"，与 auth store 的 localStorage 解耦：
 *  - auth store 存的是"客户端持有的会话"（用于路由守卫 / UI 状态）
 *  - 这里的 SESSIONS 是"服务端视角的会话"（用于 mock 校验） */
const SESSIONS_STORAGE_KEY = 'oc_mock_sessions_v1'

function loadSessions() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(SESSIONS_STORAGE_KEY) : null
    if (!raw) return {}
    const obj = JSON.parse(raw)
    return obj && typeof obj === 'object' ? obj : {}
  } catch {
    return {}
  }
}
function saveSessions(obj) {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(obj))
  } catch { /* 存储失败不阻塞主流程 */ }
}

/* token 池（模拟服务端会话） */
const SESSIONS = loadSessions()

/* 失败计数（演示用） */
const FAIL_COUNTER = new Map()

/* ---------------- POST /auth/login ---------------- */
registerRoute('POST /auth/login', {
  body: {
    username: ['string', true],
    password: ['string', true],
    remember: ['boolean', false],
  },
  handler: async ({ body }) => {
    /* 服务端抖动一下，让 loading 状态可见 */
    await delay(420, 220)
    const u = String(body.username).trim().toLowerCase()
    const p = String(body.password)

    /* 失败次数限制（演示） */
    const failCount = FAIL_COUNTER.get(u) || 0
    if (failCount >= 5) {
      return { code: 1003, message: '登录失败次数过多，请稍后再试', data: null, ts: Date.now() }
    }

    const matched = DEMO_USERS.find((x) => x.username.toLowerCase() === u && x.password === p)
    if (!matched) {
      const userExists = DEMO_USERS.some((x) => x.username.toLowerCase() === u)
      FAIL_COUNTER.set(u, failCount + 1)
      return {
        code: 1001,
        message: userExists ? '密码错误，请重新输入' : '账号不存在，请检查后重试',
        data: null,
        ts: Date.now(),
      }
    }

    /* 登录成功，重置失败计数 */
    FAIL_COUNTER.delete(u)

    const token = `tk_${matched.username}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
    const session = {
      token,
      username: matched.username,
      role: matched.role,
      name: matched.name,
      title: matched.title,
      team: matched.team,
      issuedAt: Date.now(),
    }
    SESSIONS[token] = session
    saveSessions(SESSIONS)

    return {
      code: 0,
      message: '登录成功',
      data: {
        token,
        remember: !!body.remember,
        user: {
          id: `u_${matched.username}`,
          username: matched.username,
          role: matched.role,
          name: matched.name,
          title: matched.title,
          team: matched.team,
          avatar: MOCK.user.avatar,
        },
      },
      ts: Date.now(),
    }
  },
})

/* ---------------- GET /auth/me ---------------- */
registerRoute('GET /auth/me', {
  handler: async ({ params }) => {
    await delay(280, 120)
    const token = params?.token
    if (!token) return { code: 401, message: '未登录', data: null, ts: Date.now() }
    const session = SESSIONS[token]
    if (!session) return { code: 401, message: '会话已失效，请重新登录', data: null, ts: Date.now() }
    return {
      code: 0,
      message: 'OK',
      data: {
        user: {
          id: `u_${session.username}`,
          username: session.username,
          role: session.role,
          name: session.name,
          title: session.title,
          team: session.team,
          avatar: MOCK.user.avatar,
        },
        token: session.token,
      },
      ts: Date.now(),
    }
  },
})

/* ---------------- POST /auth/logout ---------------- */
registerRoute('POST /auth/logout', {
  body: { token: ['string', true] },
  handler: async ({ body }) => {
    await delay(180, 80)
    delete SESSIONS[body.token]
    saveSessions(SESSIONS)
    return { code: 0, message: '已退出', data: { ok: true }, ts: Date.now() }
  },
})
