import { memo, useRef } from 'react'

const CheckIcon = ({ done }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <polyline
      points="20 6 9 17 4 12"
      stroke={done ? 'var(--green)' : 'var(--border2)'}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="24"
      strokeDashoffset={done ? 0 : 24}
      style={{ transition: 'stroke-dashoffset 0.32s ease-out, stroke 0.2s ease' }}
    />
  </svg>
)

export const SetRow = memo(function SetRow({ set, setIndex, onUpdate, onComplete, onDelete, isPR, isNext }) {
  const longPress = useRef(null)

  const startLong = () => {
    longPress.current = setTimeout(() => {
      try { navigator.vibrate(50) } catch {}
      onDelete?.()
    }, 600)
  }
  const endLong = () => clearTimeout(longPress.current)

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:0,
      height:52, paddingLeft:4, paddingRight:4,
      opacity: set.completed ? 0.42 : 1,
      transition:'opacity 0.25s ease',
      background: set.completed ? 'transparent' : isNext ? 'rgba(94,106,210,0.04)' : 'transparent',
      borderRadius:10,
    }}>
      {/* Set # */}
      <button
        onTouchStart={startLong} onTouchEnd={endLong}
        onMouseDown={startLong} onMouseUp={endLong} onMouseLeave={endLong}
        style={{
          width:28, height:28, flexShrink:0,
          display:'flex', alignItems:'center', justifyContent:'center',
          background:'none', border:'none', cursor:'pointer',
          fontSize:12, fontFamily:'DM Mono,monospace', fontWeight:500,
          color:'var(--text3)', userSelect:'none',
        }}
      >
        {setIndex+1}
      </button>

      {/* Weight */}
      <input
        type="number" inputMode="decimal"
        className={`set-input ${isNext && !set.completed ? 'active-cue' : ''}`}
        value={set.weight===0?'':set.weight}
        placeholder="—"
        disabled={set.completed}
        onChange={e => onUpdate({weight: e.target.value===''?0:parseFloat(e.target.value)||0})}
        onFocus={e => e.target.select()}
      />

      <span style={{
        width:22, textAlign:'center', fontSize:14,
        color:'var(--text3)', fontWeight:500, flexShrink:0,
      }}>×</span>

      {/* Reps */}
      <input
        type="number" inputMode="numeric"
        className={`set-input reps ${isNext && !set.completed ? 'active-cue' : ''}`}
        value={set.reps===0?'':set.reps}
        placeholder="—"
        disabled={set.completed}
        onChange={e => onUpdate({reps: e.target.value===''?0:parseInt(e.target.value)||0})}
        onFocus={e => e.target.select()}
        onKeyDown={e => e.key==='Enter' && onComplete()}
      />

      <div style={{flex:1}} />

      {/* PR badge */}
      {isPR && set.completed && (
        <span style={{
          fontSize:9, fontWeight:700, letterSpacing:'0.06em',
          padding:'2px 5px', borderRadius:5,
          background:'var(--amber-dim)', color:'var(--amber)',
          border:'1px solid rgba(245,166,35,0.3)',
          marginRight:6, flexShrink:0,
          animation:'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>PR</span>
      )}

      {/* Check */}
      <button
        onClick={onComplete}
        disabled={set.completed}
        className="pressable"
        style={{
          width:44, height:44, borderRadius:12, flexShrink:0,
          border:`1.5px solid ${set.completed ? 'var(--green)' : 'var(--border2)'}`,
          background: set.completed ? 'var(--green-dim)' : 'transparent',
          display:'flex', alignItems:'center', justifyContent:'center',
          cursor: set.completed ? 'default' : 'pointer',
          transition:'background 0.2s ease, border-color 0.2s ease',
        }}
      >
        <CheckIcon done={set.completed} />
      </button>
    </div>
  )
})
