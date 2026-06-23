<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div
        v-for="t in toast.list"
        :key="t.id"
        :class="['toast', `toast-${t.type}`]"
        @click="toast.remove(t.id)"
      >
        <el-icon class="toast-icon">
          <CircleCloseFilled v-if="t.type === 'error'" />
          <WarningFilled  v-else-if="t.type === 'warning'" />
          <SuccessFilled  v-else-if="t.type === 'success'" />
          <InfoFilled     v-else />
        </el-icon>
        <span class="toast-msg">{{ t.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToastStore } from '@/stores/toast'
import { CircleCloseFilled, WarningFilled, SuccessFilled, InfoFilled } from '@element-plus/icons-vue'
const toast = useToastStore()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 88px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}
.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 240px;
  max-width: 360px;
  padding: 10px 14px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-info);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-lg);
  font-size: 13px;
  pointer-events: auto;
  cursor: pointer;
}
.toast-success { border-left-color: var(--color-success); }
.toast-error   { border-left-color: var(--color-danger); }
.toast-warning { border-left-color: var(--color-warning); }
.toast-info    { border-left-color: var(--color-info); }

.toast-success .toast-icon { color: var(--color-success); }
.toast-error   .toast-icon { color: var(--color-danger); }
.toast-warning .toast-icon { color: var(--color-warning); }
.toast-info    .toast-icon { color: var(--color-info); }
.toast-msg { color: var(--color-text); }

.toast-enter-active, .toast-leave-active {
  transition: all var(--dur-base) var(--ease-spring);
}
.toast-enter-from { opacity: 0; transform: translateX(40px); }
.toast-leave-to   { opacity: 0; transform: translateX(40px); }

@media (max-width: 480px) {
  .toast-container { right: 12px; left: 12px; top: 76px; }
  .toast { min-width: 0; max-width: none; }
}
</style>
