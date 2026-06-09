import { useState, useEffect } from 'react'

function PhoneClock() {
  const pad = (n: number) => n.toString().padStart(2, '0')
  const now = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}` }
  const [time, setTime] = useState(now)
  useEffect(() => {
    const id = setInterval(() => setTime(now()), 15000)
    return () => clearInterval(id)
  }, [])
  return <span>{time}</span>
}

interface Props { children: React.ReactNode; dark: boolean }

export function PhoneFrame({ children, dark }: Props) {
  const frameH  = Math.min(720, window.innerHeight - 48)
  const bg      = dark ? '#0a0a0a' : '#ffffff'
  const bezel   = dark ? '#1c1c1e' : '#2c2c2e'
  const statusC = dark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)'

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: dark ? '#0d0d0d' : '#e5e5ea',
    }}>
      {/* outer bezel */}
      <div style={{
        width: 375, height: frameH,
        background: bezel, borderRadius: 50, padding: 10,
        boxShadow: '0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* screen */}
        <div style={{
          flex: 1, borderRadius: 42, background: bg,
          overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative',
        }}>
          {/* iOS status bar */}
          <div style={{
            height: 44, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 22px', color: statusC,
            fontFamily: 'system-ui, sans-serif', fontSize: 15, fontWeight: 600,
            position: 'relative', zIndex: 10,
          }}>
            <PhoneClock />

            {/* Dynamic Island */}
            <div style={{
              position: 'absolute', left: '50%', top: 10,
              transform: 'translateX(-50%)',
              width: 120, height: 34, background: '#000', borderRadius: 20,
            }} />

            {/* signal + battery */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="17" height="12" viewBox="0 0 17 12" fill={statusC}>
                <rect x="0"    y="7"   width="3" height="5"    rx="0.8"/>
                <rect x="4.5"  y="4.5" width="3" height="7.5"  rx="0.8"/>
                <rect x="9"    y="2"   width="3" height="10"   rx="0.8"/>
                <rect x="13.5" y="0"   width="3" height="12"   rx="0.8"/>
              </svg>
              <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
                <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke={statusC} strokeWidth="1"/>
                <rect x="22"  y="3.5" width="2.5" height="5" rx="1.25" fill={statusC}/>
                <rect x="2"   y="2"   width="16" height="8"  rx="2"    fill={statusC}/>
              </svg>
            </div>
          </div>

          {/* app content */}
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
