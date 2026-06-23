<template>
  <div class="kpi-card lift" :class="tone">
    <div class="kpi-head">
      <div class="kpi-label">
        <el-icon v-if="icon" class="kpi-icon"><component :is="icon" /></el-icon>
        <span>{{ label }}</span>
      </div>
      <span v-if="trend != null" :class="['kpi-trend', up ? 'is-up' : 'is-down']">
        <el-icon><CaretTop v-if="up" /><CaretBottom v-else /></el-icon>
        {{ Math.abs(trend) }}%
      </span>
    </div>
    <div class="kpi-value">
      <span class="kpi-num">{{ formatted }}</span>
      <span v-if="unit" class="kpi-unit">{{ unit }}</span>
    </div>
    <div v-if="desc" class="kpi-desc">{{ desc }}</div>
    <svg v-if="series && series.length" class="kpi-spark" viewBox="0 0 100 30" preserveAspectRatio="none">
      <defs>
        <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="stroke" stop-opacity="0.45" />
          <stop offset="100%" :stop-color="stroke" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path :d="areaPath" :fill="`url(#${gradId})`" />
      <path :d="linePath" :stroke="stroke" stroke-width="1.4" fill="none" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CaretTop, CaretBottom } from '@element-plus/icons-vue'
import { uid as makeUid } from '@/utils'

const props = defineProps({
  label:    { type: String,  required: true },
  value:    { type: [Number, String], required: true },
  unit:     { type: String,  default: '' },
  trend:    { type: Number,  default: null },
  up:       { type: Boolean, default: true },
  desc:     { type: String,  default: '' },
  icon:     { type: String,  default: '' },
  tone:     { type: String,  default: 'violet' }, // violet|cyan|amber|emerald|rose
  series:   { type: Array,   default: () => [] },
  precision:{ type: Number,  default: 0 },
})

const TONE_COLOR = {
  violet:  '#a78bfa',
  cyan:    '#22d3ee',
  amber:   '#fbbf24',
  emerald: '#10b981',
  rose:    '#fb7185',
}

const stroke = computed(() => TONE_COLOR[props.tone] || TONE_COLOR.violet)
const gradId = computed(() => `g-${makeUid('kpi')}`)

const formatted = computed(() => {
  if (typeof props.value === 'string') return props.value
  if (Number.isInteger(props.value)) return props.value.toLocaleString()
  return props.value.toFixed(props.precision)
})

const linePath = computed(() => {
  const s = props.series
  if (!s.length) return ''
  const max = Math.max(...s)
  const min = Math.min(...s)
  const range = max - min || 1
  return s.map((v, i) => {
    const x = (i / (s.length - 1)) * 100
    const y = 28 - ((v - min) / range) * 26
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
  }).join(' ')
})

const areaPath = computed(() => {
  if (!linePath.value) return ''
  return `${linePath.value} L 100 30 L 0 30 Z`
})
</script>

<style scoped>
.kpi-card {
  position: relative;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--r-lg);
  padding: 18px 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  min-height: 132px;
}
.kpi-card::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: linear-gradient(135deg, transparent 50%, currentColor 200%);
  opacity: 0.05;
  pointer-events: none;
}
.kpi-card.violet  { color: var(--color-primary-soft); }
.kpi-card.cyan    { color: var(--color-cyan); }
.kpi-card.amber   { color: var(--color-amber); }
.kpi-card.emerald { color: var(--color-emerald); }
.kpi-card.rose    { color: var(--color-rose); }

.kpi-head { display: flex; justify-content: space-between; align-items: center; }
.kpi-label {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--color-text-soft);
  letter-spacing: 0.04em; text-transform: uppercase;
  font-family: var(--font-mono);
}
.kpi-icon { color: inherit; }

.kpi-trend {
  display: inline-flex; align-items: center; gap: 2px;
  font-size: 11px; font-weight: 600;
  padding: 2px 6px; border-radius: var(--r-pill);
}
.kpi-trend.is-up   { color: var(--color-success); background: var(--color-success-bg); }
.kpi-trend.is-down { color: var(--color-danger);  background: var(--color-danger-bg); }

.kpi-value { display: flex; align-items: baseline; gap: 6px; }
.kpi-num {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.1;
  letter-spacing: -0.02em;
}
.kpi-unit { font-size: 13px; color: var(--color-text-mute); }

.kpi-desc { font-size: 12px; color: var(--color-text-mute); }

.kpi-spark { width: 100%; height: 30px; }

@media (max-width: 480px) {
  .kpi-card { padding: 14px; min-height: 110px; }
  .kpi-num { font-size: 22px; }
}
</style>
