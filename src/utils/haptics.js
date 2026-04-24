/**
 * GRAW — Haptic Feedback System
 *
 * Centralized haptic patterns for tactile UI feedback.
 * Platform-aware: no-op on iOS Safari where navigator.vibrate is unsupported.
 *
 * Usage:
 *   import { haptics } from '../utils/haptics.js'
 *   haptics.light()   // tab change, toggle
 *   haptics.medium()  // set complete, confirm
 *   haptics.heavy()   // PR hit, workout finish
 *   haptics.double()  // exercise complete, badge unlock
 *   haptics.error()   // cancel, delete
 */

const canVibrate = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'

function vibrate(pattern) {
  if (!canVibrate) return
  try {
    navigator.vibrate(pattern)
  } catch (e) {
    // Silently ignore — some browsers throw on vibrate
  }
}

export const haptics = {
  /** Subtle tap — tab change, toggle, pill select */
  light:  () => vibrate(4),

  /** Confirm tap — set complete, button confirm */
  medium: () => vibrate(8),

  /** Strong tap — workout finish, PR hit */
  heavy:  () => vibrate(15),

  /** Double pulse — exercise complete, badge unlock */
  double: () => vibrate([8, 30, 12]),

  /** Error pattern — cancel, delete */
  error:  () => vibrate([12, 20, 12, 20, 12]),

  /** Success triple — workout saved */
  success: () => vibrate([6, 40, 6, 40, 10]),
}
