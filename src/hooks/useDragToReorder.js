import { useState, useRef, useCallback } from 'react'

// ─── useDragToReorder ─────────────────────────────────────────────────────────
// Y-position based engine. Works on iOS Safari.
// Grip element fires longpress → card lifts.
// onPointerMove on the CONTAINER reads clientY → computes slot from DOM rects.
// No onPointerEnter — that breaks on touch.
// ─────────────────────────────────────────────────────────────────────────────
export function useDragToReorder({ onReorder }) {
  const [dragIndex, setDragIndex]   = useState(null)
  const [overIndex, setOverIndex]   = useState(null)
  const [active, setActive]         = useState(false)

  const containerRef  = useRef(null)
  const timerRef      = useRef(null)
  const stateRef      = useRef({ dragIndex: null, overIndex: null, active: false })

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

  const cancel = useCallback(() => {
    clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  // Grip pointerdown — start long press countdown
  const gripDown = useCallback((index, e) => {
    e.stopPropagation()
    cancel()
    timerRef.current = setTimeout(() => {
      try { navigator.vibrate(45) } catch (_) {}
      document.body.style.overflow = 'hidden'
      sync(index, index, true)
    }, 300)
  }, [cancel])

  // Grip pointerup before threshold — cancel
  const gripUp = useCallback(() => {
    cancel()
    if (!stateRef.current.active) return
    const { dragIndex: di, overIndex: oi } = stateRef.current
    document.body.style.overflow = ''
    sync(null, null, false)
    if (di !== null && oi !== null && di !== oi) onReorder(di, oi)
  }, [cancel, onReorder])

  // Container pointermove — drives the over-slot detection
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

  // Container pointerup/cancel — commit drop
  const containerUp = useCallback(() => {
    if (!stateRef.current.active) return
    const { dragIndex: di, overIndex: oi } = stateRef.current
    document.body.style.overflow = ''
    sync(null, null, false)
    if (di !== null && oi !== null && di !== oi) onReorder(di, oi)
  }, [onReorder])

  return {
    containerRef,
    dragIndex,
    overIndex,
    isDragging: active,
    gripHandlers: (index) => ({
      onPointerDown: (e) => gripDown(index, e),
      onPointerUp:   gripUp,
      onPointerCancel: gripUp,
      style: { touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' },
    }),
    containerHandlers: {
      onPointerMove:   containerMove,
      onPointerUp:     containerUp,
      onPointerCancel: containerUp,
    },
  }
}
