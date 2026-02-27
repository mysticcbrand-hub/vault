import { useState, useMemo } from 'react'
import { Sheet } from '../layout/Sheet.jsx'
import { EXERCISES, MUSCLE_NAMES, MUSCLE_COLORS } from '../../data/exercises.js'
import useStore from '../../store/index.js'

const MUSCLES = ['chest','back','shoulders','arms','legs','core']

function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}

export function ExercisePicker({ open, onClose, onSelect }) {
  const [search, setSearch] = useState('')
  const [muscle, setMuscle] = useState(null)
  const sessions = useStore(s => s.sessions)
  const prs = useStore(s => s.prs)

  const recentIds = useMemo(() => {
    const ids = []
    for (const s of sessions.slice(0, 5)) {
      for (const e of (s.exercises || [])) {
        if (!ids.includes(e.exerciseId)) ids.push(e.exerciseId)
        if (ids.length >= 6) break
      }
      if (ids.length >= 6) break
    }
    return ids
  }, [sessions])

  const filtered = useMemo(() => {
    return EXERCISES.filter(ex => {
      const ms = !search || ex.name.toLowerCase().includes(search.toLowerCase())
      const mm = !muscle || ex.muscle === muscle
      return ms && mm
    })
  }, [search, muscle])

  const grouped = useMemo(() => {
    const g = {}
    filtered.forEach(ex => { if (!g[ex.muscle]) g[ex.muscle] = []; g[ex.muscle].push(ex) })
    return g
  }, [filtered])

  const recentExercises = useMemo(() => recentIds.map(id => EXERCISES.find(e => e.id === id)).filter(Boolean), [recentIds])

  const handleSelect = (ex) => {
    onSelect(ex.id)
    onClose()
    setSearch('')
    setMuscle(null)
  }

  return (
    <Sheet open={open} onClose={onClose} title="Añadir ejercicio" fullHeight>
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}><SearchIcon /></span>
          <input type="search" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
            className="input-base" style={{ paddingLeft: 42 }} />
        </div>

        {/* Muscle filter pills */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          <button onClick={() => setMuscle(null)} className="pressable" style={{
            flexShrink: 0, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: !muscle ? 'var(--accent)' : 'var(--surface2)',
            color: !muscle ? 'white' : 'var(--text2)',
            border: `1px solid ${!muscle ? 'var(--accent)' : 'var(--border)'}`,
          }}>Todos</button>
          {MUSCLES.map(m => {
            const c = MUSCLE_COLORS[m]
            const active = muscle === m
            return (
              <button key={m} onClick={() => setMuscle(active ? null : m)} className="pressable" style={{
                flexShrink: 0, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: active ? c.bg : 'var(--surface2)',
                color: active ? c.text : 'var(--text2)',
                border: `1px solid ${active ? c.border : 'var(--border)'}`,
              }}>{MUSCLE_NAMES[m]}</button>
            )
          })}
        </div>
      </div>

      <div style={{ padding: '0 16px', paddingBottom: 'calc(32px + env(safe-area-inset-bottom,0px))' }}>
        {/* Recent */}
        {!search && !muscle && recentExercises.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 8 }}>Recientes</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {recentExercises.map(ex => <ExRow key={ex.id} ex={ex} pr={prs[ex.id]} onSelect={handleSelect} />)}
            </div>
          </div>
        )}

        {/* Grouped */}
        {Object.entries(grouped).map(([m, exs]) => (
          <div key={m} style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 8 }}>{MUSCLE_NAMES[m]}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {exs.map(ex => <ExRow key={ex.id} ex={ex} pr={prs[ex.id]} onSelect={handleSelect} />)}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--text3)' }}>Sin resultados</p>
          </div>
        )}
      </div>
    </Sheet>
  )
}

function ExRow({ ex, pr, onSelect }) {
  const c = MUSCLE_COLORS[ex.muscle]
  return (
    <button onClick={() => onSelect(ex)} className="pressable" style={{
      width: '100%', padding: '12px 14px', borderRadius: 12,
      background: 'var(--surface2)', border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 12,
      cursor: 'pointer', textAlign: 'left',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.name}</p>
        <p style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'capitalize' }}>{ex.equipment}</p>
      </div>
      <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 7px', borderRadius: 6, background: c?.bg, color: c?.text, border: `1px solid ${c?.border}`, flexShrink: 0 }}>
        {MUSCLE_NAMES[ex.muscle]}
      </span>
      {pr && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{pr.weight}×{pr.reps}</span>}
    </button>
  )
}
