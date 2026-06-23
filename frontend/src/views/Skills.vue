<template>
  <div class="page page-skills" :class="{ 'view-enter': entering }">
    <!-- ============== HERO ============== -->
    <section class="skills-hero">
      <div class="skills-hero__text">
        <h3>技能 · 原子化能力,即插即用</h3>
        <p>覆盖终端诊断、网络优化、载荷监控、全链路分析等场景,可被任何数字员工调用。</p>
      </div>
      <div class="skills-hero__stats">
        <div class="stat-card">
          <b>{{ list.length }}</b><span>在售技能</span>
        </div>
        <div class="stat-card">
          <b>{{ formatNum(totalUsage) }}</b><span>累计调用</span>
        </div>
        <div class="stat-card">
          <b>{{ totalLinked }}</b><span>智能体关联</span>
        </div>
        <div class="stat-card">
          <b>{{ draftCount }}</b><span>待发布</span>
        </div>
      </div>
    </section>

    <!-- ============== TOOLBAR ============== -->
    <div class="skills-toolbar">
      <div class="skills-toolbar__left">
        <!-- 来源切换: 系统内置 vs 我的技能 -->
        <div class="skills-type-tabs">
          <button
            class="skills-type-tab"
            :class="{ 'is-active': typeTab === 'builtin' }"
            @click="setTypeTab('builtin')"
          >
            内置技能
            <span v-if="builtinList.length" class="skills-type-tab__count">{{ builtinList.length }}</span>
          </button>
          <button
            class="skills-type-tab"
            :class="{ 'is-active': typeTab === 'custom' }"
            @click="setTypeTab('custom')"
          >
            我的技能
            <span v-if="customSkills.length" class="skills-type-tab__count">{{ customSkills.length }}</span>
          </button>
        </div>

        <!-- 分类切换(仅内置) -->
        <div v-if="typeTab === 'builtin'" class="skills-tabs">
          <button
            v-for="c in categoryList"
            :key="c.key"
            class="skill-tab"
            :class="{ 'is-active': filter.category === c.key }"
            @click="filter.category = c.key"
          >
            <span v-if="c.icon" class="skill-tab__icon" v-html="c.icon" />
            {{ c.name }}
            <span class="skill-tab__count">{{ getCategoryCount(c.key) }}</span>
          </button>
        </div>
      </div>
      <div class="skills-toolbar__right">
        <button class="btn btn--primary btn--sm" @click="createOpen = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          创建新技能
        </button>
        <div class="search-input">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input v-model="filter.keyword" :placeholder="typeTab === 'builtin' ? '搜索更多技能' : '搜索我的技能'" @keyup.enter="reload" />
        </div>
      </div>
    </div>

    <!-- ============== 浮动菜单(更多操作) - 全局,不被条件包裹 ============== -->
    <transition name="menu-fade">
      <div v-if="menuOpen" class="skill-menu-mask" @click="closeMenu">
        <div class="skill-menu" :style="menuPos" @click.stop>
          <button class="skill-menu__item" @click="editFromMenu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            编辑技能
          </button>
          <button class="skill-menu__item skill-menu__item--danger" @click="deleteFromMenu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/>
            </svg>
            删除技能
          </button>
        </div>
      </div>
    </transition>

    <!-- ============== 内置技能 视图 ============== -->
    <template v-if="typeTab === 'builtin'">
      <section v-if="!loading && list.length" class="skills-grid">
        <article
          v-for="s in list"
          :key="s.id"
          class="skill-card"
          :class="{ 'is-custom': s.type === 'custom' }"
          @click="open(s)"
        >
          <header class="skill-card__head">
            <span class="skill-card__icon" :class="['is-' + s.category]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path :d="iconPath(s.category)" />
              </svg>
            </span>
            <span class="skill-card__name">{{ s.name }}</span>
            <span v-if="s.is_hot" class="skill-card__hot">热门</span>
          </header>
          <div class="skill-card__usage">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {{ formatNum(s.usage_count) }} 人已添加
          </div>
          <p class="skill-card__desc">{{ s.description }}</p>
          <footer class="skill-card__foot">
            <span class="skill-card__cat" :class="['is-' + s.category]">
              <span class="skill-card__cat-dot" />
              {{ catName(s.category) }}
            </span>
            <button
              v-if="!isInMySkills(s.id)"
              class="skill-card__add"
              @click.stop="addToMine(s)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              添加
            </button>
            <button v-else class="skill-card__added" disabled @click.stop>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
              已添加
            </button>
          </footer>
        </article>
      </section>

      <div v-else-if="loading" class="skills-loading">
        <div class="spinner" />
        <span>正在加载技能...</span>
      </div>

      <div v-else class="skills-empty">
        <div class="skills-empty__icon">⚙</div>
        <h4>没有匹配的技能</h4>
        <p>尝试切换其他分类或调整关键词</p>
        <div class="skills-empty__actions">
          <button class="btn btn--ghost btn--sm" @click="reset">重置筛选</button>
        </div>
      </div>
    </template>

    <!-- ============== 我的技能 视图 ============== -->
    <template v-if="typeTab === 'custom'">
      <section v-if="!loading && list.length" class="skills-mine-grid">
        <article
          v-for="s in list"
          :key="s.id"
          class="skill-mine-card"
          @click="open(s)"
        >
          <header class="skill-mine-card__head">
            <span class="skill-mine-card__icon" :class="['is-' + s.category]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path :d="iconPath(s.category)" />
              </svg>
            </span>
            <span class="skill-mine-card__name">{{ s.name }}</span>
            <button class="skill-mine-card__menu" @click.stop="openMenu(s, $event)">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5"  r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/>
              </svg>
            </button>
          </header>
          <p class="skill-mine-card__desc">{{ s.description }}</p>
          <button class="skill-mine-card__use" @click.stop="useSkill(s)">
            立即使用
          </button>
        </article>
      </section>

      <div v-else-if="loading" class="skills-loading">
        <div class="spinner" />
        <span>正在加载技能...</span>
      </div>

      <div v-else class="skills-empty">
        <div class="skills-empty__icon">✨</div>
        <h4>还没有自定义技能</h4>
        <p>点击右上角「创建新技能」快速封装一个属于你自己的原子能力</p>
        <div class="skills-empty__actions">
          <button class="btn btn--primary btn--sm" @click="createOpen = true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            创建新技能
          </button>
        </div>
      </div>
    </template>

    <!-- ============== DETAIL DRAWER ============== -->
    <el-drawer
      v-model="drawerOpen"
      :title="detail?.name || '技能详情'"
      direction="rtl"
      size="540px"
      :with-header="false"
    >
      <div v-if="detail" class="skill-detail">
        <header class="skill-detail__head">
          <button class="skill-detail__close" @click="drawerOpen = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
          <span class="skill-detail__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path :d="iconPath(detail.category)" />
            </svg>
          </span>
          <div class="skill-detail__head-text">
            <h3>{{ detail.name }}</h3>
            <div class="skill-detail__meta">
              <span class="skill-detail__cat" :class="['is-' + detail.category]">
                {{ catName(detail.category) }}
              </span>
              <span class="skill-detail__version">v{{ detail.version }}</span>
              <span class="skill-detail__status" :class="['is-' + detail.status]">
                {{ statusLabel(detail.status) }}
              </span>
            </div>
          </div>
        </header>

        <section class="skill-detail__section">
          <h5>技能描述</h5>
          <p>{{ detail.description }}</p>
        </section>

        <section class="skill-detail__section">
          <h5>关键指标</h5>
          <div class="skill-detail__kpis">
            <div class="kpi-mini">
              <b>{{ formatNum(detail.usage_count) }}</b><span>累计调用</span>
            </div>
            <div class="kpi-mini">
              <b>{{ detail.agents_count }}</b><span>关联智能体</span>
            </div>
            <div class="kpi-mini">
              <b>{{ Math.round(detail.usage_count / Math.max(detail.agents_count, 1)) }}</b><span>人均调用</span>
            </div>
            <div class="kpi-mini">
              <b>{{ trendPeak(detail.trend) }}</b><span>单日峰值</span>
            </div>
          </div>
        </section>

        <section class="skill-detail__section">
          <h5>7 日调用趋势</h5>
          <div class="skill-detail__trend">
            <div class="trend-bars">
              <div
                v-for="(v, i) in detail.trend"
                :key="i"
                class="trend-bars__item"
                :style="{ height: trendHeight(v, detail.trend) + '%' }"
              >
                <span class="trend-bars__label">{{ v }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="skill-detail__section">
          <h5>关联智能体 · {{ detail.linkedAgents?.length || 0 }}</h5>
          <div v-if="detail.linkedAgents?.length" class="skill-detail__agents">
            <div
              v-for="a in detail.linkedAgents"
              :key="a.id"
              class="agent-mini"
              :style="{ borderLeftColor: a.color_theme }"
            >
              <div class="agent-mini__name">{{ a.name }}</div>
              <div class="agent-mini__meta">
                <span>{{ catName(a.category) }}</span>
                <span>· 调用 {{ formatNum(a.usage_count) }}</span>
              </div>
            </div>
          </div>
          <p v-else class="skill-detail__empty">暂无关联智能体</p>
        </section>

        <footer class="skill-detail__foot">
          <button class="btn btn--ghost" @click="drawerOpen = false">关闭</button>
          <button class="btn btn--primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            绑定到智能体
          </button>
        </footer>
      </div>
    </el-drawer>

    <!-- ============== CREATE MODAL ============== -->
    <CreateSkillModal
      :open="createOpen"
      @close="createOpen = false"
      @submit="onCreate"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { listSkills, getSkillDetail } from '@/api/smart-center'
import { useCustomSkills } from '@/composables/useCustomSkills'
import { useToastStore } from '@/stores/toast'
import CreateSkillModal from '@/components/CreateSkillModal.vue'

const CATEGORY_MAP = {
  office:    { name: '办公效率', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z' },
  dev:       { name: '研发辅助', icon: 'M8 6 2 12l6 6M16 6l6 6-6 6M14 4l-4 16' },
  test:      { name: '测试工具', icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  ops:       { name: '运维工具', icon: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' },
  marketing: { name: '运营工具', icon: 'M3 3v18h18M7 14l4-4 4 4 5-5' },
  terminal:  { name: '终端诊断', icon: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm5 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2z' },
  network:   { name: '网络优化', icon: 'M5 12a7 7 0 0 1 14 0M8.5 12a3.5 3.5 0 0 1 7 0M2 12a10 10 0 0 1 20 0M11 12h.01M12 12v.01' },
  payload:   { name: '载荷监控', icon: 'M12 2 4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z' },
  e2e:       { name: '全链路',   icon: 'M3 12h4l3-9 4 18 3-9h4' },
  general:   { name: '通用',     icon: 'M4 4h16v16H4zM4 9h16M9 4v16' },
  custom:    { name: '自定义',   icon: 'M4 4h16v16H4zM4 9h16M9 4v16' },
}

function catName(k) { return CATEGORY_MAP[k]?.name || k }
function iconPath(k) { return CATEGORY_MAP[k]?.icon || '' }

const STATUS_LABELS = { active: '运行中', maintenance: '维护中', draft: '待发布' }
function statusLabel(s) { return STATUS_LABELS[s] || s }

function formatNum(n) {
  n = n || 0
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000)  return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

function trendPath(arr) {
  if (!arr || !arr.length) return ''
  const max = Math.max(...arr)
  const min = Math.min(...arr)
  const range = max - min || 1
  return arr.map((v, i) => {
    const x = (i / (arr.length - 1)) * 100
    const y = 32 - ((v - min) / range) * 28 - 2
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}
function trendHeight(v, arr) {
  const max = Math.max(...arr)
  return Math.max(8, (v / max) * 100)
}
function trendPeak(arr) {
  return arr ? Math.max(...arr) : 0
}

const entering = ref(false)
const loading = ref(false)
const list = ref([])
const builtinList = ref([])
const typeTab = ref('builtin')
const createOpen = ref(false)
const categoryList = ref([
  { key: 'all',       name: '全部',     count: 0, icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/><rect x="14" y="14" width="7" height="7" rx="1.2"/></svg>' },
  { key: 'office',    name: '办公效率', count: 0, icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' },
  { key: 'dev',       name: '研发辅助', count: 0, icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>' },
  { key: 'test',      name: '测试工具', count: 0, icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>' },
  { key: 'ops',       name: '运维工具', count: 0, icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>' },
  { key: 'marketing', name: '运营工具', count: 0, icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-5"/></svg>' },
])
const drawerOpen = ref(false)
const detail = ref(null)

const { list: customSkills, addSkill, removeSkill } = useCustomSkills()
const toast = useToastStore()

const filter = reactive({ category: 'all', keyword: '', sort: '', pageNo: 1, pageSize: 24 })

const totalUsage = computed(() => list.value.reduce((s, x) => s + (x.usage_count || 0), 0))
const totalLinked = computed(() => list.value.reduce((s, x) => s + (x.agents_count || 0), 0))
const draftCount = computed(() => list.value.filter((x) => x.status === 'draft').length)

function applyFilter(arr) {
  let res = arr
  if (filter.category && filter.category !== 'all') {
    res = res.filter((s) => s.category === filter.category)
  }
  if (filter.keyword) {
    const kw = filter.keyword.toLowerCase()
    res = res.filter((s) =>
      s.name?.toLowerCase().includes(kw) ||
      s.description?.toLowerCase().includes(kw),
    )
  }
  if (filter.sort === 'usage')  res = [...res].sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
  if (filter.sort === 'agents') res = [...res].sort((a, b) => (b.agents_count || 0) - (a.agents_count || 0))
  if (filter.sort === 'newest') res = [...res].sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
  return res
}

function rebuildList() {
  if (typeTab.value === 'builtin') {
    const withType = builtinList.value.map((s) => ({ ...s, type: 'builtin' }))
    list.value = applyFilter(withType)
  } else {
    /* 我的技能 = 用户自建 + 从市场添加的内置技能 */
    const customs = customSkills.value.map((s) => ({ ...s, type: 'custom' }))
    const added  = builtinList.value
      .filter((s) => isInMySkills(s.id))
      .map((s) => ({ ...s, type: 'builtin', added_at: mySkillSet.value[s.id] }))
    const combined = [...customs, ...added].sort((a, b) => {
      const at = a.added_at || a.created_at || 0
      const bt = b.added_at || b.created_at || 0
      return bt - at
    })
    list.value = applyFilter(combined)
  }
}

function getCategoryCount(key) {
  if (typeTab.value === 'builtin') {
    if (key === 'all') return builtinList.value.length
    return builtinList.value.filter((s) => s.category === key).length
  }
  /* 我的技能:仅统计当前已添加的 */
  const customs = customSkills.value.filter((s) => !key || key === 'all' || s.category === key)
  const added = builtinList.value
    .filter((s) => isInMySkills(s.id) && (!key || key === 'all' || s.category === key))
  if (key === 'all') return customs.length + added.length
  return customs.length + added.length
}

async function reload() {
  loading.value = true
  try {
    if (typeTab.value === 'builtin') {
      const data = await listSkills({ pageNo: 1, pageSize: 200 })
      builtinList.value = data.list
      // 分类计数
      const counts = { all: builtinList.value.length }
      builtinList.value.forEach((s) => { counts[s.category] = (counts[s.category] || 0) + 1 })
      categoryList.value.forEach((c) => { c.count = counts[c.key] || 0 })
    }
    rebuildList()
  } finally {
    loading.value = false
  }
}

async function open(s) {
  drawerOpen.value = true
  detail.value = s
}

/* ============== "我的技能" 收藏(添加)管理 ============== */
/* 用 localStorage 记录用户从内置市场添加的技能 id */
const MINE_KEY = 'user:skills:mine:v1'
function readMine() {
  try { return JSON.parse(localStorage.getItem(MINE_KEY) || '{}') } catch { return {} }
}
function writeMine(v) { try { localStorage.setItem(MINE_KEY, JSON.stringify(v)) } catch { /* ignore */ } }
const mySkillSet = ref(readMine())
window.addEventListener('storage', (e) => { if (e.key === MINE_KEY) mySkillSet.value = readMine() })

function isInMySkills(id) {
  return Boolean(mySkillSet.value[id])
}
function addToMine(s) {
  if (isInMySkills(s.id)) return
  mySkillSet.value = { ...mySkillSet.value, [s.id]: Date.now() }
  writeMine(mySkillSet.value)
  toast.success('已添加至「我的技能」', s.name)
}
function removeFromMine(id) {
  const next = { ...mySkillSet.value }
  delete next[id]
  mySkillSet.value = next
  writeMine(next)
}

function useSkill(s) {
  toast.info('已启动技能', `「${s.name}」正在加载...`)
  // 真实业务中应跳转到技能执行页/对话框
}

/* ============== 浮动菜单(更多操作) ============== */
const menuOpen = ref(false)
const menuPos = ref({ top: '0px', left: '0px' })
const menuTarget = ref(null)
function openMenu(s, ev) {
  menuTarget.value = s
  const rect = ev.currentTarget.getBoundingClientRect()
  menuPos.value = { top: `${rect.bottom + 6}px`, left: `${Math.max(8, rect.right - 180)}px` }
  menuOpen.value = true
}
function closeMenu() {
  menuOpen.value = false
  menuTarget.value = null
}
function editFromMenu() {
  if (menuTarget.value) {
    open(menuTarget.value)
  }
  closeMenu()
}
function deleteFromMenu() {
  if (!menuTarget.value) return
  const s = menuTarget.value
  if (!window.confirm(`确定删除「${s.name}」吗?该操作不可恢复。`)) {
    closeMenu()
    return
  }
  if (s.type === 'custom') {
    removeSkill(s.id)
  } else {
    removeFromMine(s.id)
  }
  toast.success('已删除', s.name)
  rebuildList()
  closeMenu()
}

function reset() {
  filter.category = 'all'
  filter.keyword = ''
  filter.sort = ''
  rebuildList()
}

function setTypeTab(tab) {
  typeTab.value = tab
  filter.category = 'all'
  filter.keyword = ''
  rebuildList()
}

function onCreate(draft) {
  const s = addSkill(draft)
  toast.success('已创建', `「${s.name}」已加入「我的技能」`)
  if (typeTab.value === 'custom') rebuildList()
  else {
    // 自动跳到我的技能
    setTypeTab('custom')
  }
}

function confirmDelete(s) {
  if (!window.confirm(`确定删除「${s.name}」吗?该操作不可恢复。`)) return
  removeSkill(s.id)
  toast.success('已删除', s.name)
  if (typeTab.value === 'custom') rebuildList()
}

watch(() => filter.category, () => rebuildList())
let kwT
watch(() => filter.keyword, () => {
  clearTimeout(kwT)
  kwT = setTimeout(rebuildList, 250)
})
watch(typeTab, () => rebuildList())
watch(customSkills, () => {
  if (typeTab.value === 'custom') rebuildList()
}, { deep: true })

onMounted(() => {
  requestAnimationFrame(() => (entering.value = true))
  reload()
})
onUnmounted(() => { entering.value = false })
</script>

<style scoped>
.page { padding: 24px 32px 40px; }

/* ============== HERO ============== */
.skills-hero {
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
  padding: 22px 28px; margin-bottom: 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--accent-soft) 0%, transparent 60%), var(--surface);
  border: 1px solid var(--line);
}
.skills-hero__text h3 { font-size: 18px; margin: 0 0 4px; font-weight: 600; }
.skills-hero__text p  { margin: 0; font-size: 13px; color: var(--ink-3); line-height: 1.6; }
.skills-hero__stats   { display: flex; gap: 10px; }
.stat-card {
  display: flex; flex-direction: column; gap: 2px;
  padding: 10px 18px; border-radius: 12px; min-width: 96px;
  background: var(--surface-2); border: 1px solid var(--line); text-align: center;
}
.stat-card b { font-size: 18px; font-weight: 600; color: var(--accent); }
.stat-card span { font-size: 11px; color: var(--ink-3); }

/* ============== TOOLBAR ============== */
.skills-toolbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 18px; }
.skills-toolbar__left { display: flex; align-items: center; gap: 12px; flex: 1; flex-wrap: wrap; }
.skills-type-tabs {
  display: inline-flex; padding: 3px;
  background: var(--surface-2); border: 1px solid var(--line);
  border-radius: 10px;
}
.skills-type-tab {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px; font-size: 12.5px; font-weight: 500;
  background: transparent; color: var(--ink-2);
  border: 0; border-radius: 7px; cursor: pointer;
  transition: all 0.15s;
}
.skills-type-tab:hover { color: var(--ink); }
.skills-type-tab.is-active {
  background: var(--surface); color: var(--accent);
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.skills-type-tab__count {
  font-size: 10.5px; padding: 0 6px; border-radius: 999px;
  background: var(--surface); color: var(--ink-3); font-weight: 500;
  border: 1px solid var(--line);
}
.skills-type-tab.is-active .skills-type-tab__count {
  background: var(--accent-soft); color: var(--accent); border-color: transparent;
}
.skills-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
.skill-tab {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 999px; font-size: 12.5px;
  background: var(--surface); color: var(--ink-2);
  border: 1px solid var(--line); cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
}
.skill-tab:hover { background: var(--surface-2); }
.skill-tab.is-active { background: var(--accent); color: #fff; border-color: var(--accent); }
.skill-tab__count {
  font-size: 10.5px; padding: 1px 6px; border-radius: 999px;
  background: var(--surface-2); color: var(--ink-3);
}
.skill-tab.is-active .skill-tab__count { background: rgba(255,255,255,0.2); color: #fff; }
.skill-tab__icon {
  display: inline-flex; width: 14px; height: 14px;
  color: currentColor; flex-shrink: 0;
}
.skill-tab__icon svg { width: 14px; height: 14px; }
.skill-tab:not(.is-active) .skill-tab__count { background: var(--surface-2); color: var(--ink-3); }

.skills-toolbar__right { display: flex; gap: 8px; align-items: center; }
.search-input {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 10px;
  background: var(--surface); border: 1px solid var(--line);
  width: 280px;
}
.search-input svg { width: 16px; height: 16px; color: var(--ink-3); flex-shrink: 0; }
.search-input input { flex: 1; background: transparent; border: 0; outline: 0; font-size: 12.5px; color: var(--ink); }
.sort-pick {
  padding: 6px 10px; border-radius: 8px; font-size: 12.5px;
  border: 1px solid var(--line); background: var(--surface); color: var(--ink); cursor: pointer;
}

/* ============== GRID ============== */
.skills-grid {
  display: grid; gap: 14px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}
.skill-card {
  padding: 16px; border-radius: 14px; cursor: pointer;
  background: var(--surface); border: 1px solid var(--line);
  transition: all var(--dur-fast) var(--ease);
  display: flex; flex-direction: column; gap: 10px;
  position: relative;
}
.skill-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  border-color: var(--accent);
}
.skill-card__head { display: flex; align-items: center; gap: 10px; min-height: 36px; }
.skill-card__icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: grid; place-items: center; flex-shrink: 0;
  background: var(--accent-soft); color: var(--accent);
}
.skill-card__icon svg { width: 20px; height: 20px; }
.skill-card__icon.is-office    { background: #eff6ff; color: #2563eb; }
.skill-card__icon.is-dev       { background: #ecfeff; color: #0891b2; }
.skill-card__icon.is-test      { background: #ecfdf5; color: #059669; }
.skill-card__icon.is-ops       { background: #fff7ed; color: #ea580c; }
.skill-card__icon.is-marketing { background: #fdf2f8; color: #db2777; }
.skill-card__icon.is-terminal  { background: #ecfdf5; color: #047857; }
.skill-card__icon.is-network   { background: #eff6ff; color: #1d4ed8; }
.skill-card__icon.is-payload   { background: #fef3c7; color: #b45309; }
.skill-card__icon.is-e2e       { background: #f3e8ff; color: #7c3aed; }
.skill-card__icon.is-general   { background: var(--surface-2); color: var(--ink-3); }
.skill-card__name { font-size: 14.5px; font-weight: 600; line-height: 1.3; color: var(--ink); flex: 1; }
.skill-card__hot {
  flex-shrink: 0;
  padding: 1px 7px; border-radius: 4px;
  font-size: 10px; font-weight: 600;
  background: linear-gradient(135deg, #f5365c, #fbb337);
  color: #fff;
}
.skill-card__usage {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11.5px; color: var(--ink-3);
}
.skill-card__usage svg { width: 12px; height: 12px; }
.skill-card__desc { margin: 0; font-size: 12px; color: var(--ink-3); line-height: 1.55;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 38px; }
.skill-card__foot {
  display: flex; gap: 8px; align-items: center; padding-top: 8px; margin-top: auto;
}
.skill-card__cat {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 8px; border-radius: 999px;
  font-size: 10.5px; font-weight: 500;
}
.skill-card__cat-dot { width: 4px; height: 4px; border-radius: 50%; background: currentColor; }
.skill-card__cat.is-office    { background: #eff6ff; color: #2563eb; }
.skill-card__cat.is-dev       { background: #ecfeff; color: #0891b2; }
.skill-card__cat.is-test      { background: #ecfdf5; color: #059669; }
.skill-card__cat.is-ops       { background: #fff7ed; color: #ea580c; }
.skill-card__cat.is-marketing { background: #fdf2f8; color: #db2777; }
.skill-card__cat.is-terminal  { background: #ecfdf5; color: #047857; }
.skill-card__cat.is-network   { background: #eff6ff; color: #1d4ed8; }
.skill-card__cat.is-payload   { background: #fef3c7; color: #b45309; }
.skill-card__cat.is-e2e       { background: #f3e8ff; color: #7c3aed; }
.skill-card__cat.is-general   { background: var(--surface-2); color: var(--ink-3); }
.skill-card__add {
  margin-left: auto; display: inline-flex; align-items: center; gap: 3px;
  padding: 4px 10px; border-radius: 6px; border: 1px solid var(--line);
  background: var(--surface); color: var(--ink-2); cursor: pointer;
  font-size: 11.5px; font-weight: 500;
  transition: all 0.15s;
}
.skill-card__add svg { width: 12px; height: 12px; }
.skill-card__add:hover {
  background: var(--accent); color: #fff; border-color: var(--accent);
}
.skill-card__added {
  margin-left: auto; display: inline-flex; align-items: center; gap: 3px;
  padding: 4px 10px; border-radius: 6px; border: 0;
  background: var(--surface-2); color: var(--ink-3); cursor: not-allowed;
  font-size: 11.5px; font-weight: 500;
}
.skill-card__added svg { width: 12px; height: 12px; }

/* ============== MY SKILLS GRID (我的技能) ============== */
.skills-mine-grid {
  display: grid; gap: 14px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}
.skill-mine-card {
  padding: 16px; border-radius: 14px; cursor: pointer;
  background: var(--surface); border: 1px solid var(--line);
  transition: all var(--dur-fast) var(--ease);
  display: flex; flex-direction: column; gap: 10px;
  position: relative;
}
.skill-mine-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  border-color: var(--accent);
}
.skill-mine-card__head { display: flex; align-items: center; gap: 10px; }
.skill-mine-card__icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: grid; place-items: center; flex-shrink: 0;
  background: var(--accent-soft); color: var(--accent);
}
.skill-mine-card__icon svg { width: 20px; height: 20px; }
.skill-mine-card__icon.is-office    { background: #eff6ff; color: #2563eb; }
.skill-mine-card__icon.is-dev       { background: #ecfeff; color: #0891b2; }
.skill-mine-card__icon.is-test      { background: #ecfdf5; color: #059669; }
.skill-mine-card__icon.is-ops       { background: #fff7ed; color: #ea580c; }
.skill-mine-card__icon.is-marketing { background: #fdf2f8; color: #db2777; }
.skill-mine-card__icon.is-terminal  { background: #ecfdf5; color: #047857; }
.skill-mine-card__icon.is-network   { background: #eff6ff; color: #1d4ed8; }
.skill-mine-card__icon.is-payload   { background: #fef3c7; color: #b45309; }
.skill-mine-card__icon.is-e2e       { background: #f3e8ff; color: #7c3aed; }
.skill-mine-card__icon.is-general   { background: var(--surface-2); color: var(--ink-3); }
.skill-mine-card__name { font-size: 14.5px; font-weight: 600; color: var(--ink); flex: 1; }
.skill-mine-card__menu {
  width: 24px; height: 24px; border: 0; border-radius: 4px;
  background: transparent; color: var(--ink-3); cursor: pointer;
  display: grid; place-items: center; transition: all 0.15s;
}
.skill-mine-card__menu:hover { background: var(--surface-2); color: var(--ink); }
.skill-mine-card__menu svg { width: 14px; height: 14px; }
.skill-mine-card__desc { margin: 0; font-size: 12px; color: var(--ink-3); line-height: 1.55;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 38px; }
.skill-mine-card__use {
  align-self: stretch; margin-top: auto;
  padding: 7px 0; border-radius: 8px; border: 1px solid var(--accent);
  background: transparent; color: var(--accent); cursor: pointer;
  font-size: 12.5px; font-weight: 500;
  transition: all 0.15s;
}
.skill-mine-card__use:hover { background: var(--accent); color: #fff; }

/* ============== SKILL MENU (浮动菜单) ============== */
.skill-menu-mask {
  position: fixed; inset: 0; z-index: 999;
  background: transparent;
}
.skill-menu {
  position: absolute; min-width: 180px;
  padding: 6px; border-radius: 10px;
  background: var(--surface); border: 1px solid var(--line);
  box-shadow: 0 12px 40px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08);
}
.skill-menu__item {
  display: flex; align-items: center; gap: 8px;
  width: 100%; padding: 8px 10px; border: 0;
  background: transparent; color: var(--ink-2); cursor: pointer;
  font-size: 12.5px; text-align: left; border-radius: 6px;
  transition: background 0.15s;
}
.skill-menu__item:hover { background: var(--surface-2); }
.skill-menu__item--danger { color: #f5365c; }
.skill-menu__item--danger:hover { background: #fef2f2; }
.skill-menu__item svg { width: 14px; height: 14px; }
.menu-fade-enter-active, .menu-fade-leave-active { transition: opacity 0.15s; }
.menu-fade-enter-from, .menu-fade-leave-to { opacity: 0; }

/* ============== LOADING / EMPTY ============== */
.skills-loading, .skills-empty {
  margin: 60px auto; padding: 40px 32px; max-width: 480px; text-align: center;
  border: 1px dashed var(--line); border-radius: 16px;
  background: var(--surface-2);
}
.spinner {
  width: 36px; height: 36px; border-radius: 50%;
  border: 3px solid var(--line); border-top-color: var(--accent);
  animation: spin 0.8s linear infinite; margin: 0 auto 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.skills-empty__icon { font-size: 48px; margin-bottom: 8px; opacity: 0.6; }
.skills-empty h4    { margin: 0 0 6px; font-size: 15px; }
.skills-empty p     { margin: 0 0 12px; font-size: 12.5px; color: var(--ink-3); }
.skills-empty__actions { display: flex; gap: 8px; justify-content: center; }
.skill-card__badge {
  margin-left: auto; display: inline-flex; align-items: center; gap: 3px;
  padding: 2px 7px; border-radius: 999px;
  font-size: 10.5px; font-weight: 500;
  background: linear-gradient(135deg, #fbb33722, #f25c5414);
  color: #d97706;
  border: 1px solid #fbbf2433;
}
.skill-card.is-custom {
  border-color: color-mix(in srgb, var(--accent) 28%, var(--line));
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 6%, transparent);
}
.skill-card__del {
  width: 28px; height: 28px; border: 0; border-radius: 6px;
  background: transparent; color: var(--ink-3); cursor: pointer;
  display: grid; place-items: center; margin-left: auto;
  transition: all 0.15s;
}
.skill-card__del:hover { background: #fee2e2; color: #f5365c; }
.skill-card__del svg { width: 14px; height: 14px; }

/* ============== DRAWER ============== */
.skill-detail { padding: 0 24px 24px; }
.skill-detail__head {
  position: relative; display: flex; align-items: center; gap: 14px;
  padding: 28px 20px 20px; margin: 0 -24px 18px;
  border-bottom: 1px solid var(--line-2);
}
.skill-detail__close {
  position: absolute; top: 14px; right: 14px;
  width: 30px; height: 30px; border-radius: 8px;
  background: var(--surface-2); border: 0; cursor: pointer;
  display: grid; place-items: center; color: var(--ink-3);
}
.skill-detail__icon {
  width: 56px; height: 56px; border-radius: 14px;
  display: grid; place-items: center; flex-shrink: 0;
  background: var(--accent-soft); color: var(--accent);
}
.skill-detail__icon svg { width: 28px; height: 28px; }
.skill-detail__head h3 { margin: 0 0 6px; font-size: 17px; font-weight: 600; }
.skill-detail__meta { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.skill-detail__cat { padding: 2px 8px; border-radius: 999px; font-size: 10.5px; font-weight: 500; }
.skill-detail__cat.is-terminal { background: #ecfdf5; color: #047857; }
.skill-detail__cat.is-network  { background: #eff6ff; color: #1d4ed8; }
.skill-detail__cat.is-payload  { background: #fef3c7; color: #b45309; }
.skill-detail__cat.is-e2e      { background: #f3e8ff; color: #7c3aed; }
.skill-detail__cat.is-general  { background: var(--surface-2); color: var(--ink-3); }
.skill-detail__version { font-size: 11px; color: var(--ink-3); }
.skill-detail__status {
  font-size: 11px; padding: 2px 8px; border-radius: 6px;
  background: var(--surface-2); color: var(--ink-3);
}
.skill-detail__status.is-active      { background: #dcfce7; color: #16a34a; }
.skill-detail__status.is-maintenance { background: #fef3c7; color: #d97706; }

.skill-detail__section { margin-bottom: 18px; }
.skill-detail__section h5 { margin: 0 0 8px; font-size: 12.5px; color: var(--ink-3); font-weight: 500; }
.skill-detail__section p  { margin: 0; font-size: 13px; line-height: 1.6; color: var(--ink-2); }
.skill-detail__empty { font-size: 12px; color: var(--ink-3); }

.skill-detail__kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.kpi-mini {
  padding: 10px; border-radius: 10px;
  background: var(--surface-2); border: 1px solid var(--line);
  display: flex; flex-direction: column; gap: 2px; text-align: center;
}
.kpi-mini b { font-size: 14px; font-weight: 600; }
.kpi-mini span { font-size: 10.5px; color: var(--ink-3); }

.skill-detail__trend {
  padding: 14px 16px; border-radius: 10px;
  background: var(--surface-2); border: 1px solid var(--line);
}
.trend-bars { display: flex; align-items: flex-end; gap: 8px; height: 120px; }
.trend-bars__item {
  flex: 1; background: linear-gradient(180deg, var(--accent), #8b5cf6);
  border-radius: 6px 6px 0 0; position: relative; min-height: 8px;
  transition: all 0.3s;
}
.trend-bars__item:hover { filter: brightness(1.1); }
.trend-bars__label {
  position: absolute; top: -18px; left: 50%; transform: translateX(-50%);
  font-size: 10px; color: var(--ink-3);
}

.skill-detail__agents { display: grid; gap: 8px; }
.agent-mini {
  padding: 10px 14px; border-radius: 8px;
  background: var(--surface-2); border: 1px solid var(--line);
  border-left-width: 3px;
}
.agent-mini__name { font-size: 13px; font-weight: 500; }
.agent-mini__meta { font-size: 11px; color: var(--ink-3); margin-top: 2px; display: flex; gap: 4px; }

.skill-detail__foot {
  display: flex; gap: 8px; padding-top: 16px; border-top: 1px solid var(--line-2);
}
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 10px; font-size: 13px;
  border: 1px solid var(--line); background: var(--surface);
  color: var(--ink-2); cursor: pointer; transition: all var(--dur-fast) var(--ease);
}
.btn svg { width: 14px; height: 14px; }
.btn--ghost:hover { background: var(--surface-2); color: var(--ink); }
.btn--primary { background: var(--accent); color: #fff; border-color: var(--accent); }
.btn--primary:hover { filter: brightness(1.08); }
.btn--sm { padding: 5px 12px; font-size: 12px; }

/* ============== RESPONSIVE ============== */
@media (max-width: 960px) {
  .skills-hero { flex-direction: column; align-items: flex-start; }
  .skills-hero__stats { width: 100%; }
  .skill-detail__kpis { grid-template-columns: repeat(2, 1fr); }
}
</style>
