import { useMemo } from 'react'
import { getExerciseById } from '../../data/exercises.js'
import { getMuscleVars } from '../../utils/format.js'
import { formatDateShort } from '../../utils/dates.js'
import { differenceInDays, parseISO } from 'date-fns'
import useStore from '../../store/index.js'

export function PRBoard() {
  const prs = useStore(s => s.prs)
  const now = new Date()
  const list = useMemo(() =>
    Object.entries(prs)
      .map(([id,pr])=>({id,ex:getExerciseById(id),...pr}))
      .filter(p=>p.ex)
      .sort((a,b)=>(b.e1rm||0)-(a.e1rm||0)),
    [prs]
  )
  if (!list.length) return (
    <div style={{ background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'32px 20px',textAlign:'center' }}>
      <p style={{ fontSize:20,fontWeight:700,color:'var(--text)',marginBottom:8 }}>Cada serie que completes puede ser un récord.</p>
      <p style={{ fontSize:14,color:'var(--text2)' }}>Completa sesiones para ver tus PRs.</p>
    </div>
  )
  return (
    <div>
      <div className="section-hd"><span className="t-label">Récords personales</span><span style={{ fontSize:12,color:'var(--text3)' }}>{list.length}</span></div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
        {list.map(({id,ex,weight,reps,date,e1rm},i)=>{
          const mv = getMuscleVars(ex.muscle)
          const isNew = date && differenceInDays(now,parseISO(date))<=7
          return (
            <div key={id} className="si" style={{ animationDelay:`${i*0.03}s`,background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r-sm)',padding:14,position:'relative',overflow:'hidden' }}>
              <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:6 }}>
                {isNew?<span style={{ fontSize:9,fontWeight:700,letterSpacing:'0.06em',padding:'2px 6px',borderRadius:4,background:'var(--amber-dim)',color:'var(--amber)',border:'1px solid rgba(245,166,35,0.25)' }}>NUEVO</span>:<span/>}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--amber)" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <p style={{ fontSize:13,fontWeight:600,color:'var(--text)',marginBottom:6,lineHeight:1.3 }}>{ex.name}</p>
              <p style={{ fontSize:24,fontWeight:800,letterSpacing:'-0.04em',fontVariantNumeric:'tabular-nums',color:mv.color,lineHeight:1 }}>
                {weight}<span style={{ fontSize:13,fontWeight:600,color:'var(--text2)',marginLeft:2 }}>kg</span>
              </p>
              <p style={{ fontSize:11,color:'var(--text2)',marginTop:3 }}>× {reps} reps</p>
              {e1rm&&<p style={{ fontSize:10,color:'var(--text3)',marginTop:5 }}>1RM ~{e1rm.toFixed(1)} kg</p>}
              <div style={{ marginTop:8,paddingTop:8,borderTop:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                <span style={{ fontSize:10,fontWeight:600,padding:'2px 6px',borderRadius:4,background:mv.dim,color:mv.color }}>{ex.muscle}</span>
                <span style={{ fontSize:10,color:'var(--text3)',fontFamily:'DM Mono,monospace' }}>{date?formatDateShort(date):''}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
