<template>
  <!-- 装饰性背景：星空 + 网格 + 极光 + 轨道环 -->
  <div class="cosmos-bg" aria-hidden="true">
    <div class="cosmos-grid" />
    <div class="cosmos-stars" />
    <div class="cosmos-orbit cosmos-orbit--1" />
    <div class="cosmos-orbit cosmos-orbit--2" />
    <div class="cosmos-orbit cosmos-orbit--3" />
    <div class="cosmos-aurora" />
  </div>

  <!-- 应用外壳 -->
  <AppLayout>
    <router-view v-slot="{ Component, route }">
      <!--
        关键优化：≤ 300ms 页面切换
          1. <keep-alive include="..."> 缓存已渲染页面，避免重复创建 DOM
          2. transition name="page" 配合 animations.css，仅 GPU 加速属性
          3. onBeforeEnter 取消路由切换等待感
      -->
      <keep-alive :include="cachedViews" :max="5">
        <transition name="page" mode="out-in" :duration="{ enter: 260, leave: 180 }">
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </keep-alive>
    </router-view>
  </AppLayout>

  <!-- 全局 Toast 容器 -->
  <ToastContainer />

  <!-- 全局对话抽屉（员工广场 / 我的员工 / 工作台 卡片调用） -->
  <ChatOverlay />
</template>

<script setup>
import { onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import ChatOverlay from '@/components/ChatOverlay.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

// 需要被缓存的页面组件（name 选项）。缓存可大幅减少重复渲染开销。
const cachedViews = [
  'Workbench',
  'Plaza',
  'MyEmployees',
  'Data',
  'Tasks',
  'Files',
  'Review',
  'Audit',
  'Settings',
]

onMounted(() => {
  // 初始化主题
  appStore.initTheme()
  // 初始化侧边栏折叠状态（从 localStorage 恢复）
  appStore.initSidebar()
})
</script>

<style>
/* ============== COSMOS BACKGROUND ============== */
.cosmos-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
  background:
    radial-gradient(ellipse 60% 60% at 80% 0%, var(--accent-soft) 0%, transparent 60%),
    radial-gradient(ellipse 50% 50% at 0% 100%, rgba(217, 70, 239, 0.08) 0%, transparent 50%),
    var(--bg);
}
.cosmos-grid {
  position: absolute;
  inset: -2px;
  background-image:
    linear-gradient(var(--cosmos-grid-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--cosmos-grid-color) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse 90% 80% at 50% 50%, #000 30%, transparent 90%);
  -webkit-mask-image: radial-gradient(ellipse 90% 80% at 50% 50%, #000 30%, transparent 90%);
}
.cosmos-stars {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1px 1px at 13% 17%, rgba(255, 255, 255, 0.7), transparent 50%),
    radial-gradient(1px 1px at 28% 73%, rgba(255, 255, 255, 0.5), transparent 50%),
    radial-gradient(1px 1px at 47% 12%, rgba(255, 255, 255, 0.6), transparent 50%),
    radial-gradient(1px 1px at 71% 88%, rgba(255, 255, 255, 0.6), transparent 50%),
    radial-gradient(1px 1px at 89% 33%, rgba(255, 255, 255, 0.5), transparent 50%),
    radial-gradient(1px 1px at 60% 50%, rgba(255, 255, 255, 0.7), transparent 50%),
    radial-gradient(1px 1px at 35% 40%, rgba(255, 255, 255, 0.4), transparent 50%);
  animation: cosmosStarsTwinkle 6s ease-in-out infinite;
}
@keyframes cosmosStarsTwinkle {
  50% { opacity: 0.55; }
}
.cosmos-orbit {
  position: absolute;
  border-radius: 50%;
  border: 1px solid var(--accent);
  opacity: 0.22;
  animation: cosmosOrbitSpin 80s linear infinite;
}
.cosmos-orbit--1 { width: 900px; height: 900px; top: -350px; right: -250px; }
.cosmos-orbit--2 { width: 700px; height: 700px; bottom: -300px; left: -200px; animation-duration: 100s; animation-direction: reverse; opacity: 0.18; }
.cosmos-orbit--3 { width: 500px; height: 500px; top: 30%; left: 50%; opacity: 0.14; animation-duration: 120s; }
@keyframes cosmosOrbitSpin { to { transform: rotate(360deg); } }
.cosmos-aurora {
  position: absolute;
  inset: 0;
  background: conic-gradient(from 90deg at 50% 50%, transparent, var(--accent-soft), transparent, var(--accent-soft), transparent);
  filter: blur(80px);
  opacity: 0.45;
  animation: cosmosAurora 30s linear infinite;
}
@keyframes cosmosAurora { to { transform: rotate(360deg); } }

[data-theme='light'] .cosmos-orbit { opacity: 0.18; }
[data-theme='light'] .cosmos-aurora { opacity: 0.3; }

#app {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}
</style>
