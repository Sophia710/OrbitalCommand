<template>
  <div class="page page-settings" :class="{ 'view-enter': entering }">
    <header class="page-head">
      <div>
        <h2 class="page-title">系统设置</h2>
        <p class="page-sub">主题外观、模型与权限、审计与备份配置</p>
      </div>
      <button class="btn btn--primary" @click="onSave">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        保存更改
      </button>
    </header>

    <div class="settings-grid">
      <!-- 外观与主题 -->
      <section class="panel">
        <header class="panel__head">
          <div>
            <h3 class="panel__title">外观与主题</h3>
            <p class="panel__sub">调整界面明暗主题</p>
          </div>
        </header>
        <div class="panel__body">
          <div class="setting-item">
            <div>
              <h5>明暗主题</h5>
              <p>深色模式更适合长时间监控，浅色模式适合文档阅读</p>
            </div>
            <div class="seg-toggle">
              <button :class="{ 'is-active': profile.theme === 'dark' }" @click="setTheme('dark')">深色</button>
              <button :class="{ 'is-active': profile.theme === 'light' }" @click="setTheme('light')">浅色</button>
            </div>
          </div>
          <div class="setting-item">
            <div>
              <h5>动态背景</h5>
              <p>启用星轨与极光动效</p>
            </div>
            <div class="seg-toggle">
              <button :class="{ 'is-active': settings.animatedBg }" @click="settings.animatedBg = true">开启</button>
              <button :class="{ 'is-active': !settings.animatedBg }" @click="settings.animatedBg = false">关闭</button>
            </div>
          </div>
        </div>
      </section>

      <!-- 模型与推理 -->
      <section class="panel">
        <header class="panel__head">
          <div>
            <h3 class="panel__title">模型与推理</h3>
            <p class="panel__sub">配置大模型、向量库与白盒推理策略</p>
          </div>
        </header>
        <div class="panel__body">
          <div class="setting-item">
            <div>
              <h5>基础模型</h5>
              <p>默认 Qwen 2.5 72B (开源 · 本地化)</p>
            </div>
            <select v-model="settings.baseModel" class="setting-select">
              <option>Qwen 2.5 72B</option>
              <option>DeepSeek V3</option>
              <option>GLM-4</option>
              <option>Llama 3.3 70B</option>
            </select>
          </div>
          <div class="setting-item">
            <div>
              <h5>白盒推理</h5>
              <p>展示完整的推理步骤与工具调用链路</p>
            </div>
            <div class="seg-toggle">
              <button :class="{ 'is-active': settings.whiteBox }" @click="settings.whiteBox = true">开启</button>
              <button :class="{ 'is-active': !settings.whiteBox }" @click="settings.whiteBox = false">关闭</button>
            </div>
          </div>
          <div class="setting-item">
            <div>
              <h5>向量库</h5>
              <p>Milvus / PGVector 兼容</p>
            </div>
            <div>
              <span class="chip chip--ok">Milvus · 已连接</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 权限与安全 -->
      <section class="panel">
        <header class="panel__head">
          <div>
            <h3 class="panel__title">权限与安全</h3>
            <p class="panel__sub">用户角色、API Key 与审计</p>
          </div>
        </header>
        <div class="panel__body">
          <div class="setting-item">
            <div>
              <h5>默认角色</h5>
              <p>管理员 / 普通用户</p>
            </div>
            <div class="chip-group">
              <span class="chip chip--ok">管理员 · 2 人</span>
              <span class="chip">普通用户 · 18 人</span>
            </div>
          </div>
          <div class="setting-item">
            <div>
              <h5>API Key</h5>
              <p>RESTful API · OpenAPI 3.0 · OAuth 2.0</p>
            </div>
            <button class="btn btn--ghost" @click="onGenKey">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              生成
            </button>
          </div>
          <div class="setting-item">
            <div>
              <h5>备份与快照</h5>
              <p>每日凌晨自动备份 · 保留 30 天</p>
            </div>
            <span class="chip">下次备份：06-18 03:00</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'Settings' })
import { ref, watch, onMounted } from 'vue'
import { getSettings, saveSettings } from '@/api/tasks-files'
import { useAppStore } from '@/stores/app'
import { useToastStore } from '@/stores/toast'

const appStore = useAppStore()
const toast = useToastStore()
const entering = ref(true)

const profile = ref({ name: '', role: 'admin', theme: 'dark', language: 'zh-CN' })
const settings = ref({
  animatedBg: true,
  baseModel: 'Qwen 2.5 72B',
  whiteBox: true,
})

function setTheme(v) {
  profile.value.theme = v
  appStore.theme = v
  appStore.applyTheme()
  localStorage.setItem('oc_theme', v)
}

async function onSave() {
  await saveSettings({
    profile: profile.value,
    models: { default: settings.value.baseModel },
  })
  toast.success('设置已保存')
}

function onGenKey() {
  toast.info('API Key 已生成（示例）')
}

onMounted(() => {
  setTimeout(() => { entering.value = false }, 480)
  getSettings().then((s) => {
    if (s?.profile) profile.value = { ...profile.value, ...s.profile }
  }).catch(() => {})
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

/* ============== GRID ============== */
.settings-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }

/* ============== PANEL ============== */
.panel {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  backdrop-filter: var(--glass-blur);
}
.panel__head {
  display: flex; align-items: flex-end; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid var(--line);
}
.panel__title { margin: 0; font-size: 14px; font-weight: 600; color: var(--ink); font-family: var(--font-display); }
.panel__sub   { margin: 2px 0 0; font-size: 12px; color: var(--ink-3); }
.panel__body  { padding: 0 20px; }

/* ============== SETTING ITEM ============== */
.settings-body, .panel__body { display: flex; flex-direction: column; }
.setting-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 0; border-bottom: 1px solid var(--line); gap: 24px;
}
.setting-item:last-child { border-bottom: 0; }
.setting-item h5 {
  font-size: 14px; font-weight: 600; color: var(--ink); margin: 0 0 4px;
  font-family: var(--font-display);
}
.setting-item p {
  font-size: 12px; color: var(--ink-3); margin: 0;
}

/* ============== SELECT ============== */
.setting-select {
  padding: 8px 12px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--ink);
  font-size: 12.5px;
  font-family: var(--font-body);
  outline: none;
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
  min-width: 160px;
}
.setting-select:hover { border-color: var(--line-2); }
.setting-select:focus { border-color: var(--accent); }

/* ============== SEG TOGGLE ============== */
.seg-toggle {
  display: inline-flex;
  padding: 3px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 8px;
}
.seg-toggle button {
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
.seg-toggle button:hover { color: var(--ink); }
.seg-toggle button.is-active {
  background: var(--surface);
  color: var(--ink);
  box-shadow: var(--shadow-sm);
}

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
.chip--ok {
  background: rgba(74, 222, 128, 0.12);
  color: var(--ok);
  border-color: rgba(74, 222, 128, 0.3);
}
.chip-group { display: inline-flex; gap: 6px; flex-wrap: wrap; }

.view-enter { animation: viewEnter 0.42s var(--ease) both; }
@keyframes viewEnter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
