import { VolumeChart } from '../progress/VolumeChart.jsx'
import { StrengthCurve } from '../progress/StrengthCurve.jsx'
import { PRBoard } from '../progress/PRBoard.jsx'
import { Heatmap } from '../progress/Heatmap.jsx'
import { BodyMetricsChart } from '../progress/BodyMetricsChart.jsx'

export function ProgressTab() {
  return (
    <div style={{ padding: '24px 20px', paddingBottom: 'calc(64px + env(safe-area-inset-bottom,0px) + 20px)', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="anim-fade-up">
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)' }}>Progreso</h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>Tu evolución en datos</p>
      </div>
      <div className="anim-fade-up stagger-1"><VolumeChart /></div>
      <div className="anim-fade-up stagger-2"><StrengthCurve /></div>
      <div className="anim-fade-up stagger-3"><PRBoard /></div>
      <div className="anim-fade-up stagger-4"><Heatmap /></div>
      <div className="anim-fade-up stagger-5"><BodyMetricsChart /></div>
    </div>
  )
}
