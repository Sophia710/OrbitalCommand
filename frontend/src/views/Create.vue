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
          发布
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
                <!-- 注:"团队内部" 选项已于 2026-07 永久移除(枚举收敛为 public / private 两档) -->
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
            <h4>资产配置</h4>
            <span class="form-card__sub">挂载本员工可调用的技能与知识库</span>
          </div>
          <div class="asset-list">
            <div v-for="a in assets" :key="a.title" class="asset-row">
              <div>
                <div class="asset-row__title">{{ a.title }}</div>
                <div class="asset-row__desc">{{ a.desc }}</div>
              </div>
              <span class="chip chip--ok">已挂载</span>
            </div>
            <button class="link-btn">+ 关联技能 / 知识库</button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'Create' })
import { ref, computed, onMounted } from 'vue'
import { createEmployee } from '@/api/employees'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
const entering = ref(true)

const DOMAINS = ['终端', '星地链路', '载荷', '全链路', '运维']

const form = ref({
  name: '链路健康巡检员',
  domain: '星地链路',
  visibility: 'public',   // 注:"team" 已于 2026-07 移除,默认改为 public
  description: '面向信关站链路的自动巡检与异常识别，覆盖指标采集、根因定位、处置建议生成。',
  tags: ['链路诊断', '信关站', '巡检'],
})

const tagInput = ref('')

const initial = computed(() => (form.value.name || '链').trim().slice(0, 1))
const kindLabel = computed(() => '专业')

const assets = [
  { title: '查询链路指标',  desc: 'API · 信关站 GW-03 北向接口' },
  { title: '生成诊断报告',  desc: 'Skill · 输出结构化报告' },
  { title: '链路指标库',    desc: '知识库 · 128 份文档' },
]

function addTag() {
  const v = (tagInput.value || '').trim()
  if (!v || form.value.tags.includes(v)) return
  form.value.tags.push(v)
  tagInput.value = ''
}

function removeTag(t) {
  form.value.tags = form.value.tags.filter(x => x !== t)
}

/* 注:原"智能体配置"区 / 高级参数区 / 右侧 chat 预览已下线(2026-06 智能体模块移除) */
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
  /* 单列布局:右侧 chat 预览随智能体模块下线而移除 */
  grid-template-columns: 1fr;
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
