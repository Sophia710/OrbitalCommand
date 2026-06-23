<template>
  <div class="sat-grid" :style="gridStyle">
    <div
      v-for="(s, i) in list"
      :key="i"
      class="sat-cell"
      :class="`is-${s.state}`"
      :title="`${s.name} · ${labelOf(s.state)}`"
    >
      <span class="sat-name">{{ s.name }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  list:    { type: Array,  required: true },
  columns: { type: Number, default: 8 },
})

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
}))

function labelOf(state) {
  return { ok: '正常', warn: '告警', danger: '故障', off: '离线' }[state] || state
}
</script>

<style scoped>
.sat-grid {
  display: grid;
  gap: 4px;
  width: 100%;
}
.sat-cell {
  position: relative;
  aspect-ratio: 1 / 1;
  display: grid;
  place-items: center;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.04em;
  cursor: default;
  transition: transform var(--dur-fast) var(--ease);
}
.sat-cell:hover { transform: scale(1.12); z-index: 2; box-shadow: 0 0 0 1px var(--color-primary-soft); }
.sat-name { color: rgba(255, 255, 255, 0.78); }
.is-ok      { background: rgba(16, 185, 129, 0.6); animation: pulse-ok 3s ease-in-out infinite; }
.is-warn    { background: rgba(245, 158, 11, 0.7); }
.is-danger  { background: rgba(244, 63, 94, 0.75); animation: pulse-danger 1.4s ease-in-out infinite; }
.is-off     { background: rgba(110, 117, 149, 0.45); }

@keyframes pulse-ok { 0%, 100% { opacity: 1; } 50% { opacity: 0.78; } }
@keyframes pulse-danger { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }

@media (max-width: 480px) {
  .sat-cell { font-size: 9px; }
  .sat-grid { gap: 3px; }
}
</style>
