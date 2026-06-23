<template>
  <li class="tree-node" :class="{ 'is-folder': node.type === 'folder' }">
    <div
      class="tree-row"
      :class="{ 'is-selected': node.type === 'file' && selected === node.name }"
      :style="{ paddingLeft: (level * 14 + 8) + 'px' }"
      @click="onClick"
    >
      <!-- 展开箭头（仅文件夹） -->
      <span
        v-if="node.type === 'folder'"
        class="tree-row__caret"
        :class="{ 'is-open': isOpen }"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </span>
      <span v-else class="tree-row__caret tree-row__caret--blank" />

      <!-- 图标 -->
      <span class="tree-row__icon" :class="'is-' + (node.icon || (node.type === 'folder' ? 'folder' : 'doc'))">
        <svg v-if="node.type === 'folder'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path v-if="!isOpen" d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          <path v-else d="M3 7v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2H5a2 2 0 0 1-2-2V5a2 2 0 0 0-2 2z" />
          <path v-if="!isOpen" d="M3 7h18l-2-2" />
        </svg>
        <svg v-else-if="node.icon === 'ppt'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <rect x="8" y="13" width="8" height="4" rx="0.5" />
        </svg>
        <svg v-else-if="node.icon === 'doc'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="16" y2="17" />
          <line x1="8" y1="9" x2="10" y2="9" />
        </svg>
        <svg v-else-if="node.icon === 'md'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M9 14l1.5 2L13 13l3 4" />
        </svg>
        <svg v-else-if="node.icon === 'js'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <text x="9" y="18" font-size="6" font-weight="700" fill="currentColor" stroke="none">JS</text>
        </svg>
        <svg v-else-if="node.icon === 'json'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <text x="7" y="18" font-size="5" font-weight="700" fill="currentColor" stroke="none">{ }</text>
        </svg>
        <svg v-else-if="node.icon === 'py'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <text x="8" y="18" font-size="6" font-weight="700" fill="currentColor" stroke="none">PY</text>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      </span>

      <span class="tree-row__name">{{ node.name }}</span>
      <span v-if="node.size" class="tree-row__size">{{ node.size }}</span>
    </div>

    <!-- 递归子节点 -->
    <ul v-if="node.type === 'folder' && isOpen && node.children" class="tree-node__children">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        :expanded="expanded"
        :selected="selected"
        @toggle="$emit('toggle', $event)"
        @select="$emit('select', $event)"
      />
    </ul>
  </li>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  node:     { type: Object, required: true },
  level:    { type: Number, default: 0 },
  expanded: { type: Object, default: () => ({}) },
  selected: { type: String, default: '' },
})
const emit = defineEmits(['toggle', 'select'])

const isOpen = computed(() => !!props.expanded[props.node.id])

function onClick() {
  if (props.node.type === 'folder') {
    emit('toggle', props.node.id)
  } else {
    emit('select', props.node)
  }
}
</script>

<style scoped>
.tree-node { list-style: none; }
.tree-node__children { list-style: none; margin: 0; padding: 0; }
.tree-row {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding-right: 10px;
  font-size: 12px;
  color: var(--ink-2);
  border-radius: 6px;
  cursor: pointer;
  transition: background 120ms var(--ease), color 120ms var(--ease);
  user-select: none;
  font-family: var(--font-mono);
  letter-spacing: 0.01em;
}
.tree-row:hover {
  background: var(--surface-2);
  color: var(--ink);
}
.tree-row.is-selected {
  background: var(--accent-soft);
  color: var(--accent);
}
.tree-row__caret {
  width: 14px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-3);
  transition: transform 160ms var(--ease), color 160ms var(--ease);
  flex-shrink: 0;
}
.tree-row__caret svg { width: 10px; height: 10px; }
.tree-row__caret.is-open { transform: rotate(90deg); color: var(--ink-2); }
.tree-row__caret--blank { visibility: hidden; }

.tree-row__icon {
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tree-row__icon svg { width: 14px; height: 14px; }
.tree-row__icon.is-folder { color: var(--accent); }
.tree-row__icon.is-ppt   { color: var(--danger); }
.tree-row__icon.is-doc   { color: var(--info); }
.tree-row__icon.is-md    { color: var(--ink-2); }
.tree-row__icon.is-js    { color: var(--warn); }
.tree-row__icon.is-json  { color: var(--ok); }
.tree-row__icon.is-py    { color: var(--magenta); }

.tree-row__name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tree-row__size {
  font-size: 10.5px;
  color: var(--ink-3);
  font-family: var(--font-mono);
  flex-shrink: 0;
}
.tree-row.is-selected .tree-row__size { color: var(--accent); opacity: 0.7; }
</style>
