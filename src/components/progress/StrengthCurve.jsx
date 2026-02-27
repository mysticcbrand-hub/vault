import { useState, useMemo } from 'react'
import { EXERCISES } from '../../data/exercises.js'
import { formatDateShort } from '../../utils/dates.js'
import useStore from '../../store/index.js'

const TOP = ['bench','squat','deadlift','ohp','barbell-row','pullup']

function calc1RM(w, r) {
  if (!w||!r) return 0
  return r===1 ? w : Math.round(w*36/(37-Math.min(r,36))*10)/10
}

// Smooth bezier through points
function smoothPath(points) {
  if (points.length < 2) return ''
  let d = `M ${points[0].x},${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i-1], p1 = points[i]
    const cp1x = p0.x + (p1.x - p0.x) * 0.5
    const cp1y = p0.y
    const cp2x = p0.x + (p1.x - p0.x) * 0.5
    const cp2y = p1.y
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`
  }
  return d
}

export function StrengthCurve() {
  const sessions = useStore(s => s.sessions)
  const prs = useStore(s => s.prs)
  const [selectedId, setSelectedId] = useState('bench')

  const avail = useMemo(() => {
    const used = new Set()
    sessions.forEach(s => s.exercises?.forEach(e => used.add(e.exerciseId)))
    return [...TOP,...EXERCISES.map(e=>e.id).filter(id=>used.has(id)&&!TOP.includes(id))]
      .map(id=>EXERCISES.find(e=>e.id===id)).filter(Boolean).slice(0,8)
  }, [sessions])

  const pts = useMemo(() => {
    return [...sessions].sort((a,b)=>new Date(a.date)-new Date(b.date))
      .reduce((acc, s) => {
        const ex = s.exercises?.find(e=>e.exerciseId===selectedId)
        if (!ex) return acc
        const best = (ex.sets||[]).filter(s=>s.completed&&s.weight>0&&s.reps>0)
          .reduce((b,s)=>{const e1=calc1RM(parseFloat(s.weight),parseInt(s.reps));return e1>(b?.e1rm||0)?{...s,e1rm:e1}:b},null)
        if (best) acc.push({date:s.date,label:formatDateShort(s.date),e1rm:best.e1rm,w:best.weight,r:best.reps})
        return acc
      },[])
  }, [sessions, selectedId])

  const W=300,H=110
  const maxE=pts.length?Math.max(...pts.map(p=>p.e1rm)):100
  const minE=pts.length?Math.min(...pts.map(p=>p.e1rm))*0.95:0
  const range=maxE-minE||1
  const toX=i=>pts.length<2?W/2:(i/(pts.length-1))*W
  const toY=v=>H-((v-minE)/range)*H*0.85
  const svgPts = pts.map((p,i)=>({x:toX(i),y:toY(p.e1rm)}))
  const path = smoothPath(svgPts)
  const area = path ? `${path} L ${toX(pts.length-1)},${H} L 0,${H} Z` : ''
  const best = pts.length ? Math.max(...pts.map(p=>p.e1rm)) : 0
  const trend = pts.length>1 ? pts[pts.length-1].e1rm - pts[pts.length-2].e1rm : 0
  const currentPR = prs[selectedId]

  return (
    <div style={{ background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'20px 16px' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14 }}>
        <div>
          <p style={{ fontSize:16,fontWeight:700,color:'var(--text)',letterSpacing:'-0.02em',marginBottom:2 }}>Curva de fuerza</p>
          <p style={{ fontSize:12,color:'var(--text3)' }}>1RM estimado · Brzycki</p>
        </div>
        <div style={{ textAlign:'right' }}>
          <p style={{ fontSize:22,fontWeight:800,letterSpacing:'-0.04em',color:'var(--accent)',fontVariantNumeric:'tabular-nums' }}>
            {best.toFixed(1)}<span style={{ fontSize:13,color:'var(--text3)',fontWeight:500,marginLeft:3 }}>kg</span>
          </p>
          {trend!==0&&<p style={{ fontSize:12,fontWeight:600,color:trend>=0?'var(--green)':'var(--red)' }}>{trend>=0?'↑':'↓'} {Math.abs(trend).toFixed(1)} kg</p>}
        </div>
      </div>
      <div style={{ display:'flex',gap:6,overflowX:'auto',marginBottom:16,paddingBottom:2 }}>
        {avail.map(ex=>(
          <button key={ex.id} onClick={()=>setSelectedId(ex.id)} className="pressable" style={{
            flexShrink:0,padding:'6px 12px',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',
            background:selectedId===ex.id?'var(--accent)':'var(--surface2)',
            color:selectedId===ex.id?'white':'var(--text2)',
            border:`1px solid ${selectedId===ex.id?'var(--accent)':'var(--border)'}`,
            transition:'all 0.15s ease',
          }}>{ex.name}</button>
        ))}
      </div>
      <div style={{ overflow:'hidden',borderRadius:10 }}>
        {pts.length>1?(
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display:'block',height:130 }}>
            <defs>
              <linearGradient id="scg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28"/>
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d={area} fill="url(#scg)"/>
            <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
            {pts.map((p,i)=>{
              const isPR = currentPR && p.e1rm>=currentPR.e1rm*0.99
              const isLast = i===pts.length-1
              return (
                <circle key={i} cx={toX(i)} cy={toY(p.e1rm)}
                  r={isPR?5:isLast?5:3}
                  fill={isPR?'var(--green)':'var(--accent)'}
                  opacity={isLast||isPR?1:0.4}
                />
              )
            })}
          </svg>
        ):(
          <div style={{ height:130,display:'flex',alignItems:'center',justifyContent:'center' }}>
            <p style={{ fontSize:13,color:'var(--text3)' }}>Sin datos suficientes</p>
          </div>
        )}
      </div>
    </div>
  )
}
