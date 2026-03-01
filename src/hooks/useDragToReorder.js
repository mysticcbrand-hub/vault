import { useState, useRef, useCallback } from 'react'

// ─── useDragToReorder ─────────────────────────────────────────────────────────
// Apple home screen-style drag-to-reorder engine.
// Long press (320ms) lifts a card. Drag over others to shift them.
// Release snaps card to new position with spring physics.
// Works on touch (iOS Safari) and mouse (desktop).
// ─────────────────────────────────────────────────────────────────────────────
export function useDragToReorder({ items, onReorder }) {
  const [dragIndex, setDragIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const longPressTimer = useRef(null)
  const hasMoved       = useRef(false)

  // Compute visual order during drag — item at dragIndex floats to overIndex slot
  const getVisualOrder = useCallback(() => {
    if (dragIndex === null || overIndex === null)
      return items.map((_, i) => i)
    const order = items.map((_, i) => i).filter(i => i !== dragIndex)
    order.splice(overIndex, 0, dragIndex)
    return order
  }, [dragIndex, overIndex, items])

  // Long press — fire after 320ms hold without movement
  const startLongPress = useCallback((index) => {
    hasMoved.current = false
    longPressTimer.current = setTimeout(() => {
      try { navigator.vibrate(40) } catch (_) {}
      setDragIndex(index)
      setOverIndex(index)
      setIsDragging(true)
    }, 320)
  }, [])

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  // Called as pointer moves over other cards
  const handleDragOver = useCallback((index) => {
    if (!isDragging) return
    if (index !== overIndex) {
      try { navigator.vibrate(8) } catch (_) {} // micro haptic on each swap
      setOverIndex(index)
    }
  }, [isDragging, overIndex])

  // Drop — commit the reorder
  const handleDrop = useCallback(() => {
    cancelLongPress()
    if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
      const next = [...items]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(overIndex, 0, moved)
      onReorder(next)
    }
    setDragIndex(null)
    setOverIndex(null)
    setIsDragging(false)
    hasMoved.current = false
  }, [dragIndex, overIndex, items, onReorder, cancelLongPress])

  return {
    dragIndex,
    overIndex,
    isDragging,
    getVisualOrder,
    startLongPress,
    cancelLongPress,
    handleDragOver,
    handleDrop,
  }
}
