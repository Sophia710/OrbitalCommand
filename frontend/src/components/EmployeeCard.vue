<template>
  <article
    class="emp-card"
    :class="['emp-card--' + tierKey, { 'is-detail': detail, 'is-hired': !hireable }]"
  >
    <!-- 顶部品牌高亮线：按级别走不同渐变 -->
    <div class="emp-card__bar" />

    <!-- 角标：超级员工额外展示「旗舰」角标 -->
    <div v-if="tierKey === 'super'" class="emp-card__corner">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2 L20 8 L17 20 L7 20 L4 8 Z" />
        <path d="M12 2 L8 8 L12 14 L16 8 Z" />
        <path d="M4 8 L12 14 L20 8" />
      </svg>
      <span>旗舰</span>
    </div>

    <div class="emp-card__head">
      <div
        class="emp-card__avatar"
        :style="avatarStyle"
      >
        <span>{{ initial }}</span>
        <span v-if="employee.status === 'pending'" class="emp-card__status">审核中</span>
        <span v-else-if="employee.status === 'rejected'" class="emp-card__status is-reject">已驳回</span>
        <span v-else-if="employee.status === 'draft'" class="emp-card__status is-draft">草稿</span>
      </div>
      <div class="emp-card__title">
        <div class="emp-card__name" :title="employee.name">{{ employee.name }}</div>
        <div class="emp-card__role">
          <span v-if="tierKey === 'super' && seriesLabel" class="emp-card__series">{{ seriesLabel }}</span>
          <span v-else>{{ employee.domain }} · {{ employee.publisher }}</span>
        </div>
      </div>
      <span
        class="emp-card__tag"
        :class="['emp-card__tag--' + tierKey]"
      >
        <i class="emp-card__tag-dot" />
        {{ tierLabel }}
      </span>
    </div>

    <p class="emp-card__desc">{{ employee.description }}</p>

    <div class="emp-card__capabilities">
      <span
        v-for="t in displayTags"
        :key="t"
        class="emp-card__cap"
      >{{ t }}</span>
    </div>

    <div class="emp-card__meta">
      <span>
        <b>{{ formatUsers(employee.usage) }}</b> 用户 · <b>{{ formatCalls(employee.usage) }}</b> 调用
      </span>
      <span class="emp-card__rating">
        <i>★</i> {{ employee.rating ? employee.rating.toFixed(1) : '—' }}
      </span>
    </div>

    <div class="emp-card__actions">
      <button
        v-if="hireable"
        class="btn btn--ghost"
        :class="['btn--hire', 'btn--hire-' + tierKey]"
        @click="$emit('hire', employee)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        雇佣
      </button>
      <button
        v-else
        class="btn btn--ghost is-danger"
        @click="$emit('release', employee)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        </svg>
        解雇
      </button>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  employee: { type: Object, required: true },
  hireable: { type: Boolean, default: true },
  detail:   { type: Boolean, default: false },
  /* 超级员工 4 大系列对照表（由父组件传入，避免本组件直接读 API） */
  superSeries: { type: Array, default: () => [] },
})
const emit = defineEmits(['hire', 'release'])

const initial = computed(() => (props.employee.name || '?').slice(0, 1))

/* ============================================================
 * 二级分类 · 视觉差异化
 *  - super         超级员工：金色渐变 + 旗舰角标 + 强发光
 *  - professional  专业员工：品牌紫渐变
 * ============================================================ */
const tierKey = computed(() => {
  const k = props.employee.kind
  if (k === 'super') return 'super'
  return 'professional'
})

const tierLabel = computed(() => {
  if (tierKey.value === 'super') return '超级员工'
  return '专业员工'
})

/* 超级员工的 4 大固定系列名 */
const seriesLabel = computed(() => {
  if (tierKey.value !== 'super') return ''
  const hit = props.superSeries.find((s) => s.key === props.employee.series)
  return hit ? hit.label : ''
})

/* 头像渐变按级别走：super = 极光靛紫 / professional = 品牌紫 */
const avatarStyle = computed(() => {
  if (tierKey.value === 'super') {
    return {
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)',
    }
  }
  return {
    background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)',
  }
})

const displayTags = computed(() => {
  const tags = props.employee.tags || props.employee.skills || []
  return tags.slice(0, 4)
})

function formatUsers(n) {
  const num = Number(n) || 0
  if (num >= 10000) return `${(num / 10000).toFixed(1)}w`
  return num.toLocaleString()
}

function formatCalls(n) {
  const num = Number(n) || 0
  if (num >= 10000) return `${(num / 10000).toFixed(1)}万`
  return num.toLocaleString()
}
</script>

<style scoped>
/* ============================================================
 * OrbitalCommand · 员工卡片（Plaza 通用）
 * 设计语言：Brand-Forward Mission Console
 *   - 全部使用系统令牌（--accent / --accent-2 / --ink-*），
 *     不引入任何自定义色，与系统主题 100% 协调
 *   - 头像 = 系统品牌渐变（紫 → 品红），所有卡片统一
 *   - 顶部高亮线 = 品牌渐变，强化品牌识别
 *   - 状态色仅在语义位置出现（审核中 / 已驳回 / 草稿 / 雇佣 / 解雇）
 *   - WCAG AA：正文 ≥ 4.5:1
 * ============================================================ */
.emp-card {
  position: relative;
  padding: 22px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  transition:
    transform var(--dur-fast) var(--ease),
    border-color var(--dur-fast) var(--ease),
    box-shadow var(--dur-fast) var(--ease);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* ---------- 顶部品牌高亮线 · 三级别不同渐变 ---------- */
.emp-card__bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  pointer-events: none;
}
.emp-card--super .emp-card__bar {
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(99, 102, 241, 0.6) 18%,
    rgba(139, 92, 246, 0.85) 50%,
    rgba(139, 92, 246, 0.6) 82%,
    transparent 100%);
  opacity: 0.8;
  height: 2px;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.3);
}
.emp-card--professional .emp-card__bar {
  background: linear-gradient(90deg,
    transparent 0%,
    var(--accent) 35%,
    var(--accent-2) 65%,
    transparent 100%);
  opacity: 0.7;
}

/* ---------- 角标：旗舰 ---------- */
.emp-card__corner {
  position: absolute;
  top: 12px;
  right: -32px;
  transform: rotate(35deg);
  background: rgba(139, 92, 246, 0.85);
  color: #fff;
  font-family: var(--font-mono);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  padding: 3px 36px;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.35);
  z-index: 3;
}
.emp-card__corner svg { width: 11px; height: 11px; }

/* hover：描边切换为品牌色 tint，1px 上浮 */
.emp-card--super:hover {
  transform: translateY(-1px);
  border-color: rgba(139, 92, 246, 0.35);
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.32),
              0 0 0 1px rgba(139, 92, 246, 0.12);
}
.emp-card--professional:hover {
  transform: translateY(-1px);
  border-color: rgba(139, 92, 246, 0.35);
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.32),
              0 0 0 1px rgba(139, 92, 246, 0.12);
}

.emp-card__head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 16px;
  position: relative;
}

/* ---------- 头像：级别化渐变 + 玻璃高光 ---------- */
.emp-card__avatar {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.18);
  overflow: hidden;
  box-shadow:
    0 6px 20px -4px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}
.emp-card--super .emp-card__avatar {
  box-shadow:
    0 4px 14px -2px rgba(139, 92, 246, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  width: 58px;
  height: 58px;
  font-size: 22px;
}
/* 顶部 1.5px 白色刻度线 · 玻璃面板高光 */
.emp-card__avatar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 6px;
  right: 6px;
  height: 1.5px;
  background: rgba(255, 255, 255, 0.45);
  border-radius: 1px;
}
/* 右下极弱高光 */
.emp-card__avatar::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle at 100% 100%, rgba(255, 255, 255, 0.1), transparent 60%);
  pointer-events: none;
}

/* ---------- 状态徽章（语义色，仅在数据存在时显示）---------- */
.emp-card__status {
  position: absolute;
  top: -6px;
  right: -8px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.04em;
  white-space: nowrap;
  z-index: 2;
  background: var(--warn);
  color: #1f1300;
  border: 1px solid rgba(0, 0, 0, 0.25);
}
.emp-card__status.is-reject {
  background: var(--danger);
  color: #fff;
}
.emp-card__status.is-draft {
  background: var(--ink-3);
  color: #0a0c18;
}

/* ---------- 标题区 ---------- */
.emp-card__title {
  flex: 1;
  min-width: 0;
}
.emp-card__name {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.emp-card--super .emp-card__name {
  font-size: 17px;
  color: var(--ink);
  letter-spacing: -0.01em;
}
.emp-card__role {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-3);
  margin-top: 3px;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  gap: 6px;
}
.emp-card__series {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: 10.5px;
  border-radius: 4px;
  background: rgba(139, 92, 246, 0.08);
  color: var(--ink-2);
  border: 1px solid rgba(139, 92, 246, 0.2);
  font-weight: 500;
  letter-spacing: 0.02em;
}

/* ---------- 类型标签：三级差异化 ---------- */
.emp-card__tag {
  position: relative;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  padding: 3px 9px 3px 16px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  flex-shrink: 0;
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0;
  border: 1px solid transparent;
}
.emp-card__tag-dot {
  position: absolute;
  left: 7px;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 5px;
  border-radius: 50%;
}
.emp-card__tag--super {
  background: rgba(139, 92, 246, 0.08);
  color: var(--ink-2);
  border-color: rgba(139, 92, 246, 0.2);
}
.emp-card__tag--super .emp-card__tag-dot {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  box-shadow: 0 0 4px rgba(139, 92, 246, 0.5);
}
.emp-card__tag--professional {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: rgba(139, 92, 246, 0.28);
}
.emp-card__tag--professional .emp-card__tag-dot {
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
}

/* ---------- 描述 ---------- */
.emp-card__desc {
  font-size: 13px;
  color: var(--ink-2);
  line-height: 1.6;
  margin: 0 0 14px;
  min-height: 60px;
}
.emp-card--super .emp-card__desc {
  color: var(--ink-2);
  font-size: 13px;
}

/* ---------- 能力标签：三级差异化 ---------- */
.emp-card__capabilities {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}
.emp-card__cap {
  font-family: var(--font-mono);
  font-size: 10.5px;
  padding: 3px 8px;
  border-radius: 4px;
  letter-spacing: 0.01em;
  transition: all var(--dur-fast) var(--ease);
  border: 1px solid transparent;
}
.emp-card--super .emp-card__cap {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.16), rgba(139, 92, 246, 0.08));
  color: var(--ink);
  border-color: rgba(139, 92, 246, 0.32);
  font-weight: 500;
  position: relative;
}
.emp-card--super .emp-card__cap::before {
  content: '✦';
  font-size: 9px;
  color: #8b5cf6;
  margin-right: 4px;
  opacity: 0.85;
  line-height: 1;
}
.emp-card--super .emp-card__cap:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.28), rgba(139, 92, 246, 0.18));
  color: var(--ink);
  border-color: rgba(139, 92, 246, 0.6);
  box-shadow: 0 2px 8px -2px rgba(139, 92, 246, 0.35);
}
.emp-card--professional .emp-card__cap {
  background: rgba(139, 92, 246, 0.05);
  color: var(--ink-2);
  border-color: rgba(139, 92, 246, 0.15);
}
.emp-card--professional .emp-card__cap:hover {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: rgba(139, 92, 246, 0.5);
}

/* ---------- 元信息 ---------- */
.emp-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  border-top: 1px solid var(--line);
  margin-bottom: 12px;
  font-size: 11.5px;
  color: var(--ink-3);
  font-family: var(--font-mono);
}
.emp-card__meta b {
  color: var(--ink);
  font-weight: 600;
  letter-spacing: 0.01em;
}
.emp-card--super .emp-card__meta {
  border-top-color: rgba(139, 92, 246, 0.22);
}
.emp-card__rating {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.emp-card__rating i {
  color: var(--warn);
  font-style: normal;
}

/* ---------- 操作区 ---------- */
.emp-card__actions {
  display: flex;
  gap: 8px;
}
.emp-card__actions .btn {
  flex: 1;
  justify-content: center;
}
.emp-card__actions .btn.is-danger {
  color: var(--danger);
}
.emp-card__actions .btn.is-danger:hover {
  background: var(--color-danger-bg, rgba(248, 113, 113, 0.1));
  border-color: var(--danger);
}

/* 雇佣按钮按级别着色 */
.btn--hire-super {
  color: var(--ink-2);
  border-color: rgba(139, 92, 246, 0.3);
  background: rgba(139, 92, 246, 0.08);
}
.btn--hire-super:hover {
  color: #fff;
  background: linear-gradient(120deg, #6366f1, #8b5cf6);
  border-color: #8b5cf6;
  box-shadow: 0 6px 22px -4px rgba(139, 92, 246, 0.45);
}

.is-detail { min-height: 0; }
.is-detail .emp-card__desc { min-height: 0; }

@media (max-width: 480px) {
  .emp-card { padding: 18px; }
  .emp-card__head { gap: 10px; margin-bottom: 12px; }
  .emp-card__avatar { width: 44px; height: 44px; font-size: 18px; }
  .emp-card--super .emp-card__avatar { width: 48px; height: 48px; font-size: 20px; }
  .emp-card__desc { min-height: 0; font-size: 12.5px; }
  .emp-card__capabilities { margin-bottom: 12px; }
  .emp-card__corner { right: -36px; padding: 2px 40px; font-size: 9px; }
}
</style>
