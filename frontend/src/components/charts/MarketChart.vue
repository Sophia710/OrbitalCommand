﻿<template>
  <div class="market-chart" :class="['is-type-' + chartType]">
    <header class="market-chart__head">
      <div class="market-chart__head-text">
        <h4 class="market-chart__title">{{ title }}</h4>
        <p v-if="desc" class="market-chart__desc">{{ desc }}</p>
      </div>
      <button
        type="button"
        class="market-chart__collapse"
        :class="{ 'is-collapsed': collapsed }"
        :aria-label="collapsed ? '展开图表' : '折叠图表'"
        :title="collapsed ? '展开' : '折叠'"
        @click="collapsed = !collapsed"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
    </header>
    <div v-show="!collapsed" class="market-chart__body">
      <!-- 饼图 -->
      <svg v-if="chartType === 'pie'" class="market-chart__svg" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet" role="img" :aria-label="title">
        <g transform="translate(100,100)">
          <path
            v-for="(seg, i) in pieSegments"
            :key="i"
            :d="seg.path"
            :fill="seg.color"
            :class="['market-chart__pie-slice', { 'is-hover': hoveredIndex === i }]"
            @mouseenter="hoveredIndex = i"
            @mouseleave="hoveredIndex = -1"
          />
          <circle r="48" fill="var(--surface, #0f172a)" />
          <text text-anchor="middle" dy="2" class="market-chart__pie-center-value">
            {{ pieTotal }}
          </text>
          <text text-anchor="middle" dy="20" class="market-chart__pie-center-label">
            总计
          </text>
        </g>
      </svg>

      <!-- 柱状图 -->
      <svg v-else-if="chartType === 'bar'" class="market-chart__svg" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid meet" role="img" :aria-label="title">
        <line x1="36" y1="170" x2="312" y2="170" stroke="rgba(148, 163, 184, 0.3)" stroke-width="1" />
        <g v-for="(bar, i) in barItems" :key="i">
          <rect
            :x="bar.x"
            :y="bar.y"
            :width="bar.w"
            :height="bar.h"
            :fill="data.series[0]?.color || '#8b5cf6'"
            rx="2"
            class="market-chart__bar"
          />
          <text :x="bar.x + bar.w / 2" :y="bar.y - 4" text-anchor="middle" class="market-chart__bar-value">
            {{ bar.value }}
          </text>
          <text :x="bar.x + bar.w / 2" y="184" text-anchor="middle" class="market-chart__bar-label">
            {{ bar.label }}
          </text>
        </g>
      </svg>

      <!-- 雷达图 -->
      <svg v-else-if="chartType === 'radar'" class="market-chart__svg" viewBox="0 0 320 240" preserveAspectRatio="xMidYMid meet" role="img" :aria-label="title">
        <!-- 同心多边形 -->
        <g v-for="lvl in 5" :key="'lv' + lvl" class="market-chart__radar-grid">
          <polygon
            :points="radarGridPoints(lvl / 5)"
            fill="none"
            stroke="rgba(148, 163, 184, 0.18)"
            stroke-width="1"
          />
        </g>
        <!-- 轴线 -->
        <line
          v-for="(ind, i) in data.indicators"
          :key="'ax' + i"
          :x1="radarCenter.x"
          :y1="radarCenter.y"
          :x2="radarAxisPoint(i).x"
          :y2="radarAxisPoint(i).y"
          stroke="rgba(148, 163, 184, 0.18)"
          stroke-width="1"
        />
        <!-- 数据多边形 -->
        <g v-for="(s, si) in data.series" :key="'se' + si">
          <polygon
            :points="radarDataPoints(s.value)"
            :fill="s.color + '33'"
            :stroke="s.color"
            stroke-width="2"
            class="market-chart__radar-series"
          />
          <g v-for="(v, i) in s.value" :key="'p' + si + '-' + i">
            <circle
              :cx="radarValuePoint(i, v)"
              :cy="radarValuePoint(i, v, true)"
              r="3"
              :fill="s.color"
            />
          </g>
        </g>
        <!-- 指标标签 -->
        <text
          v-for="(ind, i) in data.indicators"
          :key="'lb' + i"
          :x="radarLabelPoint(i).x"
          :y="radarLabelPoint(i).y"
          text-anchor="middle"
          dominant-baseline="middle"
          class="market-chart__radar-label"
        >{{ ind.name }}</text>
      </svg>

      <!-- 图例 -->
      <ul class="market-chart__legend">
        <template v-if="chartType === 'pie'">
          <li v-for="(seg, i) in data" :key="i" :class="{ 'is-hover': hoveredIndex === i }">
            <span class="market-chart__legend-dot" :style="{ background: seg.color }" />
            <span class="market-chart__legend-label">{{ seg.name }}</span>
            <span class="market-chart__legend-value">{{ seg.value }} ({{ piePercent(seg.value) }}%)</span>
          </li>
        </template>
        <template v-else-if="chartType === 'bar'">
          <li v-for="(s, i) in data.series" :key="i">
            <span class="market-chart__legend-dot" :style="{ background: s.color }" />
            <span class="market-chart__legend-label">{{ s.name }}</span>
          </li>
        </template>
        <template v-else-if="chartType === 'radar'">
          <li v-for="(s, i) in data.series" :key="i">
            <span class="market-chart__legend-dot" :style="{ background: s.color }" />
            <span class="market-chart__legend-label">{{ s.name }}</span>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  chartType: { type: String, default: 'pie' },  // 'pie' | 'bar' | 'radar'
  title:     { type: String, default: '' },
  desc:      { type: String, default: '' },
  data:      { type: [Array, Object], required: true },
})

const collapsed = ref(false)
const hoveredIndex = ref(-1)

/* ============ 饼图 ============ */
const pieTotal = computed(() => {
  const arr = Array.isArray(props.data) ? props.data : []
  return arr.reduce((s, d) => s + Number(d.value || 0), 0)
})
const piePercent = (v) => {
  const total = pieTotal.value
  if (!total) return '0'
  return ((Number(v) / total) * 100).toFixed(1)
}
const pieSegments = computed(() => {
  const arr = Array.isArray(props.data) ? props.data : []
  const total = pieTotal.value
  if (!total) return []
  let startAngle = -Math.PI / 2
  return arr.map((d) => {
    const value = Number(d.value || 0)
    const angle = (value / total) * Math.PI * 2
    const endAngle = startAngle + angle
    const x1 = Math.cos(startAngle) * 90
    const y1 = Math.sin(startAngle) * 90
    const x2 = Math.cos(endAngle) * 90
    const y2 = Math.sin(endAngle) * 90
    const large = angle > Math.PI ? 1 : 0
    const path = `M 0 0 L ${x1} ${y1} A 90 90 0 ${large} 1 ${x2} ${y2} Z`
    const seg = { path, color: d.color, name: d.name, value }
    startAngle = endAngle
    return seg
  })
})

/* ============ 柱状图 ============ */
const barItems = computed(() => {
  const d = props.data
  if (!d || !d.categories || !d.series) return []
  const values = d.series[0]?.data || []
  const max = Math.max(...values, 1)
  const barCount = d.categories.length
  const plotW = 276
  const plotH = 150
  const gap = 6
  const barW = (plotW - gap * (barCount - 1)) / barCount
  return d.categories.map((cat, i) => {
    const v = Number(values[i] || 0)
    const h = (v / max) * plotH
    return {
      label: cat,
      value: v,
      x: 36 + i * (barW + gap),
      y: 170 - h,
      w: barW,
      h,
    }
  })
})

/* ============ 雷达图 ============ */
const radarCenter = { x: 160, y: 120 }
const radarRadius = 80
const radarGridPoints = (ratio) => {
  const indicators = props.data?.indicators || []
  const n = indicators.length
  if (!n) return ''
  return indicators
    .map((_, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n
      return `${radarCenter.x + Math.cos(angle) * radarRadius * ratio},${radarCenter.y + Math.sin(angle) * radarRadius * ratio}`
    })
    .join(' ')
}
const radarAxisPoint = (i) => {
  const indicators = props.data?.indicators || []
  const n = indicators.length
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n
  return {
    x: radarCenter.x + Math.cos(angle) * radarRadius,
    y: radarCenter.y + Math.sin(angle) * radarRadius,
  }
}
const radarValuePoint = (i, value, returnY = false) => {
  const indicators = props.data?.indicators || []
  const n = indicators.length
  const max = indicators[i]?.max || 5
  const ratio = (Number(value) || 0) / max
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n
  const r = radarRadius * ratio
  const x = radarCenter.x + Math.cos(angle) * r
  const y = radarCenter.y + Math.sin(angle) * r
  return returnY ? y : x
}
const radarDataPoints = (values) => {
  const indicators = props.data?.indicators || []
  return values
    .map((v, i) => {
      const max = indicators[i]?.max || 5
      const ratio = Number(v) / max
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / indicators.length
      const r = radarRadius * ratio
      return `${radarCenter.x + Math.cos(angle) * r},${radarCenter.y + Math.sin(angle) * r}`
    })
    .join(' ')
}
const radarLabelPoint = (i) => {
  const indicators = props.data?.indicators || []
  const n = indicators.length
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n
  return {
    x: radarCenter.x + Math.cos(angle) * (radarRadius + 18),
    y: radarCenter.y + Math.sin(angle) * (radarRadius + 18),
  }
}
</script>

<style scoped>
.market-chart {
  background: var(--surface, #0f172a);
  border: 1px solid var(--line, rgba(148, 163, 184, 0.2));
  border-radius: 12px;
  padding: 14px 16px;
  margin: 8px 0;
  transition: border-color 0.2s;
}
.market-chart:hover { border-color: var(--accent, #8b5cf6); }
.market-chart__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
.market-chart__title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink, #e2e8f0);
  font-family: var(--font-display, system-ui);
  letter-spacing: -0.01em;
}
.market-chart__desc {
  margin: 3px 0 0;
  font-size: 11.5px;
  color: var(--ink-3, #94a3b8);
  line-height: 1.5;
}
.market-chart__collapse {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  background: transparent;
  border: 1px solid var(--line, rgba(148, 163, 184, 0.2));
  border-radius: 6px;
  cursor: pointer;
  color: var(--ink-3, #94a3b8);
  transition: all 0.15s;
  flex-shrink: 0;
}
.market-chart__collapse:hover { color: var(--ink, #e2e8f0); border-color: var(--accent, #8b5cf6); }
.market-chart__collapse svg {
  width: 14px; height: 14px;
  transition: transform 0.2s;
}
.market-chart__collapse.is-collapsed svg { transform: rotate(-90deg); }
.market-chart__body {
  display: grid;
  grid-template-columns: 1fr 140px;
  gap: 14px;
  align-items: center;
}
.market-chart__svg {
  width: 100%;
  height: 200px;
  display: block;
}
.market-chart__pie-slice {
  cursor: pointer;
  transition: opacity 0.15s, transform 0.15s;
  transform-origin: center;
}
.market-chart__pie-slice.is-hover { opacity: 0.85; transform: scale(1.03); }
.market-chart__pie-center-value {
  font-size: 18px;
  font-weight: 600;
  fill: var(--ink, #e2e8f0);
  font-family: var(--font-display, system-ui);
}
.market-chart__pie-center-label {
  font-size: 9px;
  fill: var(--ink-3, #94a3b8);
  font-family: var(--font-mono, monospace);
  letter-spacing: 0.08em;
}
.market-chart__bar {
  transition: opacity 0.15s;
}
.market-chart__bar:hover { opacity: 0.85; }
.market-chart__bar-value {
  font-size: 10px;
  fill: var(--ink, #e2e8f0);
  font-family: var(--font-mono, monospace);
  font-weight: 500;
}
.market-chart__bar-label {
  font-size: 9.5px;
  fill: var(--ink-3, #94a3b8);
  font-family: var(--font-body, system-ui);
}
.market-chart__radar-grid { pointer-events: none; }
.market-chart__radar-series {
  transition: opacity 0.15s;
  cursor: pointer;
}
.market-chart__radar-series:hover { opacity: 0.9; }
.market-chart__radar-label {
  font-size: 10px;
  fill: var(--ink-2, #cbd5e1);
  font-family: var(--font-body, system-ui);
}
.market-chart__legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 11.5px;
  color: var(--ink-2, #cbd5e1);
  min-width: 0;
}
.market-chart__legend li {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.05);
  transition: background 0.15s;
}
.market-chart__legend li.is-hover { background: rgba(139, 92, 246, 0.12); }
.market-chart__legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}
.market-chart__legend-label {
  flex: 1;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.market-chart__legend-value {
  font-family: var(--font-mono, monospace);
  font-size: 10.5px;
  color: var(--ink-3, #94a3b8);
  flex-shrink: 0;
}
@media (max-width: 480px) {
  .market-chart__body {
    grid-template-columns: 1fr;
  }
  .market-chart__legend {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>