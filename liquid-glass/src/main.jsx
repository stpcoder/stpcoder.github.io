import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const PRELOAD_RELOAD_KEY = 'portfolio-preload-reload-at'

window.addEventListener('vite:preloadError', (event) => {
  try {
    const lastReload = Number(sessionStorage.getItem(PRELOAD_RELOAD_KEY) || 0)
    if (Date.now() - lastReload < 15000) return
    event.preventDefault()
    sessionStorage.setItem(PRELOAD_RELOAD_KEY, String(Date.now()))
    window.location.reload()
  } catch {
    // The error boundary still provides a manual reload when storage is unavailable.
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
