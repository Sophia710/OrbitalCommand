<template>
  <div class="page page-404" :class="{ 'view-enter': entering }">
    <div class="bg-deco" aria-hidden="true">
      <svg viewBox="0 0 400 400" width="100%" height="100%">
        <defs>
          <radialGradient id="rg404" cx="50%" cy="50%">
            <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.5" />
            <stop offset="100%" stop-color="var(--accent)" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="orbit" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="var(--accent)" />
            <stop offset="100%" stop-color="var(--accent-2)" />
          </linearGradient>
        </defs>
        <circle cx="200" cy="200" r="170" fill="url(#rg404)" />
        <circle cx="200" cy="200" r="130" stroke="url(#orbit)" stroke-opacity="0.5" fill="none" class="orbit orbit--1"/>
        <circle cx="200" cy="200" r="100" stroke="url(#orbit)" stroke-opacity="0.6" fill="none" class="orbit orbit--2"/>
        <circle cx="200" cy="200" r="70"  stroke="url(#orbit)" stroke-opacity="0.7" fill="none" class="orbit orbit--3"/>
        <circle cx="200" cy="200" r="6" fill="var(--accent-2)">
          <animate attributeName="r" values="6;10;6" dur="2.4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="1;0.4;1" dur="2.4s" repeatCount="indefinite"/>
        </circle>
      </svg>
    </div>

    <div class="content">
      <div class="code">404</div>
      <h1 class="title">信号丢失</h1>
      <p class="desc">你访问的页面已被流星击落或从未存在。<br />请检查地址，或返回工作台继续你的任务。</p>
      <div class="actions">
        <button class="btn btn--primary btn--lg" @click="$router.push('/workbench')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12l9-9 9 9M5 10v10h14V10"/>
          </svg>
          返回工作台
        </button>
        <button class="btn btn--ghost btn--lg" @click="$router.back()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          返回上一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'NotFound' })
import { ref, onMounted } from 'vue'

const entering = ref(true)
onMounted(() => setTimeout(() => { entering.value = false }, 480))
</script>

<style scoped>
.page {
  position: relative;
  min-height: calc(100vh - 200px);
  display: grid;
  place-items: center;
  overflow: hidden;
}

.bg-deco {
  position: absolute;
  inset: 0;
  max-width: 520px;
  max-height: 520px;
  margin: auto;
  opacity: 0.75;
  pointer-events: none;
}
.orbit {
  transform-origin: 200px 200px;
  stroke-dasharray: 6 4;
  animation: orbitSpin 16s linear infinite;
}
.orbit--1 { animation-duration: 18s; }
.orbit--2 { animation-duration: 12s; animation-direction: reverse; }
.orbit--3 { animation-duration: 8s; }
@keyframes orbitSpin { to { transform: rotate(360deg); } }

.content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: var(--sp-6);
  max-width: 560px;
}
.code {
  font-family: var(--font-display);
  font-size: 108px;
  font-weight: 700;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  line-height: 1;
  letter-spacing: -0.04em;
  margin-bottom: 8px;
  filter: drop-shadow(0 4px 20px var(--accent-glow));
}
.title {
  margin: 8px 0 10px;
  font-family: var(--font-display);
  font-size: 28px;
  color: var(--ink);
  font-weight: 600;
  letter-spacing: -0.01em;
}
.desc {
  color: var(--ink-2);
  font-size: 14px;
  line-height: 1.7;
  margin: 0 0 var(--sp-6);
}
.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}
.btn--lg {
  padding: 11px 22px;
  font-size: 13.5px;
  border-radius: 10px;
}
.btn--lg svg { width: 16px; height: 16px; }

.view-enter { animation: viewEnter 0.42s var(--ease) both; }
@keyframes viewEnter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .code { font-size: 80px; }
  .title { font-size: 22px; }
}
</style>
