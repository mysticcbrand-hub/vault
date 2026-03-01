import { useRef } from 'react'
import { motion } from 'framer-motion'

// ─── Spring configs ────────────────────────────────────────────────────────────
const LIFT_SPRING   = { type: 'spring', stiffness: 600, damping: 28, mass: 0.8 }
const SETTLE_SPRING = { type: 'spring', stiffness: 500, damping: 32, mass: 1 }
const SHIFT_SPRING  = { type: 'spring', stiffness: 420, damping: 36, mass: 1 }

// ─── GripHandle ───────────────────────────────────────────────────────────────
function GripHandle({ isDragged }) {
  return (
    <motion.div
      animate={{
        scale: isDragged ? 1.2 : 1,
        opacity: isDragged ? 1 : 0.3,
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3.5,
        alignItems: 'center',
        padding: '2px 0',
      }}
    >
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ width: isDragged ? 20 : 14 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 28,
            delay: i * 0.03,
          }}
          style={{
            height: 2,
            borderRadius: 1,
            background: isDragged ? '#E8924A' : 'rgba(245,239,230,0.45)',
          }}
        />
      ))}
    </motion.div>
  )
}

// ─── DraggableCard ────────────────────────────────────────────────────────────
// Wraps any draggable item with lift/float/settle physics.
// The grip area is left-aligned (44px wide). Content is padded left.
// onPointerEnter on the card body triggers slot-swap during drag.
export function DraggableCard({
  index,
  isDragged,
  isDisplaced,
  displacedDir,
  isDragActive,
  onLongPressStart,
  onDragOver,
  onDrop,
  children,
}) {
  const cardRef = useRef(null)

  // ── Variant definitions ──────────────────────────────────────────────────
  const SHADOW_IDLE    = '0 2px 8px rgba(0,0,0,0.32)'
  const SHADOW_LIFTED  = '0 14px 48px rgba(0,0,0,0.62), 0 4px 16px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,235,200,0.14)'
  const SHADOW_DIMMED  = '0 1px 4px rgba(0,0,0,0.22)'

  const tilt = isDragged
    ? (index % 2 === 0 ? 1.4 : -1.4)
    : 0

  const variants = {
    idle: {
      scale: 1,
      rotate: 0,
      y: 0,
      zIndex: 1,
      boxShadow: SHADOW_IDLE,
      opacity: 1,
      transition: SETTLE_SPRING,
    },
    dragging: {
      scale: 1.045,
      rotate: tilt,
      y: -6,
      zIndex: 100,
      boxShadow: SHADOW_LIFTED,
      opacity: 1,
      transition: LIFT_SPRING,
    },
    displaced: {
      scale: 1,
      rotate: 0,
      y: displacedDir * 60,
      zIndex: 1,
      boxShadow: SHADOW_IDLE,
      opacity: 0.82,
      transition: SHIFT_SPRING,
    },
    dimmed: {
      scale: 0.983,
      rotate: 0,
      y: 0,
      zIndex: 1,
      boxShadow: SHADOW_DIMMED,
      opacity: 0.58,
      transition: SETTLE_SPRING,
    },
  }

  const currentVariant = isDragged
    ? 'dragging'
    : isDisplaced
      ? 'displaced'
      : isDragActive
        ? 'dimmed'
        : 'idle'

  return (
    <motion.div
      ref={cardRef}
      layout
      animate={currentVariant}
      variants={variants}
      onPointerEnter={() => { if (isDragActive && !isDragged) onDragOver(index) }}
      style={{
        position: 'relative',
        cursor: isDragged ? 'grabbing' : 'default',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: isDragged ? 'none' : 'pan-y',
        transformOrigin: 'center center',
        willChange: 'transform',
      }}
    >
      {/* ── Grip handle — the only zone that fires long press ── */}
      <div
        onPointerDown={e => {
          e.stopPropagation()
          onLongPressStart(index)
        }}
        onPointerUp={e => {
          e.stopPropagation()
          onDrop()
        }}
        onPointerCancel={e => {
          e.stopPropagation()
          onDrop()
        }}
        onPointerLeave={e => {
          // Only cancel if we haven't started dragging yet
          if (!isDragged) {
            // Cancel the long press timer if pointer leaves grip before threshold
          }
        }}
        style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          cursor: isDragged ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
      >
        <GripHandle isDragged={isDragged} />
      </div>

      {/* ── Card content — padded to avoid grip zone ── */}
      <div style={{ paddingLeft: 44 }}>
        {children}
      </div>

      {/* ── Amber glow border when lifted ── */}
      {isDragged && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            border: '1.5px solid rgba(232,146,74,0.5)',
            background: 'rgba(232,146,74,0.035)',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
      )}
    </motion.div>
  )
}
