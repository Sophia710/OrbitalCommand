<template>
  <div class="page page-files" :class="{ 'view-enter': entering }">
    <header class="page-head">
      <div>
        <h2 class="page-title">文件中心</h2>
        <p class="page-sub">统一管理所有上传的文档、报告与导出物 · 与知识库联动</p>
      </div>
      <div class="page-head__actions">
        <input ref="fileInput" type="file" multiple style="display:none" @change="onPickFile"/>
        <button class="btn btn--primary" @click="fileInput?.click()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          上传文件
        </button>
      </div>
    </header>

    <div class="files-toolbar">
      <div class="files-tabs">
        <button
          v-for="t in tabs"
          :key="t.value"
          :class="{ 'is-active': activeType === t.value }"
          @click="activeType = t.value"
        >
          {{ t.label }}<span v-if="t.count !== undefined" class="files-tabs__count">{{ t.count }}</span>
        </button>
      </div>
      <div class="files-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <input v-model="q" placeholder="搜索文件名、标签…" />
      </div>
    </div>

    <div class="files-layout">
      <!-- 左侧分类 / 标签 -->
      <aside class="files-tree">
        <h6>分类</h6>
        <ul>
          <li
            v-for="c in categories"
            :key="c.name"
            :class="{ 'is-active': activeCategory === c.key }"
            @click="activeCategory = c.key"
          >
            <span>{{ c.icon }}</span>
            {{ c.name }}
            <span>{{ c.count }}</span>
          </li>
        </ul>
        <h6>标签</h6>
        <ul>
          <li v-for="tag in tags" :key="tag">
            <span class="hash">#</span>
            {{ tag }}
            <span>{{ tagCount(tag) }}</span>
          </li>
        </ul>
      </aside>

      <!-- 右侧文件网格 -->
      <div class="files-grid" v-loading="loading">
        <article
          v-for="f in filteredFiles"
          :key="f.id"
          class="file-card"
          @click="onPreview(f)"
        >
          <div class="file-card__icon" :style="{ '--c': colorOf(f.type) }">
            {{ f.type.slice(0, 1) }}
          </div>
          <div class="file-card__name" :title="f.name">{{ f.name }}</div>
          <div class="file-card__meta">
            <span>{{ f.type }} · {{ f.size }}</span>
            <span>{{ f.time }}</span>
          </div>
        </article>
      </div>
    </div>

    <EmptyState
      v-if="!loading && !filteredFiles.length"
      title="没有匹配的文件"
      desc="尝试调整筛选条件或重置搜索"
    />
  </div>
</template>

<script setup>
defineOptions({ name: 'Files' })
import { ref, computed, onMounted } from 'vue'
import { getFileTree, getKb, uploadFile } from '@/api/tasks-files'
import EmptyState from '@/components/EmptyState.vue'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
const entering = ref(true)
const fileInput = ref(null)
const tree = ref([])
const kb = ref([])
const files = ref([])
const q = ref('')
const activeType = ref('ALL')
const activeCategory = ref('all')

const tabs = computed(() => {
  const all = files.value.length
  return [
    { value: 'ALL',   label: '全部', count: all },
    { value: 'PDF',   label: 'PDF' },
    { value: 'DOCX',  label: 'DOCX' },
    { value: 'XLSX',  label: 'XLSX' },
    { value: 'IMG',   label: '图片' },
    { value: 'OTHER', label: '其他' },
  ]
})

const categories = [
  { key: 'all',   name: '全部文件', icon: '📁', count: 0 },
  { key: 'op',    name: '运营报告', icon: '📄', count: 36 },
  { key: 'std',   name: '标准规范', icon: '📚', count: 42 },
  { key: 'case',  name: '故障案例', icon: '🛠️', count: 28 },
  { key: 'train', name: '培训材料', icon: '🎓', count: 14 },
  { key: 'other', name: '其他',    icon: '📦', count: 8 },
]
const tags = ['链路', '信关站', '终端']

function tagCount(t) { return Math.floor(Math.random() * 24) + 6 }

function colorOf(t) {
  return {
    PDF:  'rgba(248, 113, 113, 0.18)',
    DOCX: 'rgba(96, 165, 250, 0.18)',
    XLSX: 'rgba(74, 222, 128, 0.18)',
    IMG:  'rgba(251, 191, 36, 0.18)',
  }[t] || 'rgba(139, 92, 246, 0.18)'
}

const filteredFiles = computed(() => {
  let list = files.value
  if (activeType.value !== 'ALL') list = list.filter((f) => f.type === activeType.value)
  if (q.value) {
    const k = q.value.toLowerCase()
    list = list.filter((f) => f.name.toLowerCase().includes(k) || f.type.toLowerCase().includes(k))
  }
  return list
})

async function load() {
  try {
    tree.value = await getFileTree()
    kb.value = await getKb()
  } catch {}
  // Mock files for the grid
  files.value = [
    { id: 1, name: '链路健康度月报-2025-05.pdf',  type: 'PDF',  size: '2.4 MB', time: '06-12 14:22' },
    { id: 2, name: '信关站GW-03运行周报.docx',     type: 'DOCX', size: '486 KB', time: '06-11 09:08' },
    { id: 3, name: '波束利用率统计-2025Q2.xlsx',   type: 'XLSX', size: '128 KB', time: '06-10 17:36' },
    { id: 4, name: '终端-12号机遥感截图.png',      type: 'IMG',  size: '5.2 MB', time: '06-10 12:15' },
    { id: 5, name: '信关站链路规范v3.2.pdf',       type: 'PDF',  size: '1.8 MB', time: '06-09 16:44' },
    { id: 6, name: '故障案例-链路闪断-2025.xlsx',  type: 'XLSX', size: '92 KB',  time: '06-08 11:30' },
    { id: 7, name: '培训材料-链路巡检.pptx',       type: 'OTHER',size: '8.6 MB', time: '06-07 10:00' },
    { id: 8, name: '巡检报告-2025-06-12.pdf',      type: 'PDF',  size: '1.2 MB', time: '06-12 18:00' },
  ]
}

function onPreview(f) {
  toast.info(`预览：${f.name}`)
}

function onPickFile(e) {
  const picked = e.target.files
  if (!picked?.length) return
  Array.from(picked).forEach(async (f) => {
    if (f.size > 50 * 1024 * 1024) {
      toast.error(`${f.name} 超过 50MB`)
      return
    }
    try {
      await uploadFile({ name: f.name, size: f.size, type: f.type })
      files.value.unshift({
        id: Date.now() + Math.random(),
        name: f.name,
        type: f.name.split('.').pop().toUpperCase(),
        size: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
        time: '刚刚',
      })
      toast.success(`已上传：${f.name}`)
    } catch (e) {
      toast.error(`上传失败：${f.name}`)
    }
  })
  e.target.value = ''
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

/* ============== TOOLBAR ============== */
.files-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap;
}
.files-tabs {
  display: flex; gap: 4px; padding: 4px;
  background: var(--surface); border: 1px solid var(--line);
  border-radius: 10px;
}
.files-tabs button {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-2);
  background: transparent;
  border: 0;
  border-radius: 7px;
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
  font-family: var(--font-body);
}
.files-tabs button:hover { color: var(--ink); }
.files-tabs button.is-active {
  background: var(--accent-soft);
  color: var(--accent);
}
.files-tabs__count {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--ink-3);
}
.files-tabs button.is-active .files-tabs__count { color: var(--accent); }

.files-search {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 14px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 10px;
  min-width: 260px;
  flex: 1;
  max-width: 360px;
}
.files-search svg { width: 14px; height: 14px; color: var(--ink-3); flex-shrink: 0; }
.files-search input {
  flex: 1;
  background: transparent;
  border: 0; outline: 0;
  font-size: 12.5px;
  color: var(--ink);
  font-family: var(--font-body);
}

/* ============== LAYOUT ============== */
.files-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 16px;
  align-items: start;
}

/* ============== TREE / SIDEBAR ============== */
.files-tree {
  padding: 14px 16px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-blur);
}
.files-tree h6 {
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-3);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0 0 8px;
  font-family: var(--font-mono);
}
.files-tree h6 + ul { margin-bottom: 18px; }
.files-tree ul {
  display: flex; flex-direction: column; gap: 2px;
  list-style: none; padding: 0; margin: 0 0 18px;
}
.files-tree li {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12.5px;
  color: var(--ink-2);
  transition: all var(--dur-fast) var(--ease);
  user-select: none;
}
.files-tree li:hover { background: var(--surface-2); color: var(--ink); }
.files-tree li.is-active {
  background: var(--accent-soft);
  color: var(--accent);
}
.files-tree li span:last-child {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--ink-3);
}
.files-tree .hash {
  color: var(--accent);
  font-weight: 600;
}

/* ============== GRID ============== */
.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
  min-height: 200px;
}
.file-card {
  padding: 18px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  transition: all var(--dur-fast) var(--ease);
  cursor: pointer;
  backdrop-filter: var(--glass-blur);
}
.file-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
}
.file-card__icon {
  width: 44px; height: 44px;
  border-radius: 8px;
  background: var(--c, var(--accent-soft));
  color: var(--c, var(--accent));
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  font-weight: 600;
  font-family: var(--font-mono);
  margin-bottom: 12px;
}
.file-card__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-card__meta {
  font-size: 11px;
  color: var(--ink-3);
  font-family: var(--font-mono);
  display: flex;
  justify-content: space-between;
  gap: 6px;
}

.view-enter { animation: viewEnter 0.42s var(--ease) both; }
@keyframes viewEnter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (max-width: 960px) {
  .files-layout { grid-template-columns: 1fr; }
  .files-search { max-width: none; }
  .files-tabs { overflow-x: auto; }
}
</style>
