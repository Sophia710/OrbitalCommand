import { ref, computed, watch } from 'vue'

/**
 * 专栏订阅状态管理 (v3 · 仅保留订阅状态)
 *
 * 持久化: localStorage['user:columns:subs:v3']
 * 结构 : { __v: 3, [columnId]: subscribed_at (number, ms timestamp) }
 *
 * 提供:
 *   - store:        Ref<Record<id, number>>      值 = subscribed_at
 *   - list:         ComputedRef<{id, subscribed_at}[]>   按订阅时间倒序
 *   - count:        ComputedRef<number>
 *   - ids:          ComputedRef<Set<id>>          O(1) 查询
 *   - isSubscribed: (id) => boolean
 *   - subscribe / unsubscribe / toggle
 *   - batchSubscribe / batchUnsubscribe
 *   - 跨 Tab 同步
 *
 * 历史:
 *   v1: 简单 { [id]: { subscribed_at } }
 *   v2: 增加 notify / frequency / last_seen_at / last_article_at
 *   v3 (本版): 精简为 { [id]: subscribed_at }, 移除 unread / notify
 */

const STORAGE_KEY = 'user:columns:subs:v3'
const SCHEMA_VERSION = 3

/**
 * 从 localStorage 读取并按需迁移到 v3
 * 返回结构: { __v: 3, [id]: subscribed_at }
 */
function readJSON() {
  if (typeof window === 'undefined') return { __v: SCHEMA_VERSION }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && parsed.__v === SCHEMA_VERSION) {
        return parsed
      }
    }
    /* 兼容旧 key: v2 / v1 */
    const legacy =
      window.localStorage.getItem('user:columns:subs:v2') ||
      window.localStorage.getItem('user:columns:subs')
    if (!legacy) return { __v: SCHEMA_VERSION }
    const old = JSON.parse(legacy)
    if (!old || typeof old !== 'object') return { __v: SCHEMA_VERSION }
    const next = { __v: SCHEMA_VERSION }
    for (const [id, v] of Object.entries(old)) {
      if (!v) continue
      /* v2: 仍是对象; v1: 可能是数字或对象 */
      if (typeof v === 'number') next[id] = v
      else if (typeof v === 'object' && v.subscribed_at) next[id] = v.subscribed_at
      else next[id] = Date.now()
    }
    return next
  } catch {
    return { __v: SCHEMA_VERSION }
  }
}

const store = ref(readJSON())
let storageHandler = null

function persist() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store.value))
  } catch { /* ignore quota */ }
  /* 清理旧 key,避免被误读 */
  try {
    window.localStorage.removeItem('user:columns:subs:v2')
    window.localStorage.removeItem('user:columns:subs')
  } catch { /* ignore */ }
}

if (typeof window !== 'undefined') {
  watch(store, persist, { deep: true })
  storageHandler = (e) => {
    if (e.key !== STORAGE_KEY) return
    try {
      const next = e.newValue ? JSON.parse(e.newValue) : { __v: SCHEMA_VERSION }
      store.value = next && typeof next === 'object' ? next : { __v: SCHEMA_VERSION }
    } catch { /* ignore */ }
  }
  window.addEventListener('storage', storageHandler)
}

export function useColumnSubscriptions() {
  function subscribe(columnId) {
    /* 已订阅则保留原订阅时间(幂等) */
    if (store.value[columnId]) return
    store.value = {
      ...store.value,
      [columnId]: Date.now(),
    }
  }

  function unsubscribe(columnId) {
    if (!store.value[columnId]) return
    const next = { ...store.value }
    delete next[columnId]
    store.value = next
  }

  function toggle(columnId) {
    if (store.value[columnId]) unsubscribe(columnId)
    else subscribe(columnId)
  }

  function isSubscribed(columnId) {
    return Boolean(store.value[columnId])
  }

  function batchSubscribe(ids) {
    const next = { ...store.value }
    const ts = Date.now()
    for (const id of ids) {
      if (!id) continue
      if (!next[id]) next[id] = ts
    }
    store.value = next
  }

  function batchUnsubscribe(ids) {
    const next = { ...store.value }
    for (const id of ids) delete next[id]
    store.value = next
  }

  function teardown() {
    if (typeof window !== 'undefined' && storageHandler) {
      window.removeEventListener('storage', storageHandler)
      storageHandler = null
    }
  }

  const list = computed(() =>
    Object.entries(store.value)
      .filter(([k]) => k !== '__v')
      .map(([id, subscribed_at]) => ({ id, subscribed_at }))
      .sort((a, b) => (b.subscribed_at || 0) - (a.subscribed_at || 0)),
  )

  const count = computed(() => {
    let n = 0
    for (const k of Object.keys(store.value)) if (k !== '__v') n++
    return n
  })

  const ids = computed(() => {
    const s = new Set()
    for (const k of Object.keys(store.value)) if (k !== '__v') s.add(k)
    return s
  })

  return {
    store,
    list,
    count,
    ids,
    isSubscribed,
    subscribe,
    unsubscribe,
    toggle,
    batchSubscribe,
    batchUnsubscribe,
    teardown,
  }
}
