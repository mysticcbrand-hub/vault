import { forwardRef } from 'react'

export const Input = forwardRef(function Input({ label, error, className = '', type = 'text', ...props }, ref) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label className="t-label">{label}</label>}
      <input ref={ref} type={type} className={`input ${className}`} {...props} />
      {error && <span style={{ fontSize: 12, color: 'var(--red)' }}>{error}</span>}
    </div>
  )
})

export const NumberInput = forwardRef(function NumberInput({ className = '', ...props }, ref) {
  return (
    <input ref={ref} type="number" inputMode="decimal" className={`input ${className}`} {...props} />
  )
})

export const Textarea = forwardRef(function Textarea({ label, className = '', ...props }, ref) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label className="t-label">{label}</label>}
      <textarea ref={ref} className={`input ${className}`} {...props} />
    </div>
  )
})
