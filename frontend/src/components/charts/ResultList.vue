﻿<template>
  <div class="result-list">
    <header class="result-list__head">
      <div class="result-list__head-text">
        <h4 class="result-list__title">{{ title }}</h4>
        <p class="result-list__summary">
          共 <b>{{ total }}</b> 条结果
          <span class="result-list__tag result-list__tag--high">高匹配 {{ highCount }}</span>
          <span class="result-list__tag result-list__tag--mid">中匹配 {{ midCount }}</span>
        </p>
      </div>
    </header>
    <ol class="result-list__items">
      <li
        v-for="(it, i) in items"
        :key="it.id || i"
        class="result-list__item"
      >
        <span class="result-list__index">{{ String(i + 1).padStart(2, '0') }}</span>
        <div class="result-list__main">
          <div class="result-list__row1">
            <a class="result-list__title-link" :title="it.title">{{ it.title }}</a>
            <span v-if="it.tag" class="result-list__pill">{{ it.tag }}</span>
          </div>
          <div class="result-list__meta">{{ it.meta }}</div>
          <p class="result-list__summary-text">{{ it.summary }}</p>
        </div>
      </li>
    </ol>
    <footer class="result-list__foot">
      共 {{ total }} 条结果 · 本页展示前 {{ items.length }} 条
    </footer>
  </div>
</template>

<script setup>
defineProps({
  title:     { type: String, default: '高匹配商机' },
  items:     { type: Array,  default: () => [] },
  total:     { type: Number, default: 0 },
  highCount: { type: Number, default: 0 },
  midCount:  { type: Number, default: 0 },
})
</script>

<style scoped>
.result-list {
  background: var(--surface, #0f172a);
  border: 1px solid var(--line, rgba(148, 163, 184, 0.2));
  border-radius: 12px;
  padding: 14px 16px;
  margin: 8px 0;
}
.result-list__head { margin-bottom: 12px; }
.result-list__title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink, #e2e8f0);
  font-family: var(--font-display, system-ui);
  letter-spacing: -0.01em;
}
.result-list__summary {
  margin: 4px 0 0;
  font-size: 11.5px;
  color: var(--ink-3, #94a3b8);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.result-list__summary b {
  color: var(--ink, #e2e8f0);
  font-weight: 600;
  font-family: var(--font-mono, monospace);
}
.result-list__tag {
  font-family: var(--font-mono, monospace);
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 600;
}
.result-list__tag--high {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.25);
}
.result-list__tag--mid {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.25);
}
.result-list__items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.result-list__item {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(148, 163, 184, 0.04);
  border: 1px solid var(--line, rgba(148, 163, 184, 0.16));
  border-radius: 8px;
  transition: all 0.15s;
}
.result-list__item:hover {
  background: rgba(139, 92, 246, 0.06);
  border-color: rgba(139, 92, 246, 0.3);
}
.result-list__index {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  font-weight: 600;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: #fff;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  margin-top: 1px;
}
.result-list__main { flex: 1; min-width: 0; }
.result-list__row1 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 3px;
}
.result-list__title-link {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink, #e2e8f0);
  text-decoration: none;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.15s;
}
.result-list__title-link:hover { color: var(--accent, #8b5cf6); }
.result-list__pill {
  font-family: var(--font-mono, monospace);
  font-size: 10px;
  padding: 1px 8px;
  border-radius: 4px;
  background: rgba(139, 92, 246, 0.12);
  color: var(--accent, #a78bfa);
  border: 1px solid rgba(139, 92, 246, 0.25);
  font-weight: 500;
  flex-shrink: 0;
}
.result-list__meta {
  font-size: 11px;
  color: var(--ink-3, #94a3b8);
  font-family: var(--font-mono, monospace);
  margin-bottom: 4px;
}
.result-list__summary-text {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--ink-2, #cbd5e1);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.result-list__foot {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--line, rgba(148, 163, 184, 0.2));
  font-size: 11px;
  color: var(--ink-3, #94a3b8);
  text-align: center;
  font-family: var(--font-mono, monospace);
}
</style>