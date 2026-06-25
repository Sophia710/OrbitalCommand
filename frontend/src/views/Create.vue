<template>
  <div class="page page-create" :class="{ 'view-enter': entering }">
    <!-- 顶部预览条 -->
    <header class="create-header">
      <div class="create-header__left">
        <div class="create-header__logo">{{ initial }}</div>
        <div>
          <div class="create-header__name">{{ form.name || '未命名数字员工（草稿）' }}</div>
          <div class="create-header__sub">
            <span class="chip chip--ok">草稿</span>
            <span class="chip chip--muted">L4 · 高度自主</span>
            <span class="chip chip--muted">{{ form.domain }} · {{ kindLabel }}方向</span>
            <span class="chip chip--muted">最近编辑：刚刚</span>
          </div>
        </div>
      </div>
      <div class="create-header__actions">
        <button class="btn btn--ghost" @click="onSaveDraft">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          保存草稿
        </button>
        <button class="btn btn--ghost" @click="onTestRun">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          试运行
        </button>
        <button class="btn btn--primary" @click="onSave">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          保存
        </button>
        <button class="btn btn--primary" @click="onSubmit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          发布到广场
        </button>
      </div>
    </header>

    <div class="create-ws">
      <!-- 左：表单列 -->
      <div class="create-form-col">
        <section class="form-card">
          <div class="form-card__head">
            <h4>基础属性</h4>
            <span class="form-card__sub">员工的基础身份信息</span>
          </div>
          <div class="form-grid">
            <div class="field">
              <span>员工名称</span>
              <input v-model="form.name" placeholder="如：链路诊断员 · 卫通7号" maxlength="32"/>
            </div>
            <div class="field">
              <span>领域</span>
              <select v-model="form.domain">
                <option v-for="d in DOMAINS" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
            <div class="field">
              <span>可见范围</span>
              <select v-model="form.visibility">
                <option value="team">团队内部</option>
                <option value="public">全员可见</option>
                <option value="private">仅自己</option>
              </select>
            </div>
            <div class="field field--full">
              <span>简介</span>
              <textarea v-model="form.description" rows="2" placeholder="面向信关站链路的自动巡检与异常识别，覆盖指标采集、根因定位、处置建议生成。"></textarea>
            </div>
            <div class="field field--full">
              <span>标签</span>
              <div class="tag-input">
                <span v-for="t in form.tags" :key="t" class="tag">
                  {{ t }}<i @click="removeTag(t)">×</i>
                </span>
                <input v-model="tagInput" placeholder="+ 添加标签" @keydown.enter.prevent="addTag"/>
              </div>
            </div>
          </div>
        </section>

        <section class="form-card">
          <div class="form-card__head">
            <h4>智能体配置</h4>
            <span class="form-card__sub">选择底层模型与推理能力</span>
          </div>
          <div class="form-grid">
            <div class="field">
              <span>模型</span>
              <select v-model="form.model">
                <option v-for="m in MODELS" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>
            <div class="field">
              <span>自主级别</span>
              <select v-model="form.autonomy">
                <option v-for="l in AUTONOMY" :key="l" :value="l">{{ l }}</option>
              </select>
            </div>
            <div class="field">
              <span>白盒推理</span>
              <select v-model="form.reasoning">
                <option>开启 · 展示推理步骤</option>
                <option>关闭</option>
              </select>
            </div>
            <div class="field">
              <span>多轮记忆</span>
              <select v-model="form.memory">
                <option>开启 · 持久化</option>
                <option>会话级</option>
              </select>
            </div>
            <div class="field field--full">
              <span>系统提示词 (System Prompt)</span>
              <textarea v-model="form.systemPrompt" rows="4" placeholder="你是「链路健康巡检员」，负责信关站链路的自动巡检与异常识别。请使用简明专业的中文回答，所有指标与判断需引用具体来源。"></textarea>
            </div>
            <div class="field">
              <span>人工兜底</span>
              <select>
                <option>高风险操作需人工审核</option>
                <option>低风险自动执行</option>
              </select>
            </div>
          </div>
        </section>

        <section class="form-card">
          <div class="form-card__head">
            <h4>高级参数</h4>
            <span class="form-card__sub">微调推理质量与吞吐</span>
          </div>
          <div class="form-grid">
            <div class="field">
              <span>Temperature</span>
              <input v-model="form.temperature" type="number" step="0.1" min="0" max="2"/>
            </div>
            <div class="field">
              <span>Top-P</span>
              <input v-model="form.topP" type="number" step="0.05" min="0" max="1"/>
            </div>
            <div class="field">
              <span>最大 Tokens</span>
              <input v-model="form.maxTokens" type="number"/>
            </div>
            <div class="field">
              <span>超时（秒）</span>
              <input v-model="form.timeout" type="number"/>
            </div>
            <div class="field">
              <span>并发上限</span>
              <input v-model="form.concurrency" type="number"/>
            </div>
            <div class="field">
              <span>知识库召回 Top-K</span>
              <input v-model="form.topK" type="number"/>
            </div>
          </div>
        </section>

        <section class="form-card">
          <div class="form-card__head">
            <h4>关联资产</h4>
            <span class="form-card__sub">挂载本员工可调用的 Skill 与知识库</span>
          </div>
          <div class="asset-list">
            <div v-for="a in assets" :key="a.title" class="asset-row">
              <div>
                <div class="asset-row__title">{{ a.title }}</div>
                <div class="asset-row__desc">{{ a.desc }}</div>
              </div>
              <span class="chip chip--ok">已挂载</span>
            </div>
            <button class="link-btn">+ 关联 Skill / 知识库</button>
          </div>
        </section>
      </div>

      <!-- 右：预览列 -->
      <div class="create-preview-col">
        <div class="create-chat">
          <div class="create-chat__head">
            <div class="create-chat__agent">
              <div class="create-chat__avatar">{{ initial }}</div>
              <div>
                <div class="create-chat__name">{{ form.name || '链路健康巡检员' }}</div>
                <div class="create-chat__status"><i class="dot"></i> 模拟会话 · {{ form.autonomy }}</div>
              </div>
            </div>
            <button class="iconbtn" aria-label="重置" @click="resetChat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>
              </svg>
            </button>
          </div>
          <div class="create-chat__body" ref="chatBody">
            <div v-for="(m, i) in chat" :key="i" :class="['create-chat__msg', `create-chat__msg--${m.role}`]">
              <div>{{ m.text }}</div>
              <ol v-if="m.steps" class="create-chat__steps">
                <li v-for="(s, j) in m.steps" :key="j">{{ s }}</li>
              </ol>
            </div>
          </div>
          <div class="create-chat__input">
            <input v-model="userInput" placeholder="输入指令模拟一次调用…" @keydown.enter.prevent="sendChat"/>
            <button class="btn btn--primary" @click="sendChat">发送</button>
          </div>
        </div>

        <div class="create-preview__hint">
          <div class="create-preview__hint-title">实时预览说明</div>
          <ul>
            <li>右侧基于当前模型 / 提示词 / 知识库配置，模拟一次真实调用样例</li>
            <li>调整左侧表单可即时看到推理步骤与输出风格变化</li>
            <li>完整工作流编排请在「工作流画布」中配置（高级模式）</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'Create' })
import { ref, computed, onMounted, nextTick } from 'vue'
import { createEmployee } from '@/api/employees'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
const entering = ref(true)

const DOMAINS = ['终端', '星地链路', '载荷', '全链路', '运维']
const MODELS = ['Qwen2.5-72B', 'DeepSeek-V3', 'Llama-3.3-70B', 'GLM-4']
const AUTONOMY = ['L1 · 辅助执行', 'L2 · 半自主执行', 'L3 · 条件自主', 'L4 · 高度自主']

const form = ref({
  name: '链路健康巡检员',
  domain: '星地链路',
  visibility: 'team',
  description: '面向信关站链路的自动巡检与异常识别，覆盖指标采集、根因定位、处置建议生成。',
  tags: ['链路诊断', '信关站', '巡检'],
  model: 'DeepSeek-V3',
  autonomy: 'L4 · 高度自主',
  reasoning: '开启 · 展示推理步骤',
  memory: '开启 · 持久化',
  systemPrompt: '你是「链路健康巡检员」，负责信关站链路的自动巡检与异常识别。请使用简明专业的中文回答，所有指标与判断需引用具体来源。',
  temperature: 0.3,
  topP: 0.9,
  maxTokens: 8192,
  timeout: 60,
  concurrency: 8,
  topK: 5,
})

const tagInput = ref('')
const userInput = ref('')
const chatBody = ref(null)

const initial = computed(() => (form.value.name || '链').trim().slice(0, 1))
const kindLabel = computed(() => '专业')

const assets = [
  { title: '查询链路指标',  desc: 'API · 信关站 GW-03 北向接口' },
  { title: '生成诊断报告',  desc: 'Skill · 输出结构化报告' },
  { title: '链路指标库',    desc: '知识库 · 128 份文档' },
]

const defaultChat = [
  { role: 'user',  text: '请对信关站 GW-03 的北向接口做一次健康巡检。' },
  { role: 'agent', text: '好的，我正在拉取 GW-03 北向接口最近 24h 的指标。', steps: [
    '采集：丢包率 0.04%、时延均值 38ms、抖动 4ms',
    '对比：与近 7 日基线持平，无显著劣化',
    '判断：当前状态健康，无异常需处置'
  ]},
]

const chat = ref([...defaultChat])

function addTag() {
  const v = (tagInput.value || '').trim()
  if (!v || form.value.tags.includes(v)) return
  form.value.tags.push(v)
  tagInput.value = ''
}

function removeTag(t) {
  form.value.tags = form.value.tags.filter(x => x !== t)
}

function resetChat() {
  chat.value = [...defaultChat]
  nextTick(scrollChat)
}

function sendChat() {
  const v = (userInput.value || '').trim()
  if (!v) return
  chat.value.push({ role: 'user', text: v })
  userInput.value = ''
  nextTick(scrollChat)
  // 模拟回复
  setTimeout(() => {
    chat.value.push({ role: 'agent', text: '已接收指令，正在分析中…', steps: [
      '解析：已识别为链路巡检类请求',
      '规划：调用 GW-03 北向指标 API',
      '执行：等待结果回传',
    ]})
    nextTick(scrollChat)
  }, 600)
}

function scrollChat() {
  if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight
}

function onSaveDraft() { toast.info('已保存草稿') }
function onTestRun()   { toast.info('已启动试运行（示例）') }
function onSave()      { toast.success('配置已保存') }
function onSubmit()    { toast.success('已提交发布审核') }

onMounted(() => {
  setTimeout(() => { entering.value = false }, 480)
})
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: var(--sp-4); }

/* ============== HEADER ============== */
.create-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
  padding: 14px 18px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  flex-wrap: wrap;
  backdrop-filter: var(--glass-blur);
}
.create-header__left { display: flex; align-items: center; gap: 14px; min-width: 0; }
.create-header__logo {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  box-shadow: 0 6px 16px var(--accent-glow);
  flex-shrink: 0;
}
.create-header__name {
  font-size: 16px;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: -0.01em;
}
.create-header__sub {
  display: flex;
  gap: 8px;
  margin-top: 4px;
  flex-wrap: wrap;
}
.create-header__actions { display: inline-flex; gap: 8px; flex-wrap: wrap; }

/* ============== CHIPS ============== */
.chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  font-family: var(--font-mono);
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--ink-2);
  letter-spacing: 0.01em;
}
.chip--ok    { background: var(--ok-soft); color: var(--ok); border-color: rgba(74, 222, 128, 0.3); }
.chip--muted { background: var(--surface-2); color: var(--ink-3); }

/* ============== WORKSPACE ============== */
.create-ws {
  display: grid;
  grid-template-columns: 1.55fr 1fr;
  gap: var(--sp-4);
  align-items: start;
}
.create-form-col, .create-preview-col {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  min-width: 0;
}

/* ============== FORM CARD ============== */
.form-card {
  padding: 20px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-blur);
}
.form-card__head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.form-card__head h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  font-family: var(--font-display);
}
.form-card__sub {
  font-size: 12px;
  color: var(--ink-3);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
.field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.field--full { grid-column: 1 / -1; }
.field > span {
  font-size: 12px;
  color: var(--ink-2);
  font-weight: 500;
}
.field input,
.field select,
.field textarea {
  width: 100%;
  padding: 9px 12px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 13px;
  transition: all var(--dur-fast) var(--ease);
  outline: none;
  resize: vertical;
}
.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

/* ============== TAG INPUT ============== */
.tag-input {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 8px;
}
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: var(--accent-soft);
  color: var(--accent);
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 500;
}
.tag i {
  font-style: normal;
  cursor: pointer;
  opacity: 0.7;
  font-size: 13px;
  line-height: 1;
}
.tag i:hover { opacity: 1; }
.tag-input input {
  flex: 1;
  min-width: 100px;
  background: transparent !important;
  border: 0 !important;
  padding: 3px 6px !important;
}

/* ============== ASSET LIST ============== */
.asset-list { display: flex; flex-direction: column; gap: 8px; }
.asset-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 8px;
}
.asset-row__title { font-size: 13px; color: var(--ink); font-weight: 500; }
.asset-row__desc  { font-size: 11.5px; color: var(--ink-3); margin-top: 2px; }
.link-btn {
  margin-top: 4px;
  background: transparent;
  border: 1px dashed var(--line-2);
  color: var(--ink-2);
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 12.5px;
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
  font-family: var(--font-body);
}
.link-btn:hover { color: var(--accent); border-color: var(--accent); }

/* ============== CHAT PREVIEW ============== */
.create-chat {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 480px;
  backdrop-filter: var(--glass-blur);
}
.create-chat__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--line);
  background: var(--surface-2);
}
.create-chat__agent { display: flex; align-items: center; gap: 10px; }
.create-chat__avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 4px 12px var(--accent-glow);
}
.create-chat__name { font-size: 13.5px; font-weight: 600; color: var(--ink); }
.create-chat__status {
  font-size: 11px;
  color: var(--ink-3);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}
.create-chat__status .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ok);
  box-shadow: 0 0 6px var(--ok);
  animation: pulse 2.4s var(--ease) infinite;
}
.iconbtn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--ink-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
}
.iconbtn:hover { background: var(--surface); color: var(--ink); }
.iconbtn svg { width: 16px; height: 16px; }

.create-chat__body {
  flex: 1;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  max-height: 420px;
}
.create-chat__msg {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.6;
  max-width: 86%;
  word-break: break-word;
}
.create-chat__msg--user {
  align-self: flex-end;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: #fff;
  border-bottom-right-radius: 2px;
}
.create-chat__msg--agent {
  align-self: flex-start;
  background: var(--surface-2);
  color: var(--ink);
  border: 1px solid var(--line);
  border-bottom-left-radius: 2px;
}
.create-chat__steps {
  margin: 8px 0 0;
  padding-left: 22px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--ink-2);
  font-size: 12.5px;
}
.create-chat__steps li { line-height: 1.5; }

.create-chat__input {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--line);
  background: var(--surface-2);
}
.create-chat__input input {
  flex: 1;
  padding: 9px 14px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--ink);
  font-size: 13px;
  font-family: var(--font-body);
  outline: none;
  transition: all var(--dur-fast) var(--ease);
}
.create-chat__input input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

/* ============== HINT ============== */
.create-preview__hint {
  padding: 16px 18px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-blur);
}
.create-preview__hint-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 8px;
  font-family: var(--font-display);
}
.create-preview__hint ul {
  margin: 0;
  padding-left: 18px;
  color: var(--ink-2);
  font-size: 12.5px;
  line-height: 1.7;
}
.create-preview__hint li::marker { color: var(--accent); }

/* ============== ANIMATION ============== */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.45; }
}
.view-enter { animation: viewEnter 0.42s var(--ease) both; }
@keyframes viewEnter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1100px) {
  .create-ws { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
  .create-header { flex-direction: column; align-items: flex-start; }
}
</style>
