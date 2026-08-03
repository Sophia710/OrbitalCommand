﻿<template>
  <el-dialog
    :model-value="modelValue"
    title="数据源设置"
    width="720px"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="ds-dialog">
      <div class="ds-dialog__toolbar">
        <button type="button" class="ds-dialog__add" @click="onAdd">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          新增数据源
        </button>
        <button type="button" class="ds-dialog__sync" :disabled="syncing" @click="onSyncAll">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" :class="{ spin: syncing }">
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5M8 16H3v5" />
          </svg>
          {{ syncing ? '同步中…' : '全部同步' }}
        </button>
      </div>

      <!-- 新增/编辑表单 -->
      <div v-if="draft" class="ds-dialog__form">
        <div class="ds-dialog__row">
          <label>名称<span class="ds-dialog__required">*</span></label>
          <input v-model.trim="draft.name" class="ds-dialog__input" placeholder="如：中国政府采购网" />
        </div>
        <div class="ds-dialog__row">
          <label>类型<span class="ds-dialog__required">*</span></label>
          <select v-model="draft.type" class="ds-dialog__input">
            <option v-for="t in TYPE_OPTIONS" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div class="ds-dialog__row">
          <label>URL<span class="ds-dialog__required">*</span></label>
          <input v-model.trim="draft.url" class="ds-dialog__input" placeholder="https://..." />
        </div>
        <div class="ds-dialog__row">
          <label>同步频率</label>
          <select v-model="draft.frequency" class="ds-dialog__input">
            <option value="realtime">实时</option>
            <option value="hourly">每小时</option>
            <option value="daily">每天</option>
            <option value="weekly">每周</option>
          </select>
        </div>
        <div class="ds-dialog__row ds-dialog__row--inline">
          <label class="ds-dialog__switch">
            <input v-model="draft.enabled" type="checkbox" />
            <span>启用</span>
          </label>
        </div>
        <div class="ds-dialog__form-actions">
          <button type="button" class="ds-dialog__btn" @click="draft = null">取消</button>
          <button type="button" class="ds-dialog__btn ds-dialog__btn--primary" :disabled="!canSaveDraft" @click="onSaveDraft">保存</button>
        </div>
      </div>

      <!-- 列表 -->
      <table v-if="!draft" class="ds-dialog__table">
        <thead>
          <tr>
            <th>名称</th>
            <th>类型</th>
            <th>URL</th>
            <th>频率</th>
            <th>状态</th>
            <th class="ds-dialog__op">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in localList" :key="d.id">
            <td class="ds-dialog__cell-name">{{ d.name }}</td>
            <td>{{ d.type }}</td>
            <td class="ds-dialog__cell-url" :title="d.url">{{ d.url }}</td>
            <td>{{ freqLabel(d.frequency) }}</td>
            <td>
              <span class="ds-dialog__status" :class="d.enabled ? 'is-on' : 'is-off'">
                <span class="ds-dialog__status-dot" />
                {{ d.enabled ? '启用' : '暂停' }}
              </span>
            </td>
            <td class="ds-dialog__op">
              <button type="button" class="ds-dialog__op-btn" @click="onTest(d)">测试</button>
              <button type="button" class="ds-dialog__op-btn" @click="onToggle(d)">{{ d.enabled ? '暂停' : '启用' }}</button>
              <button type="button" class="ds-dialog__op-btn" @click="onEdit(d)">编辑</button>
              <button type="button" class="ds-dialog__op-btn ds-dialog__op-btn--danger" @click="onDelete(d)">删除</button>
            </td>
          </tr>
          <tr v-if="!localList.length">
            <td colspan="6" class="ds-dialog__empty">暂无数据源 · 点击「新增数据源」开始配置</td>
          </tr>
        </tbody>
      </table>
    </div>
    <template #footer>
      <button class="ds-dialog__btn" @click="$emit('update:modelValue', false)">关闭</button>
      <button class="ds-dialog__btn ds-dialog__btn--primary" :disabled="!!draft || !localList.length" @click="onSaveAll">保存</button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useToastStore } from '@/stores/toast'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const chat = useChatStore()
const toast = useToastStore()

const TYPE_OPTIONS = ['政府采购', '企业招投标', '行业资讯', '企业内部']
const FREQ_LABEL = { realtime: '实时', hourly: '每小时', daily: '每天', weekly: '每周' }
const STORAGE_KEY = `marketRadar.datasources.${chat.employee?.id || 'u_001'}`

/* 预置样例 3 条 */
const SAMPLES = [
  { id: 'ds-1', name: '中国政府采购网',  type: '政府采购',   url: 'https://www.ccgp.gov.cn',   frequency: 'hourly', enabled: true  },
  { id: 'ds-2', name: '中招联合招标采购', type: '企业招投标', url: 'https://www.365trade.com.cn', frequency: 'daily', enabled: true  },
  { id: 'ds-3', name: '赛迪顾问行业资讯', type: '行业资讯',   url: 'https://www.ccidconsulting.com', frequency: 'daily', enabled: false },
]

const localList = ref([...SAMPLES])
const draft = ref(null)
const syncing = ref(false)

const canSaveDraft = computed(() => {
  if (!draft.value) return false
  return !!(draft.value.name && draft.value.type && draft.value.url)
})

function freqLabel(f) { return FREQ_LABEL[f] || f }

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localList.value))
  } catch (e) { /* ignore */ }
}
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr) && arr.length) localList.value = arr
    }
  } catch (e) { /* ignore */ }
}

watch(() => props.modelValue, (open) => {
  if (open) {
    loadFromStorage()
    draft.value = null
  }
})

function onAdd() {
  draft.value = { id: 'ds-' + Date.now(), name: '', type: '政府采购', url: '', frequency: 'daily', enabled: true }
}
function onEdit(d) {
  draft.value = { ...d }
}
function onDelete(d) {
  localList.value = localList.value.filter((x) => x.id !== d.id)
  toast.info(`已删除「${d.name}」`)
}
function onToggle(d) {
  d.enabled = !d.enabled
  toast.info(`${d.name} 已${d.enabled ? '启用' : '暂停'}`)
}
function onTest(d) {
  toast.success(`测试连接成功 · ${d.name}`)
}
function onSaveDraft() {
  if (!canSaveDraft.value) return
  const idx = localList.value.findIndex((x) => x.id === draft.value.id)
  if (idx >= 0) localList.value[idx] = { ...draft.value }
  else localList.value.push({ ...draft.value })
  draft.value = null
  toast.success('已保存')
}
function onSaveAll() {
  persist()
  toast.success('已保存全部数据源配置')
  emit('update:modelValue', false)
}
async function onSyncAll() {
  syncing.value = true
  await new Promise((r) => setTimeout(r, 1200))
  syncing.value = false
  toast.success(`已同步 ${localList.value.filter((d) => d.enabled).length} 个启用的数据源`)
}
</script>

<style scoped>
.ds-dialog__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.ds-dialog__add,
.ds-dialog__sync {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  font-size: 12.5px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid var(--line, rgba(148, 163, 184, 0.2));
  background: var(--surface, #0f172a);
  color: var(--ink, #e2e8f0);
  transition: all 0.15s;
  font-family: inherit;
}
.ds-dialog__add { background: var(--accent, #8b5cf6); color: #fff; border-color: var(--accent, #8b5cf6); }
.ds-dialog__add:hover { filter: brightness(1.1); }
.ds-dialog__sync:hover:not(:disabled) { border-color: var(--accent, #8b5cf6); color: var(--accent, #a78bfa); }
.ds-dialog__sync:disabled { opacity: 0.6; cursor: wait; }
.ds-dialog__add svg, .ds-dialog__sync svg { width: 14px; height: 14px; }
.spin { animation: ds-spin 0.8s linear infinite; }
@keyframes ds-spin { to { transform: rotate(360deg); } }

.ds-dialog__form {
  background: rgba(148, 163, 184, 0.05);
  border: 1px solid var(--line, rgba(148, 163, 184, 0.16));
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ds-dialog__row { display: flex; flex-direction: column; gap: 4px; }
.ds-dialog__row--inline { flex-direction: row; align-items: center; }
.ds-dialog__row label {
  font-size: 12px;
  color: var(--ink-2, #cbd5e1);
  font-weight: 500;
}
.ds-dialog__required { color: #ef4444; margin-left: 2px; }
.ds-dialog__input {
  padding: 6px 10px;
  border: 1px solid var(--line, rgba(148, 163, 184, 0.2));
  border-radius: 6px;
  background: var(--surface, #0f172a);
  color: var(--ink, #e2e8f0);
  font-size: 12.5px;
  font-family: inherit;
  outline: 0;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.ds-dialog__input:focus {
  border-color: var(--accent, #8b5cf6);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
}
.ds-dialog__switch { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; cursor: pointer; }
.ds-dialog__switch input { width: 14px; height: 14px; }
.ds-dialog__form-actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px; }
.ds-dialog__btn {
  padding: 5px 12px;
  font-size: 12.5px;
  border: 1px solid var(--line, rgba(148, 163, 184, 0.2));
  background: var(--surface, #0f172a);
  color: var(--ink, #e2e8f0);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.ds-dialog__btn:hover { border-color: var(--accent, #8b5cf6); }
.ds-dialog__btn--primary {
  background: var(--accent, #8b5cf6);
  color: #fff;
  border-color: var(--accent, #8b5cf6);
}
.ds-dialog__btn--primary:hover:not(:disabled) { filter: brightness(1.1); }
.ds-dialog__btn:disabled { opacity: 0.5; cursor: not-allowed; }

.ds-dialog__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.ds-dialog__table thead th {
  text-align: left;
  padding: 8px 10px;
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-3, #94a3b8);
  background: rgba(148, 163, 184, 0.06);
  border-bottom: 1px solid var(--line, rgba(148, 163, 184, 0.16));
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-family: var(--font-mono, monospace);
}
.ds-dialog__table tbody td {
  padding: 8px 10px;
  border-bottom: 1px solid var(--line, rgba(148, 163, 184, 0.1));
  color: var(--ink-2, #cbd5e1);
  vertical-align: middle;
}
.ds-dialog__cell-name { font-weight: 500; color: var(--ink, #e2e8f0); }
.ds-dialog__cell-url {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  color: var(--ink-3, #94a3b8);
}
.ds-dialog__op { white-space: nowrap; }
.ds-dialog__op-btn {
  font-size: 11px;
  padding: 2px 6px;
  background: transparent;
  color: var(--ink-2, #cbd5e1);
  border: 0;
  cursor: pointer;
  transition: color 0.15s;
  font-family: inherit;
}
.ds-dialog__op-btn:hover { color: var(--accent, #a78bfa); }
.ds-dialog__op-btn--danger:hover { color: #f87171; }
.ds-dialog__status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  padding: 2px 8px;
  border-radius: 999px;
  font-family: var(--font-mono, monospace);
  font-weight: 600;
}
.ds-dialog__status.is-on { background: rgba(16, 185, 129, 0.12); color: #34d399; }
.ds-dialog__status.is-off { background: rgba(148, 163, 184, 0.1); color: #94a3b8; }
.ds-dialog__status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
.ds-dialog__empty {
  text-align: center;
  color: var(--ink-3, #94a3b8);
  padding: 32px 12px !important;
  font-size: 12px;
}
</style>