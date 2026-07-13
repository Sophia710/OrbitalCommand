import { onBeforeUnmount, onMounted, unref } from 'vue'

/**
 * 把节点统一解析为原生 DOM 元素：
 *   - ref              → ref.value
 *   - 组件实例 (含 $el) → instance.$el
 *   - 原生 DOM 节点    → 原样
 *   - 空值 / null      → null
 */
function resolveEl(node) {
  if (!node) return null
  const v = unref(node)
  if (!v) return null
  if (v.$el) return v.$el
  if (typeof v === 'object' && v.nodeType === 1) return v
  return v
}

/* node 是否包含 target（包含 node 自身） */
function containsEl(node, target) {
  if (!node || !target) return false
  if (node === target) return true
  if (typeof node.contains === 'function') return node.contains(target)
  return false
}

/**
 * 在点击 / 触摸开始于 target / ignore 列表之外时，触发 handler。
 *
 * 设计要点（按用户要求实现）：
 *  1. 事件委托：监听挂在 document 上，配合 capture 阶段触发，对
 *     动态生成 / 后续挂入 DOM 的元素同样有效（事件在 DOM 树中冒泡前
 *     就已在 document 层被捕获处理）。
 *  2. 同时监听 mousedown + touchstart，兼容 PC（鼠标）与移动端（触屏）。
 *  3. ignore 列表：常用于"触发器"——例如点击 user-chip 触发器的
 *     本身不应被视为"外部点击"，由触发器自己的 @click 负责切换。
 *  4. 仅在组件挂载期间绑定，onBeforeUnmount 自动清理，避免泄漏。
 *  5. 不依赖任何现代 API（addEventListener 第三个参数、所有主流浏览器
 *     自 IE9 起均支持）。
 *
 * @param {import('vue').Ref<HTMLElement>|HTMLElement} target
 *        需要"保护"不触发关闭的元素（浮窗容器）
 * @param {(e: Event) => void} handler
 *        外部点击时的回调
 * @param {Array<import('vue').Ref<HTMLElement>|HTMLElement>} [ignore=[]]
 *        同样视为"内部"的元素（如触发按钮）
 */
export function useClickOutside(target, handler, ignore = []) {
  const onPointer = (e) => {
    const t = e.target
    // 点击发生在保护元素内（含元素自身）→ 忽略
    if (containsEl(resolveEl(target), t)) return
    // 点击发生在忽略列表元素内 → 忽略
    for (const i of ignore) {
      if (containsEl(resolveEl(i), t)) return
    }
    // 真正"外部"才回调
    handler?.(e)
  }

  onMounted(() => {
    // capture: true —— 在事件到达目标前就触发，避免子元素 stopPropagation
    document.addEventListener('mousedown', onPointer, true)
    document.addEventListener('touchstart', onPointer, true)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', onPointer, true)
    document.removeEventListener('touchstart', onPointer, true)
  })
}
