<template>
  <div class="view view--active" :class="{ 'view-enter': entering }">
    <!-- ============== HERO ============== -->
    <section class="view__hero">
      <div class="hero__text">
        <div class="hero__eyebrow">
          <span class="hero__eyebrow-dot" />OrbitalCommand · Live Status
        </div>
        <h2 class="hero__title">
          欢迎回来，<span class="hero__name">{{ user.name }}</span>
        </h2>
        <p class="hero__desc">
          当前星座系统运行平稳，<b>138 颗</b>在轨卫星健康度 <b>96.4%</b>。今天有
          <b>17 条</b>告警待处理，<b>1,248 个</b>任务已完成，平均响应
          <b>4.2 分钟</b> — 比昨日提升 <b>8.4%</b>。
        </p>
        <div class="hero__actions">
          <button class="btn btn--primary" @click="router.push('/plaza')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.4"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><path d="M14 20c0-2 2-3.5 4-3.5s4 1.5 4 3.5"/>
            </svg>
            打开员工广场
          </button>
          <button class="btn btn--ghost" @click="router.push('/tasks')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12h4l3-9 4 18 3-9h4"/>
            </svg>
            查看任务监控
          </button>
        </div>
      </div>

      <div class="hero__visual">
        <div class="orbit-stage">
          <svg class="orbit-stage__svg" viewBox="0 0 400 400">
            <defs>
              <radialGradient id="orbit-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.45" />
                <stop offset="100%" stop-color="var(--accent)" stop-opacity="0" />
              </radialGradient>
            </defs>
            <circle cx="200" cy="200" r="180" fill="url(#orbit-glow)" />
            <ellipse class="orbit-ellipse" cx="200" cy="200" rx="170" ry="50" fill="none" stroke="var(--accent)" stroke-width="1" opacity="0.35" />
            <ellipse class="orbit-ellipse" cx="200" cy="200" rx="170" ry="50" fill="none" stroke="var(--accent-2)" stroke-width="1" opacity="0.25" transform="rotate(60 200 200)" />
            <ellipse class="orbit-ellipse" cx="200" cy="200" rx="170" ry="50" fill="none" stroke="var(--info)" stroke-width="1" opacity="0.2" transform="rotate(-60 200 200)" />
            <circle class="orbit-pulse" cx="200" cy="200" r="50" fill="none" />
            <circle class="orbit-pulse" cx="200" cy="200" r="50" fill="none" style="animation-delay: 1s" />
            <circle class="orbit-pulse" cx="200" cy="200" r="50" fill="none" style="animation-delay: 2s" />
            <circle class="orbit-core" cx="200" cy="200" r="6" />
            <circle cx="370" cy="200" r="4" fill="var(--accent)" />
            <circle cx="30"  cy="200" r="4" fill="var(--accent-2)" />
            <circle cx="200" cy="30"  r="4" fill="var(--info)" />
            <circle cx="200" cy="370" r="4" fill="var(--warn)" />
          </svg>
          <span class="sat-pin" style="--x: 92%; --y: 50%; --d: 0s"><i />GW-03</span>
          <span class="sat-pin" style="--x: 8%;  --y: 50%; --d: 0.8s"><i />SAT-128</span>
          <span class="sat-pin" style="--x: 50%; --y: 6%;  --d: 1.6s"><i />B-12</span>
          <span class="sat-pin" style="--x: 50%; --y: 94%; --d: 2.4s"><i />TC-02</span>
        </div>
      </div>
    </section>

    <!-- ============== KPI ROW ============== -->
    <section class="kpi-row">
      <div v-for="k in kpis" :key="k.key" class="kpi-card">
        <div class="kpi-card__head">
          <span class="kpi-card__label">{{ k.label }}</span>
          <span class="trend" :class="k.up ? 'trend--up' : 'trend--down'">
            {{ k.up ? '+' : '' }}{{ k.trend }}%
          </span>
        </div>
        <div class="kpi-card__value">{{ formatValue(k.value) }}<small>{{ k.unit }}</small></div>
        <div class="kpi-card__chart">
          <canvas :ref="el => bindSpark(el, k)"></canvas>
        </div>
        <div class="kpi-card__foot"><strong>{{ k.desc }}</strong></div>
      </div>
    </section>

    <!-- ============== TRAFFIC + BEAM ============== -->
    <section class="grid-2col">
      <div class="panel">
        <header class="panel__head">
          <div>
            <h3 class="panel__title">实时流量监控</h3>
            <p class="panel__hint">过去 24h 上/下行与测控流量趋势（单位：Mbps）</p>
          </div>
          <div class="panel__actions">
            <div class="seg-toggle seg-toggle--sm">
              <button :class="{ 'is-active': trafficRange === '24h' }" @click="trafficRange = '24h'">24h</button>
              <button :class="{ 'is-active': trafficRange === '7d' }"  @click="trafficRange = '7d'">7d</button>
              <button :class="{ 'is-active': trafficRange === '30d' }" @click="trafficRange = '30d'">30d</button>
            </div>
          </div>
        </header>
        <div class="panel__body">
          <VChart class="chart" :option="trafficOpt" autoresize />
        </div>
      </div>

      <div class="panel">
        <header class="panel__head">
          <div>
            <h3 class="panel__title">波束负载热力图</h3>
            <p class="panel__hint">16 个 Ka 波束当前接入用户数 / 容量上限</p>
          </div>
          <div class="panel__actions">
            <span class="legend"><i style="background: var(--info)" />实时</span>
          </div>
        </header>
        <div class="panel__body">
          <VChart class="chart" :option="beamOpt" autoresize />
        </div>
      </div>
    </section>

    <!-- ============== CONSTELLATION + ALARMS ============== -->
    <section class="grid-2col">
      <div class="panel">
        <header class="panel__head">
          <div>
            <h3 class="panel__title">在轨卫星健康度矩阵</h3>
            <p class="panel__hint">{{ satHealthHint }}</p>
          </div>
          <div class="panel__actions">
            <div class="seg-toggle seg-toggle--sm">
              <button :class="{ 'is-active': gridSize === 8 }"  @click="gridSize = 8">8×8</button>
              <button :class="{ 'is-active': gridSize === 16 }" @click="gridSize = 16">16×4</button>
            </div>
          </div>
        </header>
        <div class="panel__body">
          <div class="constellation-grid" :style="{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }">
            <div
              v-for="(s, i) in satHealth"
              :key="i"
              class="sat-cell"
              :class="{
                'sat-cell--warn': s.state === 'warn',
                'sat-cell--danger': s.state === 'danger',
                'sat-cell--off': s.state === 'off',
                'sat-cell--hot': i % 17 === 0
              }"
              :title="`${s.name} · ${s.state}`"
            >
              {{ s.name.slice(-2) }}
              <i class="sat-cell__dot" />
            </div>
          </div>
          <div class="legend" style="margin-top: 14px; gap: 14px">
            <span class="legend"><i style="background: var(--ok)" />正常</span>
            <span class="legend"><i style="background: var(--warn)" />告警</span>
            <span class="legend"><i style="background: var(--danger)" />故障</span>
            <span class="legend"><i style="background: var(--ink-4)" />离线</span>
          </div>
        </div>
      </div>

      <div class="panel">
        <header class="panel__head">
          <div>
            <h3 class="panel__title">实时告警列表</h3>
            <p class="panel__hint">最新 5 条告警 · 高危优先</p>
          </div>
          <div class="panel__actions">
            <button class="link-btn" @click="router.push('/tasks')">查看全部 →</button>
          </div>
        </header>
        <div class="panel__body">
          <ul class="alarm-list">
            <li
              v-for="a in alarms"
              :key="a.id"
              class="alarm-item"
              :class="`alarm-item--${a.sev}`"
            >
              <span class="alarm-item__sev">{{ sevLabel(a.sev) }}</span>
              <div class="alarm-item__body">
                <div class="alarm-item__title">{{ a.title }}</div>
                <div class="alarm-item__meta">{{ a.target }} · {{ a.time }}</div>
              </div>
              <button class="link-btn" @click="onAck(a)">确认</button>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ============== TASKS + COVERAGE ============== -->
    <section class="grid-2col">
      <div class="panel">
        <header class="panel__head">
          <div>
            <h3 class="panel__title">进行中任务</h3>
            <p class="panel__hint">活跃链路与编排任务</p>
          </div>
          <div class="panel__actions">
            <button class="link-btn" @click="router.push('/tasks')">任务监控 →</button>
          </div>
        </header>
        <div class="panel__body">
          <ul class="task-list">
            <li v-for="t in tasks" :key="t.id">
              <span class="task-list__id">{{ t.id.slice(-4) }}</span>
              <span class="task-list__title">{{ t.title }}</span>
              <div class="task-list__meta">
                <span>{{ t.agent }}</span>
                <span>·</span>
                <span>{{ t.time }}</span>
              </div>
              <span
                class="task-list__bar"
                :class="{
                  'is-done': t.status === 'done',
                  'is-fail': t.status === 'fail'
                }"
              >
                <span :style="{ width: t.progress + '%' }" />
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div class="panel">
        <header class="panel__head">
          <div>
            <h3 class="panel__title">区域覆盖强度</h3>
            <p class="panel__hint">8 大区域 · 7 天 · 热力分布</p>
          </div>
        </header>
        <div class="panel__body">
          <VChart class="chart" :option="coverageOpt" autoresize />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
defineOptions({ name: 'Dashboard' })
import { ref, onMounted, computed, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, HeatmapChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent, VisualMapComponent } from 'echarts/components'
import { getOverview, getCoverage } from '@/api/dashboard'
import { useToastStore } from '@/stores/toast'
import { useUserStore } from '@/stores/user'

use([CanvasRenderer, LineChart, HeatmapChart, BarChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, VisualMapComponent])

const router = useRouter()
const toast = useToastStore()
const user = useUserStore()

const entering = ref(true)
setTimeout(() => (entering.value = false), 400)

const kpis = ref([])
const alarms = ref([])
const tasks = ref([])
const satHealth = ref([])
const trafficHours = ref([])
const lines = ref([])
const beamLoad = ref([])
const beamLabels = ref([])
const coverage = ref([])
const regions = ref([])
const coverageDays = ref([])

const trafficRange = ref('24h')
const gridSize = ref(8)

// ====== Sparklines (Chart.js) ======
const sparkCharts = []
const sparkCanvases = {}
function bindSpark(el, k) {
  if (!el) return
  sparkCanvases[k.key] = el
  nextTick(() => initSpark(k))
}
function initSpark(k) {
  const el = sparkCanvases[k.key]
  if (!el || !window.Chart) return
  const ctx = el.getContext('2d')
  const w = ctx.canvas.width = el.clientWidth * (window.devicePixelRatio || 1)
  const h = ctx.canvas.height = 36 * (window.devicePixelRatio || 1)
  ctx.canvas.style.width = el.clientWidth + 'px'
  ctx.canvas.style.height = '36px'
  ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1)
  const g = ctx.createLinearGradient(0, 0, 0, 36)
  const color = k.up ? 'rgba(52, 211, 153,' : 'rgba(248, 113, 113,'
  g.addColorStop(0, color + ' 0.45)')
  g.addColorStop(1, color + ' 0)')
  const c = new window.Chart(ctx, {
    type: 'line',
    data: {
      labels: k.series.map((_, i) => i),
      datasets: [{
        data: k.series,
        borderColor: k.up ? '#34d399' : '#f87171',
        backgroundColor: g,
        fill: true,
        tension: 0.4,
        borderWidth: 1.5,
        pointRadius: 0,
      }],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false } },
    },
  })
  sparkCharts.push(c)
}

function formatValue(v) {
  if (typeof v !== 'number') return v
  return v.toLocaleString()
}

async function load() {
  try {
    const data = await getOverview()
    kpis.value = data.kpis
    alarms.value = data.alarms
    tasks.value = data.tasks
    satHealth.value = data.satHealth
    trafficHours.value = data.trafficHours
    lines.value = data.lines
    beamLoad.value = data.beamLoad
    beamLabels.value = data.beamLabels
  } catch (e) { /* ignore */ }
  try {
    const d = await getCoverage()
    coverage.value = d.coverage
    regions.value = d.regions
    coverageDays.value = d.days
  } catch (e) { /* ignore */ }
  nextTick(() => kpis.value.forEach(initSpark))
}
onMounted(() => {
  if (window.Chart) load()
  else {
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js'
    s.onload = load
    document.head.appendChild(s)
  }
})
onBeforeUnmount(() => sparkCharts.forEach((c) => c.destroy && c.destroy()))

const satHealthHint = computed(() => {
  const counts = { ok: 0, warn: 0, danger: 0, off: 0 }
  for (const s of satHealth.value) counts[s.state] = (counts[s.state] || 0) + 1
  return `${satHealth.value.length} 颗卫星 · 正常 ${counts.ok} · 告警 ${counts.warn} · 故障 ${counts.danger} · 离线 ${counts.off}`
})

function sevLabel(s) {
  return { high: '高危', mid: '中危', low: '低危' }[s] || s
}
function onAck(a) {
  toast.success(`告警 [${a.id}] 已确认`)
}

const trafficOpt = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { textStyle: { color: 'var(--ink-2)' }, top: 0, right: 0, icon: 'roundRect' },
  grid: { left: 36, right: 16, top: 36, bottom: 24 },
  xAxis: {
    type: 'category',
    data: trafficHours.value,
    axisLine: { lineStyle: { color: 'var(--line)' } },
    axisLabel: { color: 'var(--ink-3)', fontSize: 10 },
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    splitLine: { lineStyle: { color: 'var(--line)' } },
    axisLabel: { color: 'var(--ink-3)', fontSize: 10 },
  },
  series: lines.value.map((l) => ({
    name: l.name,
    type: 'line',
    smooth: true,
    symbol: 'none',
    data: l.data,
    lineStyle: { color: l.color, width: 2 },
    areaStyle: {
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: l.color + '55' },
          { offset: 1, color: l.color + '00' },
        ],
      },
    },
  })),
}))

const beamOpt = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 36, right: 16, top: 16, bottom: 24 },
  xAxis: {
    type: 'category',
    data: beamLabels.value,
    axisLine: { lineStyle: { color: 'var(--line)' } },
    axisLabel: { color: 'var(--ink-3)', fontSize: 10 },
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    splitLine: { lineStyle: { color: 'var(--line)' } },
    axisLabel: { color: 'var(--ink-3)', fontSize: 10 },
  },
  series: [{
    type: 'bar',
    data: beamLoad.value,
    barWidth: '60%',
    itemStyle: {
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: '#22d3ee' },
          { offset: 1, color: '#8b5cf6' },
        ],
      },
      borderRadius: [4, 4, 0, 0],
    },
  }],
}))

const coverageOpt = computed(() => {
  const data = []
  for (let d = 0; d < coverageDays.value.length; d++) {
    for (let h = 0; h < regions.value.length; h++) {
      data.push([h, d, coverage.value[d * 24 + h] || 0])
    }
  }
  return {
    tooltip: { position: 'top' },
    grid: { left: 60, right: 16, top: 16, bottom: 36 },
    xAxis: {
      type: 'category',
      data: regions.value,
      splitArea: { show: true },
      axisLabel: { color: 'var(--ink-2)', fontSize: 10 },
      axisLine: { lineStyle: { color: 'var(--line)' } },
    },
    yAxis: {
      type: 'category',
      data: coverageDays.value,
      splitArea: { show: true },
      axisLabel: { color: 'var(--ink-2)', fontSize: 10 },
      axisLine: { lineStyle: { color: 'var(--line)' } },
    },
    visualMap: {
      min: 0, max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      textStyle: { color: 'var(--ink-2)', fontSize: 10 },
      inRange: { color: ['#1a1d33', '#8b5cf6', '#22d3ee', '#fbbf24'] },
    },
    series: [{
      name: '覆盖强度',
      type: 'heatmap',
      data,
      label: { show: false },
      emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.4)' } },
    }],
  }
})
</script>

<style scoped>
.view {
  display: block;
  animation: viewFade 0.4s var(--ease);
}
.view-enter {
  opacity: 0;
  transform: translateY(8px);
}
@keyframes viewFade {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: none; }
}

/* ============== HERO ============== */
.view__hero {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 32px;
  padding: 32px 36px;
  margin-bottom: 28px;
  background: linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
  backdrop-filter: var(--glass-blur);
}
.view__hero::after {
  content: '';
  position: absolute;
  top: -40%; right: -10%;
  width: 60%; height: 180%;
  background: radial-gradient(ellipse at center, var(--accent-soft), transparent 60%);
  pointer-events: none;
}
.hero__text { position: relative; z-index: 1; }
.hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  background: var(--surface-2);
  border: 1px solid var(--line-2);
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.05em;
  color: var(--ink-2);
  margin-bottom: 18px;
}
.hero__eyebrow-dot {
  width: 6px; height: 6px;
  background: var(--ok);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--ok);
  animation: livePing 1.6s ease-out infinite;
}
.hero__title {
  font-size: 44px;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.04em;
  margin-bottom: 16px;
  color: var(--ink);
}
.hero__name {
  background: linear-gradient(120deg, var(--accent), var(--accent-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.hero__desc {
  font-size: 15px;
  color: var(--ink-2);
  max-width: 540px;
  line-height: 1.65;
  margin: 0 0 24px;
}
.hero__desc b { color: var(--ink); font-weight: 600; }
.hero__actions { display: flex; gap: 10px; flex-wrap: wrap; }
.hero__visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360px;
}

/* ============== ORBIT STAGE ============== */
.orbit-stage { position: relative; width: 100%; max-width: 480px; aspect-ratio: 1; }
.orbit-stage__svg { width: 100%; height: 100%; }
.orbit-core { fill: var(--accent); filter: drop-shadow(0 0 20px var(--accent-glow)); }
.orbit-pulse {
  stroke: var(--accent);
  stroke-width: 1;
  opacity: 0;
  transform-origin: 200px 200px;
  animation: pulseRing 3s ease-out infinite;
}
@keyframes pulseRing {
  0% { opacity: 0.7; transform: scale(0.5); }
  100% { opacity: 0; transform: scale(1.4); }
}
.orbit-ellipse {
  transform-origin: 200px 200px;
  animation: ellipseSpin 22s linear infinite;
}
@keyframes ellipseSpin { to { transform: rotate(360deg); } }
.sat-pin {
  position: absolute;
  left: var(--x);
  top: var(--y);
  transform: translate(-50%, -50%);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: var(--surface);
  border: 1px solid var(--line-2);
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--ink-2);
  animation: satFloat 5s ease-in-out infinite;
  animation-delay: var(--d, 0s);
  white-space: nowrap;
  z-index: 2;
}
.sat-pin i {
  width: 6px; height: 6px;
  background: var(--accent);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--accent);
}
@keyframes satFloat {
  0%, 100% { transform: translate(-50%, -50%); }
  50% { transform: translate(-50%, -58%); }
}
@keyframes livePing {
  0% { transform: scale(1); opacity: 0.7; }
  100% { transform: scale(1.6); opacity: 0; }
}

/* ============== KPI ROW ============== */
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.kpi-card {
  position: relative;
  padding: 20px 22px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-blur);
  overflow: hidden;
}
.kpi-card::after {
  content: '';
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0.5;
}
.kpi-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.kpi-card__label {
  font-size: 12px;
  color: var(--ink-3);
  letter-spacing: 0.04em;
}
.kpi-card__value {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 600;
  letter-spacing: -0.04em;
  color: var(--ink);
  line-height: 1.1;
  margin-bottom: 4px;
}
.kpi-card__value small {
  font-size: 16px;
  font-weight: 400;
  color: var(--ink-3);
  margin-left: 4px;
}
.kpi-card__chart { height: 36px; margin: 8px 0 12px; }
.kpi-card__foot { font-size: 11.5px; color: var(--ink-3); }
.kpi-card__foot strong { color: var(--ink); font-weight: 600; }

.trend {
  font-size: 11px;
  font-weight: 500;
  font-family: var(--font-mono);
  padding: 2px 6px;
  border-radius: 4px;
}
.trend--up { color: var(--ok); background: rgba(52, 211, 153, 0.12); }
.trend--down { color: var(--danger); background: rgba(248, 113, 113, 0.12); }

/* ============== PANEL ============== */
.panel {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-blur);
  overflow: hidden;
  position: relative;
}
.panel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px 16px;
}
.panel__title {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--ink);
}
.panel__hint {
  font-size: 12px;
  color: var(--ink-3);
  margin: 4px 0 0;
}
.panel__actions { display: flex; align-items: center; gap: 8px; }
.panel__body { padding: 6px 22px 22px; }
.chart { width: 100%; height: 260px; }

/* ============== GRIDS ============== */
.grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
.grid-3col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

/* ============== BUTTONS ============== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.01em;
  border: 1px solid transparent;
  transition: background var(--tx-fast) var(--ease), border-color var(--tx-fast) var(--ease), color var(--tx-fast) var(--ease), transform var(--tx-fast) var(--ease);
  white-space: nowrap;
  cursor: pointer;
}
.btn svg { width: 16px; height: 16px; }
.btn--primary {
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: #fff;
  box-shadow: 0 4px 18px var(--accent-glow);
}
.btn--primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px var(--accent-glow); }
.btn--ghost { background: var(--surface-2); border-color: var(--line-2); color: var(--ink); }
.btn--ghost:hover { background: var(--surface-3); border-color: var(--accent); }

.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-2);
  padding: 4px 8px;
  border-radius: 6px;
  background: transparent;
  border: 0;
  cursor: pointer;
  transition: color var(--tx-fast) var(--ease), background var(--tx-fast) var(--ease);
}
.link-btn:hover { color: var(--accent); background: var(--accent-soft); }

/* ============== SEG TOGGLE ============== */
.seg-toggle {
  display: inline-flex;
  padding: 3px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 10px;
}
.seg-toggle button {
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-2);
  border-radius: 7px;
  background: transparent;
  border: 0;
  cursor: pointer;
  transition: all var(--tx-fast) var(--ease);
}
.seg-toggle button.is-active {
  background: var(--surface);
  color: var(--ink);
  box-shadow: var(--shadow-sm);
}
.seg-toggle--sm button { padding: 4px 10px; font-size: 11.5px; }

/* ============== CONSTELLATION ============== */
.constellation-grid { display: grid; gap: 6px; }
.sat-cell {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--ink-3);
  transition: all var(--tx-fast) var(--ease);
  cursor: pointer;
}
.sat-cell:hover { transform: scale(1.06); border-color: var(--accent); z-index: 1; }
.sat-cell__dot {
  position: absolute;
  top: 6px; right: 6px;
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--ok);
}
.sat-cell--warn .sat-cell__dot { background: var(--warn); }
.sat-cell--danger .sat-cell__dot { background: var(--danger); }
.sat-cell--off { opacity: 0.4; }
.sat-cell--off .sat-cell__dot { background: var(--ink-4); }
.sat-cell--hot { background: linear-gradient(135deg, var(--surface-2), var(--accent-soft)); }

.legend {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--ink-2);
  font-family: var(--font-mono);
}
.legend i {
  width: 8px; height: 8px;
  border-radius: 2px;
  display: inline-block;
}

/* ============== ALARM LIST ============== */
.alarm-list { display: flex; flex-direction: column; gap: 10px; }
.alarm-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-left-width: 3px;
  border-radius: 10px;
}
.alarm-item--high { border-left-color: var(--danger); }
.alarm-item--mid  { border-left-color: var(--warn); }
.alarm-item--low  { border-left-color: var(--info); }
.alarm-item__sev {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  flex-shrink: 0;
}
.alarm-item--high .alarm-item__sev { background: rgba(248, 113, 113, 0.15); color: var(--danger); }
.alarm-item--mid  .alarm-item__sev { background: rgba(251, 191, 36, 0.15);  color: var(--warn); }
.alarm-item--low  .alarm-item__sev { background: rgba(34, 211, 238, 0.15);  color: var(--info); }
.alarm-item__body { flex: 1; min-width: 0; }
.alarm-item__title {
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
  margin-bottom: 2px;
}
.alarm-item__meta {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--ink-3);
}

/* ============== TASK LIST ============== */
.task-list { display: flex; flex-direction: column; }
.task-list li {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
  font-size: 13px;
}
.task-list li:last-child { border-bottom: 0; }
.task-list__id {
  font-family: var(--font-mono);
  color: var(--ink-3);
  font-size: 11.5px;
  min-width: 80px;
}
.task-list__title {
  flex: 1;
  color: var(--ink);
  font-weight: 500;
}
.task-list__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-3);
}
.task-list__bar {
  width: 60px;
  height: 3px;
  background: var(--line);
  border-radius: 2px;
  overflow: hidden;
}
.task-list__bar span {
  display: block;
  height: 100%;
  background: var(--accent);
  transition: width 0.4s var(--ease);
}
.task-list__bar.is-done span { background: var(--ok); width: 100%; }
.task-list__bar.is-fail span { background: var(--danger); }

/* ============== 响应式 ============== */
@media (max-width: 1280px) {
  .kpi-row { grid-template-columns: repeat(2, 1fr); }
  .grid-2col { grid-template-columns: 1fr; }
  .view__hero { padding: 24px 28px; grid-template-columns: 1fr; }
  .hero__title { font-size: 32px; }
  .hero__visual { min-height: 280px; }
}
@media (max-width: 768px) {
  .kpi-row { grid-template-columns: 1fr 1fr; }
  .grid-3col { grid-template-columns: 1fr; }
  .view__hero { padding: 20px; }
  .hero__title { font-size: 26px; }
  .panel__body { padding: 6px 16px 16px; }
}
@media (max-width: 480px) {
  .kpi-row { grid-template-columns: 1fr; }
  .hero__title { font-size: 22px; }
}
</style>
