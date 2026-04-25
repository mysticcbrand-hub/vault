import { useState, useRef, useCallback, useEffect } from 'react'

// ─── useDragToReorder ─────────────────────────────────────────────────────────
// Touch-native drag-to-reorder.
// - Immediate activation from grip handle (no long-press)
// - Document-level touchmove for reliable tracking across elements
// - Auto-scroll near container edges
// - Haptic feedback on slot changes
// ─────────────────────────────────────────────────────────────────────────────

export function useDragToReorder({ onReorder, scrollContainerRef }) {
  const [dragIndex, setDragIndex]     = useState(null)
  const [overIndex, setOverIndex]     = useState(null)
  const [isDragging, setIsDragging]   = useState(false)

  const containerRef  = useRef(null)
  const stateRef      = useRef({ dragIndex: null, overIndex: null, active: false })
  const scrollRAF     = useRef(null)
  const startY        = useRef(0)
  const movedEnough   = useRef(false)

  const ACTIVATE_PX = 8   // pixels of movement before drag activates
  const SCROLL_ZONE = 70  // px from edge to trigger auto-scroll
  const SCROLL_SPEED = 8  // max px/frame

  // ── Sync state ref + React state ───────────────────────────────
  const sync = useCallback((di, oi, active) => {
    stateRef.current = { dragIndex: di, overIndex: oi, active }
    setDragIndex(di)
    setOverIndex(oi)
    setIsDragging(active)
  }, [])

  // ── Determine which slot a Y-coordinate falls on ──────────────
  const slotFromY = useCallback((clientY) => {
    if (!containerRef.current) return 0
    const kids = Array.from(containerRef.current.children)
    for (let i = 0; i < kids.length; i++) {
      const r = kids[i].getBoundingClientRect()
      const mid = r.top + r.height / 2
      if (clientY < mid) return i
    }
    return Math.max(0, kids.length - 1)
  }, [])

  // ── Auto-scroll logic ─────────────────────────────────────────
  const stopAutoScroll = useCallback(() => {
    if (scrollRAF.current) {
      cancelAnimationFrame(scrollRAF.current)
      scrollRAF.current = null
    }
  }, [])

  const startAutoScroll = useCallback((clientY) => {
    stopAutoScroll()
    const scroller = scrollContainerRef?.current || containerRef.current?.closest('[style*="overflow"]') || containerRef.current?.parentElement
    if (!scroller) return

    const rect = scroller.getBoundingClientRect()
    const topDist = clientY - rect.top
    const botDist = rect.bottom - clientY

    let speed = 0
    if (topDist < SCROLL_ZONE && topDist > 0) {
      speed = -SCROLL_SPEED * (1 - topDist / SCROLL_ZONE)
    } else if (botDist < SCROLL_ZONE && botDist > 0) {
      speed = SCROLL_SPEED * (1 - botDist / SCROLL_ZONE)
    }

    if (Math.abs(speed) < 0.5) return

    const tick = () => {
      scroller.scrollTop += speed
      scrollRAF.current = requestAnimationFrame(tick)
    }
    scrollRAF.current = requestAnimationFrame(tick)
  }, [scrollContainerRef, stopAutoScroll])

  // ── Document-level touch handlers (attached only during drag) ─
  const handleDocMove = useCallback((e) => {
    if (!stateRef.current.active && stateRef.current.dragIndex === null) return
    const touch = e.touches[0]
    if (!touch) return

    // Check if we've moved enough to activate
    if (!stateRef.current.active) {
      const dy = Math.abs(touch.clientY - startY.current)
      if (dy < ACTIVATE_PX) return
      // Activate drag
      try { navigator.vibrate(30) } catch (_) {}
      stateRef.current.active = true
      setIsDragging(true)
      document.body.style.overflow = 'hidden'
      document.body.classList.add('drag-active')
    }

    e.preventDefault()

    // Update slot
    const slot = slotFromY(touch.clientY)
    if (slot !== stateRef.current.overIndex) {
      try { navigator.vibrate(4) } catch (_) {}
      stateRef.current.overIndex = slot
      setOverIndex(slot)
    }

    // Auto-scroll
    startAutoScroll(touch.clientY)
  }, [slotFromY, startAutoScroll])

  const handleDocEnd = useCallback(() => {
    stopAutoScroll()
    document.body.style.overflow = ''
    document.body.classList.remove('drag-active')

    const { dragIndex: di, overIndex: oi, active } = stateRef.current
    if (active && di !== null && oi !== null && di !== oi) {
      onReorder(di, oi)
    }

    sync(null, null, false)
    movedEnough.current = false

    // Remove document listeners
    document.removeEventListener('touchmove', handleDocMove, { passive: false })
    document.removeEventListener('touchend', handleDocEnd)
    document.removeEventListener('touchcancel', handleDocEnd)
  }, [onReorder, sync, stopAutoScroll, handleDocMove])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAutoScroll()
      document.removeEventListener('touchmove', handleDocMove, { passive: false })
      document.removeEventListener('touchend', handleDocEnd)
      document.removeEventListener('touchcancel', handleDocEnd)
    }
  }, [stopAutoScroll, handleDocMove, handleDocEnd])

  // ── Grip touch start — initiates potential drag ────────────────
  const gripTouchStart = useCallback((index, e) => {
    e.stopPropagation()
    const touch = e.touches[0]
    if (!touch) return

    startY.current = touch.clientY
    movedEnough.current = false

    // Mark as "pending drag" — will activate after ACTIVATE_PX movement
    stateRef.current = { dragIndex: index, overIndex: index, active: false }
    setDragIndex(index)
    setOverIndex(index)

    // Attach document-level listeners for tracking
    document.addEventListener('touchmove', handleDocMove, { passive: false })
    document.addEventListener('touchend', handleDocEnd)
    document.addEventListener('touchcancel', handleDocEnd)
  }, [handleDocMove, handleDocEnd])

  // ── Public API ─────────────────────────────────────────────────
  return {
    containerRef,
    dragIndex: isDragging ? dragIndex : null,
    overIndex: isDragging ? overIndex : null,
    isDragging,

    gripHandlers: (index) => ({
      onTouchStart: (e) => gripTouchStart(index, e),
      style: {
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
      },
    }),

    // Container only needs ref — no event handlers needed
    containerHandlers: {},
  }
}
