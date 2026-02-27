import { memo, useState, useEffect } from 'react'
import { formatTime } from '../../hooks/useGrawTimer.js'

export const RestTimerPill = memo(function RestTimerPill({ timer }) {
  const { remaining, total, isActive, isExiting, start, addSeconds, skip } = timer
  const [flashing, setFlashing] = useState(false)

  // Flash on completion
  useEffect(() => {
    if (remaining === 0 && isActive) {
      setFlashing(true)
      setTimeout(() => setFlashing(false), 600)
    }
  }, [remaining, isActive])

  if (!isActive && !isExiting) return null

  const ratio = total > 0 ? remaining / total : 0
  const dotColor = ratio > 0.5 ? 'var(--green)' : ratio > 0.25 ? 'var(--accent)' : 'var(--red)'
  const shadowColor = ratio > 0.5
    ? 'rgba(52,199,123,0.18)'
    : ratio > 0.25
      ? 'rgba(232,146,74,0.18)'
      : 'rgba(229,83,75,0.18)'

  return (
    <div
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 68px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 150,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 16px',
        height: 48,
        borderRadius: 100,
        background: 'rgba(20, 16, 10, 0.82)',
        backdropFilter: 'blur(40px) saturate(220%) brightness(1.1)',
        WebkitBackdropFilter: 'blur(40px) saturate(220%) brightness(1.1)',
        boxShadow: `
          inset 0 1px 0 rgba(255,235,200,0.12),
          inset 0 -1px 0 rgba(0,0,0,0.3),
          0 4px 24px rgba(0,0,0,0.5),
          0 0 0 0.5px rgba(255,235,200,0.1),
          0 0 20px ${shadowColor}
        `,
        animation: isExiting
          ? 'pillExit 0.24s cubic-bezier(0.32,0.72,0,1) forwards'
          : 'pillEnter 0.36s cubic-bezier(0.34,1.56,0.64,1) both',
        opacity: flashing ? 0.4 : 1,
        transition: 'opacity 0.15s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {/* Pulse dot */}
      <span style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: dotColor,
        flexShrink: 0,
        animation: 'restPulse 1.4s ease-in-out infinite',
        transition: 'background 0.4s ease',
      }} />

      {/* Timer */}
      <span style={{
        fontSize: 17,
        fontFamily: 'DM Mono, SF Mono, monospace',
        fontWeight: 600,
        color: 'var(--text)',
        letterSpacing: '-0.02em',
        fontVariantNumeric: 'tabular-nums',
        minWidth: 40,
        textAlign: 'center',
      }}>
        {formatTime(remaining)}
      </span>

      {/* −30s */}
      <button
        onClick={() => addSeconds(-30)}
        style={{
          height: 32,
          width: 40,
          borderRadius: 10,
          background: 'rgba(255,235,200,0.07)',
          border: '1px solid rgba(255,235,200,0.1)',
          color: 'var(--text2)',
          fontSize: 12,
          fontFamily: 'DM Mono, monospace',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.1s ease, opacity 0.1s ease',
          flexShrink: 0,
        }}
        onPointerDown={e => { e.currentTarget.style.transform = 'scale(0.92)'; e.currentTarget.style.opacity = '0.7' }}
        onPointerUp={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1' }}
        onPointerLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1' }}
      >
        −30
      </button>

      {/* +30s */}
      <button
        onClick={() => addSeconds(30)}
        style={{
          height: 32,
          width: 40,
          borderRadius: 10,
          background: 'rgba(255,235,200,0.07)',
          border: '1px solid rgba(255,235,200,0.1)',
          color: 'var(--text2)',
          fontSize: 12,
          fontFamily: 'DM Mono, monospace',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.1s ease, opacity 0.1s ease',
          flexShrink: 0,
        }}
        onPointerDown={e => { e.currentTarget.style.transform = 'scale(0.92)'; e.currentTarget.style.opacity = '0.7' }}
        onPointerUp={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1' }}
        onPointerLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1' }}
      >
        +30
      </button>

      {/* Skip */}
      <button
        onClick={skip}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 12,
          color: 'var(--text3)',
          padding: '0 4px',
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        Saltar
      </button>
    </div>
  )
})
