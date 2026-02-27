export function Avatar({ name = 'U', size = 'md', onClick }) {
  const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-14 h-14 text-xl' }
  const initial = name.charAt(0).toUpperCase()
  return (
    <button
      onClick={onClick}
      className={`${sizes[size]} rounded-full bg-[#6C63FF] flex items-center justify-center font-bold text-white flex-shrink-0 cursor-pointer select-none active:scale-95 transition-transform`}
    >
      {initial}
    </button>
  )
}
