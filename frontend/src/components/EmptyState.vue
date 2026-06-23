<template>
  <div class="plaza-empty">
    <div class="plaza-empty__icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
        <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
      </svg>
    </div>
    <h4>{{ title }}</h4>
    <p v-if="desc">{{ desc }}</p>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '暂无数据' },
  desc:  { type: String, default: '' },
  type:  { type: String, default: 'doc' },
})
</script>

<style scoped>
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
  font-weight: 600;
  letter-spacing: -0.01em;
}
.plaza-empty p {
  font-size: 12.5px;
  color: var(--ink-3);
  margin: 0 0 8px;
  max-width: 360px;
  line-height: 1.6;
}
</style>
