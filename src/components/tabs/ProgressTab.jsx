import { useState } from 'react'
import { VolumeChart } from '../progress/VolumeChart.jsx'
import { StrengthCurve } from '../progress/StrengthCurve.jsx'
import { PRBoard } from '../progress/PRBoard.jsx'
import { Heatmap } from '../progress/Heatmap.jsx'
import { BodyMetricsDashboard } from '../progress/BodyMetricsChart.jsx'
import useStore from '../../store/index.js'

export function ProgressTab() {
  const settings = useStore(s => s.settings)
  const defaultChart = settings?.progressDefaultChart || 'volume'
  // Sub-tab: 'rendimiento' | 'cuerpo'
  // If user's goal defaults to bodyweight chart, start on 'cuerpo'
  const [subTab, setSubTab] = useState(defaultChart === 'bodyweight' ? 'cuerpo' : 'rendimiento')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
      {/* Header + sub-tab switcher */}
      <div style={{ padding: '24px 20px 0', flexShrink: 0 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: 4 }}>Progreso</h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>Tu evolución en datos</p>
        {/* Pill sub-tab switcher */}
        <div style={{ display: 'flex', gap: 6, background: 'var(--surface2)', borderRadius: 'var(--r-pill)', padding: 3, alignSelf: 'flex-start', width: 'fit-content', marginBottom: 4 }}>
          {[
            { id: 'rendimiento', label: 'Rendimiento' },
            { id: 'cuerpo',      label: 'Cuerpo' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setSubTab(tab.id)} style={{ height: 34, padding: '0 18px', borderRadius: 'var(--r-pill)', background: subTab === tab.id ? 'var(--surface3)' : 'transparent', border: subTab === tab.id ? '1px solid var(--border2)' : 'none', color: subTab === tab.id ? 'var(--text)' : 'var(--text3)', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.18s ease', whiteSpace: 'nowrap' }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', paddingBottom: 'calc(var(--nav-h) + 24px)', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {subTab === 'rendimiento' ? (
          <>
            <div className="si"><VolumeChart /></div>
            <div className="si" style={{ animationDelay: '0.05s' }}><StrengthCurve /></div>
            <div className="si" style={{ animationDelay: '0.10s' }}><PRBoard /></div>
            <div className="si" style={{ animationDelay: '0.15s' }}><Heatmap /></div>
          </>
        ) : (
          <BodyMetricsDashboard />
        )}
      </div>
    </div>
  )
}
