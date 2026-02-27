import { useState, useEffect, useRef } from 'react'
import { formatDuration } from '../../utils/dates.js'
import { formatKg } from '../../utils/format.js'
import { getExerciseById } from '../../data/exercises.js'

function useCountUp(target, duration=800) {
  const [v, setV] = useState(0)
  const raf = useRef(null)
  useEffect(()=>{
    let start=null
    const step=ts=>{
      if(!start) start=ts
      const p=Math.min((ts-start)/duration,1)
      setV(Math.round((1-Math.pow(1-p,3))*target))
      if(p<1) raf.current=requestAnimationFrame(step)
    }
    raf.current=requestAnimationFrame(step)
    return()=>cancelAnimationFrame(raf.current)
  },[target])
  return v
}

export function WorkoutComplete({ session, newPRs, onSave }) {
  const [notes, setNotes] = useState('')
  if (!session) return null
  const setCount = session.exercises?.reduce((t,e)=>t+e.sets.filter(s=>s.completed).length,0)||0
  const prKeys = Object.keys(newPRs||{})
  const vol = useCountUp(session.totalVolume||0)
  const sets = useCountUp(setCount)

  return (
    <div style={{ position:'fixed',inset:0,zIndex:70,background:'rgba(9,9,14,0.97)',backdropFilter:'blur(20px)',display:'flex',flexDirection:'column',overflowY:'auto' }}>
      <div style={{ flex:1,padding:'48px 24px 24px',display:'flex',flexDirection:'column',gap:24 }}>
        <div className="si" style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:16 }}>
          <div style={{ width:80,height:80,borderRadius:24,background:'var(--green-dim)',border:'1px solid rgba(62,207,142,0.25)',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <polyline points="8 21 17 30 32 12" stroke="var(--green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="40" strokeDashoffset="40" style={{ animation:'checkDraw 0.5s 0.3s ease-out forwards' }}/>
            </svg>
          </div>
          <div style={{ textAlign:'center' }}>
            <h1 style={{ fontSize:26,fontWeight:800,letterSpacing:'-0.03em',color:'var(--text)',marginBottom:6 }}>¡Sesión completada!</h1>
            <p style={{ fontSize:14,color:'var(--text2)' }}>{session.name}</p>
          </div>
        </div>
        <div className="si" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,animationDelay:'0.1s' }}>
          {[
            {l:'DURACIÓN',v:formatDuration(session.duration)},
            {l:'VOLUMEN',v:`${formatKg(session.totalVolume)} kg`},
            {l:'SERIES',v:sets},
            {l:'EJERCICIOS',v:session.exercises?.length||0},
          ].map(({l,v})=>(
            <div key={l} style={{ background:'var(--surface2)',borderRadius:16,padding:'16px 14px',border:'1px solid var(--border)' }}>
              <p style={{ fontSize:22,fontWeight:800,color:'var(--text)',fontVariantNumeric:'tabular-nums',letterSpacing:'-0.03em',marginBottom:6 }}>{v}</p>
              <p className="t-label">{l}</p>
            </div>
          ))}
        </div>
        {prKeys.length>0&&(
          <div className="si" style={{ background:'var(--amber-dim)',border:'1px solid rgba(245,166,35,0.22)',borderRadius:16,padding:16,animationDelay:'0.15s' }}>
            <p style={{ fontSize:13,fontWeight:700,color:'var(--amber)',marginBottom:12,display:'flex',alignItems:'center',gap:6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--amber)" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              {prKeys.length===1?'Nuevo récord personal':`${prKeys.length} nuevos récords`}
            </p>
            {prKeys.map(id=>{
              const ex=getExerciseById(id); const pr=newPRs[id]
              return(
                <div key={id} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid rgba(245,166,35,0.12)' }}>
                  <span style={{ fontSize:14,fontWeight:600,color:'var(--text)' }}>{ex?.name||id}</span>
                  <span style={{ fontSize:14,fontWeight:800,color:'var(--amber)',fontFamily:'DM Mono,monospace' }}>{pr.weight}kg × {pr.reps}</span>
                </div>
              )
            })}
          </div>
        )}
        <div className="si" style={{ animationDelay:'0.20s' }}>
          <textarea placeholder="¿Cómo fue la sesión?" value={notes} onChange={e=>setNotes(e.target.value.slice(0,280))} rows={3} className="input"/>
          <p style={{ fontSize:11,color:'var(--text3)',marginTop:4,textAlign:'right' }}>{notes.length}/280</p>
        </div>
      </div>
      <div style={{ flexShrink:0,padding:'16px 24px',paddingBottom:'calc(16px + env(safe-area-inset-bottom,0px))',borderTop:'1px solid var(--border)',background:'var(--bg)' }}>
        <button onClick={()=>onSave(notes)} className="pressable shimmer" style={{ width:'100%',height:52,borderRadius:14,background:'var(--accent)',border:'none',color:'white',fontSize:16,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 20px var(--accent-glow)' }}>
          Guardar sesión
        </button>
      </div>
    </div>
  )
}
