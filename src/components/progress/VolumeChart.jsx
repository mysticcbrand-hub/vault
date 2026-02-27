import { useMemo, useState } from 'react'
import { getWeeklyVolume } from '../../utils/volume.js'
import { formatKg } from '../../utils/format.js'
import useStore from '../../store/index.js'

export function VolumeChart() {
  const sessions = useStore(s => s.sessions)
  const data = useMemo(() => getWeeklyVolume(sessions, 8), [sessions])
  const [tooltip, setTooltip] = useState(null)
  const maxVol = Math.max(...data.map(d => d.volume), 1)
  const BAR_H = 120

  return (
    <div style={{ background: 'linear-gradient(160deg,var(--surface2) 0%,var(--surface) 100%)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '20px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 2 }}>Volumen semanal</p>
          <p style={{ fontSize: 12, color: 'var(--text3)' }}>Últimas 8 semanas</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: BAR_H + 32 }}>
        {/* Y labels */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', height: BAR_H, paddingBottom: 0, flexShrink: 0 }}>
          {[maxVol, Math.round(maxVol/2), 0].map(v => (
            <span key={v} style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'DM Mono,monospace', lineHeight: 1 }}>
              {v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
            </span>
          ))}
        </div>
        {/* Bars */}
        <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'flex-end', height: BAR_H + 24 }}>
          {data.map((week, i) => {
            const isLast = i === data.length - 1
            const barH = week.volume > 0 ? Math.max((week.volume / maxVol) * BAR_H, 6) : 4
            const isHovered = tooltip === i
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}
                onMouseEnter={() => setTooltip(i)} onMouseLeave={() => setTooltip(null)}
                onTouchStart={() => setTooltip(tooltip === i ? null : i)}>
                {/* Tooltip */}
                {isHovered && week.volume > 0 && (
                  <div style={{
                    background: 'var(--surface2)', border: '1px solid var(--border2)',
                    borderRadius: 8, padding: '5px 8px', position: 'absolute',
                    fontSize: 11, fontWeight: 700, color: 'var(--text)',
                    fontFamily: 'DM Mono,monospace', zIndex: 10,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                    whiteSpace: 'nowrap', transform: 'translateY(-8px)',
                    pointerEvents: 'none',
                  }}>
                    {formatKg(week.volume)} kg · {week.sessions} ses.
                  </div>
                )}
                <div style={{
                  width: '100%', height: barH,
                  borderRadius: '6px 6px 2px 2px',
                  background: isLast ? 'var(--accent)' : isHovered ? 'rgba(94,106,210,0.45)' : 'rgba(94,106,210,0.22)',
                  filter: isLast ? 'drop-shadow(0 0 8px rgba(94,106,210,0.5))' : 'none',
                  transition: 'height 0.5s cubic-bezier(0.32,0.72,0,1), background 0.15s ease',
                  animation: `fadeUp 0.5s cubic-bezier(0.32,0.72,0,1) ${i * 0.05}s both`,
                }} />
                <span style={{ fontSize: 9, color: isLast ? 'var(--accent)' : 'var(--text3)', fontWeight: isLast ? 700 : 500, whiteSpace: 'nowrap', fontFamily: 'DM Mono,monospace' }}>
                  {week.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
