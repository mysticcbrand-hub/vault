import { useState } from 'react'
import { formatDurationMmSs } from '../../utils/dates.js'

export function RestTimerBar({ timer }) {
  const { active, remaining, total } = timer
  if (!active) return null
  const progress = total > 0 ? remaining / total : 0
  const barColor = progress > 0.5 ? 'var(--green)' : progress > 0.25 ? 'var(--amber)' : 'var(--red)'

  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
      left: 0, right: 0,
      height: 3,
      background: 'rgba(255,255,255,0.06)',
      zIndex: 50,
    }}>
      <div style={{
        height: '100%',
        width: `${progress * 100}%`,
        background: barColor,
        transition: 'width 1s linear, background 0.5s ease',
        borderRadius: '0 2px 2px 0',
      }} />
      {/* Compact label */}
      <div style={{
        position: 'absolute',
        right: 12,
        bottom: 5,
        fontSize: 11,
        fontWeight: 700,
        color: barColor,
        fontVariantNumeric: 'tabular-nums',
        transition: 'color 0.5s ease',
        background: 'var(--bg)',
        padding: '1px 6px',
        borderRadius: 4,
        border: `1px solid ${barColor}`,
        opacity: 0.9,
      }}>
        {formatDurationMmSs(remaining)}
      </div>
    </div>
  )
}
