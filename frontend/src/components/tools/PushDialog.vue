﻿<template>
  <el-dialog
    :model-value="modelValue"
    title="消息推送设置"
    width="640px"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="push-dialog">
      <!-- 基础规则 -->
      <section class="push-dialog__section">
        <h4 class="push-dialog__h4">基础规则</h4>
        <div class="push-dialog__grid">
          <div class="push-dialog__field">
            <label>订阅类型</label>
            <select v-model="form.type" class="push-dialog__input">
              <option v-for="t in TYPE_OPTIONS" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div class="push-dialog__field">
            <label>订阅方向</label>
            <select v-model="form.direction" class="push-dialog__input">
              <option value="all">全部</option>
              <option value="gov">政府</option>
              <option value="enterprise">企业</option>
            </select>
          </div>
          <div class="push-dialog__field push-dialog__field--full">
            <label>关键词（多个用逗号分隔）</label>
            <input v-model="form.keywords" class="push-dialog__input" placeholder="如：遥感、卫星、InSAR、北斗" />
          </div>
          <div class="push-dialog__field">
            <label>区域范围</label>
            <input v-model="form.region" class="push-dialog__input" placeholder="如：北京、四川" />
          </div>
          <div class="push-dialog__field">
            <label>数据源</label>
            <select v-model="form.dataSource" class="push-dialog__input">
              <option value="all">全部</option>
              <option v-for="ds in dataSources" :key="ds.id" :value="ds.id">{{ ds.name }}</option>
            </select>
          </div>
          <div class="push-dialog__field">
            <label>更新方式</label>
            <select v-model="form.updateMode" class="push-dialog__input">
              <option value="realtime">实时</option>
              <option value="hourly">每小时</option>
              <option value="daily">每天</option>
              <option value="weekly">每周</option>
            </select>
          </div>
        </div>
      </section>

      <!-- 推送渠道 -->
      <section class="push-dialog__section">
        <h4 class="push-dialog__h4">推送渠道</h4>
        <div class="push-dialog__channel">
          <label class="push-dialog__check">
            <input v-model="form.channels.site" type="checkbox" />
            <span>站内信</span>
          </label>
          <label class="push-dialog__check">
            <input v-model="form.channels.email" type="checkbox" />
            <span>邮件</span>
          </label>
          <label class="push-dialog__check">
            <input v-model="form.channels.im" type="checkbox" />
            <span>企业 IM（飞书 / 钉钉 / 企微）</span>
          </label>
        </div>
        <div v-if="form.channels.email" class="push-dialog__field push-dialog__field--full">
          <label>邮箱</label>
          <input v-model="form.email" class="push-dialog__input" placeholder="例如：user@example.com" />
        </div>
        <div class="push-dialog__row2">
          <div class="push-dialog__field">
            <label>免打扰时段开始</label>
            <input v-model="form.quietStart" type="time" class="push-dialog__input" />
          </div>
          <div class="push-dialog__field">
            <label>免打扰时段结束</label>
            <input v-model="form.quietEnd" type="time" class="push-dialog__input" />
          </div>
        </div>
      </section>

      <!-- 研判规则 -->
      <section class="push-dialog__section">
        <h4 class="push-dialog__h4">研判规则（命中后推送）</h4>
        <ul class="push-dialog__rules">
          <li v-for="r in JUDGMENT_RULES" :key="r.key">
            <label class="push-dialog__check">
              <input v-model="form.rules[r.key]" type="checkbox" />
              <span>{{ r.label }}</span>
            </label>
          </li>
        </ul>
      </section>
    </div>
    <template #footer>
      <!-- <button class="push-dialog__btn" @click="onPreview">预览</button> -->
      <button class="push-dialog__btn" @click="onTest">测试推送</button>
      <button class="push-dialog__btn" @click="$emit('update:modelValue', false)">取消</button>
      <button class="push-dialog__btn push-dialog__btn--primary" @click="onSave">保存</button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, watch, ref, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useToastStore } from '@/stores/toast'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const chat = useChatStore()
const toast = useToastStore()

const TYPE_OPTIONS = ['标讯', '客户', '伙伴', '竞品', '政策', '行业']
const JUDGMENT_RULES = [
  { key: 'highAmount',  label: '金额 ≥ 500 万' },
  { key: 'urgent',      label: '距投标截止 ≤ 7 天' },
  { key: 'gov',         label: '招标方为政府 / 事业单位' },
  { key: 'repeat',      label: '本公司历史中标过的客户再次招标' },
  { key: 'policy',      label: '涉及国家政策导向行业' },
  { key: 'competitive', label: '竞争对手未覆盖' },
]

const form = reactive({
  type: '标讯',
  direction: 'all',
  keywords: '遥感、卫星、InSAR',
  region: '北京、四川、陕西、广东',
  dataSource: 'all',
  updateMode: 'daily',
  channels: { site: true, email: false, im: false },
  email: '',
  quietStart: '22:00',
  quietEnd: '08:00',
  rules: { highAmount: true, urgent: true, gov: true, repeat: false, policy: true, competitive: false },
})

const dataSources = ref([])

const STORAGE_KEY = `marketRadar.push.${chat.employee?.id || 'u_001'}`

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)) } catch (e) { /* ignore */ }
}
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) Object.assign(form, JSON.parse(raw))
  } catch (e) { /* ignore */ }
}

onMounted(() => {
  try {
    const raw = localStorage.getItem(`marketRadar.datasources.${chat.employee?.id || 'u_001'}`)
    if (raw) dataSources.value = JSON.parse(raw)
  } catch (e) { /* ignore */ }
})

watch(() => props.modelValue, (open) => { if (open) load() })

// function onPreview() {
//   const channels = Object.entries(form.channels).filter(([, v]) => v).map(([k]) => k).join('、') || '无'
//   toast.info(`已配置：${form.type} · ${form.updateMode} · 渠道：${channels}`)
// }
function onTest() {
  toast.success('已向「站内信」发送一条测试推送')
}
function onSave() {
  persist()
  toast.success('推送配置已保存')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.push-dialog { display: flex; flex-direction: column; gap: 16px; }
.push-dialog__section {
  padding: 12px 14px;
  background: rgba(148, 163, 184, 0.05);
  border: 1px solid var(--line, rgba(148, 163, 184, 0.16));
  border-radius: 8px;
}
.push-dialog__h4 {
  margin: 0 0 10px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink, #e2e8f0);
  font-family: var(--font-display, system-ui);
  letter-spacing: 0.02em;
}
.push-dialog__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.push-dialog__field { display: flex; flex-direction: column; gap: 4px; }
.push-dialog__field--full { grid-column: 1 / -1; }
.push-dialog__field label {
  font-size: 11.5px;
  color: var(--ink-2, #cbd5e1);
  font-weight: 500;
}
.push-dialog__input {
  padding: 6px 10px;
  border: 1px solid var(--line, rgba(148, 163, 184, 0.2));
  border-radius: 6px;
  background: var(--surface, #0f172a);
  color: var(--ink, #e2e8f0);
  font-size: 12.5px;
  font-family: inherit;
  outline: 0;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.push-dialog__input:focus {
  border-color: var(--accent, #8b5cf6);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
}
.push-dialog__channel {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 10px;
}
.push-dialog__check { display: inline-flex; align-items: center; gap: 5px; font-size: 12.5px; cursor: pointer; }
.push-dialog__check input { width: 14px; height: 14px; }
.push-dialog__rules {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.push-dialog__row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
.push-dialog__btn {
  padding: 5px 12px;
  font-size: 12.5px;
  border: 1px solid var(--line, rgba(148, 163, 184, 0.2));
  background: var(--surface, #0f172a);
  color: var(--ink, #e2e8f0);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.push-dialog__btn:hover { border-color: var(--accent, #8b5cf6); }
.push-dialog__btn--primary {
  background: var(--accent, #8b5cf6);
  color: #fff;
  border-color: var(--accent, #8b5cf6);
}
.push-dialog__btn--primary:hover { filter: brightness(1.1); }
</style>