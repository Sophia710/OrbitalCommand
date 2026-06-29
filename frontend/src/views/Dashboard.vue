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

    <!-- ============== KPI ROW / TRAFFIC+BEAM / CONSTELLATION+ALARMS / TASKS+COVERAGE 4 个 section 已永久移除 ============== -->
  </div>
</template>

<script setup>
defineOptions({ name: 'Workbench' })
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const user = useUserStore()

/* 入场动画:刷新 / 首次进入工作台时给一个轻微的淡入上移 */
const entering = ref(true)
onMounted(() => {
  setTimeout(() => (entering.value = false), 400)
})
</script>

<style scoped>
/* ============== VIEW ============== */
/* 4 个 section 已移除后,.view 需要撑满 .app-content-body 的剩余高度,
 * 让唯一的 hero section 真正"自适应父容器大小",消除底部空白。 */
.view {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
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
/* 关键修复:
 * 1) .view__hero 自身撑满 .view 高度,不再依赖内容撑高;
 * 2) .hero__visual 撑满右侧 grid 单元(去除固定 min-height);
 * 3) .orbit-stage 跟随可用空间缩放(去除固定 max-width / aspect-ratio),
 *    由容器高度与宽度取较小值决定尺寸,避免底部出现大块空白。 */
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
  flex: 1;
  min-height: 0;
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

/* 关键:.hero__visual 撑满其所在 grid 单元,内部 orbit-stage 继续撑满。 */
.hero__visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-width: 0;
  min-height: 0;
  /* 跟随 grid 单元高度变化,确保不再出现大块底部空白 */
  align-self: stretch;
  overflow: hidden;
}
.hero__visual .orbit-stage { width: 100%; max-width: 640px; }

/* ============== ORBIT STAGE ==============
 * 关键修复:移除固定 max-width 与 aspect-ratio,
 * 改为"取容器宽高的较小值"作为尺寸,
 * 使 orbit-stage 始终填满 .hero__visual 的可用空间。 */
.orbit-stage {
  position: relative;
  width: min(100%, 100%);
  height: min(100%, 100%);
  max-width: 720px;
  max-height: 720px;
  /* 在更宽的视口下,等比撑到容器短边,避免 480×480 固定大小造成空白 */
  aspect-ratio: 1;
  margin: auto;
}
.orbit-stage__svg { width: 100%; height: 100%; display: block; }
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

/* ============== BUTTONS ============== */
/* 4 个 section 已移除:btn 仅剩 hero__actions 中两枚按钮使用,保留最小样式 */
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

/* ============== 响应式 ============== */
@media (max-width: 1280px) {
  .view__hero { padding: 24px 28px; grid-template-columns: 1fr; }
  .hero__title { font-size: 32px; }
  /* 1280 以下为单列布局,给 .hero__visual 一个最小高度,避免太空 */
  .hero__visual { min-height: 360px; }
}
@media (max-width: 768px) {
  .view__hero { padding: 20px; }
  .hero__title { font-size: 26px; }
}
@media (max-width: 480px) {
  .hero__title { font-size: 22px; }
}
</style>
