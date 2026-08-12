<template>
  <div class="dc-panel">
    <!-- 顶部栏 -->
    <div class="dc-panel__head">
      <button type="button" class="dc-panel__back" @click="$emit('close')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        返回
      </button>
      <div class="dc-panel__title">
        <svg class="dc-panel__title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="2" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="22" y2="12" />
        </svg>
        领域专业化配置
      </div>
    </div>

    <div class="dc-panel__body">
      <!-- 统计卡片 -->
      <div class="dc-panel__stats">
        <div class="dc-stat">
          <div class="dc-stat__value">13</div>
          <div class="dc-stat__label">重点领域</div>
        </div>
        <div class="dc-stat">
          <div class="dc-stat__value">232</div>
          <div class="dc-stat__label">激活关键词</div>
        </div>
        <div class="dc-stat">
          <div class="dc-stat__value">1</div>
          <div class="dc-stat__label">启用规则</div>
        </div>
        <div class="dc-stat dc-stat--green">
          <div class="dc-stat__value">94.4%</div>
          <div class="dc-stat__label">识别准确率 <span class="dc-stat__target">≥90%</span></div>
        </div>
        <div class="dc-stat dc-stat--green">
          <div class="dc-stat__value">100.0%</div>
          <div class="dc-stat__label">领域精确率 <span class="dc-stat__target">≥85%</span></div>
        </div>
      </div>

      <!-- Tab 导航 -->
      <div class="dc-panel__tabs">
        <button
          v-for="t in tabs"
          :key="t.key"
          class="dc-tab"
          :class="{ 'is-active': activeTab === t.key }"
          @click="activeTab = t.key"
        >{{ t.label }}</button>
      </div>

      <!-- ======== 关键词库 ======== -->
      <template v-if="activeTab === 'keywords'">
        <div class="dc-keywords">
          <!-- 左侧：领域分类树 -->
          <div class="dc-keywords__tree">
            <div class="dc-keywords__tree-title">领域分类</div>
            <button
              v-for="c in domainTree"
              :key="c.key"
              class="dc-tree-node"
              :class="{ 'is-active': selectedDomain === c.key }"
              @click="selectedDomain = c.key"
            >
              <span class="dc-tree-node__name">{{ c.name }}</span>
              <span class="dc-tree-node__count">{{ c.count }}</span>
            </button>
            <button class="dc-tree-btn">重置种子</button>
          </div>
          <!-- 右侧：关键词表格 -->
          <div class="dc-keywords__main">
            <!-- 工具栏 -->
            <div class="dc-kw-toolbar">
              <div class="dc-kw-toolbar__search">
                <svg class="dc-kw-toolbar__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input v-model.trim="kwSearch" class="dc-kw-toolbar__input" placeholder="搜索关键词..." />
              </div>
              <select v-model="kwStatusFilter" class="dc-kw-toolbar__select">
                <option value="">状态</option>
                <option value="启用">启用</option>
                <option value="停用">停用</option>
              </select>
              <button type="button" class="dc-kw-toolbar__btn dc-kw-toolbar__btn--primary" @click="onAddKeyword">新增关键词</button>
              <button type="button" class="dc-kw-toolbar__btn" @click="onPublish">发布版本</button>
              <button type="button" class="dc-kw-toolbar__btn" @click="onVersionHistory">版本历史</button>
            </div>
            <!-- 表格 -->
            <div class="dc-kw-table-wrap">
              <table class="dc-kw-table">
                <thead>
                  <tr>
                    <th class="dc-kw-col-kw">关键词</th>
                    <th class="dc-kw-col-cat">分类</th>
                    <th class="dc-kw-col-pol">极性</th>
                    <th class="dc-kw-col-wt">权重</th>
                    <th class="dc-kw-col-scope">匹配范围</th>
                    <th class="dc-kw-col-status">状态</th>
                    <th class="dc-kw-col-op">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="k in filteredKeywords" :key="k.id">
                    <td class="dc-kw-col-kw"><span class="dc-kw-highlight">{{ k.word }}</span></td>
                    <td class="dc-kw-col-cat">{{ k.category }}</td>
                    <td class="dc-kw-col-pol">
                      <span class="dc-kw-tag" :class="k.polarity === '包含' ? 'dc-kw-tag--inc' : 'dc-kw-tag--exc'">{{ k.polarity }}</span>
                    </td>
                    <td class="dc-kw-col-wt">{{ k.weight }}</td>
                    <td class="dc-kw-col-scope">{{ k.scope }}</td>
                    <td class="dc-kw-col-status">
                      <span class="dc-kw-dot" :class="k.status === '启用' ? 'dc-kw-dot--on' : 'dc-kw-dot--off'"></span>
                      {{ k.status }}
                    </td>
                    <td class="dc-kw-col-op">
                      <button type="button" class="dc-kw-op" @click="onEditKw(k)">编辑</button>
                      <button type="button" class="dc-kw-op dc-kw-op--warn" @click="onToggleKw(k)">{{ k.status === '启用' ? '停用' : '启用' }}</button>
                      <button type="button" class="dc-kw-op dc-kw-op--danger" @click="onDeleteKw(k)">删除</button>
                    </td>
                  </tr>
                  <tr v-if="!filteredKeywords.length">
                    <td colspan="7" class="dc-kw-empty">未找到匹配的关键词</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>

      <!-- ======== 筛选规则 ======== -->
      <template v-if="activeTab === 'rules'">
        <div class="dc-rules">
          <!-- 工具栏 -->
          <div class="dc-kw-toolbar">
            <button type="button" class="dc-kw-toolbar__btn dc-kw-toolbar__btn--primary" @click="onAddRule">新增规则</button>
            <span class="dc-rules__hint">配置关键词匹配的复合规则（AND / OR 逻辑组合）</span>
          </div>
          <!-- 规则列表 -->
          <div class="dc-rules__list">
            <div class="dc-rule-card" v-for="r in rulesList" :key="r.id">
              <div class="dc-rule-card__head">
                <span class="dc-rule-card__name">{{ r.name }}</span>
                <span class="dc-rule-card__priority">优先级 {{ r.priority }}</span>
                <span class="dc-kw-dot" :class="r.enabled ? 'dc-kw-dot--on' : 'dc-kw-dot--off'"></span>
                <span>{{ r.enabled ? '启用' : '停用' }}</span>
              </div>
              <div class="dc-rule-card__expr">{{ r.expression }}</div>
              <div class="dc-rule-card__actions">
                <button type="button" class="dc-kw-op" @click="onEditRule(r)">编辑</button>
                <button type="button" class="dc-kw-op dc-kw-op--warn" @click="onToggleRule(r)">{{ r.enabled ? '停用' : '启用' }}</button>
                <button type="button" class="dc-kw-op dc-kw-op--danger" @click="onDeleteRule(r)">删除</button>
              </div>
            </div>
            <div v-if="!rulesList.length" class="dc-rules__empty">暂无筛选规则</div>
          </div>
        </div>
      </template>

      <!-- ======== 语义模型 ======== -->
      <template v-if="activeTab === 'semantic'">
        <div class="dc-semantic">
          <div class="dc-kw-toolbar">
            <span class="dc-rules__hint">管理用于关键词语义扩展的 NLP 模型配置，配置后自动扩展同义词/近义词</span>
          </div>
          <div class="dc-semantic__list">
            <div class="dc-semantic-card" v-for="m in semanticModels" :key="m.id">
              <div class="dc-semantic-card__head">
                <div>
                  <span class="dc-semantic-card__name">{{ m.name }}</span>
                  <span class="dc-semantic-card__type">{{ m.type }}</span>
                </div>
                <span class="dc-kw-dot" :class="m.enabled ? 'dc-kw-dot--on' : 'dc-kw-dot--off'"></span>
              </div>
              <div class="dc-semantic-card__info">版本 {{ m.version }} · {{ m.desc }}</div>
              <div class="dc-semantic-card__actions">
                <button type="button" class="dc-kw-op" @click="onEditModel(m)">编辑</button>
                <button type="button" class="dc-kw-op dc-kw-op--warn" @click="onToggleModel(m)">{{ m.enabled ? '停用' : '启用' }}</button>
              </div>
            </div>
            <div v-if="!semanticModels.length" class="dc-rules__empty">暂无语义模型</div>
          </div>
        </div>
      </template>

      <!-- ======== 评估与反馈 ======== -->
      <template v-if="activeTab === 'eval'">
        <div class="dc-eval">
          <div class="dc-eval__metrics">
            <div class="dc-eval-metric">
              <div class="dc-eval-metric__value">94.4%</div>
              <div class="dc-eval-metric__label">识别准确率</div>
            </div>
            <div class="dc-eval-metric">
              <div class="dc-eval-metric__value">100.0%</div>
              <div class="dc-eval-metric__label">领域精确率</div>
            </div>
            <div class="dc-eval-metric">
              <div class="dc-eval-metric__value">—</div>
              <div class="dc-eval-metric__label">召回率</div>
            </div>
            <div class="dc-eval-metric">
              <div class="dc-eval-metric__value">0</div>
              <div class="dc-eval-metric__label">待修正案例</div>
            </div>
          </div>
          <div class="dc-kw-toolbar">
            <span class="dc-rules__hint">误识别案例列表，支持人工标注修正</span>
          </div>
          <div class="dc-eval__table-wrap">
            <table class="dc-kw-table">
              <thead>
                <tr>
                  <th>标讯标题</th>
                  <th>原识别领域</th>
                  <th>正确领域</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in evalCases" :key="c.id">
                  <td>{{ c.title }}</td>
                  <td><span class="dc-kw-tag dc-kw-tag--inc">{{ c.original }}</span></td>
                  <td><span class="dc-kw-tag dc-kw-tag--green">{{ c.correct || '—' }}</span></td>
                  <td>
                    <button type="button" class="dc-kw-op" @click="onCorrect(c)">修正</button>
                  </td>
                </tr>
                <tr v-if="!evalCases.length">
                  <td colspan="4" class="dc-kw-empty">暂无待修正案例</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToastStore } from '@/stores/toast'
import { ElMessageBox } from 'element-plus'

defineEmits(['close'])

const toast = useToastStore()
const activeTab = ref('keywords')
const selectedDomain = ref('aerospace')
const kwSearch = ref('')
const kwStatusFilter = ref('')

/* Tab 定义 */
const tabs = [
  { key: 'keywords', label: '关键词库' },
  { key: 'rules',    label: '筛选规则' },
  { key: 'semantic', label: '语义模型' },
  { key: 'eval',     label: '评估与反馈' },
]

/* 领域分类树 */
const domainTree = [
  { key: 'aerospace',    name: '空天信息',  count: 12 },
  { key: 'remote',       name: '遥感技术',  count: 13 },
  { key: 'ai',           name: '人工智能',  count: 80 },
  { key: 'emergency',    name: '应急管理',  count: 12 },
  { key: 'security',     name: '安防系统',  count: 15 },
  { key: 'ocean',        name: '海洋信息',  count: 10 },
  { key: 'forest',       name: '森林应急',  count: 24 },
  { key: 'aviation',     name: '航空经济',  count: 14 },
  { key: 'satellite_mfg',name: '卫星制造',  count: 23 },
  { key: 'satellite_dp', name: '卫星数据处理', count: 10 },
  { key: 'orbit',        name: '轨道管理',  count: 10 },
  { key: 'space',        name: '太空态势',  count: 9 },
  { key: 'other',        name: '其他领域',  count: 0 },
]

/* 关键词库数据 */
const ALL_KW = [
  { id: 1,  word: '空天信息',     category: '空天信息', polarity: '包含', weight: 2.0, scope: '全文', status: '启用' },
  { id: 2,  word: '空天一体化',   category: '空天信息', polarity: '包含', weight: 2.0, scope: '全文', status: '启用' },
  { id: 3,  word: '卫星通信',     category: '空天信息', polarity: '包含', weight: 1.5, scope: '全文', status: '启用' },
  { id: 4,  word: '卫星互联网',   category: '空天信息', polarity: '包含', weight: 1.8, scope: '全文', status: '启用' },
  { id: 5,  word: '北斗',         category: '空天信息', polarity: '包含', weight: 1.5, scope: '全文', status: '启用' },
  { id: 6,  word: '导航定位',     category: '空天信息', polarity: '包含', weight: 1.2, scope: '全文', status: '启用' },
  { id: 7,  word: '高分辨率卫星', category: '空天信息', polarity: '包含', weight: 1.8, scope: '全文', status: '启用' },
  { id: 8,  word: '地面站',       category: '空天信息', polarity: '包含', weight: 1.0, scope: '全文', status: '启用' },
  { id: 9,  word: '测运控',       category: '空天信息', polarity: '包含', weight: 1.5, scope: '全文', status: '启用' },
  { id: 10, word: '航天信息',     category: '空天信息', polarity: '包含', weight: 1.2, scope: '全文', status: '启用' },
  { id: 11, word: '招聘',         category: '空天信息', polarity: '排除', weight: 1.0, scope: '全文', status: '启用' },
  { id: 12, word: '论文',         category: '空天信息', polarity: '排除', weight: 1.0, scope: '全文', status: '启用' },
  /* 遥感技术 */
  { id: 13, word: '遥感影像',     category: '遥感技术', polarity: '包含', weight: 2.0, scope: '全文', status: '启用' },
  { id: 14, word: '卫星遥感',     category: '遥感技术', polarity: '包含', weight: 1.8, scope: '全文', status: '启用' },
  { id: 15, word: 'SAR',          category: '遥感技术', polarity: '包含', weight: 1.5, scope: '全文', status: '启用' },
  { id: 16, word: '光学遥感',     category: '遥感技术', polarity: '包含', weight: 1.5, scope: '全文', status: '启用' },
  { id: 17, word: '高光谱',       category: '遥感技术', polarity: '包含', weight: 1.5, scope: '全文', status: '启用' },
  { id: 18, word: '遥感AI训练数据', category: '遥感技术', polarity: '包含', weight: 1.2, scope: '全文', status: '启用' },
  { id: 19, word: '遥感测绘',     category: '遥感技术', polarity: '包含', weight: 1.0, scope: '全文', status: '启用' },
  { id: 20, word: '招聘',         category: '遥感技术', polarity: '排除', weight: 1.0, scope: '全文', status: '启用' },
  { id: 21, word: '论文',         category: '遥感技术', polarity: '排除', weight: 1.0, scope: '全文', status: '启用' },
  /* 人工智能 */
  { id: 22, word: '深度学习',     category: '人工智能', polarity: '包含', weight: 2.0, scope: '全文', status: '启用' },
  { id: 23, word: '自然语言处理', category: '人工智能', polarity: '包含', weight: 1.8, scope: '全文', status: '启用' },
  { id: 24, word: '计算机视觉',   category: '人工智能', polarity: '包含', weight: 1.5, scope: '全文', status: '启用' },
  { id: 25, word: '大语言模型',   category: '人工智能', polarity: '包含', weight: 1.8, scope: '全文', status: '启用' },
  { id: 26, word: '多模态',       category: '人工智能', polarity: '包含', weight: 1.5, scope: '全文', status: '启用' },
  { id: 27, word: '强化学习',     category: '人工智能', polarity: '包含', weight: 1.2, scope: '全文', status: '启用' },
  { id: 28, word: '智能体',       category: '人工智能', polarity: '包含', weight: 1.5, scope: '全文', status: '启用' },
  { id: 29, word: '边缘智算',     category: '人工智能', polarity: '包含', weight: 1.2, scope: '全文', status: '启用' },
  { id: 30, word: '知识图谱',     category: '人工智能', polarity: '包含', weight: 1.5, scope: '全文', status: '停用' },
]

const domainNameMap = Object.fromEntries(domainTree.map(d => [d.key, d.name]))

/* 根据领域筛选 + 搜索 + 状态筛选 */
const filteredKeywords = computed(() => {
  const domainName = domainNameMap[selectedDomain.value]
  return ALL_KW.filter(k => {
    if (k.category !== domainName) return false
    if (kwSearch.value && !k.word.includes(kwSearch.value)) return false
    if (kwStatusFilter.value && k.status !== kwStatusFilter.value) return false
    return true
  })
})

/* 筛选规则数据 */
const rulesList = ref([
  { id: 1, name: '遥感综合规则', priority: 1, enabled: true,  expression: '"遥感" AND ("卫星" OR "影像" OR "SAR") AND NOT "招聘"' },
  { id: 2, name: '空天信息规则', priority: 2, enabled: false, expression: '"空天" OR "航天" OR "卫星" AND NOT "论文"' },
])

/* 语义模型数据 */
const semanticModels = ref([
  { id: 1, name: '词向量扩展模型', type: 'Word2Vec', version: 'v2.1', enabled: true,  desc: '基于领域语料训练的 Word2Vec 模型，支持 500+ 同义词扩展' },
  { id: 2, name: '语义匹配模型',   type: 'BERT',     version: 'v1.0', enabled: false, desc: '基于 BERT 的语义相似度匹配，精确率 92%' },
])

/* 待修正案例数据 */
const evalCases = ref([
  { id: 1, title: '某省卫星遥感影像统筹采购项目', original: '遥感技术', correct: '遥感技术' },
  { id: 2, title: '智慧城市大数据平台升级改造',   original: '人工智能', correct: '智慧城市' },
])

/* CRUD 操作（模拟） */
function onAddKeyword() {
  ElMessageBox.prompt('请输入新关键词', '新增关键词', { inputPattern: /\S/, inputErrorMessage: '关键词不能为空' })
    .then(({ value }) => {
      toast.success(`关键词「${value}」已添加（模拟）`)
    })
    .catch(() => {})
}
function onPublish()      { toast.info('已发布新版本（模拟）') }
function onVersionHistory(){ toast.info('版本历史（模拟）') }
function onEditKw(k)      { toast.info(`编辑关键词「${k.word}」（模拟）`) }
function onToggleKw(k)    { toast.success(`关键词「${k.word}」已${k.status === '启用' ? '停用' : '启用'}（模拟）`) }
function onDeleteKw(k)    { ElMessageBox.confirm(`确认删除关键词「${k.word}」？`).then(() => toast.success(`已删除（模拟）`)).catch(() => {}) }
function onAddRule()      { toast.info('新增规则（模拟）') }
function onEditRule(r)    { toast.info(`编辑规则「${r.name}」（模拟）`) }
function onToggleRule(r)  { toast.success(`规则「${r.name}」已${r.enabled ? '停用' : '启用'}（模拟）`) }
function onDeleteRule(r)  { ElMessageBox.confirm(`确认删除规则「${r.name}」？`).then(() => toast.success(`已删除（模拟）`)).catch(() => {}) }
function onEditModel(m)   { toast.info(`编辑模型「${m.name}」（模拟）`) }
function onToggleModel(m) { toast.success(`模型「${m.name}」已${m.enabled ? '停用' : '启用'}（模拟）`) }
function onCorrect(c)     { ElMessageBox.prompt(`请输入「${c.title}」的正确领域`, '修正标注').then(() => toast.success('已修正（模拟）')).catch(() => {}) }
</script>

<style scoped>
.dc-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ---------- 顶部栏 ---------- */
.dc-panel__head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--line, rgba(148, 163, 184, 0.12));
  flex-shrink: 0;
}
.dc-panel__back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12.5px;
  padding: 4px 10px;
  border: 1px solid var(--line, rgba(148, 163, 184, 0.2));
  border-radius: 6px;
  background: var(--surface, #0f172a);
  color: var(--ink, #e2e8f0);
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  white-space: nowrap;
}
.dc-panel__back svg { width: 14px; height: 14px; }
.dc-panel__back:hover { border-color: var(--accent, #8b5cf6); color: var(--accent, #a78bfa); }
.dc-panel__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink, #e2e8f0);
}
.dc-panel__title-icon { width: 18px; height: 18px; color: var(--ink-2, #cbd5e1); }

/* ---------- 主体 ---------- */
.dc-panel__body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 20px;
}
.dc-panel__body::-webkit-scrollbar { width: 5px; }
.dc-panel__body::-webkit-scrollbar-thumb { background: var(--line, rgba(148, 163, 184, 0.2)); border-radius: 999px; }

/* ---------- 统计卡片 ---------- */
.dc-panel__stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.dc-stat {
  background: var(--surface-2, rgba(30, 41, 59, 0.6));
  border: 1px solid var(--line, rgba(148, 163, 184, 0.12));
  border-radius: 8px;
  padding: 14px;
  text-align: center;
}
.dc-stat__value {
  font-size: 24px;
  font-weight: 700;
  color: var(--ink, #e2e8f0);
  line-height: 1.2;
}
.dc-stat__label {
  font-size: 12px;
  color: var(--ink-3, #94a3b8);
  margin-top: 4px;
}
.dc-stat__target {
  color: #34d399;
  font-weight: 500;
}
.dc-stat--green {
  border-color: rgba(16, 185, 129, 0.25);
  background: rgba(16, 185, 129, 0.06);
}
.dc-stat--green .dc-stat__value { color: #34d399; }

/* ---------- Tab 导航 ---------- */
.dc-panel__tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--line, rgba(148, 163, 184, 0.12));
  margin-bottom: 16px;
}
.dc-tab {
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-3, #94a3b8);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.15s, border-color 0.15s;
  margin-bottom: -1px;
}
.dc-tab:hover { color: var(--ink-2, #cbd5e1); }
.dc-tab.is-active {
  color: var(--accent, #8b5cf6);
  border-bottom-color: var(--accent, #8b5cf6);
}

/* ======== 关键词库 ======== */
.dc-keywords {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 16px;
}

/* 领域树 */
.dc-keywords__tree {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dc-keywords__tree-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-3, #94a3b8);
  padding: 0 0 8px 0;
  letter-spacing: 0.03em;
}
.dc-tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  font-size: 12.5px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--ink-2, #cbd5e1);
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  text-align: left;
}
.dc-tree-node:hover { background: rgba(139, 92, 246, 0.06); }
.dc-tree-node.is-active {
  background: rgba(139, 92, 246, 0.12);
  color: var(--accent, #a78bfa);
  font-weight: 500;
}
.dc-tree-node__count {
  font-size: 11px;
  color: var(--ink-3, #94a3b8);
  font-family: var(--font-mono, monospace);
}
.dc-tree-node.is-active .dc-tree-node__count { color: var(--accent, #8b5cf6); }
.dc-tree-btn {
  margin-top: 8px;
  padding: 5px 10px;
  font-size: 11.5px;
  border: 1px solid var(--line, rgba(148, 163, 184, 0.2));
  border-radius: 6px;
  background: var(--surface, #0f172a);
  color: var(--ink-2, #cbd5e1);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.dc-tree-btn:hover { border-color: var(--accent, #8b5cf6); color: var(--accent, #a78bfa); }

/* 关键词工具栏 */
.dc-keywords__main { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.dc-kw-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.dc-kw-toolbar__search {
  position: relative;
  flex: 1;
  min-width: 160px;
}
.dc-kw-toolbar__search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  color: var(--ink-3, #94a3b8);
  pointer-events: none;
}
.dc-kw-toolbar__input {
  width: 100%;
  padding: 6px 12px 6px 32px;
  font-size: 12.5px;
  border: 1px solid var(--line, rgba(148, 163, 184, 0.2));
  border-radius: 6px;
  background: var(--surface, #0f172a);
  color: var(--ink, #e2e8f0);
  font-family: inherit;
  outline: 0;
  transition: border-color 0.15s;
}
.dc-kw-toolbar__input::placeholder { color: var(--ink-3, #94a3b8); }
.dc-kw-toolbar__input:focus { border-color: var(--accent, #8b5cf6); box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12); }

.dc-kw-toolbar__select {
  padding: 6px 10px;
  font-size: 12.5px;
  border: 1px solid var(--line, rgba(148, 163, 184, 0.2));
  border-radius: 6px;
  background: var(--surface, #0f172a);
  color: var(--ink, #e2e8f0);
  font-family: inherit;
  outline: 0;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 26px;
}
.dc-kw-toolbar__select:focus { border-color: var(--accent, #8b5cf6); }
.dc-kw-toolbar__select option { background: #1e293b; color: #e2e8f0; }

.dc-kw-toolbar__btn {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid var(--line, rgba(148, 163, 184, 0.2));
  border-radius: 6px;
  background: var(--surface, #0f172a);
  color: var(--ink-2, #cbd5e1);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  white-space: nowrap;
}
.dc-kw-toolbar__btn:hover { border-color: var(--accent, #8b5cf6); color: var(--accent, #a78bfa); }
.dc-kw-toolbar__btn--primary {
  background: var(--accent, #8b5cf6);
  border-color: var(--accent, #8b5cf6);
  color: #fff;
}
.dc-kw-toolbar__btn--primary:hover { filter: brightness(1.1); color: #fff; }

/* 关键词表格 */
.dc-kw-table-wrap {
  border: 1px solid var(--line, rgba(148, 163, 184, 0.12));
  border-radius: 8px;
  overflow: hidden;
}
.dc-kw-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}
.dc-kw-table thead { position: sticky; top: 0; z-index: 1; }
.dc-kw-table thead th {
  text-align: left;
  padding: 9px 12px;
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-3, #94a3b8);
  background: var(--surface-2, rgba(30, 41, 59, 0.95));
  border-bottom: 1px solid var(--line, rgba(148, 163, 184, 0.12));
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.dc-kw-table tbody td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--line, rgba(148, 163, 184, 0.08));
  color: var(--ink-2, #cbd5e1);
  vertical-align: middle;
}
.dc-kw-table tbody tr:last-child td { border-bottom: none; }
.dc-kw-table tbody tr:hover td { background: rgba(139, 92, 246, 0.04); }

.dc-kw-col-kw    { min-width: 120px; }
.dc-kw-col-cat   { width: 80px; }
.dc-kw-col-pol   { width: 60px; }
.dc-kw-col-wt    { width: 50px; font-family: var(--font-mono, monospace); }
.dc-kw-col-scope { width: 60px; }
.dc-kw-col-status{ width: 60px; }
.dc-kw-col-op    { width: 130px; }

.dc-kw-highlight {
  color: var(--ink, #e2e8f0);
  font-weight: 500;
}
.dc-kw-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}
.dc-kw-tag--inc  { background: rgba(16, 185, 129, 0.1); color: #34d399; }
.dc-kw-tag--exc  { background: rgba(239, 68, 68, 0.1);  color: #f87171; }
.dc-kw-tag--green{ background: rgba(16, 185, 129, 0.1); color: #34d399; }

.dc-kw-dot {
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: middle;
}
.dc-kw-dot--on  { background: #34d399; }
.dc-kw-dot--off { background: var(--ink-3, #94a3b8); }

.dc-kw-op {
  font-size: 11.5px;
  color: var(--accent, #8b5cf6);
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  padding: 2px 4px;
  transition: opacity 0.15s;
}
.dc-kw-op:hover { opacity: 0.75; text-decoration: underline; }
.dc-kw-op--warn  { color: #f59e0b; }
.dc-kw-op--danger{ color: #ef4444; }

.dc-kw-empty {
  text-align: center;
  padding: 32px 12px !important;
  color: var(--ink-3, #94a3b8);
  font-size: 13px;
}

/* ======== 筛选规则 ======== */
.dc-rules__hint {
  font-size: 12px;
  color: var(--ink-3, #94a3b8);
  margin-left: 8px;
}
.dc-rules__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}
.dc-rule-card {
  background: var(--surface-2, rgba(30, 41, 59, 0.6));
  border: 1px solid var(--line, rgba(148, 163, 184, 0.12));
  border-radius: 8px;
  padding: 14px 16px;
}
.dc-rule-card__head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.dc-rule-card__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink, #e2e8f0);
}
.dc-rule-card__priority {
  font-size: 11px;
  color: var(--ink-3, #94a3b8);
  font-family: var(--font-mono, monospace);
}
.dc-rule-card__expr {
  font-size: 12px;
  color: var(--accent, #a78bfa);
  background: rgba(139, 92, 246, 0.06);
  padding: 6px 10px;
  border-radius: 4px;
  font-family: var(--font-mono, monospace);
  margin-bottom: 8px;
}
.dc-rule-card__actions {
  display: flex;
  gap: 8px;
}
.dc-rules__empty, .dc-semantic__empty {
  text-align: center;
  padding: 32px;
  color: var(--ink-3, #94a3b8);
  font-size: 13px;
}

/* ======== 语义模型 ======== */
.dc-semantic__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}
.dc-semantic-card {
  background: var(--surface-2, rgba(30, 41, 59, 0.6));
  border: 1px solid var(--line, rgba(148, 163, 184, 0.12));
  border-radius: 8px;
  padding: 14px 16px;
}
.dc-semantic-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.dc-semantic-card__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink, #e2e8f0);
  margin-right: 10px;
}
.dc-semantic-card__type {
  font-size: 11px;
  color: var(--ink-3, #94a3b8);
  background: rgba(148, 163, 184, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}
.dc-semantic-card__info {
  font-size: 12px;
  color: var(--ink-2, #cbd5e1);
  margin-bottom: 8px;
}
.dc-semantic-card__actions {
  display: flex;
  gap: 8px;
}

/* ======== 评估与反馈 ======== */
.dc-eval__metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.dc-eval-metric {
  background: var(--surface-2, rgba(30, 41, 59, 0.6));
  border: 1px solid var(--line, rgba(148, 163, 184, 0.12));
  border-radius: 8px;
  padding: 14px;
  text-align: center;
}
.dc-eval-metric__value {
  font-size: 22px;
  font-weight: 700;
  color: var(--ink, #e2e8f0);
  line-height: 1.2;
}
.dc-eval-metric__label {
  font-size: 12px;
  color: var(--ink-3, #94a3b8);
  margin-top: 4px;
}
.dc-eval__table-wrap {
  border: 1px solid var(--line, rgba(148, 163, 184, 0.12));
  border-radius: 8px;
  overflow: hidden;
  margin-top: 12px;
}
</style>