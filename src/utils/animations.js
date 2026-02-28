// Animation tokens — use these everywhere for consistent motion

export const SPRING_SHEET = {
  type: 'spring', stiffness: 420, damping: 42, mass: 1,
}

export const SPRING_DIALOG = {
  type: 'spring', stiffness: 500, damping: 38,
}

export const SPRING_BOUNCE = {
  type: 'spring', stiffness: 420, damping: 28,
}

export const EASE_SETTLE = [0.32, 0.72, 0, 1]

export const FADE_FAST = { duration: 0.18, ease: 'easeOut' }

// Apply to ALL tappable elements via inline style spread
export const pressableStyle = {
  transition: 'transform 0.1s ease, opacity 0.1s ease',
  WebkitTapHighlightColor: 'transparent',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  cursor: 'pointer',
}

export const pressedStyle = {
  transform: 'scale(0.96)',
  opacity: 0.82,
}

// Standard stagger delays for list items (ms)
export const STAGGER = [0, 45, 82, 112, 136, 155, 170, 182]
