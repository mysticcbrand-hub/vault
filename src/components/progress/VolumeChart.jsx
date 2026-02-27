import { useMemo } from 'react'
import { getWeeklyVolume } from '../../utils/volume.js'
import useStore from '../../store/index.js'

export function VolumeChart() {
  const sessions = useStore(s => s.sessions)
  const data = useMemo(() => getWeeklyVolume(sessions, 8), [sessions])
  const maxVol = Math.max(...data.map(d => d.volume), 1)

  // Left axis labels
  const yMax = Math.ceil(maxVol / 1000) * 1000
  const yMid = Math.round(yMax / 2)

  const BAR_W = 28
  const CHART_H = 140
  const CHART_W = data.length * (BAR_W + 8) - 8

  return (
    <div style={{
      background: 'linear-gradient(160deg, var(--surface2) 0%, var(--surface) 100%)',
      border: '1px solid var(--border)', borderRadius: 20,
      padding: '20px 16px 16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>Volumen semanal</p>
          <p style={{ fontSize: 12, color: 'var(--text3)' }}>Últimas 8 semanas</p>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', background: 'var(--surface3)', padding: '4px 8px', borderRadius: 6, letterSpacing: '0.04em' }}>KG</span>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {/* Y axis */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', height: CHART_H, paddingBottom: 20 }}>
          {[yMax, yMid, 0].map(v => (
            <span key={v} style={{ fontSize: 10, color: 'var(--text3)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
              {v >= 1000 ? `${v/1000}k` : v}
            </span>
          ))}
        </div>

        {/* Bars */}
        <div style={{ flex: 1, overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: CHART_H, minWidth: CHART_W }}>
            {data.map((week, i) => {
              const isLast = i === data.length - 1
              const barH = week.volume > 0 ? Math.max((week.volume / maxVol) * (CHART_H - 24), 6) : 4
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                  {/* Value label on hover / on current */}
                  {isLast && week.volume > 0 && (
                    <span style={{ fontSize: 10, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
                      {week.volume >= 1000 ? `${(week.volume/1000).toFixed(1)}k` : week.volume}
                    </span>
                  )}
                  {(!isLast || week.volume === 0) && <span style={{ fontSize: 10, opacity: 0 }}>0</span>}

                  {/* Bar */}
                  <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                    <div
                      style={{
                        width: '100%',
                        height: barH,
                        borderRadius: '6px 6px 3px 3px',
                        background: isLast ? 'var(--accent)' : 'rgba(124,111,247,0.25)',
                        boxShadow: isLast ? '0 0 12px rgba(124,111,247,0.4)' : 'none',
                        transition: 'height 0.6s cubic-bezier(0.32,0.72,0,1)',
                        animation: `fadeUp 0.5s cubic-bezier(0.32,0.72,0,1) ${i * 0.05}s both`,
                      }}
                    />
                  </div>

                  {/* Label */}
                  <span style={{
                    fontSize: 9, color: isLast ? 'var(--accent)' : 'var(--text3)',
                    fontWeight: isLast ? 700 : 500,
                    whiteSpace: 'nowrap', lineHeight: 1,
                  }}>
                    {week.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
