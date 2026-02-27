import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { Sheet } from '../layout/Sheet.jsx'
import { groupSessionsByWeek, formatDate, formatDuration } from '../../utils/dates.js'
import { formatKg, getMuscleVars, relativeDate } from '../../utils/format.js'
import { getExerciseById, MUSCLE_NAMES } from '../../data/exercises.js'
import useStore from '../../store/index.js'

export function HistoryTab() {
  const sessions = useStore(s => s.sessions)
  const deleteSession = useStore(s => s.deleteSession)
  const startWorkout = useStore(s => s.startWorkout)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const totalVolume = sessions.reduce((t, s) => t + (s.totalVolume || 0), 0)

  const filtered = useMemo(() => {
    if (!search) return sessions
    const q = search.toLowerCase()
    return sessions.filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.exercises?.some(e => getExerciseById(e.exerciseId)?.name?.toLowerCase().includes(q))
    )
  }, [sessions, search])

  const grouped = useMemo(() => groupSessionsByWeek(filtered), [filtered])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '24px 20px 14px', flexShrink: 0 }}>
        <div className="si" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)' }}>Historial</h1>
          <span style={{ fontSize: 13, color: 'var(--text3)', fontVariantNumeric: 'tabular-nums' }}>{sessions.length} sesiones</span>
        </div>
        <p className="si" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--accent)', fontVariantNumeric: 'tabular-nums', marginBottom: 16, animationDelay: '0.04s' }}>
          {formatKg(totalVolume)} <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text3)' }}>kg total</span>
        </p>
        <div className="si" style={{ position: 'relative', animationDelay: '0.08s' }}>
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
          <input
            type="search" placeholder="Buscar sesiones..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: 42, paddingRight: search ? 42 : 15 }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={14} color="var(--text3)" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px', paddingBottom: 'calc(var(--nav-h) + 20px)' }}>
        {grouped.map(({ label, items }) => {
          const weekVol = items.reduce((t, s) => t + (s.totalVolume || 0), 0)
          return (
            <div key={label} style={{ marginBottom: 24 }}>
              <div className="glass-sticky" style={{
                position: 'sticky', top: 0, zIndex: 10,
                padding: '8px 0', marginBottom: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span className="t-label">{label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', fontVariantNumeric: 'tabular-nums', fontFamily: 'DM Mono,monospace' }}>{formatKg(weekVol)} kg</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map((session, i) => {
                  const primary = session.muscles?.[0]
                  const mv = getMuscleVars(primary)
                  return (
                    <button key={session.id} className="pressable" onClick={() => setSelected(session)}
                      style={{
                        width: '100%', background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderLeftWidth: 3, borderLeftColor: mv.color,
                        borderRadius: 'var(--r-sm)', padding: '13px 13px',
                        display: 'flex', alignItems: 'center', gap: 12,
                        cursor: 'pointer', textAlign: 'left',
                        animation: `fadeUp 0.3s cubic-bezier(0.32,0.72,0,1) ${i * 0.04}s both`,
                      }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: mv.dim, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: mv.color }}>{(MUSCLE_NAMES[primary] || 'E')[0]}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--text2)' }}>{relativeDate(session.date)} · {formatDuration(session.duration)}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', color: 'var(--text)' }}>{formatKg(session.totalVolume)}</p>
                        <p style={{ fontSize: 12, color: 'var(--text3)' }}>kg</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
        {grouped.length === 0 && (
          <div style={{ padding: '60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, animation: 'fadeUp 0.3s ease' }}>
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
              <rect x="16" y="28" width="40" height="7" rx="3.5" stroke="var(--text3)" strokeWidth="1.5"/>
              <rect x="10" y="22" width="10" height="19" rx="3" stroke="var(--text3)" strokeWidth="1.5"/>
              <rect x="52" y="22" width="10" height="19" rx="3" stroke="var(--text3)" strokeWidth="1.5"/>
              <rect x="22" y="39" width="28" height="5" rx="2.5" stroke="var(--text3)" strokeWidth="1.5"/>
            </svg>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>Tu primera sesión te está esperando.</p>
            <p style={{ fontSize: 14, color: 'var(--text2)', textAlign: 'center' }}>Completa un entrenamiento para verlo aquí.</p>
          </div>
        )}
      </div>

      {/* Session detail sheet */}
      <Sheet open={!!selected} onClose={() => setSelected(null)} title="Detalle de sesión" fullHeight>
        {selected && (
          <div style={{ padding: '16px 20px', paddingBottom: 'calc(100px + env(safe-area-inset-bottom,0px))', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: 4 }}>{selected.name}</h2>
              <p style={{ fontSize: 13, color: 'var(--text2)' }}>{formatDate(selected.date)} · {formatDuration(selected.duration)}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { l: 'Volumen', v: `${formatKg(selected.totalVolume)} kg` },
                { l: 'Ejercicios', v: selected.exercises?.length || 0 },
                { l: 'Series', v: selected.exercises?.reduce((t,e)=>t+e.sets.filter(s=>s.completed).length,0)||0 },
                { l: 'Duración', v: formatDuration(selected.duration) },
              ].map(({ l, v }) => (
                <div key={l} style={{ background: 'var(--surface2)', borderRadius: 14, padding: 14, border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em', marginBottom: 4 }}>{v}</p>
                  <p className="t-label">{l}</p>
                </div>
              ))}
            </div>
            {selected.exercises?.map(ex => {
              const exData = getExerciseById(ex.exerciseId)
              const done = (ex.sets||[]).filter(s=>s.completed)
              if (!done.length) return null
              return (
                <div key={ex.id||ex.exerciseId} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: 14 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>{exData?.name||ex.exerciseId}</p>
                  {done.map((set,i) => (
                    <div key={set.id||i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 11, color: 'var(--text3)', width: 16, fontFamily: 'DM Mono,monospace' }}>{i+1}</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: 'DM Mono,monospace' }}>{set.weight} kg</span>
                      <span style={{ fontSize: 13, color: 'var(--text3)' }}>×</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: 'DM Mono,monospace' }}>{set.reps}</span>
                    </div>
                  ))}
                </div>
              )
            })}
            {selected.notes && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: 14 }}>
                <p className="t-label" style={{ marginBottom: 6 }}>Notas</p>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{selected.notes}</p>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="pressable" onClick={() => { startWorkout({ templateId: selected.templateId, programId: selected.programId, name: selected.name }); setSelected(null) }}
                style={{ flex: 1, padding: 14, borderRadius: 12, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', color: 'var(--accent)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Repetir sesión
              </button>
              <button className="pressable" onClick={() => { deleteSession(selected.id); setSelected(null) }}
                style={{ padding: '14px 18px', borderRadius: 12, background: 'var(--red-dim)', border: '1px solid rgba(229,83,75,0.3)', color: 'var(--red)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Eliminar
              </button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  )
}
