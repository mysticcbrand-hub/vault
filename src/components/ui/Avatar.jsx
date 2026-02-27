export function Avatar({ name = 'U', size = 'md', onClick }) {
  const sizes = { sm: 32, md: 40, lg: 56 }
  const px = sizes[size] || 40
  return (
    <button
      onClick={onClick}
      className="pressable"
      style={{
        width: px, height: px, borderRadius: '50%',
        background: 'var(--accent-dim)',
        border: '1.5px solid var(--accent-border)',
        color: 'var(--accent)', fontWeight: 700, fontSize: px / 2.2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {name.charAt(0).toUpperCase()}
    </button>
  )
}
