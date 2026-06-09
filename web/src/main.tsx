import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

const MIN_SPLASH_MS = 2000
const splashStart: number = (window as any).__splashStart ?? Date.now()

requestAnimationFrame(() => {
  const elapsed   = Date.now() - splashStart
  const remaining = Math.max(0, MIN_SPLASH_MS - elapsed)
  setTimeout(() => {
    const splash = document.getElementById('splash')
    if (!splash) return
    splash.classList.add('out')
    splash.addEventListener('transitionend', () => splash.remove(), { once: true })
  }, remaining)
})
