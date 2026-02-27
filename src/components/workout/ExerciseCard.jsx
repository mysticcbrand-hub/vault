import { memo, useState, useCallback } from 'react'
import { MoreHorizontal, Plus } from 'lucide-react'
import { SetRow } from './SetRow.jsx'
import { getExerciseById } from '../../data/exercises.js'
import { getMuscleVars } from '../../utils/format.js'
import { relativeDate } from '../../utils/format.js'
import { MUSCLE_NAMES } from '../../data/exercises.js'
import useStore from '../../store/index.js'

export const ExerciseCard = memo(function ExerciseCard({
  exercise, onAddSet, onRemoveExercise, onCompleteSet, onUpdateSet, onRemoveSet, restTimer, isResting
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const sessions = useStore(s => s.sessions)
  const prs = useStore(s => s.prs)
  const exData = getExerciseById(exercise.exerciseId)
  const mv = getMuscleVars(exData?.muscle)
  const currentPR = prs[exercise.exerciseId]

  // Last session data for this exercise
  const lastSession = (() => {
    for (const s of sessions) {
      const ex = s.exercises?.find(e => e.exerciseId === exercise.exerciseId)
      if (ex) {
        const done = (ex.sets||[]).filter(s => s.completed && s.reps>0)
        if (done.length) return { sets: done, date: s.date }
      }
    }
    return null
  })()

  // Compare today vs last
  const todayMaxWeight = Math.max(...exercise.sets.filter(s=>s.completed&&s.weight>0).map(s=>s.weight), 0)
  const lastMaxWeight = lastSession ? Math.max(...lastSession.sets.map(s=>parseFloat(s.weight)||0), 0) : 0
  const beating = todayMaxWeight > 0 && lastMaxWeight > 0 && todayMaxWeight > lastMaxWeight

  const allDone = exercise.sets.length > 0 && exercise.sets.every(s => s.completed)
  const nextIncomplete = exercise.sets.findIndex(s => !s.completed)

  const handleComplete = useCallback((setId) => {
    try { navigator.vibrate(12) } catch {}
    onCompleteSet(exercise.id, setId)
    restTimer.start()
  }, [exercise.id, onCompleteSet, restTimer])

  return (
    <div style={{
      background: 'rgba(19,19,31,0.7)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: `1px solid ${isResting ? 'rgba(94,106,210,0.42)' : allDone ? 'rgba(62,207,142,0.25)' : 'var(--border)'}`,
      borderRadius: 'var(--r)',
      overflow: 'hidden',
      transition: 'border-color 0.4s ease',
      animation: isResting ? 'restPulse 2s ease-in-out infinite' : 'none',
    }}>
      {/* Header */}
      <div style={{padding:'14px 14px 10px', display:'flex', alignItems:'flex-start', gap:10}}>
        <div style={{
          width:8, height:8, borderRadius:'50%',
          background:mv.color, flexShrink:0, marginTop:5,
        }} />
        <div style={{flex:1, minWidth:0}}>
          <p style={{fontSize:16,fontWeight:700,color:'var(--text)',letterSpacing:'-0.01em',marginBottom:4,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
            {exData?.name || exercise.exerciseId}
          </p>
          {/* Last session reference — NON-OPTIONAL */}
          {lastSession ? (
            <p style={{
              fontSize:11, fontFamily:'DM Mono,monospace',
              color: beating ? 'var(--green)' : 'var(--text3)',
              display:'flex', alignItems:'center', gap:4,
            }}>
              {beating ? '↑ Superando récord' : '↑ Última:'}
              {' '}{lastSession.sets.slice(0,3).map(s=>`${s.weight}×${s.reps}`).join(', ')}
              {' '}— {relativeDate(lastSession.date)}
            </p>
          ) : (
            <p style={{fontSize:11,color:'var(--text3)',fontFamily:'DM Mono,monospace'}}>Primera vez — deja huella</p>
          )}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
          <span className="muscle-pill" style={{background:mv.dim,color:mv.color,border:`1px solid ${mv.color}22`}}>
            {MUSCLE_NAMES[exData?.muscle] || exData?.muscle}
          </span>
          <div style={{position:'relative'}}>
            <button onClick={()=>setMenuOpen(!menuOpen)} style={{
              width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',
              background:'none',border:'none',cursor:'pointer',borderRadius:8,
            }}>
              <MoreHorizontal size={16} color="var(--text3)" />
            </button>
            {menuOpen && (
              <>
                <div style={{position:'fixed',inset:0,zIndex:10}} onClick={()=>setMenuOpen(false)} />
                <div style={{
                  position:'absolute',right:0,top:36,zIndex:20,
                  background:'var(--surface2)',border:'1px solid var(--border2)',
                  borderRadius:14,overflow:'hidden',minWidth:170,
                  boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
                }}>
                  {currentPR && (
                    <div style={{padding:'10px 14px',borderBottom:'1px solid var(--border)'}}>
                      <p style={{fontSize:10.5,color:'var(--text3)',marginBottom:2}}>Récord personal</p>
                      <p style={{fontSize:14,fontWeight:700,color:'var(--amber)',fontFamily:'DM Mono,monospace'}}>{currentPR.weight}kg × {currentPR.reps}</p>
                    </div>
                  )}
                  <button onClick={()=>{setMenuOpen(false);onRemoveExercise()}} style={{
                    width:'100%',padding:'12px 14px',textAlign:'left',
                    fontSize:14,color:'var(--red)',background:'none',border:'none',cursor:'pointer',
                  }}>Eliminar ejercicio</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div style={{display:'flex',alignItems:'center',gap:0,padding:'0 16px 4px'}}>
        <div style={{width:28,textAlign:'center',fontSize:10,color:'var(--text3)',letterSpacing:'0.05em',fontWeight:600}}>S</div>
        <div style={{width:80,textAlign:'center',fontSize:10,color:'var(--text3)',letterSpacing:'0.05em',fontWeight:600}}>PESO</div>
        <div style={{width:22}} />
        <div style={{width:64,textAlign:'center',fontSize:10,color:'var(--text3)',letterSpacing:'0.05em',fontWeight:600}}>REPS</div>
        <div style={{flex:1}} />
        <div style={{width:44}} />
      </div>

      {/* Sets */}
      <div style={{padding:'0 8px 8px',display:'flex',flexDirection:'column'}}>
        {exercise.sets.map((set,i) => {
          const w = parseFloat(set.weight)||0
          const r = parseInt(set.reps)||0
          const e1rm = r>0&&w>0 ? (r===1?w:w*36/(37-Math.min(r,36))) : 0
          const isPR = set.completed && e1rm>0 && (!currentPR||e1rm>currentPR.e1rm)
          return (
            <SetRow
              key={set.id}
              set={set}
              setIndex={i}
              isPR={isPR}
              isNext={i===nextIncomplete}
              onUpdate={data=>onUpdateSet(exercise.id,set.id,data)}
              onComplete={()=>handleComplete(set.id)}
              onDelete={()=>onRemoveSet(exercise.id,set.id)}
            />
          )
        })}
      </div>

      {/* Add set */}
      <button
        onClick={()=>onAddSet(exercise.id)}
        style={{
          width:'calc(100% - 16px)',margin:'0 8px 10px',
          height:40,borderRadius:10,
          background:'none',border:'1px dashed rgba(255,255,255,0.09)',
          display:'flex',alignItems:'center',justifyContent:'center',gap:6,
          color:'var(--text3)',fontSize:13,fontWeight:500,cursor:'pointer',
          transition:'border-color 0.15s,color 0.15s',
        }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.09)';e.currentTarget.style.color='var(--text3)'}}
      >
        <Plus size={13} />
        Añadir serie
      </button>
    </div>
  )
})
