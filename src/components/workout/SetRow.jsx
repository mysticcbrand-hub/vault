import { memo, useRef, useState, useCallback, useEffect } from 'react'

const CheckIcon = ({ done }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <polyline
      points="20 6 9 17 4 12"
      stroke={done ? '#000' : 'var(--border2)'}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="24"
      strokeDashoffset={done ? 0 : 24}
      style={{ transition: 'stroke-dashoffset 0.32s ease-out, stroke 0.2s ease' }}
    />
  </svg>
)

// ── Swipe-to-delete wrapper ─────────────────────────────────────────────────
function SwipeableRow({ onDelete, children, canDelete }) {
  const [translateX, setTranslateX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const locked = useRef(false) // scroll vs swipe lock
  const rowRef = useRef(null)
  const DELETE_THRESHOLD = 80

  // Close swipe when tapping outside this row
  useEffect(() => {
    if (translateX >= -10) return
    const handler = (e) => {
      if (rowRef.current && !rowRef.current.contains(e.target)) {
        setTranslateX(0)
      }
    }
    document.addEventListener('pointerdown', handler, true)
    return () => document.removeEventListener('pointerdown', handler, true)
  }, [translateX])

  const handleTouchStart = useCallback((e) => {
    if (!canDelete) return
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    locked.current = false
    setSwiping(false)
  }, [canDelete])

  const handleTouchMove = useCallback((e) => {
    if (!canDelete) return
    const dx = e.touches[0].clientX - startX.current
    const dy = e.touches[0].clientY - startY.current

    // Lock direction on first significant move
    if (!locked.current && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      locked.current = true
      if (Math.abs(dy) > Math.abs(dx)) {
        // Vertical scroll wins — don't interfere
        setSwiping(false)
        return
      }
      setSwiping(true)
    }

    if (!swiping && locked.current) return

    if (dx < 0) {
      // Only allow left swipe
      e.preventDefault()
      setTranslateX(Math.max(dx, -DELETE_THRESHOLD - 20))
    }
  }, [canDelete, swiping])

  const handleTouchEnd = useCallback(() => {
    if (!canDelete) return
    if (translateX < -DELETE_THRESHOLD * 0.6) {
      setTranslateX(-DELETE_THRESHOLD)
    } else {
      setTranslateX(0)
    }
    setSwiping(false)
  }, [canDelete, translateX])


  const isRevealed = translateX < -10

  return (
    <div ref={rowRef} style={{ position: 'relative', overflow: 'hidden', borderRadius: 10 }}>
      {/* Delete action behind */}
      {isRevealed && (
        <div
          onClick={(e) => {
            e.stopPropagation()
            try { navigator.vibrate(12) } catch {}
            onDelete()
            setTranslateX(0)
          }}
          style={{
            position: 'absolute', right: 0, top: 0, bottom: 0,
            width: DELETE_THRESHOLD,
            background: '#EF4444',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 2,
            cursor: 'pointer', borderRadius: 10,
            zIndex: 3,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
          </svg>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#fff', letterSpacing: '0.02em' }}>Eliminar</span>
        </div>
      )}

      {/* Sliding content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: swiping ? 'none' : 'transform 0.25s cubic-bezier(0.32,0.72,0,1)',
          position: 'relative', zIndex: 2,
          background: 'var(--bg, #0C0A09)',
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ── Main SetRow ─────────────────────────────────────────────────────────────
export const SetRow = memo(function SetRow({
  set, setIndex, onUpdate, onComplete, onDelete, isPR, isRepPR, isNext, isDropset,
}) {
  const isCompleted = set.completed

  return (
    <SwipeableRow onDelete={onDelete} canDelete={!!onDelete}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        height: 52, paddingLeft: isDropset ? 0 : 4, paddingRight: 4,
        opacity: isCompleted ? 0.48 : 1,
        transition: 'opacity 0.25s ease',
        background: isCompleted
          ? 'transparent'
          : isDropset
            ? 'rgba(245,158,11,0.04)'
            : isNext ? 'rgba(94,106,210,0.04)' : 'transparent',
        borderRadius: 10,
        borderLeft: isDropset ? '2px solid rgba(245,158,11,0.30)' : 'none',
      }}>

        {/* Dropset connector */}
        {isDropset && (
          <div style={{
            width: 24, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 0, bottom: '50%',
              width: 1, background: 'rgba(245,158,11,0.18)',
            }} />
            <div style={{
              width: 5, height: 5, borderRadius: '50%',
              background: 'rgba(245,158,11,0.45)',
            }} />
          </div>
        )}

        {/* Set # or DROP badge */}
        {isDropset ? (
          <span style={{
            fontSize: 8, fontWeight: 700, letterSpacing: '0.06em',
            padding: '2px 5px', borderRadius: 4,
            background: 'rgba(245,158,11,0.12)', color: 'rgba(245,158,11,0.75)',
            marginRight: 4, flexShrink: 0,
          }}>DROP</span>
        ) : (
          <div style={{
            width: 28, height: 28, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontFamily: 'DM Mono,monospace', fontWeight: 500,
            color: 'var(--text3)', userSelect: 'none',
          }}>
            {setIndex + 1}
          </div>
        )}

        {/* Weight */}
        <input
          type="number" inputMode="decimal"
          className={`set-input ${isNext && !isCompleted ? 'active-cue' : ''}`}
          value={set.weight === 0 ? '' : set.weight}
          placeholder="—"
          disabled={isCompleted}
          onChange={e => onUpdate({ weight: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
          onFocus={e => e.target.select()}
        />

        <span style={{
          width: 22, textAlign: 'center', fontSize: 14,
          color: 'var(--text3)', fontWeight: 500, flexShrink: 0,
        }}>×</span>

        {/* Reps */}
        <input
          type="number" inputMode="numeric"
          className={`set-input reps ${isNext && !isCompleted ? 'active-cue' : ''}`}
          value={set.reps === 0 ? '' : set.reps}
          placeholder="—"
          disabled={isCompleted}
          onChange={e => onUpdate({ reps: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
          onFocus={e => e.target.select()}
          onKeyDown={e => e.key === 'Enter' && onComplete()}
        />

        <div style={{ flex: 1 }} />

        {/* PR badge — amber for e1rm, green for rep PR */}
        {isPR && isCompleted && (
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
            padding: '2px 5px', borderRadius: 5,
            background: isRepPR ? 'var(--green-dim)' : 'var(--amber-dim)',
            color: isRepPR ? 'var(--green)' : 'var(--amber)',
            border: `1px solid ${isRepPR ? 'rgba(52,199,123,0.3)' : 'rgba(245,166,35,0.3)'}`,
            marginRight: 6, flexShrink: 0,
            animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>{isRepPR ? '+REPS' : 'PR'}</span>
        )}

        {/* Check — always tappable (toggle) */}
        <button
          onClick={onComplete}
          className="pressable"
          style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            border: `1.5px solid ${isCompleted ? 'var(--green)' : 'var(--border2)'}`,
            background: isCompleted ? 'var(--green)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s ease, border-color 0.2s ease',
          }}
        >
          <CheckIcon done={isCompleted} />
        </button>
      </div>
    </SwipeableRow>
  )
})
