import { VolumeChart } from '../progress/VolumeChart.jsx'
import { StrengthCurve } from '../progress/StrengthCurve.jsx'
import { PRBoard } from '../progress/PRBoard.jsx'
import { Heatmap } from '../progress/Heatmap.jsx'
import { BodyMetricsChart } from '../progress/BodyMetricsChart.jsx'

export function ProgressTab() {
  return (
    <div className="pb-nav" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="si">
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)' }}>Progreso</h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>Tu evolución en datos</p>
      </div>
      <div className="si" style={{ animationDelay: '0.05s' }}><VolumeChart /></div>
      <div className="si" style={{ animationDelay: '0.10s' }}><StrengthCurve /></div>
      <div className="si" style={{ animationDelay: '0.15s' }}><PRBoard /></div>
      <div className="si" style={{ animationDelay: '0.20s' }}><Heatmap /></div>
      <div className="si" style={{ animationDelay: '0.25s' }}><BodyMetricsChart /></div>
    </div>
  )
}
