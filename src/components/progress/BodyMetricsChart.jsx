import { useState, useEffect, useRef } from 'react'
import { formatDateShort } from '../../utils/dates.js'
import useStore from '../../store/index.js'

export function BodyMetricsChart() {
  const bodyMetrics = useStore(s => s.bodyMetrics)
  const addBodyMetric = useStore(s => s.addBodyMetric)
  const [inputWeight, setInputWeight] = useState('')
  const [saving, setSaving] = useState(false)

  const sorted = [...bodyMetrics].sort((a, b) => new Date(a.date) - new Date(b.date))
  const latest = sorted[sorted.length - 1]
  const prev = sorted[sorted.length - 2]
  const change = latest && prev ? (latest.weight - prev.weight).toFixed(1) : null

  const handleSave = () => {
    const w = parseFloat(inputWeight)
    if (!w || w < 20 || w > 300) return
    addBodyMetric({ weight: w })
    setInputWeight('')
    setSaving(false)
  }

  const W = 300, H = 100
  const weights = sorted.map(m => m.weight)
  const maxW = Math.max(...weights, 1)
  const minW = Math.min(...weights) * 0.98
  const range = maxW - minW || 1
  const toX = (i) => sorted.length < 2 ? W/2 : (i / (sorted.length - 1)) * W
  const toY = (v) => H - ((v - minW) / range) * H * 0.85

  const pathD = sorted.length > 1
    ? sorted.map((m, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(m.weight).toFixed(1)}`).join(' ')
    : ''
  const areaD = sorted.length > 1
    ? `${pathD} L ${toX(sorted.length-1).toFixed(1)} ${H} L 0 ${H} Z`
    : ''

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>Peso corporal</p>
          {latest && (
            <p style={{ fontSize: 12, color: 'var(--text3)' }}>
              {latest.weight} kg
              {change && <span style={{ marginLeft: 6, color: parseFloat(change) < 0 ? 'var(--green)' : 'var(--text3)' }}>{parseFloat(change) > 0 ? '+' : ''}{change} kg</span>}
            </p>
          )}
        </div>
        <button onClick={() => setSaving(!saving)} className="pressable" style={{
          padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
          background: 'var(--accent-dim)', border: '1px solid rgba(124,111,247,0.3)',
          color: 'var(--accent)', cursor: 'pointer',
        }}>
          + Registrar
        </button>
      </div>

      {saving && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            type="number" inputMode="decimal"
            placeholder="kg"
            value={inputWeight}
            onChange={e => setInputWeight(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            className="input-base"
            style={{ flex: 1, textAlign: 'center' }}
            autoFocus
          />
          <button onClick={handleSave} className="pressable" style={{
            padding: '12px 16px', borderRadius: 12, background: 'var(--accent)',
            border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}>Guardar</button>
        </div>
      )}

      <div style={{ overflow: 'hidden', borderRadius: 10 }}>
        {sorted.length > 1 ? (
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block', height: 110 }}>
            <defs>
              <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--green)" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="var(--green)" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#wg)"/>
            <path d={pathD} fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            {sorted.map((m, i) => (
              <circle key={i} cx={toX(i)} cy={toY(m.weight)} r="2.5" fill="var(--green)" opacity={i === sorted.length - 1 ? 1 : 0.4}/>
            ))}
          </svg>
        ) : (
          <div style={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ScaleSVG />
          </div>
        )}
      </div>
    </div>
  )
}

function ScaleSVG() {
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ display: 'block', margin: '0 auto 8px' }}>
        <rect x="8" y="32" width="32" height="8" rx="4" stroke="var(--text3)" strokeWidth="1.5"/>
        <path d="M16 32 C16 24 32 24 32 32" stroke="var(--text3)" strokeWidth="1.5"/>
        <line x1="24" y1="16" x2="24" y2="24" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="24" cy="13" r="3" stroke="var(--text3)" strokeWidth="1.5"/>
      </svg>
      <p style={{ fontSize: 12, color: 'var(--text3)' }}>Registra tu peso para ver la evolución</p>
    </div>
  )
}
