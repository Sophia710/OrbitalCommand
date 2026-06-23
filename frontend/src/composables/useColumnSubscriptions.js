import { ref, computed, watch } from 'vue'

/**
 * 专栏订阅状态管理 (参考 Files 图片上传架构 + 智能体订阅模式)
 *
 * 持久化: localStorage['user:columns:subs:v2']
 * 结构 : { [columnId]: { subscribed_at, notify, frequency, last_seen_at, last_article_at } }
 *
 * 提供:
 *   - store:           Ref<Record<id, Subscription>>
 *   - list:            ComputedRef<Subscription[]>
 *   - count:           ComputedRef<number>
 *   - subscribe/unsubscribe/toggle
 *   - isSubscribed/hasNew
 *   - setNotifyPrefs
 *   - batchSubscribe/batchUnsubscribe
 *   - markSeen
 *   - 跨 Tab 同步
 */
const STORAGE_KEY = 'user:columns:subs:v2'
const SCHEMA_VERSION = 2

function readJSON(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return fallback
    /* 兼容老版本 schema (v1) */
    if (!parsed.__v) {
      const migrated = {}
      for (const [id, v] of Object.entries(parsed)) {
        if (v && typeof v === 'object') {
          migrated[id] = {
            subscribed_at: v.subscribed_at || Date.now(),
            notify: v.notify !== false,
            frequency: 'realtime',
            last_seen_at: 0,
            last_article_at: 0,
          }
        }
      }
      return migrated
    }
    return parsed
  } catch {
    return fallback
  }
}

const store = ref(readJSON(STORAGE_KEY, {}))
let storageHandler = null

function persist() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ __v: SCHEMA_VERSION, ...store.value }),
    )
  } catch { /* ignore quota */ }
}

if (typeof window !== 'undefined') {
  watch(store, persist, { deep: true })
  storageHandler = (e) => {
    if (e.key !== STORAGE_KEY) return
    try {
      const next = e.newValue ? JSON.parse(e.newValue) : {}
      store.value = next && typeof next === 'object' ? next : {}
    } catch { /* ignore */ }
  }
  window.addEventListener('storage', storageHandler)
}

export function useColumnSubscriptions() {
  function makeRecord(id) {
    return {
      subscribed_at: Date.now(),
      notify: true,
      frequency: 'realtime', // realtime | daily | weekly | off
      last_seen_at: 0,
      last_article_at: 0,
    }
  }

  function subscribe(columnId, prefs = {}) {
    const existing = store.value[columnId] || makeRecord(columnId)
    store.value = {
      ...store.value,
      [columnId]: { ...existing, ...prefs },
    }
  }

  function unsubscribe(columnId) {
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

  function hasNew(columnId, latestArticleAt) {
    const r = store.value[columnId]
    if (!r) return false
    if (!latestArticleAt) return false
    return new Date(latestArticleAt).getTime() > (r.last_seen_at || 0)
  }

  function setNotifyPrefs(columnId, prefs) {
    const r = store.value[columnId]
    if (!r) return
    store.value = {
      ...store.value,
      [columnId]: { ...r, ...prefs },
    }
  }

  function markSeen(columnId, articleAt) {
    const r = store.value[columnId]
    if (!r) return
    const next = { ...r, last_seen_at: Date.now() }
    if (articleAt) next.last_article_at = new Date(articleAt).getTime()
    store.value = { ...store.value, [columnId]: next }
  }

  function batchSubscribe(ids) {
    const next = { ...store.value }
    const ts = Date.now()
    for (const id of ids) {
      next[id] = next[id] || { ...makeRecord(id), subscribed_at: ts }
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
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => (b.subscribed_at || 0) - (a.subscribed_at || 0)),
  )

  const count = computed(() => Object.keys(store.value).length)

  const subscribedIds = computed(() => new Set(Object.keys(store.value)))

  return {
    store,
    list,
    count,
    subscribedIds,
    subscribe,
    unsubscribe,
    toggle,
    isSubscribed,
    hasNew,
    setNotifyPrefs,
    markSeen,
    batchSubscribe,
    batchUnsubscribe,
    teardown,
  }
}
