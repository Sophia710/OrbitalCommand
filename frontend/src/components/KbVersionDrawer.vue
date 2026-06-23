<template>
  <Teleport to="body">
    <Transition name="kbvd">
      <aside v-if="open && doc" class="kbvd-mask" @mousedown.self="onClose">
        <div class="kbvd-drawer" role="dialog" aria-modal="true" :aria-label="doc.filename + ' 版本历史'">
          <header class="kbvd-drawer__head">
            <div class="kbvd-drawer__title">
              <span class="kbvd-drawer__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>
                </svg>
              </span>
              <div>
                <h3>版本历史</h3>
                <p>{{ doc.filename }}</p>
              </div>
            </div>
            <button class="kbvd-drawer__close" @click="onClose" aria-label="关闭">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </header>

          <div v-if="loading" class="kbvd-drawer__loading">
            <div class="spinner" /> 正在拉取 {{ doc.filename }} 的版本历史...
          </div>

          <ol v-else-if="versions.length" class="kbvd-drawer__list">
            <li
              v-for="v in versions"
              :key="v.id"
              class="kbvd-drawer__item"
              :class="{ 'is-current': v.is_current }"
            >
              <span class="kbvd-drawer__node" />
              <div class="kbvd-drawer__body">
                <header>
                  <span class="kbvd-drawer__pill" :class="{ 'is-current': v.is_current }">v{{ v.version }}</span>
                  <span v-if="v.is_current" class="kbvd-drawer__current-tag">当前版本</span>
                  <span class="kbvd-drawer__time">{{ v.created_at }}</span>
                </header>
                <p v-if="v.changelog" class="kbvd-drawer__msg">{{ v.changelog }}</p>
                <footer>
                  <span>📦 {{ formatSize(v.size_bytes) }}</span>
                  <span>👤 {{ v.modifier_name || '—' }}</span>
                  <span v-if="v.chunk_count">🧩 {{ v.chunk_count }} 个分块</span>
                </footer>
                <div v-if="!v.is_current" class="kbvd-drawer__actions">
                  <button class="btn btn--ghost btn--sm" @click="preview(v)">查看此版本</button>
                  <button class="btn btn--primary btn--sm" @click="rollback(v)">回滚到此版本</button>
                </div>
              </div>
            </li>
          </ol>

          <div v-else class="kbvd-drawer__empty">
            <div class="kbvd-drawer__icon-empty">📜</div>
            <h4>暂无历史版本</h4>
            <p>每次上传或更新都会自动生成一个新版本,目前仅保留了最新版本。</p>
          </div>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getDocumentVersions } from '@/api/smart-center'

const props = defineProps({
  open:  { type: Boolean, default: false },
  doc:   { type: Object,  default: null },
})
const emit = defineEmits(['close', 'rollback', 'preview'])

const loading  = ref(false)
const versions = ref([])

watch(
  () => [props.open, props.doc?.id],
  async ([isOpen, id]) => {
    if (isOpen && id) {
      loading.value = true
      try {
        const res = await getDocumentVersions(id)
        versions.value = res.list || []
      } catch (e) {
        versions.value = []
      } finally {
        loading.value = false
      }
    } else if (!isOpen) {
      versions.value = []
    }
  },
  { immediate: true },
)

function onClose()    { emit('close') }
function preview(v)   { emit('preview', v) }
function rollback(v)  { emit('rollback', v) }

function formatSize(n) {
  if (!n) return '0 B'
  if (n >= 1e9) return (n / 1e9).toFixed(2) + ' GB'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + ' MB'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + ' KB'
  return n + ' B'
}
</script>

<style scoped>
.kbvd-mask {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(15, 23, 42, 0.4);
  display: flex; justify-content: flex-end;
}
.kbvd-drawer {
  width: 520px; max-width: 95vw; height: 100%;
  background: var(--surface);
  display: flex; flex-direction: column;
  box-shadow: -8px 0 32px rgba(0,0,0,0.18);
}
.kbvd-drawer__head {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 20px 24px; border-bottom: 1px solid var(--line);
}
.kbvd-drawer__title { display: flex; gap: 12px; align-items: flex-start; }
.kbvd-drawer__icon {
  width: 40px; height: 40px; border-radius: 10px;
  display: grid; place-items: center;
  background: var(--accent-soft); color: var(--accent);
}
.kbvd-drawer__icon svg { width: 20px; height: 20px; }
.kbvd-drawer__title h3 { margin: 0 0 4px; font-size: 15px; font-weight: 600; }
.kbvd-drawer__title p  { margin: 0; font-size: 12px; color: var(--ink-3);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 360px; }
.kbvd-drawer__close {
  margin-left: auto; width: 32px; height: 32px;
  background: var(--surface-2); border: 1px solid var(--line);
  border-radius: 8px; cursor: pointer; color: var(--ink-2);
  display: grid; place-items: center;
}
.kbvd-drawer__close svg { width: 14px; height: 14px; }
.kbvd-drawer__close:hover { background: var(--surface); color: var(--ink); }
.kbvd-drawer__loading {
  padding: 60px 24px; text-align: center; font-size: 12.5px; color: var(--ink-3);
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.kbvd-drawer__loading .spinner { width: 18px; height: 18px; }
.kbvd-drawer__list {
  flex: 1; overflow-y: auto; padding: 20px 24px;
  list-style: none; margin: 0; position: relative;
}
.kbvd-drawer__list::before {
  content: ''; position: absolute; left: 31px; top: 28px; bottom: 28px;
  width: 1.5px; background: var(--line);
}
.kbvd-drawer__item {
  position: relative; padding: 0 0 18px 28px;
  display: flex; align-items: flex-start; gap: 12px;
}
.kbvd-drawer__item:last-child { padding-bottom: 0; }
.kbvd-drawer__node {
  position: absolute; left: 22px; top: 8px;
  width: 12px; height: 12px; border-radius: 50%;
  background: var(--surface); border: 2px solid var(--line);
}
.kbvd-drawer__item.is-current .kbvd-drawer__node {
  background: var(--accent); border-color: var(--accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 16%, transparent);
}
.kbvd-drawer__body {
  flex: 1; padding: 10px 12px;
  background: var(--surface-2); border: 1px solid var(--line); border-radius: 8px;
}
.kbvd-drawer__item.is-current .kbvd-drawer__body {
  background: color-mix(in srgb, var(--accent) 6%, var(--surface));
  border-color: color-mix(in srgb, var(--accent) 28%, var(--line));
}
.kbvd-drawer__body header { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.kbvd-drawer__pill {
  font-size: 11px; font-weight: 600; padding: 1px 7px;
  background: var(--surface); border: 1px solid var(--line); border-radius: 4px;
  color: var(--ink-2);
}
.kbvd-drawer__pill.is-current { background: var(--accent); color: #fff; border-color: var(--accent); }
.kbvd-drawer__current-tag { font-size: 10px; padding: 1px 6px; background: #16a34a22; color: #16a34a; border-radius: 4px; }
.kbvd-drawer__time { margin-left: auto; font-size: 10.5px; color: var(--ink-3); }
.kbvd-drawer__msg { margin: 4px 0 6px; font-size: 12px; color: var(--ink-2); line-height: 1.5; }
.kbvd-drawer__body footer { display: flex; gap: 10px; font-size: 10.5px; color: var(--ink-3); flex-wrap: wrap; }
.kbvd-drawer__actions { margin-top: 8px; display: flex; gap: 6px; }
.kbvd-drawer__empty {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: 40px 24px; color: var(--ink-3);
}
.kbvd-drawer__icon-empty { font-size: 48px; margin-bottom: 12px; opacity: 0.5; }
.kbvd-drawer__empty h4 { margin: 0 0 6px; font-size: 14px; color: var(--ink); }
.kbvd-drawer__empty p  { margin: 0; font-size: 12px; line-height: 1.6; max-width: 320px; }

/* Enter / leave */
.kbvd-enter-active, .kbvd-leave-active { transition: opacity 0.22s ease; }
.kbvd-enter-active .kbvd-drawer, .kbvd-leave-active .kbvd-drawer { transition: transform 0.22s ease; }
.kbvd-enter-from, .kbvd-leave-to { opacity: 0; }
.kbvd-enter-from .kbvd-drawer, .kbvd-leave-to .kbvd-drawer { transform: translateX(100%); }
</style>
