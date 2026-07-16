<!--
  OrbitalCommand · 登录
  ----------------------------------------------------------------------
  设计方向：深空指挥中心 · 高密度遥测屏 + 紧凑 HUD 表单
  视觉语言：等宽字体（坐标/时间/代号）+ 玻璃态 + 网格 + 扫描线
  配色：深空黑底 · 信号绿 / 告警红 / 赛博青 · 不使用常见紫粉渐变
-->
<template>
  <div class="login-page" :class="{ 'is-shake': shaking, 'is-loading': auth.loading }">
    <!-- 装饰层：网格 + 扫描线 + 顶部状态条 -->
    <div class="login-deco" aria-hidden="true">
      <div class="login-deco__grid" />
      <div class="login-deco__scan" />
      <div class="login-deco__noise" />
    </div>

    <!-- 顶部 HUD 状态条 -->
    <header class="login-topbar" aria-hidden="true">
      <div class="login-topbar__left">
        <span class="login-topbar__brand">卫星互联网智能专家</span>
        <span class="login-topbar__divider" />
      </div>
      <div class="login-topbar__right">
        <span class="login-topbar__time">{{ nowTime }}</span>
        <span class="login-topbar__dot" />
        <span class="login-topbar__sub">北京时间</span>
        <span class="login-topbar__divider" />
        <span class="login-topbar__chip">已加密</span>
      </div>
    </header>

    <main class="login-shell" role="main">
      <!-- 左侧：遥测台 -->
      <section class="login-telemetry" aria-hidden="true">
        <div class="tele-grid">
          <!-- 标识牌 -->
          <div class="tele-cell tele-cell--brand reveal" data-reveal="0">
            <div class="tele-cell__corner tele-cell__corner--tl" />
            <div class="tele-cell__corner tele-cell__corner--tr" />
            <div class="tele-cell__corner tele-cell__corner--bl" />
            <div class="tele-cell__corner tele-cell__corner--br" />
            <div class="tele-brand">
              <svg class="tele-brand__logo" viewBox="0 0 80 80" fill="none">
                <defs>
                  <linearGradient id="teleG" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#22d3ee" />
                    <stop offset="100%" stop-color="#a78bfa" />
                  </linearGradient>
                </defs>
                <circle cx="40" cy="40" r="5" fill="url(#teleG)" />
                <ellipse cx="40" cy="40" rx="28" ry="10" stroke="url(#teleG)" stroke-width="1.4" opacity="0.85" transform="rotate(30 40 40)" />
                <ellipse cx="40" cy="40" rx="28" ry="10" stroke="url(#teleG)" stroke-width="1.4" opacity="0.55" transform="rotate(-30 40 40)" />
                <ellipse cx="40" cy="40" rx="28" ry="10" stroke="url(#teleG)" stroke-width="1.4" opacity="0.3" />
                <circle cx="65" cy="26" r="2" fill="#22d3ee" />
                <circle cx="17" cy="55" r="1.6" fill="#34d399" />
              </svg>
              <div class="tele-brand__txt">
                <h1>数字员工 · 工作台</h1>
                <p>卫星互联网 · 数字员工 · 一体化平台</p>
              </div>
            </div>

            <!-- 智能对话输入框（纯展示，无交互） -->
            <div ref="promptEl" class="tele-prompt" role="search" aria-label="智能对话输入">
              <div class="tele-prompt__field">
                <span class="tele-prompt__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" />
                    <circle cx="8.5" cy="12" r="1" fill="currentColor" stroke="none" />
                    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
                    <circle cx="15.5" cy="12" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </span>
                <textarea
                  ref="inputEl"
                  class="tele-prompt__input"
                  rows="1"
                  placeholder="请输入您的问题…"
                  aria-label="请输入您的问题"
                  tabindex="-1"
                />
                <button type="button" class="tele-prompt__send" tabindex="-1" aria-label="发送">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 2 11 13" />
                    <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- 雷达扫描 -->
          <div class="tele-cell tele-cell--radar reveal" data-reveal="1">
            <div class="tele-cell__head">
              <span class="tele-cell__title">轨道扫描</span>
              <span class="tele-cell__sub">{{ radarAngle }}°</span>
            </div>
            <div class="radar">
              <div class="radar__rings">
                <span /><span /><span /><span />
              </div>
              <div class="radar__crosshair">
                <span class="radar__crosshair-h" />
                <span class="radar__crosshair-v" />
              </div>
              <div class="radar__sweep" :style="{ transform: `rotate(${radarAngle}deg)` }" />
              <span class="radar__blip radar__blip--1" />
              <span class="radar__blip radar__blip--2" />
              <span class="radar__blip radar__blip--3" />
              <span class="radar__blip radar__blip--4" />
            </div>
            <div class="tele-cell__foot">
              <span class="kpi">在轨 24</span>
              <span class="kpi kpi--ok">链路正常</span>
              <span class="kpi kpi--info">同步 100%</span>
            </div>
          </div>

          <!-- 信号柱 -->
          <div class="tele-cell tele-cell--bars reveal" data-reveal="2">
            <div class="tele-cell__head">
              <span class="tele-cell__title">上行信号</span>
              <span class="tele-cell__sub">-{{ signalDbm }} dBm</span>
            </div>
            <div class="bars">
              <span v-for="(v, i) in bars" :key="i" class="bars__col" :style="{ height: v + '%' }" />
            </div>
            <div class="tele-cell__foot">
              <span class="kpi">Ka 频段</span>
              <span class="kpi kpi--ok">载波在线</span>
            </div>
          </div>

          <!-- 实时事件流 -->
          <div class="tele-cell tele-cell--stream reveal" data-reveal="3">
            <div class="tele-cell__head">
              <span class="tele-cell__title">事件流</span>
              <span class="tele-cell__sub tele-cell__sub--ok">●&nbsp;实时</span>
            </div>
            <ul ref="streamEl" class="stream">
              <li v-for="(evt, i) in visibleStream" :key="evt.id" :class="{ 'is-new': i === 0 }">
                <span class="stream__time">{{ evt.time }}</span>
                <span :class="['stream__code', `stream__code--${evt.level}`]">{{ evt.code }}</span>
                <span class="stream__msg">{{ evt.msg }}</span>
                <span :class="['stream__dot', `stream__dot--${evt.level}`]" :title="levelLabel(evt.level)" aria-hidden="true" />
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- 右侧：登录卡 -->
      <section class="login-card-wrap">
        <div class="login-card reveal" data-reveal="4">
          <!-- HUD 角标 -->
          <span class="login-card__corner login-card__corner--tl" />
          <span class="login-card__corner login-card__corner--tr" />
          <span class="login-card__corner login-card__corner--bl" />
          <span class="login-card__corner login-card__corner--br" />

          <!-- 顶部 ID 牌 -->
          <header class="login-card__head">
            <div class="login-card__id">
              <span class="login-card__id-dot" />
              <span class="login-card__id-txt">安全登录</span>
            </div>
            <h2 class="login-card__title">身份验证</h2>
            <p class="login-card__sub">请使用账号登录以接入工作台</p>
          </header>

          <form class="login-form" autocomplete="on" @submit.prevent="onSubmit">
            <!-- 账号 -->
            <div class="field" :class="{ 'has-error': errors.username, 'is-focus': focusField === 'username' }">
              <label for="login-username" class="field__label">
                <span class="field__label-num">01</span>
                <span>账号</span>
              </label>
              <div class="field__box">
                <span class="field__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="login-username"
                  ref="usernameEl"
                  v-model.trim="form.username"
                  type="text"
                  name="username"
                  autocomplete="username"
                  spellcheck="false"
                  placeholder="请输入账号"
                  :disabled="auth.loading"
                  maxlength="32"
                  @input="clearError('username')"
                  @focus="focusField = 'username'"
                  @blur="onBlurUsername"
                  @keydown.enter.prevent="onSubmit"
                />
                <span class="field__line" />
              </div>
              <transition name="err">
                <p v-if="errors.username" class="field__error">
                  <span>{{ errors.username }}</span>
                </p>
              </transition>
            </div>

            <!-- 密码 -->
            <div class="field" :class="{ 'has-error': errors.password, 'is-focus': focusField === 'password' }">
              <label for="login-password" class="field__label">
                <span class="field__label-num">02</span>
                <span>密码</span>
              </label>
              <div class="field__box">
                <span class="field__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="login-password"
                  v-model="form.password"
                  :type="showPwd ? 'text' : 'password'"
                  name="password"
                  autocomplete="current-password"
                  placeholder="请输入密码"
                  :disabled="auth.loading"
                  maxlength="32"
                  @input="clearError('password')"
                  @focus="focusField = 'password'"
                  @blur="focusField = ''"
                  @keydown.enter.prevent="onSubmit"
                />
                <button
                  type="button"
                  class="field__toggle"
                  :aria-label="showPwd ? '隐藏密码' : '显示密码'"
                  :title="showPwd ? '隐藏密码' : '显示密码'"
                  :disabled="auth.loading"
                  @click="showPwd = !showPwd"
                >
                  <svg v-if="!showPwd" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                </button>
                <span class="field__line" />
              </div>
              <transition name="err">
                <p v-if="errors.password" class="field__error">
                  <span>{{ errors.password }}</span>
                </p>
              </transition>
            </div>

            <!-- 记住我 + 忘记密码 -->
            <div class="login-row">
              <label class="checkbox" :class="{ 'is-disabled': auth.loading }">
                <input v-model="form.remember" type="checkbox" :disabled="auth.loading" />
                <span class="checkbox__box" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none">
                    <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
                <span class="checkbox__label">记住我</span>
                <span class="checkbox__hint">7&nbsp;天内免登录</span>
              </label>
              <button type="button" class="link" :disabled="auth.loading" @click="onForgot">忘记密码&nbsp;?</button>
            </div>

            <!-- 服务端错误（行内） -->
            <transition name="err-server">
              <div v-if="auth.error" class="login-error" role="alert" aria-live="polite">
                <span class="login-error__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="13" />
                    <line x1="12" y1="16.5" x2="12" y2="16.5" />
                  </svg>
                </span>
                <span class="login-error__msg">{{ auth.error }}</span>
              </div>
            </transition>

            <!-- 登录按钮 -->
            <button type="submit" class="btn-login" :disabled="auth.loading" :aria-busy="auth.loading">
              <span v-if="!auth.loading" class="btn-login__txt">
                <span>登&nbsp;&nbsp;录</span>
                <span class="btn-login__arrow">→</span>
              </span>
              <span v-else class="btn-login__loading">
                <span class="btn-login__dots">
                  <span /><span /><span />
                </span>
                <span>登录中</span>
              </span>
            </button>

            <!-- 演示账号提示 -->
            <div class="login-tip">
              <div class="login-tip__row">
                <span class="login-tip__tag">示例</span>
                <span class="login-tip__txt">演示账号</span>
                <code>admin</code>
                <span class="login-tip__sep">·</span>
                <span class="login-tip__txt">密码</span>
                <code>123456</code>
              </div>
              <div class="login-tip__row login-tip__row--alt">
                <span class="login-tip__tag login-tip__tag--alt">示例</span>
                <code>demo</code>
                <span class="login-tip__sep">/</span>
                <code>guest</code>
                <span class="login-tip__txt">均可登录</span>
              </div>
            </div>
          </form>

          <!-- 底部协议 -->
          <footer class="login-card__foot">
            <span>登录即代表您同意</span>
            <a class="link-inline" @click.prevent="onPolicy('service')">《服务协议》</a>
            <span>与</span>
            <a class="link-inline" @click.prevent="onPolicy('privacy')">《隐私政策》</a>
          </footer>
        </div>
      </section>
    </main>

    <!-- 底部状态条 -->
    <footer class="login-footbar" aria-hidden="true">
      <span class="login-footbar__cell">系统版本 v1.0.0</span>
      <span class="login-footbar__cell login-footbar__cell--ok">●&nbsp;所有数字员工运行正常</span>
    </footer>

    <!-- 政策弹窗（演示） -->
    <transition name="modal">
      <div v-if="policyOpen" class="policy-mask" @click.self="policyOpen = false">
        <div class="policy-dialog">
          <header class="policy-dialog__head">
            <h3>{{ policyTitle }}</h3>
            <button class="policy-dialog__close" aria-label="关闭" @click="policyOpen = false">×</button>
          </header>
          <div class="policy-dialog__body">
            <p>本系统为内部演示环境，所有账号、密码及操作记录仅供功能演示之用。</p>
            <p>请勿在生产环境使用演示账号；实际部署请配置强密码与多因素认证。</p>
          </div>
          <footer class="policy-dialog__foot">
            <button class="btn-ghost" @click="policyOpen = false">我知道了</button>
          </footer>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const auth = useAuthStore()
const toast = useToastStore()
const router = useRouter()

const usernameEl = ref(null)
const showPwd = ref(false)
const focusField = ref('')
const shaking = ref(false)
const policyOpen = ref(false)
const policyTitle = ref('服务协议')

const form = reactive({ username: '', password: '', remember: true })
const errors = reactive({ username: '', password: '' })

/* ---------- 顶部时钟 ---------- */
const nowTime = ref('')
let nowTimer = null
function refreshTime() {
  const d = new Date()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  nowTime.value = `${hh}:${mm}:${ss}`
}

/* ---------- 雷达 / 信号柱 / 事件流 ---------- */
const radarAngle = ref(0)
const signalDbm = ref(48)
const bars = ref([40, 55, 35, 70, 50, 60, 45, 65, 55, 75, 50, 40, 60, 70, 45, 55, 65, 50, 60, 40])
let radarTimer = null
function tickTelemetry() {
  radarAngle.value = (radarAngle.value + 6) % 360
  signalDbm.value = 42 + Math.round(Math.random() * 12)
  bars.value = bars.value.map(() => 30 + Math.round(Math.random() * 60))
}

/* ---------- 事件流 ---------- */
const STREAM_TEMPLATES = [
  { code: '信息', level: 'ok',   msg: '星地链路 A 节点握手成功' },
  { code: '存储', level: 'ok',   msg: '遥测数据包 #2487 已归档' },
  { code: '调度', level: 'info', msg: '任务调度池刷新 · 24/24 在线' },
  { code: '知识', level: 'info', msg: '知识库索引更新完成 · +12 篇' },
  { code: '上线', level: 'ok',   msg: '数字员工 · 星小智 上线' },
  { code: '告警', level: 'warn', msg: '存储卷使用率 78% · 注意观察' },
  { code: '链路', level: 'ok',   msg: '信关站 7B · 信号质量优' },
  { code: '推理', level: 'ok',   msg: '推理集群 P99 = 124ms' },
  { code: '审计', level: 'ok',   msg: '审计日志已落盘 · 1024 条' },
]
const stream = ref([])
let streamId = 0
function pushStream() {
  const tpl = STREAM_TEMPLATES[Math.floor(Math.random() * STREAM_TEMPLATES.length)]
  const d = new Date()
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
  const item = { id: ++streamId, time, ...tpl }
  stream.value.unshift(item)
  /* 保留更多原始数据，避免容器变大时丢历史；显示数量由 visibleStream 控制 */
  if (stream.value.length > 24) stream.value.length = 24
}
function seedStream() {
  const d = new Date()
  for (let i = 0; i < 5; i++) {
    const tpl = STREAM_TEMPLATES[Math.floor(Math.random() * STREAM_TEMPLATES.length)]
    const time = `${String(d.getHours()).padStart(2, '0')}:${String((d.getMinutes() - i * 2 + 60) % 60).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
    stream.value.push({ id: ++streamId, time, ...tpl })
  }
}

/* ---------- 事件流：自适应显示数量 ---------- */
const streamEl = ref(null)
const ITEM_HEIGHT = 26      /* 单条 li 占用高度（含 padding + gap） */
const MIN_ITEMS = 2
const MAX_ITEMS_CAP = 12
const maxItems = ref(6)
const visibleStream = computed(() => stream.value.slice(0, maxItems.value))
function levelLabel(level) {
  return ({ ok: '正常', info: '信息', warn: '警告', err: '错误' })[level] || '信息'
}
function recalcMaxItems() {
  if (!streamEl.value) return
  const h = streamEl.value.clientHeight
  if (!h) return
  const n = Math.max(MIN_ITEMS, Math.min(MAX_ITEMS_CAP, Math.floor(h / ITEM_HEIGHT)))
  if (n !== maxItems.value) maxItems.value = n
}
let streamResizeObs = null
function bindStreamObserver() {
  if (!streamEl.value || typeof ResizeObserver === 'undefined') return
  /* 立即执行一次，保证首次渲染即正确 */
  recalcMaxItems()
  streamResizeObs = new ResizeObserver(() => recalcMaxItems())
  streamResizeObs.observe(streamEl.value)
}
function unbindStreamObserver() {
  if (streamResizeObs) {
    streamResizeObs.disconnect()
    streamResizeObs = null
  }
}

/* ---------- 智能对话输入框：textarea 完全填充父容器 ---------- */
const promptEl = ref(null)
const inputEl = ref(null)
/**
 * 由于 textarea 使用 `height: 100%` 填充 field，field 又通过 `flex: 1` 填充 .tele-prompt，
 * .tele-prompt 通过 `flex: 1` 填充 .tele-cell--brand 的可用空间。
 * 当窗口缩放、面板重排导致父容器尺寸变化时，需要重新确认 textarea 高度与 field 一致。
 * 该函数仅做"对齐校验"：必要时强制同步一次高度（覆盖浏览器自动计算）。
 */
function syncInputHeight() {
  const el = inputEl.value
  if (!el) return
  /* CSS 已用 height: 100% 处理，仅在 inline style 被外部覆盖时复位 */
  if (el.style.height && el.style.height !== '100%') {
    el.style.height = '100%'
  }
}
let promptResizeObs = null
function bindPromptObserver() {
  if (!promptEl.value || typeof ResizeObserver === 'undefined') return
  /* 首次触发，确保挂载后 textarea 立即获得正确高度 */
  nextTick(() => syncInputHeight())
  /* 监听父容器尺寸变化（窗口缩放、侧边栏切换等场景） */
  promptResizeObs = new ResizeObserver(() => syncInputHeight())
  promptResizeObs.observe(promptEl.value)
}
function unbindPromptObserver() {
  if (promptResizeObs) {
    promptResizeObs.disconnect()
    promptResizeObs = null
  }
}

/* ---------- Build ID ---------- */
const buildId = ref(`#${Math.random().toString(36).slice(2, 8).toUpperCase()}`)

/* ---------- 验证 ---------- */
function validateUsername(v) {
  if (!v) return '请输入账号'
  if (v.length < 3) return '账号至少 3 个字符'
  if (v.length > 32) return '账号不能超过 32 个字符'
  return ''
}
function validatePassword(v) {
  if (!v) return '请输入密码'
  if (v.length < 5) return '密码至少 5 个字符'
  if (v.length > 32) return '密码不能超过 32 个字符'
  return ''
}
function clearError(key) {
  /* 仅清空本地字段校验错误，保留服务端错误直到下一次提交 */
  if (errors[key]) errors[key] = ''
}
function onBlurUsername() {
  focusField.value = ''
  errors.username = validateUsername(form.username)
}

/* ---------- 抖动 ---------- */
function triggerShake() {
  shaking.value = false
  /* 强制重启动画 */
  requestAnimationFrame(() => {
    shaking.value = true
    setTimeout(() => (shaking.value = false), 520)
  })
}

/* ---------- 提交 ---------- */
async function onSubmit() {
  if (auth.loading) return
  /* 新一次登录尝试开始：清空上次的错误，保证错误信息与新提交绑定 */
  auth.error = ''
  errors.username = ''
  errors.password = ''
  /* 本地校验 */
  const u = validateUsername(form.username)
  const p = validatePassword(form.password)
  errors.username = u
  errors.password = p
  if (u || p) {
    triggerShake()
    nextTick(() => {
      if (u) usernameEl.value?.focus()
    })
    return
  }
  const res = await auth.login({ username: form.username, password: form.password, remember: form.remember })
  if (res?.ok) {
    toast.success(`欢迎回来 · ${auth.displayName}`)
    const target = auth.consumeRedirectAfterLogin() || '/workbench'
    router.replace(target).catch(() => { /* 重复导航忽略 */ })
    return
  }
  /* 登录失败：触发抖动提示，错误信息由 transition 包裹的 div 平滑展示 */
  triggerShake()
  /* 密码错误时清空密码框，焦点回到账号 */
  if (res?.code === 1001 && /密码/.test(res.message)) {
    form.password = ''
    nextTick(() => usernameEl.value?.focus())
  } else {
    nextTick(() => usernameEl.value?.focus())
  }
}

function onForgot() {
  toast.info('请联系系统管理员重置密码')
}
function onPolicy(type) {
  policyTitle.value = type === 'privacy' ? '隐私政策' : '服务协议'
  policyOpen.value = true
}

/* ---------- 生命周期 ---------- */
onMounted(() => {
  refreshTime()
  nowTimer = setInterval(refreshTime, 1000)
  seedStream()
  pushStream()
  radarTimer = setInterval(() => {
    tickTelemetry()
    pushStream()
  }, 1800)
  /* 若已登录则直接放行（保险，正常由路由守卫处理） */
  if (auth.isAuthenticated) {
    const target = auth.consumeRedirectAfterLogin() || '/workbench'
    router.replace(target).catch(() => {})
  }
  /* 事件流自适应 + 输入框高度同步：等 DOM 完成首次布局后再绑定 ResizeObserver 并触发首次计算 */
  nextTick(() => {
    bindStreamObserver()
    bindPromptObserver()
  })
  /* 故意不自动 focus 账号输入框：保持页面加载完成后输入框为非选中状态，
   * 让用户主动点击或通过 Tab 键进入，避免自动抢焦影响体验与可访问性。 */
})
onUnmounted(() => {
  if (nowTimer) clearInterval(nowTimer)
  if (radarTimer) clearInterval(radarTimer)
  unbindStreamObserver()
  unbindPromptObserver()
})
</script>

<style scoped>
/* ============================================================
   LOGIN PAGE · 整体壳
   ============================================================ */
.login-page {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(ellipse 60% 60% at 75% 0%, rgba(34, 211, 238, 0.10) 0%, transparent 55%),
    radial-gradient(ellipse 50% 50% at 0% 100%, rgba(167, 139, 250, 0.10) 0%, transparent 55%),
    radial-gradient(ellipse 80% 80% at 50% 50%, rgba(15, 18, 32, 0.6) 0%, transparent 60%),
    #06070d;
  color: var(--ink);
  font-family: var(--font-body);
  overflow: hidden;
}

/* ---------- 装饰层：网格 / 扫描线 / 噪点 ---------- */
.login-deco { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.login-deco__grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, #000 30%, transparent 90%);
  -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, #000 30%, transparent 90%);
}
.login-deco__scan {
  position: absolute; left: 0; right: 0; top: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.55), transparent);
  animation: scanLine 6s linear infinite;
}
@keyframes scanLine { 0% { top: -2%; } 100% { top: 102%; } }
.login-deco__noise {
  position: absolute; inset: 0; opacity: 0.035;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  mix-blend-mode: overlay;
}

/* ============================================================
   顶部 / 底部状态条
   ============================================================ */
.login-topbar,
.login-footbar {
  position: relative; z-index: 1;
  flex: 0 0 auto;
  display: flex; align-items: center;
  height: 44px;
  padding: 0 24px;
  font-family: var(--font-mono);
  font-size: 11.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-3);
  background: rgba(8, 10, 18, 0.65);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(8px);
}
.login-footbar {
  height: 36px; font-size: 10.5px;
  border-bottom: 0; border-top: 1px solid var(--line);
}
.login-footbar__cell { margin-right: 18px; }
.login-footbar__cell--ok { color: var(--ok); }
.login-topbar__left, .login-topbar__right { display: flex; align-items: center; gap: 12px; }
.login-topbar__right { margin-left: auto; }
.login-topbar__brand {
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: 0.22em;
  /* 纯白 + 文字阴影：与深色 topbar 背景对比度 ≥ 19:1，远超 WCAG AA（4.5:1） */
  color: #FFFFFF;
  font-size: 12.5px;
  text-shadow: 0 0 1px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3);
  -webkit-text-fill-color: #FFFFFF;
  /* 品牌下划线：低饱和青色，既点出品牌识别又不抢眼 */
  border-bottom: 1px solid rgba(34, 211, 238, 0.55);
  padding-bottom: 1px;
}
.login-topbar__divider {
  width: 1px; height: 12px; background: var(--line-2);
}
.login-topbar__sub { color: #c8cee0; }   /* 5.2:1 对比度（原 var(--ink-3) #6f7592 仅 3.1:1） */
.login-topbar__time { color: var(--info); text-shadow: 0 0 6px rgba(34, 211, 238, 0.45); }
.login-topbar__dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--ok);
  box-shadow: 0 0 8px var(--ok);
  animation: pulse 1.6s ease-in-out infinite;
}
@keyframes pulse { 50% { opacity: 0.35; } }
.login-topbar__chip {
  padding: 2px 8px;
  border: 1px solid var(--line-2);
  border-radius: var(--r-pill);
  color: var(--ok);
  background: rgba(52, 211, 153, 0.08);
}

/* ============================================================
   主区：左遥测 / 右登录卡
   ============================================================ */
.login-shell {
  flex: 1 1 auto;
  position: relative; z-index: 1;
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 32px;
  padding: 36px 36px;
  min-height: 0;
}

/* ---------- 左侧：遥测台 ---------- */
.login-telemetry {
  position: relative;
  display: flex;
  min-height: 0;
}
.tele-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    'brand radar'
    'bars  stream';
  gap: 16px;
  min-height: 0;
}
.tele-cell {
  position: relative;
  background:
    linear-gradient(180deg, rgba(20, 24, 42, 0.55), rgba(12, 14, 24, 0.55));
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  padding: 18px 20px;
  backdrop-filter: blur(6px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.tele-cell__corner {
  position: absolute; width: 10px; height: 10px;
  border-color: var(--info);
  opacity: 0.55;
}
.tele-cell__corner--tl { top: 6px; left: 6px; border-top: 1px solid; border-left: 1px solid; }
.tele-cell__corner--tr { top: 6px; right: 6px; border-top: 1px solid; border-right: 1px solid; }
.tele-cell__corner--bl { bottom: 6px; left: 6px; border-bottom: 1px solid; border-left: 1px solid; }
.tele-cell__corner--br { bottom: 6px; right: 6px; border-bottom: 1px solid; border-right: 1px solid; }
.tele-cell__head {
  display: flex; align-items: center; justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-3);
  margin-bottom: 12px;
}
.tele-cell__title { color: var(--ink-2); }
.tele-cell__sub { color: var(--ink); }
.tele-cell__sub--ok { color: var(--ok); }
.tele-cell__foot {
  display: flex; gap: 8px;
  margin-top: auto;
  padding-top: 12px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
}
.kpi {
  padding: 3px 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--line);
  border-radius: var(--r-pill);
  color: var(--ink-3);
}
.kpi--ok { color: var(--ok); border-color: rgba(52, 211, 153, 0.3); background: rgba(52, 211, 153, 0.06); }
.kpi--info { color: var(--info); border-color: rgba(34, 211, 238, 0.3); background: rgba(34, 211, 238, 0.06); }

.tele-cell--brand { grid-area: brand; }
.tele-cell--radar { grid-area: radar; }
.tele-cell--bars  { grid-area: bars; }
.tele-cell--stream { grid-area: stream; min-height: 0; }

.tele-brand { display: flex; align-items: center; gap: 18px; }
.tele-brand__logo { width: 56px; height: 56px; flex: 0 0 56px; }
.tele-brand__txt h1 {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 0.06em;
  background: linear-gradient(135deg, #22d3ee 0%, #a78bfa 60%, #f0abfc 100%);
  -webkit-background-clip: text; background-clip: text;
  color: transparent;
  line-height: 1.1;
}
.tele-brand__txt p {
  margin-top: 6px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.18em;
  color: var(--ink-3);
}

/* ---------- 智能对话输入框（仅展示，无交互） ---------- */
.tele-prompt {
  margin-top: 22px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.tele-prompt__field {
  position: relative;
  display: flex; gap: 8px;
  /* 上下内边距加大以容纳多行文本 */
  padding: 8px 6px 8px 14px;
  background: linear-gradient(180deg, rgba(4, 6, 12, 0.7), rgba(10, 14, 24, 0.7));
  border: 1.5px solid rgba(34, 211, 238, 0.28);
  border-radius: 10px;
  transition: border-color 0.25s var(--ease), box-shadow 0.25s var(--ease), background 0.25s var(--ease), transform 0.25s var(--ease);
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.4),
    inset 0 -1px 0 rgba(255, 255, 255, 0.04),
    0 2px 8px rgba(0, 0, 0, 0.2);
  cursor: text;
  /* 让 field 占据父容器可用空间 */
  flex: 1 1 auto;
  min-height: 56px;
  max-height: 100%;
  /* field 自身作为滚动容器，让内部 sticky 元素（顶部图标 + 底部发送按钮）真正"固定"在视口边缘 */
  overflow: hidden auto;
  overscroll-behavior: contain;
  box-sizing: border-box;
}
.tele-prompt__field:hover {
  border-color: rgba(34, 211, 238, 0.55);
  background: linear-gradient(180deg, rgba(6, 8, 16, 0.78), rgba(12, 16, 28, 0.78));
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.4),
    0 4px 14px rgba(34, 211, 238, 0.1);
}
.tele-prompt__field:focus-within {
  border-color: var(--info);
  background: linear-gradient(180deg, rgba(8, 12, 22, 0.9), rgba(16, 22, 36, 0.9));
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.4),
    0 0 0 3px rgba(34, 211, 238, 0.18),
    0 6px 22px rgba(34, 211, 238, 0.2);
}
.tele-prompt__icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; flex: 0 0 18px;
  color: var(--info);
  opacity: 0.85;
  /* 置顶固定：不随 field 滚动而移动 */
  position: sticky;
  top: 0;
  align-self: flex-start;
  z-index: 2;
  transition: opacity 0.25s var(--ease), transform 0.25s var(--ease);
}
.tele-prompt__icon svg { width: 18px; height: 18px; }
.tele-prompt__field:hover .tele-prompt__icon,
.tele-prompt__field:focus-within .tele-prompt__icon {
  opacity: 1;
  transform: scale(1.08);
}
.tele-prompt__input {
  /* 完全填充 field 可用空间（扣除 padding、border、相邻元素宽度） */
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  height: 100%;
  max-height: 100%;
  resize: none;
  background: transparent;
  border: 0; outline: 0;
  padding: 0 4px;
  color: #FFFFFF;
  font-family: var(--font-body);
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.02em;
  line-height: 1.5;
  caret-color: var(--info);
  -webkit-text-fill-color: #FFFFFF;
  box-sizing: border-box;
  /* 内部滚动：内容超出时显示滚动条，否则隐藏 */
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(34, 211, 238, 0.35) transparent;
  white-space: pre-wrap;
  word-break: break-word;
  /* 滚动时让出顶部空间给 sticky 元素，避免内容被遮挡 */
  scroll-padding-top: 4px;
}
.tele-prompt__input::-webkit-scrollbar { width: 6px; }
.tele-prompt__input::-webkit-scrollbar-track { background: transparent; }
.tele-prompt__input::-webkit-scrollbar-thumb {
  background: rgba(34, 211, 238, 0.35);
  border-radius: 3px;
}
.tele-prompt__input::-webkit-scrollbar-thumb:hover {
  background: rgba(34, 211, 238, 0.55);
}
.tele-prompt__input::placeholder {
  color: #8a90ad;
  font-weight: 400;
  letter-spacing: 0.04em;
}
.tele-prompt__send {
  flex: 0 0 auto;
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 32px;
  background: linear-gradient(135deg, #22d3ee 0%, #a78bfa 100%);
  border: 0;
  border-radius: 7px;
  color: #06070d;
  cursor: pointer;
  /* 置底固定：始终贴在 field 底部右侧，不随 textarea 内容滚动而移动 */
  position: sticky;
  bottom: 0;
  align-self: flex-end;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(34, 211, 238, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.25);
  transition: transform 0.2s var(--ease), box-shadow 0.2s var(--ease), filter 0.2s var(--ease);
}
.tele-prompt__send svg { width: 16px; height: 16px; }
.tele-prompt__send:hover {
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 4px 14px rgba(34, 211, 238, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.35);
  filter: brightness(1.1);
}
.tele-prompt__send:active {
  transform: translateY(0) scale(0.97);
}
@media (max-width: 600px) {
  .tele-prompt { margin-top: 16px; }
  .tele-prompt__field { padding: 6px 4px 6px 12px; min-height: 50px; }
  .tele-prompt__input { font-size: 13px; }
}

/* ---------- 雷达 ---------- */
.radar {
  position: relative;
  flex: 1;
  display: flex; align-items: center; justify-content: center;
  min-height: 160px;
}
.radar__rings {
  position: absolute; inset: 8px;
  border-radius: 50%;
}
.radar__rings span {
  position: absolute; inset: 0; border-radius: 50%;
  border: 1px solid rgba(34, 211, 238, 0.18);
}
.radar__rings span:nth-child(1) { inset: 0; }
.radar__rings span:nth-child(2) { inset: 14%; }
.radar__rings span:nth-child(3) { inset: 28%; }
.radar__rings span:nth-child(4) { inset: 42%; }
.radar__crosshair {
  position: absolute; inset: 0;
  pointer-events: none;
}
.radar__crosshair-h, .radar__crosshair-v {
  position: absolute; background: rgba(34, 211, 238, 0.18);
}
.radar__crosshair-h { top: 50%; left: 0; right: 0; height: 1px; }
.radar__crosshair-v { left: 50%; top: 0; bottom: 0; width: 1px; }
.radar__sweep {
  position: absolute;
  width: 50%; height: 50%;
  top: 50%; left: 50%;
  transform-origin: 0 0;
  background: conic-gradient(from 0deg at 0% 0%, transparent 0deg, rgba(34, 211, 238, 0.35) 35deg, transparent 50deg);
  pointer-events: none;
  transition: transform 1.6s linear;
}
.radar__blip {
  position: absolute;
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--info);
  box-shadow: 0 0 8px var(--info);
  animation: blip 2.4s ease-in-out infinite;
}
.radar__blip--1 { top: 22%; left: 68%; animation-delay: 0s; }
.radar__blip--2 { top: 58%; left: 30%; animation-delay: 0.6s; background: var(--ok); box-shadow: 0 0 8px var(--ok); }
.radar__blip--3 { top: 70%; left: 70%; animation-delay: 1.2s; }
.radar__blip--4 { top: 35%; left: 25%; animation-delay: 1.8s; background: var(--accent-2); box-shadow: 0 0 8px var(--accent-2); }
@keyframes blip { 0%, 100% { opacity: 0.3; transform: scale(0.85); } 50% { opacity: 1; transform: scale(1.15); } }

/* ---------- 信号柱 ---------- */
.bars {
  flex: 1;
  display: flex; align-items: flex-end; justify-content: space-between; gap: 3px;
  min-height: 120px;
  padding: 8px 0;
}
.bars__col {
  flex: 1;
  background: linear-gradient(180deg, var(--info) 0%, rgba(34, 211, 238, 0.25) 100%);
  border-radius: 2px 2px 0 0;
  transition: height 0.6s var(--ease);
  min-height: 8px;
}

/* ---------- 事件流 ---------- */
.stream {
  flex: 1; min-height: 0; overflow: hidden;
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
}
.stream li {
  display: grid; grid-template-columns: 56px 50px 1fr 14px;
  align-items: center; gap: 8px;
  padding: 4px 0;
  color: var(--ink-2);
  border-bottom: 1px dashed rgba(255, 255, 255, 0.04);
  animation: streamIn 0.45s var(--ease);
}
@keyframes streamIn { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: none; } }
.stream__time { color: var(--ink-3); }
.stream__code {
  padding: 1px 5px;
  font-size: 9.5px;
  border-radius: 3px;
  text-align: center;
  letter-spacing: 0.05em;
}
.stream__code--ok   { color: var(--ok);   background: rgba(52, 211, 153, 0.10); border: 1px solid rgba(52, 211, 153, 0.25); }
.stream__code--info { color: var(--info); background: rgba(34, 211, 238, 0.10); border: 1px solid rgba(34, 211, 238, 0.25); }
.stream__code--warn { color: var(--warn); background: rgba(251, 191, 36, 0.10); border: 1px solid rgba(251, 191, 36, 0.25); }
.stream__code--err  { color: var(--danger); background: rgba(248, 113, 113, 0.10); border: 1px solid rgba(248, 113, 113, 0.25); }
/* 右侧状态指示点（每个 li 都有，保证结构一致） */
.stream__dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  justify-self: end;
  display: inline-block;
  background: var(--ink-3);
  flex: 0 0 6px;
}
.stream__dot--ok   { background: var(--ok);   box-shadow: 0 0 6px rgba(52, 211, 153, 0.6); }
.stream__dot--info { background: var(--info); box-shadow: 0 0 6px rgba(34, 211, 238, 0.6); }
.stream__dot--warn { background: var(--warn); box-shadow: 0 0 6px rgba(251, 191, 36, 0.6); }
.stream__dot--err  { background: var(--danger); box-shadow: 0 0 6px rgba(248, 113, 113, 0.6); }
/* 最新一条：脉冲动画，提示"刚刚" */
.stream li.is-new .stream__dot {
  animation: streamDotPulse 1.4s ease-in-out infinite;
}
@keyframes streamDotPulse {
  0%, 100% { transform: scale(1);   opacity: 1; }
  50%      { transform: scale(1.5); opacity: 0.55; }
}
.stream__msg {
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-family: var(--font-body);
  font-size: 11.5px;
  letter-spacing: 0;
}
.stream li.is-new .stream__msg { color: var(--ink); }

/* ============================================================
   右侧：登录卡
   ============================================================ */
.login-card-wrap {
  position: relative;
  display: flex; align-items: center; justify-content: center;
  min-height: 0;
}
.login-card {
  position: relative;
  width: 100%;
  max-width: 440px;
  padding: 36px 36px 28px;
  background:
    linear-gradient(180deg, rgba(22, 26, 46, 0.78), rgba(14, 16, 28, 0.78));
  border: 1px solid var(--line-2);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-lg);
  backdrop-filter: var(--glass-blur);
  overflow: hidden;
}
.login-card::before {
  content: '';
  position: absolute; top: 0; left: 24px; right: 24px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--info), transparent);
  opacity: 0.6;
}
.login-card__corner {
  position: absolute; width: 14px; height: 14px;
  border-color: var(--info);
  opacity: 0.7;
}
.login-card__corner--tl { top: 8px; left: 8px;  border-top: 1px solid; border-left: 1px solid; }
.login-card__corner--tr { top: 8px; right: 8px; border-top: 1px solid; border-right: 1px solid; }
.login-card__corner--bl { bottom: 8px; left: 8px;  border-bottom: 1px solid; border-left: 1px solid; }
.login-card__corner--br { bottom: 8px; right: 8px; border-bottom: 1px solid; border-right: 1px solid; }

.login-card__head { margin-bottom: 24px; }
.login-card__id {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 9px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.18em;
  color: var(--info);
  background: rgba(34, 211, 238, 0.08);
  border: 1px solid rgba(34, 211, 238, 0.25);
  border-radius: var(--r-pill);
  margin-bottom: 14px;
}
.login-card__id-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--info);
  box-shadow: 0 0 6px var(--info);
  animation: pulse 1.6s ease-in-out infinite;
}
.login-card__title {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 0.04em;
  /* 纯白 + 文字阴影：在深色卡片背景上对比度 ≥ 19:1，远超 WCAG AA（4.5:1） */
  color: #FFFFFF;
  text-shadow: 0 0 1px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.25);
  line-height: 1.2;
  -webkit-text-fill-color: #FFFFFF;
}
.login-card__sub {
  margin-top: 6px;
  font-size: 13px;
  color: var(--ink-3);
}

/* ---------- 表单字段 ---------- */
.login-form { display: flex; flex-direction: column; gap: 18px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.field__label {
  display: flex; align-items: center; gap: 10px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-3);
}
.field__label-num {
  color: var(--ink-4);
  font-weight: 600;
}
.field__box {
  position: relative;
  display: flex; align-items: center;
  height: 48px;
  padding: 0 14px;
  background: rgba(8, 10, 18, 0.55);
  border: 1px solid var(--line-2);
  border-radius: var(--r-md);
  transition: border-color 0.2s var(--ease), background 0.2s var(--ease), box-shadow 0.2s var(--ease);
}
.field.is-focus .field__box {
  border-color: var(--info);
  background: rgba(34, 211, 238, 0.04);
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.10);
}
.field.has-error .field__box {
  border-color: var(--danger);
  background: rgba(248, 113, 113, 0.05);
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.10);
}
.field__icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 20px; height: 20px;
  color: var(--ink-3);
  flex: 0 0 20px;
  transition: color 0.2s var(--ease);
}
.field__icon svg { width: 18px; height: 18px; }
.field.is-focus .field__icon { color: var(--info); }
.field.has-error .field__icon { color: var(--danger); }
.field__box input {
  flex: 1;
  height: 100%;
  background: transparent;
  border: 0; outline: 0;
  padding: 0 10px;
  color: #FFFFFF;
  font-family: var(--font-body);
  font-size: 14.5px;
  font-weight: 500;
  letter-spacing: 0.02em;
  caret-color: var(--info);
  -webkit-text-fill-color: #FFFFFF;
}
.field__box input::placeholder { color: #8a90ad; opacity: 1; }
.field__box input:disabled { cursor: not-allowed; opacity: 0.6; }
.field__line {
  position: absolute; left: 14px; right: 14px; bottom: -1px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--info), transparent);
  transform: scaleX(0);
  transform-origin: 50% 50%;
  transition: transform 0.32s var(--ease);
}
.field.is-focus .field__line { transform: scaleX(1); }
.field__toggle {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px;
  background: transparent; border: 0; cursor: pointer;
  color: var(--ink-3);
  border-radius: var(--r-sm);
  transition: color 0.18s var(--ease), background 0.18s var(--ease);
}
.field__toggle:hover:not(:disabled) { color: var(--ink); background: rgba(255, 255, 255, 0.05); }
.field__toggle svg { width: 16px; height: 16px; }
.field__toggle:disabled { opacity: 0.5; cursor: not-allowed; }

.field__error {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px;
  color: var(--danger);
  font-family: var(--font-body);
}
.err-enter-active, .err-leave-active { transition: opacity 0.2s var(--ease), transform 0.2s var(--ease); }
.err-enter-from, .err-leave-to { opacity: 0; transform: translateY(-2px); }

/* 服务端错误：更柔和的渐入/渐出，避免抖动或频闪 */
.err-server-enter-active {
  transition:
    opacity 0.32s var(--ease),
    transform 0.32s var(--ease),
    max-height 0.32s var(--ease),
    margin 0.32s var(--ease),
    padding 0.32s var(--ease);
  overflow: hidden;
}
.err-server-leave-active {
  transition:
    opacity 0.24s var(--ease),
    transform 0.24s var(--ease),
    max-height 0.24s var(--ease),
    margin 0.24s var(--ease),
    padding 0.24s var(--ease);
  overflow: hidden;
}
.err-server-enter-from {
  opacity: 0;
  transform: translateY(-6px);
  max-height: 0;
  margin-top: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.err-server-leave-to {
  opacity: 0;
  transform: translateY(-4px);
  max-height: 0;
  margin-top: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.err-server-enter-to, .err-server-leave-from {
  opacity: 1;
  max-height: 80px;
}

/* ---------- 记住我 + 忘记密码 ---------- */
.login-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: -2px;
}
.checkbox {
  display: inline-flex; align-items: center; gap: 8px;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  color: var(--ink-2);
  transition: color 0.18s var(--ease);
}
.checkbox.is-disabled { opacity: 0.5; cursor: not-allowed; }
.checkbox input { position: absolute; opacity: 0; pointer-events: none; }
.checkbox__box {
  display: inline-flex; align-items: center; justify-content: center;
  width: 16px; height: 16px;
  background: rgba(8, 10, 18, 0.6);
  border: 1px solid var(--line-2);
  border-radius: 4px;
  color: transparent;
  transition: all 0.18s var(--ease);
}
.checkbox__box svg { width: 12px; height: 12px; }
.checkbox input:checked + .checkbox__box {
  background: var(--info);
  border-color: var(--info);
  color: #06070d;
}
.checkbox__hint {
  margin-left: 4px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--ink-4);
  letter-spacing: 0.04em;
}
.checkbox:hover:not(.is-disabled) { color: var(--ink); }
.link {
  background: transparent; border: 0; cursor: pointer; padding: 0;
  font-size: 13px;
  color: var(--ink-3);
  transition: color 0.18s var(--ease);
}
.link:hover:not(:disabled) { color: var(--info); }
.link:disabled { opacity: 0.5; cursor: not-allowed; }

/* ---------- 服务端错误 ---------- */
.login-error {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 13px;
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.32);
  border-left: 3px solid var(--danger);
  border-radius: var(--r-md);
  font-size: 12.5px;
  color: #FFFFFF;
  font-family: var(--font-body);
  box-shadow: 0 4px 14px rgba(248, 113, 113, 0.08);
}
.login-error__icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; flex: 0 0 18px;
  color: var(--danger);
  animation: errIconIn 0.42s var(--ease) both;
}
.login-error__icon svg { width: 18px; height: 18px; }
.login-error__msg { color: #FFFFFF; line-height: 1.45; }
@keyframes errIconIn {
  0%   { opacity: 0; transform: scale(0.6) rotate(-12deg); }
  60%  { opacity: 1; transform: scale(1.08) rotate(0); }
  100% { opacity: 1; transform: scale(1) rotate(0); }
}

/* ---------- 登录按钮 ---------- */
.btn-login {
  position: relative;
  height: 48px;
  margin-top: 4px;
  background:
    linear-gradient(135deg, rgba(34, 211, 238, 0.95) 0%, rgba(139, 92, 246, 0.95) 100%);
  border: 0;
  border-radius: var(--r-md);
  color: #06070d;
  font-family: var(--font-display);
  font-size: 14.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.18s var(--ease), box-shadow 0.18s var(--ease), filter 0.18s var(--ease);
  box-shadow: 0 8px 24px rgba(34, 211, 238, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
.btn-login::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(120deg, transparent 30%, rgba(255, 255, 255, 0.25) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s var(--ease);
}
.btn-login:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(34, 211, 238, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25); }
.btn-login:hover:not(:disabled)::after { transform: translateX(100%); }
.btn-login:active:not(:disabled) { transform: translateY(0); }
.btn-login:disabled { opacity: 0.7; cursor: not-allowed; filter: saturate(0.7); }
.btn-login__txt, .btn-login__loading {
  display: inline-flex; align-items: center; justify-content: center; gap: 12px;
  position: relative; z-index: 1;
}
.btn-login__arrow { font-size: 18px; }
.btn-login__dots { display: inline-flex; gap: 4px; }
.btn-login__dots span {
  width: 6px; height: 6px; border-radius: 50%;
  background: #06070d;
  animation: dotBounce 1.2s ease-in-out infinite;
}
.btn-login__dots span:nth-child(2) { animation-delay: 0.2s; }
.btn-login__dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dotBounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.5; } 40% { transform: translateY(-4px); opacity: 1; } }

/* ---------- 演示提示 ---------- */
.login-tip {
  margin-top: 6px;
  padding: 10px 12px;
  background: rgba(34, 211, 238, 0.04);
  border: 1px dashed rgba(34, 211, 238, 0.25);
  border-radius: var(--r-md);
  font-size: 12px;
  color: var(--ink-2);
  display: flex; flex-direction: column; gap: 4px;
}
.login-tip__row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 11.5px; color: #c8cee0; }
.login-tip__row--alt { font-size: 11px; color: #a8b0c8; }
.login-tip__tag {
  padding: 1px 5px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.1em;
  background: rgba(34, 211, 238, 0.12);
  color: var(--info);
  border: 1px solid rgba(34, 211, 238, 0.3);
  border-radius: 3px;
}
.login-tip__tag--alt { background: rgba(167, 139, 250, 0.10); color: #a78bfa; border-color: rgba(167, 139, 250, 0.3); }
.login-tip__txt { color: #c8cee0; }
.login-tip__sep { color: #8a90ad; }
.login-tip code {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  padding: 2px 7px;
  /* 更扎实的深色背景 + 青色描边 + 纯白文字，确保 WCAG AA（≥4.5:1） */
  background: rgba(8, 10, 18, 0.92);
  border: 1px solid rgba(34, 211, 238, 0.45);
  border-radius: 4px;
  color: #FFFFFF;
  letter-spacing: 0.02em;
  text-shadow: 0 0 1px rgba(0, 0, 0, 0.4);
}

/* ---------- 底部协议 ---------- */
.login-card__foot {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
  text-align: center;
  font-size: 11.5px;
  color: var(--ink-4);
  display: flex; align-items: center; justify-content: center; gap: 4px;
  flex-wrap: wrap;
}
.link-inline {
  color: var(--ink-3);
  cursor: pointer;
  text-decoration: none;
  transition: color 0.18s var(--ease);
}
.link-inline:hover { color: var(--info); }

/* ============================================================
   抖动
   ============================================================ */
.is-shake .login-card { animation: shake 0.5s var(--ease); }
@keyframes shake {
  10%, 90% { transform: translateX(-2px); }
  20%, 80% { transform: translateX(4px); }
  30%, 50%, 70% { transform: translateX(-8px); }
  40%, 60% { transform: translateX(8px); }
}

/* ============================================================
   政策弹窗
   ============================================================ */
.policy-mask {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(2, 4, 10, 0.65);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.policy-dialog {
  width: 100%; max-width: 420px;
  background: linear-gradient(180deg, rgba(22, 26, 46, 0.95), rgba(14, 16, 28, 0.95));
  border: 1px solid var(--line-2);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}
.policy-dialog__head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--line);
}
.policy-dialog__head h3 { font-family: var(--font-display); font-size: 16px; font-weight: 600; color: var(--ink); }
.policy-dialog__close {
  width: 28px; height: 28px;
  background: transparent; border: 0; cursor: pointer;
  color: var(--ink-3); font-size: 22px; line-height: 1;
  border-radius: var(--r-sm);
  transition: all 0.18s var(--ease);
}
.policy-dialog__close:hover { color: var(--ink); background: rgba(255, 255, 255, 0.05); }
.policy-dialog__body { padding: 20px; font-size: 13px; color: var(--ink-2); line-height: 1.7; }
.policy-dialog__body p + p { margin-top: 10px; }
.policy-dialog__foot { padding: 12px 20px 16px; text-align: right; }
.btn-ghost {
  padding: 8px 18px;
  background: transparent;
  border: 1px solid var(--line-2);
  border-radius: var(--r-md);
  color: var(--ink-2);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.18s var(--ease);
}
.btn-ghost:hover { color: var(--ink); border-color: var(--info); background: rgba(34, 211, 238, 0.06); }
.modal-enter-active, .modal-leave-active { transition: opacity 0.22s var(--ease); }
.modal-enter-active .policy-dialog, .modal-leave-active .policy-dialog { transition: transform 0.28s var(--ease-out), opacity 0.22s var(--ease); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .policy-dialog, .modal-leave-to .policy-dialog { transform: translateY(12px) scale(0.96); opacity: 0; }

/* ============================================================
   入场动画
   ============================================================ */
.reveal {
  opacity: 0;
  transform: translateY(12px);
  animation: reveal 0.7s var(--ease-out) forwards;
}
.reveal[data-reveal='0'] { animation-delay: 0.05s; }
.reveal[data-reveal='1'] { animation-delay: 0.18s; }
.reveal[data-reveal='2'] { animation-delay: 0.32s; }
.reveal[data-reveal='3'] { animation-delay: 0.46s; }
.reveal[data-reveal='4'] { animation-delay: 0.6s; }
@keyframes reveal {
  to { opacity: 1; transform: none; }
}

/* ============================================================
   响应式
   ============================================================ */
@media (max-width: 1024px) {
  .login-shell { grid-template-columns: 1fr; gap: 16px; padding: 20px; }
  .login-telemetry { display: none; }
  .login-card { max-width: 480px; }
}
@media (max-width: 600px) {
  .login-topbar, .login-footbar { padding: 0 14px; font-size: 10px; }
  .login-topbar__sub { display: none; }
  .login-card { padding: 26px 22px 22px; }
  .login-card__title { font-size: 22px; }
}
</style>
