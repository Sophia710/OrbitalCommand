<template>
  <div class="bid-panel">
    <!-- 顶部 -->
    <div class="bid-panel__head">
      <button type="button" class="bid-panel__back" @click="$emit('close')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        返回
      </button>
      <div class="bid-panel__title">
        <svg class="bid-panel__title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3v18h18" />
          <path d="M7 16l4-8 4 4 4-6" />
        </svg>
        标讯汇聚
      </div>
    </div>

    <div class="bid-panel__body">
      <!-- 统计卡片 -->
      <div class="bid-panel__stats">
        <div class="bid-stat">
          <div class="bid-stat__value">1030</div>
          <div class="bid-stat__label">近7天标讯总量</div>
        </div>
        <div class="bid-stat">
          <div class="bid-stat__value">256</div>
          <div class="bid-stat__label">今日新增</div>
        </div>
        <div class="bid-stat">
          <div class="bid-stat__value">4</div>
          <div class="bid-stat__label">数据源站点</div>
        </div>
        <div class="bid-stat bid-stat--green">
          <div class="bid-stat__badge">● 阿里云</div>
          <div class="bid-stat__sub">累计 1066 条 · 今日 +217</div>
          <div class="bid-stat__node">cmap00071738 · APPCODE · 上次 fetched 225/inserted 113</div>
        </div>
      </div>

      <!-- 双图表 -->
      <div class="bid-panel__charts">
        <div class="bid-chart">
          <div class="bid-chart__title">公告类型分布</div>
          <div class="bid-chart__rows">
            <div v-for="r in chartTypeData" :key="r.label" class="bid-chart__row">
              <span class="bid-chart__label">{{ r.label }}</span>
              <div class="bid-chart__bar-wrap">
                <div class="bid-chart__bar" :style="{ width: (r.value / chartTypeMax * 100) + '%' }" />
              </div>
              <span class="bid-chart__val">{{ r.value }}</span>
            </div>
          </div>
        </div>
        <div class="bid-chart">
          <div class="bid-chart__title">数据来源分布</div>
          <div class="bid-chart__rows">
            <div v-for="r in chartSourceData" :key="r.label" class="bid-chart__row">
              <span class="bid-chart__label">{{ r.label }}</span>
              <div class="bid-chart__bar-wrap">
                <div class="bid-chart__bar bid-chart__bar--teal" :style="{ width: (r.value / chartSourceMax * 100) + '%' }" />
              </div>
              <span class="bid-chart__val">{{ r.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 筛选栏 -->
      <div class="bid-panel__filter">
        <div class="bid-panel__search">
          <svg class="bid-panel__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            v-model.trim="searchQuery"
            class="bid-panel__search-input"
            placeholder="搜索标讯标题关键词..."
          />
        </div>
        <select v-model="filterType" class="bid-panel__select">
          <option value="">公告类型</option>
          <option v-for="t in typeOptions" :key="t" :value="t">{{ t }}</option>
        </select>
        <select v-model="filterRegion" class="bid-panel__select">
          <option value="">区域</option>
          <option v-for="r in regionOptions" :key="r" :value="r">{{ r }}</option>
        </select>
        <select v-model="filterDomain" class="bid-panel__select">
          <option value="">领域</option>
          <option v-for="d in domainOptions" :key="d" :value="d">{{ d }}</option>
        </select>
        <label class="bid-panel__checkbox">
          <input v-model="onlyDomainRelated" type="checkbox" />
          <span>仅领域相关</span>
        </label>
        <button type="button" class="bid-panel__btn-primary" @click="onRecollect">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" :class="{ spin: collecting }">
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5M8 16H3v5" />
          </svg>
          重新采集
        </button>
      </div>

      <!-- 数据表格 -->
      <div class="bid-panel__table-wrap">
        <table class="bid-panel__table">
          <thead>
            <tr>
              <th class="bid-panel__col-title">标讯标题</th>
              <th class="bid-panel__col-domain">领域</th>
              <th class="bid-panel__col-type">类型</th>
              <th class="bid-panel__col-industry">行业</th>
              <th class="bid-panel__col-region">区域</th>
              <th class="bid-panel__col-budget">预算金额</th>
              <th class="bid-panel__col-date">发布日期</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in filteredList" :key="d.id">
              <td class="bid-panel__col-title">
                <div class="bid-panel__title-text">{{ d.title }}</div>
                <div class="bid-panel__source-tag">{{ d.source }}</div>
              </td>
              <td class="bid-panel__col-domain">
                <span class="bid-tag bid-tag--green">{{ d.domain }}</span>
                <div class="bid-panel__score">得分 {{ d.score }}</div>
              </td>
              <td class="bid-panel__col-type">
                <span class="bid-tag bid-tag--blue">{{ d.type }}</span>
              </td>
              <td class="bid-panel__col-industry">{{ d.industry }}</td>
              <td class="bid-panel__col-region">{{ d.region }}</td>
              <td class="bid-panel__col-budget">{{ d.budget }}</td>
              <td class="bid-panel__col-date">{{ d.date }}</td>
            </tr>
            <tr v-if="!filteredList.length">
              <td colspan="7" class="bid-panel__empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                未找到匹配的标讯
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToastStore } from '@/stores/toast'

defineEmits(['close'])

const toast = useToastStore()
const searchQuery = ref('')
const filterType = ref('')
const filterRegion = ref('')
const filterDomain = ref('')
const onlyDomainRelated = ref(true)
const collecting = ref(false)

/* 图表数据 */
const chartTypeData = [
  { label: '中标公告', value: 138 },
  { label: '中标公示', value: 250 },
  { label: '其他公告', value: 28 },
  { label: '单一来源', value: 6 },
  { label: '变更公告', value: 2 },
  { label: '合同公告', value: 57 },
  { label: '废标公告', value: 49 },
]
const chartTypeMax = Math.max(...chartTypeData.map(r => r.value))

const chartSourceData = [
  { label: '中国政府采购网', value: 524 },
  { label: '全国公共资源交易平台', value: 20 },
  { label: '河北省公共资源交易中心', value: 68 },
  { label: '阿里云招中标', value: 418 },
]
const chartSourceMax = Math.max(...chartSourceData.map(r => r.value))

/* 筛选选项 */
const typeOptions = ['招标公告', '中标公告', '中标公示', '废标公告', '合同公告', '变更公告', '单一来源']
const regionOptions = ['北京', '贵州', '浙江', '重庆', '河北', '上海', '广东', '四川', '江苏']
const domainOptions = ['人工智能', '大数据', '云计算', '物联网', '网络安全', '智慧城市']

/* 标讯数据 */
const ALL_BIDS = [
  { id: 'b1',  title: '007-25210010006-基于机器学习的电镜数据多参量微纳晶微观结构数字化描述与解析技术·计算服务器购置项目（二次）-比选公告', source: '阿里云招中标', domain: '人工智能', type: '招标公告', industry: '信息化/ICT', region: '北京', budget: '20.4万',  date: '2026-07-30', score: 0.68 },
  { id: 'b2',  title: '贵阳银行大模型智能中台（二期）算力服务器采购项目的公开 招标公告', source: '阿里云招中标', domain: '人工智能', type: '招标公告', industry: '信息化/ICT', region: '贵州', budget: '600万',   date: '2026-07-30', score: 0.79 },
  { id: 'b3',  title: '浙江高信技术股份有限公司基于多模态大模型与具身智能的交通基础设施智能诊断及管理系统研究服务器等设备采购项目项目公告', source: '阿里云招中标', domain: '人工智能', type: '招标公告', industry: '信息化/ICT', region: '浙江', budget: '87.02万', date: '2026-07-30', score: 0.72 },
  { id: 'b4',  title: '平台安全检测服务-平台安全检测服务询价通知书', source: '阿里云招中标', domain: '人工智能', type: '招标公告', industry: '专业服务',   region: '北京', budget: '15万',    date: '2026-07-30', score: 0.59 },
  { id: 'b5',  title: '招采合同执行环节的风险防控模型研发项目比选公告', source: '阿里云招中标', domain: '人工智能', type: '招标公告', industry: '-',          region: '重庆', budget: '45.28万', date: '2026-07-30', score: 0.53 },
  { id: 'b6',  title: '某省自然资源厅卫星遥感影像统筹采购项目（2026年度）', source: '中国政府采购网', domain: '大数据', type: '中标公告', industry: '遥感测绘', region: '贵州', budget: '1967万',  date: '2026-07-28', score: 0.91 },
  { id: 'b7',  title: '广东省生态环境遥感监测体系建设（合成孔径雷达和热红外技术建设）', source: '阿里云招中标', domain: '人工智能', type: '招标公告', industry: '生态环境', region: '广东', budget: '待定',    date: '2026-07-27', score: 0.85 },
  { id: 'b8',  title: '厦门市2026年地形级实景三维建设采购项目', source: '全国公共资源交易平台', domain: '大数据', type: '招标公告', industry: '测绘地理', region: '福建', budget: '195万',   date: '2026-07-26', score: 0.77 },
  { id: 'b9',  title: '智慧城市大数据平台升级改造项目（三期）', source: '阿里云招中标', domain: '智慧城市', type: '中标公告', industry: '信息化/ICT', region: '浙江', budget: '320万',   date: '2026-07-25', score: 0.74 },
  { id: 'b10', title: '网络安全态势感知平台建设项目', source: '中国政府采购网', domain: '网络安全', type: '招标公告', industry: '信息安全',   region: '北京', budget: '480万',   date: '2026-07-24', score: 0.82 },
  { id: 'b11', title: '物联网智慧园区综合管理系统采购', source: '阿里云招中标', domain: '物联网', type: '中标公示', industry: '信息化/ICT', region: '江苏', budget: '260万',   date: '2026-07-23', score: 0.66 },
  { id: 'b12', title: '云计算资源池扩容项目（2026年）', source: '河北省公共资源交易中心', domain: '云计算', type: '招标公告', industry: '信息化/ICT', region: '河北', budget: '550万',   date: '2026-07-22', score: 0.71 },
]

const filteredList = computed(() => {
  return ALL_BIDS.filter((d) => {
    if (searchQuery.value && !d.title.toLowerCase().includes(searchQuery.value.toLowerCase())) return false
    if (filterType.value && d.type !== filterType.value) return false
    if (filterRegion.value && d.region !== filterRegion.value) return false
    if (filterDomain.value && d.domain !== filterDomain.value) return false
    return true
  })
})

function onRecollect() {
  collecting.value = true
  setTimeout(() => {
    collecting.value = false
    toast.success('数据采集完成，已更新 256 条标讯')
  }, 1500)
}
</script>

<style scoped>
.bid-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ---------- 顶部栏 ---------- */
.bid-panel__head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--line, rgba(148, 163, 184, 0.12));
  flex-shrink: 0;
}
.bid-panel__back {
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
.bid-panel__back svg { width: 14px; height: 14px; }
.bid-panel__back:hover { border-color: var(--accent, #8b5cf6); color: var(--accent, #a78bfa); }
.bid-panel__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink, #e2e8f0);
  flex: 1;
}
.bid-panel__title-icon { width: 18px; height: 18px; color: var(--ink-2, #cbd5e1); }

/* ---------- 主体滚动区 ---------- */
.bid-panel__body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 20px;
}
.bid-panel__body::-webkit-scrollbar { width: 5px; }
.bid-panel__body::-webkit-scrollbar-thumb { background: var(--line, rgba(148, 163, 184, 0.2)); border-radius: 999px; }

/* ---------- 统计卡片 ---------- */
.bid-panel__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.bid-stat {
  background: var(--surface-2, rgba(30, 41, 59, 0.6));
  border: 1px solid var(--line, rgba(148, 163, 184, 0.12));
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}
.bid-stat__value {
  font-size: 28px;
  font-weight: 700;
  color: var(--ink, #e2e8f0);
  line-height: 1.2;
}
.bid-stat__label {
  font-size: 12px;
  color: var(--ink-3, #94a3b8);
  margin-top: 4px;
}
.bid-stat--green {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.2);
  text-align: left;
}
.bid-stat__badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  color: #34d399;
  background: rgba(16, 185, 129, 0.15);
  padding: 2px 10px;
  border-radius: 999px;
  margin-bottom: 6px;
}
.bid-stat__sub {
  font-size: 11.5px;
  color: var(--ink-2, #cbd5e1);
  margin-bottom: 4px;
}
.bid-stat__node {
  font-size: 10px;
  color: var(--ink-3, #94a3b8);
  font-family: var(--font-mono, monospace);
  line-height: 1.4;
}

/* ---------- 双图表 ---------- */
.bid-panel__charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
.bid-chart {
  background: var(--surface-2, rgba(30, 41, 59, 0.6));
  border: 1px solid var(--line, rgba(148, 163, 184, 0.12));
  border-radius: 8px;
  padding: 14px 16px;
}
.bid-chart__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink, #e2e8f0);
  margin-bottom: 10px;
}
.bid-chart__rows { display: flex; flex-direction: column; gap: 6px; }
.bid-chart__row {
  display: grid;
  grid-template-columns: 90px 1fr 36px;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
}
.bid-chart__label { color: var(--ink-2, #cbd5e1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bid-chart__bar-wrap {
  height: 8px;
  background: rgba(148, 163, 184, 0.1);
  border-radius: 4px;
  overflow: hidden;
}
.bid-chart__bar {
  height: 100%;
  border-radius: 4px;
  background: var(--accent, #8b5cf6);
  transition: width 0.4s ease;
}
.bid-chart__bar--teal { background: #2dd4bf; }
.bid-chart__val { text-align: right; color: var(--ink-3, #94a3b8); font-family: var(--font-mono, monospace); font-size: 11px; }

/* ---------- 筛选栏 ---------- */
.bid-panel__filter {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.bid-panel__search {
  position: relative;
  flex: 1;
  min-width: 180px;
}
.bid-panel__search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  color: var(--ink-3, #94a3b8);
  pointer-events: none;
}
.bid-panel__search-input {
  width: 100%;
  padding: 7px 12px 7px 32px;
  font-size: 12.5px;
  border: 1px solid var(--line, rgba(148, 163, 184, 0.2));
  border-radius: 6px;
  background: var(--surface, #0f172a);
  color: var(--ink, #e2e8f0);
  font-family: inherit;
  outline: 0;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.bid-panel__search-input::placeholder { color: var(--ink-3, #94a3b8); }
.bid-panel__search-input:focus { border-color: var(--accent, #8b5cf6); box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12); }

.bid-panel__select {
  padding: 7px 28px 7px 10px;
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
  transition: border-color 0.15s;
}
.bid-panel__select:focus { border-color: var(--accent, #8b5cf6); }
.bid-panel__select option { background: #1e293b; color: #e2e8f0; }

.bid-panel__checkbox {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  color: var(--ink-2, #cbd5e1);
  cursor: pointer;
  white-space: nowrap;
}
.bid-panel__checkbox input { width: 14px; height: 14px; accent-color: var(--accent, #8b5cf6); }

.bid-panel__btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  font-size: 12.5px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  background: var(--accent, #8b5cf6);
  color: #fff;
  cursor: pointer;
  transition: filter 0.15s;
  font-family: inherit;
  white-space: nowrap;
}
.bid-panel__btn-primary:hover { filter: brightness(1.1); }
.bid-panel__btn-primary svg { width: 14px; height: 14px; }
.spin { animation: bid-spin 0.8s linear infinite; }
@keyframes bid-spin { to { transform: rotate(360deg); } }

/* ---------- 数据表格 ---------- */
.bid-panel__table-wrap {
  border: 1px solid var(--line, rgba(148, 163, 184, 0.12));
  border-radius: 8px;
  overflow: hidden;
}
.bid-panel__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}
.bid-panel__table thead { position: sticky; top: 0; z-index: 1; }
.bid-panel__table thead th {
  text-align: left;
  padding: 10px 14px;
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-3, #94a3b8);
  background: var(--surface-2, rgba(30, 41, 59, 0.95));
  border-bottom: 1px solid var(--line, rgba(148, 163, 184, 0.12));
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.bid-panel__table tbody td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--line, rgba(148, 163, 184, 0.08));
  color: var(--ink-2, #cbd5e1);
  vertical-align: middle;
}
.bid-panel__table tbody tr:last-child td { border-bottom: none; }
.bid-panel__table tbody tr:hover td { background: rgba(139, 92, 246, 0.04); }

/* 列宽 */
.bid-panel__col-title    { min-width: 280px; }
.bid-panel__col-domain   { width: 100px; }
.bid-panel__col-type     { width: 80px; }
.bid-panel__col-industry { width: 100px; }
.bid-panel__col-region   { width: 60px; }
.bid-panel__col-budget   { width: 80px; }
.bid-panel__col-date     { width: 100px; font-family: var(--font-mono, monospace); font-size: 11.5px; color: var(--ink-3, #94a3b8); }

/* 标题单元格 */
.bid-panel__title-text {
  font-weight: 500;
  color: var(--ink, #e2e8f0);
  line-height: 1.4;
  margin-bottom: 3px;
}
.bid-panel__source-tag {
  font-size: 10.5px;
  color: var(--ink-3, #94a3b8);
}
.bid-panel__score {
  font-size: 10px;
  color: var(--ink-3, #94a3b8);
  margin-top: 2px;
  font-family: var(--font-mono, monospace);
}

/* 标签 */
.bid-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}
.bid-tag--green { background: rgba(16, 185, 129, 0.1); color: #34d399; }
.bid-tag--blue  { background: rgba(56, 189, 248, 0.1); color: #7dd3fc; }

/* 空状态 */
.bid-panel__empty {
  text-align: center;
  padding: 40px 16px !important;
  color: var(--ink-3, #94a3b8);
  font-size: 13px;
}
.bid-panel__empty svg { width: 28px; height: 28px; margin-bottom: 8px; opacity: 0.4; }
</style>