<template>
  <div class="page page-kb-docs" :class="{ 'view-enter': entering }">
    <!-- ============== HERO (对齐 skills-hero) ============== -->
    <section class="kdocs-hero">
      <div class="kdocs-hero__text">
        <h3>文档管理</h3>
        <p v-if="kb">
          知识库: <b>{{ kb.name }}</b> · 共 <b>{{ docs.length }}</b> 份文档
        </p>
        <p v-else>知识库加载中...</p>
      </div>
      <div class="kdocs-hero__actions">
        <button class="btn btn--ghost" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          返回列表
        </button>
        <button class="btn btn--primary" @click="openUpload">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
          </svg>
          上传文件
        </button>
      </div>
    </section>

    <!-- ============== 工具栏 · 搜索 + 状态过滤 ============== -->
    <div class="kdocs-toolbar">
      <div class="kdocs-toolbar__left">
        <div class="seg-toggle">
          <button
            class="seg-toggle__btn"
            :class="{ 'is-active': filter.status === 'all' }"
            @click="filter.status = 'all'"
          >全部<span>{{ docs.length }}</span></button>
          <button
            class="seg-toggle__btn"
            :class="{ 'is-active': filter.status === 'completed' }"
            @click="filter.status = 'completed'"
          >已完成<span>{{ stats.completed }}</span></button>
          <button
            class="seg-toggle__btn"
            :class="{ 'is-active': filter.status === 'parsing' }"
            @click="filter.status = 'parsing'"
          >解析中<span>{{ stats.parsing }}</span></button>
          <button
            class="seg-toggle__btn"
            :class="{ 'is-active': filter.status === 'failed' }"
            @click="filter.status = 'failed'"
          >失败<span>{{ stats.failed }}</span></button>
        </div>
      </div>
      <div class="kdocs-toolbar__right">
        <div class="search-input">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input v-model="filter.keyword" placeholder="搜索文件名或关键字..." @keyup.enter="loadKb" />
        </div>
      </div>
    </div>

    <!-- ============== 统计卡片 · 馆藏概况 (对齐 stat-card 设计) ============== -->
    <section class="kdocs-stats">
      <div class="kdocs-stat">
        <div class="kdocs-stat__icon kdocs-stat__icon--total" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>
          </svg>
        </div>
        <div class="kdocs-stat__text">
          <span class="kdocs-stat__label">总文档数</span>
          <b class="kdocs-stat__value">{{ stats.total || docs.length }}</b>
        </div>
      </div>

      <div class="kdocs-stat">
        <div class="kdocs-stat__icon kdocs-stat__icon--ok" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
          </svg>
        </div>
        <div class="kdocs-stat__text">
          <span class="kdocs-stat__label">解析成功</span>
          <b class="kdocs-stat__value">{{ stats.completed }}</b>
        </div>
      </div>

      <div class="kdocs-stat">
        <div class="kdocs-stat__icon kdocs-stat__icon--info" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.7-8.7M21 3v6h-6"/>
          </svg>
        </div>
        <div class="kdocs-stat__text">
          <span class="kdocs-stat__label">正在解析</span>
          <b class="kdocs-stat__value">{{ stats.parsing }}</b>
        </div>
      </div>

      <div class="kdocs-stat">
        <div class="kdocs-stat__icon kdocs-stat__icon--storage" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6"/>
          </svg>
        </div>
        <div class="kdocs-stat__text">
          <span class="kdocs-stat__label">已占存储</span>
          <b class="kdocs-stat__value">{{ formatTotalSize }}</b>
        </div>
      </div>
    </section>

    <!-- ============== 文档表格 ============== -->
    <section v-if="!loading && pagedDocs.length" class="kb-docs-table-wrap">
      <table class="kb-docs-table">
        <thead>
          <tr>
            <th class="kb-docs-table__col-file">文件名</th>
            <th class="kb-docs-table__col-fmt">格式</th>
            <th class="kb-docs-table__col-time">上传时间</th>
            <th class="kb-docs-table__col-status">解析状态</th>
            <th class="kb-docs-table__col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in pagedDocs" :key="d.id">
            <td>
              <div class="kb-docs-table__file" @click="openDoc(d)">
                <span class="kb-docs-table__file-icon" :class="['is-' + (d.format || 'txt').toLowerCase()]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>
                  </svg>
                </span>
                <span class="kb-docs-table__file-name">{{ d.filename }}</span>
              </div>
            </td>
            <td>
              <span class="kb-docs-table__format" :class="['is-' + (d.format || 'txt').toLowerCase()]">
                {{ (d.format || '?').toUpperCase() }}
              </span>
            </td>
            <td class="kb-docs-table__time">{{ formatTime(d.upload_time || d.created_at) }}</td>
            <td>
              <span class="kb-docs-table__status" :class="['is-' + (d.parse_status || 'pending')]">
                <span class="kb-docs-table__status-dot" />
                {{ parseStatusLabel(d.parse_status) }}
              </span>
            </td>
            <td>
              <div class="kb-docs-table__actions">
                <button class="kb-docs-table__action" @click="openDoc(d)" title="预览">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <button
                  class="kb-docs-table__action"
                  :class="{ 'is-disabled': d.parse_status !== 'failed' }"
                  :disabled="d.parse_status !== 'failed'"
                  @click="reparse(d)"
                  title="重新解析"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.7-8.7M21 3v6h-6"/>
                  </svg>
                </button>
                <button class="kb-docs-table__action kb-docs-table__action--danger" @click="confirmDelete(d)" title="删除">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- ============== 加载 / 空状态 ============== -->
    <div v-else-if="loading" class="kb-docs-loading">
      <div class="kb-docs-spinner" />
      <span>正在加载文档...</span>
    </div>

    <div v-else class="kb-docs-empty">
      <div class="kb-docs-empty__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>
        </svg>
      </div>
      <h4>该知识库暂无文档</h4>
      <p>点击右上角「上传文件」开始向知识库添加内容</p>
    </div>

    <!-- ============== 分页 ============== -->
    <div v-if="!loading" class="kb-docs-pagination">
      <span class="kb-docs-pagination__info">
        显示 {{ pageRangeStart }}-{{ pageRangeEnd }} / 共 {{ filteredDocs.length }} 条记录
      </span>
      <div class="kb-docs-pagination__pager">
        <button class="kb-docs-pagination__btn" :disabled="currentPage === 1" @click="goPage(currentPage - 1)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button
          v-for="p in visiblePages"
          :key="p"
          class="kb-docs-pagination__btn"
          :class="{ 'is-active': p === currentPage }"
          @click="goPage(p)"
        >{{ p }}</button>
        <button class="kb-docs-pagination__btn" :disabled="currentPage === totalPages" @click="goPage(currentPage + 1)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>

    <!-- ============== 上传文件弹窗 ============== -->
    <el-dialog v-model="uploadOpen" title="上传文档" width="520px" :close-on-click-modal="false">
      <div class="kb-docs-upload">
        <div class="kb-docs-upload__field">
          <label>文件名 <span class="kb-docs-upload__required">*</span></label>
          <input v-model.trim="uploadDraft.filename" class="kb-docs-input" placeholder="例如:协议规范库-链路异常复盘.md" />
        </div>
        <div class="kb-docs-upload__row">
          <div class="kb-docs-upload__field">
            <label>格式</label>
            <select v-model="uploadDraft.format" class="kb-docs-input">
              <option v-for="f in FORMAT_OPTIONS" :key="f" :value="f">{{ f.toUpperCase() }}</option>
            </select>
          </div>
          <div class="kb-docs-upload__field">
            <label>大小 (KB)</label>
            <input v-model.number="uploadDraft.size_kb" class="kb-docs-input" type="number" min="1" />
          </div>
        </div>
        <div class="kb-docs-upload__field">
          <label>标签(逗号分隔,可选)</label>
          <input v-model="uploadDraft.tags_text" class="kb-docs-input" placeholder="如:协议,规范,RAG" />
        </div>
      </div>
      <template #footer>
        <button class="btn btn--ghost" @click="uploadOpen = false">取消</button>
        <button class="btn btn--primary" :disabled="!uploadDraft.filename" @click="submitUpload">确定</button>
      </template>
    </el-dialog>

    <!-- ============== 预览抽屉 · 右侧滑出 ============== -->
    <transition name="kb-preview-fade">
      <div v-if="previewOpen" class="kb-preview-mask" @click="closePreview" />
    </transition>
    <transition name="kb-preview-drawer">
      <aside v-if="previewOpen && previewDoc" class="kb-preview">
        <header class="kb-preview__head">
          <div class="kb-preview__head-icon" :class="['is-' + (previewDoc.format || 'txt').toLowerCase()]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>
            </svg>
          </div>
          <span class="kb-preview__head-name">{{ previewDoc.filename }}</span>
          <button class="kb-preview__close" @click="closePreview" aria-label="关闭预览">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </header>

        <div class="kb-preview__body">
          <!-- 文档结构化内容 -->
          <article v-if="previewDoc.preview_sections" class="kb-preview__article">
            <header class="kb-preview__article-head">
              <h2 class="kb-preview__article-title">{{ previewDoc.preview_sections.title || previewDoc.filename }}</h2>
              <p v-if="previewDoc.preview_sections.summary" class="kb-preview__article-summary">
                <strong>摘要:</strong>{{ previewDoc.preview_sections.summary }}
              </p>
            </header>
            <section
              v-for="(s, i) in previewDoc.preview_sections.sections || []"
              :key="i"
              class="kb-preview__section"
            >
              <h3 class="kb-preview__section-title">{{ s.heading }}</h3>
              <p v-if="s.paragraph" class="kb-preview__section-text">{{ s.paragraph }}</p>
              <ul v-if="s.bullets && s.bullets.length" class="kb-preview__section-list">
                <li v-for="(b, j) in s.bullets" :key="j">{{ b }}</li>
              </ul>
            </section>
          </article>

          <!-- Markdown / Text 纯文本预览 -->
          <pre v-else-if="previewDoc.preview_body" class="kb-preview__text">{{ previewDoc.preview_body }}</pre>

          <!-- 不支持的格式 -->
          <div v-else class="kb-preview__unsupported">
            <div class="kb-preview__unsupported-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <p>暂不支持该格式的在线预览</p>
            <button class="btn btn--primary btn--sm" @click="downloadDoc(previewDoc)">下载源文件</button>
          </div>
        </div>

        <footer class="kb-preview__foot">
          <button class="btn btn--ghost" @click="downloadDoc(previewDoc)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            <span>下载源文件</span>
          </button>
          <button class="btn btn--primary" @click="gotoChatWithDoc(previewDoc)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>同事室对话</span>
          </button>
        </footer>
      </aside>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getKnowledgeBaseDetail,
  uploadDocument,
  reparseDocument,
  getDocumentDetail,
  deleteDocument,
} from '@/api/smart-center'

const route = useRoute()
const router = useRouter()

const entering = ref(false)
const loading = ref(false)
const kb = ref(null)
const docs = ref([])
const filter = reactive({ keyword: '', status: 'all' })

/* 统计 */
const stats = computed(() => {
  const list = docs.value
  return {
    total: list.length,
    completed: list.filter((d) => d.parse_status === 'completed').length,
    parsing: list.filter((d) => d.parse_status === 'parsing').length,
    failed: list.filter((d) => d.parse_status === 'failed').length,
  }
})

/* 分页 */
const currentPage = ref(1)
const pageSize = 10
const totalPages = computed(() => Math.max(1, Math.ceil(filteredDocs.value.length / pageSize)))
const filteredDocs = computed(() => {
  let list = docs.value
  if (filter.status !== 'all') list = list.filter((d) => d.parse_status === filter.status)
  if (filter.keyword) {
    const kw = filter.keyword.toLowerCase()
    list = list.filter((d) => d.filename?.toLowerCase().includes(kw))
  }
  return list
})
const pagedDocs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredDocs.value.slice(start, start + pageSize)
})
const pageRangeStart = computed(() => filteredDocs.value.length ? (currentPage.value - 1) * pageSize + 1 : 0)
const pageRangeEnd = computed(() => Math.min(currentPage.value * pageSize, filteredDocs.value.length))
const visiblePages = computed(() => {
  const total = totalPages.value
  const cur = currentPage.value
  const pages = new Set([1, total, cur, cur - 1, cur + 1])
  return [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
})
function goPage(p) {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
}

/* 预览抽屉 */
const previewOpen = ref(false)
const previewDoc = ref(null)
function openDoc(d) {
  previewOpen.value = true
  previewDoc.value = { ...d }
  // 异步获取详情,补全结构化预览
  getDocumentDetail(d.id)
    .then((detail) => { previewDoc.value = { ...previewDoc.value, ...detail } })
    .catch(() => { /* 离线兜底 */ })
}
function closePreview() {
  previewOpen.value = false
  setTimeout(() => { previewDoc.value = null }, 250)
}

function gotoChatWithDoc(d) {
  // 携带文档 id 跳转同事室,触发基于文档的对话
  router.push({ path: '/chat', query: { doc_id: d.id, kb_id: kb.value?.id } })
  ElMessage.info(`已发起关于「${d.filename}」的对话`)
}

/* 上传 */
const uploadOpen = ref(false)
const uploadDraft = reactive({ filename: '', format: 'md', size_kb: 256, tags_text: '' })
const FORMAT_OPTIONS = ['md', 'pdf', 'docx', 'txt', 'xlsx', 'csv', 'json', 'png', 'jpg', 'py', 'zip']

function openUpload() {
  uploadDraft.filename = ''
  uploadDraft.format = 'md'
  uploadDraft.size_kb = 256
  uploadDraft.tags_text = ''
  uploadOpen.value = true
}

async function submitUpload() {
  if (!uploadDraft.filename || !kb.value) return
  try {
    const tags = (uploadDraft.tags_text || '').split(/[,，;；\s]+/).map((t) => t.trim()).filter(Boolean)
    await uploadDocument({
      knowledge_base_id: kb.value.id,
      filename: uploadDraft.filename,
      format: uploadDraft.format,
      size_bytes: Math.round(uploadDraft.size_kb * 1024),
      tags,
    })
    ElMessage.success(`已上传「${uploadDraft.filename}」`)
    uploadOpen.value = false
    await loadKb()
  } catch (e) {
    ElMessage.error(e?.message || '上传失败')
  }
}

async function reparse(d) {
  if (d.parse_status !== 'failed') return
  try {
    const res = await reparseDocument(d.id)
    const idx = docs.value.findIndex((x) => x.id === d.id)
    if (idx >= 0 && res.parse_status) docs.value[idx] = { ...docs.value[idx], parse_status: res.parse_status }
    ElMessage.success(`「${d.filename}」已重新加入解析队列`)
  } catch (e) {
    ElMessage.error(e?.message || '重新解析失败')
  }
}

async function confirmDelete(d) {
  try {
    await ElMessageBox.confirm(
      `确定要删除「${d.filename}」吗?删除后将从知识库中移除,且无法恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    )
  } catch { return }
  try {
    await deleteDocument(d.id)
    docs.value = docs.value.filter((x) => x.id !== d.id)
    ElMessage.success(`已删除「${d.filename}」`)
    if (pagedDocs.value.length === 0 && currentPage.value > 1) currentPage.value--
  } catch (e) {
    ElMessage.error(e?.message || '删除失败')
  }
}

function downloadDoc(d) {
  const text = d.preview_body || `Mock download of ${d.filename}`
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = d.filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success(`已开始下载「${d.filename}」`)
}

/* 工具 */
function parseStatusLabel(s) {
  return s === 'completed' ? '已完成'
    : s === 'parsing'  ? '解析中'
    : s === 'failed'   ? '解析失败'
    : '待解析'
}
function formatSize(b) {
  b = Number(b) || 0
  if (b >= 1024 * 1024 * 1024) return (b / 1024 / 1024 / 1024).toFixed(2) + ' GB'
  if (b >= 1024 * 1024)        return (b / 1024 / 1024).toFixed(2) + ' MB'
  if (b >= 1024)               return (b / 1024).toFixed(1) + ' KB'
  return b + ' B'
}
function formatTime(t) {
  if (!t) return '—'
  return String(t).replace('T', ' ').slice(0, 16)
}
const formatTotalSize = computed(() => {
  const total = docs.value.reduce((s, d) => s + (Number(d.size_bytes) || 0), 0)
  return formatSize(total)
})

/* 生命周期 */
async function loadKb() {
  loading.value = true
  try {
    const id = route.params.id
    const data = await getKnowledgeBaseDetail(id)
    kb.value = {
      id: data.id,
      name: data.name,
      description: data.description,
    }
    docs.value = data.documents || []
    currentPage.value = 1
  } catch (e) {
    ElMessage.error(e?.message || '知识库加载失败')
  } finally {
    loading.value = false
  }
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/personal-kb')
}

function onKey(e) {
  if (e.key === 'Escape' && previewOpen.value) closePreview()
}

let kwT
watch([() => filter.keyword, () => filter.status], () => {
  clearTimeout(kwT)
  kwT = setTimeout(() => { currentPage.value = 1 }, 200)
})
watch(() => route.params.id, () => { loadKb() })

onMounted(() => {
  requestAnimationFrame(() => (entering.value = true))
  loadKb()
  window.addEventListener('keydown', onKey)
})
onUnmounted(() => {
  entering.value = false
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
/* ============== HERO (对齐 skills-hero / agents-hero) ============== */
.kdocs-hero {
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
  padding: 22px 28px; margin-bottom: 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--accent-soft) 0%, transparent 60%), var(--surface);
  border: 1px solid var(--line);
  flex-wrap: wrap;
}
.kdocs-hero__text h3 { font-size: 18px; margin: 0 0 4px; font-weight: 600; color: var(--ink); }
.kdocs-hero__text p  { margin: 0; font-size: 13px; color: var(--ink-3); line-height: 1.6; }
.kdocs-hero__text b  { color: var(--ink-2); font-weight: 600; }
.kdocs-hero__actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; flex-wrap: wrap; }

/* ============== TOOLBAR (对齐 skills-toolbar) ============== */
.kdocs-toolbar {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  flex-wrap: wrap; margin-bottom: 18px;
}
.kdocs-toolbar__left  { display: flex; align-items: center; gap: 12px; flex: 1; flex-wrap: wrap; }
.kdocs-toolbar__right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

/* ============== STATS (对齐 stat-card 风格) ============== */
.kdocs-stats {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 14px; margin-bottom: 20px;
}
.kdocs-stat {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 18px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  transition: all var(--tx-fast) var(--ease);
}
.kdocs-stat:hover { border-color: var(--accent); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.kdocs-stat__icon {
  width: 40px; height: 40px; border-radius: 10px;
  display: grid; place-items: center; flex-shrink: 0;
  transition: transform var(--tx-fast) var(--ease);
}
.kdocs-stat:hover .kdocs-stat__icon { transform: scale(1.05); }
.kdocs-stat__icon svg { width: 20px; height: 20px; }
.kdocs-stat__icon--total   { background: var(--accent-soft); color: var(--accent); }
.kdocs-stat__icon--ok      { background: rgba(16, 185, 129, 0.10); color: #10b981; }
.kdocs-stat__icon--info    { background: rgba(59, 130, 246, 0.10); color: #3b82f6; }
.kdocs-stat__icon--storage { background: rgba(245, 158, 11, 0.10); color: #f59e0b; }
.kdocs-stat__text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.kdocs-stat__label { font-size: 11.5px; color: var(--ink-3); font-weight: 500; }
.kdocs-stat__value {
  font-size: 20px; font-weight: 600; color: var(--ink);
  font-family: var(--font-display); letter-spacing: -0.3px;
  line-height: 1.2;
}

/* ============== TABLE ============== */
.kb-docs-table-wrap {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.kb-docs-table {
  width: 100%; border-collapse: collapse;
  font-size: 13px;
}
.kb-docs-table thead th {
  text-align: left; padding: 12px 16px;
  font-size: 11.5px; font-weight: 600;
  color: var(--ink-3); letter-spacing: 0.04em; text-transform: uppercase;
  background: var(--surface-2);
  border-bottom: 1px solid var(--line);
  white-space: nowrap;
}
.kb-docs-table tbody td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--line);
  color: var(--ink);
  vertical-align: middle;
}
.kb-docs-table tbody tr:last-child td { border-bottom: 0; }
.kb-docs-table tbody tr {
  transition: background var(--tx-fast) var(--ease);
}
.kb-docs-table tbody tr:hover { background: var(--surface-2); }

.kb-docs-table__col-fmt     { width: 80px; }
.kb-docs-table__col-time    { width: 170px; }
.kb-docs-table__col-status  { width: 110px; }
.kb-docs-table__col-actions { width: 130px; }

.kb-docs-table__file {
  display: inline-flex; align-items: center; gap: 10px;
  cursor: pointer;
  max-width: 100%;
}
.kb-docs-table__file:hover .kb-docs-table__file-name { color: var(--accent); }
.kb-docs-table__file-icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: grid; place-items: center; flex-shrink: 0;
  transition: transform var(--tx-fast) var(--ease);
}
.kb-docs-table__file:hover .kb-docs-table__file-icon { transform: scale(1.05); }
.kb-docs-table__file-icon svg { width: 16px; height: 16px; }
.kb-docs-table__file-icon.is-pdf,
.kb-docs-table__file-icon.is-docx,
.kb-docs-table__file-icon.is-md,
.kb-docs-table__file-icon.is-txt {
  background: var(--accent-soft); color: var(--accent);
}
.kb-docs-table__file-icon.is-xlsx,
.kb-docs-table__file-icon.is-csv {
  background: rgba(16, 185, 129, 0.10); color: #10b981;
}
.kb-docs-table__file-icon.is-json,
.kb-docs-table__file-icon.is-py {
  background: rgba(245, 158, 11, 0.10); color: #f59e0b;
}
.kb-docs-table__file-name {
  font-size: 13px; font-weight: 500;
  color: var(--ink);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  max-width: 460px;
  transition: color var(--tx-fast) var(--ease);
}

.kb-docs-table__format {
  display: inline-block;
  font-size: 10.5px; font-weight: 600; padding: 3px 8px;
  border-radius: 4px; letter-spacing: 0.4px;
  background: var(--accent-soft); color: var(--accent);
  font-family: var(--font-mono);
}
.kb-docs-table__format.is-pdf  { background: rgba(239, 68, 68, 0.10); color: #ef4444; }
.kb-docs-table__format.is-docx { background: var(--accent-soft);  color: var(--accent); }
.kb-docs-table__format.is-md,
.kb-docs-table__format.is-txt { background: rgba(59, 130, 246, 0.10);    color: #3b82f6; }
.kb-docs-table__format.is-xlsx,
.kb-docs-table__format.is-csv { background: rgba(16, 185, 129, 0.10);      color: #10b981; }

.kb-docs-table__time {
  font-size: 12.5px; color: var(--ink-2);
  font-variant-numeric: tabular-nums;
  font-family: var(--font-mono);
}

.kb-docs-table__status {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11.5px; padding: 3px 10px;
  border-radius: 999px;
  background: var(--surface-2);
  color: var(--ink-2);
  font-weight: 500;
}
.kb-docs-table__status-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--ink-3);
}
.kb-docs-table__status.is-completed { background: rgba(16, 185, 129, 0.10);     color: #10b981; }
.kb-docs-table__status.is-completed .kb-docs-table__status-dot { background: #10b981; }
.kb-docs-table__status.is-parsing   { background: rgba(59, 130, 246, 0.10);   color: #3b82f6; }
.kb-docs-table__status.is-parsing .kb-docs-table__status-dot   { background: #3b82f6; animation: kb-pulse 1.2s infinite; }
.kb-docs-table__status.is-failed    { background: rgba(239, 68, 68, 0.10); color: #ef4444; }
.kb-docs-table__status.is-failed .kb-docs-table__status-dot    { background: #ef4444; }
.kb-docs-table__status.is-pending   { background: var(--surface-2);  color: var(--ink-3); }
@keyframes kb-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

.kb-docs-table__actions {
  display: inline-flex; align-items: center; gap: 4px;
}
.kb-docs-table__action {
  width: 30px; height: 30px;
  display: grid; place-items: center;
  border: 0; background: transparent;
  border-radius: 6px; cursor: pointer;
  color: var(--ink-2);
  transition: all var(--tx-fast) var(--ease);
}
.kb-docs-table__action:hover {
  background: var(--accent-soft); color: var(--accent);
}
.kb-docs-table__action.is-disabled,
.kb-docs-table__action:disabled {
  opacity: 0.4; cursor: not-allowed;
}
.kb-docs-table__action.is-disabled:hover,
.kb-docs-table__action:disabled:hover {
  background: transparent; color: var(--ink-2);
}
.kb-docs-table__action--danger:hover {
  background: rgba(239, 68, 68, 0.1); color: #ef4444;
}
.kb-docs-table__action svg { width: 15px; height: 15px; }

/* ============== PAGINATION ============== */
.kb-docs-pagination {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 16px; padding: 0 4px;
  font-size: 12.5px; color: var(--ink-2);
  flex-wrap: wrap; gap: 12px;
}
.kb-docs-pagination__info { color: var(--ink-3); }
.kb-docs-pagination__pager {
  display: inline-flex; align-items: center; gap: 4px;
}
.kb-docs-pagination__btn {
  min-width: 32px; height: 32px; padding: 0 8px;
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid var(--line);
  background: var(--surface);
  border-radius: 8px;
  font-size: 12.5px; color: var(--ink-2);
  cursor: pointer;
  transition: all var(--tx-fast) var(--ease);
  font-family: inherit;
}
.kb-docs-pagination__btn:hover:not(:disabled):not(.is-active) {
  background: var(--surface-2); color: var(--ink);
  border-color: var(--line-2);
}
.kb-docs-pagination__btn.is-active {
  background: var(--accent); color: #fff; border-color: var(--accent);
}
.kb-docs-pagination__btn:disabled { opacity: 0.4; cursor: not-allowed; }
.kb-docs-pagination__btn svg { width: 14px; height: 14px; }

/* ============== LOADING / EMPTY ============== */
.kb-docs-loading, .kb-docs-empty {
  margin: 60px auto; padding: 40px 32px; max-width: 480px; text-align: center;
  border: 1px dashed var(--line); border-radius: 14px;
  background: var(--surface);
  color: var(--ink-2);
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.kb-docs-empty__icon {
  width: 64px; height: 64px; border-radius: 16px;
  display: grid; place-items: center;
  background: var(--surface-2); color: var(--ink-3);
  margin-bottom: 6px;
}
.kb-docs-empty__icon svg { width: 30px; height: 30px; }
.kb-docs-empty h4 { margin: 0; font-size: 15px; font-weight: 600; color: var(--ink); }
.kb-docs-empty p  { margin: 0; font-size: 12.5px; color: var(--ink-3); }
.kb-docs-spinner {
  width: 28px; height: 28px; border-radius: 50%;
  border: 3px solid var(--line); border-top-color: var(--accent);
  animation: kb-spin 0.8s linear infinite; margin-bottom: 8px;
}
@keyframes kb-spin { to { transform: rotate(360deg); } }

/* ============== UPLOAD DIALOG ============== */
.kb-docs-upload { display: flex; flex-direction: column; gap: 12px; }
.kb-docs-upload__row { display: flex; gap: 12px; }
.kb-docs-upload__field { display: flex; flex-direction: column; gap: 5px; flex: 1; }
.kb-docs-upload__field label {
  font-size: 12.5px; color: var(--ink-2); font-weight: 500;
}
.kb-docs-upload__required { color: #ef4444; margin-left: 2px; }
.kb-docs-input {
  padding: 8px 12px; border: 1px solid var(--line); border-radius: 8px;
  background: var(--surface);
  font-size: 13px; color: var(--ink);
  font-family: inherit;
  transition: border-color var(--tx-fast) var(--ease), box-shadow var(--tx-fast) var(--ease);
  outline: 0; width: 100%;
}
.kb-docs-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

/* ============== PREVIEW DRAWER · 右侧滑出 ============== */
.kb-preview-mask {
  position: fixed; inset: 0; z-index: 998;
  background: rgba(15, 23, 42, 0.40);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}
.kb-preview {
  position: fixed; top: 0; right: 0; bottom: 0;
  width: 560px; max-width: 92vw;
  z-index: 999;
  background: var(--surface);
  display: flex; flex-direction: column;
  box-shadow: -8px 0 32px rgba(15, 23, 42, 0.18);
}
.kb-preview__head {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--line);
  flex-shrink: 0;
}
.kb-preview__head-icon {
  width: 36px; height: 36px; border-radius: 8px;
  display: grid; place-items: center; flex-shrink: 0;
}
.kb-preview__head-icon svg { width: 18px; height: 18px; }
.kb-preview__head-icon.is-pdf,
.kb-preview__head-icon.is-docx,
.kb-preview__head-icon.is-md,
.kb-preview__head-icon.is-txt {
  background: var(--accent-soft); color: var(--accent);
}
.kb-preview__head-icon.is-xlsx,
.kb-preview__head-icon.is-csv { background: rgba(16, 185, 129, 0.10); color: #10b981; }
.kb-preview__head-name {
  flex: 1; min-width: 0;
  font-size: 14px; font-weight: 600;
  color: var(--ink);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.kb-preview__close {
  width: 30px; height: 30px;
  display: grid; place-items: center;
  border: 0; background: transparent;
  border-radius: 6px; cursor: pointer;
  color: var(--ink-3);
  transition: all var(--tx-fast) var(--ease);
}
.kb-preview__close:hover { background: var(--surface-2); color: var(--ink); }
.kb-preview__close svg { width: 16px; height: 16px; }

.kb-preview__body {
  flex: 1; overflow-y: auto;
  padding: 24px 28px;
  background: var(--surface-2);
}

/* 结构化文档内容 */
.kb-preview__article-head { margin-bottom: 18px; }
.kb-preview__article-title {
  margin: 0 0 8px; font-size: 18px; font-weight: 600;
  color: var(--ink); line-height: 1.4;
  letter-spacing: -0.2px;
}
.kb-preview__article-summary {
  margin: 0; padding: 10px 14px;
  background: var(--accent-soft);
  border-left: 3px solid var(--accent);
  border-radius: 6px;
  font-size: 12.5px; color: var(--ink-2);
  line-height: 1.6;
}
.kb-preview__article-summary strong {
  color: var(--accent); font-weight: 600; margin-right: 6px;
}
.kb-preview__section { margin-bottom: 18px; }
.kb-preview__section-title {
  margin: 0 0 8px; font-size: 15px; font-weight: 600;
  color: var(--ink);
}
.kb-preview__section-text {
  margin: 0 0 10px; font-size: 13px; line-height: 1.7;
  color: var(--ink-2);
}
.kb-preview__section-list {
  margin: 0; padding-left: 20px;
  font-size: 13px; line-height: 1.8;
  color: var(--ink-2);
}
.kb-preview__section-list li { margin-bottom: 4px; }

/* 纯文本预览 */
.kb-preview__text {
  background: var(--surface);
  padding: 18px 22px;
  border-radius: 10px;
  font-family: var(--font-mono, 'JetBrains Mono', 'SF Mono', Consolas, monospace);
  font-size: 12.5px; line-height: 1.7; color: var(--ink);
  white-space: pre-wrap; word-break: break-word;
  border: 1px solid var(--line);
  margin: 0;
}

/* 不支持 */
.kb-preview__unsupported {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 60px 20px;
  background: var(--surface);
  border-radius: 10px;
  border: 1px solid var(--line);
  text-align: center;
}
.kb-preview__unsupported-icon {
  width: 56px; height: 56px; border-radius: 14px;
  background: var(--surface-2); color: var(--ink-3);
  display: grid; place-items: center;
}
.kb-preview__unsupported-icon svg { width: 28px; height: 28px; }
.kb-preview__unsupported p { margin: 0; font-size: 13px; color: var(--ink-3); }

/* 抽屉底部操作 */
.kb-preview__foot {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
  border-top: 1px solid var(--line);
  background: var(--surface);
  flex-shrink: 0;
}
.kb-preview__foot .btn { flex: 1; justify-content: center; }

/* Drawer 动画 */
.kb-preview-drawer-enter-active, .kb-preview-drawer-leave-active { transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
.kb-preview-drawer-enter-from, .kb-preview-drawer-leave-to { transform: translateX(100%); }
.kb-preview-fade-enter-active, .kb-preview-fade-leave-active { transition: opacity 0.2s ease; }
.kb-preview-fade-enter-from, .kb-preview-fade-leave-to { opacity: 0; }

/* ============== RESPONSIVE ============== */
@media (max-width: 1100px) {
  .kdocs-stats { grid-template-columns: repeat(2, 1fr); }
  .kdocs-hero { flex-direction: column; align-items: flex-start; }
  .kdocs-hero__actions { width: 100%; }
}
@media (max-width: 720px) {
  .page { padding: 16px 16px 32px; }
  .kdocs-stats { grid-template-columns: 1fr 1fr; }
  .kdocs-toolbar { flex-direction: column; align-items: stretch; }
  .kdocs-toolbar__right { width: 100%; }
  .kdocs-toolbar__left { width: 100%; overflow-x: auto; flex-wrap: nowrap; }
  .kdocs-search-input { width: 100%; }
  .kb-docs-table__col-time, .kb-docs-table__col-fmt { display: none; }
  .kb-docs-table td:nth-child(2), .kb-docs-table td:nth-child(3) { display: none; }
  .kb-docs-table thead th:nth-child(2), .kb-docs-table thead th:nth-child(3) { display: none; }
  .kb-preview { width: 100%; max-width: 100%; }
}
</style>
