import { useMemo, useState } from 'react'
import { Activity, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import useStore from '../../store/index.js'
import { MUSCLE_NAMES } from '../../data/exercises.js'
import { getMuscleVars } from '../../utils/format.js'
import { formatVolume } from '../../utils/volume.js'
import { haptics } from '../../utils/haptics.js'
import {
  WINDOWS, VOLUME_LANDMARKS, avgWeeklyMuscleSets, getAdherence,
  rirStats, totalVolume, bodyweightTrend, patternTrends, plateauInsights,
} from '../../utils/analytics.js'
import { detectDeloadNeed } from '../../utils/progression.js'

const card = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 'var(--r)', padding: 16,
}
const mono = { fontFamily: 'DM Mono, monospace', fontVariantNumeric: 'tabular-nums' }

// ── KPI card ─────────────────────────────────────────────────────────────────
function KPI({ label, value, sub, subColor }) {
  return (
    <div style={{ ...card, padding: '14px 14px 12px' }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>{label}</p>
      <p style={{ ...mono, fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 10.5, color: subColor || 'var(--text3)', marginTop: 5 }}>{sub}</p>}
    </div>
  )
}

// ── Barra de volumen por músculo vs MEV/MRV ──────────────────────────────────
function MuscleVolumeBars({ weeklySets }) {
  const muscles = Object.keys(weeklySets).sort((a, b) => weeklySets[b] - weeklySets[a])
  if (!muscles.length) return null
  const maxScale = Math.max(...muscles.map(m => Math.max(weeklySets[m], (VOLUME_LANDMARKS[m] || [0, 20])[1])), 10)

  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Sets semanales por músculo</p>
        <span style={{ fontSize: 10, color: 'var(--text3)' }}>vs MEV · MRV</span>
      </div>
      <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 14 }}>Compuestos suman 0.5 a músculos secundarios</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {muscles.map(m => {
          const v = weeklySets[m]
          const [mev, mrv] = VOLUME_LANDMARKS[m] || [0, 20]
          const color = v < mev ? 'var(--text3)' : v > mrv ? 'var(--red)' : 'var(--green)'
          const status = v < mev ? 'bajo MEV' : v > mrv ? 'sobre MRV' : 'óptimo'
          return (
            <div key={m}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: getMuscleVars(m).color }}>{MUSCLE_NAMES[m] || m}</span>
                <span style={{ ...mono, fontSize: 11, color }}>{v} <span style={{ color: 'var(--text3)', fontSize: 10 }}>{status}</span></span>
              </div>
              <div style={{ position: 'relative', height: 8, borderRadius: 4, background: 'rgba(255,235,200,0.05)', overflow: 'visible' }}>
                {/* Zona MEV–MRV */}
                <div style={{
                  position: 'absolute', top: 0, bottom: 0, borderRadius: 4,
                  left: `${(mev / maxScale) * 100}%`, width: `${((mrv - mev) / maxScale) * 100}%`,
                  background: 'rgba(52,199,123,0.10)', border: '1px dashed rgba(52,199,123,0.22)',
                }} />
                <div style={{
                  position: 'absolute', top: 1, bottom: 1, left: 0, borderRadius: 3,
                  width: `${Math.min((v / maxScale) * 100, 100)}%`,
                  background: color, opacity: 0.85,
                  transition: 'width 0.5s cubic-bezier(0.32,0.72,0,1)',
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Sparkline SVG ────────────────────────────────────────────────────────────
function Sparkline({ points, color }) {
  if (points.length < 2) return null
  const w = 72, h = 24
  const vals = points.map(p => p.e1rm)
  const min = Math.min(...vals), max = Math.max(...vals)
  const span = max - min || 1
  const d = vals.map((v, i) =>
    `${i === 0 ? 'M' : 'L'}${(i / (vals.length - 1)) * w},${h - 3 - ((v - min) / span) * (h - 6)}`
  ).join(' ')
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PatternTrendList({ trends }) {
  if (!trends.length) return null
  return (
    <div style={card}>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>Fuerza por patrón</p>
      <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12 }}>Mejor e1RM semanal en la ventana</p>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {trends.map((t, i) => {
          const up = t.delta > 1, down = t.delta < -1
          const color = up ? 'var(--green)' : down ? 'var(--red)' : 'var(--text3)'
          const Icon = up ? TrendingUp : down ? TrendingDown : Minus
          return (
            <div key={t.pattern} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
              borderBottom: i < trends.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{t.label}</p>
                <p style={{ ...mono, fontSize: 10.5, color: 'var(--text3)' }}>{t.points[t.points.length - 1].e1rm}kg e1RM</p>
              </div>
              <Sparkline points={t.points} color={color} />
              <span style={{ ...mono, fontSize: 11.5, fontWeight: 700, color, display: 'flex', alignItems: 'center', gap: 3, minWidth: 52, justifyContent: 'flex-end' }}>
                <Icon size={11} />{t.delta > 0 ? '+' : ''}{t.delta}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Insights: plateau + deload ───────────────────────────────────────────────
function Insights({ plateaus, deload }) {
  if (!plateaus.length && !deload) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {deload && (
        <div style={{ ...card, borderColor: 'rgba(245,166,35,0.25)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <AlertTriangle size={16} color="var(--amber)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--amber)', marginBottom: 3 }}>Fatiga acumulada — considera un deload</p>
            <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
              Tu RIR medio lleva {deload.weeklyAvgRIR.length} semanas cayendo (última: {deload.lastWeek}).
              Una semana al ~50% de volumen restaura la capacidad de recuperación.
            </p>
          </div>
        </div>
      )}
      {plateaus.map(p => (
        <div key={p.exerciseId} style={{ ...card, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Activity size={16} color="var(--text3)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>Estancamiento: {p.name}</p>
            <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
              e1RM sin mejora en {Math.round(p.windowDays / 7)} semanas ({p.bestRecent}kg vs {p.bestBefore}kg).
              Prueba rotar a una variante del mismo patrón.
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export function AnalyticsV2() {
  const sessions = useStore(s => s.sessions)
  const bodyMetrics = useStore(s => s.bodyMetrics)
  const user = useStore(s => s.user)
  const programs = useStore(s => s.programs)
  const activeProgram = useStore(s => s.activeProgram)
  const [win, setWin] = useState('month')

  const days = WINDOWS.find(w => w.id === win)?.days || 30
  const expectedPerWeek = user?.weeklyTarget || programs.find(p => p.id === activeProgram)?.days?.length || null

  const data = useMemo(() => ({
    adherence: getAdherence(sessions, expectedPerWeek, days),
    volume: totalVolume(sessions, days),
    rir: rirStats(sessions, days),
    bw: bodyweightTrend(bodyMetrics),
    muscleSets: avgWeeklyMuscleSets(sessions, days),
    trends: patternTrends(sessions, days).slice(0, 5),
    plateaus: plateauInsights(sessions),
    deload: detectDeloadNeed(sessions),
  }), [sessions, bodyMetrics, expectedPerWeek, days])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Selector de ventana */}
      <div style={{ display: 'flex', gap: 6, padding: 4, borderRadius: 'var(--r-pill)', background: 'rgba(255,235,200,0.05)', border: '1px solid var(--border)', alignSelf: 'flex-start' }}>
        {WINDOWS.map(w => (
          <button
            key={w.id}
            onClick={() => { haptics.light?.(); setWin(w.id) }}
            className="pressable"
            style={{
              ...mono, minWidth: 44, height: 32, padding: '0 10px',
              borderRadius: 'var(--r-pill)', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 700,
              background: win === w.id ? 'var(--accent)' : 'transparent',
              color: win === w.id ? '#0C0A09' : 'var(--text3)',
              transition: 'background 0.2s ease, color 0.2s ease',
            }}
          >{w.label}</button>
        ))}
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <KPI
          label="Adherencia"
          value={data.adherence ? `${data.adherence.pct}%` : '—'}
          sub={data.adherence ? `${data.adherence.done}/${data.adherence.expected} sesiones` : 'Define tu objetivo semanal'}
          subColor={data.adherence?.pct >= 85 ? 'var(--green)' : undefined}
        />
        <KPI label="Volumen" value={`${formatVolume(data.volume)}kg`} sub={`últimos ${days} días`} />
        <KPI
          label="RIR medio"
          value={data.rir ? data.rir.avg : '—'}
          sub={data.rir ? `${data.rir.coverage}% de sets con RIR` : 'Registra RIR al completar sets'}
        />
        <KPI
          label="Peso corporal 7d"
          value={data.bw ? `${data.bw.avg7}kg` : '—'}
          sub={data.bw?.delta != null ? `${data.bw.delta > 0 ? '+' : ''}${data.bw.delta}kg vs semana previa` : 'Registra tu peso'}
          subColor={data.bw?.delta != null ? (data.bw.delta > 0 ? 'var(--green)' : 'var(--red)') : undefined}
        />
      </div>

      <Insights plateaus={data.plateaus} deload={data.deload} />
      <MuscleVolumeBars weeklySets={data.muscleSets} />
      <PatternTrendList trends={data.trends} />
    </div>
  )
}
