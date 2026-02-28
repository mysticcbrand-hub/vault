import { TrendingUp, User } from 'lucide-react'
import { VolumeChart } from '../progress/VolumeChart.jsx'
import { StrengthCurve } from '../progress/StrengthCurve.jsx'
import { PRBoard } from '../progress/PRBoard.jsx'
import { Heatmap } from '../progress/Heatmap.jsx'
import { BodyMetricsDashboard } from '../progress/BodyMetricsChart.jsx'

function SectionDivider({ label, icon }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '28px 20px 12px',
    }}>
      <div style={{ color: 'rgba(245,239,230,0.35)', display: 'flex', alignItems: 'center' }}>{icon}</div>
      <span style={{
        fontSize: 11, fontWeight: 700,
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
        color: 'rgba(245,239,230,0.35)',
      }}>
        {label}
      </span>
      <div style={{
        flex: 1, height: '0.5px',
        background: 'rgba(255,235,200,0.07)',
        marginLeft: 4,
      }} />
    </div>
  )
}

export function ProgressTab() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      overflowY: 'auto', overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      overscrollBehavior: 'contain',
      paddingBottom: 'calc(80px + max(env(safe-area-inset-bottom), 16px) + 20px)',
    }}>
      {/* Page header */}
      <div style={{ padding: '24px 20px 8px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: 4 }}>Progreso</h1>
        <p style={{ fontSize: 13, color: 'var(--text2)' }}>Tu evolución en datos</p>
      </div>

      {/* ── RENDIMIENTO ─────────────────────────── */}
      <SectionDivider label="Rendimiento" icon={<TrendingUp size={13} />} />

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="si"><VolumeChart /></div>
        <div className="si" style={{ animationDelay: '0.05s' }}><StrengthCurve /></div>
        <div className="si" style={{ animationDelay: '0.10s' }}><PRBoard /></div>
        <div className="si" style={{ animationDelay: '0.15s' }}><Heatmap /></div>
      </div>

      {/* ── CUERPO ───────────────────────────────── */}
      <SectionDivider label="Cuerpo" icon={<User size={13} />} />

      <div style={{ padding: '0 20px' }}>
        <BodyMetricsDashboard />
      </div>
    </div>
  )
}
