import { useState, useMemo } from 'react'
import { EXERCISES } from '../../data/exercises.js'
import { formatDateShort } from '../../utils/dates.js'
import useStore from '../../store/index.js'

const TOP = ['bench', 'squat', 'deadlift', 'ohp', 'barbell-row', 'pullup']

function calc1RM(w, r) {
  if (!w || !r) return 0
  if (r === 1) return w
  return Math.round(w * 36 / (37 - Math.min(r, 36)) * 10) / 10
}

export function StrengthCurve() {
  const sessions = useStore(s => s.sessions)
  const [selectedId, setSelectedId] = useState('bench')

  const availExercises = useMemo(() => {
    const used = new Set()
    sessions.forEach(s => s.exercises?.forEach(e => used.add(e.exerciseId)))
    return [...TOP, ...EXERCISES.map(e => e.id).filter(id => used.has(id) && !TOP.includes(id))]
      .map(id => EXERCISES.find(e => e.id === id)).filter(Boolean).slice(0, 8)
  }, [sessions])

  const points = useMemo(() => {
    return [...sessions]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .reduce((acc, session) => {
        const ex = session.exercises?.find(e => e.exerciseId === selectedId)
        if (!ex) return acc
        const best = (ex.sets || [])
          .filter(s => s.completed && s.weight > 0 && s.reps > 0)
          .reduce((b, s) => { const e1 = calc1RM(parseFloat(s.weight), parseInt(s.reps)); return e1 > (b?.e1rm||0) ? { ...s, e1rm: e1 } : b }, null)
        if (best) acc.push({ date: session.date, label: formatDateShort(session.date), e1rm: best.e1rm, w: best.weight, r: best.reps })
        return acc
      }, [])
  }, [sessions, selectedId])

  const maxE1 = points.length ? Math.max(...points.map(p => p.e1rm)) : 100
  const minE1 = points.length ? Math.min(...points.map(p => p.e1rm)) * 0.9 : 0
  const range = maxE1 - minE1 || 1

  const W = 300, H = 120
  const toX = (i) => points.length < 2 ? W / 2 : (i / (points.length - 1)) * W
  const toY = (v) => H - ((v - minE1) / range) * H * 0.85

  const pathD = points.length > 1
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(p.e1rm).toFixed(1)}`).join(' ')
    : ''
  const areaD = points.length > 1
    ? `${pathD} L ${toX(points.length-1).toFixed(1)} ${H} L ${toX(0).toFixed(1)} ${H} Z`
    : ''

  const best = points.length ? Math.max(...points.map(p => p.e1rm)) : 0
  const last = points[points.length - 1]
  const prev = points[points.length - 2]
  const trend = last && prev ? last.e1rm - prev.e1rm : 0

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>Curva de fuerza</p>
          <p style={{ fontSize: 12, color: 'var(--text3)' }}>1RM estimado · Brzycki</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{best.toFixed(1)} <span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 500 }}>kg</span></p>
          {trend !== 0 && (
            <p style={{ fontSize: 12, fontWeight: 600, color: trend >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)} kg
            </p>
          )}
        </div>
      </div>

      {/* Exercise pills */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16, paddingBottom: 2 }}>
        {availExercises.map(ex => (
          <button key={ex.id} onClick={() => setSelectedId(ex.id)} className="pressable" style={{
            flexShrink: 0, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: selectedId === ex.id ? 'var(--accent)' : 'var(--surface2)',
            color: selectedId === ex.id ? 'white' : 'var(--text2)',
            border: `1px solid ${selectedId === ex.id ? 'var(--accent)' : 'var(--border)'}`,
            transition: 'all 0.15s ease',
          }}>
            {ex.name}
          </button>
        ))}
      </div>

      {/* SVG Chart */}
      <div style={{ overflow: 'hidden', borderRadius: 12 }}>
        {points.length > 1 ? (
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block', height: 130 }}>
            <defs>
              <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#sg)"/>
            <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            {points.map((p, i) => (
              <circle key={i} cx={toX(i)} cy={toY(p.e1rm)} r="3" fill="var(--accent)" opacity={i === points.length - 1 ? 1 : 0.5}/>
            ))}
          </svg>
        ) : (
          <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text3)' }}>Sin datos suficientes para este ejercicio</p>
          </div>
        )}
      </div>
    </div>
  )
}
