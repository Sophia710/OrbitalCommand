<template>
  <div class="ba-panel">
    <!-- 顶部栏 -->
    <div class="ba-panel__head">
      <button type="button" class="ba-panel__back" @click="$emit('close')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        返回
      </button>
      <div class="ba-panel__title">
        <svg class="ba-panel__title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
        </svg>
        标讯查询与一键分析报告
      </div>
    </div>

    <div class="ba-panel__body">
      <!-- Tab 导航 -->
      <div class="ba-panel__tabs">
        <button
          v-for="t in tabs"
          :key="t.key"
          class="ba-tab"
          :class="{ 'is-active': activeTab === t.key }"
          @click="activeTab = t.key"
        >
          <span v-if="t.icon" class="ba-tab__icon">{{ t.icon }}</span>
          {{ t.label }}
        </button>
      </div>

      <!-- ======== Tab 1: 可行性分析 ======== -->
      <template v-if="activeTab === 'feasibility'">
        <!-- 综合评分 -->
        <div class="ba-score">
          <div class="ba-score__left">
            <div class="ba-score__label">综合评分</div>
            <div class="ba-score__bar-wrap">
              <div class="ba-score__bar" :style="{ width: score + '%' }" />
              <span class="ba-score__val">{{ score }}%</span>
            </div>
          </div>
          <div class="ba-score__right">
            <div class="ba-score__rating">
              <span class="ba-score__rating-tag" :class="ratingClass">{{ ratingText }}</span>
            </div>
            <p class="ba-score__desc">{{ scoreDesc }}</p>
          </div>
        </div>

        <!-- 六宫格评估卡片 -->
        <div class="ba-grid">
          <!-- 产品匹配 -->
          <div class="ba-card">
            <div class="ba-card__head">
              <span class="ba-card__icon"></span>
              <span class="ba-card__title">产品匹配</span>
            </div>
            <div class="ba-card__progress">
              <div class="ba-card__bar-wrap">
                <div class="ba-card__bar ba-card__bar--orange" :style="{ width: metrics.product + '%' }" />
              </div>
              <span class="ba-card__pct">{{ metrics.product }}%</span>
            </div>
            <div class="ba-card__tags">
              <span v-for="p in matchedProducts" :key="p" class="ba-tag ba-tag--blue">{{ p }}</span>
            </div>
          </div>

          <!-- 能力匹配 -->
          <div class="ba-card">
            <div class="ba-card__head">
              <span class="ba-card__icon">⚡</span>
              <span class="ba-card__title">能力匹配</span>
            </div>
            <div class="ba-card__progress">
              <div class="ba-card__bar-wrap">
                <div class="ba-card__bar ba-card__bar--orange" :style="{ width: metrics.ability + '%' }" />
              </div>
              <span class="ba-card__pct">{{ metrics.ability }}%</span>
            </div>
            <div class="ba-card__ability">
              <div v-for="c in abilitiesHave" :key="c" class="ba-ability-item ba-ability-item--have">
                <span class="ba-ability-dot ba-ability-dot--green"></span>
                {{ c }}
              </div>
              <div v-for="c in abilitiesLack" :key="c" class="ba-ability-item ba-ability-item--lack">
                <span class="ba-ability-dot ba-ability-dot--red"></span>
                {{ c }}
              </div>
            </div>
          </div>

          <!-- 案例相似度 -->
          <div class="ba-card">
            <div class="ba-card__head">
              <span class="ba-card__icon">📋</span>
              <span class="ba-card__title">案例相似度</span>
            </div>
            <div class="ba-card__progress">
              <div class="ba-card__bar-wrap">
                <div class="ba-card__bar ba-card__bar--orange" :style="{ width: metrics.case + '%' }" />
              </div>
              <span class="ba-card__pct">{{ metrics.case }}%</span>
            </div>
            <div class="ba-card__cases">
              <div v-for="c in similarCases" :key="c.name" class="ba-case-row">
                <span class="ba-case-name">{{ c.name }}</span>
                <div class="ba-case-bar-wrap">
                  <div class="ba-case-bar" :style="{ width: c.similarity + '%' }" />
                </div>
                <span class="ba-case-pct">{{ c.similarity }}%</span>
              </div>
            </div>
          </div>

          <!-- 时间充裕度 -->
          <div class="ba-card">
            <div class="ba-card__head">
              <span class="ba-card__icon">🕐</span>
              <span class="ba-card__title">时间充裕度</span>
            </div>
            <div class="ba-card__progress">
              <div class="ba-card__bar-wrap">
                <div class="ba-card__bar ba-card__bar--orange" :style="{ width: metrics.time + '%' }" />
              </div>
              <span class="ba-card__pct">{{ metrics.time }}%</span>
            </div>
            <div class="ba-card__time">
              <span class="ba-time-label">剩余天数</span>
              <span class="ba-time-days">{{ timeDays }} 天</span>
              <span class="ba-tag" :class="timeStatus === '紧张' ? 'ba-tag--orange' : 'ba-tag--green'">{{ timeStatus }}</span>
            </div>
          </div>

          <!-- 预算合理性 -->
          <div class="ba-card">
            <div class="ba-card__head">
              <span class="ba-card__icon">💰</span>
              <span class="ba-card__title">预算合理性</span>
            </div>
            <div class="ba-card__progress">
              <div class="ba-card__bar-wrap">
                <div class="ba-card__bar ba-card__bar--orange" :style="{ width: metrics.budget + '%' }" />
              </div>
              <span class="ba-card__pct">{{ metrics.budget }}%</span>
            </div>
            <div class="ba-card__budget">
              <p class="ba-budget-text">{{ budgetDesc }}</p>
            </div>
          </div>
        </div>
      </template>

      <!-- ======== Tab 2: 相关项目 ======== -->
      <template v-if="activeTab === 'related'">
        <div class="ba-related">
          <div class="ba-section-head">
            <span>与您历史参与项目相似度最高的标讯</span>
            <span class="ba-section-count">共 {{ relatedProjects.length }} 个</span>
          </div>
          <div class="ba-related__list">
            <div v-for="p in relatedProjects" :key="p.id" class="ba-related-card">
              <div class="ba-related-card__head">
                <span class="ba-related-card__name">{{ p.name }}</span>
                <span class="ba-related-card__similarity">{{ p.similarity }}%</span>
              </div>
              <div class="ba-related-card__meta">
                <span>参与时间：{{ p.date }}</span>
                <span>项目金额：{{ p.amount }}</span>
              </div>
              <div class="ba-related-card__result">
                <span class="ba-tag" :class="p.result === '中标' ? 'ba-tag--green' : 'ba-tag--gray'">{{ p.result }}</span>
              </div>
            </div>
            <div v-if="!relatedProjects.length" class="ba-empty">暂无相关项目</div>
          </div>
        </div>
      </template>

      <!-- ======== Tab 3: 注意事项 ======== -->
      <template v-if="activeTab === 'notes'">
        <div class="ba-notes">
          <div class="ba-notes__section">
            <div class="ba-notes__section-title"> 投标资质要求</div>
            <ul class="ba-notes__list">
              <li v-for="q in noteQualifications" :key="q">{{ q }}</li>
            </ul>
          </div>
          <div class="ba-notes__section">
            <div class="ba-notes__section-title">⏰ 关键时间节点</div>
            <ul class="ba-notes__list">
              <li v-for="t in noteTimeline" :key="t.label">
                <span class="ba-notes__time-label">{{ t.label }}</span>
                <span class="ba-notes__time-value">{{ t.value }}</span>
              </li>
            </ul>
          </div>
          <div class="ba-notes__section">
            <div class="ba-notes__section-title">⚠️ 风险提示</div>
            <ul class="ba-notes__list">
              <li v-for="r in noteRisks" :key="r">{{ r }}</li>
            </ul>
          </div>
          <div class="ba-notes__section">
            <div class="ba-notes__section-title">✅ 建议行动项</div>
            <ul class="ba-notes__list">
              <li v-for="a in noteActions" :key="a">{{ a }}</li>
            </ul>
          </div>
        </div>
      </template>

      <!-- ======== Tab 4: 资质分析 ======== -->
      <template v-if="activeTab === 'qualification'">
        <div class="ba-qual">
          <div class="ba-qual__score">
            <span class="ba-qual__score-label">资质匹配度</span>
            <span class="ba-qual__score-value">{{ qualScore }}%</span>
          </div>
          <div class="ba-qual__table-wrap">
            <table class="ba-qual__table">
              <thead>
                <tr>
                  <th>资质名称</th>
                  <th>标讯要求</th>
                  <th>用户现有</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="q in qualItems" :key="q.name">
                  <td>{{ q.name }}</td>
                  <td>{{ q.required }}</td>
                  <td>{{ q.have || '—' }}</td>
                  <td>
                    <span class="ba-tag" :class="qualStatusClass(q.status)">{{ qualStatusText(q.status) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ba-qual__advice">
            <div class="ba-qual__advice-title">缺失资质补办建议</div>
            <ul class="ba-notes__list">
              <li v-for="a in qualAdvice" :key="a">{{ a }}</li>
            </ul>
          </div>
        </div>
      </template>

      <!-- ======== Tab 5: 同资质标讯 ======== -->
      <template v-if="activeTab === 'samequal'">
        <div class="ba-samequal">
          <div class="ba-section-head">
            <span>与您当前资质条件匹配的其他标讯</span>
            <span class="ba-section-count">共 {{ sameQualBids.length }} 条</span>
          </div>
          <div class="ba-samequal__table-wrap">
            <table class="ba-qual__table">
              <thead>
                <tr>
                  <th>标讯标题</th>
                  <th>发布机构</th>
                  <th>预算金额</th>
                  <th>截止日期</th>
                  <th>资质匹配度</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in sameQualBids" :key="b.id">
                  <td class="ba-samequal__title">{{ b.title }}</td>
                  <td>{{ b.org }}</td>
                  <td>{{ b.budget }}</td>
                  <td>{{ b.deadline }}</td>
                  <td>
                    <span class="ba-tag" :class="b.match >= 80 ? 'ba-tag--green' : b.match >= 60 ? 'ba-tag--blue' : 'ba-tag--orange'">{{ b.match }}%</span>
                  </td>
                </tr>
                <tr v-if="!sameQualBids.length">
                  <td colspan="5" class="ba-empty">暂无匹配的标讯</td>
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

defineEmits(['close'])

const activeTab = ref('feasibility')

/* Tab 定义 */
const tabs = [
  { key: 'feasibility', label: '可行性分析', icon: '📊' },
  { key: 'related',     label: '相关项目',   icon: '' },
  { key: 'notes',       label: '注意事项',   icon: '' },
  { key: 'qualification',label: '资质分析',  icon: '🏅' },
  { key: 'samequal',    label: '同资质标讯', icon: '🎯' },
]

/* ======== Tab 1: 可行性分析 ======== */
const score = 62
const scoreDesc = '5条标讯中3条与人工智能核心技术及机器学习深度学习平台相关，综合评估后认为参与可行性中等偏上。建议重点关注AI教学实训平台类项目，已有成功案例积累，但需注意部分标讯对机房维保服务的要求超出当前能力范围。'
const ratingText = '建议关注'
const ratingClass = 'ba-rating--orange'

const metrics = { product: 70, ability: 68, case: 60, time: 50, budget: 72 }

const matchedProducts = [
  'AI教学实训平台', '深度学习服务器', '机器学习算法平台',
  '计算机视觉应用', '智能机器人教学设备', '工业AI视觉检测系统',
]

const abilitiesHave = [
  'Python/机器学习/深度学习模型平台搭建',
  '计算机视觉算法与应用',
  '自然语言处理能力',
  '大数据分析与历史数据库建设',
  '智能机器人教学课程支撑',
  '数字化教学资源管理平台',
]
const abilitiesLack = [
  '机房及会议设备维保服务',
  '工业活题和主题线下图像检测能力',
]

const similarCases = [
  { name: '浙江万里学院大数据学院…', similarity: 85 },
  { name: '赣州职业技术学院AI平台…', similarity: 80 },
  { name: '深圳迈科学校AI教学…',    similarity: 75 },
  { name: '国能火电厂AI电站生成…',  similarity: 45 },
  { name: '中交资本机房及会议设备…', similarity: 10 },
]

const timeDays = 15
const timeStatus = '紧张'
const budgetDesc = '预算区间 81万~1052万已覆盖项目，教育类AI平台项目通常预算在60万-80万区间，参考浙江万里学院81万中标价，建议报价区间65-102万，预留10%-20%工业AI项目较大自由议价空间，实际报价需综合评估项目规模后确定。'

/* ======== Tab 2: 相关项目 ======== */
const relatedProjects = [
  { id: 1, name: '浙江万里学院大数据学院AI教学平台建设项目', date: '2025-03', amount: '81万',  similarity: 85, result: '中标' },
  { id: 2, name: '赣州职业技术学院AI实训平台采购项目',       date: '2025-06', amount: '65万',  similarity: 80, result: '中标' },
  { id: 3, name: '深圳迈科学校AI教学资源平台项目',           date: '2025-09', amount: '92万',  similarity: 75, result: '未中标' },
  { id: 4, name: '国能火电厂AI电站生成系统项目',             date: '2025-11', amount: '320万', similarity: 45, result: '未中标' },
  { id: 5, name: '中交资本机房及会议设备采购项目',           date: '2026-01', amount: '156万', similarity: 10, result: '未中标' },
]

/* ======== Tab 3: 注意事项 ======== */
const noteQualifications = [
  '具备独立法人资格，营业执照经营范围包含软件开发或信息技术服务',
  '具有ISO9001质量管理体系认证',
  '具有CMMI 3级及以上软件能力成熟度认证',
  '近三年内至少完成2个同类AI教学平台项目',
  '项目团队需包含至少3名具有AI/机器学习相关资质的技术人员',
]
const noteTimeline = [
  { label: '报名截止', value: '2026-08-15 17:00' },
  { label: '投标文件递交截止', value: '2026-08-22 09:30' },
  { label: '开标时间', value: '2026-08-22 10:00' },
  { label: '预计中标公示', value: '2026-08-29' },
]
const noteRisks = [
  '竞争强度较高：已有5家以上企业报名，含2家行业头部企业',
  '资质门槛：要求CMMI 3级认证，部分中小企业可能不满足',
  '低价风险：历史同类项目最低价低于预算40%，需合理报价',
  '技术评分占比高：技术方案占50%，需重点打磨技术方案',
]
const noteActions = [
  '立即准备CMMI认证材料，确保在投标截止前提交',
  '组建专项投标团队，包含技术、商务、法务人员',
  '参考浙江万里学院项目技术方案，优化本次投标方案',
  '提前联系3家以上同类项目客户，获取推荐信或案例证明',
]

/* ======== Tab 4: 资质分析 ======== */
const qualScore = 75
const qualItems = [
  { name: 'ISO9001质量管理体系', required: '必须', have: '已获取(2024-06)',  status: 'have' },
  { name: 'CMMI 3级认证',        required: '必须', have: '已获取(2025-01)',  status: 'have' },
  { name: '高新技术企业认定',    required: '优先', have: '已获取(2024-12)',  status: 'have' },
  { name: '涉密信息系统集成资质', required: '优先', have: '—',               status: 'lack' },
  { name: '测绘资质（甲级）',     required: '非必须', have: '—',              status: 'lack' },
  { name: '软件企业认定',        required: '优先', have: '已获取(2023-09)',  status: 'expiring' },
]
const qualAdvice = [
  '涉密信息系统集成资质：建议立即启动申请，周期约3-6个月，可先以联合体形式参与本次投标',
  '测绘资质（甲级）：非本次标讯必须项，但建议纳入长期资质规划，周期约6-12个月',
  '软件企业认定即将于2026-12到期，建议提前3个月启动续期流程',
]

/* ======== Tab 5: 同资质标讯 ======== */
const sameQualBids = [
  { id: 1, title: '某省教育厅AI教学实训平台采购项目',     org: '省教育厅',     budget: '120万',  deadline: '2026-08-20', match: 92 },
  { id: 2, title: '某市职业技术学院智能机器人实验室建设', org: '市职业技术学院', budget: '85万',   deadline: '2026-08-25', match: 88 },
  { id: 3, title: '某高校机器学习算法平台升级项目',       org: '某大学',       budget: '65万',   deadline: '2026-09-01', match: 82 },
  { id: 4, title: '某研究院计算机视觉应用系统采购',       org: '某研究院',     budget: '200万',  deadline: '2026-09-10', match: 75 },
  { id: 5, title: '某企业数字化教学资源管理平台项目',     org: '某国企',       budget: '150万',  deadline: '2026-09-15', match: 68 },
]

/* 工具函数 */
function qualStatusClass(s) {
  return { 'ba-tag--green': s === 'have', 'ba-tag--red': s === 'lack', 'ba-tag--orange': s === 'expiring' }
}
function qualStatusText(s) {
  return { have: '已具备', lack: '缺失', expiring: '即将过期' }[s] || s
}
</script>

<style scoped>
.ba-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ---------- 顶部栏 ---------- */
.ba-panel__head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--line, rgba(148, 163, 184, 0.12));
  flex-shrink: 0;
}
.ba-panel__back {
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
.ba-panel__back svg { width: 14px; height: 14px; }
.ba-panel__back:hover { border-color: var(--accent, #8b5cf6); color: var(--accent, #a78bfa); }
.ba-panel__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink, #e2e8f0);
}
.ba-panel__title-icon { width: 18px; height: 18px; color: var(--ink-2, #cbd5e1); }

/* ---------- 主体 ---------- */
.ba-panel__body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 20px;
}
.ba-panel__body::-webkit-scrollbar { width: 5px; }
.ba-panel__body::-webkit-scrollbar-thumb { background: var(--line, rgba(148, 163, 184, 0.2)); border-radius: 999px; }

/* ---------- Tab 导航 ---------- */
.ba-panel__tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--line, rgba(148, 163, 184, 0.12));
  margin-bottom: 16px;
}
.ba-tab {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
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
.ba-tab:hover { color: var(--ink-2, #cbd5e1); }
.ba-tab.is-active { color: var(--accent, #8b5cf6); border-bottom-color: var(--accent, #8b5cf6); }
.ba-tab__icon { font-size: 14px; }

/* -------- 通用标签 -------- */
.ba-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}
.ba-tag--blue   { background: rgba(56, 189, 248, 0.1);  color: #7dd3fc; }
.ba-tag--green  { background: rgba(16, 185, 129, 0.1);  color: #34d399; }
.ba-tag--orange { background: rgba(245, 158, 11, 0.1);  color: #fbbf24; }
.ba-tag--red    { background: rgba(239, 68, 68, 0.1);   color: #f87171; }
.ba-tag--gray   { background: rgba(148, 163, 184, 0.1); color: #94a3b8; }

/* -------- 综合评分 -------- */
.ba-score {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 16px 20px;
  background: var(--surface-2, rgba(30, 41, 59, 0.6));
  border: 1px solid var(--line, rgba(148, 163, 184, 0.12));
  border-radius: 8px;
  margin-bottom: 16px;
}
.ba-score__left { flex: 1; }
.ba-score__label { font-size: 12px; color: var(--ink-3, #94a3b8); margin-bottom: 8px; }
.ba-score__bar-wrap {
  position: relative;
  height: 10px;
  background: rgba(148, 163, 184, 0.1);
  border-radius: 5px;
  overflow: hidden;
}
.ba-score__bar {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #f97316);
  border-radius: 5px;
  transition: width 0.6s ease;
}
.ba-score__val {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  font-weight: 700;
  color: #fff;
}
.ba-score__right { min-width: 200px; }
.ba-score__rating-tag {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
}
.ba-rating--orange { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.ba-score__desc {
  font-size: 12px;
  color: var(--ink-2, #cbd5e1);
  line-height: 1.6;
  margin: 0;
}

/* -------- 六宫格 -------- */
.ba-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.ba-card {
  background: var(--surface-2, rgba(30, 41, 59, 0.6));
  border: 1px solid var(--line, rgba(148, 163, 184, 0.12));
  border-radius: 8px;
  padding: 14px 16px;
}
.ba-card__head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}
.ba-card__icon { font-size: 16px; }
.ba-card__title { font-size: 13px; font-weight: 600; color: var(--ink, #e2e8f0); }
.ba-card__progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.ba-card__bar-wrap {
  flex: 1;
  height: 6px;
  background: rgba(148, 163, 184, 0.1);
  border-radius: 3px;
  overflow: hidden;
}
.ba-card__bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}
.ba-card__bar--orange { background: linear-gradient(90deg, #f59e0b, #f97316); }
.ba-card__pct {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink, #e2e8f0);
  min-width: 36px;
  text-align: right;
}

/* 产品匹配标签 */
.ba-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* 能力匹配列表 */
.ba-card__ability {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 120px;
  overflow-y: auto;
}
.ba-ability-item {
  font-size: 11.5px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--ink-2, #cbd5e1);
}
.ba-ability-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.ba-ability-dot--green { background: #34d399; }
.ba-ability-dot--red   { background: #f87171; }

/* 案例相似度条形图 */
.ba-card__cases {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.ba-case-row {
  display: grid;
  grid-template-columns: 1fr 100px 36px;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}
.ba-case-name { color: var(--ink-2, #cbd5e1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ba-case-bar-wrap {
  height: 6px;
  background: rgba(148, 163, 184, 0.1);
  border-radius: 3px;
  overflow: hidden;
}
.ba-case-bar {
  height: 100%;
  background: var(--accent, #8b5cf6);
  border-radius: 3px;
  transition: width 0.4s ease;
}
.ba-case-pct { text-align: right; color: var(--ink-3, #94a3b8); font-family: var(--font-mono, monospace); font-size: 11px; }

/* 时间充裕度 */
.ba-card__time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.ba-time-label { color: var(--ink-3, #94a3b8); }
.ba-time-days { font-weight: 700; color: var(--ink, #e2e8f0); font-family: var(--font-mono, monospace); }

/* 预算合理性 */
.ba-budget-text {
  font-size: 11.5px;
  color: var(--ink-2, #cbd5e1);
  line-height: 1.5;
  margin: 0;
}

/* -------- 相关项目 -------- */
.ba-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink, #e2e8f0);
  margin-bottom: 12px;
}
.ba-section-count {
  font-size: 12px;
  font-weight: 400;
  color: var(--accent, #8b5cf6);
  background: var(--accent-soft, rgba(139, 92, 246, 0.12));
  padding: 2px 8px;
  border-radius: 999px;
}
.ba-related__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ba-related-card {
  background: var(--surface-2, rgba(30, 41, 59, 0.6));
  border: 1px solid var(--line, rgba(148, 163, 184, 0.12));
  border-radius: 8px;
  padding: 14px 16px;
}
.ba-related-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.ba-related-card__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink, #e2e8f0);
}
.ba-related-card__similarity {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent, #a78bfa);
  font-family: var(--font-mono, monospace);
}
.ba-related-card__meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--ink-3, #94a3b8);
  margin-bottom: 8px;
}
.ba-related-card__result { display: flex; }

/* -------- 注意事项 -------- */
.ba-notes__section {
  margin-bottom: 16px;
}
.ba-notes__section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink, #e2e8f0);
  margin-bottom: 8px;
}
.ba-notes__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ba-notes__list li {
  font-size: 12.5px;
  color: var(--ink-2, #cbd5e1);
  padding-left: 16px;
  position: relative;
  line-height: 1.5;
}
.ba-notes__list li::before {
  content: '•';
  position: absolute;
  left: 4px;
  color: var(--accent, #8b5cf6);
}
.ba-notes__time-label {
  display: inline-block;
  min-width: 100px;
  font-weight: 500;
  color: var(--ink, #e2e8f0);
}
.ba-notes__time-value {
  font-family: var(--font-mono, monospace);
  color: var(--accent, #a78bfa);
}

/* -------- 资质分析 -------- */
.ba-qual__score {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.ba-qual__score-label { font-size: 13px; color: var(--ink-3, #94a3b8); }
.ba-qual__score-value { font-size: 22px; font-weight: 700; color: var(--accent, #a78bfa); font-family: var(--font-mono, monospace); }
.ba-qual__table-wrap {
  border: 1px solid var(--line, rgba(148, 163, 184, 0.12));
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}
.ba-qual__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}
.ba-qual__table thead { position: sticky; top: 0; z-index: 1; }
.ba-qual__table thead th {
  text-align: left;
  padding: 9px 12px;
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-3, #94a3b8);
  background: var(--surface-2, rgba(30, 41, 59, 0.95));
  border-bottom: 1px solid var(--line, rgba(148, 163, 184, 0.12));
  white-space: nowrap;
}
.ba-qual__table tbody td {
  padding: 9px 12px;
  border-bottom: 1px solid var(--line, rgba(148, 163, 184, 0.08));
  color: var(--ink-2, #cbd5e1);
}
.ba-qual__table tbody tr:last-child td { border-bottom: none; }
.ba-qual__table tbody tr:hover td { background: rgba(139, 92, 246, 0.04); }
.ba-qual__advice {
  background: var(--surface-2, rgba(30, 41, 59, 0.6));
  border: 1px solid var(--line, rgba(148, 163, 184, 0.12));
  border-radius: 8px;
  padding: 14px 16px;
}
.ba-qual__advice-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink, #e2e8f0);
  margin-bottom: 8px;
}

/* -------- 同资质标讯 -------- */
.ba-samequal__table-wrap {
  border: 1px solid var(--line, rgba(148, 163, 184, 0.12));
  border-radius: 8px;
  overflow: hidden;
}
.ba-samequal__title {
  font-weight: 500;
  color: var(--ink, #e2e8f0);
  max-width: 260px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* -------- 空状态 -------- */
.ba-empty {
  text-align: center;
  padding: 32px;
  color: var(--ink-3, #94a3b8);
  font-size: 13px;
}
</style>