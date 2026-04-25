import { useState, useRef, useCallback, useEffect } from 'react'

// ─── Apple-grade drag-to-reorder ──────────────────────────────────────────
// • Long-press grip (180ms) to activate — prevents accidental drags
// • Items visually displace with CSS transforms (like iOS Reminders)
// • Works with global indices — parent passes canDrag(i) filter
// • Auto-scroll near edges, haptic on slot change
// ──────────────────────────────────────────────────────────────────────────

const LONG_PRESS_MS = 180
const SCROLL_ZONE   = 80
const SCROLL_SPEED  = 6
const CANCEL_MOVE   = 12  // px of movement that cancels pending long-press

export function useDragToReorder({ onReorder, canDrag, scrollContainerRef }) {
  const containerRef = useRef(null)
  const [render, setRender] = useState(0)   // bump to force re-render

  // All mutable state lives in a single ref — no stale closure issues
  const R = useRef({
    phase: 'idle',       // 'idle' | 'pending' | 'active'
    dragIdx: null,       // global index of dragged item
    targetIdx: null,     // global index of drop target
    startY: 0,
    dragItemH: 0,        // height of dragged item
    lpTimer: null,       // long-press timer
    scrollRAF: null,
    listeners: false,    // whether doc listeners are attached
  })

  const rerender = useCallback(() => setRender(n => n + 1), [])

  // ── Measure: find midpoint of draggable children ─────────────
  const slotFromY = useCallback((clientY) => {
    if (!containerRef.current) return null
    const kids = Array.from(containerRef.current.children)
    let best = null, bestDist = Infinity
    for (let i = 0; i < kids.length; i++) {
      if (!canDrag(i)) continue
      const r = kids[i].getBoundingClientRect()
      const mid = r.top + r.height / 2
      const d = Math.abs(clientY - mid)
      if (d < bestDist) { bestDist = d; best = i }
    }
    return best
  }, [canDrag])

  // ── Auto-scroll ──────────────────────────────────────────────
  const stopScroll = useCallback(() => {
    if (R.current.scrollRAF) {
      cancelAnimationFrame(R.current.scrollRAF)
      R.current.scrollRAF = null
    }
  }, [])

  const runScroll = useCallback((clientY) => {
    stopScroll()
    const el = scrollContainerRef?.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const topD = clientY - rect.top
    const botD = rect.bottom - clientY
    let spd = 0
    if (topD < SCROLL_ZONE && topD > 0)      spd = -SCROLL_SPEED * (1 - topD / SCROLL_ZONE)
    else if (botD < SCROLL_ZONE && botD > 0) spd =  SCROLL_SPEED * (1 - botD / SCROLL_ZONE)
    if (Math.abs(spd) < 0.5) return
    const tick = () => { el.scrollTop += spd; R.current.scrollRAF = requestAnimationFrame(tick) }
    R.current.scrollRAF = requestAnimationFrame(tick)
  }, [scrollContainerRef, stopScroll])

  // ── Remove doc listeners ─────────────────────────────────────
  const detach = useCallback(() => {
    if (!R.current.listeners) return
    document.removeEventListener('touchmove', onMove, { passive: false })
    document.removeEventListener('touchend', onEnd)
    document.removeEventListener('touchcancel', onEnd)
    R.current.listeners = false
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── touchmove (document-level) ───────────────────────────────
  // Defined as a stable ref-based function to avoid circular deps
  const onMoveRef = useRef(null)
  const onEndRef  = useRef(null)

  function onMove(e) { onMoveRef.current?.(e) }
  function onEnd()   { onEndRef.current?.()   }

  onMoveRef.current = (e) => {
    const r = R.current
    const touch = e.touches?.[0]
    if (!touch) return

    if (r.phase === 'pending') {
      const dy = Math.abs(touch.clientY - r.startY)
      if (dy > CANCEL_MOVE) {
        // Moved too much before long-press fired → cancel, allow scroll
        clearTimeout(r.lpTimer)
        r.phase = 'idle'; r.dragIdx = null; r.targetIdx = null
        detach()
        rerender()
      }
      return
    }

    if (r.phase !== 'active') return
    e.preventDefault()

    const slot = slotFromY(touch.clientY)
    if (slot !== null && slot !== r.targetIdx) {
      try { navigator.vibrate(3) } catch (_) {}
      r.targetIdx = slot
      rerender()
    }
    runScroll(touch.clientY)
  }

  onEndRef.current = () => {
    const r = R.current
    clearTimeout(r.lpTimer)
    stopScroll()
    document.body.classList.remove('drag-active')

    if (r.phase === 'active' && r.dragIdx !== null && r.targetIdx !== null && r.dragIdx !== r.targetIdx) {
      onReorder(r.dragIdx, r.targetIdx)
    }

    r.phase = 'idle'; r.dragIdx = null; r.targetIdx = null
    detach()
    rerender()
  }

  // ── Grip touch start ─────────────────────────────────────────
  const gripTouchStart = useCallback((globalIdx, e) => {
    e.stopPropagation()
    const touch = e.touches?.[0]
    if (!touch) return

    const r = R.current
    r.startY = touch.clientY
    r.phase = 'pending'
    r.dragIdx = globalIdx
    r.targetIdx = globalIdx

    // Measure dragged item height
    if (containerRef.current) {
      const kid = containerRef.current.children[globalIdx]
      if (kid) r.dragItemH = kid.getBoundingClientRect().height
    }

    // Long-press timer
    r.lpTimer = setTimeout(() => {
      if (r.phase !== 'pending') return
      try { navigator.vibrate(25) } catch (_) {}
      r.phase = 'active'
      document.body.classList.add('drag-active')
      rerender()
    }, LONG_PRESS_MS)

    // Document listeners
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend', onEnd)
    document.addEventListener('touchcancel', onEnd)
    r.listeners = true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rerender, slotFromY])

  // ── Cleanup ──────────────────────────────────────────────────
  useEffect(() => () => {
    clearTimeout(R.current.lpTimer)
    stopScroll()
    detach()
  }, [stopScroll, detach])

  // ── getItemStyle: CSS transform displacement ─────────────────
  const getItemStyle = useCallback((globalIdx) => {
    const r = R.current
    const base = { transition: 'transform 0.28s cubic-bezier(0.32,0.72,0,1), opacity 0.2s ease' }

    if (r.phase !== 'active' || r.dragIdx === null || r.targetIdx === null) return base

    const { dragIdx, targetIdx, dragItemH } = r

    // Dragged item — ghost
    if (globalIdx === dragIdx) {
      return {
        transform: 'scale(0.96)',
        opacity: 0.3,
        zIndex: 0,
        transition: 'transform 0.18s ease, opacity 0.18s ease',
        pointerEvents: 'none',
      }
    }

    // Non-draggable items don't shift
    if (!canDrag(globalIdx)) return base

    const gap = 12
    const shift = dragItemH + gap

    let ty = 0
    if (dragIdx < targetIdx) {
      // Dragging down: items in (dragIdx, targetIdx] shift UP
      if (globalIdx > dragIdx && globalIdx <= targetIdx) ty = -shift
    } else if (dragIdx > targetIdx) {
      // Dragging up: items in [targetIdx, dragIdx) shift DOWN
      if (globalIdx >= targetIdx && globalIdx < dragIdx) ty = shift
    }

    return {
      ...base,
      transform: ty !== 0 ? `translateY(${ty}px)` : 'translateY(0)',
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [render, canDrag])

  // ── Public API ───────────────────────────────────────────────
  return {
    containerRef,
    isDragging: R.current.phase === 'active',
    dragIndex:  R.current.phase === 'active' ? R.current.dragIdx : null,

    gripHandlers: (globalIdx) => ({
      onTouchStart: (e) => gripTouchStart(globalIdx, e),
      style: { touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' },
    }),

    getItemStyle,
  }
}
