<template>
  <div class="page page-article" :class="{ 'view-enter': entering }">
    <!-- ============== 顶部工具条:返回 + 文章标题 ============== -->
    <div class="article-toolbar">
      <button class="article-back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <span>返回</span>
      </button>
      <span v-if="article" class="article-toolbar__sep">/</span>
      <span v-if="article" class="article-toolbar__title">{{ article.title }}</span>
    </div>

    <!-- ============== 加载中 ============== -->
    <div v-if="loading" class="article-loading">
      <div class="spinner" />
      <span>正在加载文章…</span>
    </div>

    <!-- ============== 错误状态 ============== -->
    <div v-else-if="!article" class="article-empty">
      <div class="article-empty__icon">📄</div>
      <h4>未找到该文章</h4>
      <p>可能已被作者下架或链接失效</p>
      <button class="btn btn--primary btn--sm" @click="goBack">返回专栏</button>
    </div>

    <!-- ============== 主体内容 ============== -->
    <template v-else>
      <article class="article-card">
        <!-- ============== 元信息 ============== -->
        <header class="article-head">
          <div class="article-head__row">
            <span
              class="article-head__cat"
              :style="{ background: catColor(article.category) }"
            >{{ catName(article.category) }}</span>
            <span v-for="t in (article.tags || []).slice(0, 4)" :key="t" class="article-head__tag">#{{ t }}</span>
          </div>

          <h1 class="article-head__title">{{ article.title }}</h1>

          <div class="article-head__meta">
            <span class="article-head__author">
              <span
                class="article-head__avatar"
                :style="{ background: article.cover_color }"
              >{{ article.author?.charAt(0) }}</span>
              <span class="article-head__author-text">
                <b>{{ article.author }}</b>
                <span>{{ article.author_title }} · {{ article.column_title }}</span>
              </span>
            </span>
            <span class="article-head__sep">·</span>
            <span class="article-head__time">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              {{ formatDate(article.published_at) }}
            </span>
            <span class="article-head__sep">·</span>
            <span class="article-head__time">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
              </svg>
              {{ article.reading_minutes }} 分钟
            </span>
            <span class="article-head__sep">·</span>
            <span class="article-head__time">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              {{ formatNum(article.views) }} 阅读
            </span>
            <span class="article-head__sep">·</span>
            <span class="article-head__time">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 11V21M17 11V21M5 21h14M9 21V8a3 3 0 0 1 6 0v13M5 11h14a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"/>
              </svg>
              {{ formatNum(article.likes) }} 赞
            </span>
          </div>
        </header>

        <!-- ============== 摘要 ============== -->
        <section v-if="article.summary" class="article-summary">
          <div class="article-summary__bar" />
          <div class="article-summary__body">
            <div class="article-summary__label">摘要</div>
            <p>{{ article.summary }}</p>
          </div>
        </section>

        <!-- ============== 正文 · 分节 ============== -->
        <section class="article-body">
          <article
            v-for="(sec, i) in (article.sections || [])"
            :key="i"
            class="article-section"
          >
            <h2 class="article-section__heading">{{ sec.heading }}</h2>
            <p class="article-section__paragraph">{{ sec.paragraph }}</p>
            <ul v-if="sec.bullets?.length" class="article-section__bullets">
              <li v-for="(b, j) in sec.bullets" :key="j">
                <span class="article-section__bullet-dot" />
                <span>{{ b }}</span>
              </li>
            </ul>
          </article>
        </section>

        <!-- ============== 底部操作区 · 有用 / 收藏 / 分享 ============== -->
        <section class="article-actions">
          <div class="article-actions__main">
            <button
              class="article-action article-action--useful"
              :class="{ 'is-active': liked }"
              @click="toggleLike"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 11V21M17 11V21M5 21h14M9 21V8a3 3 0 0 1 6 0v13M5 11h14a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"/>
              </svg>
              <span>有用 · {{ usefulCount }}</span>
            </button>
            <button
              class="article-action article-action--bookmark"
              :class="{ 'is-active': bookmarked }"
              @click="toggleBookmark"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              <span>{{ bookmarked ? '已收藏' : '收藏' }}</span>
            </button>
            <button class="article-action article-action--share" @click="onShare">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>
              </svg>
              <span>分享</span>
            </button>
          </div>
          <div class="article-actions__sub">
            <span>本文基于订阅专栏「{{ article.column_title }}」</span>
            <span>·</span>
            <button class="article-actions__link" @click="goColumn">进入专栏</button>
          </div>
        </section>
      </article>

      <!-- ============== 关联阅读 ============== -->
      <section v-if="relatedList.length" class="article-related">
        <header class="article-related__head">
          <h4>关联阅读</h4>
          <p>来自同一专栏的其他文章</p>
        </header>
        <div class="article-related__grid">
          <article
            v-for="r in relatedList"
            :key="r.id"
            class="related-card"
            @click="openArticle(r.id)"
          >
            <h5 class="related-card__title">{{ r.title }}</h5>
            <p class="related-card__summary">{{ r.summary }}</p>
            <div class="related-card__foot">
              <span class="related-card__read">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
                </svg>
                {{ r.reading_minutes }} 分钟
              </span>
              <span class="related-card__arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </span>
            </div>
          </article>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getArticleDetail } from '@/api/smart-center'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const entering = ref(false)
const loading = ref(false)
const article = ref(null)
const relatedList = ref([])
const liked = ref(false)
const bookmarked = ref(false)

const CATEGORY_LABELS = {
  terminal: '终端', network: '网络', payload: '载荷',
  e2e: '全链路', ops: '运维运营', ai: 'AI 与算法',
}
const CATEGORY_COLORS = {
  terminal: '#4CAF50', network: '#2196F3', payload: '#9C27B0',
  e2e: '#FF5722', ops: '#00BCD4', ai: '#3F51B5',
}
function catName(k) { return CATEGORY_LABELS[k] || k }
function catColor(k) { return CATEGORY_COLORS[k] || '#94A3B8' }

const usefulCount = computed(() => {
  const base = article.value?.likes || 0
  return base + (liked.value ? 1 : 0)
})

function formatDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toISOString().slice(0, 10)
}
function formatNum(n) {
  if (n == null) return '—'
  return n.toLocaleString()
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/columns')
  }
}
function goColumn() {
  if (article.value?.column_id) {
    router.push(`/columns`)
  }
}
function openArticle(id) {
  router.push(`/columns/article/${id}`)
}

function toggleLike() {
  liked.value = !liked.value
  ElMessage.success(liked.value ? '已标记为有用' : '已取消标记')
}
function toggleBookmark() {
  bookmarked.value = !bookmarked.value
  ElMessage.success(bookmarked.value ? '已收藏到「我的收藏」' : '已取消收藏')
}
function onShare() {
  const url = window.location.href
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(
      () => ElMessage.success('链接已复制到剪贴板'),
      () => ElMessage.info(url),
    )
  } else {
    ElMessage.info(url)
  }
}

async function load() {
  const id = route.params.id
  if (!id) {
    article.value = null
    return
  }
  loading.value = true
  try {
    const data = await getArticleDetail(id)
    article.value = data
    relatedList.value = data.related || []
  } catch (e) {
    article.value = null
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  requestAnimationFrame(() => (entering.value = true))
  await load()
})
</script>

<style scoped>
.page { padding: 24px 32px 56px; max-width: 980px; margin: 0 auto; }

/* ============== TOOLBAR ============== */
.article-toolbar {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 18px; flex-wrap: wrap;
}
.article-back {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 6px 12px; border: 1px solid var(--line);
  border-radius: 8px; background: var(--surface);
  color: var(--ink-2); font-size: 12.5px;
  cursor: pointer; transition: all var(--dur-fast) var(--ease);
}
.article-back:hover {
  background: var(--surface-2); color: var(--ink);
  border-color: var(--accent);
}
.article-back svg { width: 14px; height: 14px; }
.article-toolbar__sep { color: var(--ink-3); font-size: 12.5px; }
.article-toolbar__title {
  font-size: 13px; font-weight: 600; color: var(--ink);
  max-width: 70%;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* ============== ARTICLE CARD ============== */
.article-card {
  background: var(--surface); border: 1px solid var(--line);
  border-radius: 16px; padding: 36px 44px 32px;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
}

/* ============== HEAD ============== */
.article-head__row {
  display: flex; align-items: center; gap: 6px;
  margin-bottom: 18px; flex-wrap: wrap;
}
.article-head__cat {
  padding: 3px 10px; border-radius: 999px;
  color: #fff; font-size: 11px; font-weight: 600;
  letter-spacing: 0.2px;
}
.article-head__tag {
  font-size: 11px; padding: 2px 8px; border-radius: 6px;
  background: var(--surface-2); color: var(--ink-3);
  font-weight: 500;
}
.article-head__title {
  margin: 0 0 22px; font-size: 28px; font-weight: 700;
  color: var(--ink); line-height: 1.4;
  letter-spacing: 0.3px;
}
.article-head__meta {
  display: flex; align-items: center; gap: 10px;
  font-size: 12.5px; color: var(--ink-3);
  flex-wrap: wrap; padding-bottom: 20px;
  border-bottom: 1px solid var(--line-2);
  margin-bottom: 28px;
}
.article-head__author {
  display: flex; align-items: center; gap: 8px;
  color: var(--ink-2);
}
.article-head__avatar {
  width: 32px; height: 32px; border-radius: 50%;
  display: grid; place-items: center;
  color: #fff; font-size: 13px; font-weight: 600;
}
.article-head__author-text {
  display: flex; flex-direction: column; gap: 1px;
}
.article-head__author-text b {
  font-size: 13px; color: var(--ink); font-weight: 600;
}
.article-head__author-text span { font-size: 11px; color: var(--ink-3); }
.article-head__sep { color: var(--line-2); }
.article-head__time {
  display: inline-flex; align-items: center; gap: 4px;
}
.article-head__time svg { width: 13px; height: 13px; }

/* ============== SUMMARY ============== */
.article-summary {
  position: relative;
  display: flex; gap: 14px;
  padding: 18px 22px; margin-bottom: 28px;
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--accent) 6%, var(--surface)) 0%,
    color-mix(in srgb, var(--accent) 3%, var(--surface)) 100%);
  border: 1px solid color-mix(in srgb, var(--accent) 18%, var(--line));
  border-radius: 12px;
}
.article-summary__bar {
  width: 4px; border-radius: 4px;
  background: linear-gradient(180deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 50%, transparent) 100%);
  flex-shrink: 0;
}
.article-summary__body { flex: 1; }
.article-summary__label {
  font-size: 11px; font-weight: 600;
  color: var(--accent); margin-bottom: 6px;
  letter-spacing: 0.4px;
}
.article-summary__body p {
  margin: 0; font-size: 14px; line-height: 1.75;
  color: var(--ink-2);
}

/* ============== BODY ============== */
.article-body { display: flex; flex-direction: column; gap: 32px; }
.article-section { display: flex; flex-direction: column; gap: 14px; }
.article-section__heading {
  margin: 0; font-size: 18px; font-weight: 600;
  color: var(--ink); letter-spacing: 0.2px;
  position: relative; padding-left: 14px;
}
.article-section__heading::before {
  content: ''; position: absolute; left: 0; top: 50%;
  transform: translateY(-50%);
  width: 4px; height: 18px; border-radius: 4px;
  background: var(--accent);
}
.article-section__paragraph {
  margin: 0; font-size: 14.5px; line-height: 1.85;
  color: var(--ink-2); letter-spacing: 0.1px;
}
.article-section__bullets {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 8px;
}
.article-section__bullets li {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 10px 14px;
  background: var(--surface-2); border: 1px solid var(--line-2);
  border-radius: 8px;
  font-size: 13.5px; line-height: 1.7; color: var(--ink-2);
}
.article-section__bullet-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--accent);
  margin-top: 9px; flex-shrink: 0;
}

/* ============== ACTIONS ============== */
.article-actions {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; flex-wrap: wrap;
  margin-top: 32px; padding-top: 24px;
  border-top: 1px solid var(--line-2);
}
.article-actions__main {
  display: flex; gap: 10px; flex-wrap: wrap;
}
.article-action {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 999px;
  background: var(--surface-2); color: var(--ink-2);
  border: 1px solid var(--line);
  font-size: 12.5px; font-weight: 500;
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
}
.article-action svg { width: 14px; height: 14px; }
.article-action:hover {
  border-color: var(--accent); color: var(--accent);
  background: var(--surface);
}
.article-action--useful.is-active {
  background: color-mix(in srgb, var(--accent) 12%, var(--surface));
  border-color: var(--accent); color: var(--accent);
}
.article-action--bookmark.is-active {
  background: color-mix(in srgb, #f59e0b 12%, var(--surface));
  border-color: #f59e0b; color: #b45309;
}
.article-action--share.is-active {
  background: color-mix(in srgb, #3b82f6 12%, var(--surface));
  border-color: #3b82f6; color: #1d4ed8;
}

.article-actions__sub {
  display: flex; align-items: center; gap: 6px;
  font-size: 11.5px; color: var(--ink-3);
}
.article-actions__link {
  border: 0; background: transparent;
  color: var(--accent); font-size: 11.5px;
  font-weight: 500; cursor: pointer;
}
.article-actions__link:hover { text-decoration: underline; }

/* ============== RELATED ============== */
.article-related { margin-top: 32px; }
.article-related__head { margin-bottom: 14px; }
.article-related__head h4 {
  margin: 0; font-size: 16px; font-weight: 600; color: var(--ink);
}
.article-related__head p {
  margin: 4px 0 0; font-size: 12px; color: var(--ink-3);
}
.article-related__grid {
  display: grid; gap: 14px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}
.related-card {
  display: flex; flex-direction: column; gap: 8px;
  padding: 16px 18px;
  background: var(--surface); border: 1px solid var(--line);
  border-radius: 12px; cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
}
.related-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--accent) 14%, transparent);
}
.related-card__title {
  margin: 0; font-size: 14px; font-weight: 600;
  color: var(--ink); line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 1;
  -webkit-box-orient: vertical; overflow: hidden;
}
.related-card__summary {
  margin: 0; font-size: 12px; color: var(--ink-3); line-height: 1.6;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}
.related-card__foot {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 4px; font-size: 11.5px; color: var(--ink-3);
}
.related-card__read {
  display: inline-flex; align-items: center; gap: 4px;
}
.related-card__read svg { width: 12px; height: 12px; }
.related-card__arrow { color: var(--ink-3); transition: all var(--dur-fast) var(--ease); }
.related-card__arrow svg { width: 14px; height: 14px; }
.related-card:hover .related-card__arrow { color: var(--accent); transform: translateX(2px); }

/* ============== LOADING / EMPTY ============== */
.article-loading, .article-empty {
  margin: 80px auto; padding: 48px 32px; max-width: 480px; text-align: center;
  border: 1px dashed var(--line); border-radius: 16px;
  background: var(--surface-2);
}
.spinner {
  width: 36px; height: 36px; border-radius: 50%;
  border: 3px solid var(--line); border-top-color: var(--accent);
  animation: spin 0.8s linear infinite; margin: 0 auto 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.article-empty__icon { font-size: 48px; margin-bottom: 8px; opacity: 0.6; }
.article-empty h4    { margin: 0; font-size: 15px; }
.article-empty p     { margin: 6px 0 14px; font-size: 12.5px; color: var(--ink-3); }

.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 10px; font-size: 13px;
  border: 1px solid var(--line); background: var(--surface);
  color: var(--ink-2); cursor: pointer; transition: all var(--dur-fast) var(--ease);
}
.btn--sm { padding: 5px 11px; font-size: 12px; }
.btn--primary { background: var(--accent); color: #fff; border-color: var(--accent); }
.btn--primary:hover { filter: brightness(1.08); }

/* ============== VIEW ENTER ANIMATION ============== */
.view-enter { animation: viewFadeIn 0.3s var(--ease); }
@keyframes viewFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ============== RESPONSIVE ============== */
@media (max-width: 720px) {
  .page { padding: 16px 16px 32px; }
  .article-card { padding: 24px 18px 20px; }
  .article-head__title { font-size: 22px; }
  .article-head__meta { gap: 6px; }
}
</style>
