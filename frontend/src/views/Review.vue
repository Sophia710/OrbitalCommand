<template>
  <div class="page page-review" :class="{ 'view-enter': entering }">
    <header class="page-head">
      <div>
        <h2 class="page-title">审核中心</h2>
        <p class="page-sub">对员工上架、知识库更新、变更进行合规审核 · {{ list.length }} 条待审</p>
      </div>
      <div class="page-head__actions">
        <button class="btn btn--ghost">策略配置</button>
        <button class="btn btn--primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          批量通过
        </button>
      </div>
    </header>

    <FilterBar
      v-model="filter"
      :filters="[
        { key: 'status', type: 'radio', options: [
          { value: '', label: '全部' },
          { value: 'pending', label: '待审核' },
          { value: 'approved', label: '已通过' },
          { value: 'rejected', label: '已驳回' },
        ]},
      ]"
      :search="true"
      :search-placeholder="'搜索员工名、提交人…'"
      @change="load"
    />

    <div v-loading="loading" class="review-list">
      <article
        v-for="r in list"
        :key="r.id"
        class="review-card"
        :class="`is-${r.status}`"
      >
        <div class="review-card__head">
          <div class="review-card__avatar">{{ r.employeeName?.slice(0, 1) || '?' }}</div>
          <div class="review-card__title">
            <div class="review-card__name">{{ r.employeeName }}</div>
            <div class="review-card__sub">提交人：{{ r.submitter }} · {{ r.domain }} · {{ r.submittedAt }}</div>
          </div>
          <span class="chip" :class="priorityCls(r.priority)">{{ r.priority }} · {{ priorityLabel(r.priority) }}</span>
          <span class="chip status-chip" :class="`is-${r.status}`">
            <i class="dot"></i>
            {{ statusLabel(r.status) }}
          </span>
        </div>
        <div class="review-card__body">{{ r.description }}</div>
        <div class="review-card__actions">
          <button v-if="r.status === 'pending'" class="btn btn--primary" @click="onApprove(r)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            通过并上架
          </button>
          <button v-if="r.status === 'pending'" class="btn btn--ghost" @click="onReject(r)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            驳回
          </button>
          <button class="btn btn--ghost" @click="onDetail(r)">查看详情</button>
        </div>
      </article>
    </div>

    <EmptyState v-if="!loading && !list.length" title="没有匹配的审核项" desc="调整筛选条件或等待新提交" />
  </div>
</template>

<script setup>
defineOptions({ name: 'Review' })
import { ref, onMounted } from 'vue'
import { listReviews as getReviews, approveReview, rejectReview } from '@/api/tasks-files'
import FilterBar from '@/components/FilterBar.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
const entering = ref(true)
const filter = ref({ status: '', q: '', pageNo: 1, pageSize: 20 })
const list = ref([])
const loading = ref(false)

function statusLabel(s) {
  return { pending: '待审核', approved: '已通过', rejected: '已驳回' }[s] || s
}
function priorityLabel(p) {
  return { P1: '紧急', P2: '高优', P3: '普通' }[p] || '普通'
}
function priorityCls(p) {
  return `is-priority-${p}`
}

async function load() {
  loading.value = true
  try {
    const data = await getReviews({
      status: filter.value.status,
      q: filter.value.q,
      pageNo: filter.value.pageNo,
      pageSize: filter.value.pageSize,
    })
    list.value = data.list
  } finally {
    loading.value = false
  }
}

async function onApprove(r) {
  await approveReview(r.id)
  toast.success(`已通过：${r.employeeName}`)
  await load()
}
async function onReject(r) {
  await rejectReview(r.id)
  toast.info(`已驳回：${r.employeeName}`)
  await load()
}
function onDetail(r) {
  toast.info(`查看详情：${r.employeeName}`)
}

onMounted(() => {
  setTimeout(() => { entering.value = false }, 480)
  load()
})
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: var(--sp-4); }
.page-head {
  display: flex; align-items: flex-end; justify-content: space-between; gap: var(--sp-3);
  flex-wrap: wrap;
}
.page-title { margin: 0; font-size: 20px; font-weight: 600; color: var(--ink); font-family: var(--font-display); }
.page-sub { margin: 4px 0 0; color: var(--ink-3); font-size: 12.5px; }
.page-head__actions { display: inline-flex; gap: 8px; }

/* ============== REVIEW LIST ============== */
.review-list { display: flex; flex-direction: column; gap: 12px; }
.review-card {
  padding: 18px 20px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-blur);
  display: flex; flex-direction: column; gap: 14px;
  transition: all var(--dur-fast) var(--ease);
}
.review-card:hover { border-color: var(--line-2); }
.review-card.is-rejected { opacity: 0.75; }
.review-card.is-approved { border-color: rgba(74, 222, 128, 0.18); }

.review-card__head {
  display: flex; align-items: center; gap: 12px;
  flex-wrap: wrap;
}
.review-card__avatar {
  width: 40px; height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px var(--accent-glow);
}
.review-card__title { flex: 1; min-width: 0; }
.review-card__name { font-size: 14px; font-weight: 600; color: var(--ink); }
.review-card__sub  { font-size: 11.5px; color: var(--ink-3); margin-top: 2px; font-family: var(--font-mono); }

.review-card__body {
  font-size: 13px;
  color: var(--ink-2);
  line-height: 1.6;
  padding: 10px 14px;
  background: var(--surface-2);
  border-radius: 8px;
  border: 1px solid var(--line);
}
.review-card__actions { display: flex; gap: 8px; flex-wrap: wrap; }

/* ============== CHIPS ============== */
.chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  font-family: var(--font-mono);
  background: var(--surface-2);
  color: var(--ink-2);
  border: 1px solid var(--line);
  letter-spacing: 0.02em;
}
.chip.is-priority-P1 { background: rgba(248, 113, 113, 0.12); color: var(--danger); border-color: rgba(248, 113, 113, 0.3); }
.chip.is-priority-P2 { background: rgba(251, 191, 36, 0.12); color: #fbbf24;     border-color: rgba(251, 191, 36, 0.3); }
.chip.is-priority-P3 { background: var(--surface-2); color: var(--ink-3); }

.status-chip .dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; box-shadow: 0 0 4px currentColor; }
.status-chip.is-pending  { background: rgba(251, 191, 36, 0.12); color: #fbbf24;     border-color: rgba(251, 191, 36, 0.3); }
.status-chip.is-approved { background: rgba(74, 222, 128, 0.12); color: var(--ok);   border-color: rgba(74, 222, 128, 0.3); }
.status-chip.is-rejected { background: rgba(248, 113, 113, 0.12); color: var(--danger); border-color: rgba(248, 113, 113, 0.3); }

.view-enter { animation: viewEnter 0.42s var(--ease) both; }
@keyframes viewEnter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
