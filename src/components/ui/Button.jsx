export function Button({ children, variant = 'primary', size = 'md', className = '', disabled, onClick, type = 'button', ...props }) {
  const base = 'pressable'
  const variants = {
    primary: { background: 'var(--accent)', color: 'white', border: 'none' },
    secondary: { background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border2)' },
    ghost: { background: 'transparent', color: 'var(--text2)', border: 'none' },
    danger: { background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid rgba(229,83,75,0.3)' },
    success: { background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid rgba(52,199,123,0.3)' },
  }
  const sizes = {
    sm: { height: 36, padding: '0 12px', fontSize: 13 },
    md: { height: 44, padding: '0 16px', fontSize: 14 },
    lg: { height: 52, padding: '0 18px', fontSize: 16 },
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={base}
      style={{
        borderRadius: 'var(--r-sm)',
        fontWeight: 600,
        cursor: 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...sizes[size],
        ...variants[variant],
      }}
      {...props}
    >
      {children}
    </button>
  )
}
