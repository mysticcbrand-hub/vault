export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-20 h-20 rounded-3xl bg-[rgba(108,99,255,0.1)] border border-[rgba(108,99,255,0.2)] flex items-center justify-center mb-6">
        {Icon && <Icon size={36} className="text-[rgba(108,99,255,0.6)]" />}
      </div>
      <h3 className="text-lg font-bold text-[#F0F0F5] mb-2 tracking-tight">{title}</h3>
      {description && <p className="text-sm text-[rgba(240,240,245,0.45)] leading-relaxed mb-6">{description}</p>}
      {action}
    </div>
  )
}
