<template>
  <Teleport to="body">
    <Transition name="kbsd">
      <div v-if="open && column" class="kbsd-mask" @mousedown.self="onClose">
        <div
          class="kbsd-dialog"
          role="dialog"
          aria-modal="true"
          :aria-label="`订阅专栏 ${column.title}`"
        >
          <!-- ===== Header ===== -->
          <header class="kbsd-dialog__head">
            <div class="kbsd-dialog__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div class="kbsd-dialog__head-text">
              <h3>订阅专栏</h3>
              <p>订阅后可在「我的订阅」中查看更新</p>
            </div>
            <button class="kbsd-dialog__close" aria-label="关闭" @click="onClose">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </header>

          <!-- ===== Body ===== -->
          <div class="kbsd-dialog__body">
            <!-- Column preview card -->
            <section class="kbsd-card">
              <span
                class="kbsd-card__cover"
                :style="{ background: column.cover_color }"
              >
                <span class="kbsd-card__cover-letter">
                  {{ (column.author || '?').charAt(0) }}
                </span>
              </span>
              <div class="kbsd-card__body">
                <div class="kbsd-card__title">{{ column.title }}</div>
                <div class="kbsd-card__author">
                  {{ column.author }} · {{ column.author_title }}
                </div>
                <div class="kbsd-card__meta">
                  <span><b>{{ (column.subscribers || 0).toLocaleString() }}</b> 订阅</span>
                  <span><b>{{ column.articles_count || 0 }}</b> 篇文章</span>
                  <span>更新于 {{ formatDate(column.latest_at) }}</span>
                </div>
              </div>
            </section>

            <!-- Notification preferences -->
            <section class="kbsd-section">
              <div class="kbsd-section__head">
                <h4>推送方式</h4>
                <p>选择接收更新的方式</p>
              </div>
              <div class="kbsd-options">
                <button
                  v-for="opt in frequencyOptions"
                  :key="opt.value"
                  type="button"
                  class="kbsd-option"
                  :class="{ 'is-active': form.frequency === opt.value }"
                  @click="form.frequency = opt.value"
                >
                  <span class="kbsd-option__icon" v-html="opt.icon" />
                  <span class="kbsd-option__body">
                    <span class="kbsd-option__name">{{ opt.name }}</span>
                    <span class="kbsd-option__desc">{{ opt.desc }}</span>
                  </span>
                  <span v-if="form.frequency === opt.value" class="kbsd-option__check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                </button>
              </div>
            </section>

            <!-- Notify toggle -->
            <section class="kbsd-section kbsd-section--inline">
              <div class="kbsd-toggle-row">
                <div>
                  <div class="kbsd-toggle-row__title">桌面通知</div>
                  <div class="kbsd-toggle-row__desc">新文章发布时通过浏览器通知提醒</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  :aria-checked="form.notify"
                  class="kbsd-switch"
                  :class="{ 'is-on': form.notify }"
                  @click="form.notify = !form.notify"
                >
                  <span class="kbsd-switch__thumb" />
                </button>
              </div>
            </section>

            <!-- Selected tags -->
            <section v-if="column.tags?.length" class="kbsd-section">
              <div class="kbsd-section__head">
                <h4>关注方向</h4>
                <p>{{ column.tags.length }} 个标签</p>
              </div>
              <div class="kbsd-tags">
                <span v-for="t in column.tags" :key="t" class="kbsd-tag">#{{ t }}</span>
              </div>
            </section>
          </div>

          <!-- ===== Footer ===== -->
          <footer class="kbsd-dialog__foot">
            <button class="btn btn--ghost" type="button" @click="onClose">
              取消
            </button>
            <button
              class="btn btn--primary"
              type="button"
              :disabled="saving"
              @click="onConfirm"
            >
              <span v-if="!saving" class="kbsd-btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </span>
              <span v-else class="kbsd-btn-spinner" />
              {{ saving ? '订阅中…' : '立即订阅' }}
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  open:    { type: Boolean, required: true },
  column:  { type: Object,  default: null },
  saving:  { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'confirm'])

const frequencyOptions = [
  {
    value: 'realtime',
    name: '实时推送',
    desc: '新文章发布后立刻通知',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg>',
  },
  {
    value: 'daily',
    name: '每日摘要',
    desc: '每天早上汇总一次更新',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  },
  {
    value: 'weekly',
    name: '每周精选',
    desc: '每周一汇总本周热门',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  },
  {
    value: 'off',
    name: '仅收藏',
    desc: '不推送, 仅在订阅列表中显示',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
  },
]

const form = reactive({
  frequency: 'realtime',
  notify:    true,
})

watch(
  () => props.column?.id,
  () => {
    form.frequency = 'realtime'
    form.notify    = true
  },
)

function onClose() {
  if (props.saving) return
  emit('close')
}

function onConfirm() {
  emit('confirm', { ...form })
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toISOString().slice(0, 10)
}
</script>

<style scoped>
/* ===== Mask ===== */
.kbsd-mask {
  position: fixed; inset: 0; z-index: 2200;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(6px);
  display: grid; place-items: center;
  padding: 24px;
}

.kbsd-dialog {
  width: 480px; max-width: 100%;
  max-height: calc(100vh - 48px);
  display: flex; flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
  box-shadow: 0 24px 56px rgba(15, 23, 42, 0.28);
  overflow: hidden;
}

/* ===== Header ===== */
.kbsd-dialog__head {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 18px 22px 14px;
  border-bottom: 1px solid var(--line-2);
}
.kbsd-dialog__icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: grid; place-items: center;
  background: var(--accent-soft); color: var(--accent);
  flex-shrink: 0;
}
.kbsd-dialog__icon svg { width: 18px; height: 18px; }
.kbsd-dialog__head-text { flex: 1; min-width: 0; }
.kbsd-dialog__head-text h3 {
  margin: 0 0 2px; font-size: 15px; font-weight: 600;
}
.kbsd-dialog__head-text p {
  margin: 0; font-size: 12px; color: var(--ink-3);
}
.kbsd-dialog__close {
  width: 28px; height: 28px; border-radius: 8px;
  background: transparent; border: 0; cursor: pointer;
  color: var(--ink-3); display: grid; place-items: center;
  transition: all var(--dur-fast) var(--ease);
}
.kbsd-dialog__close:hover { background: var(--surface-2); color: var(--ink); }
.kbsd-dialog__close svg { width: 14px; height: 14px; }

/* ===== Body ===== */
.kbsd-dialog__body {
  flex: 1; overflow-y: auto;
  padding: 18px 22px 4px;
  display: flex; flex-direction: column; gap: 16px;
}

/* Column preview card */
.kbsd-card {
  display: flex; gap: 12px; padding: 12px;
  background: var(--surface-2); border: 1px solid var(--line);
  border-radius: 12px;
}
.kbsd-card__cover {
  width: 64px; height: 64px; border-radius: 10px;
  display: grid; place-items: center;
  color: #fff; font-size: 22px; font-weight: 600;
  flex-shrink: 0;
  position: relative; overflow: hidden;
}
.kbsd-card__cover::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
}
.kbsd-card__cover-letter { position: relative; z-index: 1; }
.kbsd-card__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.kbsd-card__title { font-size: 14px; font-weight: 600; color: var(--ink); }
.kbsd-card__author { font-size: 11.5px; color: var(--ink-3); }
.kbsd-card__meta {
  display: flex; gap: 10px; flex-wrap: wrap;
  font-size: 11px; color: var(--ink-3); margin-top: 4px;
}
.kbsd-card__meta b { color: var(--ink); font-weight: 600; margin-right: 2px; }

/* Section */
.kbsd-section { display: flex; flex-direction: column; gap: 10px; }
.kbsd-section--inline { padding: 4px 0; }
.kbsd-section__head h4 {
  margin: 0 0 2px; font-size: 13px; font-weight: 600;
  color: var(--ink);
}
.kbsd-section__head p {
  margin: 0; font-size: 11.5px; color: var(--ink-3);
}

/* Frequency options */
.kbsd-options {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;
}
.kbsd-option {
  position: relative;
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px;
  background: var(--surface-2);
  border: 1.5px solid var(--line);
  border-radius: 10px;
  cursor: pointer; text-align: left;
  transition: all var(--dur-fast) var(--ease);
}
.kbsd-option:hover { background: var(--surface); border-color: var(--ink-3); }
.kbsd-option.is-active {
  background: var(--accent-soft);
  border-color: var(--accent);
}
.kbsd-option__icon {
  width: 28px; height: 28px; border-radius: 8px;
  background: var(--surface); color: var(--ink-2);
  display: grid; place-items: center; flex-shrink: 0;
}
.kbsd-option.is-active .kbsd-option__icon {
  background: var(--accent); color: #fff;
}
.kbsd-option__icon :deep(svg) { width: 14px; height: 14px; }
.kbsd-option__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.kbsd-option__name { font-size: 12.5px; font-weight: 600; color: var(--ink); }
.kbsd-option__desc { font-size: 10.5px; color: var(--ink-3); }
.kbsd-option__check {
  position: absolute; top: 6px; right: 6px;
  width: 16px; height: 16px; border-radius: 50%;
  background: var(--accent); color: #fff;
  display: grid; place-items: center;
}
.kbsd-option__check svg { width: 10px; height: 10px; }

/* Toggle */
.kbsd-toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 10px 12px;
  background: var(--surface-2); border: 1px solid var(--line);
  border-radius: 10px;
}
.kbsd-toggle-row__title { font-size: 13px; font-weight: 500; color: var(--ink); }
.kbsd-toggle-row__desc  { font-size: 11px; color: var(--ink-3); margin-top: 2px; }
.kbsd-switch {
  position: relative;
  width: 36px; height: 20px; border-radius: 999px;
  background: var(--line); border: 0; cursor: pointer;
  padding: 0; flex-shrink: 0;
  transition: background var(--dur-fast) var(--ease);
}
.kbsd-switch.is-on { background: var(--accent); }
.kbsd-switch__thumb {
  position: absolute; top: 2px; left: 2px;
  width: 16px; height: 16px; border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  transition: transform var(--dur-fast) var(--ease);
}
.kbsd-switch.is-on .kbsd-switch__thumb { transform: translateX(16px); }

/* Tags */
.kbsd-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.kbsd-tag {
  font-size: 11px; padding: 3px 9px; border-radius: 999px;
  background: var(--accent-soft); color: var(--accent); font-weight: 500;
}

/* ===== Footer ===== */
.kbsd-dialog__foot {
  display: flex; gap: 8px; justify-content: flex-end;
  padding: 14px 22px 18px;
  border-top: 1px solid var(--line-2);
  background: var(--surface-2);
}
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 18px; border-radius: 10px;
  font-size: 13px; font-weight: 500;
  border: 1px solid var(--line);
  background: var(--surface); color: var(--ink-2);
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
}
.btn:disabled { opacity: 0.7; cursor: not-allowed; }
.btn--ghost:hover { background: var(--surface-2); color: var(--ink); }
.btn--primary {
  background: var(--accent); color: #fff; border-color: var(--accent);
}
.btn--primary:hover:not(:disabled) { filter: brightness(1.08); }

.kbsd-btn-icon { display: inline-flex; }
.kbsd-btn-icon svg { width: 14px; height: 14px; }
.kbsd-btn-spinner {
  width: 12px; height: 12px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  animation: kbsdspin 0.7s linear infinite;
}
@keyframes kbsdspin { to { transform: rotate(360deg); } }

/* ===== Transition ===== */
.kbsd-enter-active, .kbsd-leave-active { transition: opacity 0.18s var(--ease); }
.kbsd-enter-active .kbsd-dialog, .kbsd-leave-active .kbsd-dialog {
  transition: transform 0.22s var(--ease), opacity 0.18s var(--ease);
}
.kbsd-enter-from, .kbsd-leave-to { opacity: 0; }
.kbsd-enter-from .kbsd-dialog, .kbsd-leave-to .kbsd-dialog {
  opacity: 0; transform: scale(0.96) translateY(6px);
}

@media (max-width: 520px) {
  .kbsd-dialog { width: 100%; }
  .kbsd-options { grid-template-columns: 1fr; }
}
</style>
