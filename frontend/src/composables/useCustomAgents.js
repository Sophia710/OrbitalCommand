import { ref, watch, onMounted, onUnmounted } from 'vue'

/**
 * 用户自定义智能体数据管理 (参考 Intelligent Assistant 架构)
 *
 * 区分:
 *   - 系统内置智能体 → MOCK.agents (来自 mock API,只读)
 *   - 用户自定义智能体 → 本 composable 管理的 localStorage
 *
 * 持久化: localStorage['user:agents:custom:v1']
 *
 * 字段约定 (CustomAgent):
 *   id            : string  - 'custom-<timestamp>'
 *   type          : 'custom'                  (与系统 builtin 区分)
 *   name          : string
 *   description   : string
 *   category      : 'terminal'|'network'|'payload'|'e2e'|'custom'
 *   icon          : string                    (Material 名称)
 *   color_theme   : string                    (hex)
 *   tags          : string[]
 *   system_prompt : string                    (人设 / 系统提示词)
 *   trigger_cmd   : string                    (触发命令)
 *   welcome_msg   : string                    (欢迎语)
 *   created_at    : number
 *   usage_count   : 0
 *   rating        : 0
 *   version       : '1.0.0'
 *   status        : 'active'                  (自定义智能体创建后即激活)
 */
const STORAGE_KEY = 'user:agents:custom:v1'

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

/* 单例: 跨组件共享同一份数据 */
if (typeof window !== 'undefined') {
  watch(
    list,
    (v) => {
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v)) }
      catch { /* 容量溢出静默忽略 */ }
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

/**
 * @returns {{
 *   list: import('vue').Ref<CustomAgent[]>,
 *   addAgent: (draft: object) => CustomAgent,
 *   updateAgent: (id: string, patch: object) => void,
 *   removeAgent: (id: string) => void,
 *   getAgent: (id: string) => CustomAgent | undefined,
 *   teardown: () => void,
 * }}
 */
export function useCustomAgents() {
  function addAgent(draft) {
    const agent = {
      id: 'custom-' + Date.now(),
      type: 'custom',
      name: draft.name?.trim() || '未命名智能体',
      description: draft.description?.trim() || '',
      category: draft.category || 'custom',
      icon: draft.icon || 'smart_toy',
      color_theme: draft.color_theme || '#5b8def',
      tags: draft.tags || [],
      system_prompt: draft.system_prompt || '',
      trigger_cmd: draft.trigger_cmd || '',
      welcome_msg: draft.welcome_msg || '',
      created_at: Date.now(),
      usage_count: 0,
      rating: 0,
      version: '1.0.0',
      status: 'active',
    }
    list.value = [agent, ...list.value]
    return agent
  }

  function updateAgent(id, patch) {
    list.value = list.value.map((a) => (a.id === id ? { ...a, ...patch } : a))
  }

  function removeAgent(id) {
    list.value = list.value.filter((a) => a.id !== id)
  }

  function getAgent(id) {
    return list.value.find((a) => a.id === id)
  }

  function teardown() {
    if (typeof window !== 'undefined' && storageHandler) {
      window.removeEventListener('storage', storageHandler)
      storageHandler = null
    }
  }

  return { list, addAgent, updateAgent, removeAgent, getAgent, teardown }
}

export const CUSTOM_AGENT_CATEGORIES = [
  { key: 'terminal', name: '终端',     icon: 'Cellphone' },
  { key: 'network',  name: '网络',     icon: 'Connection' },
  { key: 'payload',  name: '载荷',     icon: 'Cpu' },
  { key: 'e2e',      name: '全链路',   icon: 'Link' },
  { key: 'custom',   name: '通用自定义', icon: 'MagicStick' },
]

export const CUSTOM_AGENT_COLORS = [
  '#5b8def', '#36cbcb', '#fbb337', '#f25c54', '#7ed321',
  '#b287e6', '#ff8e53', '#26bbaa', '#5e72e4', '#f5365c',
]

export const CUSTOM_AGENT_ICONS = [
  'smart_toy', 'auto_awesome', 'edit', 'description', 'language',
  'code', 'analytics', 'support_agent', 'psychology', 'monitor_heart',
  'rocket_launch', 'workspace_premium', 'shield', 'insights', 'forum',
]
