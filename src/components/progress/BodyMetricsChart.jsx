import { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit2, CheckCircle, TrendingUp, AlertCircle, Minus } from 'lucide-react'
import { format, subDays, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import useStore from '../../store/index.js'

// ─── Bezier curve path ─────────────────────────────────────────────────────
function bezierPath(points) {
  if (points.length < 2) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpx = (prev.x + curr.x) / 2
    d += ` C ${cpx} ${prev.y} ${cpx} ${curr.y} ${curr.x} ${curr.y}`
  }
  return d
}

// ─── Linear regression slope ───────────────────────────────────────────────
function calcSlope(data) {
  const n = data.length
  if (n < 2) return null
  const sumX = data.reduce((s, _, i) => s + i, 0)
  const sumY = data.reduce((s, m) => s + m.weight, 0)
  const sumXY = data.reduce((s, m, i) => s + i * m.weight, 0)
  const sumX2 = data.reduce((s, _, i) => s + i * i, 0)
  const denom = n * sumX2 - sumX * sumX
  if (!denom) return null
  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

function addDaysFn(date, days) {
  const d = new Date(date); d.setDate(d.getDate() + days); return d
}

const STATUS = {
  on_track: { Icon: CheckCircle, color: 'var(--green)',  text: 'En línea con tu objetivo' },
  ahead:    { Icon: TrendingUp,  color: 'var(--accent)', text: 'Por delante del objetivo' },
  behind:   { Icon: AlertCircle, color: '#D4A843',       text: 'Por detrás del objetivo'  },
  no_goal:  { Icon: Minus,       color: 'var(--text3)',  text: 'Sin objetivo establecido' },
}

// ─── Full Body Metrics Dashboard ─────────────────────────────────────────────

function BodyWeightChart({ metrics = [], goalWeight = null, unit = 'kg' }) {
  const [activeRange, setActiveRange] = useState('1m')
  const [tooltip, setTooltip] = useState(null)
  const svgRef = useRef(null)

  const filtered = useMemo(() => {
    if (!metrics.length) return []
    const now = new Date()
    now.setHours(23, 59, 59, 999)
    const cutoff = {
      '2w': subDays(now, 13),
      '1m': subDays(now, 29),
      '3m': subDays(now, 89),
      '6m': subDays(now, 179),
      'all': new Date(0),
    }[activeRange]

    return metrics
      .filter(m => {
        const d = new Date(m.date)
        return !isNaN(d) && d >= cutoff && d <= now
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(m => ({
        ...m,
        date: new Date(m.date),
        weight: typeof m.weight === 'number' ? m.weight : parseFloat(m.weight),
      }))
      .filter(m => !isNaN(m.weight) && m.weight > 0)
  }, [metrics, activeRange])

  const domainEnd = useMemo(() => {
    const d = new Date()
    d.setHours(23, 59, 59, 999)
    return d
  }, [])

  const domainStart = useMemo(() => {
    if (filtered.length === 0) return subDays(domainEnd, 30)
    const cutoffs = {
      '2w':  subDays(domainEnd, 14),
      '1m':  subDays(domainEnd, 30),
      '3m':  subDays(domainEnd, 90),
      '6m':  subDays(domainEnd, 180),
      'all': subDays(filtered[0].date, 1), // 1 day before earliest so first point isn't at edge
    }
    const cutoff = cutoffs[activeRange] || subDays(domainEnd, 30)
    // Ensure domainStart is always at least 1 day before the first data point
    return cutoff
  }, [filtered, activeRange, domainEnd])

  // Minimum span of 7 days so a single point doesn't sit on top of the Y axis
  const totalDays = Math.max(differenceInDays(domainEnd, domainStart), 7)

  const W = 320
  const H = 160
  const PAD = { top: 20, right: 12, bottom: 28, left: 38 }
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom

  const scaleX = (date) => {
    const days = differenceInDays(date, domainStart)
    return PAD.left + (days / totalDays) * plotW
  }

  const { minY, maxY } = useMemo(() => {
    if (filtered.length === 0) return { minY: 60, maxY: 100 }
    const weights = filtered.map(m => m.weight)
    if (goalWeight) weights.push(goalWeight)
    const lo = Math.min(...weights)
    const hi = Math.max(...weights)
    const pad = Math.max((hi - lo) * 0.15, 2)
    return { minY: lo - pad, maxY: hi + pad }
  }, [filtered, goalWeight])

  const scaleY = (weight) => {
    return PAD.top + (1 - (weight - minY) / (maxY - minY)) * plotH
  }

  const points = filtered.map(m => ({
    x: scaleX(m.date),
    y: scaleY(m.weight),
    weight: m.weight,
    date: m.date,
  }))

  const linePath = useMemo(() => {
    if (points.length < 2) return ''
    let d = `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1]
      const p1 = points[i]
      const cpx = (p0.x + p1.x) / 2
      d += ` C ${cpx.toFixed(2)},${p0.y.toFixed(2)} ${cpx.toFixed(2)},${p1.y.toFixed(2)} ${p1.x.toFixed(2)},${p1.y.toFixed(2)}`
    }
    return d
  }, [points])

  const fillPath = useMemo(() => {
    if (points.length < 2) return ''
    const baseline = PAD.top + plotH
    return `${linePath} L ${points[points.length - 1].x.toFixed(2)},${baseline} L ${points[0].x.toFixed(2)},${baseline} Z`
  }, [linePath, points, PAD.top, plotH])

  const xTicks = useMemo(() => {
    const ticks = []
    const intervalDays = {
      '2w': 2,
      '1m': 7,
      '3m': 14,
      '6m': 30,
      'all': Math.ceil(totalDays / 6),
    }[activeRange]

    let cursor = new Date(domainStart)
    if (activeRange === '1m' || activeRange === '3m') {
      const day = cursor.getDay()
      const diff = (day === 0 ? 1 : 8 - day) % 7
      cursor = new Date(cursor)
      cursor.setDate(cursor.getDate() + diff)
    } else if (activeRange === '6m' || activeRange === 'all') {
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
    }

    while (cursor <= domainEnd) {
      const x = scaleX(cursor)
      if (x >= PAD.left && x <= W - PAD.right) {
        ticks.push({
          x,
          label: activeRange === '6m' || activeRange === 'all'
            ? format(cursor, 'MMM', { locale: es })
            : format(cursor, 'd MMM', { locale: es }),
        })
      }
      cursor = new Date(cursor)
      cursor.setDate(cursor.getDate() + intervalDays)
    }

    const todayX = scaleX(new Date())
    const lastTickX = ticks[ticks.length - 1]?.x ?? 0
    if (todayX - lastTickX > 20) {
      ticks.push({ x: todayX, label: 'Hoy', isToday: true })
    }

    return ticks
  }, [activeRange, domainStart, domainEnd, totalDays])

  const yTicks = useMemo(() => {
    const count = 4
    const step = (maxY - minY) / (count - 1)
    return Array.from({ length: count }, (_, i) => {
      const weight = minY + i * step
      return {
        y: scaleY(weight),
        label: Math.round(weight * 10) / 10,
      }
    }).reverse()
  }, [minY, maxY])

  const handleSvgTouch = (e) => {
    if (!svgRef.current || points.length === 0) return
    const rect = svgRef.current.getBoundingClientRect()
    const touchX = e.touches?.[0]?.clientX ?? e.clientX
    const relX = ((touchX - rect.left) / rect.width) * W

    let closest = null
    let minDist = Infinity
    points.forEach(pt => {
      const dist = Math.abs(pt.x - relX)
      if (dist < minDist) {
        minDist = dist
        closest = pt
      }
    })

    if (closest && minDist < 30) {
      setTooltip(closest)
    } else {
      setTooltip(null)
    }
  }

  if (metrics.length === 0) {
    return (
      <div style={{
        borderRadius: 20,
        background: 'rgba(20,16,10,0.72)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        border: '0.5px solid rgba(255,235,200,0.08)',
        padding: '40px 20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>⚖️</div>
        <div style={{ fontSize: 14, color: 'rgba(245,239,230,0.4)', lineHeight: 1.5 }}>
          Registra tu primer peso<br/>para ver tu progreso aquí
        </div>
      </div>
    )
  }

  return (
    <div style={{
      borderRadius: 20,
      background: 'rgba(20,16,10,0.72)',
      backdropFilter: 'blur(28px) saturate(180%)',
      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      border: '0.5px solid rgba(255,235,200,0.08)',
      boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.07)',
      overflow: 'hidden',
      userSelect: 'none',
      WebkitUserSelect: 'none',
    }}>
      <div style={{ display: 'flex', padding: '14px 14px 2px', gap: 2 }}>
        {[
          { key: '2w', label: '2 sem' },
          { key: '1m', label: '1 mes' },
          { key: '3m', label: '3 meses' },
          { key: '6m', label: '6 meses' },
          { key: 'all', label: 'Todo' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setActiveRange(key); setTooltip(null) }}
            style={{
              flex: 1, height: 28,
              borderRadius: 8,
              border: 'none',
              background: activeRange === key ? 'rgba(232,146,74,0.16)' : 'transparent',
              color: activeRange === key ? '#E8924A' : 'rgba(245,239,230,0.32)',
              fontSize: 11, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s ease',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
        {tooltip ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(232,146,74,0.14)',
            border: '0.5px solid rgba(232,146,74,0.3)',
            borderRadius: 20, padding: '3px 12px',
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#E8924A', fontFamily: 'DM Mono, monospace' }}>
              {tooltip.weight} {unit}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(245,239,230,0.45)' }}>
              {format(tooltip.date, 'd MMM yyyy', { locale: es })}
            </span>
          </div>
        ) : (
          <span style={{ fontSize: 11, color: 'rgba(245,239,230,0.2)' }}>Toca la gráfica para ver un registro</span>
        )}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        style={{ display: 'block', touchAction: 'none' }}
        onTouchStart={handleSvgTouch}
        onTouchMove={handleSvgTouch}
        onTouchEnd={() => setTooltip(null)}
        onClick={handleSvgTouch}
      >
        <defs>
          <linearGradient id="bwGradFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8924A" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#E8924A" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((tick, i) => (
          <line
            key={i}
            x1={PAD.left} y1={tick.y}
            x2={W - PAD.right} y2={tick.y}
            stroke="rgba(255,235,200,0.05)"
            strokeWidth="1"
          />
        ))}

        {(() => {
          const todayX = scaleX(new Date())
          return todayX >= PAD.left && todayX <= W - PAD.right ? (
            <line
              x1={todayX} y1={PAD.top}
              x2={todayX} y2={PAD.top + plotH}
              stroke="rgba(232,146,74,0.15)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          ) : null
        })()}

        {goalWeight && goalWeight >= minY && goalWeight <= maxY && (() => {
          const gy = scaleY(goalWeight)
          return (
            <>
              <line
                x1={PAD.left} y1={gy}
                x2={W - PAD.right} y2={gy}
                stroke="rgba(232,146,74,0.3)"
                strokeWidth="1"
                strokeDasharray="5 4"
              />
              <text
                x={W - PAD.right - 2}
                y={gy - 4}
                textAnchor="end"
                fontSize="8.5"
                fill="rgba(232,146,74,0.55)"
                fontFamily="DM Mono, monospace"
              >
                meta {goalWeight}{unit}
              </text>
            </>
          )
        })()}

        {fillPath && <path d={fillPath} fill="url(#bwGradFill)" />}

        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="#E8924A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {points.map((pt, i) => {
          const isActive = tooltip?.x === pt.x
          const isLast = i === points.length - 1
          return (
            <g key={i}>
              {(isActive || isLast) && (
                <circle cx={pt.x} cy={pt.y} r={isActive ? 7 : 5} fill="rgba(232,146,74,0.18)" />
              )}
              <circle
                cx={pt.x} cy={pt.y}
                r={isActive ? 4.5 : isLast ? 3.5 : 2.5}
                fill={isActive || isLast ? '#E8924A' : 'rgba(232,146,74,0.7)'}
                stroke={isActive || isLast ? '#0C0A09' : 'none'}
                strokeWidth="1.5"
              />
            </g>
          )
        })}

        {yTicks.map((tick, i) => (
          <text
            key={i}
            x={PAD.left - 5}
            y={tick.y + 3.5}
            textAnchor="end"
            fontSize="9"
            fill="rgba(245,239,230,0.28)"
            fontFamily="DM Mono, monospace"
          >
            {tick.label}
          </text>
        ))}

        {xTicks.map((tick, i) => (
          <text
            key={i}
            x={tick.x}
            y={H - 5}
            textAnchor="middle"
            fontSize="9"
            fill={tick.isToday ? 'rgba(232,146,74,0.6)' : 'rgba(245,239,230,0.28)'}
            fontFamily="DM Mono, monospace"
            fontWeight={tick.isToday ? '700' : '400'}
          >
            {tick.label}
          </text>
        ))}
      </svg>
    </div>
  )
}

function GoalProgressBar({ current, start, goal }) {
  const total = Math.abs(goal - start)
  const progress = total > 0 ? Math.min(100, (Math.abs(current - start) / total) * 100) : 0
  return (
    <div style={{ margin: '14px 0 6px', position: 'relative' }}>
      <div style={{ height: 6, borderRadius: 3, background: 'var(--surface3)' }}>
        <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, var(--accent), var(--accent-bright))', width: `${progress}%`, transition: 'width 1.2s cubic-bezier(0.32,0.72,0,1)', boxShadow: '0 0 8px var(--accent-glow)', position: 'relative' }}>
          <div style={{ position: 'absolute', right: -7, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, borderRadius: '50%', background: 'var(--accent)', border: '2px solid var(--bg)', boxShadow: '0 0 0 2px rgba(232,146,74,0.3)' }} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'DM Mono, monospace', fontWeight: 600 }}>{start.toFixed(1)} kg</span>
        <span style={{ fontSize: 10, color: 'var(--text3)' }}>{Math.round(progress)}% completado</span>
        <span style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'DM Mono, monospace', fontWeight: 600 }}>{goal.toFixed(1)} kg</span>
      </div>
    </div>
  )
}

function EditGoalSheet({ open, onClose, user, updateUser, addBodyMetric }) {
  const [cw, setCw] = useState(user.currentWeight ? String(user.currentWeight) : '')
  const [gw, setGw] = useState(user.goalWeight ? String(user.goalWeight) : '')
  const [tf, setTf] = useState(user.goalTimeframe || '3m')
  const [goal, setGoal] = useState(user.goal || 'volumen')
  const GOALS = [
    { id: 'fuerza', label: 'Fuerza' },
    { id: 'volumen', label: 'Ganar músculo' },
    { id: 'bajar_grasa', label: 'Bajar grasa' },
    { id: 'mantenimiento', label: 'Mantenerme' },
  ]
  const TFS = [{ id: '1m', label: '1 mes' }, { id: '3m', label: '3 meses' }, { id: '6m', label: '6 meses' }, { id: '12m', label: '1 año' }]

  return createPortal(
    <AnimatePresence>
      {open && (
    <>
      <motion.div key="eg-bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.55)' }} />
      <motion.div key="eg-sh" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 400, damping: 40 }} style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 101, background: 'rgba(14,11,8,0.93)', backdropFilter: 'blur(48px)', WebkitBackdropFilter: 'blur(48px)', borderRadius: '28px 28px 0 0', boxShadow: 'inset 0 1.5px 0 rgba(255,235,200,0.1)', padding: '20px', paddingBottom: 'calc(20px + env(safe-area-inset-bottom,0px))' }}>
        <div style={{ width: 38, height: 5, borderRadius: 100, background: 'rgba(245,239,230,0.18)', margin: '0 auto 20px' }} />
        <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>Editar objetivo</p>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>Peso actual</p>
        <input type="number" inputMode="decimal" value={cw} onChange={e => setCw(e.target.value)} placeholder="—" style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 12, padding: '12px 14px', fontSize: 18, fontFamily: 'DM Mono, monospace', color: 'var(--text)', outline: 'none', boxSizing: 'border-box', marginBottom: 14, WebkitUserSelect: 'text', userSelect: 'text' }} />
        {goal !== 'fuerza' && <>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>Peso objetivo</p>
          <input type="number" inputMode="decimal" value={gw} onChange={e => setGw(e.target.value)} placeholder="—" style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 12, padding: '12px 14px', fontSize: 18, fontFamily: 'DM Mono, monospace', color: 'var(--text)', outline: 'none', boxSizing: 'border-box', marginBottom: 14, WebkitUserSelect: 'text', userSelect: 'text' }} />
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 8 }}>Plazo</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
            {TFS.map(t => <button key={t.id} onClick={() => setTf(t.id)} style={{ height: 40, borderRadius: 10, background: tf === t.id ? 'var(--accent-dim)' : 'var(--surface2)', border: `1px solid ${tf === t.id ? 'var(--accent-border)' : 'var(--border)'}`, color: tf === t.id ? 'var(--accent)' : 'var(--text2)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{t.label}</button>)}
          </div>
        </>}
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 8 }}>Objetivo</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 20 }}>
          {GOALS.map(g => <button key={g.id} onClick={() => setGoal(g.id)} style={{ height: 40, borderRadius: 10, background: goal === g.id ? 'var(--accent-dim)' : 'var(--surface2)', border: `1px solid ${goal === g.id ? 'var(--accent-border)' : 'var(--border)'}`, color: goal === g.id ? 'var(--accent)' : 'var(--text2)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{g.label}</button>)}
        </div>
        <button onClick={() => {
          const weeks = { '1m': 4.3, '3m': 13, '6m': 26, '12m': 52 }[tf] || 13
          const cwKg = parseFloat(cw) || user.currentWeight
          const gwKg = parseFloat(gw) || user.goalWeight
          updateUser({ goal, currentWeight: cwKg, goalWeight: goal !== 'fuerza' ? gwKg : null, goalTimeframe: tf, weeklyTarget: goal !== 'fuerza' && cwKg && gwKg ? Math.round(Math.abs(gwKg - cwKg) / weeks * 100) / 100 : null })
          if (cwKg) addBodyMetric({ weight: cwKg })
          onClose()
        }} style={{ width: '100%', height: 52, borderRadius: 14, background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))', border: 'none', fontSize: 15, fontWeight: 700, color: 'rgba(255,245,235,0.95)', cursor: 'pointer' }}>Guardar cambios</button>
      </motion.div>
    </>
      )}
    </AnimatePresence>,
    document.body
  )
}

export function BodyMetricsDashboard() {
  const bodyMetrics = useStore(s => s.bodyMetrics)
  const addBodyMetric = useStore(s => s.addBodyMetric)
  const updateUser = useStore(s => s.updateUser)
  const user = useStore(s => s.user)
  const [weightInput, setWeightInput] = useState('')
  const [editGoalOpen, setEditGoalOpen] = useState(false)
  const unit = user?.unit || 'kg'
  const currentWeight = user?.currentWeight
  const goalWeight = user?.goalWeight
  const startWeight = useMemo(() => {
    if (!bodyMetrics.length) return currentWeight
    const sorted = [...bodyMetrics].sort((a, b) => new Date(a.date) - new Date(b.date))
    return sorted[0].weight
  }, [bodyMetrics, currentWeight])

  // Latest entry
  const latest = useMemo(() => {
    const s = [...bodyMetrics].sort((a, b) => new Date(b.date) - new Date(a.date))
    return s[0] || null
  }, [bodyMetrics])

  const prevLatest = useMemo(() => {
    const s = [...bodyMetrics].sort((a, b) => new Date(b.date) - new Date(a.date))
    return s[1] || null
  }, [bodyMetrics])

  const weightChange = latest && prevLatest ? (latest.weight - prevLatest.weight) : null

  // Weekly weigh-in strip
  const weekStrip = useMemo(() => {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    const today = new Date()
    const dayOfWeek = (today.getDay() + 6) % 7 // 0=Mon
    return days.map((label, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (dayOfWeek - i))
      const hasEntry = bodyMetrics.some(m => {
        const md = new Date(m.date)
        return md.toDateString() === d.toDateString()
      })
      return { label, hasEntry, isFuture: i > dayOfWeek }
    })
  }, [bodyMetrics])

  // Trend analysis (last 4 weeks)
  const trend = useMemo(() => {
    const recent = [...bodyMetrics]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .filter(m => (Date.now() - new Date(m.date).getTime()) / 86400000 <= 28)
    if (recent.length < 2) return null
    const reg = calcSlope(recent)
    if (!reg) return null
    const weeklyRate = reg.slope * 7
    const totalChange = recent[recent.length - 1].weight - recent[0].weight
    return { weeklyRate, totalChange, dataPoints: recent.length, reg }
  }, [bodyMetrics])

  // Projection
  const projection = useMemo(() => {
    if (!trend || !goalWeight || !latest) return null
    const { slope } = trend.reg
    if (Math.abs(slope) < 0.001) return null
    const daysToGoal = Math.abs((goalWeight - latest.weight) / slope)
    if (daysToGoal > 730 || daysToGoal < 0) return null
    return addDaysFn(new Date(), daysToGoal)
  }, [trend, goalWeight, latest])

  // On-track status
  const trackStatus = useMemo(() => {
    if (!goalWeight || !user?.weeklyTarget || !trend) return 'no_goal'
    const target = user.weeklyTarget * (goalWeight > (startWeight || 0) ? 1 : -1)
    const actual = trend.weeklyRate
    const diff = Math.abs(actual - target)
    if (diff < Math.abs(target) * 0.2) return 'on_track'
    if ((goalWeight > startWeight && actual > target) || (goalWeight < startWeight && actual < target)) return 'ahead'
    return 'behind'
  }, [goalWeight, user, trend, startWeight])

  // Log weight handler
  const handleLog = () => {
    const w = parseFloat(weightInput)
    if (!w || w < 20 || w > 300) return
    const wKg = unit === 'lbs' ? w * 0.453592 : w
    addBodyMetric({ weight: Math.round(wKg * 10) / 10 })
    updateUser({ currentWeight: Math.round(wKg * 10) / 10 })
    setWeightInput('')
  }

  // Auto-populate weight input with last entry
  useEffect(() => {
    if (latest && !weightInput) {
      const display = unit === 'lbs' ? Math.round(latest.weight * 2.20462) : latest.weight
      setWeightInput(String(display))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const STATUS_CFG = STATUS[trackStatus]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ── HERO GOAL CARD ── */}
      <div style={{ background: 'rgba(24,21,16,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '18px 18px', boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text3)' }}>OBJETIVO</p>
          <button onClick={() => setEditGoalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 12, padding: 0 }}>
            <Edit2 size={12} /> Editar
          </button>
        </div>
        {goalWeight && startWeight && latest ? (
          <>
            <GoalProgressBar current={latest.weight} start={startWeight} goal={goalWeight} />
            <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6 }}>
              {Math.abs(goalWeight - latest.weight).toFixed(1)} kg restantes · {user?.goalTimeframe ? { '1m': '1 mes', '3m': '3 meses', '6m': '6 meses', '12m': '1 año' }[user.goalTimeframe] : ''}
            </p>
            {trend && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '8px 10px', background: 'var(--surface3)', borderRadius: 10 }}>
                <STATUS_CFG.Icon size={14} color={STATUS_CFG.color} />
                <p style={{ fontSize: 12, color: STATUS_CFG.color, fontWeight: 600 }}>{STATUS_CFG.text}</p>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>{trend.weeklyRate >= 0 ? '+' : ''}{trend.weeklyRate.toFixed(2)} kg/sem</span>
              </div>
            )}
          </>
        ) : user?.goal === 'fuerza' ? (
          <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 8 }}>Objetivo: Rendimiento · Fuerza máxima</p>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 8 }}>Configura tu objetivo tocando Editar →</p>
        )}
      </div>

      {/* ── LOG WEIGHT CARD ── */}
      <div style={{ background: 'rgba(24,21,16,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '18px 18px', boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.07)' }}>
        <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12 }}>REGISTRAR HOY</p>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input type="number" inputMode="decimal" value={weightInput} onChange={e => setWeightInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLog()} placeholder="—" style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--r-sm)', padding: '14px 60px 14px 16px', fontSize: 32, fontFamily: 'DM Mono, monospace', fontWeight: 700, color: 'var(--text)', outline: 'none', textAlign: 'center', boxSizing: 'border-box', WebkitUserSelect: 'text', userSelect: 'text' }} />
          <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 15, fontWeight: 600, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>{unit}</span>
        </div>
        {/* Quick adjust */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
          {[-0.5, -0.1].map(delta => (
            <button key={delta} onClick={() => { const v = parseFloat(weightInput) || 0; setWeightInput(String(Math.round((v + delta) * 10) / 10)) }} style={{ width: 52, height: 38, borderRadius: 'var(--r-xs)', background: 'var(--surface2)', border: '1px solid var(--border2)', fontFamily: 'DM Mono, monospace', fontSize: 12, fontWeight: 600, color: 'var(--text2)', cursor: 'pointer', transition: 'all 0.12s ease' }} onPointerDown={e => { e.currentTarget.style.background = 'var(--accent-dim)'; e.currentTarget.style.color = 'var(--accent)' }} onPointerUp={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text2)' }} onPointerLeave={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text2)' }}>{delta}</button>
          ))}
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border2)' }} />
          {[0.1, 0.5].map(delta => (
            <button key={delta} onClick={() => { const v = parseFloat(weightInput) || 0; setWeightInput(String(Math.round((v + delta) * 10) / 10)) }} style={{ width: 52, height: 38, borderRadius: 'var(--r-xs)', background: 'var(--surface2)', border: '1px solid var(--border2)', fontFamily: 'DM Mono, monospace', fontSize: 12, fontWeight: 600, color: 'var(--text2)', cursor: 'pointer', transition: 'all 0.12s ease' }} onPointerDown={e => { e.currentTarget.style.background = 'var(--accent-dim)'; e.currentTarget.style.color = 'var(--accent)' }} onPointerUp={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text2)' }} onPointerLeave={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text2)' }}>+{delta}</button>
          ))}
        </div>
        {latest && prevLatest && (
          <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', marginBottom: 10 }}>
            Última entrada: ayer · {unit === 'lbs' ? Math.round(latest.weight * 2.20462) : latest.weight} {unit}
            {weightChange != null && <span style={{ marginLeft: 6, color: weightChange < 0 ? 'var(--green)' : weightChange > 0 ? 'var(--red)' : 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>{weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg</span>}
          </p>
        )}
        <button onClick={handleLog} style={{ width: '100%', height: 46, borderRadius: 'var(--r-sm)', background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))', border: 'none', fontSize: 14, fontWeight: 700, color: 'rgba(255,245,235,0.95)', cursor: 'pointer', boxShadow: 'inset 0 1.5px 0 rgba(255,235,200,0.2), 0 4px 16px var(--accent-glow)' }}>Registrar</button>
      </div>

      {/* ── WEIGHT CHART ── */}
      <div style={{ background: 'rgba(24,21,16,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '18px 18px', boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.07)' }}>
        <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>EVOLUCIÓN</p>
        <BodyWeightChart metrics={bodyMetrics} goalWeight={goalWeight} unit={unit} />
      </div>

      {/* ── WEEKLY WEIGH-IN STRIP ── */}
      <div style={{ background: 'rgba(24,21,16,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '18px 18px', boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.07)' }}>
        <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 14 }}>ESTA SEMANA</p>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {weekStrip.map((day, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: day.hasEntry ? 'var(--green)' : day.isFuture ? 'var(--surface3)' : 'var(--surface2)', border: `1px solid ${day.hasEntry ? 'var(--green)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}>
                {day.hasEntry && <span style={{ fontSize: 11, color: 'white' }}>✓</span>}
              </div>
              <p style={{ fontSize: 9.5, color: day.hasEntry ? 'var(--green)' : 'var(--text3)', fontWeight: day.hasEntry ? 700 : 400 }}>{day.label}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 12 }}>
          {weekStrip.filter(d => d.hasEntry).length} de 7 días registrados · <span style={{ color: 'var(--text2)' }}>Mejor momento: por la mañana en ayunas</span>
        </p>
      </div>

      {/* ── TREND ANALYSIS ── */}
      {trend && bodyMetrics.length >= 7 && (
        <div style={{ background: 'rgba(24,21,16,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '18px 18px', boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.07)' }}>
          <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 14 }}>TENDENCIA</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
            Últimas 4 semanas: {trend.totalChange >= 0 ? '+' : ''}{trend.totalChange.toFixed(1)} kg
          </p>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>
            Ritmo: {trend.weeklyRate >= 0 ? '+' : ''}{trend.weeklyRate.toFixed(2)} kg/semana
          </p>
          {goalWeight && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', background: 'var(--surface3)', borderRadius: 10, marginBottom: projection ? 10 : 0 }}>
              <STATUS_CFG.Icon size={13} color={STATUS_CFG.color} />
              <p style={{ fontSize: 12, color: STATUS_CFG.color, fontWeight: 600 }}>{STATUS_CFG.text}</p>
            </div>
          )}
          {projection && (
            <p style={{ fontSize: 12, color: 'var(--text3)' }}>
              Proyección: alcanzarás tu objetivo en ~{Math.round(Math.abs(goalWeight - (latest?.weight || 0)) / Math.abs(trend.weeklyRate))} semanas
              <span style={{ color: 'var(--text2)' }}> ({projection.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })})</span>
            </p>
          )}
        </div>
      )}

      {/* Edit Goal Sheet */}
      <EditGoalSheet
        open={editGoalOpen}
        onClose={() => setEditGoalOpen(false)}
        user={user || {}}
        updateUser={updateUser}
        addBodyMetric={addBodyMetric}
      />
    </div>
  )
}

export { BodyMetricsDashboard as BodyMetricsChart }
