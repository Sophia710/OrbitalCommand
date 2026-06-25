<template>
  <div class="page page-my" :class="{ 'view-enter': entering }">
    <header class="page-head">
      <div>
        <h2 class="page-title">我的员工</h2>
        <p class="page-sub">管理你创建或订阅的数字员工 · {{ myList.length }} 位</p>
      </div>
      <div class="page-head__actions">
        <button class="btn btn--ghost" @click="router.push('/plaza')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9h18M9 21V9"/>
          </svg>
          前往广场
        </button>
        <button class="btn btn--primary" @click="router.push('/create')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          创建员工
        </button>
      </div>
    </header>

    <div class="my-tabs">
      <button
        v-for="t in tabs"
        :key="t.value || 'all'"
        class="my-tab"
        :class="{ 'is-active': activeTab === t.value }"
        @click="activeTab = t.value"
      >
        {{ t.label }}<span>{{ t.count }}</span>
      </button>
    </div>

    <div v-loading="loading" v-if="loading || filteredList.length" class="my-grid">
      <article
        v-for="e in filteredList"
        :key="e.id"
        class="my-emp-card"
      >
        <div class="my-emp-card__head">
          <div class="emp-card__avatar">
            <span>{{ (e.name || '?').slice(0, 1) }}</span>
          </div>
          <div class="my-emp-card__title">
            <div class="my-emp-card__name">{{ e.name }}</div>
            <div class="my-emp-card__role">{{ kindLabel(e) }}</div>
          </div>
        </div>
        <div class="my-emp-card__body">
          <div class="my-emp-card__last">
            <b>最近：</b>{{ e.last || '暂无活动' }}
          </div>
          <div class="my-emp-card__stats">
            <div class="my-emp-card__stat">
              <b>{{ formatNumber(e.usage) }}</b>
              <span>调用次数</span>
            </div>
            <div class="my-emp-card__stat">
              <b>{{ e.doc || 0 }}</b>
              <span>知识库</span>
            </div>
            <div class="my-emp-card__stat">
              <b>{{ e.rating ? e.rating.toFixed(1) : '—' }}</b>
              <span>评分</span>
            </div>
          </div>
          <div class="my-emp-card__actions">
            <button class="btn btn--primary" @click="onChat(e)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              发布任务
            </button>
            <button class="btn btn--ghost" @click="onEdit(e)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
              </svg>
              编辑
            </button>
            <button class="btn btn--ghost is-danger" @click="onRelease(e)" title="解雇">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              </svg>
            </button>
          </div>
        </div>
      </article>
    </div>

    <EmptyState
      v-else-if="!loading"
      title="还没有匹配的员工"
      :desc="myList.length ? '切换标签或调整搜索条件' : '前往员工广场挑选你需要的数字员工'"
    >
      <button v-if="!myList.length" class="btn btn--primary btn--sm" @click="router.push('/plaza')">
        前往广场
      </button>
    </EmptyState>
  </div>
</template>

<script setup>
defineOptions({ name: 'MyEmployees' })
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { listMyEmployees as getMyEmployees, releaseEmployee } from '@/api/employees'
import EmptyState from '@/components/EmptyState.vue'
import { useToastStore } from '@/stores/toast'
import { useChatStore } from '@/stores/chat'

const router = useRouter()
const toast = useToastStore()
const chat = useChatStore()

const entering = ref(true)
const myList = ref([])
const loading = ref(false)
const activeTab = ref('')

const tabs = computed(() => [
  { value: '',         label: '全部',     count: myList.value.length },
  { value: 'mine',     label: '我创建的', count: myList.value.filter(m => isMine(m)).length },
  { value: 'subscribed', label: '我添加的', count: myList.value.filter(m => !isMine(m)).length },
])

function isMine(e) {
  return e.source === 'mine' || e.createdBy === 'me' || e.publisher === '当前用户'
}

const filteredList = computed(() => {
  if (!activeTab.value) return myList.value
  if (activeTab.value === 'mine') return myList.value.filter(isMine)
  return myList.value.filter(e => !isMine(e))
})

function kindLabel(e) {
  if (isMine(e)) return `我创建 · v${e.version || '0.1.0'}`
  return `雇佣 · ${e.publisher || '官方'}`
}

function formatNumber(n) {
  const num = Number(n) || 0
  if (num >= 10000) return `${(num / 10000).toFixed(1)}w`
  return num.toLocaleString()
}

function onChat(emp) {
  // 打开全局对话抽屉（与 prototype copy 的 openChat 行为一致）
  chat.openChat(emp)
}

function onEdit(emp) {
  toast.info(`编辑「${emp.name}」（示例）`)
}

async function onRelease(emp) {
  await releaseEmployee(emp.id)
  toast.info(`已移出「${emp.name}」`)
  await load()
}

async function load() {
  loading.value = true
  try {
    const { list } = await getMyEmployees()
    myList.value = (list || []).map(e => ({
      ...e,
      last: e.last || recentActivity(e),
      doc: e.doc || Math.floor(Math.random() * 8) + 1,
    }))
  } finally {
    loading.value = false
  }
}

function recentActivity(e) {
  const activities = [
    '2 分钟前 · 完成一次链路诊断',
    '12 分钟前 · 输出一份测试报告',
    '1 小时前 · 接入 3 个新终端',
    '今天 09:24 · 升级到 v' + (e.version || '1.0.0'),
    '昨天 18:02 · 完成干扰分析任务',
  ]
  return activities[Math.floor(Math.random() * activities.length)]
}

onMounted(async () => {
  setTimeout(() => { entering.value = false }, 480)
  await load()
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
.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--ink);
  font-family: var(--font-display);
  letter-spacing: -0.01em;
}
.page-sub { margin: 4px 0 0; color: var(--ink-3); font-size: 12.5px; }
.page-head__actions { display: inline-flex; gap: 8px; }

/* ============== TABS ============== */
.my-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 4px;
  padding: 4px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 10px;
  width: fit-content;
}
.my-tab {
  padding: 8px 16px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--ink-2);
  border-radius: 7px;
  transition: all var(--dur-fast) var(--ease);
  background: transparent;
  border: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-body);
}
.my-tab:hover { color: var(--ink); }
.my-tab.is-active {
  background: var(--surface);
  color: var(--ink);
  box-shadow: var(--shadow-sm);
}
.my-tab span {
  font-family: var(--font-mono);
  font-size: 10.5px;
  opacity: 0.7;
  margin-left: 4px;
  padding: 0 5px;
  border-radius: 4px;
  background: var(--surface-2);
  color: var(--ink-3);
}
.my-tab.is-active span {
  background: var(--accent-soft);
  color: var(--accent);
}

/* ============== GRID ============== */
.my-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 18px;
}

/* ============== MY EMP CARD ============== */
/* 与 EmployeeCard.vue 保持完全一致的 "Brand-Forward Mission Console" 配色语言
   - 全部使用系统令牌（--accent / --accent-2 / --ink-* / --surface / --line）
   - 头像 = 系统品牌渐变，与 Plaza 卡片同源
   - 顶部高亮线 = 品牌渐变（紫 → 品红）
   - 零自定义色，确保与系统主题 100% 协调 */
.my-emp-card {
  padding: 20px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  position: relative;
  overflow: hidden;
  transition:
    transform var(--dur-fast) var(--ease),
    border-color var(--dur-fast) var(--ease),
    box-shadow var(--dur-fast) var(--ease);
}
/* 顶部品牌渐变高亮线 · 全宽，更"信号条"感 */
.my-emp-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--accent) 30%,
    var(--accent-2) 70%,
    transparent 100%);
  opacity: 0.7;
  pointer-events: none;
}
.my-emp-card:hover {
  transform: translateY(-1px);
  border-color: rgba(139, 92, 246, 0.35);
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.32),
              0 0 0 1px rgba(139, 92, 246, 0.12);
}
.my-emp-card__head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
  position: relative;
}
.my-emp-card__title { flex: 1; min-width: 0; }
.my-emp-card__name {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -0.01em;
}
.my-emp-card__role {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-3);
  margin-top: 3px;
  letter-spacing: 0.02em;
}
.my-emp-card__body { position: relative; }
.my-emp-card__last {
  font-size: 12px;
  color: var(--ink-2);
  padding: 10px 12px;
  background: var(--surface-2);
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid var(--line);
  font-family: var(--font-mono);
  letter-spacing: 0.01em;
  transition: all var(--dur-fast) var(--ease);
}
.my-emp-card__last:hover {
  border-color: rgba(139, 92, 246, 0.3);
  background: rgba(139, 92, 246, 0.04);
}
.my-emp-card__last b {
  color: var(--ink);
  font-weight: 500;
  margin-right: 4px;
}
.my-emp-card__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 14px;
}
.my-emp-card__stat {
  padding: 10px;
  background: var(--surface-2);
  border-radius: 8px;
  text-align: center;
  border: 1px solid var(--line);
  transition: all var(--dur-fast) var(--ease);
}
.my-emp-card__stat:hover {
  border-color: rgba(139, 92, 246, 0.3);
  background: rgba(139, 92, 246, 0.04);
}
.my-emp-card__stat b {
  display: block;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: -0.01em;
}
.my-emp-card__stat span {
  font-size: 10.5px;
  color: var(--ink-3);
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
  margin-top: 2px;
  display: block;
}
.my-emp-card__actions {
  display: flex;
  gap: 8px;
}
.my-emp-card__actions .btn { flex: 1; justify-content: center; }
.my-emp-card__actions .btn.is-danger { flex: 0 0 auto; padding: 10px 12px; }
.my-emp-card__actions .btn.is-danger:hover {
  background: var(--color-danger-bg, rgba(248, 113, 113, 0.1));
  border-color: var(--danger);
  color: var(--danger);
}

/* ============== AVATAR（与 EmployeeCard 完全同源）============== */
.emp-card__avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
  position: relative;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  overflow: hidden;
  box-shadow:
    0 6px 20px -4px var(--accent-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}
.emp-card__avatar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 5px;
  right: 5px;
  height: 1.5px;
  background: rgba(255, 255, 255, 0.45);
  border-radius: 1px;
}
.emp-card__avatar::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle at 100% 100%, rgba(255, 255, 255, 0.1), transparent 60%);
  pointer-events: none;
}

/* ============== ENTER ANIMATION ============== */
.view-enter { animation: viewEnter 0.42s var(--ease) both; }
@keyframes viewEnter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (max-width: 720px) {
  .my-grid { grid-template-columns: 1fr; }
}
</style>
