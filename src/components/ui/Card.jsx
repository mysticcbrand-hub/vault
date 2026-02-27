export function Card({ children, className = '', onClick, elevated = false }) {
  const style = {
    borderRadius: 'var(--r)',
    background: elevated ? 'var(--surface2)' : 'var(--surface)',
    border: '1px solid var(--border)',
  }
  if (onClick) {
    return (
      <div onClick={onClick} className={`pressable ${className}`} style={style}>
        {children}
      </div>
    )
  }
  return <div className={className} style={style}>{children}</div>
}
