<template>
  <div class="page page-plaza" :class="{ 'view-enter': entering }">
    <!-- ============== HERO ============== -->
    <section class="plaza-hero">
      <div class="plaza-hero__text">
        <h3>员工广场 · 探索与订阅数字员工</h3>
        <p>面向卫星互联网场景的旗舰 / 专业两类数字员工，覆盖终端 / 星地链路 / 载荷 / 全链路四大领域。订阅后可加入我的员工，与团队共享使用。</p>
        <div class="plaza-hero__stats">
          <div><b>{{ countOf('super') }}</b><span>超级员工</span></div>
          <div><b>{{ countOf('professional') }}</b><span>专业员工</span></div>
        </div>
      </div>
      <div class="plaza-hero__art">
        <div class="floating-cards">
          <div class="float-card float-card--1">🛰 超级员工</div>
          <div class="float-card float-card--2">🜲 星地网络</div>
          <div class="float-card float-card--3">⏚ 卫星载荷</div>
          <div class="float-card float-card--4">⏵ 全链路</div>
        </div>
      </div>
    </section>

    <!-- ============== FILTER TABS ============== -->
    <div class="plaza-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="plaza-tab"
        :class="['plaza-tab--' + tab.tone, { 'is-active': filter.kind === tab.value }]"
        @click="onTabChange(tab.value)"
      >
        <i v-if="tab.tone" class="plaza-tab__dot" />
        {{ tab.label }}<span v-if="tab.count != null">{{ tab.count }}</span>
      </button>

      <div class="plaza-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <input
          v-model="filter.q"
          type="text"
          placeholder="搜索员工名称、能力或关键词…"
          @input="onSearch"
        />
      </div>
    </div>

    <!-- ============== CHIP FILTERS ============== -->
    <div class="plaza-chips">
      <div class="plaza-chip-group">
        <span class="plaza-chip-label">领域</span>
        <button
          v-for="opt in domainOpts"
          :key="opt.value || 'all'"
          class="plaza-chip"
          :class="{ 'is-active': filter.domain === opt.value }"
          @click="onChip('domain', opt.value)"
        >{{ opt.label }}</button>
      </div>
      <div class="plaza-chip-group">
        <span class="plaza-chip-label">排序</span>
        <button
          v-for="opt in sortOpts"
          :key="opt.value || 'default'"
          class="plaza-chip"
          :class="{ 'is-active': filter.sort === opt.value }"
          @click="onChip('sort', opt.value)"
        >{{ opt.label }}</button>
      </div>
      <div class="plaza-chip-summary">
        共 <b>{{ total }}</b> 个员工
      </div>
    </div>

    <!-- ============== GRID · 分级分组渲染 ============== -->
    <div v-loading="loading" v-if="list.length" class="plaza-sections">
      <!-- 超级员工 -->
      <section v-if="grouped.super.length" class="plaza-section plaza-section--super">
        <header class="plaza-section__head">
          <div class="plaza-section__title">
            <span class="plaza-section__icon plaza-section__icon--super">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2 L20 8 L17 20 L7 20 L4 8 Z" />
                <path d="M12 2 L8 8 L12 14 L16 8 Z" />
                <path d="M4 8 L12 14 L20 8" />
              </svg>
            </span>
            <div>
              <h4>超级员工 <span class="plaza-section__count">{{ grouped.super.length }}</span></h4>
              <p>旗舰综合能力体 · 端到端智能化</p>
            </div>
          </div>
          <span class="plaza-section__pill">S · TIER</span>
        </header>
        <div class="plaza-grid plaza-grid--super">
          <div
            v-for="e in grouped.super"
            :key="e.id"
            :id="`emp-${e.id}`"
            class="plaza-grid__item"
          >
            <EmployeeCard
              :employee="e"
              :hireable="!isHired(e.id)"
              :super-series="superSeries"
              @hire="onHire"
              @release="onRelease"
            />
          </div>
        </div>
      </section>

      <!-- 专业员工 -->
      <section v-if="grouped.professional.length" class="plaza-section plaza-section--professional">
        <header class="plaza-section__head">
          <div class="plaza-section__title">
            <span class="plaza-section__icon plaza-section__icon--professional">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2l3.5 7 7.5 1-5.5 5.3 1.3 7.7L12 19.5 5.2 23l1.3-7.7L1 10l7.5-1L12 2z" />
              </svg>
            </span>
            <div>
              <h4>专业员工 <span class="plaza-section__count">{{ grouped.professional.length }}</span></h4>
              <p>场景专家 · 领域纵深 · 可独立完成测试 / 分析 / 编排任务</p>
            </div>
          </div>
          <span class="plaza-section__pill">A · TIER</span>
        </header>
        <div class="plaza-grid">
          <div
            v-for="e in grouped.professional"
            :key="e.id"
            :id="`emp-${e.id}`"
            class="plaza-grid__item"
          >
            <EmployeeCard
              :employee="e"
              :hireable="!isHired(e.id)"
              :super-series="superSeries"
              @hire="onHire"
              @release="onRelease"
            />
          </div>
        </div>
      </section>
    </div>

    <div v-else-if="!loading" class="plaza-empty">
      <div class="plaza-empty__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
        </svg>
      </div>
      <h4>没有匹配的员工</h4>
      <p>尝试调整筛选条件或重置搜索</p>
      <button class="btn btn--ghost btn--sm" @click="resetFilter">重置筛选</button>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'Plaza' })
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { listEmployees as getEmployees, listSuperSeries, hireEmployee, releaseEmployee, listMyEmployees as getMyEmployees } from '@/api/employees'
import EmployeeCard from '@/components/EmployeeCard.vue'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const route = useRoute()
const toast = useToastStore()

const entering = ref(true)
const filter = ref({ q: '', kind: '', domain: '', sort: '', pageNo: 1, pageSize: 60 })
const list = ref([])
const total = ref(0)
const myIds = ref(new Set())
const loading = ref(false)
const superSeries = ref([])
let searchTimer = null

/* 二级分类 Tab · 全部 / 超级员工 / 专业员工 */
const tabs = computed(() => [
  { value: '',             label: '全部',     count: total.value,         tone: '' },
  { value: 'super',        label: '超级员工', count: countOf('super'),    tone: 'super' },
  { value: 'professional', label: '专业员工', count: countOf('professional'), tone: 'professional' },
])

function countOf(kind) {
  return list.value.filter((e) => e.kind === kind).length
}

const domainOpts = [
  { value: '',           label: '全部' },
  { value: '终端',       label: '终端' },
  { value: '星地链路',   label: '星地链路' },
  { value: '载荷',       label: '载荷' },
  { value: '全链路',     label: '全链路' },
  { value: '运维',       label: '运维' },
]

const sortOpts = [
  { value: '',        label: '默认' },
  { value: 'usage',   label: '按调用次数' },
  { value: 'rating',  label: '按评分' },
  { value: 'newest',  label: '按最新' },
]

/* 按级别分组并保持稳定的展示顺序：super → professional */
const grouped = computed(() => {
  const superList = []
  const proList = []
  list.value.forEach((e) => {
    if (e.kind === 'super') superList.push(e)
    else if (e.kind === 'professional') proList.push(e)
  })
  /* 超级员工按 tier 升序展示，保证固定 4 大类别顺序 */
  superList.sort((a, b) => (a.tier || 99) - (b.tier || 99))
  return { super: superList, professional: proList }
})

async function load() {
  loading.value = true
  try {
    const data = await getEmployees({
      q: filter.value.q,
      kind: filter.value.kind,
      domain: filter.value.domain,
      sort: filter.value.sort,
      pageNo: filter.value.pageNo,
      pageSize: filter.value.pageSize,
    })
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

async function loadSuperSeries() {
  try {
    superSeries.value = await listSuperSeries()
  } catch (e) {
    superSeries.value = []
  }
}

async function refreshMyIds() {
  try {
    const { list: mine } = await getMyEmployees()
    myIds.value = new Set(mine.map((e) => e.id))
  } catch (e) { /* ignore */ }
}

function isHired(id) { return myIds.value.has(id) }

function resetFilter() {
  filter.value = { q: '', kind: '', domain: '', sort: '', pageNo: 1, pageSize: 60 }
  load()
}

function onTabChange(kind) {
  filter.value.kind = kind
  filter.value.pageNo = 1
  load()
}

function onChip(key, value) {
  filter.value[key] = filter.value[key] === value ? '' : value
  filter.value.pageNo = 1
  load()
}

function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    filter.value.pageNo = 1
    load()
  }, 280)
}

async function onHire(emp) {
  await hireEmployee(emp.id)
  toast.success(`已添加「${emp.name}」到我的员工`)
  await refreshMyIds()
}
async function onRelease(emp) {
  await releaseEmployee(emp.id)
  toast.info(`已移出「${emp.name}」`)
  await refreshMyIds()
}

onMounted(async () => {
  setTimeout(() => { entering.value = false }, 480)
  await Promise.all([loadSuperSeries(), refreshMyIds(), load()])
  if (route.query.id) {
    setTimeout(() => {
      const el = document.getElementById(`emp-${route.query.id}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 220)
  }
})
</script>

<style scoped>
.page-plaza {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}

/* ============== HERO ============== */
.plaza-hero {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 24px;
  padding: 28px 32px;
  margin-bottom: 8px;
  background: linear-gradient(135deg, var(--accent-soft), transparent 60%), var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
  backdrop-filter: var(--glass-blur);
}
.plaza-hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 360px;
  height: 360px;
  background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
  filter: blur(40px);
  opacity: 0.5;
  pointer-events: none;
}
.plaza-hero__text { position: relative; z-index: 1; }
.plaza-hero__text h3 {
  font-size: 28px;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin-bottom: 10px;
  color: var(--ink);
}
.plaza-hero__text p {
  color: var(--ink-2);
  margin: 0 0 18px;
  font-size: 13.5px;
  line-height: 1.65;
  max-width: 620px;
}
.plaza-hero__stats {
  display: flex;
  gap: 28px;
  flex-wrap: wrap;
}
.plaza-hero__stats > div {
  display: flex;
  flex-direction: column;
}
.plaza-hero__stats b {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 600;
  background: linear-gradient(120deg, var(--accent), var(--accent-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: -0.02em;
}
.plaza-hero__stats span {
  font-size: 11px;
  color: var(--ink-3);
  margin-top: 2px;
}
.plaza-hero__art {
  position: relative;
  min-height: 180px;
  z-index: 1;
}

/* ============== FLOATING CARDS ============== */
.floating-cards {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 180px;
}
.float-card {
  position: absolute;
  padding: 10px 16px;
  background: var(--surface);
  border: 1px solid var(--line-2);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
  box-shadow: var(--shadow);
  backdrop-filter: var(--glass-blur);
  animation: floatY 6s ease-in-out infinite;
  white-space: nowrap;
}
.float-card--1 { top: 0;     left: 0;  animation-delay: 0s;   }
.float-card--2 { top: 20%;   right: 0; animation-delay: 1.2s; }
.float-card--3 { bottom: 20%; left: 10%; animation-delay: 2.4s; }
.float-card--4 { bottom: 0;  right: 20%; animation-delay: 3.6s; }
@keyframes floatY {
  50% { transform: translateY(-12px); }
}

/* ============== TABS + SEARCH ============== */
.plaza-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 12px;
  flex-wrap: wrap;
}
.plaza-tab {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-2);
  border-radius: 8px;
  transition: all var(--dur-fast) var(--ease);
  background: transparent;
  border: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.plaza-tab:hover { color: var(--ink); }
.plaza-tab.is-active {
  background: var(--surface);
  color: var(--ink);
  box-shadow: var(--shadow-sm);
}
.plaza-tab span {
  font-family: var(--font-mono);
  font-size: 10.5px;
  opacity: 0.7;
  padding: 0 5px;
  border-radius: 4px;
  background: var(--surface-2);
  color: var(--ink-3);
}
.plaza-tab.is-active span {
  background: var(--accent-soft);
  color: var(--accent);
}
/* Tab 角点：三级分级 */
.plaza-tab__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.plaza-tab--super .plaza-tab__dot {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  box-shadow: 0 0 4px rgba(139, 92, 246, 0.5);
}
.plaza-tab--professional .plaza-tab__dot {
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
}
.plaza-tab--super.is-active span { background: rgba(139, 92, 246, 0.12); color: var(--ink); }
.plaza-tab--super.is-active { box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.3); }

.plaza-search {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  min-width: 240px;
}
.plaza-search svg { width: 14px; height: 14px; color: var(--ink-3); flex-shrink: 0; }
.plaza-search input {
  flex: 1;
  background: transparent;
  border: 0;
  outline: 0;
  font-size: 12.5px;
  color: var(--ink);
  min-width: 0;
}
.plaza-search input::placeholder { color: var(--ink-3); }

/* ============== CHIP FILTERS ============== */
.plaza-chips {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  padding: 10px 14px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
}
.plaza-chip-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.plaza-chip-label {
  font-size: 11.5px;
  color: var(--ink-3);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-right: 4px;
}
.plaza-chip {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-2);
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: var(--r-pill);
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
  font-family: var(--font-body);
  line-height: 1.4;
}
.plaza-chip:hover {
  color: var(--ink);
  border-color: var(--line-2);
}
.plaza-chip.is-active {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: var(--accent);
}
.plaza-chip-summary {
  margin-left: auto;
  font-size: 12px;
  color: var(--ink-3);
  font-family: var(--font-mono);
}
.plaza-chip-summary b { color: var(--ink); font-weight: 600; }

/* ============== GRID ============== */
.plaza-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
}
.plaza-grid__item { min-width: 0; }

/* ============== SECTIONS · 分级分组容器 ============== */
.plaza-sections {
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.plaza-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
}
.plaza-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-blur);
  position: relative;
  overflow: hidden;
}
/* 各级别 section 头左侧色条 */
.plaza-section__head::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
}
.plaza-section--super .plaza-section__head {
  background: linear-gradient(120deg, rgba(139, 92, 246, 0.05), transparent 60%), var(--surface);
  border-color: rgba(139, 92, 246, 0.18);
}
.plaza-section--super .plaza-section__head::before {
  background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 50%, #67e8f9 100%);
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.4);
}
.plaza-section--professional .plaza-section__head::before {
  background: linear-gradient(180deg, var(--accent) 0%, var(--accent-2) 100%);
}
.plaza-section__title {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.plaza-section__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid var(--line);
}
.plaza-section__icon svg { width: 18px; height: 18px; }
.plaza-section__icon--super {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.25);
  color: #8b5cf6;
  box-shadow: 0 2px 8px -2px rgba(139, 92, 246, 0.35);
}
.plaza-section__icon--professional {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: rgba(139, 92, 246, 0.32);
}
.plaza-section__title h4 {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--ink);
  margin: 0;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 8px;
}
.plaza-section--super .plaza-section__title h4 {
  color: var(--ink);
  letter-spacing: -0.01em;
}
.plaza-section__count {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 4px;
  background: var(--surface-2);
  color: var(--ink-3);
  letter-spacing: 0.04em;
  -webkit-text-fill-color: var(--ink-3);
}
.plaza-section--super .plaza-section__count {
  background: rgba(139, 92, 246, 0.1);
  color: var(--ink-3);
  -webkit-text-fill-color: var(--ink-3);
}
.plaza-section__title p {
  font-size: 11.5px;
  color: var(--ink-3);
  margin: 3px 0 0;
  font-family: var(--font-mono);
  letter-spacing: 0.02em;
}
.plaza-section__pill {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.14em;
  padding: 4px 10px;
  border-radius: 999px;
  flex-shrink: 0;
}
.plaza-section--super .plaza-section__pill {
  background: rgba(139, 92, 246, 0.1);
  color: var(--ink-2);
  border: 1px solid rgba(139, 92, 246, 0.25);
}
.plaza-section--professional .plaza-section__pill {
  background: var(--accent-soft);
  color: var(--accent);
  border: 1px solid rgba(139, 92, 246, 0.3);
}
/* 超级员工网格：稍宽以突出旗舰感 */
.plaza-grid--super {
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 22px;
}

/* ============== EMPTY ============== */
.plaza-empty {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 60px 20px;
  text-align: center;
  color: var(--ink-3);
  background: var(--surface);
  border: 1px dashed var(--line);
  border-radius: var(--radius-lg);
  display: flex;
}
.plaza-empty__icon svg {
  width: 28px;
  height: 28px;
  opacity: 0.5;
  color: var(--ink-3);
}
.plaza-empty h4 {
  font-size: 15px;
  color: var(--ink-2);
  margin-top: 4px;
}
.plaza-empty p {
  font-size: 12.5px;
  color: var(--ink-3);
  margin: 0 0 10px;
}

/* ============== ENTER ANIMATION ============== */
.view-enter {
  animation: viewEnter 0.42s var(--ease) both;
}
@keyframes viewEnter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ============== RESPONSIVE ============== */
@media (max-width: 1024px) {
  .plaza-hero { grid-template-columns: 1fr; padding: 22px 24px; }
  .plaza-hero__art { min-height: 160px; }
  .plaza-section__head { padding: 12px 14px; }
  .plaza-section__title h4 { font-size: 15px; }
  .plaza-grid--super { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
}
@media (max-width: 720px) {
  .plaza-tabs { padding: 4px; }
  .plaza-tab { padding: 7px 12px; font-size: 12.5px; }
  .plaza-search { min-width: 0; width: 100%; margin-left: 0; }
  .plaza-chips { gap: 12px; padding: 8px 12px; }
  .plaza-chip-summary { width: 100%; margin-left: 0; }
  .plaza-grid { grid-template-columns: 1fr; }
  .plaza-grid--super { grid-template-columns: 1fr; gap: 16px; }
  .plaza-hero__text h3 { font-size: 22px; }
  .plaza-hero__stats { gap: 18px; }
  .plaza-hero__stats b { font-size: 22px; }
  .plaza-section__head { flex-wrap: wrap; gap: 10px; }
  .plaza-section__pill { order: -1; }
  .plaza-section__title p { font-size: 11px; }
}
</style>
