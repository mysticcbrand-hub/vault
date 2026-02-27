import { useRef, useState } from 'react'

function CheckIcon({ completed }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline
        points="20 6 9 17 4 12"
        stroke={completed ? 'var(--green)' : 'var(--border2)'}
        strokeWidth="2.5"
        strokeDasharray="24"
        strokeDashoffset={completed ? 0 : 24}
        style={{ transition: 'stroke-dashoffset 0.3s ease-out, stroke 0.2s ease' }}
      />
    </svg>
  )
}

export function SetRow({ set, setIndex, onUpdate, onComplete, onDelete, isPR }) {
  const longPressTimer = useRef(null)
  const [pressing, setPressing] = useState(false)

  const handleLongPressStart = () => {
    setPressing(true)
    longPressTimer.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(50)
      onDelete?.()
      setPressing(false)
    }, 600)
  }
  const handleLongPressEnd = () => {
    clearTimeout(longPressTimer.current)
    setPressing(false)
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      height: 56, padding: '0 4px',
      opacity: set.completed ? 0.5 : 1,
      transition: 'opacity 0.2s ease',
      background: set.completed ? 'rgba(50,213,131,0.03)' : 'transparent',
      borderRadius: 8,
    }}>
      {/* Set number */}
      <button
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        style={{
          width: 28, height: 28, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontVariantNumeric: 'tabular-nums',
          color: set.completed ? 'var(--green)' : 'var(--text3)',
          background: 'none', border: 'none', cursor: 'pointer',
          fontWeight: 700,
        }}
      >
        {setIndex + 1}
      </button>

      {/* Weight input */}
      <input
        type="number"
        inputMode="decimal"
        className="set-input"
        value={set.weight === 0 ? '' : set.weight}
        placeholder="0"
        disabled={set.completed}
        onChange={e => onUpdate({ weight: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
        onFocus={e => e.target.select()}
        style={{ opacity: set.completed ? 0.6 : 1 }}
      />

      <span style={{ color: 'var(--text3)', fontSize: 16, fontWeight: 500, flexShrink: 0 }}>×</span>

      {/* Reps input */}
      <input
        type="number"
        inputMode="numeric"
        className="set-input"
        value={set.reps === 0 ? '' : set.reps}
        placeholder="0"
        disabled={set.completed}
        onChange={e => onUpdate({ reps: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
        onFocus={e => e.target.select()}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onComplete() } }}
        style={{ opacity: set.completed ? 0.6 : 1 }}
      />

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* PR badge */}
      {isPR && set.completed && (
        <span style={{
          fontSize: 10, fontWeight: 800,
          color: 'var(--amber)',
          background: 'var(--amber-dim)',
          border: '1px solid rgba(245,166,35,0.3)',
          borderRadius: 6, padding: '2px 6px',
          flexShrink: 0,
          animation: 'popIn 0.35s cubic-bezier(0.32,0.72,0,1) both',
        }}>
          PR
        </span>
      )}

      {/* Check button */}
      <button
        onClick={onComplete}
        disabled={set.completed}
        style={{
          width: 40, height: 40, borderRadius: '50%',
          border: `1.5px solid ${set.completed ? 'var(--green)' : 'var(--border2)'}`,
          background: set.completed ? 'rgba(50,213,131,0.15)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: set.completed ? 'default' : 'pointer', flexShrink: 0,
          transition: 'background 0.2s ease, border-color 0.2s ease',
          transform: set.completed ? 'scale(1)' : 'scale(1)',
        }}
      >
        <CheckIcon completed={set.completed} />
      </button>
    </div>
  )
}
