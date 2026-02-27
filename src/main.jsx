import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// One-time data reset — run once, then set a flag
if (!localStorage.getItem('lv_v2_clean')) {
  Object.keys(localStorage)
    .filter(k => k.startsWith('lv') || k.startsWith('liftvault') || k.startsWith('vault'))
    .forEach(k => localStorage.removeItem(k))
  localStorage.setItem('lv_v2_clean', 'true')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
