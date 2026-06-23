<template>
  <div class="page page-agents" :class="{ 'view-enter': entering }">
    <!-- ============== HERO (对齐 skills-hero) ============== -->
    <section class="agents-hero">
      <div class="agents-hero__text">
        <h3>智能体市场</h3>
        <p>浏览系统内置的卫星互联网 AI 助手,或创建专属于你的自定义智能体。</p>
      </div>
      <div class="agents-hero__stats">
        <div class="stat-card">
          <b>{{ totalCount }}</b>
          <span>智能体总数</span>
        </div>
        <div class="stat-card">
          <b>{{ builtinCount }}</b>
          <span>系统内置</span>
        </div>
        <div class="stat-card">
          <b>{{ customCount }}</b>
          <span>我的自定义</span>
        </div>
      </div>
    </section>

    <!-- ============== TOOLBAR (对齐 skills-toolbar) ============== -->
    <div class="agents-toolbar">
      <div class="agents-toolbar__left">
        <!-- 分段 Tabs (对齐 skills-type-tabs) -->
        <div class="agents-type-tabs">
          <button
            v-for="t in typeTabs"
            :key="t.key"
            class="agents-type-tab"
            :class="{ 'is-active': typeTab === t.key }"
            @click="setTypeTab(t.key)"
          >
            <span class="agents-type-tab__icon" v-html="t.icon" />
            {{ t.name }}
            <span class="agents-type-tab__count">{{ t.count }}</span>
          </button>
        </div>
      </div>

      <div class="agents-toolbar__right">
        <div class="search-input">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            v-model="filter.keyword"
            placeholder="搜索 AI 助手..."
          />
        </div>
        <button class="btn btn--primary agents-toolbar__new" @click="createOpen = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          新建智能体
        </button>
      </div>
    </div>

    <!-- ============== 分组列表 ============== -->
    <template v-if="!loading && groupedList.length">
      <section
        v-for="g in groupedList"
        :key="g.key"
        class="agents-group"
      >
        <header class="agents-group__head">
          <span class="agents-group__icon" v-html="g.icon" />
          <h4>{{ g.name }}</h4>
          <span class="agents-group__count">{{ g.items.length }}</span>
        </header>
        <div class="agents-grid">
          <article
            v-for="a in g.items"
            :key="a.id"
            class="agent-card"
            :class="['is-' + a.category, { 'is-custom': a.type === 'custom' }]"
            @click="open(a)"
          >
            <span
              class="agent-card__icon"
              :style="iconStyle(a)"
            >
              <el-icon :size="20"><component :is="iconName(a.icon)" /></el-icon>
            </span>
            <h5 class="agent-card__name">{{ a.name }}</h5>
            <p class="agent-card__desc">{{ a.description || '暂无简介' }}</p>
            <div class="agent-card__foot">
              <span class="agent-card__cat" :class="['is-' + a.category]">
                <span class="agent-card__cat-dot" />
                {{ categoryName(a.category) }}
              </span>
              <button
                v-if="a.type === 'custom'"
                class="agent-card__del"
                title="删除智能体"
                @click.stop="confirmDelete(a)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/>
                </svg>
              </button>
            </div>
          </article>
        </div>
      </section>
    </template>

    <div v-else-if="loading" class="agents-loading">
      <div class="spinner" />
      <span>正在加载智能体...</span>
    </div>

    <!-- ============== EMPTY (我的自定义) ============== -->
    <div v-else-if="typeTab === 'custom'" class="agents-empty">
      <div class="agents-empty__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14M5 12h14"/>
          <circle cx="12" cy="12" r="11" stroke-dasharray="3 3" opacity="0.3"/>
        </svg>
      </div>
      <h4>你还没有创建任何自定义智能体</h4>
      <p>定义专属角色、提示词与触发命令,搭建属于你自己的 AI 助手。</p>
      <button class="btn btn--primary" @click="createOpen = true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        新建我的第一个智能体
      </button>
    </div>

    <!-- ============== EMPTY (其他) ============== -->
    <div v-else class="agents-empty">
      <div class="agents-empty__icon">⌬</div>
      <h4>没有匹配的智能体</h4>
      <p>尝试调整搜索词或切换 Tab</p>
      <button class="btn btn--ghost btn--sm" @click="reset">重置筛选</button>
    </div>

    <!-- ============== DETAIL DRAWER ============== -->
    <el-drawer
      v-model="drawerOpen"
      :title="detail?.name || '智能体详情'"
      direction="rtl"
      size="520px"
      :with-header="false"
    >
      <div v-if="detail" class="agent-detail">
        <header class="agent-detail__head" :style="{ background: 'linear-gradient(135deg, ' + (detail.color_theme || 'var(--accent)') + '22, transparent)' }">
          <button class="agent-detail__close" @click="drawerOpen = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
          <span class="agent-detail__icon" :class="['is-' + detail.category]" :style="detailStyle(detail)">
            <el-icon :size="28"><component :is="iconName(detail.icon)" /></el-icon>
          </span>
          <div>
            <h3>{{ detail.name }}</h3>
            <div class="agent-detail__meta">
              <span class="agent-detail__cat" :class="['is-' + detail.category]">
                <span class="agent-detail__cat-dot" />
                {{ categoryName(detail.category) }}
              </span>
              <span class="agent-detail__version">v{{ detail.version }}</span>
              <span class="agent-detail__publisher">{{ detail.publisher || '—' }}</span>
            </div>
          </div>
        </header>

        <section class="agent-detail__section">
          <h5>简介</h5>
          <p>{{ detail.description }}</p>
        </section>

        <section class="agent-detail__section">
          <h5>关键指标</h5>
          <div class="agent-detail__kpis">
            <div class="kpi-mini">
              <b>{{ formatNum(detail.usage_count) }}</b><span>累计调用</span>
            </div>
            <div class="kpi-mini">
              <b>{{ detail.rating || '—' }}</b><span>评分</span>
            </div>
            <div class="kpi-mini">
              <b>{{ detail.tags?.length || 0 }}</b><span>能力标签</span>
            </div>
            <div class="kpi-mini">
              <b>{{ formatDate(detail.createdAt || detail.created_at) }}</b><span>发布时间</span>
            </div>
          </div>
        </section>

        <section v-if="detail.tags?.length" class="agent-detail__section">
          <h5>能力标签</h5>
          <div class="agent-detail__tags">
            <span v-for="t in detail.tags" :key="t" class="agent-card__tag">#{{ t }}</span>
          </div>
        </section>

        <section v-if="detail.linkedSkills?.length" class="agent-detail__section">
          <h5>关联技能</h5>
          <div class="agent-detail__skills">
            <div v-for="s in detail.linkedSkills" :key="s.id" class="skill-mini">
              <span class="skill-mini__name">{{ s.name }}</span>
              <span class="skill-mini__count">调用 {{ formatNum(s.usage_count) }}</span>
            </div>
          </div>
        </section>

        <section v-if="detail.system_prompt" class="agent-detail__section">
          <h5>系统提示词</h5>
          <pre class="agent-detail__prompt">{{ detail.system_prompt }}</pre>
        </section>

        <footer class="agent-detail__foot">
          <button class="btn btn--ghost" @click="drawerOpen = false">关闭</button>
          <button class="btn btn--primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            发起对话
          </button>
        </footer>
      </div>
    </el-drawer>

    <!-- ============== CREATE MODAL ============== -->
    <CreateAgentModal
      :open="createOpen"
      @close="createOpen = false"
      @submit="onCreate"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, markRaw } from 'vue'
import { listAgents, getAgentCategories, getAgentDetail } from '@/api/smart-center'
import { useCustomAgents } from '@/composables/useCustomAgents'
import { useToastStore } from '@/stores/toast'
import CreateAgentModal from '@/components/CreateAgentModal.vue'
import {
  Cellphone, Iphone, Cpu, Monitor, Phone, DataLine, Connection, Histogram, Link,
  Lightning, MagicStick, Star, Coin, DataAnalysis, DataBoard, SetUp, ChatLineSquare,
  User, Document, Tools, Compass, Discount, TrendCharts, PieChart, Setting, Headset,
  Share, Notebook, Aim, Sunny, Grid, PhoneFilled, UserFilled, StarFilled,
} from '@element-plus/icons-vue'

/* 后端 Material 图标名 -> Element Plus 图标组件的映射 */
const ICON_MAP = {
  smartphone: Cellphone, phone_iphone: Iphone, sim_card: Cpu, sensors: Monitor,
  developer_mode: Cpu, phone: Phone, phone_filled: PhoneFilled,
  battery_charging_full: Tools, speed: DataLine, cloud_sync: Connection, hub: Share,
  sync_alt: Connection, graphic_eq: Histogram, cable: Link, settings_ethernet: Connection,
  tune: Setting, psychology: MagicStick, settings_input_antenna: Compass,
  thermostat: Lightning, memory: Coin, precision_manufacturing: SetUp,
  solar_power: Lightning, radar: Compass, auto_awesome: Star, scatter_plot: Histogram,
  health_and_safety: Headset, shield: SetUp, task_alt: SetUp, monitor_heart: Headset,
  analytics: TrendCharts, rocket_launch: Discount, cyclone: Compass,
  workspace_premium: StarFilled, fact_check: Document, groups: User,
  router: Connection, network: Share, chip: Cpu, ai: MagicStick,
  signal: DataLine, search: Aim, tune_setting: Setting,
}
function iconName(name) { return markRaw(ICON_MAP[name] || MagicStick) }

/* ============== 分类元数据 (与 Skills 分类命名一致) ============== */
const CATEGORY_META = {
  terminal: {
    name: '用户终端智能化测试',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
  },
  network: {
    name: '星地网络智能化测试',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  },
  payload: {
    name: '载荷智能化测试',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',
  },
  e2e: {
    name: '全链路智能化测试',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><path d="M8.5 7.5 15.5 16.5M15.5 7.5 8.5 16.5"/></svg>',
  },
  custom: {
    name: '我的自定义智能体',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  },
}

/* ============== 分类调色板 (对齐 skill-card__icon 配色) ============== */
const CATEGORY_PALETTE = {
  terminal: { bg: 'rgba(16, 185, 129, 0.12)',  fg: '#10b981' }, /* emerald */
  network:  { bg: 'rgba(59, 130, 246, 0.12)',  fg: '#3b82f6' }, /* blue */
  payload:  { bg: 'rgba(245, 158, 11, 0.12)',  fg: '#f59e0b' }, /* amber */
  e2e:      { bg: 'rgba(139, 92, 246, 0.14)',  fg: 'var(--accent)' }, /* violet */
  custom:   { bg: 'var(--accent-soft)',        fg: 'var(--accent)' },
}
function iconStyle(a) {
  if (a.color_theme) {
    return { background: a.color_theme + '1a', color: a.color_theme }
  }
  const p = CATEGORY_PALETTE[a.category] || CATEGORY_PALETTE.custom
  return { background: p.bg, color: p.fg }
}
function detailStyle(a) {
  if (a.color_theme) {
    return { background: a.color_theme + '22', color: a.color_theme }
  }
  const p = CATEGORY_PALETTE[a.category] || CATEGORY_PALETTE.custom
  return { background: p.bg, color: p.fg }
}

/* ============== 三档分段 Tab 图标 ============== */
const TAB_ICONS = {
  all:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  builtin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>',
  custom:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
}

/* ============== STATE ============== */
const entering = ref(false)
const loading = ref(false)
const drawerOpen = ref(false)
const detail = ref(null)
const categoryList = ref([])
const typeTab = ref('all')          // 'all' | 'builtin' | 'custom'
const createOpen = ref(false)
const builtinList = ref([])

const { list: customAgents, addAgent, removeAgent } = useCustomAgents()
const toast = useToastStore()

const filter = reactive({ keyword: '' })

/* ============== 原始全部数据 ============== */
const allRaw = computed(() => {
  return [
    ...builtinList.value.map((a) => ({ ...a, type: 'builtin' })),
    ...customAgents.value.map((a) => ({ ...a, type: 'custom' })),
  ]
})

const totalCount = computed(() => allRaw.value.length)
const builtinCount = computed(() => builtinList.value.length)
const customCount = computed(() => customAgents.value.length)

const typeTabs = computed(() => [
  { key: 'all',     name: '全部',     icon: TAB_ICONS.all,     count: totalCount.value },
  { key: 'builtin', name: '系统内置', icon: TAB_ICONS.builtin, count: builtinCount.value },
  { key: 'custom',  name: '我的自定义', icon: TAB_ICONS.custom,  count: customCount.value },
])

/* 关键字过滤 */
function applyKeyword(arr) {
  if (!filter.keyword) return arr
  const kw = filter.keyword.toLowerCase()
  return arr.filter((a) =>
    a.name?.toLowerCase().includes(kw) ||
    a.description?.toLowerCase().includes(kw) ||
    (a.tags || []).some((t) => t.toLowerCase().includes(kw)),
  )
}

/* 按 tab 过滤 */
const currentList = computed(() => {
  let res = allRaw.value
  if (typeTab.value === 'builtin') res = res.filter((a) => a.type === 'builtin')
  if (typeTab.value === 'custom')  res = res.filter((a) => a.type === 'custom')
  return applyKeyword(res)
})

/* 按 category 分组 (custom 全部并入 "我的自定义智能体" 一组) */
const groupedList = computed(() => {
  const groups = []
  if (typeTab.value === 'all' || typeTab.value === 'custom') {
    const customs = currentList.value.filter((a) => a.type === 'custom')
    if (customs.length) {
      groups.push({
        key: 'custom',
        name: CATEGORY_META.custom.name,
        icon: CATEGORY_META.custom.icon,
        items: customs,
      })
    }
  }
  if (typeTab.value === 'all' || typeTab.value === 'builtin') {
    const builtins = currentList.value.filter((a) => a.type === 'builtin')
    const seen = new Map()
    builtins.forEach((a) => {
      const k = a.category || 'custom'
      if (!seen.has(k)) {
        const meta = CATEGORY_META[k] || { name: k, icon: '' }
        seen.set(k, { key: k, name: meta.name, icon: meta.icon, items: [] })
      }
      seen.get(k).items.push(a)
    })
    /* 保持 CATEGORY_META 顺序 */
    Object.keys(CATEGORY_META).forEach((k) => {
      if (seen.has(k)) groups.push(seen.get(k))
    })
  }
  return groups
})

/* ============== 辅助方法 ============== */
function categoryName(key) {
  return CATEGORY_META[key]?.name || key || '通用'
}
function formatNum(n) {
  n = n || 0
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000)  return (n / 1000).toFixed(1) + 'k'
  return String(n)
}
function formatDate(ts) {
  if (!ts) return '—'
  if (typeof ts === 'number') return new Date(ts).toISOString().slice(0, 10)
  if (typeof ts === 'string' && ts.length > 10) return ts.slice(0, 10)
  return ts || '—'
}

function setTypeTab(tab) {
  typeTab.value = tab
  filter.keyword = ''
}

function reset() {
  filter.keyword = ''
  typeTab.value = 'all'
}

function onCreate(draft) {
  const a = addAgent(draft)
  toast.info('已创建', `「${a.name}」已加入「我的智能体」`)
  if (typeTab.value !== 'custom') setTypeTab('custom')
}

function confirmDelete(a) {
  if (!window.confirm(`确定删除「${a.name}」吗?该操作不可恢复。`)) return
  removeAgent(a.id)
  toast.success('已删除', a.name)
}

async function open(a) {
  drawerOpen.value = true
  detail.value = a
  try {
    const full = await getAgentDetail(a.id)
    if (full) detail.value = { ...a, ...full }
  } catch { /* fallback to card data */ }
}

async function loadBuiltin() {
  loading.value = true
  try {
    const data = await listAgents({ pageNo: 1, pageSize: 200 })
    builtinList.value = data.list || []
  } finally {
    loading.value = false
  }
}

watch(customAgents, () => { /* computed 自动响应 */ }, { deep: true })

onMounted(() => {
  requestAnimationFrame(() => (entering.value = true))
  loadBuiltin()
})
onUnmounted(() => { entering.value = false })
</script>

<style scoped>
.page { padding: 24px 32px 40px; max-width: 1440px; margin: 0 auto; }

/* ============== HERO (对齐 skills-hero) ============== */
.agents-hero {
  display: flex; align-items: center; justify-content: space-between;
  gap: 20px;
  padding: 22px 28px; margin-bottom: 18px;
  border-radius: 16px;
  background:
    linear-gradient(135deg, var(--accent-soft) 0%, transparent 60%),
    var(--surface);
  border: 1px solid var(--line);
}
.agents-hero__text h3 {
  margin: 0 0 4px; font-size: 18px; font-weight: 600;
  color: var(--ink); letter-spacing: 0.2px;
}
.agents-hero__text p {
  margin: 0; font-size: 13px; color: var(--ink-3); line-height: 1.6;
}
.agents-hero__stats { display: flex; gap: 10px; flex-shrink: 0; }
.stat-card {
  display: flex; flex-direction: column; gap: 2px;
  padding: 10px 18px; border-radius: 12px; min-width: 92px;
  background: var(--surface-2); border: 1px solid var(--line);
  text-align: center;
}
.stat-card b { font-size: 18px; font-weight: 600; color: var(--accent); }
.stat-card span { font-size: 11px; color: var(--ink-3); }

/* ============== TOOLBAR (对齐 skills-toolbar) ============== */
.agents-toolbar {
  display: flex; align-items: center; gap: 12px;
  flex-wrap: wrap; margin-bottom: 18px;
}
.agents-toolbar__left { display: flex; align-items: center; gap: 12px; flex: 1; flex-wrap: wrap; }
.agents-toolbar__right { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

/* 分段 Tabs (对齐 skills-type-tabs) */
.agents-type-tabs {
  display: inline-flex; padding: 3px;
  background: var(--surface-2); border: 1px solid var(--line);
  border-radius: 10px;
}
.agents-type-tab {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px; font-size: 12.5px; font-weight: 500;
  background: transparent; color: var(--ink-2);
  border: 0; border-radius: 7px; cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.agents-type-tab:hover { color: var(--ink); }
.agents-type-tab.is-active {
  background: var(--surface); color: var(--accent);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.agents-type-tab__icon { display: inline-flex; width: 14px; height: 14px; }
.agents-type-tab__icon :deep(svg) { width: 14px; height: 14px; }
.agents-type-tab__count {
  font-size: 10.5px; padding: 0 6px; border-radius: 999px;
  background: var(--surface); color: var(--ink-3); font-weight: 500;
  border: 1px solid var(--line);
}
.agents-type-tab.is-active .agents-type-tab__count {
  background: var(--accent-soft); color: var(--accent); border-color: transparent;
}

/* 搜索框 (对齐 skills-toolbar .search-input) */
.search-input {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 10px;
  background: var(--surface); border: 1px solid var(--line);
  width: 280px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.search-input:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 12%, transparent);
}
.search-input svg { width: 16px; height: 16px; color: var(--ink-3); flex-shrink: 0; }
.search-input input {
  flex: 1; background: transparent; border: 0; outline: 0;
  font-size: 12.5px; color: var(--ink);
  font-family: inherit;
}

.agents-toolbar__new {
  padding: 6px 14px;
  font-size: 12.5px;
}

/* ============== GROUPED LIST ============== */
.agents-group { margin-bottom: 28px; }
.agents-group__head {
  display: flex; align-items: center; gap: 8px;
  padding: 0 4px;
  margin-bottom: 12px;
}
.agents-group__icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px;
  color: var(--accent);
}
.agents-group__icon :deep(svg) { width: 20px; height: 20px; }
.agents-group__head h4 {
  margin: 0; font-size: 15px; font-weight: 600; color: var(--ink);
}
.agents-group__count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 22px; height: 20px; padding: 0 7px;
  border-radius: 6px;
  background: var(--surface-2); color: var(--ink-3);
  font-size: 11px; font-weight: 600;
}

.agents-grid {
  display: grid; gap: 14px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

/* ============== AGENT CARD (对齐 skill-card) ============== */
.agent-card {
  padding: 16px; border-radius: 14px; cursor: pointer;
  background: var(--surface); border: 1px solid var(--line);
  transition: all var(--dur-fast) var(--ease);
  display: flex; flex-direction: column; gap: 10px;
  position: relative;
}
.agent-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--accent);
}
.agent-card.is-custom {
  border-color: color-mix(in srgb, var(--accent) 28%, var(--line));
  background:
    linear-gradient(180deg,
      color-mix(in srgb, var(--accent) 4%, var(--surface)) 0%,
      var(--surface) 60%);
}
.agent-card.is-custom:hover {
  border-color: var(--accent);
}

.agent-card__icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: grid; place-items: center; flex-shrink: 0;
}
.agent-card.is-terminal .agent-card__icon { background: rgba(16, 185, 129, 0.12); color: #10b981; }
.agent-card.is-network  .agent-card__icon { background: rgba(59, 130, 246, 0.12); color: #3b82f6; }
.agent-card.is-payload  .agent-card__icon { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }
.agent-card.is-e2e      .agent-card__icon { background: var(--accent-soft);     color: var(--accent); }
.agent-card.is-custom   .agent-card__icon { background: var(--accent-soft);     color: var(--accent); }

.agent-card__name {
  margin: 0;
  font-size: 14.5px; font-weight: 600;
  color: var(--ink); line-height: 1.3;
  display: -webkit-box; -webkit-line-clamp: 1;
  -webkit-box-orient: vertical; overflow: hidden;
}
.agent-card__desc {
  margin: 0;
  font-size: 12px; color: var(--ink-3); line-height: 1.55;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
  min-height: 38px;
}
.agent-card__foot {
  display: flex; gap: 8px; align-items: center;
  padding-top: 8px; margin-top: auto;
  border-top: 1px dashed var(--line);
}
.agent-card__cat {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 8px; border-radius: 999px;
  font-size: 10.5px; font-weight: 500;
}
.agent-card__cat-dot { width: 4px; height: 4px; border-radius: 50%; background: currentColor; }
.agent-card__cat.is-terminal { background: rgba(16, 185, 129, 0.12); color: #10b981; }
.agent-card__cat.is-network  { background: rgba(59, 130, 246, 0.12); color: #3b82f6; }
.agent-card__cat.is-payload  { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }
.agent-card__cat.is-e2e      { background: var(--accent-soft);     color: var(--accent); }
.agent-card__cat.is-custom   { background: var(--accent-soft);     color: var(--accent); }

.agent-card__del {
  margin-left: auto;
  width: 28px; height: 28px; border: 0; border-radius: 6px;
  background: transparent; color: var(--ink-3);
  cursor: pointer;
  display: grid; place-items: center;
  transition: all 0.15s;
  opacity: 0;
}
.agent-card:hover .agent-card__del { opacity: 1; }
.agent-card__del:hover { background: #fee2e2; color: #f5365c; }
.agent-card__del svg { width: 14px; height: 14px; }

.agent-card__tag {
  font-size: 10.5px; padding: 2px 7px; border-radius: 6px;
  background: var(--surface-2); color: var(--ink-3); font-weight: 500;
}

/* ============== LOADING / EMPTY (对齐 skills) ============== */
.agents-loading,
.agents-empty {
  margin: 60px auto; padding: 40px 32px; max-width: 480px; text-align: center;
  border: 1px dashed var(--line); border-radius: 16px;
  background: var(--surface-2);
  display: flex; flex-direction: column; align-items: center; gap: 10px;
}
.agents-loading { color: var(--ink-3); font-size: 13px; }
.spinner {
  width: 36px; height: 36px; border-radius: 50%;
  border: 3px solid var(--line); border-top-color: var(--accent);
  animation: agents-spin 0.8s linear infinite;
  margin: 0 auto 12px;
}
@keyframes agents-spin { to { transform: rotate(360deg); } }

.agents-empty__icon {
  width: 56px; height: 56px;
  display: grid; place-items: center;
  color: var(--ink-3); opacity: 0.6;
  margin-bottom: 4px;
}
.agents-empty__icon svg { width: 48px; height: 48px; }
.agents-empty h4 { margin: 0; font-size: 15px; font-weight: 500; color: var(--ink); }
.agents-empty p  { margin: 0 0 4px; font-size: 12.5px; color: var(--ink-3); }
.agents-empty .btn { margin-top: 8px; }

/* ============== DRAWER (对齐 skill-detail) ============== */
.agent-detail { padding: 0 24px 24px; }
.agent-detail__head {
  position: relative; display: flex; align-items: center; gap: 14px;
  padding: 28px 20px 20px; margin: 0 -24px 18px;
  border-bottom: 1px solid var(--line-2);
}
.agent-detail__close {
  position: absolute; top: 14px; right: 14px;
  width: 30px; height: 30px; border-radius: 8px;
  background: var(--surface-2); border: 0; cursor: pointer;
  display: grid; place-items: center; color: var(--ink-3);
  transition: all 0.15s;
}
.agent-detail__close:hover { color: var(--ink); }
.agent-detail__icon {
  width: 56px; height: 56px; border-radius: 14px;
  display: grid; place-items: center; flex-shrink: 0;
}
.agent-detail__head h3 { margin: 0 0 6px; font-size: 17px; font-weight: 600; }
.agent-detail__meta { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.agent-detail__cat {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 8px; border-radius: 999px;
  font-size: 10.5px; font-weight: 500;
}
.agent-detail__cat-dot { width: 4px; height: 4px; border-radius: 50%; background: currentColor; }
.agent-detail__cat.is-terminal { background: rgba(16, 185, 129, 0.12); color: #10b981; }
.agent-detail__cat.is-network  { background: rgba(59, 130, 246, 0.12); color: #3b82f6; }
.agent-detail__cat.is-payload  { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }
.agent-detail__cat.is-e2e      { background: var(--accent-soft);     color: var(--accent); }
.agent-detail__cat.is-custom   { background: var(--accent-soft);     color: var(--accent); }
.agent-detail__version, .agent-detail__publisher { font-size: 11px; color: var(--ink-3); }

.agent-detail__section { margin-bottom: 18px; }
.agent-detail__section h5 { margin: 0 0 8px; font-size: 12.5px; color: var(--ink-3); font-weight: 500; }
.agent-detail__section p  { margin: 0; font-size: 13px; line-height: 1.6; color: var(--ink-2); }
.agent-detail__prompt {
  margin: 0; padding: 12px;
  background: var(--surface-2); border-radius: 8px;
  font-size: 12px; line-height: 1.6;
  white-space: pre-wrap; word-break: break-word;
  color: var(--ink-2);
  font-family: 'JetBrains Mono', Menlo, Consolas, monospace;
}

.agent-detail__kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.kpi-mini {
  padding: 10px; border-radius: 10px;
  background: var(--surface-2); border: 1px solid var(--line);
  display: flex; flex-direction: column; gap: 2px; text-align: center;
}
.kpi-mini b { font-size: 14px; font-weight: 600; }
.kpi-mini span { font-size: 10.5px; color: var(--ink-3); }

.agent-detail__tags { display: flex; gap: 6px; flex-wrap: wrap; }
.agent-detail__skills { display: flex; flex-direction: column; gap: 6px; }
.skill-mini {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 12px; border-radius: 8px;
  background: var(--surface-2); border: 1px solid var(--line);
  font-size: 12.5px;
}
.skill-mini__name { color: var(--ink); font-weight: 500; }
.skill-mini__count { color: var(--ink-3); font-size: 11px; }

.agent-detail__foot {
  display: flex; gap: 8px;
  padding-top: 16px; border-top: 1px solid var(--line-2);
  justify-content: flex-end;
}

/* ============== BUTTONS (对齐 skill 模块 .btn) ============== */
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 10px; font-size: 13px;
  border: 1px solid var(--line); background: var(--surface);
  color: var(--ink-2); cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.btn:hover { background: var(--surface-2); color: var(--ink); }
.btn--ghost { background: transparent; }
.btn--primary { background: var(--accent); color: #fff; border-color: var(--accent); }
.btn--primary:hover { background: var(--accent); color: #fff; filter: brightness(1.08); }
.btn--sm { padding: 5px 12px; font-size: 12px; }
.btn svg { width: 14px; height: 14px; }

/* ============== RESPONSIVE (对齐 skills) ============== */
@media (max-width: 960px) {
  .agents-hero { flex-direction: column; align-items: flex-start; }
  .agents-hero__stats { width: 100%; justify-content: stretch; }
  .stat-card { flex: 1; }
}
@media (max-width: 720px) {
  .page { padding: 16px 16px 32px; }
  .agents-toolbar { flex-direction: column; align-items: stretch; }
  .agents-toolbar__left, .agents-toolbar__right { width: 100%; }
  .agents-type-tabs { width: 100%; justify-content: space-between; }
  .agents-type-tab { flex: 1; justify-content: center; padding: 7px 8px; }
  .search-input { width: 100%; }
  .agents-toolbar__new { width: 100%; justify-content: center; }
  .agents-grid { grid-template-columns: 1fr; }
  .agent-detail__kpis { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .stat-card { min-width: 0; padding: 8px 10px; }
  .stat-card b { font-size: 16px; }
  .agent-detail__kpis { grid-template-columns: 1fr 1fr; }
}
</style>
