/**
 * Mock 引擎（前端纯 Promise 模拟）
 * ----------------------------------------------------------------------
 *  - delay / ok / fail / page / uid 等基础工具
 *  - 统一"伪请求"：dispatch 携带 800ms 延迟 + 随机抖动
 *  - 业务接口在 /api 目录下基于此引擎注册
 *  - 提供 schema 校验：每个 handler 可选声明 params / body 校验规则
 *  - 统一响应结构：{ code, message, data, ts }
 *  - 错误处理：校验失败 → code:400；未注册 → code:404；handler 抛错 → code:500
 */

import { uid, sleep, rand } from '@/utils'
import { MOCK } from './mock-data'

export const DEFAULT_LATENCY = 800
export const JITTER = 350

/* ---------------- 工具函数 ---------------- */

export function delay(ms = DEFAULT_LATENCY) {
  return sleep(ms + rand(0, JITTER))
}

export function ok(data, message = 'OK') {
  return { code: 0, message, data, ts: Date.now() }
}

export function fail(message = '操作失败', code = 1, data = null) {
  return { code, message, data, ts: Date.now() }
}

export function page(list, pageNo = 1, pageSize = 10) {
  const start = (pageNo - 1) * pageSize
  return {
    list: list.slice(start, start + pageSize),
    total: list.length,
    pageNo,
    pageSize,
  }
}

/* ---------------- 参数校验 ---------------- */

/**
 * 简易校验器：校验失败抛出 Error，错误信息形如 "[fieldName] reason"
 *  rules: { fieldName: [type, required, customFn] }
 *  - type: 'string' | 'number' | 'boolean' | 'array' | 'object'
 *  - required: boolean
 *  - customFn: (value) => true | string
 */
export function validate(data, rules = {}) {
  if (!rules || Object.keys(rules).length === 0) return
  for (const [field, [type, required, customFn]] of Object.entries(rules)) {
    const value = data?.[field]
    if (value === undefined || value === null || value === '') {
      if (required) throw new Error(`[${field}] 必填`)
      continue
    }
    if (type && !checkType(value, type)) {
      throw new Error(`[${field}] 类型错误，期望 ${type}`)
    }
    if (typeof customFn === 'function') {
      const r = customFn(value)
      if (r !== true) throw new Error(`[${field}] ${r || '校验失败'}`)
    }
  }
}

function checkType(value, type) {
  switch (type) {
    case 'string':  return typeof value === 'string'
    case 'number':  return typeof value === 'number' && !Number.isNaN(value)
    case 'boolean': return typeof value === 'boolean'
    case 'array':   return Array.isArray(value)
    case 'object':  return typeof value === 'object' && !Array.isArray(value)
    default:        return true
  }
}

/* ---------------- 路由注册 + 分发 ---------------- */

export const MOCK_ROUTES = {}

/**
 * 注册一个 mock 路由
 * @param {string} methodPath e.g. 'GET /employees/list'
 * @param {object} config
 * @param {object} config.params  query 参数校验规则
 * @param {object} config.body    body 校验规则
 * @param {function} config.handler 业务处理函数 ({ params, body }) => any
 */
export function registerRoute(methodPath, config) {
  MOCK_ROUTES[methodPath] = config
}

/**
 * 把带 :param 占位符的路由 pattern 编译成正则
 *  仅匹配 :name（字母/数字/下划线），不跨越 /
 * @returns {{ regex: RegExp, names: string[] } | null}
 */
function compilePattern(pattern) {
  const names = []
  const regexStr = pattern.replace(/:[a-zA-Z_][a-zA-Z0-9_]*/g, (m) => {
    names.push(m.slice(1))
    return '([^/]+)'
  })
  return { regex: new RegExp(`^${regexStr}$`), names }
}

/**
 * 在 MOCK_ROUTES 中按 method + path 查找匹配项
 *  1) 先做精确字符串匹配（静态路由走快路径）
 *  2) 失败则遍历含 :param 的路由，做正则匹配并抽取路径参数
 * @returns {{ config: object, pathParams: object } | null}
 */
function resolveRoute(method, path) {
  const upper = method.toUpperCase()
  const key = `${upper} ${path}`
  if (MOCK_ROUTES[key]) return { config: MOCK_ROUTES[key], pathParams: {} }

  for (const [routeKey, config] of Object.entries(MOCK_ROUTES)) {
    const idx = routeKey.indexOf(' ')
    if (idx < 0) continue
    const m = routeKey.slice(0, idx)
    const pattern = routeKey.slice(idx + 1)
    if (m !== upper || !pattern.includes(':')) continue
    const compiled = compilePattern(pattern)
    if (!compiled) continue
    const match = path.match(compiled.regex)
    if (!match) continue
    const pathParams = {}
    compiled.names.forEach((name, i) => {
      try { pathParams[name] = decodeURIComponent(match[i + 1]) }
      catch { pathParams[name] = match[i + 1] }
    })
    return { config, pathParams }
  }
  return null
}

/**
 * 分发一个 mock 请求
 * @returns Promise<{ code, message, data, ts }>
 */
export async function dispatch(method, path, payload = {}) {
  const key = `${method.toUpperCase()} ${path}`
  const resolved = resolveRoute(method, path)

  await delay()

  if (!resolved) {
    console.warn(`[mock] no handler for ${key}`)
    return fail(`mock 路由未注册: ${key}`, 404)
  }

  const { config, pathParams } = resolved
  try {
    // 路径参数（:id 等）合并到 params，使 handler / validate 都能直接读取
    const mergedParams = { ...(payload.params || {}), ...pathParams }
    validate(mergedParams, config.params)
    validate(payload.body, config.body)
    const result = await config.handler({ params: mergedParams, body: payload.body })
    if (result && typeof result === 'object' && 'code' in result) return result
    return ok(result)
  } catch (e) {
    const msg = e?.message || 'mock 异常'
    // 校验错误按 400 返回，其他按 500
    const code = msg.startsWith('[') ? 400 : 500
    return fail(msg, code)
  }
}

export { MOCK, uid }
