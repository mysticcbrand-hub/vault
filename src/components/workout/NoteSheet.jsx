import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export function NoteSheet({ exerciseId, exerciseName, existingNote, onSave, onClose }) {
  const [note, setNote] = useState(existingNote ?? '')

  return createPortal(
    <>
      <motion.div
        key="note-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.55)',
        }}
      />
      <motion.div
        key="note-sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 101,
          background: 'rgba(16,13,9,0.92)',
          backdropFilter: 'blur(48px) saturate(220%)',
          WebkitBackdropFilter: 'blur(48px) saturate(220%)',
          borderRadius: '28px 28px 0 0',
          boxShadow: 'inset 0 1.5px 0 rgba(255,235,200,0.1)',
          padding: '20px 20px',
          paddingBottom: 'calc(20px + env(safe-area-inset-bottom,0px))',
        }}
      >
        {/* Drag indicator */}
        <div style={{ width: 38, height: 5, borderRadius: 100, background: 'rgba(245,239,230,0.18)', margin: '0 auto 16px' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
            Nota — {exerciseName}
          </p>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'rgba(255,235,200,0.07)', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={14} color="var(--text2)" />
          </button>
        </div>

        {/* Text input */}
        <textarea
          autoFocus
          value={note}
          onChange={e => setNote(e.target.value.slice(0, 280))}
          placeholder="Ej: Sentí tensión en el hombro derecho..."
          rows={4}
          className="input"
          style={{
            fontSize: 15, width: '100%', boxSizing: 'border-box',
            resize: 'none', minHeight: 100,
          }}
        />

        {/* Char count */}
        <p style={{
          fontSize: 11, color: 'var(--text3)',
          marginTop: 6, textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {note.length}/280
        </p>

        {/* Save */}
        <button
          onClick={() => { onSave(exerciseId, note); onClose() }}
          className="pressable"
          style={{
            width: '100%', height: 48, borderRadius: 14, marginTop: 12,
            background: 'var(--accent)', border: 'none',
            color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(232,146,74,0.25)',
          }}
        >
          Guardar nota
        </button>
      </motion.div>
    </>,
    document.body
  )
}
