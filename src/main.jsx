import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ─── Storage Migration: lv_ → graw_ ──────────────────────────────────────────
// Runs once on first launch after rebrand. Backward compat: reads old keys,
// writes to new keys, then removes old ones.
function migrateStorage() {
  try {
    const migrated = localStorage.getItem('graw_migrated_v1')
    if (migrated) return

    const keyMap = {
      'lv_user':      'graw_user',
      'lv_templates': 'graw_templates',
      'lv_programs':  'graw_programs',
      'lv_sessions':  'graw_sessions',
      'lv_prs':       'graw_prs',
      'lv_metrics':   'graw_metrics',
      'lv_settings':  'graw_settings',
    }

    Object.entries(keyMap).forEach(([oldKey, newKey]) => {
      const val = localStorage.getItem(oldKey)
      if (val && !localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, val)
      }
      localStorage.removeItem(oldKey)
    })

    // Clean any old seed/debug flags
    ;['lv_v2_clean', 'liftvault_store', 'vault_store'].forEach(k => localStorage.removeItem(k))

    localStorage.setItem('graw_migrated_v1', 'true')
  } catch (e) {
    // localStorage unavailable (private mode) — fail silently
  }
}

migrateStorage()

// Guard against corrupted persisted state (prevents blank screen)
try {
  const raw = localStorage.getItem('graw_store')
  if (raw) JSON.parse(raw)
} catch (e) {
  try { localStorage.removeItem('graw_store') } catch (e2) {}
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
