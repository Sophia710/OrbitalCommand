<template>
  <div class="page page-audit" :class="{ 'view-enter': entering }">
    <header class="page-head">
      <div>
        <h2 class="page-title">审计日志</h2>
        <p class="page-sub">所有用户与系统操作的完整审计轨迹 · 共 {{ total }} 条</p>
      </div>
      <div class="page-head__actions">
        <div class="audit-range">
          <button v-for="r in ranges" :key="r.value" class="audit-range__btn" :class="{ 'is-active': range === r.value }" @click="range = r.value">
            {{ r.label }}
          </button>
        </div>
        <button class="btn btn--ghost">导出</button>
      </div>
    </header>

    <FilterBar
      v-model="filter"
      :filters="[
        { key: 'action', type: 'select', placeholder: '全部动作', options: [
          { value: '', label: '全部动作' },
          { value: 'CONFIG',  label: 'CONFIG' },
          { value: 'CREATE',  label: 'CREATE' },
          { value: 'EXECUTE', label: 'EXECUTE' },
          { value: 'APPROVE', label: 'APPROVE' },
          { value: 'REJECT',  label: 'REJECT' },
          { value: 'UPDATE',  label: 'UPDATE' },
          { value: 'DELETE',  label: 'DELETE' },
          { value: 'LOGIN',   label: 'LOGIN' },
        ]},
      ]"
      :search="true"
      :search-placeholder="'搜索目标对象、IP 或用户…'"
      @change="load"
    />

    <div v-loading="loading" class="panel">
      <div class="panel__head">
        <div>
          <h3 class="panel__title">审计记录</h3>
          <p class="panel__sub">共 {{ list.length }} / {{ total }} 条记录</p>
        </div>
      </div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>时间戳</th>
              <th>用户</th>
              <th>操作</th>
              <th>目标对象</th>
              <th>源 IP</th>
              <th>结果</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in list" :key="row.id">
              <td class="data-table__mono">{{ row.ts }}</td>
              <td>{{ row.user }}</td>
              <td><span class="chip" :class="actionCls(row.action)">{{ row.action }}</span></td>
              <td class="data-table__ellipsis" :title="row.resource">{{ row.resource }}</td>
              <td class="data-table__mono">{{ row.ip }}</td>
              <td>
                <span class="chip status-chip" :class="row.result === 'success' ? 'is-ok' : 'is-fail'">
                  <i class="dot"></i>
                  {{ row.result === 'success' ? '成功' : '失败' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <EmptyState v-if="!loading && !list.length" title="没有匹配的审计记录" desc="调整筛选条件或时间范围" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'Audit' })
import { ref, onMounted, watch } from 'vue'
import { listAudits as getAudits } from '@/api/tasks-files'
import FilterBar from '@/components/FilterBar.vue'
import EmptyState from '@/components/EmptyState.vue'

const entering = ref(true)
const ranges = [
  { value: 'today', label: '今日' },
  { value: '7d',    label: '近 7 天' },
  { value: '30d',   label: '近 30 天' },
  { value: 'all',   label: '全部' },
]
const range = ref('today')
const filter = ref({ action: '', q: '', pageNo: 1, pageSize: 30 })
const list = ref([])
const total = ref(0)
const loading = ref(false)

function actionCls(a) {
  return {
    CONFIG:  'is-muted',
    CREATE:  'is-ok',
    EXECUTE: 'is-info',
    APPROVE: 'is-ok',
    REJECT:  'is-fail',
    UPDATE:  'is-warn',
    DELETE:  'is-fail',
    LOGIN:   'is-info',
  }[a] || 'is-muted'
}

async function load() {
  loading.value = true
  try {
    const data = await getAudits({ range: range.value, ...filter.value, pageNo: filter.value.pageNo, pageSize: filter.value.pageSize })
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  setTimeout(() => { entering.value = false }, 480)
  load()
})
watch(range, load)
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: var(--sp-4); }
.page-head {
  display: flex; align-items: flex-end; justify-content: space-between; gap: var(--sp-3);
  flex-wrap: wrap;
}
.page-title { margin: 0; font-size: 20px; font-weight: 600; color: var(--ink); font-family: var(--font-display); }
.page-sub { margin: 4px 0 0; color: var(--ink-3); font-size: 12.5px; }
.page-head__actions { display: inline-flex; gap: 10px; align-items: center; }

/* ============== RANGE TABS ============== */
.audit-range {
  display: flex;
  padding: 4px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 10px;
  gap: 2px;
}
.audit-range__btn {
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-2);
  background: transparent;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
  font-family: var(--font-body);
}
.audit-range__btn:hover { color: var(--ink); }
.audit-range__btn.is-active {
  background: var(--surface);
  color: var(--ink);
  box-shadow: var(--shadow-sm);
}

/* ============== PANEL ============== */
.panel {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  backdrop-filter: var(--glass-blur);
}
.panel__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--line);
}
.panel__title { margin: 0; font-size: 14px; font-weight: 600; color: var(--ink); font-family: var(--font-display); }
.panel__sub   { margin: 2px 0 0; font-size: 12px; color: var(--ink-3); }

/* ============== DATA TABLE ============== */
.data-table-wrap { overflow-x: auto; }
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}
.data-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ink-3);
  background: var(--surface-2);
  border-bottom: 1px solid var(--line);
  font-family: var(--font-mono);
}
.data-table td {
  padding: 12px 16px;
  color: var(--ink-2);
  border-bottom: 1px solid var(--line);
  vertical-align: middle;
}
.data-table tr:last-child td { border-bottom: 0; }
.data-table tr:hover td { background: var(--surface-2); }
.data-table__mono {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--ink-3);
  white-space: nowrap;
}
.data-table__ellipsis {
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ============== CHIPS ============== */
.chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 500;
  font-family: var(--font-mono);
  background: var(--surface-2);
  color: var(--ink-2);
  border: 1px solid var(--line);
  letter-spacing: 0.02em;
}
.chip.is-muted { background: var(--surface-2); color: var(--ink-3); }
.chip.is-ok    { background: rgba(74, 222, 128, 0.12); color: var(--ok); border-color: rgba(74, 222, 128, 0.3); }
.chip.is-info  { background: rgba(139, 92, 246, 0.12); color: var(--accent); border-color: rgba(139, 92, 246, 0.3); }
.chip.is-warn  { background: rgba(251, 191, 36, 0.12); color: #fbbf24; border-color: rgba(251, 191, 36, 0.3); }
.chip.is-fail  { background: rgba(248, 113, 113, 0.12); color: var(--danger); border-color: rgba(248, 113, 113, 0.3); }

.status-chip .dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; box-shadow: 0 0 4px currentColor; }

.view-enter { animation: viewEnter 0.42s var(--ease) both; }
@keyframes viewEnter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
