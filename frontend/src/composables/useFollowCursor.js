import { ref, onBeforeUnmount } from 'vue'

/**
 * 让一个元素柔和地跟随鼠标移动, 同时始终保持在视口内.
 *
 * 用法:
 *   const elRef = ref(null)
 *   const { enabled, pause, resume, setOffset, setEdgePadding } = useFollowCursor(elRef, {
 *     smoothing: 0.18,    // 0~1, 越大越跟手
 *     edgePadding: 16,    // 距视口边缘最小内边距 (px)
 *     anchor: 'center',   // 'center' | 'cursor' (光标作为锚点)
 *   })
 *
 * 设计要点:
 *  - 使用 requestAnimationFrame + transform 平滑插值, GPU 加速
 *  - 监听 resize / scroll 重新约束位置
 *  - 鼠标悬停在元素自身时自动暂停 (避免与面板交互冲突)
 *  - 提供 pause / resume / enabled 供业务主动控制
 *  - 离开视口(切到其他页面)时自动停止
 */
export function useFollowCursor(elRef, options = {}) {
  const {
    smoothing = 0.18,
    edgePadding = 16,
    anchor = 'center',
  } = options

  const enabled = ref(false)
  const paused = ref(false)
  const isFollowing = ref(false) // 是否正在跟随 (光标进入"激活半径")

  /* 目标位置 (鼠标目标), 当前位置 (插值后实际写入 transform) */
  const target = { x: 0, y: 0 }
  const current = { x: 0, y: 0 }
  let rafId = 0
  let lastMoveAt = 0

  /* 视口尺寸缓存 */
  function viewport() {
    return {
      w: window.innerWidth,
      h: window.innerHeight,
    }
  }

  /* 计算允许的坐标范围 (保证元素不超出视口) */
  function bounds() {
    const el = elRef.value
    if (!el) return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
    const rect = el.getBoundingClientRect()
    const w = rect.width || el.offsetWidth || 0
    const h = rect.height || el.offsetHeight || 0
    const { w: vw, h: vh } = viewport()
    return {
      w, h,
      minX: edgePadding,
      minY: edgePadding,
      maxX: Math.max(edgePadding, vw - w - edgePadding),
      maxY: Math.max(edgePadding, vh - h - edgePadding),
    }
  }

  /* 将 current (左上角坐标) 写入元素 transform */
  function apply() {
    const el = elRef.value
    if (!el) return
    el.style.position = 'fixed'
    el.style.left = '0'
    el.style.top = '0'
    el.style.right = 'auto'
    el.style.bottom = 'auto'
    el.style.willChange = 'transform'
    el.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`
  }

  /* 将 target (基于锚点) 转换为元素左上角, 并夹紧到视口 */
  function clamp() {
    const b = bounds()
    const { w: vw, h: vh } = viewport()
    let x, y
    if (anchor === 'cursor') {
      x = target.x
      y = target.y
    } else {
      x = target.x - b.w / 2
      y = target.y - b.h / 2
    }
    current.x = Math.min(b.maxX, Math.max(b.minX, x))
    current.y = Math.min(b.maxY, Math.max(b.minY, y))
  }

  function tick() {
    if (!enabled.value || paused.value) {
      rafId = 0
      return
    }
    /* 指数平滑 (frame-rate independent 近似) */
    const dx = target.x - (current.x + (anchor === 'cursor' ? 0 : (elRef.value?.offsetWidth || 0) / 2))
    const dy = target.y - (current.y + (anchor === 'cursor' ? 0 : (elRef.value?.offsetHeight || 0) / 2))
    const stepX = dx * smoothing
    const stepY = dy * smoothing
    /* 至少移动 0.5px 才更新, 减少抖动 */
    if (Math.abs(stepX) < 0.5 && Math.abs(stepY) < 0.5) {
      rafId = requestAnimationFrame(tick)
      return
    }
    target.x -= stepX
    target.y -= stepY
    clamp()
    apply()
    rafId = requestAnimationFrame(tick)
  }

  function onMove(e) {
    if (!enabled.value || paused.value) return
    target.x = e.clientX
    target.y = e.clientY
    lastMoveAt = performance.now()
    if (!isFollowing.value) isFollowing.value = true
    if (!rafId) rafId = requestAnimationFrame(tick)
  }

  function onResizeOrScroll() {
    if (!enabled.value) return
    clamp()
    apply()
  }

  function onMouseOver() {
    /* 光标进入面板自身, 暂停跟随, 避免遮挡交互 */
    paused.value = true
  }
  function onMouseOut() {
    if (!enabled.value) return
    paused.value = false
    if (!rafId) rafId = requestAnimationFrame(tick)
  }

  function start() {
    if (enabled.value) return
    const el = elRef.value
    if (!el) return
    enabled.value = true
    paused.value = false
    /* 初始位置: 元素当前所在位置, 然后再插值到鼠标 */
    const rect = el.getBoundingClientRect()
    current.x = rect.left
    current.y = rect.top
    if (anchor === 'center') {
      target.x = rect.left + rect.width / 2
      target.y = rect.top + rect.height / 2
    }
    apply()
    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onMouseOver, { passive: true })
    document.addEventListener('mouseout', onMouseOut, { passive: true })
    window.addEventListener('resize', onResizeOrScroll, { passive: true })
    window.addEventListener('scroll', onResizeOrScroll, { passive: true })
    rafId = requestAnimationFrame(tick)
  }

  function stop() {
    if (!enabled.value) return
    enabled.value = false
    paused.value = false
    isFollowing.value = false
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseover', onMouseOver)
    document.removeEventListener('mouseout', onMouseOut)
    window.removeEventListener('resize', onResizeOrScroll)
    window.removeEventListener('scroll', onResizeOrScroll)
    const el = elRef.value
    if (el) {
      el.style.position = ''
      el.style.left = ''
      el.style.top = ''
      el.style.right = ''
      el.style.bottom = ''
      el.style.transform = ''
      el.style.willChange = ''
    }
  }

  function pause() { paused.value = true }
  function resume() {
    if (!enabled.value) return
    paused.value = false
    if (!rafId) rafId = requestAnimationFrame(tick)
  }

  onBeforeUnmount(stop)

  return { enabled, paused, isFollowing, start, stop, pause, resume }
}
