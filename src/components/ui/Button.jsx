import { motion } from 'framer-motion'

export function Button({ children, variant = 'primary', size = 'md', className = '', disabled, onClick, type = 'button', ...props }) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-colors select-none cursor-pointer'
  const variants = {
    primary: 'bg-[#6C63FF] text-white active:bg-[#5a52e0] disabled:opacity-40',
    secondary: 'bg-[rgba(240,240,245,0.08)] border border-[rgba(255,255,255,0.08)] text-[#F0F0F5] active:bg-[rgba(240,240,245,0.12)]',
    ghost: 'text-[rgba(240,240,245,0.45)] active:text-[#F0F0F5]',
    danger: 'bg-[rgba(248,113,113,0.15)] border border-[rgba(248,113,113,0.3)] text-[#F87171]',
    success: 'bg-[rgba(52,211,153,0.15)] border border-[rgba(52,211,153,0.3)] text-[#34D399]',
  }
  const sizes = {
    sm: 'text-sm px-3 py-2 min-h-[36px]',
    md: 'text-base px-4 py-3 min-h-[48px]',
    lg: 'text-base px-6 py-4 min-h-[56px]',
    xl: 'text-lg px-8 py-4 min-h-[60px]',
    icon: 'w-10 h-10 p-0',
  }
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
