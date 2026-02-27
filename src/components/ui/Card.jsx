import { motion } from 'framer-motion'

export function Card({ children, className = '', onClick, elevated = false }) {
  const base = `rounded-2xl border border-[rgba(255,255,255,0.08)] ${elevated ? 'bg-[#1A1A2E]' : 'bg-[#111120]'}`
  const shadow = elevated
    ? '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)'
    : '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)'

  if (onClick) {
    return (
      <motion.div
        onClick={onClick}
        whileTap={{ scale: 0.98 }}
        className={`${base} cursor-pointer ${className}`}
        style={{ boxShadow: shadow }}
      >
        {children}
      </motion.div>
    )
  }
  return (
    <div className={`${base} ${className}`} style={{ boxShadow: shadow }}>
      {children}
    </div>
  )
}
