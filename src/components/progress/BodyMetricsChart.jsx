import { useState } from 'react'
import { formatDateShort } from '../../utils/dates.js'
import useStore from '../../store/index.js'

export function BodyMetricsChart() {
  const bodyMetrics = useStore(s => s.bodyMetrics)
  const addBodyMetric = useStore(s => s.addBodyMetric)
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)

  const sorted = [...bodyMetrics].sort((a,b)=>new Date(a.date)-new Date(b.date))
  const latest = sorted[sorted.length-1]
  const prev = sorted[sorted.length-2]
  const change = latest&&prev ? (latest.weight-prev.weight).toFixed(1) : null

  const W=300,H=90
  const weights = sorted.map(m=>m.weight)
  const maxW = Math.max(...weights,1)
  const minW = Math.min(...weights)*0.98
  const range = maxW-minW||1
  const toX = i => sorted.length<2?W/2:(i/(sorted.length-1))*W
  const toY = v => H-((v-minW)/range)*H*0.85
  const pathD = sorted.length>1 ? sorted.map((m,i)=>`${i===0?'M':'L'} ${toX(i).toFixed(1)} ${toY(m.weight).toFixed(1)}`).join(' ') : ''
  const areaD = sorted.length>1 ? `${pathD} L ${toX(sorted.length-1).toFixed(1)} ${H} L 0 ${H} Z` : ''

  const handleSave = () => {
    const w = parseFloat(input)
    if (!w||w<20||w>300) return
    addBodyMetric({weight:w})
    setInput('')
    setSaving(false)
  }

  return (
    <div style={{ background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'20px 16px' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16 }}>
        <div>
          <p style={{ fontSize:16,fontWeight:700,color:'var(--text)',letterSpacing:'-0.02em',marginBottom:2 }}>Peso corporal</p>
          {latest&&<p style={{ fontSize:12,color:'var(--text3)' }}>{latest.weight} kg{change&&<span style={{ marginLeft:6,color:parseFloat(change)<0?'var(--green)':'var(--text3)' }}>{parseFloat(change)>0?'+':''}{change} kg</span>}</p>}
        </div>
        <button onClick={()=>setSaving(!saving)} className="pressable" style={{ padding:'6px 12px',borderRadius:8,fontSize:12,fontWeight:600,background:'var(--accent-dim)',border:'1px solid var(--accent-border)',color:'var(--accent)',cursor:'pointer' }}>
          + Registrar
        </button>
      </div>
      {saving&&(
        <div style={{ display:'flex',gap:8,marginBottom:16 }}>
          <input type="number" inputMode="decimal" placeholder="kg" value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleSave()} className="input" style={{ flex:1,textAlign:'center' }} autoFocus />
          <button onClick={handleSave} className="pressable" style={{ padding:'12px 16px',borderRadius:12,background:'var(--accent)',border:'none',color:'white',fontSize:14,fontWeight:700,cursor:'pointer' }}>Guardar</button>
        </div>
      )}
      <div style={{ overflow:'hidden',borderRadius:10 }}>
        {sorted.length>1?(
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display:'block',height:100 }}>
            <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--green)" stopOpacity="0.28"/><stop offset="100%" stopColor="var(--green)" stopOpacity="0"/></linearGradient></defs>
            <path d={areaD} fill="url(#wg)"/>
            <path d={pathD} fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            {sorted.map((m,i)=><circle key={i} cx={toX(i)} cy={toY(m.weight)} r="2.5" fill="var(--green)" opacity={i===sorted.length-1?1:0.4}/>)}
          </svg>
        ):(
          <div style={{ height:100,display:'flex',alignItems:'center',justifyContent:'center' }}>
            <p style={{ fontSize:13,color:'var(--text3)' }}>Registra tu peso para ver la evolución</p>
          </div>
        )}
      </div>
    </div>
  )
}
