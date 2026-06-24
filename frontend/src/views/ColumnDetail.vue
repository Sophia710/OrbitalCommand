<template>
  <div class="page page-column-detail" :class="{ 'view-enter': entering }">
    <!-- 顶部工具条:返回 -->
    <div class="cd-toolbar">
      <button class="cd-back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        <span>返回专栏市场</span>
      </button>
    </div>

    <!-- 加载态 -->
    <div v-if="loading" class="cd-loading">
      <span class="cd-spinner" />
      <span>正在加载专栏...</span>
    </div>

    <!-- 错误 / 找不到 -->
    <section v-else-if="!column" class="cd-empty">
      <div class="cd-empty__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <h3 class="cd-empty__title">未找到该专栏</h3>
      <p class="cd-empty__desc">可能已经下架,或链接不正确</p>
      <button class="cd-btn cd-btn--primary" @click="goBack">返回专栏市场</button>
    </section>

    <!-- 正常内容 -->
    <template v-else>
      <!-- 专栏头(渐变封面) -->
      <header class="cd-head" :style="{ background: gradientOf(column) }">
        <div class="cd-head__inner">
          <span class="cd-head__cat" :style="{ background: catColor(column.category) }">
            {{ catName(column.category) }}
          </span>
          <h1 class="cd-head__title">{{ column.title }}</h1>
          <p class="cd-head__desc">{{ column.description }}</p>
        </div>
      </header>

      <!-- 元信息条 + 订阅按钮 -->
      <section class="cd-meta">
        <div class="cd-meta__info">
          <div class="cd-meta__item">
            <b>{{ column.articles_count }}</b>
            <span>篇文章</span>
          </div>
          <span class="cd-meta__sep">·</span>
          <div class="cd-meta__item">
            <b>{{ column.subscribers.toLocaleString() }}</b>
            <span>位订阅者</span>
          </div>
          <span v-if="column.tags?.length" class="cd-meta__sep">·</span>
          <div v-if="column.tags?.length" class="cd-meta__tags">
            <span v-for="t in column.tags" :key="t" class="cd-tag">#{{ t }}</span>
          </div>
        </div>
        <div class="cd-meta__action">
          <button
            v-if="!isSubscribed(column.id)"
            class="cd-btn cd-btn--primary"
            :disabled="pendingId === column.id"
            @click="onSubscribe"
          >
            <span v-if="pendingId === column.id" class="cd-btn__spinner" />
            <span>订阅专栏</span>
          </button>
          <div v-else class="cd-meta__subscribed">
            <span class="cd-meta__subscribed-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              已订阅
            </span>
            <button
              class="cd-btn cd-btn--ghost"
              :disabled="pendingId === column.id"
              @click="onUnsubscribe"
            >
              <span v-if="pendingId === column.id" class="cd-btn__spinner cd-btn__spinner--dark" />
              <span>取消订阅</span>
            </button>
          </div>
        </div>
      </section>

      <!-- 分割线 -->
      <hr class="cd-divider" />

      <!-- 文章列表 -->
      <section class="cd-articles">
        <header class="cd-articles__head">
          <h4>专栏文章</h4>
          <p>共 {{ articles.length }} 篇 · 按发布时间倒序</p>
        </header>

        <ul v-if="articles.length" class="cd-article-list">
          <li
            v-for="a in articles"
            :key="a.id"
            class="cd-article-item"
            @click="openArticle(a)"
          >
            <!-- 日期块 -->
            <div class="cd-article-item__date">
              <b>{{ formatDay(a.published_at) }}</b>
              <span>{{ formatYearMonth(a.published_at) }}</span>
            </div>

            <!-- 主体 -->
            <div class="cd-article-item__main">
              <div class="cd-article-item__row1">
                <span class="cd-article-item__cat" :style="{ background: catColor(a.category) }">
                  {{ catName(a.category) }}
                </span>
                <span class="cd-article-item__readtime">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  {{ a.reading_minutes }} 分钟
                </span>
              </div>
              <h5 class="cd-article-item__title">{{ a.title }}</h5>
              <p class="cd-article-item__summary">{{ a.summary }}</p>
              <div class="cd-article-item__meta">
                <span>{{ a.author }} · {{ a.author_title }}</span>
                <span class="cd-article-item__sep">·</span>
                <span>{{ formatDateTime(a.published_at) }}</span>
                <span class="cd-article-item__sep">·</span>
                <span>{{ formatNum(a.views) }} 阅读</span>
                <span class="cd-article-item__sep">·</span>
                <span>{{ formatNum(a.likes) }} 赞</span>
              </div>
            </div>

            <!-- 箭头 -->
            <span class="cd-article-item__arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </span>
          </li>
        </ul>

        <!-- 列表空态 -->
        <div v-else class="cd-articles__empty">
          <p>该专栏暂无文章</p>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MOCK } from '@/api/mock-data'
import { getColumnArticles } from '@/api/smart-center'
import { useColumnSubscriptions } from '@/composables/useColumnSubscriptions'

const route = useRoute()
const router = useRouter()

const { isSubscribed, subscribe, unsubscribe } = useColumnSubscriptions()

const columnId = computed(() => String(route.params.id || ''))
const column = ref(null)
const articles = ref([])
const loading = ref(true)
const entering = ref(true)
const pendingId = ref(null)

/* ============== 数据加载 ============== */
async function load() {
  loading.value = true
  entering.value = true
  column.value = null
  articles.value = []
  try {
    const col = MOCK.columns.find((c) => c.id === columnId.value)
    if (!col) {
      column.value = null
      return
    }
    column.value = col
    /* 拉文章列表(失败回退到 mock) */
    try {
      const list = await getColumnArticles(columnId.value, 20)
      articles.value = Array.isArray(list) ? list : []
    } catch (err) {
      console.warn('[ColumnDetail] getColumnArticles 失败, 回退 mock', err)
      articles.value = MOCK.buildArticleList(columnId.value, 20)
    }
  } finally {
    loading.value = false
    setTimeout(() => (entering.value = false), 50)
  }
}

onMounted(load)
watch(columnId, load)

/* ============== 交互 ============== */
async function onSubscribe() {
  if (!column.value || pendingId.value) return
  pendingId.value = column.value.id
  try {
    /* 模拟网络延迟 */
    await new Promise((r) => setTimeout(r, 400))
    subscribe(column.value.id)
    ElMessage.success(`已订阅「${column.value.title}」`)
  } catch (err) {
    console.error('[ColumnDetail] 订阅失败', err)
    ElMessage.error('订阅失败,请稍后重试')
  } finally {
    pendingId.value = null
  }
}

async function onUnsubscribe() {
  if (!column.value || pendingId.value) return
  try {
    await ElMessageBox.confirm(
      `确认取消订阅「${column.value.title}」?取消后将不再收到该专栏的更新。`,
      '取消订阅',
      { type: 'warning', confirmButtonText: '确认取消', cancelButtonText: '继续订阅' },
    )
  } catch {
    return
  }
  pendingId.value = column.value.id
  try {
    await new Promise((r) => setTimeout(r, 400))
    unsubscribe(column.value.id)
    ElMessage.success(`已取消订阅「${column.value.title}」`)
  } catch (err) {
    console.error('[ColumnDetail] 取消订阅失败', err)
    ElMessage.error('取消订阅失败,请稍后重试')
  } finally {
    pendingId.value = null
  }
}

function goBack() {
  router.push('/columns')
}

function openArticle(a) {
  router.push(`/columns/article/${a.id}`)
}

/* ============== 工具方法 ============== */
function catName(key) {
  return MOCK.columnCategories?.[key]?.label || '其他'
}
function catColor(key) {
  return MOCK.columnCategories?.[key]?.color || '#9E9E9E'
}
function gradientOf(col) {
  /* 用 cover_color 派生一条柔和的左上→右下渐变 */
  const c = col.cover_color || '#3F51B5'
  return `linear-gradient(135deg, ${c} 0%, ${shade(c, -22)} 100%)`
}
function shade(hex, percent) {
  /* 调整 hex 颜色的亮度 */
  const m = hex.replace('#', '')
  const num = parseInt(m, 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + percent))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + percent))
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + percent))
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
}
function formatDay(iso) {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2, '0')}`
}
function formatYearMonth(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}`
}
function formatDateTime(iso) {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const h = d.getHours().toString().padStart(2, '0')
  const min = d.getMinutes().toString().padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}
function formatNum(n) {
  if (n == null) return '—'
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, '') + 'w'
  return n.toLocaleString()
}
</script>

<style scoped>
/* ============================================================
 * 专栏详情页 (ColumnDetail.vue)
 * 视觉:与 Columns.vue 一致 — 浅色背景,卡片化,左侧边线渐变
 * ============================================================ */

.page-column-detail {
  --cd-accent: #4f6df5;
  --cd-ink: #1d1f24;
  --cd-ink-soft: #5b6170;
  --cd-ink-mute: #8a8f9c;
  --cd-surface: #ffffff;
  --cd-surface-2: #f7f8fb;
  --cd-line: #e7e9ef;
  --cd-line-soft: #eef0f4;
  --cd-radius: 16px;
  --cd-radius-sm: 10px;
  --cd-shadow: 0 6px 24px rgba(20, 24, 40, 0.05);
  --cd-shadow-hover: 0 10px 32px rgba(20, 24, 40, 0.08);

  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px 28px 64px;
  background: var(--cd-surface-2);
  min-height: 100%;
  color: var(--cd-ink);
  animation: cd-fade 0.32s ease;
}

@keyframes cd-fade {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ---------- 工具条 ---------- */
.cd-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cd-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: var(--cd-surface);
  border: 1px solid var(--cd-line);
  border-radius: 999px;
  color: var(--cd-ink-soft);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.18s ease;
}
.cd-back svg { width: 14px; height: 14px; }
.cd-back:hover {
  color: var(--cd-accent);
  border-color: var(--cd-accent);
  transform: translateX(-2px);
}

/* ---------- 加载 / 空态 ---------- */
.cd-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 80px 0;
  color: var(--cd-ink-mute);
  font-size: 14px;
}
.cd-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(79, 109, 245, 0.18);
  border-top-color: var(--cd-accent);
  border-radius: 50%;
  animation: cd-spin 0.8s linear infinite;
}
@keyframes cd-spin {
  to { transform: rotate(360deg); }
}

.cd-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 24px;
  background: var(--cd-surface);
  border: 1px solid var(--cd-line-soft);
  border-radius: var(--cd-radius);
  text-align: center;
}
.cd-empty__icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(79, 109, 245, 0.08);
  color: var(--cd-accent);
  display: flex;
  align-items: center;
  justify-content: center;
}
.cd-empty__icon svg { width: 28px; height: 28px; }
.cd-empty__title { margin: 6px 0 0; font-size: 18px; font-weight: 600; color: var(--cd-ink); }
.cd-empty__desc  { margin: 0 0 8px; color: var(--cd-ink-mute); font-size: 13px; }

/* ---------- 通用按钮 ---------- */
.cd-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 18px;
  border: 1px solid transparent;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}
.cd-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.cd-btn--primary {
  background: linear-gradient(135deg, #4f6df5 0%, #6f86ff 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(79, 109, 245, 0.28);
}
.cd-btn--primary:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(79, 109, 245, 0.36);
}
.cd-btn--ghost {
  background: var(--cd-surface);
  color: var(--cd-ink-soft);
  border-color: var(--cd-line);
}
.cd-btn--ghost:not(:disabled):hover {
  color: var(--cd-accent);
  border-color: var(--cd-accent);
}
.cd-btn__spinner {
  width: 12px;
  height: 12px;
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: cd-spin 0.8s linear infinite;
}
.cd-btn__spinner--dark {
  border-color: rgba(79, 109, 245, 0.25);
  border-top-color: var(--cd-accent);
}

/* ---------- 专栏头 ---------- */
.cd-head {
  position: relative;
  height: 200px;
  border-radius: var(--cd-radius);
  overflow: hidden;
  box-shadow: var(--cd-shadow);
}
.cd-head::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 80% 0%, rgba(255, 255, 255, 0.18), transparent 60%),
              radial-gradient(circle at 0% 100%, rgba(0, 0, 0, 0.08), transparent 60%);
  pointer-events: none;
}
.cd-head__inner {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 28px 32px;
  color: #fff;
}
.cd-head__cat {
  align-self: flex-start;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  margin-bottom: 10px;
  backdrop-filter: blur(4px);
  background-clip: padding-box;
}
.cd-head__title {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.cd-head__desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  max-width: 720px;
  opacity: 0.92;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}

/* ---------- 元信息条 ---------- */
.cd-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  background: var(--cd-surface);
  border: 1px solid var(--cd-line-soft);
  border-radius: var(--cd-radius);
  box-shadow: var(--cd-shadow);
  flex-wrap: wrap;
}
.cd-meta__info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 13px;
  color: var(--cd-ink-mute);
}
.cd-meta__item {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
}
.cd-meta__item b {
  font-size: 16px;
  font-weight: 600;
  color: var(--cd-ink);
}
.cd-meta__sep { color: var(--cd-line); }
.cd-meta__tags {
  display: inline-flex;
  gap: 6px;
  flex-wrap: wrap;
}
.cd-tag {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(79, 109, 245, 0.08);
  color: var(--cd-accent);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}
.cd-meta__action {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}
.cd-meta__subscribed {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.cd-meta__subscribed-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  background: rgba(46, 184, 131, 0.10);
  color: #2eb883;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}
.cd-meta__subscribed-tag svg { width: 12px; height: 12px; }

/* ---------- 分割线 ---------- */
.cd-divider {
  border: 0;
  border-top: 1px solid var(--cd-line-soft);
  margin: 4px 0 0;
}

/* ---------- 文章列表 ---------- */
.cd-articles__head {
  margin-bottom: 12px;
}
.cd-articles__head h4 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: var(--cd-ink);
}
.cd-articles__head p {
  margin: 0;
  font-size: 12px;
  color: var(--cd-ink-mute);
}
.cd-article-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cd-article-item {
  display: grid;
  grid-template-columns: 80px 1fr 32px;
  align-items: center;
  gap: 18px;
  padding: 18px 20px;
  background: var(--cd-surface);
  border: 1px solid var(--cd-line-soft);
  border-left: 3px solid transparent;
  border-radius: var(--cd-radius-sm);
  cursor: pointer;
  transition: all 0.18s ease;
}
.cd-article-item:hover {
  border-color: var(--cd-line);
  border-left-color: var(--cd-accent);
  transform: translateX(2px);
  box-shadow: var(--cd-shadow-hover);
}
.cd-article-item__date {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: var(--cd-ink-soft);
}
.cd-article-item__date b {
  font-size: 22px;
  font-weight: 600;
  color: var(--cd-ink);
  line-height: 1;
}
.cd-article-item__date span {
  font-size: 11px;
  color: var(--cd-ink-mute);
}
.cd-article-item__main { min-width: 0; }
.cd-article-item__row1 {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.cd-article-item__cat {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  color: #fff;
}
.cd-article-item__readtime {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: var(--cd-ink-mute);
}
.cd-article-item__readtime svg { width: 12px; height: 12px; }
.cd-article-item__title {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  color: var(--cd-ink);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
.cd-article-item__summary {
  margin: 0 0 6px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--cd-ink-soft);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.cd-article-item__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--cd-ink-mute);
}
.cd-article-item__sep { color: var(--cd-line); }
.cd-article-item__arrow {
  color: var(--cd-ink-mute);
  display: flex;
  align-items: center;
  justify-content: center;
}
.cd-article-item__arrow svg { width: 18px; height: 18px; }
.cd-article-item:hover .cd-article-item__arrow {
  color: var(--cd-accent);
  transform: translateX(2px);
}
.cd-articles__empty {
  text-align: center;
  padding: 60px 0;
  color: var(--cd-ink-mute);
  font-size: 14px;
}

/* ---------- 响应式 ---------- */
@media (max-width: 720px) {
  .page-column-detail { padding: 16px; }
  .cd-head { height: 160px; }
  .cd-head__inner { padding: 20px; }
  .cd-head__title { font-size: 22px; }
  .cd-article-item {
    grid-template-columns: 60px 1fr 24px;
    gap: 12px;
    padding: 14px;
  }
  .cd-article-item__date b { font-size: 18px; }
}
</style>
