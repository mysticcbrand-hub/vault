import { useMemo } from 'react'
import { subDays, startOfYear, differenceInDays, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { calculateStreak } from '../../utils/dates.js'
import useStore from '../../store/index.js'

export function Heatmap() {
  const sessions = useStore(s => s.sessions)
  const streak = useMemo(() => calculateStreak(sessions), [sessions])

  const { weeks, today } = useMemo(() => {
    const now = new Date()
    now.setHours(0,0,0,0)
    const yearStart = startOfYear(now)
    const totalDays = differenceInDays(now, yearStart) + 1
    const days = Math.min(totalDays, 365)

    const volByDay = {}
    sessions.forEach(s => {
      const d = new Date(s.date)
      d.setHours(0,0,0,0)
      const k = d.toDateString()
      volByDay[k] = (volByDay[k] || 0) + (s.totalVolume || 0)
    })
    const maxVol = Math.max(...Object.values(volByDay), 1)

    const cells = []
    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(now, i)
      d.setHours(0,0,0,0)
      const k = d.toDateString()
      const vol = volByDay[k] || 0
      const intensity = vol > 0 ? Math.ceil((vol / maxVol) * 4) : 0
      cells.push({ date: new Date(d), vol, intensity, isToday: i === 0 })
    }

    // Group into weeks (Sun=0)
    const cols = []
    let col = []
    cells.forEach((cell, i) => {
      const dow = cell.date.getDay() // 0=Sun
      const weekDay = dow === 0 ? 6 : dow - 1 // Mon=0..Sun=6
      if (i === 0) {
        for (let p = 0; p < weekDay; p++) col.push(null)
      }
      col.push(cell)
      if (weekDay === 6 || i === cells.length - 1) {
        while (col.length < 7) col.push(null)
        cols.push([...col])
        col = []
      }
    })

    return { weeks: cols, today: now }
  }, [sessions])

  const colors = ['var(--border)', 'rgba(124,111,247,0.2)', 'rgba(124,111,247,0.4)', 'rgba(124,111,247,0.65)', 'var(--accent)']
  const thisYearCount = sessions.filter(s => new Date(s.date).getFullYear() === new Date().getFullYear()).length

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>Consistencia</p>
          <p style={{ fontSize: 12, color: 'var(--text3)' }}>{thisYearCount} sesiones este año</p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--amber)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{streak.current}</p>
            <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Racha</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--accent)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{streak.longest}</p>
            <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Mejor</p>
          </div>
        </div>
      </div>

      {/* Grid - horizontal scroll */}
      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ display: 'flex', gap: 2, width: 'fit-content' }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {week.map((cell, di) => (
                <div
                  key={di}
                  style={{
                    width: 10, height: 10, borderRadius: 2,
                    background: cell ? colors[cell.intensity] : 'transparent',
                    border: cell?.isToday ? '1px solid white' : 'none',
                    flexShrink: 0,
                    title: cell ? `${format(cell.date, 'd MMM', { locale: es })}: ${cell.vol > 0 ? `${cell.vol} kg` : 'Descanso'}` : '',
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 10, color: 'var(--text3)' }}>Menos</span>
        {colors.map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />)}
        <span style={{ fontSize: 10, color: 'var(--text3)' }}>Más</span>
      </div>
    </div>
  )
}
