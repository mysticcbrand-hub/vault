import { useState, useRef, useCallback } from 'react'

// ─── useDragToReorder ─────────────────────────────────────────────────────────
// Premium drag-to-reorder with:
// - Long-press from grip handle to enter drag mode
// - Visual elevation of dragged item
// - Insertion line between items
// - Pointer tracking for smooth reorder
// - Haptic feedback at each slot change
// - Scroll still works everywhere except grip handle
// ─────────────────────────────────────────────────────────────────────────────
export function useDragToReorder({ onReorder }) {
  const [dragIndex, setDragIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)
  const [active, setActive]       = useState(false)

  const containerRef = useRef(null)
  const timerRef     = useRef(null)
  const stateRef     = useRef({ dragIndex: null, overIndex: null, active: false })
  const startPos     = useRef({ x: 0, y: 0 })

  const LONG_PRESS_MS        = 250  // Faster activation for better feel
  const SCROLL_CANCEL_PX     = 6

  const sync = (di, oi, a) => {
    stateRef.current = { dragIndex: di, overIndex: oi, active: a }
    setDragIndex(di)
    setOverIndex(oi)
    setActive(a)
  }

  const slotFromY = (clientY) => {
    if (!containerRef.current) return 0
    const kids = Array.from(containerRef.current.children)
    for (let i = 0; i < kids.length; i++) {
      const r = kids[i].getBoundingClientRect()
      if (clientY < r.top + r.height * 0.55) return i
    }
    return Math.max(0, kids.length - 1)
  }

  const cancelTimer = useCallback(() => {
    clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  const commitDrop = useCallback(() => {
    const { dragIndex: di, overIndex: oi } = stateRef.current
    // Re-enable body scroll
    document.body.style.overflow = ''
    document.body.classList.remove('drag-active')
    sync(null, null, false)
    if (di !== null && oi !== null && di !== oi) onReorder(di, oi)
  }, [onReorder])

  // ── Grip handlers ─────────────────────────────────────────────
  const gripDown = useCallback((index, e) => {
    e.stopPropagation()
    cancelTimer()
    startPos.current = { x: e.clientX, y: e.clientY }

    timerRef.current = setTimeout(() => {
      try { navigator.vibrate(45) } catch (_) {}
      document.body.style.overflow = 'hidden'
      document.body.classList.add('drag-active')
      sync(index, index, true)
    }, LONG_PRESS_MS)
  }, [cancelTimer])

  const gripMove = useCallback((e) => {
    if (stateRef.current.active) return
    if (!timerRef.current) return
    const dy = Math.abs(e.clientY - startPos.current.y)
    if (dy > SCROLL_CANCEL_PX) cancelTimer()
  }, [cancelTimer])

  const gripUp = useCallback(() => {
    cancelTimer()
    if (!stateRef.current.active) return
    commitDrop()
  }, [cancelTimer, commitDrop])

  // ── Container handlers ────────────────────────────────────────
  const containerMove = useCallback((e) => {
    if (!stateRef.current.active) return
    e.preventDefault()
    const slot = slotFromY(e.clientY)
    if (slot !== stateRef.current.overIndex) {
      try { navigator.vibrate(6) } catch (_) {}
      stateRef.current.overIndex = slot
      setOverIndex(slot)
    }
  }, [])

  const containerUp = useCallback(() => {
    if (!stateRef.current.active) return
    commitDrop()
  }, [commitDrop])

  // ── Move up/down — alternative to drag ────────────────────────
  const moveUp = useCallback((index) => {
    if (index <= 0) return
    try { navigator.vibrate(6) } catch (_) {}
    onReorder(index, index - 1)
  }, [onReorder])

  const moveDown = useCallback((totalCount, index) => {
    if (index >= totalCount - 1) return
    try { navigator.vibrate(6) } catch (_) {}
    onReorder(index, index + 1)
  }, [onReorder])

  return {
    containerRef,
    dragIndex,
    overIndex,
    isDragging: active,
    moveUp,
    moveDown,
    gripHandlers: (index) => ({
      onPointerDown:   (e) => gripDown(index, e),
      onPointerMove:   gripMove,
      onPointerUp:     gripUp,
      onPointerCancel: gripUp,
      style: {
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        cursor: active ? 'grabbing' : 'grab',
      },
    }),
    containerHandlers: {
      onPointerMove:   containerMove,
      onPointerUp:     containerUp,
      onPointerCancel: containerUp,
    },
    isActive: active,
  }
}
