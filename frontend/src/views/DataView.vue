<template>
  <div class="page page-data" :class="{ 'view-enter': entering }">
    <header class="page-head">
      <div>
        <h2 class="page-title">数据应用</h2>
        <p class="page-sub">统一指标看板与自助分析能力 · 多源接入、可视化与导出</p>
      </div>
      <div class="page-head__actions">
        <button class="btn btn--primary" @click="onNew">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          新建看板
        </button>
        <button class="btn btn--ghost">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v18h18"/><path d="M7 14l3-3 3 3 5-5"/>
          </svg>
          导出报告
        </button>
      </div>
    </header>

    <!-- 工具栏 -->
    <div class="data-toolbar">
      <div class="data-toolbar__filters">
        <span class="data-toolbar__label">数据域：</span>
        <button
          v-for="(d, i) in domains"
          :key="d"
          class="chip"
          :class="{ 'is-active': activeDomain === i }"
          @click="activeDomain = i"
        >{{ d }}</button>
      </div>
      <div class="seg-toggle">
        <button :class="{ 'is-active': range === '24h' }" @click="range = '24h'">近 24h</button>
        <button :class="{ 'is-active': range === '7d' }" @click="range = '7d'">近 7 天</button>
        <button :class="{ 'is-active': range === '30d' }" @click="range = '30d'">近 30 天</button>
        <button :class="{ 'is-active': range === 'custom' }" @click="range = 'custom'">自定义</button>
      </div>
    </div>

    <!-- KPI 行 -->
    <div class="data-kpis">
      <div v-for="k in kpis" :key="k.key" class="data-kpi">
        <em class="trend" :class="k.up ? 'trend--up' : 'trend--down'">{{ k.trend }}</em>
        <span>{{ k.label }}</span>
        <strong>{{ k.value }}<small> {{ k.unit }}</small></strong>
      </div>
    </div>

    <!-- 双列图表面板 -->
    <div class="grid-2col">
      <section class="panel">
        <header class="panel__head">
          <div>
            <h3 class="panel__title">网络拓扑</h3>
            <p class="panel__sub">信关站 · 测控站 · NOC · 实时链路状态</p>
          </div>
        </header>
        <div class="panel__body panel__body--chart">
          <svg viewBox="0 0 800 320" class="topology">
            <defs>
              <linearGradient id="topo-link" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stop-color="var(--accent)" stop-opacity="0.7"/>
                <stop offset="1" stop-color="var(--accent-2)" stop-opacity="0.7"/>
              </linearGradient>
            </defs>
            <!-- 链路 -->
            <line v-for="(l, i) in validLinks" :key="'l'+i"
              :x1="nodeMap[l.from].x" :y1="nodeMap[l.from].y"
              :x2="nodeMap[l.to].x"   :y2="nodeMap[l.to].y"
              stroke="url(#topo-link)" stroke-width="1.4" stroke-dasharray="4 3" opacity="0.55">
              <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="1.4s" repeatCount="indefinite"/>
            </line>
            <!-- 节点 -->
            <g v-for="(n, i) in topo.nodes" :key="'n'+i" class="topology__node" :class="`is-${n.status}`">
              <circle :cx="n.x" :cy="n.y" r="6" />
              <circle :cx="n.x" :cy="n.y" r="14" class="topology__halo" />
              <text :x="n.x" :y="n.y - 18" text-anchor="middle">{{ n.name }}</text>
            </g>
          </svg>
        </div>
      </section>

      <section class="panel">
        <header class="panel__head">
          <div>
            <h3 class="panel__title">运维任务甘特</h3>
            <p class="panel__sub">今日 · 08:00 - 22:00</p>
          </div>
        </header>
        <div class="panel__body">
          <div class="gantt">
            <div v-for="(row, i) in gantt" :key="i" class="gantt__row">
              <div class="gantt__label">{{ row.label }}</div>
              <div class="gantt__track">
                <div class="gantt__bar" :class="row.cls" :style="row.style">{{ row.text }}</div>
              </div>
            </div>
            <div class="gantt__axis">
              <span v-for="h in hours" :key="h">{{ h }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="grid-2col">
      <section class="panel">
        <header class="panel__head">
          <div>
            <h3 class="panel__title">区域 × 时段接入热力</h3>
            <p class="panel__sub">近 7 天 · 8 大区 · 单位 Mbps</p>
          </div>
        </header>
        <div class="panel__body panel__body--chart">
          <VChart class="chart" :option="coverageOpt" autoresize />
        </div>
      </section>

      <section class="panel">
        <header class="panel__head">
          <div>
            <h3 class="panel__title">波束轨迹对比</h3>
            <p class="panel__sub">正常基线 vs 实际轨迹 · 24h</p>
          </div>
        </header>
        <div class="panel__body panel__body--chart">
          <VChart class="chart" :option="trajectoryOpt" autoresize />
        </div>
      </section>
    </div>

    <!-- 关键指标明细 -->
    <section class="panel">
      <header class="panel__head">
        <div>
          <h3 class="panel__title">关键指标明细</h3>
          <p class="panel__sub">支持钻取与导出 · 当前数据域：{{ domains[activeDomain] }}</p>
        </div>
        <span class="panel__hint">共 {{ filteredRows.length }} / {{ dataRows.length }} 条指标</span>
      </header>
      <div class="panel__body">
        <FilterBar
          v-model="filter"
          :filters="[
            { key: 'health', type: 'radio', options: [
              { value: '', label: '全部' },
              { value: 'ok', label: '正常' },
              { value: 'warn', label: '关注' },
              { value: 'danger', label: '告警' },
            ]},
          ]"
          :search="true"
          :search-placeholder="'搜索指标、维度或值…'"
          @change="onFilter"
        />
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>指标</th>
                <th>维度</th>
                <th>当前值</th>
                <th>环比</th>
                <th>同比</th>
                <th>健康度</th>
                <th>更新时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in filteredRows" :key="r.dim + r.metric">
                <td>{{ r.metric }}</td>
                <td>{{ r.dim }}</td>
                <td class="data-table__mono">{{ r.val }}</td>
                <td class="data-table__mono">{{ r.trend }}</td>
                <td class="data-table__mono">{{ r.yoy }}</td>
                <td>
                  <span class="chip" :class="`chip--${r.health}`">
                    <i class="dot"></i>
                    {{ r.health === 'ok' ? '正常' : r.health === 'warn' ? '关注' : '告警' }}
                  </span>
                </td>
                <td class="data-table__mono">{{ r.time }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
defineOptions({ name: 'Data' })
import { ref, computed, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { HeatmapChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, VisualMapComponent } from 'echarts/components'
import { getDataOverview, getCoverage } from '@/api/dashboard'
import FilterBar from '@/components/FilterBar.vue'
import { useToastStore } from '@/stores/toast'

use([CanvasRenderer, HeatmapChart, LineChart, GridComponent, TooltipComponent, LegendComponent, VisualMapComponent])

const toast = useToastStore()
const entering = ref(true)

const domains = ['链路指标', '波束健康', '终端接入', 'TTC 测控', '运营告警']
const activeDomain = ref(0)
const range = ref('24h')
const filter = ref({ health: '', q: '' })

const kpis = ref([
  { key: 'p1', label: '链路可用度', value: '99.86', unit: '%', trend: '+0.02%', up: true },
  { key: 'p2', label: '平均时延',   value: '38.4',  unit: 'ms', trend: '-1.2 ms', up: true },
  { key: 'p3', label: '丢包率',     value: '0.12',  unit: '%', trend: '-0.04%', up: true },
  { key: 'p4', label: '波束利用率', value: '82.6',  unit: '%', trend: '+3.4%',  up: true },
  { key: 'p5', label: '终端在线',   value: '1,284', unit: '台', trend: '+12',     up: true },
  { key: 'p6', label: '告警数',     value: '7',     unit: '条', trend: '-2',      up: false },
])

const dataRows = [
  { dim: 'GW-01',      metric: '链路可用度', val: '99.97%', trend: '+0.02%', yoy: '+0.31%', health: 'ok',     time: '14:22:18' },
  { dim: 'GW-03',      metric: '链路可用度', val: '99.41%', trend: '-0.12%', yoy: '-0.04%', health: 'warn',   time: '14:22:18' },
  { dim: '北向接口',   metric: '丢包率',     val: '5.21%',  trend: '+4.83%', yoy: '+1.12%', health: 'danger', time: '14:22:18' },
  { dim: '波束 B-12',  metric: 'E1/Es/No',   val: '12.4 dB',trend: '-0.6 dB',yoy: '+0.1 dB',health: 'warn',   time: '14:22:14' },
  { dim: '终端 #SN-9', metric: '注册时延',   val: '1.8 s',  trend: '+0.4 s', yoy: '-0.2 s', health: 'ok',     time: '14:22:08' },
  { dim: 'B-08',       metric: '波束利用率', val: '94%',    trend: '+6%',    yoy: '+12%',   health: 'danger', time: '14:22:01' },
  { dim: 'NOC 北京',   metric: '用户活跃数', val: '2,164',  trend: '+29',    yoy: '+186',   health: 'ok',     time: '14:21:55' },
  { dim: 'GW-02',      metric: '链路可用度', val: '99.86%', trend: '+0.01%', yoy: '+0.22%', health: 'ok',     time: '14:21:42' },
  { dim: '波束 B-05',  metric: '波束利用率', val: '82%',    trend: '-3%',    yoy: '+4%',    health: 'ok',     time: '14:21:30' },
  { dim: 'TTC-03',     metric: '计划冲突',   val: '0',      trend: '0',      yoy: '0',      health: 'ok',     time: '14:21:18' },
]

const filteredRows = computed(() => {
  let list = dataRows
  if (filter.value.health) list = list.filter((r) => r.health === filter.value.health)
  if (filter.value.q) {
    const k = String(filter.value.q).toLowerCase()
    list = list.filter((r) =>
      r.metric.toLowerCase().includes(k) ||
      r.dim.toLowerCase().includes(k) ||
      r.val.toLowerCase().includes(k),
    )
  }
  return list
})

function onFilter() { /* reactive computed */ }

function onNew() { toast.info('已打开看板编辑器（示例）') }

/* ===== Topology ===== */
const topo = {
  nodes: [
    { id: 'gw1',  name: 'GW-01 北京',   x: 130, y: 100, status: 'ok' },
    { id: 'gw2',  name: 'GW-02 喀什',   x: 110, y: 220, status: 'ok' },
    { id: 'gw3',  name: 'GW-03 三亚',   x: 240, y: 260, status: 'warn' },
    { id: 'ttc1', name: 'TTC-01 西安',  x: 340, y: 130, status: 'ok' },
    { id: 'ttc2', name: 'TTC-02 喀什',  x: 290, y: 240, status: 'ok' },
    { id: 'ttc3', name: 'TTC-03 佳木斯',x: 540, y: 80,  status: 'ok' },
    { id: 'noc',  name: 'NOC 北京',     x: 460, y: 180, status: 'ok' },
    { id: 'sn9',  name: '终端 #SN-9',   x: 670, y: 160, status: 'ok' },
    { id: 'sn12', name: '终端 #SN-12',  x: 700, y: 240, status: 'warn' },
  ],
  links: [
    { from: 'gw1',  to: 'noc' },
    { from: 'gw2',  to: 'noc' },
    { from: 'gw3',  to: 'noc' },
    { from: 'ttc1', to: 'noc' },
    { from: 'ttc2', to: 'noc' },
    { from: 'ttc3', to: 'noc' },
    { from: 'noc',  to: 'sn9' },
    { from: 'noc',  to: 'sn12' },
    { from: 'gw1',  to: 'ttc1' },
    { from: 'gw2',  to: 'ttc2' },
    { from: 'gw3',  to: 'ttc2' },
  ],
}
/* 按 id 索引的节点映射，避免模板里 topo.nodes[id].x 因 key 错位返回 undefined */
const nodeMap = computed(() => {
  const m = {}
  topo.nodes.forEach((n) => { m[n.id] = n })
  return m
})
/* 防御性兜底：过滤掉 endpoints 不存在的 link */
const validLinks = computed(() =>
  topo.links.filter((l) => nodeMap.value[l.from] && nodeMap.value[l.to])
)

/* ===== Gantt ===== */
const gantt = [
  { label: 'GW-01 巡检', text: '巡检', cls: 'is-ok',   style: { left: '4%',  width: '24%' } },
  { label: 'GW-03 排障', text: '排障', cls: 'is-warn', style: { left: '32%', width: '30%' } },
  { label: 'TTC-02 例检', text: '例检', cls: 'is-info', style: { left: '18%', width: '18%' } },
  { label: '终端固件升级', text: '升级', cls: 'is-info', style: { left: '64%', width: '22%' } },
  { label: '波束B-12 复核', text: '复核', cls: 'is-ok',   style: { left: '52%', width: '14%' } },
]
const hours = ['08', '10', '12', '14', '16', '18', '20', '22']

/* ===== Heatmap & Trajectory ===== */
const coverageOpt = computed(() => {
  const regions = ['北京', '喀什', '三亚', '西安', '佳木斯', '昆明', '拉萨', '乌鲁木齐']
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const data = []
  for (let d = 0; d < days.length; d++) {
    for (let h = 0; h < regions.length; h++) {
      data.push([h, d, Math.round(Math.random() * 100)])
    }
  }
  return {
    tooltip: { position: 'top' },
    grid: { left: 60, right: 16, top: 16, bottom: 40 },
    xAxis: { type: 'category', data: regions, axisLabel: { color: '#aab0c6', fontSize: 11 }, axisLine: { lineStyle: { color: 'rgba(139,149,200,0.18)' } } },
    yAxis: { type: 'category', data: days, axisLabel: { color: '#aab0c6', fontSize: 11 }, axisLine: { lineStyle: { color: 'rgba(139,149,200,0.18)' } } },
    visualMap: { min: 0, max: 100, calculable: true, orient: 'horizontal', left: 'center', bottom: 0, textStyle: { color: '#aab0c6', fontSize: 11 }, inRange: { color: ['#1a1d33', '#8b5cf6', '#22d3ee', '#fbbf24'] } },
    series: [{ type: 'heatmap', data, label: { show: false } }],
  }
})

const trajectoryOpt = computed(() => {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const base = hours.map((_, i) => +(60 + 20 * Math.sin((i / 24) * Math.PI * 2) + Math.random() * 4).toFixed(1))
  const real = hours.map((_, i) => +(60 + 20 * Math.sin((i / 24) * Math.PI * 2 + 0.3) + (Math.random() - 0.5) * 6).toFixed(1))
  return {
    tooltip: { trigger: 'axis' },
    legend: { top: 0, right: 0, textStyle: { color: '#aab0c6' } },
    grid: { left: 40, right: 16, top: 28, bottom: 24 },
    xAxis: { type: 'category', data: hours, axisLabel: { color: '#6e7595', fontSize: 10 }, axisLine: { lineStyle: { color: 'rgba(139,149,200,0.18)' } } },
    yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(139,149,200,0.08)' } }, axisLabel: { color: '#6e7595', fontSize: 10 } },
    series: [
      { name: '正常基线', type: 'line', smooth: true, symbol: 'none', data: base, lineStyle: { width: 1.4, color: '#22d3ee' } },
      { name: '实际轨迹', type: 'line', smooth: true, symbol: 'none', data: real, lineStyle: { width: 1.4, color: '#8b5cf6' } },
    ],
  }
})

onMounted(() => {
  setTimeout(() => { entering.value = false }, 480)
  getDataOverview().catch(() => {})
  getCoverage().catch(() => {})
})
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: var(--sp-4); }

.page-head {
  display: flex; align-items: flex-end; justify-content: space-between; gap: var(--sp-3);
  flex-wrap: wrap;
}
.page-title { margin: 0; font-size: 20px; font-weight: 600; color: var(--ink); font-family: var(--font-display); }
.page-sub { margin: 4px 0 0; color: var(--ink-3); font-size: 12.5px; }
.page-head__actions { display: inline-flex; gap: 8px; }

/* ============== TOOLBAR ============== */
.data-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  gap: 16px;
  flex-wrap: wrap;
  backdrop-filter: var(--glass-blur);
}
.data-toolbar__filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.data-toolbar__label { font-size: 12px; color: var(--ink-3); }

.chip {
  display: inline-flex; align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 500;
  font-family: var(--font-mono);
  background: var(--surface-2);
  color: var(--ink-2);
  border: 1px solid var(--line);
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
}
.chip:hover { color: var(--ink); border-color: var(--line-2); }
.chip.is-active {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: var(--accent);
}

.seg-toggle {
  display: inline-flex;
  padding: 3px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 8px;
}
.seg-toggle button {
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-2);
  background: transparent;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
  font-family: var(--font-body);
}
.seg-toggle button.is-active {
  background: var(--surface);
  color: var(--ink);
  box-shadow: var(--shadow-sm);
}

/* ============== DATA KPIS ============== */
.data-kpis {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}
.data-kpi {
  position: relative;
  padding: 16px 18px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-blur);
  transition: all var(--dur-fast) var(--ease);
}
.data-kpi:hover {
  border-color: var(--line-2);
  transform: translateY(-1px);
}
.data-kpi span {
  font-size: 11.5px;
  color: var(--ink-3);
  display: block;
  margin-bottom: 8px;
}
.data-kpi strong {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: -0.02em;
}
.data-kpi strong small {
  font-size: 12px;
  font-weight: 400;
  color: var(--ink-3);
}
.data-kpi em {
  font-style: normal;
  position: absolute;
  top: 14px;
  right: 14px;
  font-size: 10.5px;
  font-family: var(--font-mono);
}
.trend--up   { color: var(--ok); }
.trend--down { color: var(--danger); }

/* ============== GRID ============== */
.grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

/* ============== PANEL ============== */
.panel {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  backdrop-filter: var(--glass-blur);
}
.panel__head {
  display: flex; align-items: flex-end; justify-content: space-between; gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--line);
}
.panel__title { margin: 0; font-size: 14px; font-weight: 600; color: var(--ink); font-family: var(--font-display); }
.panel__sub   { margin: 2px 0 0; font-size: 12px; color: var(--ink-3); }
.panel__hint  { font-size: 11.5px; color: var(--ink-3); font-family: var(--font-mono); }
.panel__body  { padding: 16px 18px; }
.panel__body--chart { padding: 8px; }

/* ============== TOPOLOGY ============== */
.topology { width: 100%; height: 280px; }
.topology__node circle:first-child {
  fill: var(--accent);
  filter: drop-shadow(0 0 4px var(--accent));
}
.topology__node.is-warn circle:first-child { fill: #fbbf24; filter: drop-shadow(0 0 4px #fbbf24); }
.topology__node.is-danger circle:first-child { fill: var(--danger); filter: drop-shadow(0 0 4px var(--danger)); }
.topology__halo { fill: var(--accent); opacity: 0.15; animation: haloPulse 2.4s var(--ease) infinite; }
.topology__node.is-warn .topology__halo { fill: #fbbf24; }
.topology__node.is-danger .topology__halo { fill: var(--danger); }
.topology__node text {
  fill: var(--ink-2);
  font-size: 11px;
  font-family: var(--font-mono);
}
@keyframes haloPulse {
  0%, 100% { r: 12; opacity: 0.18; }
  50%      { r: 18; opacity: 0.05; }
}

/* ============== GANTT ============== */
.gantt { display: flex; flex-direction: column; gap: 10px; }
.gantt__row { display: grid; grid-template-columns: 100px 1fr; gap: 12px; align-items: center; }
.gantt__label { font-size: 12px; color: var(--ink-2); font-family: var(--font-mono); }
.gantt__track {
  position: relative;
  height: 18px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 6px;
  overflow: hidden;
}
.gantt__bar {
  position: absolute;
  top: 0; bottom: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 10.5px;
  font-weight: 500;
  color: #fff;
  border-radius: 4px;
  font-family: var(--font-mono);
}
.gantt__bar.is-ok   { background: linear-gradient(90deg, var(--ok), #67e8f9); }
.gantt__bar.is-warn { background: linear-gradient(90deg, #fbbf24, #f59e0b); color: #1a1d33; }
.gantt__bar.is-info { background: linear-gradient(90deg, var(--accent), var(--accent-2)); }
.gantt__axis {
  display: grid;
  grid-template-columns: 100px repeat(8, 1fr);
  gap: 12px;
  margin-top: 6px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--ink-3);
}
.gantt__axis span { text-align: center; }

/* ============== DATA TABLE ============== */
.data-table-wrap { overflow-x: auto; }
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}
.data-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ink-3);
  background: var(--surface-2);
  border-bottom: 1px solid var(--line);
  font-family: var(--font-mono);
}
.data-table td {
  padding: 12px 16px;
  color: var(--ink-2);
  border-bottom: 1px solid var(--line);
  vertical-align: middle;
}
.data-table tr:last-child td { border-bottom: 0; }
.data-table tr:hover td { background: var(--surface-2); }
.data-table__mono {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--ink-3);
  white-space: nowrap;
}

/* ============== CHIPS ============== */
.chip--ok, .chip--warn, .chip--danger {
  display: inline-flex; align-items: center; gap: 5px;
}
.chip--ok     { background: rgba(74, 222, 128, 0.12); color: var(--ok);     border-color: rgba(74, 222, 128, 0.3); }
.chip--warn   { background: rgba(251, 191, 36, 0.12); color: #fbbf24;       border-color: rgba(251, 191, 36, 0.3); }
.chip--danger { background: rgba(248, 113, 113, 0.12); color: var(--danger); border-color: rgba(248, 113, 113, 0.3); }
.chip .dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; box-shadow: 0 0 4px currentColor; }

.chart { width: 100%; height: 260px; }

.view-enter { animation: viewEnter 0.42s var(--ease) both; }
@keyframes viewEnter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1280px) {
  .data-kpis { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1024px) {
  .grid-2col { grid-template-columns: 1fr; }
  .data-kpis { grid-template-columns: repeat(2, 1fr); }
  .gantt__row { grid-template-columns: 80px 1fr; }
  .gantt__axis { grid-template-columns: 80px repeat(8, 1fr); }
}
</style>
