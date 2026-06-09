import { useState, useEffect } from 'react'

export function useIsDesktop() {
  const [v, setV] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 720)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 720px)')
    setV(mq.matches)
    const h = (e: MediaQueryListEvent) => setV(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return v
}
