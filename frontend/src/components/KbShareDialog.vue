<template>
  <Teleport to="body">
    <Transition name="kbsd">
      <div v-if="open && doc" class="kbsd-mask" @mousedown.self="onClose">
        <div class="kbsd-dialog" role="dialog" aria-modal="true" :aria-label="doc.filename + ' 分享设置'">
          <header class="kbsd-dialog__head">
            <div class="kbsd-dialog__title">
              <span class="kbsd-dialog__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>
                </svg>
              </span>
              <div>
                <h3>分享文档</h3>
                <p>{{ doc.filename }}</p>
              </div>
            </div>
            <button class="kbsd-dialog__close" @click="onClose" aria-label="关闭">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </header>

          <div class="kbsd-dialog__body">
            <div class="kbsd-dialog__modes">
              <button
                v-for="m in MODES"
                :key="m.key"
                class="kbsd-mode"
                :class="{ 'is-active': draft.mode === m.key }"
                @click="draft.mode = m.key"
                type="button"
              >
                <span class="kbsd-mode__icon">{{ m.icon }}</span>
                <strong>{{ m.name }}</strong>
                <small>{{ m.desc }}</small>
              </button>
            </div>

            <div v-if="draft.mode !== 'private'" class="kbsd-dialog__link">
              <label>分享链接</label>
              <div class="kbsd-dialog__link-row">
                <input
                  v-model="draft.link"
                  readonly
                  placeholder="保存后自动生成可分享链接"
                />
                <button class="btn btn--ghost btn--sm" @click="copyLink">
                  {{ copied ? '✓ 已复制' : '复制' }}
                </button>
              </div>
              <p v-if="draft.mode === 'link'" class="kbsd-dialog__hint">
                持有该链接的协作者可查看文档,适合在小范围工作小组内分享。
              </p>
              <p v-else class="kbsd-dialog__hint">
                公开后,任何拥有链接的人都能阅读此文档;在「公开知识库」列表内也会被索引到。
              </p>
            </div>

            <div v-if="(doc.shared_members && doc.shared_members.length) || draft.mode !== 'private'" class="kbsd-dialog__members">
              <label>已分享成员 ({{ (doc.shared_members || []).length }})</label>
              <div class="kbsd-dialog__member-list">
                <span v-for="m in doc.shared_members || []" :key="m.user_id" class="kbsd-dialog__member">
                  <span class="kb-doc-card__avatar" :style="{ background: m.color || '#5b8def' }">
                    {{ (m.name || '?').slice(0,1) }}
                  </span>
                  {{ m.name }}
                </span>
                <span v-if="!doc.shared_members || !doc.shared_members.length" class="kbsd-dialog__hint">
                  {{ draft.mode === 'private' ? '请先选择分享模式' : '尚未邀请具体成员,链接本身可访问。' }}
                </span>
              </div>
            </div>
          </div>

          <footer class="kbsd-dialog__foot">
            <button class="btn btn--ghost btn--sm" @click="onClose">取消</button>
            <button class="btn btn--primary btn--sm" :disabled="saving" @click="onSave">
              {{ saving ? '保存中...' : '保存分享设置' }}
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { setDocumentShare } from '@/api/smart-center'

const props = defineProps({
  open: { type: Boolean, default: false },
  doc:  { type: Object,  default: null },
})
const emit = defineEmits(['close', 'saved'])

const MODES = [
  { key: 'private', icon: '🔒', name: '仅自己',   desc: '私有 · 仅本人可访问' },
  { key: 'link',    icon: '🔗', name: '链接访问', desc: '持有链接者均可访问' },
  { key: 'public',  icon: '🌐', name: '完全公开', desc: '组织/互联网可发现' },
]

const draft  = reactive({ mode: 'private', link: '' })
const saving = ref(false)
const copied = ref(false)

watch(
  () => [props.open, props.doc?.id],
  ([isOpen]) => {
    if (isOpen && props.doc) {
      draft.mode = props.doc.share?.mode || 'private'
      draft.link = props.doc.share?.link  || ''
    }
    copied.value = false
  },
  { immediate: true },
)

async function copyLink() {
  if (!draft.link) return
  try {
    await navigator.clipboard.writeText(draft.link)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch (e) {
    /* fallback: select */
    const input = document.createElement('textarea')
    input.value = draft.link
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  }
}

async function onSave() {
  saving.value = true
  try {
    const res = await setDocumentShare({
      id:   props.doc.id,
      mode: draft.mode,
      link: draft.link || undefined,
    })
    emit('saved', { doc: props.doc, share: res.share || { mode: draft.mode, link: draft.link } })
    onClose()
  } catch (e) {
    /* ignore */
  } finally {
    saving.value = false
  }
}

function onClose() { emit('close') }
</script>

<style scoped>
.kbsd-mask {
  position: fixed; inset: 0; z-index: 1001;
  background: rgba(15, 23, 42, 0.45);
  display: grid; place-items: center;
}
.kbsd-dialog {
  width: 520px; max-width: 95vw; max-height: 90vh;
  background: var(--surface); border-radius: 14px;
  display: flex; flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  overflow: hidden;
}
.kbsd-dialog__head {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 20px; border-bottom: 1px solid var(--line);
}
.kbsd-dialog__title { display: flex; gap: 12px; align-items: center; }
.kbsd-dialog__icon {
  width: 40px; height: 40px; border-radius: 10px;
  display: grid; place-items: center;
  background: var(--accent-soft); color: var(--accent);
}
.kbsd-dialog__icon svg { width: 20px; height: 20px; }
.kbsd-dialog__title h3 { margin: 0 0 2px; font-size: 14.5px; font-weight: 600; }
.kbsd-dialog__title p  { margin: 0; font-size: 12px; color: var(--ink-3);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 320px; }
.kbsd-dialog__close {
  margin-left: auto; width: 32px; height: 32px;
  background: var(--surface-2); border: 1px solid var(--line);
  border-radius: 8px; cursor: pointer; color: var(--ink-2);
  display: grid; place-items: center;
}
.kbsd-dialog__close svg { width: 14px; height: 14px; }
.kbsd-dialog__close:hover { background: var(--surface); color: var(--ink); }
.kbsd-dialog__body { padding: 18px 20px; overflow-y: auto; }
.kbsd-dialog__modes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; }
.kbsd-mode {
  display: flex; flex-direction: column; align-items: center;
  gap: 4px; padding: 14px 8px;
  background: var(--surface-2); border: 1px solid var(--line);
  border-radius: 10px; cursor: pointer; transition: all 0.15s;
  color: var(--ink-2);
}
.kbsd-mode:hover { border-color: var(--accent); }
.kbsd-mode.is-active {
  background: color-mix(in srgb, var(--accent) 8%, var(--surface));
  border-color: var(--accent); color: var(--accent);
}
.kbsd-mode__icon { font-size: 24px; }
.kbsd-mode strong { font-size: 12.5px; font-weight: 600; }
.kbsd-mode small  { font-size: 10.5px; color: var(--ink-3); text-align: center; line-height: 1.4; }
.kbsd-mode.is-active small { color: color-mix(in srgb, var(--accent) 80%, var(--ink-3)); }
.kbsd-dialog__link label { display: block; font-size: 11.5px; color: var(--ink-3); margin-bottom: 6px; font-weight: 500; }
.kbsd-dialog__link-row { display: flex; gap: 8px; }
.kbsd-dialog__link-row input {
  flex: 1; padding: 8px 12px; border: 1px solid var(--line); border-radius: 8px;
  background: var(--surface-2); font-size: 12px; color: var(--ink);
  font-family: 'JetBrains Mono', monospace; outline: 0;
}
.kbsd-dialog__link-row input:focus { border-color: var(--accent); }
.kbsd-dialog__hint { margin: 8px 0 0; font-size: 11.5px; color: var(--ink-3); line-height: 1.5; }
.kbsd-dialog__members { margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--line-2); }
.kbsd-dialog__members label { display: block; font-size: 11.5px; color: var(--ink-3); margin-bottom: 8px; font-weight: 500; }
.kbsd-dialog__member-list { display: flex; flex-wrap: wrap; gap: 6px; }
.kbsd-dialog__member {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 10px 3px 3px; background: var(--surface-2);
  border: 1px solid var(--line); border-radius: 999px; font-size: 11.5px;
}
.kbsd-dialog__member .kb-doc-card__avatar { margin-left: 0; }
.kbsd-dialog__foot {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 14px 20px; border-top: 1px solid var(--line); background: var(--surface-2);
}

/* Buttons (局部副本,避免依赖外层 .btn) */
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 8px; font-size: 12.5px;
  border: 1px solid var(--line); background: var(--surface);
  color: var(--ink-2); cursor: pointer; transition: all 0.15s;
}
.btn--ghost:hover { background: var(--surface-2); color: var(--ink); }
.btn--primary { background: var(--accent); color: #fff; border-color: var(--accent); }
.btn--primary:hover { filter: brightness(1.08); }
.btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--sm { padding: 5px 12px; font-size: 12px; }
.kb-doc-card__avatar {
  width: 20px; height: 20px; border-radius: 50%;
  display: grid; place-items: center;
  color: #fff; font-size: 10px; font-weight: 600;
  border: 1.5px solid var(--surface);
}

/* Enter / leave */
.kbsd-enter-active, .kbsd-leave-active { transition: opacity 0.2s ease; }
.kbsd-enter-active .kbsd-dialog, .kbsd-leave-active .kbsd-dialog { transition: transform 0.2s ease, opacity 0.2s ease; }
.kbsd-enter-from, .kbsd-leave-to { opacity: 0; }
.kbsd-enter-from .kbsd-dialog, .kbsd-leave-to .kbsd-dialog { transform: translateY(20px) scale(0.96); opacity: 0; }
</style>
