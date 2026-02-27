import { useState, useMemo } from 'react'
import { Sheet } from '../layout/Sheet.jsx'
import { groupSessionsByWeek, formatDate, formatDuration, isSameDayAs } from '../../utils/dates.js'
import { formatVolumeExact } from '../../utils/volume.js'
import { getExerciseById, MUSCLE_COLORS, MUSCLE_NAMES } from '../../data/exercises.js'
import useStore from '../../store/index.js'

function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
function XIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}

function MuscleSquare({ muscle, size = 44 }) {
  const c = MUSCLE_COLORS[muscle] || {}
  const letter = (MUSCLE_NAMES[muscle] || 'X')[0].toUpperCase()
  return (
    <div style={{ width: size, height: size, borderRadius: 12, background: c.bg || 'var(--surface3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: size * 0.4, fontWeight: 800, color: c.text || 'var(--text2)' }}>{letter}</span>
    </div>
  )
}

export function HistoryTab() {
  const sessions = useStore(s => s.sessions)
  const deleteSession = useStore(s => s.deleteSession)
  const startWorkout = useStore(s => s.startWorkout)
  const [search, setSearch] = useState('')
  const [selectedSession, setSelectedSession] = useState(null)

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
      <div style={{ padding: '24px 20px 16px', flexShrink: 0 }}>
        <div className="anim-fade-up" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)' }}>Historial</h1>
          <span style={{ fontSize: 13, color: 'var(--text3)', fontVariantNumeric: 'tabular-nums' }}>{sessions.length} sesiones</span>
        </div>
        <p className="anim-fade-up stagger-1" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--accent)', fontVariantNumeric: 'tabular-nums', marginBottom: 16 }}>
          {formatVolumeExact(totalVolume)} <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text3)' }}>kg total</span>
        </p>
        {/* Search */}
        <div className="anim-fade-up stagger-2" style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}><SearchIcon /></span>
          <input
            type="search"
            placeholder="Buscar sesiones..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-base"
            style={{ paddingLeft: 42, paddingRight: search ? 42 : 16 }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <XIcon />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px', paddingBottom: 'calc(64px + env(safe-area-inset-bottom,0px) + 20px)' }}>
        {grouped.map(({ label, items }) => {
          const weekVolume = items.reduce((t, s) => t + (s.totalVolume || 0), 0)
          return (
            <div key={label} style={{ marginBottom: 24 }}>
              {/* Sticky week header */}
              <div style={{
                position: 'sticky', top: 0, zIndex: 10,
                background: 'linear-gradient(to bottom, var(--bg) 70%, transparent)',
                padding: '8px 0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text2)' }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', fontVariantNumeric: 'tabular-nums' }}>{formatVolumeExact(weekVolume)} kg</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map((session, i) => {
                  const primary = session.muscles?.[0]
                  const colors = primary ? MUSCLE_COLORS[primary] : null
                  return (
                    <button
                      key={session.id}
                      className="pressable"
                      onClick={() => setSelectedSession(session)}
                      style={{
                        width: '100%', background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderLeft: `3px solid ${colors?.text || 'var(--accent)'}`,
                        borderRadius: 16, padding: '14px 14px',
                        display: 'flex', alignItems: 'center', gap: 12,
                        cursor: 'pointer', textAlign: 'left',
                        animation: `fadeUp 0.3s cubic-bezier(0.32,0.72,0,1) ${i * 0.04}s both`,
                      }}
                    >
                      <MuscleSquare muscle={primary} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--text2)' }}>{formatDate(session.date)} · {formatDuration(session.duration)}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', color: 'var(--text)' }}>{formatVolumeExact(session.totalVolume)}</p>
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
          <div style={{ padding: '60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <EmptySVG />
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Sin sesiones</p>
            <p style={{ fontSize: 14, color: 'var(--text2)', textAlign: 'center' }}>Completa tu primer entrenamiento para ver tu historial aquí.</p>
          </div>
        )}
      </div>

      {/* Session detail */}
      <Sheet open={!!selectedSession} onClose={() => setSelectedSession(null)} title="Detalle" fullHeight>
        {selectedSession && (
          <div style={{ padding: '16px 20px', paddingBottom: 'calc(100px + env(safe-area-inset-bottom,0px))', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 4 }}>{selectedSession.name}</h2>
              <p style={{ fontSize: 13, color: 'var(--text2)' }}>{formatDate(selectedSession.date)} · {formatDuration(selectedSession.duration)}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Volumen', value: `${formatVolumeExact(selectedSession.totalVolume)} kg` },
                { label: 'Ejercicios', value: selectedSession.exercises?.length || 0 },
                { label: 'Series', value: selectedSession.exercises?.reduce((t,e)=>t+e.sets.filter(s=>s.completed).length,0) || 0 },
                { label: 'Duración', value: formatDuration(selectedSession.duration) },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--surface2)', borderRadius: 14, padding: '14px', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', marginBottom: 4 }}>{value}</p>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text3)' }}>{label}</p>
                </div>
              ))}
            </div>
            {selectedSession.exercises?.map(ex => {
              const exData = getExerciseById(ex.exerciseId)
              const done = (ex.sets || []).filter(s => s.completed)
              if (!done.length) return null
              return (
                <div key={ex.id || ex.exerciseId} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px' }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>{exData?.name || ex.exerciseId}</p>
                  {done.map((set, i) => (
                    <div key={set.id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 11, color: 'var(--text3)', width: 16, fontVariantNumeric: 'tabular-nums' }}>{i+1}</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{set.weight} kg</span>
                      <span style={{ fontSize: 13, color: 'var(--text3)' }}>×</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{set.reps} reps</span>
                    </div>
                  ))}
                </div>
              )
            })}
            {selectedSession.notes && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 14 }}>
                <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Notas</p>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{selectedSession.notes}</p>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="pressable" onClick={() => { startWorkout({ templateId: selectedSession.templateId, programId: selectedSession.programId, name: selectedSession.name }); setSelectedSession(null) }}
                style={{ flex: 1, padding: '14px', borderRadius: 12, background: 'var(--accent-dim)', border: '1px solid rgba(124,111,247,0.3)', color: 'var(--accent)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Repetir sesión
              </button>
              <button className="pressable" onClick={() => { deleteSession(selectedSession.id); setSelectedSession(null) }}
                style={{ padding: '14px 18px', borderRadius: 12, background: 'var(--red-dim)', border: '1px solid rgba(244,96,96,0.3)', color: 'var(--red)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Eliminar
              </button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  )
}

function EmptySVG() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <rect x="15" y="30" width="50" height="8" rx="4" stroke="var(--text3)" strokeWidth="1.5"/>
      <rect x="10" y="25" width="12" height="18" rx="3" stroke="var(--text3)" strokeWidth="1.5"/>
      <rect x="58" y="25" width="12" height="18" rx="3" stroke="var(--text3)" strokeWidth="1.5"/>
      <rect x="24" y="42" width="32" height="6" rx="3" stroke="var(--text3)" strokeWidth="1.5"/>
      <line x1="40" y1="52" x2="40" y2="60" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="32" y1="60" x2="48" y2="60" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
