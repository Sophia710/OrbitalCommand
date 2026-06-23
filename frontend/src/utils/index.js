/**
 * 通用工具函数
 * ------------------------------------------------------------
 *  - 基础工具：pad / formatTime / formatDate / relativeTime / uid
 *  - 函数式工具：debounce / throttle / once
 *  - 类型工具：isString / isNumber / isArray ...
 *  - 业务工具：matchFilter / classify / bytesFormat / copy / sleep / rand / pick
 */

export function pad(n, len = 2, ch = '0') {
  return String(n).padStart(len, ch)
}

export function formatTime(d) {
  const x = d instanceof Date ? d : new Date(d)
  return `${pad(x.getHours())}:${pad(x.getMinutes())}:${pad(x.getSeconds())}`
}

export function formatDateTime(d) {
  const x = d instanceof Date ? d : new Date(d)
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())} ${formatTime(x)}`
}

export function formatDate(d) {
  const x = d instanceof Date ? d : new Date(d)
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`
}

export function relativeTime(ts) {
  const diff = Date.now() - new Date(ts).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s 前`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m 前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h 前`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d 前`
  return formatDate(ts)
}

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`
}

export function debounce(fn, wait = 200) {
  let t = null
  return function (...args) {
    if (t) clearTimeout(t)
    t = setTimeout(() => fn.apply(this, args), wait)
  }
}

export function throttle(fn, gap = 200) {
  let last = 0
  return function (...args) {
    const now = Date.now()
    if (now - last >= gap) {
      last = now
      fn.apply(this, args)
    }
  }
}

export function once(fn) {
  let called = false
  let result
  return function (...args) {
    if (!called) {
      called = true
      result = fn.apply(this, args)
    }
    return result
  }
}

/* ---------------- 类型判断 ---------------- */
export const isString  = (v) => typeof v === 'string'
export const isNumber  = (v) => typeof v === 'number' && !Number.isNaN(v)
export const isBoolean = (v) => typeof v === 'boolean'
export const isArray   = (v) => Array.isArray(v)
export const isObject  = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
export const isEmpty   = (v) => v == null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0)

/* ---------------- 业务工具 ---------------- */
export function bytesFormat(n) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`
}

export function percent(n, total, fixed = 1) {
  if (!total) return '0%'
  return `${((n / total) * 100).toFixed(fixed)}%`
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

export function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

export function copy(text) {
  if (navigator?.clipboard) return navigator.clipboard.writeText(text)
  return Promise.reject(new Error('clipboard unsupported'))
}

/* ---------------- matchFilter ----------------
 *  与原 prototype 同款筛选实现（保持测试脚本可继续运行）：
 *    filters: [{ type:'search'|'select'|'chip'|'date', field, value }]
 *    list:    数组，每项是业务对象
 *  - search：大小写无关的子串匹配，会同时检查 field 与 tags/description（若存在）
 *  - select：严格相等
 *  - chip  ：值是数组，至少一项命中即可
 *  - date  ：{ from, to }，按 field 对应的日期值范围筛选
 */
export function matchFilter(list, filters = []) {
  return list.filter((item) => {
    return filters.every((f) => {
      if (!f || f.value == null || f.value === '') return true
      const v = item[f.field]
      switch (f.type) {
        case 'search': {
          if (v == null) return false
          const k = String(f.value).toLowerCase()
          if (String(v).toLowerCase().includes(k)) return true
          if (Array.isArray(item.tags) && item.tags.some((t) => String(t).toLowerCase().includes(k))) return true
          if (item.description && String(item.description).toLowerCase().includes(k)) return true
          return false
        }
        case 'select':
          return v === f.value
        case 'chip': {
          if (!Array.isArray(f.value) || f.value.length === 0) return true
          return f.value.includes(v)
        }
        case 'date': {
          if (!v) return false
          const ts = new Date(v).getTime()
          if (Number.isNaN(ts)) return false
          if (f.value.from) {
            const from = new Date(f.value.from).getTime()
            if (ts < from) return false
          }
          if (f.value.to) {
            const to = new Date(f.value.to).getTime() + 24 * 60 * 60 * 1000
            if (ts > to) return false
          }
          return true
        }
        default:
          return true
      }
    })
  })
}

/* ---------------- localStorage 安全封装 ---------------- */
export function lsGet(key, fallback = null) {
  try {
    const v = localStorage.getItem(key)
    return v == null ? fallback : JSON.parse(v)
  } catch {
    return fallback
  }
}

export function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* 忽略配额错误 */
  }
}

export function lsRemove(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}
