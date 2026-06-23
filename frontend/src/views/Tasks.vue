<template>
  <div class="page page-tasks" :class="{ 'view-enter': entering }">
    <header class="page-head">
      <div>
        <h2 class="page-title">任务监控</h2>
        <p class="page-sub">全链路追踪员工任务的执行、状态与资源消耗</p>
      </div>
      <div class="page-head__actions">
        <button class="btn btn--ghost" @click="load">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>
          </svg>
          刷新
        </button>
        <button class="btn btn--ghost">导出</button>
      </div>
    </header>

    <!-- 顶部统计 -->
    <div class="tasks-stats">
      <div class="tasks-stat">
        <span>运行中</span>
        <strong>5<small> 个</small></strong>
      </div>
      <div class="tasks-stat">
        <span>已完成</span>
        <strong>128<small> 个</small></strong>
      </div>
      <div class="tasks-stat">
        <span>失败</span>
        <strong class="text-danger">2<small> 个</small></strong>
      </div>
      <div class="tasks-stat">
        <span>平均耗时</span>
        <strong>4.2<small> min</small></strong>
      </div>
      <div class="tasks-stat">
        <span>成功率</span>
        <strong class="text-ok">98.5<small> %</small></strong>
      </div>
    </div>

    <FilterBar
      v-model="filter"
      :filters="[
        { key: 'status', type: 'radio', options: [
          { value: '', label: '全部' },
          { value: 'run', label: '进行中' },
          { value: 'done', label: '已完成' },
          { value: 'fail', label: '失败' },
          { value: 'wait', label: '等待' },
        ]},
      ]"
      :search="false"
      @change="load"
    />

    <!-- ============== 双列图表面板（甘特图 + 任务执行趋势）============== -->
    <div class="grid-2col">
      <section class="panel">
        <header class="panel__head">
          <div>
            <h3 class="panel__title">任务甘特图</h3>
            <p class="panel__sub">今日 · 08:00 - 22:00</p>
          </div>
        </header>
        <div class="panel__body">
          <div class="gantt">
            <div v-for="(row, i) in gantt" :key="i" class="gantt__row">
              <div class="gantt__label">
                <i :style="{ '--c': row.color }"></i>
                {{ row.label }}
              </div>
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

      <section class="panel">
        <header class="panel__head">
          <div>
            <h3 class="panel__title">任务执行趋势</h3>
            <p class="panel__sub">近 24 小时 · 完成 / 失败 / 进行中</p>
          </div>
        </header>
        <div class="panel__body panel__body--chart">
          <VChart class="chart" :option="trendOpt" autoresize />
        </div>
      </section>
    </div>

    <!-- 任务列表 -->
    <div v-loading="loading" class="panel">
      <div class="panel__head">
        <div>
          <h3 class="panel__title">任务明细</h3>
          <p class="panel__sub">点击任务查看白盒推理与工具调用链路</p>
        </div>
      </div>
      <ul class="task-list">
        <li
          v-for="t in list"
          :key="t.id"
          class="task-list__row"
          :class="{
            'is-done': t.status === 'done',
            'is-fail': t.status === 'fail',
          }"
          @click="onDetail(t)"
        >
          <span class="task-list__id">{{ t.id }}</span>
          <div class="task-list__title">
            <div class="task-list__name">{{ t.title }}</div>
            <div class="task-list__sub">{{ t.agent }}</div>
          </div>
          <div class="task-list__progress">
            <div class="task-list__bar" :class="progressCls(t.status)">
              <span :style="{ width: t.progress + '%' }"/>
            </div>
            <span class="task-list__pct">{{ t.progress }}%</span>
          </div>
          <span class="task-list__status" :class="`is-${t.status}`">
            <i class="dot"></i>
            {{ statusLabel(t.status) }}
          </span>
          <span class="task-list__time">{{ t.time }}</span>
        </li>
      </ul>
      <EmptyState v-if="!loading && !list.length" title="暂无任务" desc="试着调整筛选或触发一个新任务" />
    </div>

    <!-- 详情抽屉 -->
    <Teleport to="body">
      <transition name="drawer">
        <div v-if="drawer" class="drawer-mask" @click.self="drawer = false">
          <aside class="drawer">
            <header class="drawer__head">
              <div>
                <div class="drawer__title">{{ current?.title || '任务详情' }}</div>
                <div class="drawer__id">{{ current?.id }}</div>
              </div>
              <button class="iconbtn" @click="drawer = false" aria-label="关闭">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </header>
            <div v-if="current" class="drawer__body">
              <div class="drawer__stats">
                <div>
                  <span>执行员工</span>
                  <strong>{{ current.agent }}</strong>
                </div>
                <div>
                  <span>耗时</span>
                  <strong>{{ current.time }}</strong>
                </div>
                <div>
                  <span>状态</span>
                  <strong class="status" :class="`is-${current.status}`">
                    <i class="dot"></i>
                    {{ statusLabel(current.status) }}
                  </strong>
                </div>
              </div>
              <div class="drawer__progress">
                <div class="drawer__progress-label">
                  <span>执行进度</span><span>{{ current.progress }}%</span>
                </div>
                <div class="task-list__bar" :class="progressCls(current.status)">
                  <span :style="{ width: current.progress + '%' }"/>
                </div>
              </div>
              <h4 class="drawer__h">执行轨迹</h4>
              <ol class="drawer__steps">
                <li v-for="(s, i) in steps" :key="i">
                  <i class="dot" :class="{ 'is-active': i === steps.length - 1 }"></i>
                  <div>
                    <div class="drawer__step-label">{{ s.label }}</div>
                    <div class="drawer__step-time">{{ s.ts }}</div>
                  </div>
                </li>
              </ol>
              <div class="drawer__actions">
                <button class="btn btn--ghost" @click="drawer = false">关闭</button>
                <button v-if="current.status === 'run' || current.status === 'wait'" class="btn btn--danger" @click="onCancel(current)">取消任务</button>
                <button v-if="current.status === 'fail'" class="btn btn--primary" @click="onReassign(current)">重派</button>
              </div>
            </div>
          </aside>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
defineOptions({ name: 'Tasks' })
import { ref, onMounted, computed } from 'vue'
import { listTasks as getTasks, cancelTask, reassignTask } from '@/api/tasks-files'
import FilterBar from '@/components/FilterBar.vue'
import EmptyState from '@/components/EmptyState.vue'
import VChart from 'vue-echarts'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useToastStore } from '@/stores/toast'

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const toast = useToastStore()
const entering = ref(true)
const filter = ref({ status: '', pageNo: 1, pageSize: 20 })
const list = ref([])
const total = ref(0)
const loading = ref(false)
const drawer = ref(false)
const current = ref(null)

const steps = [
  { ts: '14:22:18', label: '任务创建，分配执行员工' },
  { ts: '14:22:36', label: '加载知识库与上下文' },
  { ts: '14:23:42', label: '执行中：调用遥测接口' },
  { ts: '14:24:08', label: '执行中：分析告警数据' },
  { ts: '14:25:30', label: '生成诊断报告' },
]

/* ============== 甘特图（与 prototype copy 一致） ============== */
const hours = ['08', '10', '12', '14', '16', '18', '20', '22']
const gantt = [
  { label: '链路诊断 · 北斗-A2', cls: 'gantt__bar--done', text: '100%', color: 'var(--ok)',       style: 'left: 0%;   width: 12%' },
  { label: '信关站健康巡检',     cls: 'gantt__bar--done', text: '100%', color: 'var(--ok)',       style: 'left: 6%;   width: 18%' },
  { label: '载荷遥测分析',       cls: 'gantt__bar--run',  text: '64%',  color: 'var(--accent)',   style: 'left: 22%;  width: 36%' },
  { label: '干扰源定位',         cls: 'gantt__bar--run',  text: '38%',  color: 'var(--accent-2)', style: 'left: 38%;  width: 24%' },
  { label: '异常数据导出',       cls: 'gantt__bar--wait', text: '排队',  color: 'var(--ink-3)',    style: 'left: 58%;  width: 14%' },
  { label: '周报生成',           cls: 'gantt__bar--wait', text: '排队',  color: 'var(--info)',     style: 'left: 72%;  width: 18%' },
  { label: '训练数据预处理',     cls: 'gantt__bar--run',  text: '75%',  color: 'var(--magenta)',  style: 'left: 80%;  width: 16%' },
]

/* ============== 任务执行趋势（ECharts，与 copy 一致） ============== */
const trendOpt = computed(() => {
  const labels = Array.from({ length: 24 }, (_, i) => `${i}h`)
  const completed = Array.from({ length: 24 }, (_, i) => 40 + Math.round(Math.sin(i * 0.5) * 12 + Math.random() * 8))
  const failed    = Array.from({ length: 24 }, () => Math.round(Math.random() * 4))
  const running   = Array.from({ length: 24 }, () => 3 + Math.round(Math.random() * 4))
  return {
    grid: { left: 36, right: 18, top: 38, bottom: 28 },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(20,22,38,0.92)', borderColor: 'rgba(255,255,255,0.08)', textStyle: { color: '#e8ebf5', fontFamily: 'JetBrains Mono', fontSize: 11 } },
    legend: { top: 4, textStyle: { color: 'var(--ink-2)', fontFamily: 'JetBrains Mono', fontSize: 11 }, icon: 'roundRect' },
    xAxis: {
      type: 'category', data: labels, boundaryGap: false,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.12)' } },
      axisLabel: { color: 'var(--ink-3)', fontFamily: 'JetBrains Mono', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisLabel: { color: 'var(--ink-3)', fontFamily: 'JetBrains Mono', fontSize: 10 },
    },
    series: [
      { name: '完成',   type: 'line', data: completed, smooth: true, symbol: 'none', lineStyle: { width: 1.6, color: '#10b981' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(16,185,129,0.32)' }, { offset: 1, color: 'rgba(16,185,129,0)' }]) } },
      { name: '失败',   type: 'line', data: failed,    smooth: true, symbol: 'none', lineStyle: { width: 1.6, color: '#f43f5e' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(244,63,94,0.28)' }, { offset: 1, color: 'rgba(244,63,94,0)' }]) } },
      { name: '运行中', type: 'line', data: running,   smooth: true, symbol: 'none', lineStyle: { width: 1.6, color: '#8b5cf6' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(139,92,246,0.32)' }, { offset: 1, color: 'rgba(139,92,246,0)' }]) } },
    ],
  }
})

async function load() {
  loading.value = true
  try {
    const data = await getTasks({ status: filter.value.status, pageNo: filter.value.pageNo, pageSize: filter.value.pageSize })
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function statusLabel(s) {
  return { run: '进行中', done: '已完成', fail: '失败', wait: '等待', cancelled: '已取消' }[s] || s
}
function progressCls(s) {
  if (s === 'done') return 'is-done'
  if (s === 'fail') return 'is-fail'
  return ''
}
function onDetail(row) { current.value = row; drawer.value = true }
async function onCancel(row) {
  await cancelTask(row.id)
  toast.success('任务已取消')
  drawer.value = false
  await load()
}
async function onReassign(row) {
  await reassignTask(row.id)
  toast.success('已重新派发')
  drawer.value = false
  await load()
}

onMounted(() => {
  setTimeout(() => { entering.value = false }, 480)
  load()
})
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: var(--sp-4); }
.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--sp-3);
  flex-wrap: wrap;
}
.page-title { margin: 0; font-size: 20px; font-weight: 600; color: var(--ink); font-family: var(--font-display); }
.page-sub { margin: 4px 0 0; color: var(--ink-3); font-size: 12.5px; }
.page-head__actions { display: inline-flex; gap: 8px; }

/* ============== STATS ============== */
.tasks-stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  padding: 14px 18px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-blur);
}
.tasks-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px;
  border-right: 1px solid var(--line);
}
.tasks-stat:last-child { border-right: 0; }
.tasks-stat span {
  font-size: 11.5px;
  color: var(--ink-3);
  font-family: var(--font-mono);
}
.tasks-stat strong {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: -0.02em;
}
.tasks-stat strong small {
  font-size: 12px;
  font-weight: 400;
  color: var(--ink-3);
  margin-left: 2px;
}
.text-ok    { color: var(--ok) !important; }
.text-danger { color: var(--danger) !important; }

/* ============== GRID 2COL + CHART PANEL ============== */
.grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.panel__body--chart { padding: 12px 16px 16px; }
.chart { width: 100%; height: 240px; }
@media (max-width: 900px) { .grid-2col { grid-template-columns: 1fr; } }

/* ============== GANTT ============== */
.gantt {
  display: flex; flex-direction: column; gap: 6px;
  padding: 14px 18px 12px;
}
.gantt__row {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 12px;
  align-items: center;
  font-size: 12px;
}
.gantt__label {
  color: var(--ink-2);
  font-weight: 500;
  display: flex; align-items: center; gap: 8px;
  font-family: var(--font-body);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.gantt__label i {
  width: 8px; height: 8px; border-radius: 2px;
  background: var(--c, var(--accent));
  flex-shrink: 0;
}
.gantt__track {
  position: relative;
  height: 24px;
  background: var(--surface-2);
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--line);
}
.gantt__bar {
  position: absolute;
  top: 4px;
  height: 16px;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  border-radius: 4px;
  display: flex; align-items: center; justify-content: flex-end;
  padding: 0 8px;
  font-size: 10.5px;
  font-weight: 600;
  color: #fff;
  font-family: var(--font-mono);
  min-width: 30px;
  white-space: nowrap;
  transition: filter var(--dur-fast) var(--ease);
}
.gantt__bar:hover { filter: brightness(1.1); }
.gantt__bar--done { background: linear-gradient(90deg, #10b981, #34d399); }
.gantt__bar--run  { background: linear-gradient(90deg, var(--accent), var(--accent-2)); }
.gantt__bar--wait { background: linear-gradient(90deg, #6b7088, #9ca3af); }
.gantt__axis {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--ink-3);
  border-top: 1px solid var(--line);
  padding-top: 6px;
  margin-top: 4px;
  display: grid;
  grid-template-columns: 180px repeat(8, 1fr);
  gap: 12px;
  text-align: center;
}

/* ============== PANEL ============== */
.panel {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  backdrop-filter: var(--glass-blur);
}
.panel__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--line);
}
.panel__title { margin: 0; font-size: 14px; font-weight: 600; color: var(--ink); font-family: var(--font-display); }
.panel__sub   { margin: 2px 0 0; font-size: 12px; color: var(--ink-3); }

/* ============== TASK LIST ============== */
.task-list { list-style: none; padding: 0; margin: 0; }
.task-list__row {
  display: grid;
  grid-template-columns: 180px 1fr 240px 110px 80px;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--line);
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease);
}
.task-list__row:hover { background: var(--surface-2); }
.task-list__row:last-child { border-bottom: 0; }
.task-list__id {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-3);
}
.task-list__name { font-size: 13.5px; color: var(--ink); font-weight: 500; }
.task-list__sub  { font-size: 11.5px; color: var(--ink-3); margin-top: 2px; }

.task-list__progress {
  display: flex;
  align-items: center;
  gap: 8px;
}
.task-list__bar {
  flex: 1;
  height: 6px;
  background: var(--surface-2);
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid var(--line);
}
.task-list__bar > span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  border-radius: inherit;
  transition: width 0.4s var(--ease);
}
.task-list__bar.is-done > span { background: linear-gradient(90deg, var(--ok), #67e8f9); }
.task-list__bar.is-fail > span { background: linear-gradient(90deg, var(--danger), #fb7185); }
.task-list__pct {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--ink-2);
  min-width: 38px;
  text-align: right;
}

.task-list__status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--ink-2);
  font-weight: 500;
}
.task-list__status .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 4px currentColor;
}
.task-list__status.is-done .dot  { background: var(--ok); color: var(--ok); }
.task-list__status.is-fail .dot  { background: var(--danger); color: var(--danger); }
.task-list__status.is-wait .dot  { background: var(--ink-3); color: var(--ink-3); }
.task-list__status.is-run .dot   { background: var(--accent); color: var(--accent); animation: pulse 1.6s var(--ease) infinite; }

.task-list__time {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-3);
  text-align: right;
}

/* ============== DRAWER ============== */
.drawer-mask {
  position: fixed; inset: 0;
  background: rgba(8, 10, 24, 0.55);
  backdrop-filter: blur(6px);
  display: flex; justify-content: flex-end;
  z-index: 1000;
}
.drawer {
  width: 460px; max-width: 92vw;
  height: 100%;
  background: var(--surface);
  border-left: 1px solid var(--line);
  display: flex; flex-direction: column;
  box-shadow: -8px 0 32px rgba(0,0,0,0.32);
}
.drawer__head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid var(--line);
}
.drawer__title { font-size: 15px; font-weight: 600; color: var(--ink); }
.drawer__id { font-family: var(--font-mono); font-size: 11.5px; color: var(--ink-3); margin-top: 2px; }
.drawer__body { padding: 20px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 18px; }
.drawer__stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
}
.drawer__stats > div {
  padding: 10px 12px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 8px;
}
.drawer__stats span { font-size: 11px; color: var(--ink-3); font-family: var(--font-mono); display: block; }
.drawer__stats strong { font-size: 13px; color: var(--ink); font-weight: 600; display: block; margin-top: 2px; }
.drawer__stats .status {
  display: inline-flex; align-items: center; gap: 4px;
}
.drawer__stats .status .dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: currentColor; box-shadow: 0 0 4px currentColor;
}
.drawer__stats .status.is-done  { color: var(--ok); }
.drawer__stats .status.is-fail  { color: var(--danger); }
.drawer__stats .status.is-run   { color: var(--accent); }
.drawer__stats .status.is-wait  { color: var(--ink-3); }

.drawer__progress-label {
  display: flex; justify-content: space-between;
  font-size: 12px; color: var(--ink-3); margin-bottom: 6px;
  font-family: var(--font-mono);
}
.drawer__h { margin: 0; font-size: 13px; color: var(--ink); font-weight: 600; font-family: var(--font-display); }
.drawer__steps {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 12px;
  position: relative;
}
.drawer__steps::before {
  content: '';
  position: absolute;
  left: 5px; top: 8px; bottom: 8px;
  width: 1px;
  background: var(--line);
}
.drawer__steps li { display: flex; gap: 12px; align-items: flex-start; position: relative; }
.drawer__steps li .dot {
  width: 11px; height: 11px;
  border-radius: 50%;
  background: var(--ok);
  margin-top: 3px;
  flex-shrink: 0;
  z-index: 1;
  box-shadow: 0 0 0 3px var(--surface);
}
.drawer__steps li .dot.is-active {
  background: var(--accent);
  box-shadow: 0 0 0 3px var(--surface), 0 0 8px var(--accent);
  animation: pulse 1.6s var(--ease) infinite;
}
.drawer__step-label { font-size: 13px; color: var(--ink); }
.drawer__step-time  { font-size: 11.5px; color: var(--ink-3); font-family: var(--font-mono); margin-top: 2px; }
.drawer__actions { display: flex; gap: 8px; justify-content: flex-end; padding-top: 4px; }

/* drawer transition */
.drawer-enter-active, .drawer-leave-active { transition: opacity 0.24s var(--ease); }
.drawer-enter-active .drawer, .drawer-leave-active .drawer { transition: transform 0.32s var(--ease); }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-from .drawer, .drawer-leave-to .drawer { transform: translateX(100%); }

.iconbtn {
  width: 32px; height: 32px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--ink-2);
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
}
.iconbtn:hover { background: var(--surface-2); color: var(--ink); }
.iconbtn svg { width: 14px; height: 14px; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.5; }
}
.view-enter { animation: viewEnter 0.42s var(--ease) both; }
@keyframes viewEnter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (max-width: 960px) {
  .tasks-stats { grid-template-columns: repeat(2, 1fr); }
  .task-list__row { grid-template-columns: 1fr; gap: 8px; }
}
</style>
