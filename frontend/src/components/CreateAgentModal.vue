<template>
  <!-- Teleport 到 body,逃出任何祖先的 transform/filter/perspective/will-change 包含块 -->
  <!-- 防止 position:fixed 失效,确保弹窗始终相对于视口居中 -->
  <Teleport to="body">
    <Transition name="ca-fade">
      <div v-if="open" class="ca-mask" @mousedown.self="onClose">
        <div class="ca-modal" role="dialog" aria-modal="true">
          <!-- ============== HEADER (对齐 cs-modal__head) ============== -->
          <header class="ca-modal__head">
            <div class="ca-modal__title">
              <span class="ca-modal__icon" :style="{ background: form.color_theme + '22', color: form.color_theme }">
                <el-icon :size="18"><component :is="iconComp(form.icon)" /></el-icon>
              </span>
              <div>
                <h3>新建智能体</h3>
                <p>自定义 AI 助手 · 绑定人设与触发命令,创建后出现在「我的自定义智能体」分块</p>
              </div>
            </div>
            <button class="ca-modal__close" @click="onClose" aria-label="关闭">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </header>

          <form class="ca-modal__body" @submit.prevent="handleSubmit">
            <!-- 智能体名称 (对齐 cs-field) -->
            <div class="ca-field">
              <label>智能体名称 <span class="req">*</span></label>
              <input
                v-model.trim="form.name"
                type="text"
                placeholder="例如:周报生成助手"
                maxlength="30"
              />
              <span v-if="errors.name" class="ca-field__err">{{ errors.name }}</span>
              <span v-else class="ca-field__hint">{{ form.name.length }} / 30</span>
            </div>

            <!-- 功能简介 (对齐 cs-field) -->
            <div class="ca-field">
              <label>功能简介 <span class="req">*</span></label>
              <textarea
                v-model.trim="form.description"
                rows="2"
                placeholder="一句话说明这个智能体能解决什么问题"
                maxlength="120"
              />
              <span v-if="errors.description" class="ca-field__err">{{ errors.description }}</span>
              <span v-else class="ca-field__hint">{{ form.description.length }} / 120</span>
            </div>

            <!-- 所属分类 (对齐 cs-chips) -->
            <div class="ca-field">
              <label>所属分类</label>
              <div class="ca-chips">
                <button
                  v-for="c in CATEGORIES"
                  :key="c.key"
                  type="button"
                  class="ca-chip"
                  :class="{ 'is-active': form.category === c.key }"
                  @click="form.category = c.key"
                >
                  <span class="ca-chip__dot" :class="['is-' + c.key]" />
                  {{ c.name }}
                </button>
              </div>
            </div>

            <!-- 主题色 + 图标 (对齐 cs-row) -->
            <div class="ca-row">
              <div class="ca-field ca-field--half">
                <label>主题色</label>
                <div class="ca-colors">
                  <button
                    v-for="c in COLORS"
                    :key="c"
                    type="button"
                    class="ca-color-dot"
                    :class="{ 'is-active': form.color_theme === c }"
                    :style="{ background: c }"
                    @click="form.color_theme = c"
                  />
                </div>
              </div>
              <div class="ca-field ca-field--half">
                <label>图标</label>
                <div class="ca-icons">
                  <button
                    v-for="ic in ICONS"
                    :key="ic"
                    type="button"
                    class="ca-icon-btn"
                    :class="{ 'is-active': form.icon === ic }"
                    @click="form.icon = ic"
                  >
                    <el-icon :size="16"><component :is="iconComp(ic)" /></el-icon>
                  </button>
                </div>
              </div>
            </div>

            <!-- 高级设置 (对齐 cs-details) -->
            <details class="ca-details">
              <summary>高级设置(可选)</summary>
              <div class="ca-field">
                <label>触发命令</label>
                <div class="ca-trigger">
                  <span class="ca-trigger__prefix">/</span>
                  <input
                    v-model.trim="form.trigger_cmd"
                    type="text"
                    placeholder="mybot"
                    maxlength="40"
                  />
                </div>
                <span class="ca-field__hint">在聊天输入框中以 /xxx 形式快速调用</span>
              </div>
              <div class="ca-field">
                <label>人设 / 系统提示词</label>
                <textarea
                  v-model="form.system_prompt"
                  rows="5"
                  placeholder="你是一位专业的【角色】,擅长【领域】...&#10;回答要求:&#10;1. ...&#10;2. ..."
                  maxlength="2000"
                  class="ca-prompt"
                />
                <span class="ca-field__hint">{{ form.system_prompt.length }} / 2000 · 定义智能体的角色定位、回答风格、注意事项等</span>
              </div>
            </details>
          </form>

          <!-- ============== FOOTER (对齐 cs-modal__foot) ============== -->
          <footer class="ca-modal__foot">
            <button type="button" class="btn btn--ghost" @click="onClose">取消</button>
            <button type="button" class="btn btn--primary" :disabled="submitting" @click="handleSubmit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              {{ submitting ? '创建中...' : '创建智能体' }}
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, markRaw, watch, computed } from 'vue'
import {
  Cellphone, Connection, Cpu, Link, MagicStick, Star, StarFilled, Discount,
  Setting, Monitor, Histogram, DataAnalysis, Headset, Document, Tools,
  Notebook, Compass, Lightning, Aim, ChatLineSquare, User, DataLine, PieChart,
} from '@element-plus/icons-vue'
import { useToastStore } from '@/stores/toast'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['close', 'submit'])
const toast = useToastStore()

/* ============== 分类 (与 Skills 命名一致) ============== */
const CATEGORIES = [
  { key: 'custom',   name: '通用自定义' },
  { key: 'terminal', name: '终端' },
  { key: 'network',  name: '网络' },
  { key: 'payload',  name: '载荷' },
  { key: 'e2e',      name: '全链路' },
]

/* ============== 主题色 (对齐 cs-colors) ============== */
const COLORS = ['#5b8def', '#36cbcb', '#fbb337', '#f25c54', '#7ed321', '#b287e6', '#ff8e53', '#26bbaa']

/* ============== 图标库 (8 选) ============== */
const ICONS = [
  'smart_toy', 'auto_awesome', 'edit', 'description', 'language',
  'analytics', 'support_agent', 'psychology',
]

/* 后端 Material 图标名 -> Element Plus 图标组件 */
const ICON_MAP = {
  smartphone: Cellphone, language: Connection, memory: Cpu, checklist: Link,
  smart_toy: MagicStick, auto_awesome: Star, edit: Document, description: Document,
  code: Monitor, analytics: Histogram, support_agent: ChatLineSquare, psychology: User,
  monitor_heart: Headset, rocket_launch: Discount, workspace_premium: StarFilled,
  shield: Setting, insights: DataAnalysis, forum: ChatLineSquare,
}
function iconComp(name) { return markRaw(ICON_MAP[name] || MagicStick) }

const initialState = () => ({
  name: '',
  description: '',
  category: 'custom',
  color_theme: COLORS[0],
  icon: ICONS[0],
  trigger_cmd: '',
  system_prompt: '',
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
  if (!form.name) errors.name = '请输入智能体名称'
  else if (form.name.length > 30) errors.name = '名称不能超过 30 字'
  if (!form.description) errors.description = '请输入功能简介'
  else if (form.description.length > 120) errors.description = '简介不能超过 120 字'
  if (form.system_prompt.length > 2000) errors.system_prompt = '提示词不能超过 2000 字'
  return Object.keys(errors).length === 0
}

function handleSubmit() {
  if (!validate()) return
  submitting.value = true
  const draft = { ...form }
  emit('submit', draft)
  toast.success('智能体已创建', form.name)
  setTimeout(() => { submitting.value = false; emit('close') }, 200)
}

/* 兼容旧引用(避免在父组件调用时出现未使用警告) */
void computed
</script>

<style scoped>
/* ============== MASK (固定居中, 滚动不漂移) ============== */
.ca-mask {
  position: fixed; inset: 0; z-index: 1000;
  background: color-mix(in srgb, var(--ink-1, #0f172a) 55%, transparent);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;       /* 垂直居中 */
  justify-content: center;   /* 水平居中 */
  padding: 24px;
  overflow-y: auto;
}
.ca-modal {
  position: relative;
  width: 100%; max-width: 600px;
  max-height: calc(100vh - 48px);
  margin: auto;
  background: var(--surface-1, #fff);
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.24);
  display: flex; flex-direction: column;
  overflow: hidden;
  align-self: center;
}

/* ============== HEADER (对齐 cs-modal__head) ============== */
.ca-modal__head {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid var(--border-1, #e5e7eb);
}
.ca-modal__title { display: flex; gap: 12px; align-items: center; min-width: 0; }
.ca-modal__icon {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.ca-modal__title h3 { margin: 0; font-size: 16px; font-weight: 600; color: var(--ink-1, #0f172a); }
.ca-modal__title p  { margin: 2px 0 0; font-size: 12px; color: var(--ink-3, #6b7280); }
.ca-modal__close {
  width: 32px; height: 32px; border: none; background: transparent;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px; color: var(--ink-2, #475569); cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}
.ca-modal__close:hover { background: var(--surface-2, #f1f5f9); color: var(--ink-1, #0f172a); }
.ca-modal__close svg { width: 18px; height: 18px; }

/* ============== BODY ============== */
.ca-modal__body {
  padding: 20px 24px; overflow-y: auto; flex: 1;
  display: flex; flex-direction: column; gap: 16px;
}
.ca-field { display: flex; flex-direction: column; gap: 6px; }
.ca-field label { font-size: 13px; font-weight: 500; color: var(--ink-2, #334155); }
.ca-field .req { color: #f5365c; margin-left: 2px; }

.ca-field input, .ca-field textarea {
  border: 1px solid var(--border-1, #d1d5db);
  background: var(--surface-1, #fff);
  color: var(--ink-1, #0f172a);
  border-radius: 8px; padding: 8px 12px; font-size: 13px;
  font-family: inherit; resize: vertical;
  transition: border-color 0.15s, box-shadow 0.15s;
  width: 100%;
}
.ca-field input:focus, .ca-field textarea:focus {
  outline: none;
  border-color: var(--accent, #5b8def);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent, #5b8def) 20%, transparent);
}
.ca-field__hint { font-size: 11px; color: var(--ink-3, #6b7280); }
.ca-field__err  { font-size: 11px; color: #f5365c; }

/* ============== CHIPS (对齐 cs-chips) ============== */
.ca-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.ca-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 12px; font-size: 12px; border-radius: 999px;
  border: 1px solid var(--border-1, #d1d5db);
  background: var(--surface-1, #fff);
  color: var(--ink-2, #475569); cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.ca-chip:hover { border-color: var(--accent, #5b8def); color: var(--accent, #5b8def); }
.ca-chip.is-active {
  background: var(--accent, #5b8def); color: #fff; border-color: var(--accent, #5b8def);
}
.ca-chip__dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: currentColor; opacity: 0.6;
}
.ca-chip.is-active .ca-chip__dot { background: #fff; opacity: 1; }
/* 分类小圆点着色 (与 agent-card__cat 保持一致) */
.ca-chip__dot.is-terminal { background: #10b981; }
.ca-chip__dot.is-network  { background: #3b82f6; }
.ca-chip__dot.is-payload  { background: #f59e0b; }
.ca-chip__dot.is-e2e      { background: var(--accent, #5b8def); }
.ca-chip__dot.is-custom   { background: var(--ink-3, #6b7280); }

/* ============== ROW (主题色 + 图标) ============== */
.ca-row { display: flex; gap: 16px; }
.ca-field--half { flex: 1; }

.ca-colors { display: flex; gap: 6px; flex-wrap: wrap; }
.ca-color-dot {
  width: 24px; height: 24px; border-radius: 50%;
  border: 2px solid transparent; cursor: pointer;
  transition: transform 0.15s;
}
.ca-color-dot:hover { transform: scale(1.1); }
.ca-color-dot.is-active {
  border-color: var(--ink-1, #0f1226);
  box-shadow: 0 0 0 2px var(--surface-1, #fff) inset;
}

.ca-icons { display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; }
.ca-icon-btn {
  aspect-ratio: 1; border: 1px solid var(--border-1, #d1d5db);
  background: var(--surface-1, #fff); border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  color: var(--ink-2, #475569); cursor: pointer;
  transition: all 0.15s;
}
.ca-icon-btn:hover { color: var(--accent, #5b8def); border-color: var(--accent, #5b8def); }
.ca-icon-btn.is-active {
  background: color-mix(in srgb, var(--accent, #5b8def) 15%, transparent);
  border-color: var(--accent, #5b8def); color: var(--accent, #5b8def);
}

/* ============== DETAILS (高级设置 - 对齐 cs-details) ============== */
.ca-details {
  border: 1px dashed var(--border-1, #d1d5db);
  border-radius: 8px; padding: 8px 12px;
}
.ca-details summary {
  cursor: pointer; font-size: 12px; color: var(--ink-3, #6b7280);
  list-style: none;
  user-select: none;
}
.ca-details summary::before { content: '▸ '; transition: transform 0.15s; display: inline-block; }
.ca-details[open] summary::before { content: '▾ '; }
.ca-details[open] > .ca-field { margin-top: 12px; }

/* ============== TRIGGER (触发命令) ============== */
.ca-trigger {
  display: flex; align-items: stretch;
  border: 1px solid var(--border-1, #d1d5db);
  background: var(--surface-1, #fff);
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.ca-trigger:focus-within {
  border-color: var(--accent, #5b8def);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent, #5b8def) 20%, transparent);
}
.ca-trigger__prefix {
  display: flex; align-items: center; justify-content: center;
  width: 36px; flex-shrink: 0;
  font-size: 14px; font-weight: 500;
  color: var(--ink-3, #6b7280);
  background: var(--surface-2, #f8fafc);
  border-right: 1px solid var(--border-1, #e5e7eb);
}
.ca-trigger input {
  flex: 1; border: 0; outline: 0;
  padding: 8px 12px;
  background: transparent;
  font-size: 13px;
  color: var(--ink-1, #0f172a);
  font-family: 'JetBrains Mono', Menlo, Consolas, monospace;
}

.ca-prompt {
  font-family: 'JetBrains Mono', Menlo, Consolas, monospace;
  font-size: 12.5px; line-height: 1.7;
}

/* ============== FOOTER (对齐 cs-modal__foot) ============== */
.ca-modal__foot {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 14px 24px;
  border-top: 1px solid var(--border-1, #e5e7eb);
  background: var(--surface-2, #f8fafc);
}

/* ============== BUTTONS (对齐 .btn) ============== */
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 18px; border-radius: 10px; font-size: 13px;
  border: 1px solid var(--line); background: var(--surface);
  color: var(--ink-2); cursor: pointer;
  font-family: inherit; font-weight: 500;
  transition: all 0.15s;
}
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn--ghost:hover { background: var(--surface-2, #f1f5f9); color: var(--ink-1); }
.btn--primary {
  background: var(--accent, #5b8def); color: #fff;
  border-color: var(--accent, #5b8def);
}
.btn--primary:hover:not(:disabled) { filter: brightness(1.08); }
.btn svg { width: 14px; height: 14px; }

/* ============== ANIMATIONS ============== */
.ca-fade-enter-active, .ca-fade-leave-active { transition: opacity 0.2s; }
.ca-fade-enter-active .ca-modal, .ca-fade-leave-active .ca-modal { transition: transform 0.2s; }
.ca-fade-enter-from, .ca-fade-leave-to { opacity: 0; }
.ca-fade-enter-from .ca-modal, .ca-fade-leave-to .ca-modal { transform: scale(0.96) translateY(8px); }

/* ============== RESPONSIVE (对齐 cs-modal) ============== */
@media (max-width: 640px) {
  .ca-mask { padding: 12px; }
  .ca-modal { max-height: calc(100vh - 24px); border-radius: 12px; }
  .ca-row { flex-direction: column; gap: 14px; }
  .ca-icons { grid-template-columns: repeat(6, 1fr); }
  .ca-modal__head, .ca-modal__body, .ca-modal__foot { padding-left: 18px; padding-right: 18px; }
}
</style>
