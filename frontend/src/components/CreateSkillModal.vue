<template>
  <!-- Teleport 到 body,逃出任何祖先的 transform/filter/perspective/will-change 包含块 -->
  <!-- 防止 position:fixed 失效,确保弹窗始终相对于视口居中 -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="cs-mask" @mousedown.self="onClose">
        <div class="cs-modal" role="dialog" aria-modal="true">
          <header class="cs-modal__head">
            <div class="cs-modal__title">
              <span class="cs-modal__icon" :style="{ background: form.color_theme + '22', color: form.color_theme }">
                <el-icon :size="18"><component :is="iconComp(form.icon)" /></el-icon>
              </span>
              <div>
                <h3>新建技能</h3>
                <p>原子化能力 · 创建后出现在「我的技能」分块,可被任意智能员工调用</p>
              </div>
            </div>
            <button class="cs-modal__close" @click="onClose" aria-label="关闭">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </header>

          <form class="cs-modal__body" @submit.prevent="handleSubmit">
            <div class="cs-field">
              <label>技能名称 <span class="req">*</span></label>
              <input v-model.trim="form.name" type="text" placeholder="例如:星地链路丢包率统计" maxlength="30" />
              <span v-if="errors.name" class="cs-field__err">{{ errors.name }}</span>
              <span v-else class="cs-field__hint">{{ form.name.length }} / 30</span>
            </div>

            <div class="cs-field">
              <label>技能简介 <span class="req">*</span></label>
              <textarea v-model.trim="form.description" rows="2" placeholder="说明此技能在什么场景被调用、产出什么结果" maxlength="120" />
              <span v-if="errors.description" class="cs-field__err">{{ errors.description }}</span>
              <span v-else class="cs-field__hint">{{ form.description.length }} / 120</span>
            </div>

            <div class="cs-field">
              <label>分类</label>
              <div class="cs-chips">
                <button
                  v-for="c in CATEGORIES"
                  :key="c.key"
                  type="button"
                  class="cs-chip"
                  :class="{ 'is-active': form.category === c.key }"
                  @click="form.category = c.key"
                >
                  {{ c.name }}
                </button>
              </div>
            </div>

            <div class="cs-row">
              <div class="cs-field cs-field--half">
                <label>主题色</label>
                <div class="cs-colors">
                  <button
                    v-for="c in COLORS"
                    :key="c"
                    type="button"
                    class="cs-color-dot"
                    :class="{ 'is-active': form.color_theme === c }"
                    :style="{ background: c }"
                    @click="form.color_theme = c"
                  />
                </div>
              </div>
              <div class="cs-field cs-field--half">
                <label>图标</label>
                <div class="cs-icons">
                  <button
                    v-for="ic in ICONS"
                    :key="ic"
                    type="button"
                    class="cs-icon-btn"
                    :class="{ 'is-active': form.icon === ic }"
                    @click="form.icon = ic"
                  >
                    <el-icon :size="16"><component :is="iconComp(ic)" /></el-icon>
                  </button>
                </div>
              </div>
            </div>

            <details class="cs-details">
              <summary>高级设置(可选)</summary>
              <div class="cs-field">
                <label>触发命令</label>
                <input v-model.trim="form.trigger_cmd" type="text" placeholder="如 /packet-loss" maxlength="40" />
              </div>
              <div class="cs-field">
                <label>Prompt 模板</label>
                <textarea v-model="form.prompt_tpl" rows="4" placeholder="调用时插入的 prompt 模板,可用 {{input}} 占位" maxlength="2000" />
                <span class="cs-field__hint">{{ form.prompt_tpl.length }} / 2000</span>
              </div>
            </details>
          </form>

          <footer class="cs-modal__foot">
            <button type="button" class="btn btn--ghost" @click="onClose">取消</button>
            <button type="button" class="btn btn--primary" :disabled="submitting" @click="handleSubmit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              {{ submitting ? '创建中...' : '创建' }}
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, markRaw, watch } from 'vue'
import {
  Cellphone, Connection, Cpu, Link, MagicStick, Star, StarFilled,
  Document, Monitor, Histogram, ChatLineSquare, User, Headset, Discount,
  Setting, DataAnalysis, DataLine, Tools, Notebook, Compass, Lightning, Aim,
} from '@element-plus/icons-vue'
import { useToastStore } from '@/stores/toast'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['close', 'submit'])
const toast = useToastStore()

const CATEGORIES = [
  { key: 'office',    name: '办公效率' },
  { key: 'dev',       name: '研发辅助' },
  { key: 'test',      name: '测试工具' },
  { key: 'ops',       name: '运维工具' },
  { key: 'marketing', name: '运营工具' },
  { key: 'general',   name: '通用' },
]
const COLORS = ['#5b8def', '#36cbcb', '#fbb337', '#f25c54', '#7ed321', '#b287e6', '#ff8e53', '#26bbaa']
const ICONS = [
  'auto_awesome', 'edit', 'description', 'language', 'code',
  'analytics', 'support_agent', 'psychology', 'monitor_heart',
  'rocket_launch', 'insights', 'forum', 'flash_on', 'auto_stories',
]

const ICON_MAP = {
  auto_awesome: Star, edit: Document, description: Document, language: Connection,
  code: Monitor, analytics: Histogram, support_agent: ChatLineSquare, psychology: User,
  monitor_heart: Headset, rocket_launch: Discount, insights: DataAnalysis,
  forum: ChatLineSquare, flash_on: Lightning, auto_stories: Notebook,
}
function iconComp(name) { return markRaw(ICON_MAP[name] || MagicStick) }

const initialState = () => ({
  name: '', description: '', category: 'general',
  color_theme: COLORS[0], icon: ICONS[0],
  trigger_cmd: '', prompt_tpl: '',
})

const form = reactive(initialState())
const errors = reactive({})
const submitting = ref(false)

function reset() {
  Object.assign(form, initialState())
  Object.keys(errors).forEach((k) => delete errors[k])
  submitting.value = false
}
watch(() => props.open, (v) => { if (v) reset() })

function onClose() {
  if (submitting.value) return
  emit('close')
}

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.name) errors.name = '请输入技能名称'
  else if (form.name.length > 30) errors.name = '名称不能超过 30 字'
  if (!form.description) errors.description = '请输入技能简介'
  else if (form.description.length > 120) errors.description = '简介不能超过 120 字'
  if (form.prompt_tpl.length > 2000) errors.prompt_tpl = '模板不能超过 2000 字'
  return Object.keys(errors).length === 0
}

function handleSubmit() {
  if (!validate()) return
  submitting.value = true
  const draft = { ...form }
  emit('submit', draft)
  toast.success('技能已创建', form.name)
  setTimeout(() => { submitting.value = false; emit('close') }, 200)
}
</script>

<style scoped>
.cs-mask {
  /* 固定定位:滚动时保持原位,不占用正常文档流,不影响其他元素布局 */
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 1000;
  background: color-mix(in srgb, var(--ink-1, #0f172a) 55%, transparent);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;       /* 垂直居中 */
  justify-content: center;   /* 水平居中 */
  padding: 24px;
  overflow-y: auto;          /* 内容过长时遮罩可滚动,但 modal 自身保持居中 */
}
.cs-modal {
  /* 固定定位:相对视口居中,不随页面滚动 */
  position: relative;
  width: 100%;
  max-width: 600px;
  max-height: calc(100vh - 48px);
  margin: auto;              /* 双保险水平/垂直居中 */
  background: var(--surface-1, #fff);
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.24);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* 防止小屏时贴边,保证水平居中 */
  align-self: center;
}
.cs-modal__head {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid var(--border-1, #e5e7eb);
}
.cs-modal__title { display: flex; gap: 12px; align-items: center; }
.cs-modal__icon {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.cs-modal__title h3 { margin: 0; font-size: 16px; font-weight: 600; }
.cs-modal__title p { margin: 2px 0 0; font-size: 12px; color: var(--ink-3, #6b7280); }
.cs-modal__close {
  width: 32px; height: 32px; border: none; background: transparent;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px; color: var(--ink-2, #475569); cursor: pointer;
}
.cs-modal__close:hover { background: var(--surface-2, #f1f5f9); }
.cs-modal__close svg { width: 18px; height: 18px; }

.cs-modal__body {
  padding: 20px 24px; overflow-y: auto; flex: 1;
  display: flex; flex-direction: column; gap: 16px;
}
.cs-field { display: flex; flex-direction: column; gap: 6px; }
.cs-field label { font-size: 13px; font-weight: 500; color: var(--ink-2, #334155); }
.cs-field .req { color: #f5365c; margin-left: 2px; }
.cs-field input, .cs-field textarea {
  border: 1px solid var(--border-1, #d1d5db);
  background: var(--surface-1, #fff);
  color: var(--ink-1, #0f172a);
  border-radius: 8px; padding: 8px 12px; font-size: 13px;
  font-family: inherit; resize: vertical;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.cs-field input:focus, .cs-field textarea:focus {
  outline: none; border-color: var(--accent, #5b8def);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent, #5b8def) 20%, transparent);
}
.cs-field__hint { font-size: 11px; color: var(--ink-3, #6b7280); }
.cs-field__err { font-size: 11px; color: #f5365c; }

.cs-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.cs-chip {
  padding: 5px 10px; font-size: 12px; border-radius: 999px;
  border: 1px solid var(--border-1, #d1d5db);
  background: var(--surface-1, #fff);
  color: var(--ink-2, #475569); cursor: pointer;
  transition: all 0.15s;
}
.cs-chip:hover { border-color: var(--accent, #5b8def); color: var(--accent, #5b8def); }
.cs-chip.is-active {
  background: var(--accent, #5b8def); color: #fff; border-color: var(--accent, #5b8def);
}

.cs-row { display: flex; gap: 16px; }
.cs-field--half { flex: 1; }

.cs-colors { display: flex; gap: 6px; flex-wrap: wrap; }
.cs-color-dot {
  width: 24px; height: 24px; border-radius: 50%;
  border: 2px solid transparent; cursor: pointer;
  transition: transform 0.15s;
}
.cs-color-dot:hover { transform: scale(1.1); }
.cs-color-dot.is-active {
  border-color: var(--ink-1, #0f172a);
  box-shadow: 0 0 0 2px var(--surface-1, #fff) inset;
}

.cs-icons { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.cs-icon-btn {
  aspect-ratio: 1; border: 1px solid var(--border-1, #d1d5db);
  background: var(--surface-1, #fff); border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  color: var(--ink-2, #475569); cursor: pointer;
  transition: all 0.15s;
}
.cs-icon-btn:hover { color: var(--accent, #5b8def); border-color: var(--accent, #5b8def); }
.cs-icon-btn.is-active {
  background: color-mix(in srgb, var(--accent, #5b8def) 15%, transparent);
  border-color: var(--accent, #5b8def); color: var(--accent, #5b8def);
}

.cs-details {
  border: 1px dashed var(--border-1, #d1d5db);
  border-radius: 8px; padding: 8px 12px;
}
.cs-details summary {
  cursor: pointer; font-size: 12px; color: var(--ink-3, #6b7280);
  list-style: none;
}
.cs-details summary::before { content: '▸ '; }
.cs-details[open] summary::before { content: '▾ '; }
.cs-details[open] > .cs-field { margin-top: 12px; }

.cs-modal__foot {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 14px 24px; border-top: 1px solid var(--border-1, #e5e7eb);
  background: var(--surface-2, #f8fafc);
}

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s; }
.modal-enter-active .cs-modal, .modal-leave-active .cs-modal { transition: transform 0.2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .cs-modal, .modal-leave-to .cs-modal { transform: scale(0.96) translateY(8px); }

/* 响应式:小屏下 modal 保留圆角与水平居中,防止贴边 */
@media (max-width: 640px) {
  .cs-mask { padding: 12px; }
  .cs-modal { max-height: calc(100vh - 24px); border-radius: 12px; }
}
</style>
