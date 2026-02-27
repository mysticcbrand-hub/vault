import { useState, memo } from 'react'
import { ChevronLeft, CheckSquare, Plus } from 'lucide-react'
import { ExerciseCard } from './ExerciseCard.jsx'
import { RestTimerPill } from './RestTimer.jsx'
import { WorkoutComplete } from './WorkoutComplete.jsx'
import { ExercisePicker } from './ExercisePicker.jsx'
import { useWorkoutTimer, useRestTimer } from '../../hooks/useActiveWorkout.js'
import { formatDurationMmSs } from '../../utils/dates.js'
import { formatKg } from '../../utils/format.js'
import { getExerciseById } from '../../data/exercises.js'
import useStore from '../../store/index.js'

export const ActiveWorkout = memo(function ActiveWorkout() {
  const activeWorkout = useStore(s => s.activeWorkout)
  const settings = useStore(s => s.settings)
  const addExercise = useStore(s => s.addExerciseToWorkout)
  const removeExercise = useStore(s => s.removeExerciseFromWorkout)
  const addSet = useStore(s => s.addSet)
  const removeSet = useStore(s => s.removeSet)
  const updateSet = useStore(s => s.updateSet)
  const completeSet = useStore(s => s.completeSet)
  const cancelWorkout = useStore(s => s.cancelWorkout)
  const finishWorkout = useStore(s => s.finishWorkout)
  const updateWorkoutName = useStore(s => s.updateWorkoutName)

  const [showPicker, setShowPicker] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [showFinish, setShowFinish] = useState(false)
  const [completedSession, setCompletedSession] = useState(null)
  const [newPRs, setNewPRs] = useState({})
  const [editingName, setEditingName] = useState(false)
  const [restingExerciseId, setRestingExerciseId] = useState(null)

  const elapsed = useWorkoutTimer()
  const restTimer = useRestTimer(settings?.restTimerDefault || 90)

  if (!activeWorkout) return null

  const totalVolume = activeWorkout.exercises.reduce((t,ex) =>
    t + ex.sets.reduce((s,set) =>
      s + (set.completed?(parseFloat(set.weight)||0)*(parseInt(set.reps)||0):0),0),0)

  const completedSets = activeWorkout.exercises.reduce((t,ex) =>
    t + ex.sets.filter(s=>s.completed).length, 0)

  const [mm, ss] = formatDurationMmSs(elapsed).split(':')

  const handleCompleteSet = (exerciseId, setId) => {
    const result = completeSet(exerciseId, setId)
    if (result?.isPR && result.exerciseId) {
      setNewPRs(p => ({...p,[result.exerciseId]:result}))
    }
    setRestingExerciseId(exerciseId)
    restTimer.start()
    return result
  }

  const handleFinishConfirm = () => {
    setShowFinish(false)
    const session = finishWorkout('')
    if (session) {
      session.duration = elapsed
      session.totalVolume = Math.round(totalVolume)
      setCompletedSession(session)
    }
  }

  const nextExercise = (() => {
    for (const ex of activeWorkout.exercises) {
      const hasIncomplete = ex.sets.some(s => !s.completed)
      if (hasIncomplete) {
        const exData = getExerciseById(ex.exerciseId)
        return exData?.name || ex.exerciseId
      }
    }
    return null
  })()

  return (
    <>
      <div style={{display:'flex',flexDirection:'column',height:'100%',background:'var(--bg)'}}>
        {/* Fixed header */}
        <div className="glass-header" style={{
          flexShrink:0,padding:'12px 16px',
          borderBottom:'1px solid var(--border)',
          display:'flex',alignItems:'center',gap:12,
          position:'sticky',top:0,zIndex:10,
        }}>
          <button onClick={()=>setShowCancel(true)} className="pressable" style={{
            width:44,height:44,display:'flex',alignItems:'center',justifyContent:'center',
            background:'none',border:'none',cursor:'pointer',flexShrink:0,borderRadius:10,
          }}>
            <ChevronLeft size={22} color="var(--text2)" />
          </button>

          <div style={{flex:1,minWidth:0}}>
            {editingName ? (
              <input
                autoFocus
                value={activeWorkout.name}
                onChange={e=>updateWorkoutName(e.target.value)}
                onBlur={()=>setEditingName(false)}
                onKeyDown={e=>e.key==='Enter'&&setEditingName(false)}
                style={{
                  background:'none',border:'none',
                  borderBottom:'1.5px solid var(--accent)',
                  fontSize:16,fontWeight:600,color:'var(--text)',
                  outline:'none',width:'100%',padding:'2px 0',fontFamily:'inherit',
                }}
              />
            ) : (
              <button onClick={()=>setEditingName(true)} style={{
                background:'none',border:'none',cursor:'pointer',padding:0,textAlign:'left',
              }}>
                <p style={{fontSize:16,fontWeight:600,color:'var(--text)',letterSpacing:'-0.01em',
                  whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:180}}>
                  {activeWorkout.name}
                </p>
              </button>
            )}
          </div>

          {/* Timer */}
          <div style={{
            fontSize:17,fontFamily:'DM Mono,monospace',fontWeight:500,
            color:'var(--green)',letterSpacing:'-0.02em',flexShrink:0,
          }}>
            {mm}<span className="colon">:</span>{ss}
          </div>

          {/* Finish */}
          <button onClick={()=>setShowFinish(true)} className="pressable" style={{
            height:36,padding:'0 14px',borderRadius:10,
            background:'var(--accent)',border:'none',
            color:'white',fontSize:13,fontWeight:700,cursor:'pointer',flexShrink:0,
          }}>
            Finalizar
          </button>
        </div>

        {/* Volume tracker */}
        <div style={{
          flexShrink:0,height:36,
          display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'0 20px',
          borderBottom:'1px solid var(--border)',
        }}>
          <span style={{fontSize:13,fontFamily:'DM Mono,monospace',color:'var(--text2)',fontVariantNumeric:'tabular-nums'}}>
            {formatKg(totalVolume)} kg levantados
          </span>
          <span style={{fontSize:13,fontFamily:'DM Mono,monospace',color:'var(--text2)',fontVariantNumeric:'tabular-nums'}}>
            {completedSets} series ✓
          </span>
        </div>

        {/* Rest pill */}
        <RestTimerPill timer={restTimer} />

        {/* Exercises */}
        <div style={{
          flex:1,overflowY:'auto',
          padding:'16px 16px',
          display:'flex',flexDirection:'column',gap:12,
          paddingBottom:'calc(var(--nav-h) + 80px)',
        }}>
          {activeWorkout.exercises.map((exercise,i) => (
            <div key={exercise.id} className="si" style={{animationDelay:`${i*0.04}s`}}>
              <ExerciseCard
                exercise={exercise}
                onAddSet={addSet}
                onRemoveExercise={()=>removeExercise(exercise.id)}
                onCompleteSet={handleCompleteSet}
                onUpdateSet={updateSet}
                onRemoveSet={removeSet}
                restTimer={restTimer}
                isResting={restingExerciseId===exercise.id && restTimer.active}
              />
            </div>
          ))}

          <button
            className="pressable"
            onClick={()=>setShowPicker(true)}
            style={{
              width:'100%',padding:'16px',borderRadius:'var(--r)',
              border:'1.5px dashed rgba(94,106,210,0.25)',
              background:'rgba(94,106,210,0.04)',
              display:'flex',alignItems:'center',justifyContent:'center',gap:10,
              cursor:'pointer',
            }}
          >
            <div style={{
              width:26,height:26,borderRadius:'50%',
              background:'var(--accent)',
              display:'flex',alignItems:'center',justifyContent:'center',
            }}>
              <Plus size={14} color="white" strokeWidth={2.5} />
            </div>
            <span style={{fontSize:15,fontWeight:600,color:'var(--accent)'}}>Añadir ejercicio</span>
          </button>
        </div>

        {/* Next exercise bar */}
        {nextExercise && (
          <div style={{
            flexShrink:0,height:36,
            display:'flex',alignItems:'center',justifyContent:'space-between',
            padding:'0 20px',
            borderTop:'1px solid var(--border)',
            background:'var(--bg)',
          }}>
            <span style={{fontSize:12,color:'var(--text3)'}}>
              Siguiente: <span style={{color:'var(--text2)',fontWeight:500}}>{nextExercise}</span>
            </span>
          </div>
        )}
      </div>

      {/* Pickers and dialogs */}
      <ExercisePicker open={showPicker} onClose={()=>setShowPicker(false)} onSelect={id=>{addExercise(id);setShowPicker(false)}} />

      {/* Cancel confirm */}
      {showCancel && (
        <>
          <div onClick={()=>setShowCancel(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',zIndex:60,animation:'fadeIn 0.2s ease'}} />
          <div style={{
            position:'fixed',inset:'0 20px',margin:'auto',
            width:'calc(100% - 40px)',maxWidth:340,height:'fit-content',
            background:'var(--surface2)',border:'1px solid var(--border2)',
            borderRadius:24,padding:24,zIndex:61,
            boxShadow:'0 20px 60px rgba(0,0,0,0.7)',
          }}>
            <p style={{fontSize:18,fontWeight:700,color:'var(--text)',marginBottom:8,letterSpacing:'-0.02em'}}>¿Cancelar sesión?</p>
            <p style={{fontSize:14,color:'var(--text2)',marginBottom:24,lineHeight:1.5}}>Se perderán todos los datos de esta sesión.</p>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setShowCancel(false)} className="pressable" style={{flex:1,padding:'13px',borderRadius:12,background:'var(--surface3)',border:'1px solid var(--border)',color:'var(--text)',fontSize:14,fontWeight:600,cursor:'pointer'}}>Continuar</button>
              <button onClick={()=>{cancelWorkout();setShowCancel(false)}} className="pressable" style={{flex:1,padding:'13px',borderRadius:12,background:'var(--red-dim)',border:'1px solid rgba(229,83,75,0.3)',color:'var(--red)',fontSize:14,fontWeight:600,cursor:'pointer'}}>Cancelar</button>
            </div>
          </div>
        </>
      )}

      {/* Finish confirm */}
      {showFinish && (
        <>
          <div onClick={()=>setShowFinish(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',zIndex:60,animation:'fadeIn 0.2s ease'}} />
          <div style={{
            position:'fixed',inset:'0 20px',margin:'auto',
            width:'calc(100% - 40px)',maxWidth:340,height:'fit-content',
            background:'var(--surface2)',border:'1px solid var(--border2)',
            borderRadius:24,padding:24,zIndex:61,
            boxShadow:'0 20px 60px rgba(0,0,0,0.7)',
          }}>
            <p style={{fontSize:18,fontWeight:700,color:'var(--text)',marginBottom:16,letterSpacing:'-0.02em'}}>Finalizar sesión</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20}}>
              {[
                {label:'DURACIÓN',value:`${mm}:${ss}`},
                {label:'VOLUMEN',value:`${formatKg(totalVolume)} kg`},
                {label:'SERIES',value:completedSets},
                {label:'EJERCICIOS',value:activeWorkout.exercises.length},
              ].map(({label,value})=>(
                <div key={label} style={{background:'var(--surface3)',borderRadius:12,padding:'12px'}}>
                  <p style={{fontSize:18,fontWeight:800,color:'var(--text)',fontVariantNumeric:'tabular-nums',letterSpacing:'-0.03em'}}>{value}</p>
                  <p style={{fontSize:10,fontWeight:600,letterSpacing:'0.07em',textTransform:'uppercase',color:'var(--text3)',marginTop:4}}>{label}</p>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setShowFinish(false)} className="pressable" style={{flex:1,padding:'13px',borderRadius:12,background:'var(--surface3)',border:'1px solid var(--border)',color:'var(--text)',fontSize:14,fontWeight:600,cursor:'pointer'}}>Volver</button>
              <button onClick={handleFinishConfirm} className="pressable" style={{flex:1,padding:'13px',borderRadius:12,background:'var(--accent)',border:'none',color:'white',fontSize:14,fontWeight:700,cursor:'pointer'}}>Guardar sesión</button>
            </div>
          </div>
        </>
      )}

      {/* Complete overlay */}
      {completedSession && (
        <WorkoutComplete session={completedSession} newPRs={newPRs} onSave={()=>{setCompletedSession(null);setNewPRs({})}} />
      )}
    </>
  )
})
