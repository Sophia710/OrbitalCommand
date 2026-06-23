import { ref, watch } from 'vue'

/**
 * 用户自定义技能数据管理 (参考 Intelligent Assistant 架构)
 *
 * 区分:
 *   - 系统内置技能 → MOCK.skillsFull (来自 mock API,只读)
 *   - 用户自定义技能 → 本 composable 管理的 localStorage
 *
 * 持久化: localStorage['user:skills:custom:v1']
 *
 * 字段约定 (CustomSkill):
 *   id           : string  - 'custom-skill-<timestamp>'
 *   type         : 'custom'
 *   name         : string
 *   description  : string
 *   category     : 'office'|'dev'|'test'|'ops'|'marketing'|'general'
 *   icon         : string
 *   color_theme  : string
 *   tags         : string[]
 *   prompt_tpl   : string  (技能 prompt 模板)
 *   trigger_cmd  : string
 *   trend        : number[] (创建时为 7 个 0)
 *   usage_count  : 0
 *   agents_count : 0
 *   version      : '1.0.0'
 *   status       : 'active'
 *   created_at   : number
 */
const STORAGE_KEY = 'user:skills:custom:v1'

function readJSON(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

const list = ref(readJSON(STORAGE_KEY, []))
let storageHandler = null

if (typeof window !== 'undefined') {
  watch(
    list,
    (v) => {
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v)) }
      catch { /* ignore */ }
    },
    { deep: true },
  )
  storageHandler = (e) => {
    if (e.key !== STORAGE_KEY) return
    try {
      const next = e.newValue ? JSON.parse(e.newValue) : []
      list.value = Array.isArray(next) ? next : []
    } catch { /* ignore */ }
  }
  window.addEventListener('storage', storageHandler)
}

export function useCustomSkills() {
  function addSkill(draft) {
    const skill = {
      id: 'custom-skill-' + Date.now(),
      type: 'custom',
      name: draft.name?.trim() || '未命名技能',
      description: draft.description?.trim() || '',
      category: draft.category || 'general',
      icon: draft.icon || 'auto_awesome',
      color_theme: draft.color_theme || '#5b8def',
      tags: draft.tags || [],
      prompt_tpl: draft.prompt_tpl || '',
      trigger_cmd: draft.trigger_cmd || '',
      trend: [0, 0, 0, 0, 0, 0, 0],
      usage_count: 0,
      agents_count: 0,
      version: '1.0.0',
      status: 'active',
      created_at: Date.now(),
    }
    list.value = [skill, ...list.value]
    return skill
  }

  function updateSkill(id, patch) {
    list.value = list.value.map((s) => (s.id === id ? { ...s, ...patch } : s))
  }

  function removeSkill(id) {
    list.value = list.value.filter((s) => s.id !== id)
  }

  function getSkill(id) {
    return list.value.find((s) => s.id === id)
  }

  function teardown() {
    if (typeof window !== 'undefined' && storageHandler) {
      window.removeEventListener('storage', storageHandler)
      storageHandler = null
    }
  }

  return { list, addSkill, updateSkill, removeSkill, getSkill, teardown }
}

export const CUSTOM_SKILL_CATEGORIES = [
  { key: 'terminal', name: '终端诊断', icon: 'Cellphone' },
  { key: 'network',  name: '网络优化', icon: 'Connection' },
  { key: 'payload',  name: '载荷监控', icon: 'Cpu' },
  { key: 'e2e',      name: '全链路',   icon: 'Link' },
  { key: 'general',  name: '通用',     icon: 'Setting' },
  { key: 'custom',   name: '自定义',   icon: 'MagicStick' },
]

export const CUSTOM_SKILL_COLORS = [
  '#5b8def', '#36cbcb', '#fbb337', '#f25c54', '#7ed321',
  '#b287e6', '#ff8e53', '#26bbaa',
]

export const CUSTOM_SKILL_ICONS = [
  'auto_awesome', 'edit', 'description', 'language', 'code',
  'analytics', 'support_agent', 'psychology', 'monitor_heart',
  'rocket_launch', 'insights', 'forum', 'flash_on', 'auto_stories',
]
