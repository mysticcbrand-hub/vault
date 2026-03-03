import { useState, useRef, useCallback } from 'react'

// ─── useDragToReorder ─────────────────────────────────────────────────────────
// FIX: drag ONLY from grip handle, scroll works everywhere else.
// - touchAction:'none' ONLY on the grip handle element
// - Container uses touchAction:'pan-y' unless drag is active
// - Long press cancelled if pointer moves > 8px vertically (scroll intent)
// ─────────────────────────────────────────────────────────────────────────────
export function useDragToReorder({ onReorder }) {
  const [dragIndex, setDragIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)
  const [active, setActive]       = useState(false)

  const containerRef = useRef(null)
  const timerRef     = useRef(null)
  const stateRef     = useRef({ dragIndex: null, overIndex: null, active: false })
  const startPos     = useRef({ x: 0, y: 0 })

  const LONG_PRESS_MS        = 320
  const SCROLL_CANCEL_PX     = 8

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
    document.body.style.overflow = ''
    sync(null, null, false)
    if (di !== null && oi !== null && di !== oi) onReorder(di, oi)
  }, [onReorder])

  // ── Grip handlers ─────────────────────────────────────────────
  // touchAction:'none' is set inline on the grip element only
  const gripDown = useCallback((index, e) => {
    e.stopPropagation()
    cancelTimer()
    startPos.current = { x: e.clientX, y: e.clientY }

    timerRef.current = setTimeout(() => {
      try { navigator.vibrate(45) } catch (_) {}
      document.body.style.overflow = 'hidden'
      sync(index, index, true)
    }, LONG_PRESS_MS)
  }, [cancelTimer])

  // Move on grip — cancel if user is scrolling
  const gripMove = useCallback((e) => {
    if (stateRef.current.active) return // already dragging, container handles it
    if (!timerRef.current) return
    const dy = Math.abs(e.clientY - startPos.current.y)
    if (dy > SCROLL_CANCEL_PX) cancelTimer() // scroll intent → cancel drag
  }, [cancelTimer])

  const gripUp = useCallback(() => {
    cancelTimer()
    if (!stateRef.current.active) return
    commitDrop()
  }, [cancelTimer, commitDrop])

  // ── Container handlers ────────────────────────────────────────
  // Only active during drag — safe to preventDefault then
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

  return {
    containerRef,
    dragIndex,
    overIndex,
    isDragging: active,
    // Grip handlers — touchAction:none ONLY here
    gripHandlers: (index) => ({
      onPointerDown:   (e) => gripDown(index, e),
      onPointerMove:   gripMove,
      onPointerUp:     gripUp,
      onPointerCancel: gripUp,
      style: {
        touchAction: 'none',       // ONLY grip blocks scroll
        userSelect: 'none',
        WebkitUserSelect: 'none',
        cursor: 'grab',
      },
    }),
    // Container handlers — pan-y unless actively dragging
    containerHandlers: {
      onPointerMove:   containerMove,
      onPointerUp:     containerUp,
      onPointerCancel: containerUp,
    },
    // Expose active so container can set touchAction conditionally
    isActive: active,
  }
}
