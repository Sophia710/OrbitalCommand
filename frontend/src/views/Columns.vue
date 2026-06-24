<template>
  <div class="page page-columns" :class="{ 'view-enter': entering }">
    <!-- ============== HERO · 顶部 ============== -->
    <section class="columns-hero">
      <div class="columns-hero__text">
        <h3>专家专栏 · 7 位首席工程师的实战经验</h3>
        <p>覆盖终端、网络、载荷、链路、合规、运维与架构等核心方向,周更频率,订阅后可推送最新文章。</p>
      </div>
      <div class="columns-hero__stats">
        <div class="stat-card">
          <b>{{ subscribedCount }}</b><span>我的订阅</span>
        </div>
        <div class="stat-card">
          <b>{{ list.length }}</b><span>可订阅</span>
        </div>
        <div class="stat-card">
          <b>{{ totalSubscribers.toLocaleString() }}</b><span>总订阅数</span>
        </div>
        <div class="stat-card">
          <b>{{ totalReadHours }}</b><span>累计阅读(小时)</span>
        </div>
      </div>
    </section>

    <!-- ============== 视图标签 · 市场 / 我的 ============== -->
    <nav class="columns-view-tabs">
      <button
        class="columns-view-tab"
        :class="{ 'is-active': view === 'market' }"
        @click="switchView('market')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9 5 4h14l2 5M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M9 13a3 3 0 0 0 6 0"/>
        </svg>
        专栏市场
        <span class="columns-view-tab__count">{{ list.length }}</span>
      </button>
      <button
        class="columns-view-tab"
        :class="{ 'is-active': view === 'mine' }"
        @click="switchView('mine')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
        我的订阅
        <span class="columns-view-tab__count">{{ subscribedCount }}</span>
        <span v-if="newArticleCount" class="columns-view-tab__badge">{{ newArticleCount }}</span>
      </button>
    </nav>

    <!-- ============== 市场页 · 工具栏(分类 + 搜索 + 状态) ============== -->
    <div v-if="view === 'market'" class="columns-toolbar">
      <div class="columns-tabs">
        <button class="column-tab" :class="{ 'is-active': filter.category === 'all' }" @click="filter.category = 'all'">
          全部
        </button>
        <button
          v-for="c in categoryList"
          :key="c.key"
          class="column-tab"
          :class="{ 'is-active': filter.category === c.key }"
          @click="filter.category = c.key"
        >
          {{ c.name }}
          <span class="column-tab__count">{{ categoryCount(c.key) }}</span>
        </button>
      </div>

      <div class="columns-toolbar__right">
        <div class="search-input">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input v-model="filter.keyword" placeholder="搜索专栏 / 作者 / 标签" @keyup.enter="reload" />
        </div>
        <!-- 状态筛选:全部 / 已订阅 / 未订阅 -->
        <div class="status-tabs">
          <button
            v-for="s in STATUS_OPTIONS"
            :key="s.value"
            class="status-tab"
            :class="{ 'is-active': filter.status === s.value }"
            @click="filter.status = s.value"
          >
            {{ s.label }}
            <span class="status-tab__count">{{ statusCount(s.value) }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ============== 我的订阅页 · 二级标签(订阅列表 / 近期更新) ============== -->
    <div v-if="view === 'mine' && subscribedCount" class="columns-subtabs">
      <button
        class="columns-subtab"
        :class="{ 'is-active': mineTab === 'columns' }"
        @click="mineTab = 'columns'"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9 5 4h14l2 5M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M9 13a3 3 0 0 0 6 0"/>
        </svg>
        订阅列表
        <span class="columns-subtab__count">{{ subscribedCount }}</span>
      </button>
      <button
        class="columns-subtab"
        :class="{ 'is-active': mineTab === 'recent' }"
        @click="mineTab = 'recent'"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 8v5l3 2"/><circle cx="12" cy="12" r="9"/>
        </svg>
        近期更新
        <span class="columns-subtab__count">{{ recentList.length }}</span>
        <span v-if="newArticleCount" class="columns-subtab__dot" />
      </button>
    </div>

    <!-- ============== 批量管理 · 提示条(订阅列表) ============== -->
    <div v-if="view === 'mine' && mineTab === 'columns' && subscribedCount" class="columns-toolbar columns-toolbar--mine">
      <div class="columns-batch">
        <button v-if="!batchMode" class="btn btn--ghost btn--sm" @click="enterBatch">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          批量管理
        </button>
        <template v-else>
          <button class="btn btn--ghost btn--sm" @click="exitBatch">取消</button>
          <span class="columns-batch__info">已选 {{ selectedIds.size }} / {{ subscribedList.length }}</span>
          <button class="btn btn--ghost btn--sm" :disabled="!selectedIds.size" @click="selectAllInMine">
            {{ selectedIds.size === subscribedList.length ? '取消全选' : '全选' }}
          </button>
          <button
            class="btn btn--danger btn--sm"
            :disabled="!selectedIds.size || batchSaving"
            @click="batchUnsubscribeMine"
          >
            {{ batchSaving ? '处理中…' : '批量取消订阅' }}
          </button>
        </template>
      </div>
      <div v-if="subscribedCount" class="sort-select">
        <label class="sort-select__label">排序</label>
        <select v-model="mineSort" class="sort-select__el" @change="applyMineSort">
          <option v-for="o in MINE_SORT_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </div>
    </div>

    <!-- ============== 近期更新 · 排序 ============== -->
    <div v-if="view === 'mine' && mineTab === 'recent'" class="columns-toolbar columns-toolbar--mine">
      <div class="columns-recent__sort">
        <button
          v-for="o in RECENT_SORT_OPTIONS"
          :key="o.value"
          class="columns-recent__sort-btn"
          :class="{ 'is-active': recentSort === o.value }"
          @click="recentSort = o.value; loadRecent()"
        >
          {{ o.label }}
        </button>
      </div>
    </div>

    <!-- ============== 市场 · 卡片网格 ============== -->
    <section v-if="view === 'market' && !loading && marketList.length" class="columns-grid">
      <article
        v-for="c in marketList"
        :key="c.id"
        class="column-card"
        :class="{
          'column-card--subscribed': c.subscribed,
          'column-card--pulse': pulsingId === c.id,
        }"
        @click="openColumn(c)"
      >
        <header class="column-card__head" :style="{ background: c.cover_color }">
          <span class="column-card__cat">{{ catName(c.category) }}</span>
          <span v-if="c.subscribed" class="column-card__subscribed-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
            已订阅
          </span>
          <div class="column-card__author">
            <span class="column-card__avatar" :style="{ background: c.cover_color }">
              {{ c.author.charAt(0) }}
            </span>
            <div class="column-card__author-text">
              <div class="column-card__name">{{ c.title }}</div>
              <div class="column-card__author-name">{{ c.author }} · {{ c.author_title }}</div>
            </div>
          </div>
        </header>

        <div class="column-card__body">
          <p class="column-card__latest">
            <span class="latest-tag">最新</span>
            {{ c.latest_title }}
          </p>
          <p class="column-card__desc">{{ c.description }}</p>
          <div class="column-card__tags">
            <span v-for="t in c.tags" :key="t" class="column-card__tag">#{{ t }}</span>
          </div>
        </div>

        <footer class="column-card__foot">
          <div class="column-card__metric">
            <b>{{ c.subscribers.toLocaleString() }}</b><span>订阅</span>
          </div>
          <div class="column-card__metric">
            <b>{{ c.articles_count }}</b><span>文章</span>
          </div>
        </footer>

        <div class="column-card__action">
          <button
            v-if="!c.subscribed"
            class="btn btn--primary"
            :disabled="pendingId === c.id"
            @click.stop="askSubscribe(c)"
          >
            <span v-if="pendingId === c.id" class="btn-spinner" />
            <span v-else>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </span>
            {{ pendingId === c.id ? '处理中…' : '订阅' }}
          </button>
          <button
            v-else
            class="btn btn--success"
            :disabled="pendingId === c.id"
            @click.stop="openColumn(c)"
          >
            <span v-if="pendingId === c.id" class="btn-spinner btn-spinner--dark" />
            <span v-else>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </span>
            {{ pendingId === c.id ? '处理中…' : '已订阅 · 进入' }}
          </button>
        </div>
      </article>
    </section>

    <!-- ============== 我的订阅 · 列表(图 2) ============== -->
    <section v-else-if="view === 'mine' && mineTab === 'columns' && sortedSubscribedList.length" class="mine-list-wrap">
      <ul class="mine-list">
        <li
          v-for="c in sortedSubscribedList"
          :key="c.id"
          class="mine-item"
          :class="{
            'mine-item--selected': selectedIds.has(c.id),
            'mine-item--pulse': pulsingId === c.id,
          }"
          @click="onMineItemClick(c)"
        >
          <!-- 批量勾选框 -->
          <div v-if="batchMode" class="mine-item__check" @click.stop>
            <span
              class="mine-item__check-box"
              :class="{ 'is-checked': selectedIds.has(c.id) }"
              @click="toggleSelect(c.id)"
            >
              <svg v-if="selectedIds.has(c.id)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </span>
          </div>

          <!-- 封面缩略 -->
          <div class="mine-item__cover" :style="{ background: c.cover_color }">
            <span>{{ c.author.charAt(0) }}</span>
          </div>

          <!-- 主体 -->
          <div class="mine-item__body">
            <div class="mine-item__row1">
              <span class="mine-item__cat" :style="{ background: c.cover_color }">{{ catName(c.category) }}</span>
              <h5 class="mine-item__name">{{ c.title }}</h5>
              <span v-if="c.has_new" class="mine-item__new-badge">NEW</span>
            </div>
            <p class="mine-item__latest">
              <span class="mine-item__latest-label">最新</span>
              {{ c.latest_title }}
            </p>
            <div class="mine-item__meta">
              <span>{{ c.author }} · {{ c.author_title }}</span>
              <span class="mine-item__sep">·</span>
              <span>订阅于 {{ formatSubTime(c.subscribed_at) }}</span>
              <span class="mine-item__sep">·</span>
              <span>共 {{ c.articles_count }} 篇</span>
            </div>
          </div>

          <!-- 数据列 -->
          <div class="mine-item__metrics">
            <div class="mine-item__metric">
              <b>{{ c.subscribers.toLocaleString() }}</b>
              <span>订阅</span>
            </div>
            <div class="mine-item__metric">
              <b>{{ c.likes?.toLocaleString() || '—' }}</b>
              <span>获赞</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div v-if="!batchMode" class="mine-item__action" @click.stop>
            <button class="btn btn--ghost btn--sm" @click="openColumnArticles(c)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              进入
            </button>
            <button class="btn btn--ghost btn--sm" :disabled="pendingId === c.id" @click="quickToggle(c)">
              <span v-if="pendingId === c.id" class="btn-spinner btn-spinner--dark btn-spinner--xs" />
              <span v-else>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </span>
              取消
            </button>
          </div>
        </li>
      </ul>
    </section>

    <!-- ============== 近期更新 · 简洁列表(图 3) ============== -->
    <section v-else-if="view === 'mine' && mineTab === 'recent'" class="recent-wrap">
      <div class="recent-head">
        <h4>近期更新</h4>
        <p>已订阅专栏的最新文章, 按发布时间倒序</p>
      </div>
      <ul v-if="recentList.length" class="recent-list">
        <li
          v-for="a in recentList"
          :key="a.id"
          class="recent-item"
          :class="{ 'recent-item--unseen': isUnseen(a) }"
          @click="openArticle(a)"
        >
          <div class="recent-item__date">
            <b>{{ formatDayShort(a.published_at) }}</b>
            <span>{{ formatYearMonth(a.published_at) }}</span>
          </div>
          <div class="recent-item__main">
            <div class="recent-item__row1">
              <span class="recent-item__column">{{ a.column_title }}</span>
              <span v-if="isUnseen(a)" class="recent-item__badge">新</span>
            </div>
            <h5 class="recent-item__title">{{ a.title }}</h5>
            <p class="recent-item__brief">
              {{ briefFromArticle(a) }}
            </p>
            <div class="recent-item__meta">
              <span>{{ a.author }} · {{ a.author_title }}</span>
              <span class="recent-item__sep">·</span>
              <span>{{ formatDateTime(a.published_at) }}</span>
              <span class="recent-item__sep">·</span>
              <span>{{ a.reading_minutes }} 分钟</span>
            </div>
          </div>
          <span class="recent-item__arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </span>
        </li>
      </ul>
      <div v-else-if="loadingRecent" class="columns-loading">
        <div class="spinner" />
        <span>正在加载更新…</span>
      </div>
      <div v-else class="columns-empty">
        <div class="columns-empty__icon">📭</div>
        <h4>暂无更新</h4>
        <p>订阅的专栏有新文章时, 会自动汇总到这里</p>
      </div>
    </section>

    <!-- ============== LOADING / EMPTY ============== -->
    <div v-else-if="loading" class="columns-loading">
      <div class="spinner" />
      <span>正在加载专栏...</span>
    </div>

    <div v-else-if="view === 'market'" class="columns-empty">
      <div class="columns-empty__icon">📰</div>
      <h4>没有匹配的专栏</h4>
      <p>尝试调整关键词或切换其他分类</p>
    </div>

    <div v-else-if="view === 'mine'" class="columns-empty">
      <div class="columns-empty__icon">🔖</div>
      <h4>还没有订阅任何专栏</h4>
      <p>前往「专栏市场」挑选感兴趣的方向, 订阅后即可在这里收到更新推送</p>
      <button class="btn btn--primary btn--sm" @click="view = 'market'">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9 5 4h14l2 5M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M9 13a3 3 0 0 0 6 0"/>
        </svg>
        前往专栏市场
      </button>
    </div>

    <!-- ============== TOAST (subtle in-page banner) ============== -->
    <Transition name="banner">
      <div v-if="toast" class="columns-toast" :class="`columns-toast--${toast.type}`">
        <span class="columns-toast__icon" v-html="toastIcon" />
        <span class="columns-toast__text">{{ toast.text }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  listColumns,
  subscribeColumn,
  unsubscribeColumn,
  getRecentArticles,
} from '@/api/smart-center'
import { MOCK } from '@/api/mock-data'
import { useColumnSubscriptions } from '@/composables/useColumnSubscriptions'
import { ElMessage } from 'element-plus'

const router = useRouter()

const CATEGORY_LABELS = {
  terminal: '终端', network: '网络', payload: '载荷',
  e2e: '全链路', ops: '运维运营', ai: 'AI 与算法',
}
function catName(k) { return CATEGORY_LABELS[k] || k }

const STATUS_OPTIONS = [
  { value: 'all',        label: '全部' },
  { value: 'subscribed', label: '已订阅' },
  { value: 'unsubscribed', label: '未订阅' },
]
const RECENT_SORT_OPTIONS = [
  { value: 'latest',  label: '最近更新' },
  { value: 'popular', label: '最受欢迎' },
]
const MINE_SORT_OPTIONS = [
  { value: 'latest',   label: '最近更新' },
  { value: 'subscribed', label: '订阅时间' },
  { value: 'name',     label: '专栏名称' },
]

const entering = ref(false)
const loading = ref(false)
const loadingRecent = ref(false)
const list = ref([])
const view = ref('market') // 'market' | 'mine'
const mineTab = ref('columns') // 'columns' | 'recent'
const recentSort = ref('latest')
const mineSort = ref('latest')
const recentList = ref([])
const categoryList = ref(Object.entries(CATEGORY_LABELS).map(([key, name]) => ({ key, name })))

const filter = reactive({ category: 'all', keyword: '', status: 'all' })

const {
  store: subs,
  subscribe,
  unsubscribe,
  isSubscribed,
  batchUnsubscribe: batchUnsubscribeStore,
} = useColumnSubscriptions()

/* === 订阅请求态 (单条) === */
const pendingId = ref(null)
const pulsingId = ref(null)

function pulse(id) {
  pulsingId.value = id
  setTimeout(() => {
    if (pulsingId.value === id) pulsingId.value = null
  }, 700)
}

/* === 顶部 Toast Banner === */
const toast = ref(null)
let toastTimer = null
const toastIcon = computed(() => {
  if (!toast.value) return ''
  if (toast.value.type === 'success') {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
  }
  if (toast.value.type === 'error') {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>'
  }
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>'
})
function showToast(text, type = 'info', duration = 2200) {
  toast.value = { text, type }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value = null
  }, duration)
}

/* === 列表 (注入订阅状态) === */
const marketList = computed(() => list.value.map((c) => ({
  ...c,
  subscribed: isSubscribed(c.id),
})))

/* 列表 + 状态过滤(全部/已订阅/未订阅) */
const filteredMarketList = computed(() => {
  let arr = marketList.value
  if (filter.status === 'subscribed')   arr = arr.filter((c) => c.subscribed)
  if (filter.status === 'unsubscribed') arr = arr.filter((c) => !c.subscribed)
  return arr
})

const subscribedList = computed(() => list.value
  .filter((c) => isSubscribed(c.id))
  .map((c) => {
    const r = subs.value[c.id] || {}
    return {
      ...c,
      subscribed: true,
      subscribed_at: r,
      /* 「新文章」= 订阅后产生的文章:published_at > subscribed_at */
      has_new: hasNewSinceSub(c, r),
    }
  }),
)

/* 排序:最近更新 / 订阅时间 / 专栏名称 */
const sortedSubscribedList = computed(() => {
  const arr = [...subscribedList.value]
  if (mineSort.value === 'subscribed') {
    arr.sort((a, b) => (b.subscribed_at || 0) - (a.subscribed_at || 0))
  } else if (mineSort.value === 'name') {
    arr.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  } else {
    /* default: latest - 按专栏 latest_at 倒序 */
    arr.sort((a, b) => {
      const at = new Date(a.latest_at || 0).getTime()
      const bt = new Date(b.latest_at || 0).getTime()
      return bt - at
    })
  }
  return arr
})

const subscribedCount = computed(() => subscribedList.value.length)
const totalArticles    = computed(() => list.value.reduce((s, c) => s + (c.articles_count || 0), 0))
const totalSubscribers = computed(() => list.value.reduce((s, c) => s + (c.subscribers || 0), 0))
const totalReadHours   = computed(() => Math.round(totalArticles.value * 0.5))
const newArticleCount  = computed(() => subscribedList.value.filter((c) => c.has_new).length)

function categoryCount(key) {
  if (key === 'all') return list.value.length
  return list.value.filter((c) => c.category === key).length
}
function statusCount(s) {
  if (s === 'subscribed')   return list.value.filter((c) => isSubscribed(c.id)).length
  if (s === 'unsubscribed') return list.value.filter((c) => !isSubscribed(c.id)).length
  return list.value.length
}

/**
 * 「订阅后产生的新文章」判定:
 *   - 若专栏有 latest_at 且晚于 subscribed_at,则有新文章
 *   - 否则降级到 hasNew(若有) / false
 */
function hasNewSinceSub(column, subscribedAt) {
  if (!subscribedAt) return false
  if (column?.latest_at) {
    return new Date(column.latest_at).getTime() > subscribedAt
  }
  return false
}

/* === 视图切换 === */
function switchView(v) {
  view.value = v
  if (v === 'mine') {
    mineTab.value = 'columns'
    exitBatch()
    if (recentList.value.length === 0) loadRecent()
  } else {
    exitBatch()
  }
}

function applyMineSort() { /* computed 自动重算,留作后续扩展 */ }

async function reload() {
  loading.value = true
  try {
    const data = await listColumns({ category: filter.category, keyword: filter.keyword })
    list.value = data.list
  } catch (e) {
    showToast('专栏列表加载失败', 'error')
  } finally {
    loading.value = false
  }
}

async function loadRecent() {
  loadingRecent.value = true
  try {
    const ids = subscribedList.value.map((c) => c.id)
    const data = await getRecentArticles({
      ids: ids.join(','),
      sort: recentSort.value,
      limit: 30,
    })
    const items = Array.isArray(data) ? data : (data?.items || [])
    recentList.value = items
  } catch (e) {
    recentList.value = []
  } finally {
    loadingRecent.value = false
  }
}

function isUnseen(a) {
  const r = subs.value[a.column_id]
  if (!r) return false
  /* v3: 仅保留 subscribed_at;"未读"= 订阅后产生的文章 */
  return new Date(a.published_at).getTime() > r
}

/* === 跳转文章详情 === */
function openArticle(a) {
  router.push(`/columns/article/${a.id}`)
}

/**
 * 卡片 / 列表项点击:进入专栏详情页(/columns/:id),
 * 由 ColumnDetail.vue 提供该专栏的完整文章列表。
 */
function openColumn(c) {
  router.push(`/columns/${c.id}`)
}
function openColumnArticles(c) {
  router.push(`/columns/${c.id}`)
}

/* === 直接订阅(无弹窗,点击即订阅) === */
async function doSubscribe(c) {
  pendingId.value = c.id
  const idx = list.value.findIndex((x) => x.id === c.id)
  const beforeSubs = idx >= 0 ? list.value[idx].subscribers : 0
  if (idx >= 0) list.value[idx] = { ...list.value[idx], subscribers: beforeSubs + 1 }
  try {
    await subscribeColumn(c.id)
    subscribe(c.id)
    pulse(c.id)
    showToast(`已订阅「${c.title}」`, 'success')
    ElMessage.success(`已订阅「${c.title}」`)
  } catch (e) {
    if (idx >= 0) list.value[idx] = { ...list.value[idx], subscribers: beforeSubs }
    showToast(`订阅失败, 请稍后重试`, 'error')
    ElMessage.error('订阅失败, 请稍后重试')
  } finally {
    pendingId.value = null
  }
}

async function doUnsubscribe(c) {
  pendingId.value = c.id
  const idx = list.value.findIndex((x) => x.id === c.id)
  const beforeSubs = idx >= 0 ? list.value[idx].subscribers : 0
  if (idx >= 0) list.value[idx] = { ...list.value[idx], subscribers: Math.max(0, beforeSubs - 1) }
  try {
    await unsubscribeColumn(c.id)
    unsubscribe(c.id)
    showToast(`已取消订阅「${c.title}」`, 'info')
    ElMessage.info(`已取消订阅「${c.title}」`)
  } catch (e) {
    if (idx >= 0) list.value[idx] = { ...list.value[idx], subscribers: beforeSubs }
    showToast(`取消订阅失败, 请稍后重试`, 'error')
    ElMessage.error('取消订阅失败, 请稍后重试')
  } finally {
    pendingId.value = null
  }
}

/**
 * 市场卡片的"订阅/已订阅"按钮逻辑:
 *   - 未订阅 → 直接订阅
 *   - 已订阅 → 跳转到专栏详情(不再二次确认)
 */
async function askSubscribe(c) {
  if (isSubscribed(c.id)) {
    openColumn(c)
  } else {
    await doSubscribe(c)
  }
}

async function quickToggle(c) {
  if (isSubscribed(c.id)) {
    await doUnsubscribe(c)
  } else {
    await doSubscribe(c)
  }
}

/* === 批量管理模式 === */
const batchMode = ref(false)
const selectedIds = ref(new Set())
const batchSaving = ref(false)
function enterBatch() {
  batchMode.value = true
  selectedIds.value = new Set()
}
function exitBatch() {
  batchMode.value = false
  selectedIds.value = new Set()
}
function selectAllInMine() {
  if (selectedIds.value.size === sortedSubscribedList.value.length) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(sortedSubscribedList.value.map((c) => c.id))
  }
}
function toggleSelect(id) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
  /* 触发响应式更新 */
  selectedIds.value = new Set(selectedIds.value)
}
function onMineItemClick(c) {
  if (batchMode.value) {
    toggleSelect(c.id)
  } else {
    openColumnArticles(c)
  }
}

async function batchUnsubscribeMine() {
  if (!selectedIds.value.size) return
  batchSaving.value = true
  const ids = Array.from(selectedIds.value)
  await Promise.all(ids.map((id) => unsubscribeColumn(id).catch(() => null)))
  batchUnsubscribeStore(ids)
  showToast(`已取消订阅 ${ids.length} 个专栏`, 'success')
  ElMessage.success(`已取消订阅 ${ids.length} 个专栏`)
  exitBatch()
  if (mineTab.value === 'recent') loadRecent()
  batchSaving.value = false
}

/* === 时间格式化 === */
function formatDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toISOString().slice(0, 10)
}
function formatDateTime(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  const now = new Date()
  const diffMs = now - d
  const day = 24 * 60 * 60 * 1000
  if (diffMs < 60 * 1000) return '刚刚'
  if (diffMs < 3600 * 1000) return Math.floor(diffMs / 60000) + ' 分钟前'
  if (diffMs < day) return Math.floor(diffMs / 3600000) + ' 小时前'
  if (diffMs < day * 7) return Math.floor(diffMs / day) + ' 天前'
  return d.toISOString().slice(0, 10)
}
function formatSubTime(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  const now = new Date()
  const diffMs = now - d
  const day = 24 * 60 * 60 * 1000
  if (diffMs < day) return '今天'
  if (diffMs < day * 7) return Math.floor(diffMs / day) + ' 天前'
  return d.toISOString().slice(0, 10)
}
function formatDayShort(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  return `${String(d.getDate()).padStart(2, '0')}`
}
function formatYearMonth(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

function briefFromArticle(a) {
  /* 优先从 mock 内容池取摘要(降级为作者 + 标题) */
  const content = MOCK.articlesContent?.[a.id]
  if (content?.summary) {
    return content.summary.length > 80 ? content.summary.slice(0, 78) + '…' : content.summary
  }
  return `${a.author} · ${a.column_title} 最新文章, ${a.reading_minutes} 分钟阅读, 欢迎阅读全文。`
}

watch(() => filter.category, () => reload())
let kwT
watch(() => filter.keyword, () => {
  clearTimeout(kwT)
  kwT = setTimeout(reload, 250)
})
watch(
  () => mineTab.value,
  (v) => {
    if (v === 'recent' && recentList.value.length === 0) loadRecent()
  },
)

onMounted(async () => {
  requestAnimationFrame(() => (entering.value = true))
  await reload()
})
onUnmounted(() => {
  entering.value = false
  if (toastTimer) clearTimeout(toastTimer)
})
</script>

<style scoped>
.page { padding: 24px 32px 40px; }

/* ============== HERO ============== */
.columns-hero {
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
  padding: 22px 28px; margin-bottom: 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--accent-soft) 0%, transparent 60%), var(--surface);
  border: 1px solid var(--line);
}
.columns-hero__text h3 { font-size: 18px; margin: 0 0 4px; font-weight: 600; }
.columns-hero__text p  { margin: 0; font-size: 13px; color: var(--ink-3); line-height: 1.6; }
.columns-hero__stats   { display: flex; gap: 10px; }
.stat-card {
  display: flex; flex-direction: column; gap: 2px;
  padding: 10px 18px; border-radius: 12px; min-width: 96px;
  background: var(--surface-2); border: 1px solid var(--line); text-align: center;
}
.stat-card b { font-size: 18px; font-weight: 600; color: var(--accent); }
.stat-card span { font-size: 11px; color: var(--ink-3); }

/* ============== VIEW TABS ============== */
.columns-view-tabs {
  display: flex; gap: 6px; padding: 4px;
  background: var(--surface-2); border: 1px solid var(--line);
  border-radius: 12px; margin-bottom: 16px;
  width: fit-content;
}
.columns-view-tab {
  position: relative; display: inline-flex; align-items: center; gap: 8px;
  padding: 9px 18px; border: 0; background: transparent;
  border-radius: 8px; font-size: 13px; font-weight: 500;
  color: var(--ink-2); cursor: pointer;
  transition: all 0.18s;
}
.columns-view-tab svg { width: 16px; height: 16px; }
.columns-view-tab:hover { color: var(--ink); }
.columns-view-tab.is-active {
  background: var(--surface);
  color: var(--accent);
  box-shadow: 0 2px 6px color-mix(in srgb, var(--accent) 14%, transparent);
}
.columns-view-tab__count {
  font-size: 10.5px; padding: 1px 7px; border-radius: 999px;
  background: var(--surface); color: var(--ink-3); font-weight: 600;
}
.columns-view-tab.is-active .columns-view-tab__count {
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  color: var(--accent);
}
.columns-view-tab__badge {
  position: absolute; top: -4px; right: -4px;
  min-width: 16px; height: 16px; padding: 0 4px;
  border-radius: 999px;
  background: #ef4444; color: #fff;
  font-size: 10px; font-weight: 600;
  display: grid; place-items: center;
  box-shadow: 0 0 0 2px var(--surface-2);
}

/* ============== MINE SUB-TABS ============== */
.columns-subtabs {
  display: flex; gap: 4px; margin: -8px 0 14px;
  border-bottom: 1px solid var(--line-2);
}
.columns-subtab {
  position: relative; display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; border: 0; background: transparent;
  font-size: 12.5px; font-weight: 500;
  color: var(--ink-3); cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all var(--dur-fast) var(--ease);
}
.columns-subtab svg { width: 14px; height: 14px; }
.columns-subtab:hover { color: var(--ink-2); }
.columns-subtab.is-active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}
.columns-subtab__count {
  font-size: 10px; padding: 1px 6px; border-radius: 999px;
  background: var(--surface-2); color: var(--ink-3); font-weight: 600;
}
.columns-subtab.is-active .columns-subtab__count {
  background: var(--accent-soft); color: var(--accent);
}
.columns-subtab__dot {
  position: absolute; top: 6px; right: 0;
  width: 6px; height: 6px; border-radius: 50%;
  background: #ef4444;
  box-shadow: 0 0 0 2px var(--surface);
}

/* ============== TOOLBAR ============== */
.columns-toolbar {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 18px;
}
.columns-toolbar--mine { justify-content: space-between; }
.columns-toolbar__right {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
}

.columns-tabs { display: flex; gap: 6px; flex-wrap: wrap; flex: 1; }
.column-tab {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 999px; font-size: 12.5px;
  background: var(--surface); color: var(--ink-2);
  border: 1px solid var(--line); cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
}
.column-tab:hover { background: var(--surface-2); }
.column-tab.is-active { background: var(--accent); color: #fff; border-color: var(--accent); }
.column-tab__count {
  font-size: 10px; padding: 1px 6px; border-radius: 999px;
  background: rgba(255,255,255,0.2); font-weight: 600;
}
.column-tab:not(.is-active) .column-tab__count {
  background: var(--surface-2); color: var(--ink-3);
}

.search-input {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 10px;
  background: var(--surface); border: 1px solid var(--line);
  width: 280px;
}
.search-input svg { width: 16px; height: 16px; color: var(--ink-3); flex-shrink: 0; }
.search-input input { flex: 1; background: transparent; border: 0; outline: 0; font-size: 12.5px; color: var(--ink); }

/* ========== 状态筛选(图 1 右侧) ========== */
.status-tabs {
  display: flex; gap: 0;
  background: var(--surface); border: 1px solid var(--line);
  border-radius: 10px; padding: 3px;
}
.status-tab {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px; border: 0; background: transparent;
  border-radius: 7px; font-size: 12px; font-weight: 500;
  color: var(--ink-3); cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
}
.status-tab:hover { color: var(--ink-2); }
.status-tab.is-active {
  background: var(--surface-2); color: var(--accent);
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.status-tab__count {
  font-size: 10px; padding: 0 5px; border-radius: 999px;
  background: var(--surface-2); color: var(--ink-3); font-weight: 600;
}
.status-tab.is-active .status-tab__count {
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  color: var(--accent);
}

/* ========== 排序(我的订阅 + 近期更新) ========== */
.sort-select {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--ink-3);
}
.sort-select__label { font-weight: 500; }
.sort-select__el {
  padding: 5px 22px 5px 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  color: var(--ink);
  font-size: 12px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='m6 9 6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 6px center;
  background-size: 12px;
}
.sort-select__el:focus {
  outline: none; border-color: var(--accent);
}

.columns-recent__sort { display: flex; gap: 4px; margin-left: auto; }
.columns-recent__sort-btn {
  padding: 5px 12px; border-radius: 999px;
  font-size: 11.5px; font-weight: 500;
  background: var(--surface-2); color: var(--ink-2);
  border: 1px solid var(--line); cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
}
.columns-recent__sort-btn:hover { background: var(--surface); }
.columns-recent__sort-btn.is-active {
  background: var(--accent); color: #fff; border-color: var(--accent);
}

/* ========== 批量管理 ========== */
.columns-batch { display: flex; align-items: center; gap: 8px; }
.columns-batch__info {
  font-size: 12px; color: var(--ink-3);
  padding: 0 6px;
}

/* ============== MARKET GRID ============== */
.columns-grid {
  display: grid; gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}
.column-card {
  position: relative;
  background: var(--surface); border: 1px solid var(--line); border-radius: 14px;
  overflow: hidden; cursor: pointer;
  display: flex; flex-direction: column;
  transition: all var(--dur-fast) var(--ease);
}
.column-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  border-color: var(--accent);
}
.column-card--subscribed {
  border-color: color-mix(in srgb, var(--accent) 30%, var(--line));
  background: linear-gradient(180deg,
    color-mix(in srgb, var(--accent) 4%, var(--surface)) 0%,
    var(--surface) 80%);
}
.column-card--pulse {
  animation: cardPulse 0.7s var(--ease);
}
@keyframes cardPulse {
  0%   { box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 50%, transparent); }
  60%  { box-shadow: 0 0 0 8px color-mix(in srgb, var(--accent) 0%, transparent); }
  100% { box-shadow: 0 0 0 0 transparent; }
}
.column-card__head {
  position: relative; padding: 18px;
  min-height: 130px;
  display: flex; flex-direction: column; justify-content: space-between;
}
.column-card__head::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.25) 100%);
}
.column-card__cat {
  position: relative; z-index: 1;
  align-self: flex-start;
  padding: 3px 9px; border-radius: 999px;
  font-size: 10.5px; font-weight: 500;
  background: rgba(255,255,255,0.85); color: var(--ink);
  backdrop-filter: blur(8px);
}
.column-card__subscribed-pill {
  position: absolute; top: 14px; right: 14px; z-index: 1;
  display: inline-flex; align-items: center; gap: 3px;
  padding: 3px 8px; border-radius: 999px;
  background: rgba(255,255,255,0.95); color: #16a34a;
  font-size: 10.5px; font-weight: 600;
  backdrop-filter: blur(8px);
}
.column-card__subscribed-pill svg { width: 12px; height: 12px; }
.column-card__author {
  position: relative; z-index: 1;
  display: flex; align-items: center; gap: 10px;
}
.column-card__avatar {
  width: 36px; height: 36px; border-radius: 50%;
  display: grid; place-items: center;
  color: #fff; font-size: 14px; font-weight: 600;
  border: 2px solid rgba(255,255,255,0.6);
}
.column-card__author-text { color: #fff; }
.column-card__name { font-size: 15px; font-weight: 600; line-height: 1.3; color: #fff; }
.column-card__author-name { font-size: 11px; opacity: 0.85; }

.column-card__body { padding: 14px 16px 12px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
.column-card__latest {
  margin: 0; font-size: 12.5px; color: var(--ink); line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.latest-tag {
  display: inline-block; padding: 1px 6px; border-radius: 4px;
  background: var(--accent-soft); color: var(--accent);
  font-size: 10px; font-weight: 600; margin-right: 4px;
}
.column-card__desc {
  margin: 0; font-size: 11.5px; color: var(--ink-3); line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.column-card__tags { display: flex; gap: 4px; flex-wrap: wrap; }
.column-card__tag {
  font-size: 10.5px; padding: 2px 7px; border-radius: 6px;
  background: var(--surface-2); color: var(--ink-3); font-weight: 500;
}
.column-card__foot {
  display: flex; gap: 12px; padding: 10px 16px 0; border-top: 1px solid var(--line-2);
  margin: 0 0 4px;
}
.column-card__metric { display: flex; flex-direction: column; gap: 1px; }
.column-card__metric b { font-size: 14px; font-weight: 600; }
.column-card__metric span { font-size: 10.5px; color: var(--ink-3); }

.column-card__action { padding: 10px 16px 14px; }
.column-card__action .btn { width: 100%; justify-content: center; }

/* ============== MINE LIST(图 2) ============== */
.mine-list-wrap {
  background: var(--surface); border: 1px solid var(--line);
  border-radius: 14px; overflow: hidden;
}
.mine-list { list-style: none; padding: 0; margin: 0; }
.mine-item {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--line-2);
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease);
}
.mine-item:last-child { border-bottom: 0; }
.mine-item:hover { background: var(--surface-2); }
.mine-item--selected {
  background: color-mix(in srgb, var(--accent) 6%, var(--surface));
}
.mine-item--pulse {
  animation: cardPulse 0.7s var(--ease);
}

.mine-item__check { flex-shrink: 0; }
.mine-item__check-box {
  display: grid; place-items: center;
  width: 18px; height: 18px; border-radius: 5px;
  background: var(--surface); border: 1.5px solid var(--line);
  color: #fff;
  transition: all var(--dur-fast) var(--ease);
  cursor: pointer;
}
.mine-item__check-box.is-checked {
  background: var(--accent); border-color: var(--accent);
}
.mine-item__check-box svg { width: 12px; height: 12px; }

.mine-item__cover {
  width: 56px; height: 56px; border-radius: 10px;
  display: grid; place-items: center;
  color: #fff; font-size: 22px; font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 4px 10px color-mix(in srgb, currentColor 20%, transparent);
}

.mine-item__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.mine-item__row1 {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.mine-item__cat {
  padding: 2px 8px; border-radius: 999px;
  color: #fff; font-size: 10.5px; font-weight: 600;
}
.mine-item__name {
  margin: 0; font-size: 14.5px; font-weight: 600;
  color: var(--ink); letter-spacing: 0.1px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 320px;
}
.mine-item__new-badge {
  font-size: 9.5px; padding: 1px 6px; border-radius: 4px;
  background: #ef4444; color: #fff; font-weight: 700; letter-spacing: 0.3px;
}
.mine-item__latest {
  margin: 0; font-size: 12.5px; color: var(--ink-2); line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
}
.mine-item__latest-label {
  display: inline-block; padding: 1px 6px; margin-right: 4px;
  background: var(--accent-soft); color: var(--accent);
  font-size: 10px; font-weight: 600; border-radius: 4px;
}
.mine-item__meta {
  display: flex; gap: 6px; font-size: 11px; color: var(--ink-3); flex-wrap: wrap;
}
.mine-item__sep { color: var(--line-2); }

.mine-item__metrics {
  display: flex; gap: 18px; flex-shrink: 0;
  padding: 0 6px;
  border-left: 1px solid var(--line-2);
  border-right: 1px solid var(--line-2);
  margin-right: 4px;
}
.mine-item__metric {
  display: flex; flex-direction: column; gap: 1px; text-align: center;
  min-width: 56px;
}
.mine-item__metric b { font-size: 14px; font-weight: 600; color: var(--ink); }
.mine-item__metric span { font-size: 10.5px; color: var(--ink-3); }

.mine-item__action {
  display: flex; gap: 6px; flex-shrink: 0;
}

/* ============== RECENT LIST(图 3) ============== */
.recent-wrap {
  background: var(--surface); border: 1px solid var(--line);
  border-radius: 14px;
  display: flex; flex-direction: column;
}
.recent-head {
  padding: 16px 20px; border-bottom: 1px solid var(--line-2);
}
.recent-head h4 { margin: 0; font-size: 15px; font-weight: 600; }
.recent-head p  { margin: 4px 0 0; font-size: 11.5px; color: var(--ink-3); }

.recent-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; }
.recent-item {
  display: flex; align-items: center; gap: 16px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--line-2);
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease);
}
.recent-item:last-child { border-bottom: 0; }
.recent-item:hover { background: var(--surface-2); }
.recent-item--unseen {
  background: color-mix(in srgb, var(--accent) 5%, var(--surface));
}

.recent-item__date {
  display: flex; flex-direction: column; align-items: center;
  width: 56px; flex-shrink: 0;
  padding: 8px 0; border-radius: 8px;
  background: var(--surface-2);
}
.recent-item__date b { font-size: 18px; font-weight: 700; color: var(--ink); line-height: 1; }
.recent-item__date span { font-size: 10px; color: var(--ink-3); margin-top: 2px; }
.recent-item--unseen .recent-item__date { background: var(--accent-soft); }
.recent-item--unseen .recent-item__date b { color: var(--accent); }

.recent-item__main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.recent-item__row1 { display: flex; align-items: center; gap: 6px; }
.recent-item__column {
  font-size: 10.5px; padding: 1px 7px; border-radius: 4px;
  background: var(--accent-soft); color: var(--accent);
  font-weight: 600;
}
.recent-item__badge {
  font-size: 9.5px; padding: 1px 5px; border-radius: 4px;
  background: #ef4444; color: #fff; font-weight: 700;
}
.recent-item__title {
  margin: 0; font-size: 14px; font-weight: 600;
  color: var(--ink); line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 1;
  -webkit-box-orient: vertical; overflow: hidden;
}
.recent-item__brief {
  margin: 0; font-size: 12px; color: var(--ink-3); line-height: 1.6;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}
.recent-item__meta {
  display: flex; gap: 6px; font-size: 11px; color: var(--ink-3);
  flex-wrap: wrap; margin-top: 2px;
}
.recent-item__sep { color: var(--line-2); }
.recent-item__arrow { color: var(--ink-3); flex-shrink: 0; transition: all var(--dur-fast) var(--ease); }
.recent-item__arrow svg { width: 16px; height: 16px; }
.recent-item:hover .recent-item__arrow { color: var(--accent); transform: translateX(2px); }

/* ============== LOADING / EMPTY ============== */
.columns-loading, .columns-empty {
  margin: 60px auto; padding: 40px 32px; max-width: 480px; text-align: center;
  border: 1px dashed var(--line); border-radius: 16px; background: var(--surface-2);
}
.spinner {
  width: 36px; height: 36px; border-radius: 50%;
  border: 3px solid var(--line); border-top-color: var(--accent);
  animation: spin 0.8s linear infinite; margin: 0 auto 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.columns-empty__icon { font-size: 48px; margin-bottom: 8px; opacity: 0.6; }
.columns-empty h4    { margin: 0; font-size: 15px; }
.columns-empty p     { margin: 6px 0 14px; font-size: 12.5px; color: var(--ink-3); }

/* ============== TOAST BANNER ============== */
.columns-toast {
  position: fixed; left: 50%; bottom: 28px;
  transform: translateX(-50%);
  display: flex; align-items: center; gap: 8px;
  padding: 10px 16px; border-radius: 999px;
  background: var(--surface); color: var(--ink);
  border: 1px solid var(--line);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  font-size: 13px; font-weight: 500;
  z-index: 2400;
}
.columns-toast__icon { display: inline-flex; width: 18px; height: 18px; }
.columns-toast__icon :deep(svg) { width: 18px; height: 18px; }
.columns-toast--success { color: #16a34a; }
.columns-toast--success .columns-toast__icon { color: #16a34a; }
.columns-toast--error   { color: #ef4444; }
.columns-toast--error   .columns-toast__icon { color: #ef4444; }
.columns-toast--info    .columns-toast__icon { color: var(--accent); }

.banner-enter-active, .banner-leave-active { transition: all 0.24s var(--ease); }
.banner-enter-from, .banner-leave-to {
  opacity: 0; transform: translateX(-50%) translateY(12px);
}

/* ============== BUTTONS ============== */
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 10px; font-size: 13px;
  border: 1px solid var(--line); background: var(--surface);
  color: var(--ink-2); cursor: pointer; transition: all var(--dur-fast) var(--ease);
}
.btn svg { width: 14px; height: 14px; }
.btn:disabled { opacity: 0.65; cursor: not-allowed; }
.btn--sm { padding: 5px 11px; font-size: 12px; }
.btn--ghost:hover { background: var(--surface-2); color: var(--ink); }
.btn--primary { background: var(--accent); color: #fff; border-color: var(--accent); }
.btn--primary:hover:not(:disabled) { filter: brightness(1.08); }
.btn--success { color: #16a34a; border-color: color-mix(in srgb, #16a34a 30%, var(--line)); }
.btn--success:hover:not(:disabled) {
  background: color-mix(in srgb, #16a34a 6%, var(--surface));
  border-color: color-mix(in srgb, #16a34a 50%, var(--line));
}
.btn--danger { color: #ef4444; border-color: color-mix(in srgb, #ef4444 30%, var(--line)); }
.btn--danger:hover:not(:disabled) {
  background: color-mix(in srgb, #ef4444 6%, var(--surface));
  border-color: color-mix(in srgb, #ef4444 50%, var(--line));
}

.btn-spinner {
  display: inline-block;
  width: 12px; height: 12px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  animation: spin 0.7s linear infinite;
}
.btn-spinner--xs { width: 10px; height: 10px; }
.btn-spinner--dark {
  border-color: color-mix(in srgb, var(--ink-3) 30%, transparent);
  border-top-color: var(--ink-2);
}

/* ============== VIEW ENTER ANIMATION ============== */
.view-enter { animation: viewFadeIn 0.3s var(--ease); }
@keyframes viewFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ============== RESPONSIVE ============== */
@media (max-width: 960px) {
  .columns-hero { flex-direction: column; align-items: flex-start; }
  .columns-hero__stats { width: 100%; flex-wrap: wrap; }
  .search-input { width: 100%; }
  .columns-toolbar__right { width: 100%; }
  .status-tabs { width: 100%; justify-content: space-between; }
  .status-tab { flex: 1; justify-content: center; }
  .mine-item__metrics { display: none; }
  .columns-toolbar--mine { flex-direction: column; align-items: stretch; }
  .columns-recent__sort { width: 100%; justify-content: flex-start; }
}
</style>
