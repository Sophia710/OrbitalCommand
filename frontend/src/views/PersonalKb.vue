<template>
  <div class="page page-kb" :class="{ 'view-enter': entering }">
    <!-- ============== HERO (对齐 agents-hero / skills-hero) ============== -->
    <section class="kb-hero">
      <div class="kb-hero__text">
        <h3>个人知识库</h3>
        <p>沉淀个人专业知识资产,支持协议规范、案例复盘、培训教材等结构化文档管理。</p>
      </div>
      <div class="kb-hero__stats">
        <div class="stat-card">
          <b>{{ list.length }}</b>
          <span>知识库总数</span>
        </div>
        <div class="stat-card">
          <b>{{ stats.totalDocuments ?? '—' }}</b>
          <span>文档总数</span>
        </div>
        <div class="stat-card">
          <b>{{ formatSize(stats.totalSizeBytes) }}</b>
          <span>已用存储</span>
        </div>
      </div>
    </section>

    <!-- ============== TOOLBAR (对齐 agents-toolbar) ============== -->
    <div class="kb-toolbar">
      <div class="kb-toolbar__left">
        <div class="seg-toggle">
          <button
            class="seg-toggle__btn"
            :class="{ 'is-active': filter.scope === 'all' }"
            @click="filter.scope = 'all'; reload()"
          >全部<span>{{ list.length }}</span></button>
          <button
            class="seg-toggle__btn"
            :class="{ 'is-active': filter.scope === 'private' }"
            @click="filter.scope = 'private'; reload()"
          >私有<span>{{ countByVisibility('private') }}</span></button>
          <button
            class="seg-toggle__btn"
            :class="{ 'is-active': filter.scope === 'organization' }"
            @click="filter.scope = 'organization'; reload()"
          >组织<span>{{ countByVisibility('organization') }}</span></button>
          <button
            class="seg-toggle__btn"
            :class="{ 'is-active': filter.scope === 'public' }"
            @click="filter.scope = 'public'; reload()"
          >公开<span>{{ countByVisibility('public') }}</span></button>
        </div>
      </div>

      <div class="kb-toolbar__right">
        <div class="search-input">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input v-model="filter.keyword" placeholder="搜索知识库名称或描述..." @keyup.enter="reload" />
        </div>
        <button class="btn btn--primary" @click="openCreateDialog">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          新建知识库
        </button>
      </div>
    </div>

    <!-- ============== KB 卡片网格 (对齐 skills-grid) ============== -->
    <section v-if="!loading && filteredKbs.length" class="kb-cards">
      <article
        v-for="kb in filteredKbs"
        :key="kb.id"
        class="kb-card"
        :class="['is-' + (kb.visibility || 'private')]"
        @click="openKbDocs(kb)"
      >
        <header class="kb-card__head">
          <span class="kb-card__icon" :style="iconStyle(kb)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </span>
          <div class="kb-card__head-text">
            <h5 class="kb-card__name">{{ kb.name }}</h5>
            <span class="kb-card__vis" :class="['is-' + (kb.visibility || 'private')]">
              <span class="kb-card__vis-dot" />
              {{ visibilityLabel(kb.visibility) }}
            </span>
          </div>
          <button
            class="kb-card__menu"
            aria-label="知识库操作"
            @click.stop="toggleKbMenu(kb.id, $event)"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5"  r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/>
            </svg>
          </button>
        </header>

        <p class="kb-card__desc">{{ kb.description || '该知识库暂无描述,点击进入添加文档' }}</p>

        <div class="kb-card__kpis">
          <div class="kb-card__kpi">
            <b>{{ kb.document_count || 0 }}</b>
            <span>文档</span>
          </div>
          <div class="kb-card__kpi">
            <b>{{ formatSize(kb.size_bytes) }}</b>
            <span>容量</span>
          </div>
          <div class="kb-card__kpi">
            <b>{{ formatTime(kb.updated_at) }}</b>
            <span>更新</span>
          </div>
        </div>

        <footer class="kb-card__foot" @click.stop>
          <span class="kb-card__creator">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            {{ kb.creator_name || '我' }}
          </span>
          <button class="kb-card__enter" @click.stop="openKbDocs(kb)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            进入
          </button>
        </footer>
      </article>
    </section>

    <!-- ============== 浮动菜单 ============== -->
    <transition name="menu-fade">
      <div v-if="menuOpen" class="kb-menu-mask" @click="closeKbMenu">
        <div class="kb-menu" :style="menuPos" @click.stop>
          <button class="kb-menu__item" @click="openEditDialog(menuTarget)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            重命名 / 编辑
          </button>
          <button class="kb-menu__item" @click="quickChangeVisibility(menuTarget)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            切换可见性
          </button>
          <button class="kb-menu__item kb-menu__item--danger" @click="confirmDeleteKb(menuTarget)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/>
            </svg>
            删除知识库
          </button>
        </div>
      </div>
    </transition>

    <!-- ============== LOADING ============== -->
    <div v-if="loading" class="kb-loading">
      <div class="spinner" />
      <span>正在加载知识库...</span>
    </div>

    <!-- ============== EMPTY ============== -->
    <div v-else-if="!filteredKbs.length && !loading" class="kb-empty">
      <div class="kb-empty__icon">📚</div>
      <h4>{{ filter.keyword ? '没有匹配的知识库' : '还没有个人知识库' }}</h4>
      <p>{{ filter.keyword ? '尝试调整关键词或切换可见性' : '点击「新建知识库」开始沉淀你的专业知识资产' }}</p>
      <div class="kb-empty__actions">
        <button v-if="filter.keyword" class="btn btn--ghost btn--sm" @click="filter.keyword = ''; reload()">重置筛选</button>
        <button v-else class="btn btn--primary btn--sm" @click="openCreateDialog">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          新建知识库
        </button>
      </div>
    </div>

    <!-- ============== NEW KB DIALOG ============== -->
    <el-dialog v-model="createDialog" title="新建知识库" width="460px" :close-on-click-modal="false">
      <div class="form-row">
        <label>名称</label>
        <input v-model="form.name" class="form-input" placeholder="例如:协议规范库" />
      </div>
      <div class="form-row">
        <label>描述</label>
        <textarea v-model="form.description" class="form-input form-textarea" placeholder="一句话说明该知识库的用途" />
      </div>
      <div class="form-row">
        <label>可见性</label>
        <div class="vis-pick">
          <button
            v-for="v in VISIBILITY_OPTIONS"
            :key="v.key"
            class="vis-pick__btn"
            :class="{ 'is-active': form.visibility === v.key }"
            @click="form.visibility = v.key"
            type="button"
          >{{ v.name }}</button>
        </div>
      </div>
      <template #footer>
        <button class="btn btn--ghost" @click="createDialog = false">取消</button>
        <button class="btn btn--primary" :disabled="!form.name" @click="confirmCreate">确定</button>
      </template>
    </el-dialog>

    <!-- ============== EDIT KB DIALOG ============== -->
    <el-dialog v-model="editDialog" title="编辑知识库" width="460px" :close-on-click-modal="false">
      <div v-if="editingKb" class="form-row">
        <label>名称</label>
        <input v-model="editForm.name" class="form-input" placeholder="例如:协议规范库" />
      </div>
      <div v-if="editingKb" class="form-row">
        <label>描述</label>
        <textarea v-model="editForm.description" class="form-input form-textarea" placeholder="一句话说明该知识库的用途" />
      </div>
      <div v-if="editingKb" class="form-row">
        <label>可见性</label>
        <div class="vis-pick">
          <button
            v-for="v in VISIBILITY_OPTIONS"
            :key="v.key"
            class="vis-pick__btn"
            :class="{ 'is-active': editForm.visibility === v.key }"
            @click="editForm.visibility = v.key"
            type="button"
          >{{ v.name }}</button>
        </div>
      </div>
      <template #footer>
        <button class="btn btn--ghost" @click="editDialog = false">取消</button>
        <button class="btn btn--primary" :disabled="!editForm.name.trim()" @click="confirmUpdate">保存</button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  listKnowledgeBases, getKnowledgeBaseStats,
  createKnowledgeBase, updateKnowledgeBase, deleteKnowledgeBase,
} from '@/api/smart-center'
import { ElMessage, ElMessageBox } from 'element-plus'

const VISIBILITY_OPTIONS = [
  { key: 'private',      name: '私有' },
  { key: 'organization', name: '组织' },
  { key: 'public',       name: '公开' },
]
const VISIBILITY_LABEL = { private: '私有', organization: '组织', public: '公开' }
const VISIBILITY_COLORS = {
  private:      { bg: '#fef3c7', fg: '#b45309' },
  organization: { bg: '#dbeafe', fg: '#1d4ed8' },
  public:       { bg: '#dcfce7', fg: '#15803d' },
}

const entering = ref(false)
const loading = ref(false)
const list = ref([])
const stats = ref({})

const createDialog = ref(false)
const form = reactive({ name: '', description: '', visibility: 'private' })

/* ===== KB 编辑 / 删除 / 菜单 ===== */
const menuOpen = ref(false)
const menuPos = ref({ top: '0px', left: '0px' })
const menuTarget = ref(null)
const editDialog = ref(false)
const editingKb = ref(null)
const editForm = reactive({ name: '', description: '', visibility: 'private' })

const filter = reactive({ keyword: '', scope: 'all' })

const filteredKbs = computed(() => {
  if (filter.scope === 'all') return list.value
  return list.value.filter((k) => (k.visibility || 'private') === filter.scope)
})

function formatSize(n) {
  if (!n) return '0 B'
  if (n >= 1e9) return (n / 1e9).toFixed(2) + ' GB'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + ' MB'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + ' KB'
  return n + ' B'
}
function formatTime(t) {
  if (!t) return '—'
  return t
}
function visibilityLabel(v) { return VISIBILITY_LABEL[v] || '私有' }
function iconStyle(kb) {
  const c = VISIBILITY_COLORS[kb.visibility || 'private'] || VISIBILITY_COLORS.private
  return { background: c.bg, color: c.fg }
}
function countByVisibility(v) {
  return list.value.filter((k) => (k.visibility || 'private') === v).length
}

const router = useRouter()
function openKbDocs(kb) {
  router.push(`/personal-kb/${kb.id}/documents`)
}

async function reload() {
  loading.value = true
  try {
    const [kbs, st] = await Promise.all([
      listKnowledgeBases({ keyword: filter.keyword }),
      getKnowledgeBaseStats(),
    ])
    list.value = kbs.list
    stats.value = st
  } catch (e) {
    /* ignore */
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  form.name = ''
  form.description = ''
  form.visibility = 'private'
  createDialog.value = true
}

async function confirmCreate() {
  try {
    await createKnowledgeBase({
      name: form.name,
      description: form.description,
      visibility: form.visibility,
    })
    createDialog.value = false
    ElMessage.success(`已创建知识库「${form.name}」`)
    reload()
  } catch (e) {
    ElMessage.error(e?.message || '创建失败,请稍后重试')
  }
}

function toggleKbMenu(id, ev) {
  ev?.stopPropagation()
  const target = list.value.find((k) => k.id === id)
  if (!target) return
  if (menuOpen.value && menuTarget.value?.id === id) {
    closeKbMenu()
    return
  }
  const rect = ev.currentTarget.getBoundingClientRect()
  menuPos.value = {
    top:  `${rect.bottom + 6}px`,
    left: `${Math.max(8, rect.right - 180)}px`,
  }
  menuTarget.value = target
  menuOpen.value = true
}
function closeKbMenu() { menuOpen.value = false; menuTarget.value = null }

function openEditDialog(kb) {
  if (!kb) return
  editingKb.value = kb
  editForm.name = kb.name
  editForm.description = kb.description || ''
  editForm.visibility = kb.visibility || 'private'
  editDialog.value = true
  closeKbMenu()
}

async function confirmUpdate() {
  if (!editingKb.value) return
  const name = editForm.name.trim()
  if (!name) { ElMessage.warning('名称不能为空'); return }
  try {
    const res = await updateKnowledgeBase({
      id: editingKb.value.id,
      name,
      description: editForm.description,
      visibility: editForm.visibility,
    })
    const idx = list.value.findIndex((k) => k.id === editingKb.value.id)
    if (idx >= 0) list.value[idx] = { ...list.value[idx], ...res }
    editDialog.value = false
    ElMessage.success(`已更新为「${res.name}」`)
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  }
}

async function quickChangeVisibility(kb) {
  closeKbMenu()
  if (!kb) return
  const order = ['private', 'organization', 'public']
  const next = order[(order.indexOf(kb.visibility) + 1) % order.length]
  const name = VISIBILITY_LABEL[next]
  try {
    const res = await updateKnowledgeBase({ id: kb.id, visibility: next })
    const idx = list.value.findIndex((k) => k.id === kb.id)
    if (idx >= 0) list.value[idx] = { ...list.value[idx], ...res }
    ElMessage.success(`「${kb.name}」可见性已切换为「${name}」`)
  } catch (e) {
    ElMessage.error(e?.message || '切换失败')
  }
}

async function confirmDeleteKb(kb) {
  closeKbMenu()
  if (!kb) return
  try {
    await ElMessageBox.confirm(
      `确定要删除知识库「${kb.name}」吗?该操作会级联删除其下所有文档,且不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消', confirmButtonClass: 'el-button--danger' },
    )
  } catch { return }
  try {
    const res = await deleteKnowledgeBase(kb.id)
    list.value = list.value.filter((k) => k.id !== kb.id)
    ElMessage.success(
      `已删除「${kb.name}」${res.removed_documents ? ` · 清理 ${res.removed_documents} 份文档` : ''}`,
    )
  } catch (e) {
    ElMessage.error(e?.message || '删除失败')
  }
}

let kwT
watch(() => filter.keyword, () => {
  clearTimeout(kwT)
  kwT = setTimeout(reload, 250)
})

onMounted(() => {
  requestAnimationFrame(() => (entering.value = true))
  reload()
})
onUnmounted(() => { entering.value = false })
</script>

<style scoped>
.page { padding: 24px 32px 40px; }

/* ============== HERO (对齐 skills-hero) ============== */
.kb-hero {
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
  padding: 22px 28px; margin-bottom: 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--accent-soft) 0%, transparent 60%), var(--surface);
  border: 1px solid var(--line);
}
.kb-hero__text h3 { font-size: 18px; margin: 0 0 4px; font-weight: 600; color: var(--ink); }
.kb-hero__text p  { margin: 0; font-size: 13px; color: var(--ink-3); line-height: 1.6; }
.kb-hero__stats   { display: flex; gap: 10px; flex-shrink: 0; }
.stat-card {
  display: flex; flex-direction: column; gap: 2px;
  padding: 10px 18px; border-radius: 12px; min-width: 96px;
  background: var(--surface-2); border: 1px solid var(--line); text-align: center;
}
.stat-card b { font-size: 18px; font-weight: 600; color: var(--accent); font-family: var(--font-display); }
.stat-card span { font-size: 11px; color: var(--ink-3); }

/* ============== TOOLBAR (对齐 skills-toolbar) ============== */
.kb-toolbar {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  flex-wrap: wrap; margin-bottom: 18px;
}
.kb-toolbar__left { display: flex; align-items: center; gap: 12px; flex: 1; flex-wrap: wrap; }
.kb-toolbar__right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.seg-toggle { display: inline-flex; padding: 3px; background: var(--surface-2); border: 1px solid var(--line); border-radius: 10px; }
.seg-toggle__btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px; font-size: 12.5px; font-weight: 500;
  background: transparent; color: var(--ink-2);
  border: 0; border-radius: 7px; cursor: pointer;
  transition: all var(--tx-fast) var(--ease);
}
.seg-toggle__btn:hover { color: var(--ink); }
.seg-toggle__btn.is-active {
  background: var(--surface); color: var(--accent);
  box-shadow: var(--shadow-sm);
}
.seg-toggle__btn span {
  font-size: 10.5px; padding: 0 6px; border-radius: 999px;
  background: var(--surface-2); color: var(--ink-3); font-weight: 500;
  border: 1px solid var(--line);
}
.seg-toggle__btn.is-active span { background: var(--accent-soft); color: var(--accent); border-color: transparent; }

.search-input {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 10px;
  background: var(--surface); border: 1px solid var(--line);
  width: 280px; transition: all var(--tx-fast) var(--ease);
}
.search-input:focus-within { border-color: var(--accent); box-shadow: 0 0 0 4px var(--accent-soft); }
.search-input svg { width: 16px; height: 16px; color: var(--ink-3); flex-shrink: 0; }
.search-input input { flex: 1; background: transparent; border: 0; outline: 0; font-size: 12.5px; color: var(--ink); }
.search-input input::placeholder { color: var(--ink-3); }

/* ============== GRID (对齐 skills-grid) ============== */
.kb-cards {
  display: grid; gap: 14px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}
.kb-card {
  padding: 18px; border-radius: 14px; cursor: pointer;
  background: var(--surface); border: 1px solid var(--line);
  transition: all var(--tx-fast) var(--ease);
  display: flex; flex-direction: column; gap: 12px;
  position: relative;
}
.kb-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  border-color: var(--accent);
}
.kb-card__head { display: flex; align-items: center; gap: 12px; }
.kb-card__icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: grid; place-items: center; flex-shrink: 0;
}
.kb-card__icon svg { width: 22px; height: 22px; }
.kb-card__head-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.kb-card__name {
  font-size: 14.5px; font-weight: 600; line-height: 1.3; color: var(--ink);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.kb-card__vis {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 1px 8px; border-radius: 999px;
  font-size: 10.5px; font-weight: 500; width: fit-content;
}
.kb-card__vis-dot { width: 4px; height: 4px; border-radius: 50%; background: currentColor; }
.kb-card__vis.is-private      { background: #fef3c7; color: #b45309; }
.kb-card__vis.is-organization { background: #dbeafe; color: #1d4ed8; }
.kb-card__vis.is-public       { background: #dcfce7; color: #15803d; }

.kb-card__menu {
  width: 28px; height: 28px; border-radius: 8px;
  display: grid; place-items: center; flex-shrink: 0;
  background: transparent; border: 0; color: var(--ink-3); cursor: pointer;
  transition: all var(--tx-fast) var(--ease);
}
.kb-card__menu:hover { background: var(--surface-2); color: var(--ink); }
.kb-card__menu svg { width: 16px; height: 16px; }

.kb-card__desc {
  margin: 0; font-size: 12.5px; color: var(--ink-3); line-height: 1.6;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; min-height: 40px;
}
.kb-card__kpis {
  display: grid; grid-template-columns: repeat(3, 1fr);
  padding: 12px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
  gap: 8px;
}
.kb-card__kpi { text-align: center; min-width: 0; }
.kb-card__kpi b {
  display: block; font-family: var(--font-display); font-size: 14px; font-weight: 600;
  color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  line-height: 1.3;
}
.kb-card__kpi--time b {
  white-space: normal; overflow: visible; text-overflow: clip;
  font-size: 12.5px; letter-spacing: -0.2px; word-break: break-all;
  line-height: 1.35;
}
.kb-card__kpi span { font-size: 10.5px; color: var(--ink-3); font-family: var(--font-mono); }

.kb-card__foot {
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px; margin-top: auto;
}
.kb-card__creator {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11.5px; color: var(--ink-3);
  min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.kb-card__creator svg { width: 12px; height: 12px; flex-shrink: 0; }
.kb-card__enter {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 6px 12px; border-radius: 8px;
  background: var(--accent-soft); color: var(--accent);
  border: 0; font-size: 12px; font-weight: 500; cursor: pointer;
  transition: all var(--tx-fast) var(--ease);
}
.kb-card__enter:hover { background: var(--accent); color: #fff; }
.kb-card__enter svg { width: 12px; height: 12px; }

/* ============== 浮动菜单 (对齐 skills 的 skill-menu) ============== */
.kb-menu-mask { position: fixed; inset: 0; z-index: 1000; }
.kb-menu {
  position: absolute;
  min-width: 180px;
  background: var(--surface); border: 1px solid var(--line);
  border-radius: 10px; padding: 4px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.18);
  backdrop-filter: var(--glass-blur);
}
.kb-menu__item {
  display: flex; align-items: center; gap: 8px;
  width: 100%; padding: 8px 12px;
  font-size: 12.5px; color: var(--ink-2);
  background: transparent; border: 0; border-radius: 6px;
  cursor: pointer; text-align: left;
  transition: all var(--tx-fast) var(--ease);
}
.kb-menu__item:hover { background: var(--surface-2); color: var(--ink); }
.kb-menu__item svg { width: 14px; height: 14px; flex-shrink: 0; }
.kb-menu__item--danger:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.menu-fade-enter-active, .menu-fade-leave-active { transition: opacity 0.15s; }
.menu-fade-enter-from, .menu-fade-leave-to { opacity: 0; }

/* ============== LOADING / EMPTY (对齐 skills) ============== */
.kb-loading, .kb-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 60px 20px; gap: 12px;
  text-align: center; color: var(--ink-3);
}
.kb-loading .spinner {
  width: 28px; height: 28px; border-radius: 50%;
  border: 2.5px solid var(--line);
  border-top-color: var(--accent);
  animation: spin 0.9s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.kb-empty__icon { font-size: 40px; opacity: 0.55; }
.kb-empty h4 { font-size: 15px; font-weight: 600; color: var(--ink); margin: 0; }
.kb-empty p  { margin: 0; font-size: 12.5px; }
.kb-empty__actions { display: flex; gap: 8px; margin-top: 8px; }

/* ============== FORM (对话框) ============== */
.form-row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.form-row label { font-size: 12.5px; color: var(--ink-2); font-weight: 500; }
.form-input {
  padding: 8px 12px; border-radius: 8px;
  border: 1px solid var(--line); background: var(--surface);
  font-size: 13px; color: var(--ink); outline: none;
  transition: all var(--tx-fast) var(--ease);
  font-family: inherit;
}
.form-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.form-textarea { min-height: 64px; resize: vertical; }
.vis-pick { display: flex; gap: 6px; }
.vis-pick__btn {
  padding: 6px 14px; border-radius: 8px; font-size: 12.5px;
  background: var(--surface-2); color: var(--ink-2);
  border: 1px solid var(--line); cursor: pointer;
  transition: all var(--tx-fast) var(--ease);
}
.vis-pick__btn:hover { color: var(--ink); border-color: var(--line-2); }
.vis-pick__btn.is-active {
  background: var(--accent-soft); color: var(--accent);
  border-color: var(--accent);
}

/* ============== RESPONSIVE ============== */
@media (max-width: 1024px) {
  .kb-hero { flex-direction: column; align-items: flex-start; }
  .kb-hero__stats { width: 100%; flex-wrap: wrap; }
}
@media (max-width: 768px) {
  .page { padding: 16px 16px 32px; }
  .kb-hero { padding: 18px 20px; }
  .kb-hero__text h3 { font-size: 16px; }
  .kb-toolbar { flex-direction: column; align-items: stretch; }
  .kb-toolbar__right { width: 100%; }
  .search-input { width: 100%; }
  .kb-cards { grid-template-columns: 1fr; }
}
</style>
