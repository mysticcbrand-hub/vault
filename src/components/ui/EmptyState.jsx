export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ width: 56, height: 56, marginBottom: 16, color: 'var(--text3)' }}>{Icon && <Icon size={56} strokeWidth={1.5} />}</div>
      <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>{title}</p>
      {description && <p style={{ fontSize: 14, color: 'var(--text2)', maxWidth: 240 }}>{description}</p>}
      {action && <div style={{ marginTop: 24 }}>{action}</div>}
    </div>
  )
}
