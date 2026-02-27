import { forwardRef } from 'react'

export const Input = forwardRef(function Input({ label, error, className = '', type = 'text', ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[rgba(240,240,245,0.6)]">{label}</label>}
      <input
        ref={ref}
        type={type}
        className={`w-full bg-[#1A1A2E] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-base text-[#F0F0F5] placeholder-[rgba(240,240,245,0.25)] focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF] transition-colors min-h-[48px] ${error ? 'border-[#F87171]' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-[#F87171]">{error}</span>}
    </div>
  )
})

export const NumberInput = forwardRef(function NumberInput({ className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      type="number"
      inputMode="decimal"
      className={`bg-[#1A1A2E] border border-[rgba(255,255,255,0.08)] rounded-xl text-center text-base text-[#F0F0F5] focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF] transition-colors min-h-[48px] font-semibold tabular-nums ${className}`}
      onFocus={e => e.target.select()}
      {...props}
    />
  )
})

export const Textarea = forwardRef(function Textarea({ label, className = '', ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[rgba(240,240,245,0.6)]">{label}</label>}
      <textarea
        ref={ref}
        className={`w-full bg-[#1A1A2E] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-base text-[#F0F0F5] placeholder-[rgba(240,240,245,0.25)] focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF] transition-colors resize-none ${className}`}
        {...props}
      />
    </div>
  )
})
