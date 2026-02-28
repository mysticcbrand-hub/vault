import { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit2, CheckCircle, TrendingUp, AlertCircle, Minus } from 'lucide-react'
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

function WeightChart({ metrics, goalWeight, unit }) {
  const svgRef = useRef(null)
  const [pathLen, setPathLen] = useState(0)
  const [animated, setAnimated] = useState(false)
  const W = 320, H = 120, PAD = { l: 36, r: 16, t: 12, b: 24 }
  const iw = W - PAD.l - PAD.r, ih = H - PAD.t - PAD.b

  const pts = useMemo(() => {
    if (!metrics.length) return []
    const sorted = [...metrics].sort((a, b) => new Date(a.date) - new Date(b.date))
    const weights = sorted.map(m => m.weight)
    const allW = goalWeight ? [...weights, goalWeight] : weights
    const mn = Math.min(...allW) - 2, mx = Math.max(...allW) + 2
    const range = mx - mn || 1
    return sorted.map((m, i) => ({
      x: PAD.l + (i / Math.max(sorted.length - 1, 1)) * iw,
      y: PAD.t + ih - ((m.weight - mn) / range) * ih,
      weight: m.weight, date: m.date,
      goalY: goalWeight ? PAD.t + ih - ((goalWeight - mn) / range) * ih : null,
    }))
  }, [metrics, goalWeight, iw, ih])

  const linePath = useMemo(() => pts.length > 1 ? bezierPath(pts) : '', [pts])
  const areaPath = useMemo(() => {
    if (pts.length < 2) return ''
    const bottom = PAD.t + ih
    return linePath + ` L ${pts[pts.length - 1].x} ${bottom} L ${pts[0].x} ${bottom} Z`
  }, [linePath, pts, ih])

  useEffect(() => {
    if (svgRef.current && linePath) {
      const el = svgRef.current.querySelector('#bmc-line')
      if (el) { setPathLen(el.getTotalLength()); setAnimated(true) }
    }
  }, [linePath])

  const goalY = pts[0]?.goalY
  const xLabels = (() => {
    if (!pts.length) return []
    const step = Math.max(1, Math.floor(pts.length / 4))
    return pts.filter((_, i) => i % step === 0 || i === pts.length - 1)
      .map(p => ({ x: p.x, label: new Date(p.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'numeric' }) }))
  })()

  if (!pts.length) return (
    <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: 13, color: 'var(--text3)' }}>Sin datos suficientes</p>
    </div>
  )

  return (
    <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="bmc-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Goal line */}
      {goalY != null && (
        <>
          <line x1={PAD.l} y1={goalY} x2={W - PAD.r} y2={goalY} stroke="var(--accent)" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
          <text x={W - PAD.r + 2} y={goalY + 4} fontSize="9" fill="var(--accent)" opacity="0.7">{goalWeight}{unit}</text>
        </>
      )}
      {/* Area fill */}
      <path d={areaPath} fill="url(#bmc-grad)" />
      {/* Line */}
      <path id="bmc-line" d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"
        strokeDasharray={pathLen || undefined}
        strokeDashoffset={animated ? 0 : (pathLen || 0)}
        style={{ transition: animated ? 'stroke-dashoffset 1s cubic-bezier(0.32,0.72,0,1)' : 'none' }} />
      {/* Latest point */}
      {pts.length > 0 && (
        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="5" fill="var(--accent)" stroke="var(--bg)" strokeWidth="2" />
      )}
      {/* X labels */}
      {xLabels.map((l, i) => (
        <text key={i} x={l.x} y={H - 2} textAnchor="middle" fontSize="8.5" fill="var(--text3)">{l.label}</text>
      ))}
    </svg>
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
        <input type="number" inputMode="decimal" value={cw} onChange={e => setCw(e.target.value)} placeholder="75" style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 12, padding: '12px 14px', fontSize: 18, fontFamily: 'DM Mono, monospace', color: 'var(--text)', outline: 'none', boxSizing: 'border-box', marginBottom: 14, WebkitUserSelect: 'text', userSelect: 'text' }} />
        {goal !== 'fuerza' && <>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>Peso objetivo</p>
          <input type="number" inputMode="decimal" value={gw} onChange={e => setGw(e.target.value)} placeholder="70" style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 12, padding: '12px 14px', fontSize: 18, fontFamily: 'DM Mono, monospace', color: 'var(--text)', outline: 'none', boxSizing: 'border-box', marginBottom: 14, WebkitUserSelect: 'text', userSelect: 'text' }} />
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
  const [timeFilter, setTimeFilter] = useState('1m')

  const unit = user?.unit || 'kg'
  const currentWeight = user?.currentWeight
  const goalWeight = user?.goalWeight
  const startWeight = useMemo(() => {
    if (!bodyMetrics.length) return currentWeight
    const sorted = [...bodyMetrics].sort((a, b) => new Date(a.date) - new Date(b.date))
    return sorted[0].weight
  }, [bodyMetrics, currentWeight])

  // Filter metrics by time range
  const filteredMetrics = useMemo(() => {
    const now = Date.now()
    const ranges = { '2w': 14, '1m': 30, '3m': 90, '6m': 180, 'todo': 9999 }
    const days = ranges[timeFilter] || 30
    return [...bodyMetrics]
      .filter(m => (now - new Date(m.date).getTime()) / 86400000 <= days)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [bodyMetrics, timeFilter])

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
          <input type="number" inputMode="decimal" value={weightInput} onChange={e => setWeightInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLog()} placeholder={unit === 'kg' ? '75' : '165'} style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--r-sm)', padding: '14px 60px 14px 16px', fontSize: 32, fontFamily: 'DM Mono, monospace', fontWeight: 700, color: 'var(--text)', outline: 'none', textAlign: 'center', boxSizing: 'border-box', WebkitUserSelect: 'text', userSelect: 'text' }} />
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text3)' }}>EVOLUCIÓN</p>
          <div style={{ display: 'flex', gap: 4 }}>
            {[['2w', '2 sem'], ['1m', '1 mes'], ['3m', '3 meses'], ['6m', '6 meses'], ['todo', 'Todo']].map(([id, lbl]) => (
              <button key={id} onClick={() => setTimeFilter(id)} style={{ padding: '3px 8px', borderRadius: 'var(--r-pill)', background: timeFilter === id ? 'var(--accent-dim)' : 'transparent', border: `1px solid ${timeFilter === id ? 'var(--accent-border)' : 'transparent'}`, color: timeFilter === id ? 'var(--accent)' : 'var(--text3)', fontSize: 10, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>{lbl}</button>
            ))}
          </div>
        </div>
        <WeightChart metrics={filteredMetrics} goalWeight={goalWeight} unit={unit} />
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
