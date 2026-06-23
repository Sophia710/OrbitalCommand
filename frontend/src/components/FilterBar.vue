<template>
  <section class="filter-bar">
    <div class="filter-bar__controls">
      <div v-if="search" class="filter-bar__search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <input
          :value="local.q"
          type="text"
          :placeholder="searchPlaceholder"
          @input="onSearchInput"
        />
      </div>

      <template v-for="f in filters" :key="f.key">
        <div v-if="f.type === 'radio'" class="filter-bar__chipgroup">
          <button
            v-for="opt in f.options"
            :key="String(opt.value)"
            type="button"
            class="filter-chip"
            :class="{ 'is-active': local[f.key] === opt.value }"
            @click="onRadioChange(f.key, opt.value)"
          >{{ opt.label }}</button>
        </div>

        <div v-else-if="f.type === 'select'" class="filter-bar__select">
          <span class="filter-bar__chipprompt">{{ f.prompt || '' }}</span>
          <select
            :value="local[f.key]"
            @change="onSelectChange(f.key, $event)"
          >
            <option v-if="f.placeholder" value="">{{ f.placeholder }}</option>
            <option
              v-for="opt in f.options"
              :key="String(opt.value)"
              :value="opt.value"
            >{{ opt.label }}</option>
          </select>
        </div>
      </template>

      <slot name="actions" :state="local" />

      <button
        v-if="hasActive"
        type="button"
        class="filter-bar__reset"
        @click="onReset"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>
        </svg>
        重置
      </button>
    </div>

    <slot name="extra" :state="local" :set="setField" />
  </section>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  search:     { type: Boolean, default: true },
  searchPlaceholder: { type: String, default: '搜索…' },
  filters:    { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue', 'change', 'reset'])

const local = reactive({ q: '', ...props.modelValue })

watch(() => props.modelValue, (v) => Object.assign(local, v), { deep: true })

const hasActive = computed(() => {
  if (local.q) return true
  return props.filters.some(f => local[f.key])
})

function setField(key, value) {
  local[key] = value
  emitChange()
}

function onSearchInput(e) {
  local.q = e.target.value
  emitChange()
}

function onRadioChange(key, value) {
  local[key] = local[key] === value ? '' : value
  emitChange()
}

function onSelectChange(key, e) {
  local[key] = e.target.value
  emitChange()
}

function onReset() {
  Object.keys(local).forEach(k => { local[k] = '' })
  local.pageNo = 1
  emit('reset')
  emitChange()
}

function emitChange() {
  emit('update:modelValue', { ...local })
  emit('change', { ...local })
}
</script>

<style scoped>
.filter-bar {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 14px 18px;
  margin-bottom: 18px;
  backdrop-filter: var(--glass-blur);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease);
}
.filter-bar:focus-within {
  border-color: var(--line-2);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
}
.filter-bar__controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-bar__search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 8px;
  min-width: 240px;
  flex: 0 1 320px;
  transition: border-color var(--dur-fast) var(--ease);
}
.filter-bar__search:focus-within { border-color: var(--accent); }
.filter-bar__search svg {
  width: 14px;
  height: 14px;
  color: var(--ink-3);
  flex-shrink: 0;
}
.filter-bar__search input {
  flex: 1;
  background: transparent;
  border: 0;
  outline: 0;
  font-size: 12.5px;
  color: var(--ink);
  min-width: 0;
}
.filter-bar__search input::placeholder { color: var(--ink-3); }

.filter-bar__chipgroup {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.filter-bar__chipprompt {
  font-size: 12px;
  color: var(--ink-3);
  margin-right: 2px;
}

.filter-chip {
  padding: 5px 12px;
  font-size: 12px;
  color: var(--ink-2);
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 999px;
  transition: all var(--dur-fast) var(--ease);
  cursor: pointer;
  user-select: none;
  font-family: var(--font-body);
  line-height: 1.4;
}
.filter-chip:hover {
  color: var(--ink);
  border-color: var(--line-2);
}
.filter-chip.is-active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--accent) 30%, transparent);
}

.filter-bar__select {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--ink-2);
}
.filter-bar__select select {
  padding: 6px 10px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 6px;
  font-size: 12px;
  color: var(--ink);
  outline: 0;
  transition: border-color var(--dur-fast) var(--ease);
  cursor: pointer;
  font-family: var(--font-body);
  min-height: 30px;
}
.filter-bar__select select:focus { border-color: var(--accent); }

.filter-bar__reset {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  padding: 6px 12px;
  font-size: 12px;
  color: var(--ink-2);
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
  font-family: var(--font-body);
}
.filter-bar__reset:hover {
  color: var(--ink);
  border-color: var(--accent);
}
.filter-bar__reset svg {
  width: 13px;
  height: 13px;
}

@media (max-width: 720px) {
  .filter-bar { padding: 12px 14px; }
  .filter-bar__search { min-width: 0; flex: 1 1 100%; }
  .filter-bar__reset { margin-left: 0; }
  .filter-bar__select { flex: 1 1 calc(50% - 6px); }
  .filter-bar__select select { width: 100%; }
}
</style>
