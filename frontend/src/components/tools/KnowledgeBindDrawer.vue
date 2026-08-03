﻿<template>
  <el-drawer
    :model-value="modelValue"
    direction="rtl"
    size="380px"
    title="📚 绑定知识库"
    :with-header="false"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="kb-drawer">
      <header class="kb-drawer__head">
        <span class="kb-drawer__title">📚 绑定知识库</span>
        <button type="button" class="kb-drawer__close" aria-label="关闭" @click="$emit('update:modelValue', false)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div class="kb-drawer__search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input v-model="keyword" class="kb-drawer__input" placeholder="搜索知识库…" />
      </div>

      <ul class="kb-drawer__list">
        <li
          v-for="d in filteredDocs"
          :key="d.id"
          class="kb-drawer__item"
          :class="{ 'is-checked': checked.has(d.id) }"
        >
          <label class="kb-drawer__check">
            <input
              type="checkbox"
              :checked="checked.has(d.id)"
              @change="toggle(d.id)"
            />
            <span class="kb-drawer__item-body">
              <span class="kb-drawer__item-name">{{ d.name }}</span>
              <span class="kb-drawer__item-meta">{{ d.kbName }} · {{ d.format.toUpperCase() }} · {{ formatSize(d.size_bytes) }}</span>
              <span v-if="d.tags && d.tags.length" class="kb-drawer__item-tags">
                <span v-for="t in d.tags" :key="t" class="kb-drawer__tag">{{ t }}</span>
              </span>
            </span>
          </label>
        </li>
        <li v-if="!filteredDocs.length" class="kb-drawer__empty">没有匹配的知识库条目</li>
      </ul>

      <footer class="kb-drawer__foot">
        <span>已选 <b>{{ checked.size }}</b> / {{ allDocs.length }}</span>
        <div class="kb-drawer__actions">
          <button type="button" class="kb-drawer__btn" @click="$emit('update:modelValue', false)">取消</button>
          <button type="button" class="kb-drawer__btn kb-drawer__btn--primary" :disabled="!checked.size" @click="onConfirm">确定</button>
        </div>
      </footer>
    </div>
  </el-drawer>
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

const keyword = ref('')
const checked = ref(new Set())

/* 预置 8 条可绑定的知识库条目（市场商机分析员专用） */
const allDocs = ref([
  { id: 'mr-doc-1', name: '《卫星互联网招投标操作指引 v2.1》', kbName: '运控中心 · SOP 库', format: 'md',   size_bytes:  86420,  tags: ['SOP', '招投标'] },
  { id: 'mr-doc-2', name: '《政府遥感采购项目应答模板 2026》',   kbName: '运控中心 · SOP 库', format: 'docx', size_bytes: 412300,  tags: ['模板', '政府'] },
  { id: 'mr-doc-3', name: '《高分专项甲级资质材料清单》',         kbName: '市场部 · 资质库',   format: 'pdf',  size_bytes: 689210,  tags: ['资质', '高分'] },
  { id: 'mr-doc-4', name: '《InSAR 形变监测产品白皮书》',         kbName: '技术中心 · 产品库', format: 'pdf',  size_bytes: 1820500, tags: ['InSAR', '产品'] },
  { id: 'mr-doc-5', name: '《客户案例：某省自然资源厅 3 年合作复盘》', kbName: '市场部 · 案例库', format: 'md', size_bytes:  52400, tags: ['案例', '复盘'] },
  { id: 'mr-doc-6', name: '《竞品分析：航天科技 / 中电科 / 长光卫星》', kbName: '战略部 · 竞品库', format: 'xlsx', size_bytes: 326400, tags: ['竞品', '战略'] },
  { id: 'mr-doc-7', name: '《2026 卫星互联网行业政策汇编》',         kbName: '战略部 · 政策库',   format: 'pdf',  size_bytes: 2480000, tags: ['政策', '汇编'] },
  { id: 'mr-doc-8', name: '《商务标报价区间速查表 2026》',           kbName: '市场部 · 报价库',   format: 'xlsx', size_bytes: 124800,  tags: ['报价', '速查'] },
])

const filteredDocs = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return allDocs.value
  return allDocs.value.filter((d) =>
    d.name.toLowerCase().includes(k) ||
    d.kbName.toLowerCase().includes(k) ||
    (d.tags || []).some((t) => t.toLowerCase().includes(k))
  )
})

function formatSize(b) {
  b = Number(b) || 0
  if (b >= 1024 * 1024) return (b / 1024 / 1024).toFixed(1) + ' MB'
  if (b >= 1024)        return (b / 1024).toFixed(0) + ' KB'
  return b + ' B'
}

function toggle(id) {
  if (checked.value.has(id)) checked.value.delete(id)
  else checked.value.add(id)
  /* 触发响应式更新 */
  checked.value = new Set(checked.value)
}

watch(() => props.modelValue, (open) => {
  if (open) {
    /* 打开时同步已绑定条目 */
    checked.value = new Set(chat.boundDocs || [])
  }
})

function onConfirm() {
  chat.bindDocs(Array.from(checked.value))
  toast.success(`已绑定 ${checked.value.size} 篇知识库`)
  emit('update:modelValue', false)
}
</script>

<style scoped>
.kb-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--surface, #0f172a);
  color: var(--ink, #e2e8f0);
}
.kb-drawer__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--line, rgba(148, 163, 184, 0.16));
  flex-shrink: 0;
}
.kb-drawer__title {
  font-size: 14px;
  font-weight: 600;
  font-family: var(--font-display, system-ui);
  letter-spacing: -0.01em;
}
.kb-drawer__close {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  background: transparent;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
  color: var(--ink-3, #94a3b8);
  transition: all 0.15s;
}
.kb-drawer__close:hover { background: rgba(148, 163, 184, 0.1); color: var(--ink, #e2e8f0); }
.kb-drawer__close svg { width: 16px; height: 16px; }
.kb-drawer__search {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 16px 8px;
  padding: 6px 12px;
  background: rgba(148, 163, 184, 0.06);
  border: 1px solid var(--line, rgba(148, 163, 184, 0.16));
  border-radius: 8px;
}
.kb-drawer__search svg { width: 14px; height: 14px; color: var(--ink-3, #94a3b8); flex-shrink: 0; }
.kb-drawer__input {
  flex: 1;
  background: transparent;
  border: 0;
  outline: 0;
  font-size: 12.5px;
  color: var(--ink, #e2e8f0);
  font-family: inherit;
}
.kb-drawer__list {
  list-style: none;
  margin: 0;
  padding: 4px 12px;
  flex: 1;
  overflow-y: auto;
}
.kb-drawer__item {
  margin: 4px 0;
  border-radius: 8px;
  transition: background 0.15s;
}
.kb-drawer__item:hover { background: rgba(148, 163, 184, 0.06); }
.kb-drawer__item.is-checked {
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
}
.kb-drawer__check {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  font-size: 12.5px;
  align-items: flex-start;
}
.kb-drawer__check input { width: 14px; height: 14px; margin-top: 2px; flex-shrink: 0; }
.kb-drawer__item-body { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
.kb-drawer__item-name { color: var(--ink, #e2e8f0); font-weight: 500; line-height: 1.4; }
.kb-drawer__item-meta { color: var(--ink-3, #94a3b8); font-size: 11px; font-family: var(--font-mono, monospace); }
.kb-drawer__item-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 2px; }
.kb-drawer__tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  background: rgba(139, 92, 246, 0.12);
  color: var(--accent, #a78bfa);
  border: 1px solid rgba(139, 92, 246, 0.25);
  font-family: var(--font-mono, monospace);
}
.kb-drawer__empty {
  text-align: center;
  color: var(--ink-3, #94a3b8);
  font-size: 12px;
  padding: 32px 12px;
}
.kb-drawer__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid var(--line, rgba(148, 163, 184, 0.16));
  background: rgba(148, 163, 184, 0.04);
  font-size: 12px;
  color: var(--ink-2, #cbd5e1);
  flex-shrink: 0;
}
.kb-drawer__foot b { color: var(--ink, #e2e8f0); font-weight: 600; font-family: var(--font-mono, monospace); }
.kb-drawer__actions { display: flex; gap: 6px; }
.kb-drawer__btn {
  padding: 5px 12px;
  font-size: 12.5px;
  border: 1px solid var(--line, rgba(148, 163, 184, 0.2));
  background: var(--surface, #0f172a);
  color: var(--ink, #e2e8f0);
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.kb-drawer__btn:hover { border-color: var(--accent, #8b5cf6); }
.kb-drawer__btn--primary {
  background: var(--accent, #8b5cf6);
  color: #fff;
  border-color: var(--accent, #8b5cf6);
}
.kb-drawer__btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }
</style>