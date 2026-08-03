<template>
  <div class="page page-create" :class="{ 'view-enter': entering }">

    <!-- ============================================================
         列表视图（默认入口）
         ------------------------------------------------------------
         展示当前用户创建的全部员工：
         员工名称 / 创建时间 / 状态 / 激活状态
         支持状态筛选、关键字搜索、新建 / 编辑 / 试运行 / 删除
         ============================================================ -->
    <div v-if="viewMode === 'list'" class="create-list">
      <header class="page-head">
        <div>
          <h2 class="page-title">创建员工</h2>
          <p class="page-sub">管理你创建的全部数字员工 · 共 {{ stats.total }} 个</p>
        </div>
        <div class="page-head__actions">
          <button class="btn btn--ghost" @click="loadDrafts">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>
            </svg>
            刷新
          </button>
          <button class="btn btn--primary" @click="onCreateNew">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            新建员工
          </button>
        </div>
      </header>

      <!-- 筛选 + 搜索 -->
      <div class="create-filter">
        <div class="create-tabs">
          <button
            v-for="t in statusTabs"
            :key="t.value || 'all'"
            class="create-tab"
            :class="{ 'is-active': filterStatus === t.value }"
            @click="filterStatus = t.value"
          >{{ t.label }}<span>{{ t.count }}</span></button>
        </div>
        <div class="create-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            v-model="filterKeyword"
            type="text"
            placeholder="搜索员工名称或标签…"
          />
        </div>
      </div>

      <!-- 列表 -->
      <div v-loading="loading" class="create-table-wrap">
        <table v-if="filteredDrafts.length" class="create-table">
          <thead>
            <tr>
              <th class="col-name">员工名称</th>
              <th class="col-domain">领域</th>
              <th class="col-time">创建时间</th>
              <th class="col-status">状态</th>
              <th class="col-activated">激活状态</th>
              <th class="col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in filteredDrafts" :key="d.id" class="create-row">
              <td class="col-name">
                <div class="emp-cell">
                  <div class="emp-cell__avatar" :style="{ background: avatarBg(d) }">{{ initialChar(d.name) }}</div>
                  <div class="emp-cell__info">
                    <div class="emp-cell__name">{{ d.name || '未命名员工' }}</div>
                    <div class="emp-cell__tags">
                      <span v-for="t in (d.tags || []).slice(0, 3)" :key="t" class="mini-tag">{{ t }}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="col-domain">
                <span class="domain-pill">{{ d.domain || '—' }}</span>
              </td>
              <td class="col-time">
                <div class="time-cell">
                  <div class="time-cell__abs">{{ formatDateTime(d.createdAt) }}</div>
                </div>
              </td>
              <td class="col-status">
                <span class="status-chip" :class="`status-chip--${d.status}`">{{ statusLabel(d.status) }}</span>
              </td>
              <td class="col-activated">
                <span v-if="d.activated" class="activated-chip is-on">
                  <span class="activated-dot" />已激活
                </span>
                <span v-else class="activated-chip is-off">
                  <span class="activated-dot" />未激活
                </span>
              </td>
              <td class="col-actions">
                <div class="row-actions">
                  <button class="row-action" title="编辑" @click="onEdit(d)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                    </svg>
                    编辑
                  </button>
                  <button class="row-action row-action--accent" title="试运行" @click="onTestRun(d)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    试运行
                  </button>
                  <button v-if="d.status === 'draft' || d.status === 'rejected'" class="row-action" title="提交发布" @click="onSubmitOne(d)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    提交
                  </button>
                  <button v-if="d.status !== 'published'" class="row-action row-action--danger" title="删除" @click="onDelete(d)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <EmptyState
          v-else-if="!loading"
          title="还没有匹配的员工"
          :desc="filterKeyword ? '尝试更换关键词或重置筛选' : '点击右上角「新建员工」开始你的第一个数字员工'"
        >
          <button class="btn btn--primary btn--sm" @click="onCreateNew">新建员工</button>
        </EmptyState>
      </div>
    </div>

    <!-- ============================================================
         表单视图（新建 / 编辑）
         ============================================================ -->
    <div v-else class="create-form-view">
      <header class="create-header">
        <div class="create-header__left">
          <button class="iconbtn" title="返回列表" @click="backToList">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="create-header__logo">{{ initialChar(form.name) }}</div>
          <div>
            <div class="create-header__name-row">
              <span class="create-header__name">{{ form.name || '未命名数字员工（草稿）' }}</span>
              <span class="mode-badge" :class="`mode-badge--${formMode}`">
                {{ modeLabel }}
              </span>
              <span v-if="isDirty" class="dirty-badge" title="有未保存的修改">● 未保存</span>
            </div>
            <div class="create-header__sub">
              <span class="chip chip--ok">{{ form.id ? statusLabel(form.status) : '草稿' }}</span>
              <span class="chip chip--muted">{{ form.domain || '未选领域' }}</span>
              <span class="chip chip--muted">最近编辑：{{ isDirty ? '2026-01-01 12:00:00' : '刚刚' }}</span>
            </div>
          </div>
        </div>
        <div class="create-header__actions">
          <!-- <button class="btn btn--ghost" @click="onSaveDraft" :disabled="saving">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            保存草稿
          </button> -->
          <button class="btn btn--ghost" @click="onTestRun" :disabled="!form.name?.trim()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            试运行
          </button>
          <button class="btn btn--primary" @click="onSave" :disabled="saving">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            保存
          </button>
          <button class="btn btn--primary" @click="onSubmit" :disabled="saving">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            发布
          </button>
        </div>
      </header>

      <div class="create-ws">
        <div class="create-form-col">
          <section class="form-card">
            <div class="form-card__head">
              <h4>基础属性</h4>
              <span class="form-card__sub">员工的基础身份信息</span>
            </div>
            <div class="form-grid">
              <div class="field">
                <span>员工名称<i class="required">*</i></span>
                <input
                  v-model="form.name"
                  placeholder="如：链路诊断员 · 卫通7号"
                  maxlength="32"
                  :class="{ 'is-invalid': errors.name }"
                  @blur="validateField('name')"
                />
                <span v-if="errors.name" class="field__err">{{ errors.name }}</span>
              </div>
              <div class="field">
                <span>领域<i class="required">*</i></span>
                <select v-model="form.domain" :class="{ 'is-invalid': errors.domain }" @change="validateField('domain')">
                  <option value="">请选择领域</option>
                  <option v-for="d in DOMAINS" :key="d" :value="d">{{ d }}</option>
                </select>
                <span v-if="errors.domain" class="field__err">{{ errors.domain }}</span>
              </div>
              <div class="field">
                <span>可见范围</span>
                <select v-model="form.visibility">
                  <option value="public">全员可见</option>
                  <option value="private">仅自己</option>
                </select>
              </div>
              <div class="field field--full">
                <span>简介<i class="required">*</i></span>
                <textarea
                  v-model="form.description"
                  rows="2"
                  placeholder="面向信关站链路的自动巡检与异常识别，覆盖指标采集、根因定位、处置建议生成。"
                  :class="{ 'is-invalid': errors.description }"
                  @blur="validateField('description')"
                ></textarea>
                <span v-if="errors.description" class="field__err">{{ errors.description }}</span>
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

  </div>
</template>

<script setup>
defineOptions({ name: 'Create' })
import { ref, computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router'
import {
  createEmployee,
  listMyDrafts,
  getMyDraft,
  getEmployee,
  updateEmployee,
  submitEmployee,
  activateEmployee,
  deleteMyDraft,
} from '@/api/employees'
import { useToastStore } from '@/stores/toast'
import { useChatStore } from '@/stores/chat'
import EmptyState from '@/components/EmptyState.vue'
import { formatDateTime } from '@/utils'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()
const chat = useChatStore()
const entering = ref(true)

const DOMAINS = ['终端', '星地链路', '载荷', '全链路', '运维']

/* ============================================================
 * 视图模式：根据路由 query 决定
 *   - 无 id/action/clone → list（默认）
 *   - action=new          → form（新建）
 *   - id=xxx              → form（编辑该草稿）
 *   - clone=xxx           → form（从已订阅员工克隆为新草稿）
 * ============================================================ */
const viewMode = ref('list')

/* 表单模式：'create' | 'edit' | 'clone' */
const formMode = computed(() => {
  if (route.query.id) return 'edit'
  if (route.query.clone) return 'clone'
  if (route.query.action === 'new') return 'create'
  return ''
})

const isCreating = computed(() => formMode.value === 'create')
const isEditing  = computed(() => formMode.value === 'edit')
const isCloning  = computed(() => formMode.value === 'clone')

const modeLabel = computed(() => ({
  create: '新建',
  edit:   '编辑',
  clone:  '克隆自模板',
}[formMode.value] || '编辑'))

/* 列表状态 */
const loading = ref(false)
const drafts = ref([])
const filterStatus = ref('')
const filterKeyword = ref('')

const stats = computed(() => {
  const all = drafts.value
  return {
    total:     all.length,
    draft:     all.filter(d => d.status === 'draft').length,
    pending:   all.filter(d => d.status === 'pending').length,
    published: all.filter(d => d.status === 'published').length,
    rejected:  all.filter(d => d.status === 'rejected').length,
  }
})

const statusTabs = computed(() => [
  { value: '',         label: '全部',   count: stats.value.total },
  { value: 'draft',    label: '已保存',   count: stats.value.draft },
  { value: 'pending',  label: '审核中', count: stats.value.pending },
  { value: 'published',label: '已激活', count: stats.value.published },
  { value: 'rejected', label: '已驳回', count: stats.value.rejected },
])

const filteredDrafts = computed(() => {
  let list = drafts.value
  if (filterStatus.value) {
    list = list.filter(d => d.status === filterStatus.value)
  }
  const kw = filterKeyword.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(d =>
      (d.name || '').toLowerCase().includes(kw) ||
      (d.tags || []).some(t => String(t).toLowerCase().includes(kw))
    )
  }
  return list
})

/* 表单状态 */
const saving = ref(false)
const tagInput = ref('')
const errors = ref({})

const emptyForm = () => ({
  id: '',
  name: '',
  domain: '',
  visibility: 'public',
  description: '',
  tags: [],
  status: 'draft',
  activated: false,
  version: '0.1.0',
  createdAt: 0,
})
const form = ref(emptyForm())

/* ============================================================
 * 状态标识：创建时（即尚未保存的新草稿）id 为空
 *  - isPersistedDraft = !!form.value.id
 *  - isNewDraft       = !form.value.id
 * 用于持久化时分支判断：createEmployee vs updateEmployee
 * ============================================================ */
const isNewDraft = computed(() => !form.value.id)
const isPersistedDraft = computed(() => !!form.value.id)

/* ============================================================
 * 变更追踪：用于在离开表单前提示用户
 *   - 每次 syncFromRoute 完成时拍快照 formSnapshot
 *   - 任意字段被改 → 与快照对比，若不一致则 isDirty=true
 *   - 已保存后（save/submit）刷新快照，避免误判
 * ============================================================ */
const isDirty = ref(false)
const formSnapshot = ref('')

function snapshotForm() {
  formSnapshot.value = JSON.stringify({
    name: form.value.name,
    domain: form.value.domain,
    description: form.value.description,
    tags: form.value.tags,
    visibility: form.value.visibility,
  })
}

function recomputeDirty() {
  if (viewMode.value !== 'form') { isDirty.value = false; return }
  isDirty.value = snapshotForm() !== formSnapshot.value
}

watch(
  () => [form.value.name, form.value.domain, form.value.description, form.value.tags.join('|'), form.value.visibility],
  () => recomputeDirty(),
)

const assets = [
  { title: '查询链路指标',  desc: 'API · 信关站 GW-03 北向接口' },
  { title: '生成诊断报告',  desc: 'Skill · 输出结构化报告' },
  { title: '链路指标库',    desc: '知识库 · 128 份文档' },
]

/* ============================================================
 * 列表相关
 * ============================================================ */
async function loadDrafts() {
  loading.value = true
  try {
    const data = await listMyDrafts()
    drafts.value = data.list || []
  } catch (e) {
    toast.error('加载员工列表失败：' + (e?.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

function initialChar(name) { return (name || '?').trim().slice(0, 1) }

function avatarBg(d) {
  return `linear-gradient(135deg, ${d.avatar || '#8b5cf6'} 0%, ${d.accent || '#a78bfa'} 100%)`
}

function statusLabel(s) {
  return ({
    draft:     '已保存',
    pending:   '审核中',
    published: '已发布',
    rejected:  '已驳回',
  })[s] || '—'
}

/* ============================================================
 * 导航入口：直接同步切换 viewMode + 预填表单，URL 用 router.replace
 * 关键点：viewMode 的切换必须在 router 调用前完成，避免依赖 watch
 *        的异步时序导致首帧仍渲染列表视图
 * ============================================================ */
function onCreateNew() {
  /* 同步切换到表单视图 + 重置 form（不等路由） */
  form.value = emptyForm()
  errors.value = {}
  viewMode.value = 'form'
  snapshotForm()
  isDirty.value = false
  /* 同步 URL，触发 watch 二次确认（幂等） */
  router.replace({ path: '/create', query: { action: 'new' } })
}

async function onEdit(d) {
  /* 编辑模式：同步切换 viewMode 后，先 fetch 数据预填表单，再以 replace 同步 URL
   * 设计要点:
   *  1) viewMode 必须同步切换，避免依赖 watch 时序
   *  2) 不使用 await router.push()，避免与 watch 触发的新 navigation 冲突
   *  3) router.replace 放在数据加载完成后执行，避免触发 watch/syncFromRoute 重复加载
   *  4) 仅在 form 模式且仍匹配目标 id 时填充数据，防止用户快速切换时数据错位 */
  viewMode.value = 'form'
  errors.value = {}
  isDirty.value = false
  try {
    const data = await getMyDraft(d.id)
    if (!viewMode.value || viewMode.value !== 'form') return
    if (data && typeof data === 'object') {
      form.value = {
        id: data.id,
        name: data.name || '',
        domain: data.domain || '',
        visibility: data.visibility || 'public',
        description: data.description || '',
        tags: Array.isArray(data.tags) ? [...data.tags] : [],
        status: data.status || 'draft',
        activated: !!data.activated,
        version: data.version || '0.1.0',
        createdAt: data.createdAt || 0,
      }
      snapshotForm()
      isDirty.value = false
    }
    /* 同步 URL（不进入 history） */
    router.replace({ path: '/create', query: { id: d.id } }).catch(() => {})
  } catch (e) {
    toast.error('员工不存在或已被删除')
    backToList()
  }
}

async function onSubmitOne(d) {
  try {
    await submitEmployee(d.id)
    toast.success(`「${d.name}」已提交发布审核`)
    await loadDrafts()
  } catch (e) {
    toast.error('提交失败：' + (e?.message || '未知错误'))
  }
}

async function onDelete(d) {
  try {
    await deleteMyDraft(d.id)
    toast.info(`已删除「${d.name}」`)
    await loadDrafts()
  } catch (e) {
    toast.error('删除失败：' + (e?.message || '未知错误'))
  }
}

function backToList() {
  router.replace({ path: '/create' })
}

/* 离开表单时的浏览器原生确认（关闭/刷新页面） */
function onBeforeUnloadEvent(e) {
  if (isDirty.value) {
    e.preventDefault()
    e.returnValue = '当前表单有未保存的修改，确定离开吗？'
    return e.returnValue
  }
  return undefined
}

/* 路由内导航：离开表单视图前提示 */
onBeforeRouteLeave((to, from, next) => {
  if (viewMode.value === 'form' && isDirty.value) {
    const ok = window.confirm('当前表单有未保存的修改，确定离开吗？')
    if (!ok) return next(false)
  }
  next()
})

/* ============================================================
 * 试运行：打开全局对话抽屉（ChatOverlay），与现有"发布任务"使用同一交互
 * ============================================================ */
function onTestRun(target) {
  const emp = target || buildChatEmployee()
  if (!emp || !emp.name?.trim()) {
    toast.warning('请先填写员工名称再试运行')
    return
  }
  chat.openChat(emp)
  toast.info(`已启动「${emp.name}」试运行`)
}

/* 把当前 form / draft 转换为 ChatOverlay 期望的 employee 数据结构 */
function buildChatEmployee() {
  const f = form.value
  return {
    id: f.id || 'preview',
    name: f.name?.trim() || '未命名员工',
    description: f.description || '（尚未填写简介）',
    domain: f.domain || '通用',
    tags: f.tags || [],
    avatar: '#8b5cf6',
    accent: '#a78bfa',
    kind: 'professional',
  }
}

/* ============================================================
 * 表单相关
 * ============================================================ */
function addTag() {
  const v = (tagInput.value || '').trim()
  if (!v || form.value.tags.includes(v)) return
  form.value.tags.push(v)
  tagInput.value = ''
}

function removeTag(t) {
  form.value.tags = form.value.tags.filter(x => x !== t)
}

function validateField(key) {
  const val = (form.value[key] || '').trim()
  if (key === 'name') {
    if (!val) errors.value.name = '员工名称不能为空'
    else if (val.length < 2) errors.value.name = '员工名称至少 2 个字符'
    else delete errors.value.name
  } else if (key === 'domain') {
    if (!val) errors.value.domain = '请选择领域'
    else delete errors.value.domain
  } else if (key === 'description') {
    if (!val) errors.value.description = '请填写简介'
    else if (val.length < 10) errors.value.description = '简介至少 10 个字符'
    else delete errors.value.description
  }
}

function validateAll() {
  validateField('name')
  validateField('domain')
  validateField('description')
  return Object.keys(errors.value).length === 0
}

async function persist(action = 'save') {
  if (!validateAll()) {
    toast.error('请检查表单中的错误项')
    return null
  }
  saving.value = true
  try {
    const payload = {
      name:        form.value.name,
      domain:      form.value.domain,
      description: form.value.description,
      tags:        form.value.tags,
      visibility:  form.value.visibility,
    }
    let result
    /* 持久化分支：基于 isPersistedDraft 决定 create vs update
     *  - 同一 form ref 在 create / edit 流程间复用，form.id 是否有值是唯一判别条件
     *  - 首次 create 成功后立即把 result.id 写回 form，使后续保存自动走 update 分支
     */
    if (isPersistedDraft.value) {
      result = await updateEmployee({ id: form.value.id, ...payload })
    } else {
      result = await createEmployee({
        kind: 'professional',
        action,
        ...payload,
      })
      form.value.id = result.id
      form.value.status = result.status || 'draft'
      form.value.createdAt = result.createdAt || Date.now()
    }
    if (action === 'submit' && result?.id) {
      await submitEmployee(result.id)
      form.value.status = 'pending'
    }
    /* 保存后刷新快照，避免误判为 dirty */
    snapshotForm()
    isDirty.value = false
    return result
  } catch (e) {
    toast.error('保存失败：' + (e?.message || '未知错误'))
    return null
  } finally {
    saving.value = false
  }
}

async function onSaveDraft() {
  // 保存草稿不强制校验所有字段，但名称必填
  if (!form.value.name?.trim()) {
    errors.value.name = '员工名称不能为空'
    toast.error('请先填写员工名称')
    return
  }
  if (!form.value.domain) form.value.domain = DOMAINS[0]
  if (!form.value.description) form.value.description = '（暂未填写简介）'
  const r = await persist()
  if (r) {
    toast.success('已保存草稿')
    await loadDrafts()
  }
}

async function onSave() {
  const r = await persist()
  if (r) {
    toast.success('配置已保存')
    await loadDrafts()
  }
}

async function onSubmit() {
  const r = await persist('submit')
  if (r) {
    toast.success('已提交发布审核')
    await loadDrafts()
  }
}

/* ============================================================
 * 路由同步：决定 viewMode 并按需预填表单
 *   - 同一 form 组件被 create / edit / clone 三种模式复用
 *   - 切换模式时统一重置 form + errors + dirty 标记
 *   - 接受可选的 to 参数（onBeforeRouteUpdate 会传入）
 * ============================================================ */
async function syncFromRoute(targetRoute) {
  const q = (targetRoute || route).query
  const { id, action, clone } = q
  errors.value = {}

  if (id) {
    /* ============ Edit 模式：编辑已有草稿 ============ */
    viewMode.value = 'form'
    try {
      const d = await getMyDraft(id)
      form.value = {
        id: d.id,
        name: d.name || '',
        domain: d.domain || '',
        visibility: d.visibility || 'public',
        description: d.description || '',
        tags: Array.isArray(d.tags) ? [...d.tags] : [],
        status: d.status || 'draft',
        activated: !!d.activated,
        version: d.version || '0.1.0',
        createdAt: d.createdAt || 0,
      }
      snapshotForm()
      isDirty.value = false
    } catch (e) {
      toast.error('员工不存在或已被删除')
      backToList()
    }
  } else if (clone) {
    /* ============ Clone 模式：从已订阅员工克隆为新草稿 ============ */
    viewMode.value = 'form'
    try {
      const src = await getEmployee(clone)
      form.value = {
        ...emptyForm(),
        name: src.name ? `${src.name} · 副本` : '',
        domain: src.domain || '',
        description: src.description || '',
        tags: Array.isArray(src.tags) ? [...src.tags] : [],
        visibility: 'public',
        status: 'draft',
        activated: false,
      }
      snapshotForm()
      isDirty.value = false
    } catch (e) {
      toast.error('源员工不存在，无法克隆')
      backToList()
    }
  } else if (action === 'new') {
    /* ============ Create 模式：全新空白草稿 ============ */
    viewMode.value = 'form'
    form.value = emptyForm()
    snapshotForm()
    isDirty.value = false
  } else {
    /* ============ 列表模式 ============ */
    viewMode.value = 'list'
    form.value = emptyForm()
    snapshotForm()
    isDirty.value = false
    await loadDrafts()
  }
}

/* 兼容外部直接修改 URL（含浏览器后退/前进） */
onBeforeRouteUpdate(async (to) => {
  await syncFromRoute(to)
})

/* 保留 watch 作为兜底（开发期 HMR 路由可能不触发 guard） */
watch(
  () => route.fullPath,
  () => {
    syncFromRoute()
  },
)

onMounted(async () => {
  window.addEventListener('beforeunload', onBeforeUnloadEvent)
  setTimeout(() => { entering.value = false }, 480)
  await syncFromRoute()
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', onBeforeUnloadEvent)
})
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: var(--sp-4); }

/* ============================================================
 * 列表视图
 * ============================================================ */
.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--sp-3);
  flex-wrap: wrap;
}
.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--ink);
  font-family: var(--font-display);
  letter-spacing: -0.01em;
}
.page-sub { margin: 4px 0 0; color: var(--ink-3); font-size: 12.5px; }
.page-head__actions { display: inline-flex; gap: 8px; }

/* 筛选 */
.create-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 20px;
  margin-bottom: 20px;
}
.create-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 10px;
  width: fit-content;
}
.create-tab {
  padding: 7px 14px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--ink-2);
  border-radius: 7px;
  background: transparent;
  border: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-body);
  transition: all var(--dur-fast) var(--ease);
}
.create-tab:hover { color: var(--ink); }
.create-tab.is-active {
  background: var(--surface);
  color: var(--ink);
  box-shadow: var(--shadow-sm);
}
.create-tab span {
  font-family: var(--font-mono);
  font-size: 10.5px;
  padding: 0 5px;
  border-radius: 4px;
  background: var(--surface-2);
  color: var(--ink-3);
  margin-left: 4px;
  opacity: 0.75;
}
.create-tab.is-active span {
  background: var(--accent-soft);
  color: var(--accent);
}

.create-search {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 10px;
  width: 280px;
  max-width: 100%;
  transition: all var(--dur-fast) var(--ease);
}
.create-search:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.create-search svg { width: 16px; height: 16px; color: var(--ink-3); flex-shrink: 0; }
.create-search input {
  flex: 1;
  background: transparent;
  border: 0;
  outline: none;
  font-size: 12.5px;
  color: var(--ink);
  font-family: var(--font-body);
  padding: 4px 0;
}
.create-search input::placeholder { color: var(--ink-3); }

/* 表格 */
.create-table-wrap {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-blur);
  overflow: hidden;
  min-height: 240px;
  position: relative;
}
.create-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}
.create-table thead {
  background: var(--surface-2);
  border-bottom: 1px solid var(--line);
}
.create-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  color: var(--ink-3);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  white-space: nowrap;
}
.create-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--line);
  color: var(--ink);
  vertical-align: middle;
}
.create-row { transition: background var(--dur-fast) var(--ease); }
.create-row:hover { background: rgba(139, 92, 246, 0.04); }
.create-row:last-child td { border-bottom: 0; }

.col-name    { width: 28%; min-width: 220px; }
.col-domain  { width: 10%; min-width: 80px; }
.col-time    { width: 16%; min-width: 160px; }
.col-status  { width: 10%; min-width: 90px; }
.col-activated { width: 10%; min-width: 100px; }
.col-actions { width: 26%; min-width: 240px; }

.emp-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.emp-cell__avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 4px 12px -2px rgba(139, 92, 246, 0.3);
}
.emp-cell__info { min-width: 0; flex: 1; }
.emp-cell__name {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.emp-cell__tags {
  display: inline-flex;
  gap: 4px;
  margin-top: 3px;
  flex-wrap: wrap;
}
.mini-tag {
  font-family: var(--font-mono);
  font-size: 10.5px;
  padding: 1px 6px;
  background: var(--surface-2);
  color: var(--ink-2);
  border-radius: 4px;
  border: 1px solid var(--line);
}

.domain-pill {
  display: inline-flex;
  padding: 3px 8px;
  background: var(--accent-soft);
  color: var(--accent);
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 500;
  font-family: var(--font-mono);
  letter-spacing: 0.01em;
}

.time-cell__abs {
  font-size: 12.5px;
  color: var(--ink);
  font-family: var(--font-mono);
  letter-spacing: 0.01em;
}

/* 状态徽标 */
.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 500;
  font-family: var(--font-mono);
  letter-spacing: 0.01em;
  border: 1px solid;
}
.status-chip--draft     { background: var(--surface-2); color: var(--ink-2); border-color: var(--line); }
.status-chip--pending   { background: rgba(251, 191, 36, 0.12); color: #f59e0b; border-color: rgba(245, 158, 11, 0.3); }
.status-chip--published { background: rgba(74, 222, 128, 0.12); color: #4ade80; border-color: rgba(74, 222, 128, 0.3); }
.status-chip--rejected  { background: rgba(248, 113, 113, 0.12); color: #f87171; border-color: rgba(248, 113, 113, 0.3); }

/* 激活状态 */
.activated-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-family: var(--font-mono);
  font-weight: 500;
}
.activated-chip.is-on  { color: #4ade80; }
.activated-chip.is-off { color: var(--ink-3); }
.activated-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}
.activated-chip.is-on  .activated-dot { background: #4ade80; box-shadow: 0 0 6px #4ade80; }
.activated-chip.is-off .activated-dot { background: var(--ink-3); }

/* 行操作按钮 */
.row-actions {
  display: inline-flex;
  gap: 6px;
}
.row-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 6px;
  color: var(--ink-2);
  font-size: 11.5px;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
}
.row-action svg { width: 13px; height: 13px; }
.row-action:hover {
  color: var(--ink);
  border-color: var(--ink-3);
  background: var(--surface-2);
}
.row-action--accent {
  color: var(--accent);
  border-color: rgba(139, 92, 246, 0.3);
  background: var(--accent-soft);
}
.row-action--accent:hover {
  border-color: var(--accent);
  background: rgba(139, 92, 246, 0.18);
}
.row-action--danger:hover {
  color: var(--danger);
  border-color: var(--danger);
  background: rgba(248, 113, 113, 0.08);
}

/* ============================================================
 * 表单视图
 * ============================================================ */
.create-form-view { display: flex; flex-direction: column; gap: var(--sp-4); }

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
.create-header__left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
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
.create-header__name-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.mode-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 600;
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
  border: 1px solid;
  text-transform: uppercase;
}
.mode-badge--create {
  background: rgba(74, 222, 128, 0.12);
  color: #4ade80;
  border-color: rgba(74, 222, 128, 0.3);
}
.mode-badge--edit {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: rgba(139, 92, 246, 0.3);
}
.mode-badge--clone {
  background: rgba(251, 191, 36, 0.12);
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.3);
}
.dirty-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10.5px;
  font-family: var(--font-mono);
  color: #f59e0b;
  letter-spacing: 0.02em;
  animation: pulseDirty 1.6s ease-in-out infinite;
}
@keyframes pulseDirty {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.55; }
}
.create-header__sub {
  display: flex;
  gap: 8px;
  margin-top: 4px;
  flex-wrap: wrap;
}
.create-header__actions { display: inline-flex; gap: 8px; flex-wrap: wrap; }

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

.iconbtn {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 10px;
  color: var(--ink-2);
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
}
.iconbtn:hover { color: var(--ink); border-color: rgba(139, 92, 246, 0.3); }
.iconbtn svg { width: 18px; height: 18px; }

.create-ws {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--sp-4);
  align-items: start;
}
.create-form-col {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  min-width: 0;
}

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
.form-card__sub { font-size: 12px; color: var(--ink-3); }

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
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.field .required { color: var(--danger); font-style: normal; }
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
.field input.is-invalid,
.field select.is-invalid,
.field textarea.is-invalid {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.12);
}
.field__err {
  font-size: 11px;
  color: var(--danger);
  font-family: var(--font-mono);
}

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

/* ============================================================
 * 动画 / 响应式
 * ============================================================ */
.view-enter { animation: viewEnter 0.42s var(--ease) both; }
@keyframes viewEnter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (max-width: 720px) {
  .form-grid { grid-template-columns: 1fr; }
  .create-header { flex-direction: column; align-items: flex-start; }
  .create-table { font-size: 12px; }
  .col-actions { min-width: 0; }
  .row-action span { display: none; }
}
</style>
