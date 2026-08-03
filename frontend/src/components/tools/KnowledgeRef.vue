<template>
  <Teleport to="body">
    <Transition name="kb-ref-fade">
      <div
        v-if="visible"
        class="kb-ref-tooltip"
        :style="positionStyle"
        role="tooltip"
      >
        <div class="kb-ref-tooltip__arrow" />
        <header class="kb-ref-tooltip__head">
          <span class="kb-ref-tooltip__index">[{{ index }}]</span>
          <span class="kb-ref-tooltip__name">{{ doc?.name || '未知资料' }}</span>
        </header>
        <div v-if="doc" class="kb-ref-tooltip__body">
          <div class="kb-ref-tooltip__row">
            <span class="kb-ref-tooltip__label">所属</span>
            <span class="kb-ref-tooltip__value">{{ doc.kbName }}</span>
          </div>
          <div v-if="doc.format" class="kb-ref-tooltip__row">
            <span class="kb-ref-tooltip__label">格式</span>
            <span class="kb-ref-tooltip__value">{{ formatExt(doc.format) }} · {{ formatSize(doc.size_bytes) }}</span>
          </div>
          <div v-if="doc.tags && doc.tags.length" class="kb-ref-tooltip__tags">
            <span v-for="t in doc.tags" :key="t" class="kb-ref-tooltip__tag">{{ t }}</span>
          </div>
        </div>
        <div v-else class="kb-ref-tooltip__empty">
          该资料未绑定 · 请在工具栏点击📎绑定
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
/**
 * KnowledgeRef · 知识库引用上标浮层（C.7）
 * ----------------------------------------------------------------------
 *  - 仅当 employee.id === 'market-radar-001' 时被 ChatOverlay 引入
 *  - 通过事件委托监听 .kb-ref 元素（由 renderInline 把 [n] 替换为 sup 标签）
 *  - 实时从 useChatStore().boundDocs 读取绑定信息
 *  - 其他员工不引入本组件，零影响
 */
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'

const chat = useChatStore()

const visible = ref(false)
const index = ref(0)
const positionStyle = ref({ top: '0px', left: '0px' })
let currentEl = null
let hideTimer = null

/* 文档元数据映射（与 KnowledgeBindDrawer.vue 中预置数据保持一致）
 * 这里 hardcode 一份是为了避免 KnowledgeBindDrawer 内部数据无法被外部访问
 */
const DOC_META = {
  'mr-doc-1': { name: '《卫星互联网招投标操作指引 v2.1》', kbName: '运控中心 · SOP 库', format: 'md',   size_bytes:  86420, tags: ['SOP', '招投标'] },
  'mr-doc-2': { name: '《政府遥感采购项目应答模板 2026》',   kbName: '运控中心 · SOP 库', format: 'docx', size_bytes: 412300, tags: ['模板', '政府'] },
  'mr-doc-3': { name: '《高分专项甲级资质材料清单》',         kbName: '市场部 · 资质库',   format: 'pdf',  size_bytes: 689210, tags: ['资质', '高分'] },
  'mr-doc-4': { name: '《InSAR 形变监测产品白皮书》',         kbName: '技术中心 · 产品库', format: 'pdf',  size_bytes: 1820500, tags: ['InSAR', '产品'] },
  'mr-doc-5': { name: '《客户案例：某省自然资源厅 3 年合作复盘》', kbName: '市场部 · 案例库', format: 'md', size_bytes:  52400, tags: ['案例', '复盘'] },
  'mr-doc-6': { name: '《竞品分析：航天科技 / 中电科 / 长光卫星》', kbName: '战略部 · 竞品库', format: 'xlsx', size_bytes: 326400, tags: ['竞品', '战略'] },
  'mr-doc-7': { name: '《2026 卫星互联网行业政策汇编》',         kbName: '战略部 · 政策库',   format: 'pdf',  size_bytes: 2480000, tags: ['政策', '汇编'] },
  'mr-doc-8': { name: '《商务标报价区间速查表 2026》',           kbName: '市场部 · 报价库',   format: 'xlsx', size_bytes: 124800, tags: ['报价', '速查'] },
}

function formatSize(b) {
  b = Number(b) || 0
  if (b >= 1024 * 1024) return (b / 1024 / 1024).toFixed(1) + ' MB'
  if (b >= 1024)        return (b / 1024).toFixed(0) + ' KB'
  return b + ' B'
}
function formatExt(fmt) {
  if (!fmt) return ''
  if (fmt === 'md')   return 'Markdown'
  if (fmt === 'pdf')  return 'PDF'
  if (fmt === 'docx') return 'Word'
  if (fmt === 'xlsx') return 'Excel'
  return String(fmt).toUpperCase()
}

const doc = computed(() => {
  const docId = chat.boundDocs?.[index.value - 1]
  if (!docId) return null
  return DOC_META[docId] || { name: docId, kbName: '未知' }
})

function positionTo(el) {
  if (!el) return
  const rect = el.getBoundingClientRect()
  positionStyle.value = {
    position: 'fixed',
    top:  `${rect.top - 8}px`,
    left: `${rect.left + rect.width / 2}px`,
    transform: 'translate(-50%, -100%)',
    zIndex: 9999,
  }
}

function show(el) {
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
  const idx = parseInt(el?.dataset?.kbIndex || '0', 10)
  if (!idx) return
  currentEl = el
  index.value = idx
  positionTo(el)
  visible.value = true
}

function scheduleHide(el) {
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    if (currentEl === el) {
      visible.value = false
      currentEl = null
    }
    hideTimer = null
  }, 120)
}

function onPointerOver(e) {
  const t = e.target?.closest?.('.kb-ref')
  if (!t) return
  show(t)
}
function onPointerOut(e) {
  const t = e.target?.closest?.('.kb-ref')
  if (!t) return
  /* 如果鼠标移到了 tooltip 上，不要隐藏 */
  const related = e.relatedTarget
  if (related && (related.closest?.('.kb-ref-tooltip') || related.closest?.('.kb-ref'))) return
  scheduleHide(t)
}
function onScroll() {
  if (visible.value && currentEl) positionTo(currentEl)
}
function onKeydown(e) {
  if (e.key === 'Escape' && visible.value) {
    visible.value = false
    currentEl = null
  }
}

onMounted(() => {
  if (typeof document === 'undefined') return
  document.addEventListener('mouseover', onPointerOver, true)
  document.addEventListener('mouseout',  onPointerOut,  true)
  document.addEventListener('focusin',   onPointerOver, true)
  document.addEventListener('focusout', onPointerOut,  true)
  window.addEventListener('scroll', onScroll, true)
  window.addEventListener('resize', onScroll, true)
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  if (typeof document === 'undefined') return
  document.removeEventListener('mouseover', onPointerOver, true)
  document.removeEventListener('mouseout',  onPointerOut,  true)
  document.removeEventListener('focusin',   onPointerOver, true)
  document.removeEventListener('focusout', onPointerOut,  true)
  window.removeEventListener('scroll', onScroll, true)
  window.removeEventListener('resize', onScroll, true)
  window.removeEventListener('keydown', onKeydown)
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
})

/* 暴露方法给 ChatOverlay 主动调用（备用） */
defineExpose({ show, hide: () => { visible.value = false; currentEl = null } })
</script>

<style scoped>
.kb-ref-tooltip {
  position: fixed;
  min-width: 220px;
  max-width: 320px;
  background: var(--surface-2, #1e293b);
  color: var(--ink, #e2e8f0);
  border: 1px solid var(--line, rgba(148, 163, 184, 0.24));
  border-radius: 8px;
  padding: 10px 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.32);
  font-size: 12.5px;
  line-height: 1.5;
  pointer-events: none;
  z-index: 9999;
}
.kb-ref-tooltip__arrow {
  position: absolute;
  left: 50%;
  bottom: -5px;
  transform: translateX(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background: var(--surface-2, #1e293b);
  border-right: 1px solid var(--line, rgba(148, 163, 184, 0.24));
  border-bottom: 1px solid var(--line, rgba(148, 163, 184, 0.24));
}
.kb-ref-tooltip__head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  padding-bottom: 6px;
  border-bottom: 1px dashed rgba(148, 163, 184, 0.18);
}
.kb-ref-tooltip__index {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  color: var(--accent, #a78bfa);
  background: rgba(139, 92, 246, 0.14);
  padding: 1px 5px;
  border-radius: 3px;
  border: 1px solid rgba(139, 92, 246, 0.3);
  flex-shrink: 0;
}
.kb-ref-tooltip__name {
  font-weight: 600;
  font-size: 12.5px;
  color: var(--ink, #e2e8f0);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kb-ref-tooltip__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.kb-ref-tooltip__row {
  display: flex;
  gap: 6px;
  font-size: 11.5px;
  align-items: center;
}
.kb-ref-tooltip__label {
  color: var(--ink-3, #94a3b8);
  flex-shrink: 0;
  min-width: 28px;
}
.kb-ref-tooltip__value {
  color: var(--ink-2, #cbd5e1);
  font-family: var(--font-mono, monospace);
  font-size: 11px;
}
.kb-ref-tooltip__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 2px;
}
.kb-ref-tooltip__tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  background: rgba(139, 92, 246, 0.12);
  color: var(--accent, #a78bfa);
  border: 1px solid rgba(139, 92, 246, 0.25);
  font-family: var(--font-mono, monospace);
}
.kb-ref-tooltip__empty {
  font-size: 11.5px;
  color: var(--ink-3, #94a3b8);
  font-style: italic;
  padding: 2px 0;
}

.kb-ref-fade-enter-active,
.kb-ref-fade-leave-active {
  transition: opacity 0.12s ease;
}
.kb-ref-fade-enter-from,
.kb-ref-fade-leave-to {
  opacity: 0;
}
</style>
