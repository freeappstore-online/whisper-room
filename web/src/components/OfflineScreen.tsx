import { themeTokens } from '../utils/theme'

const TIPS = [
  'check your Wi-Fi or mobile data',
  'try disabling a VPN if active',
  'will reconnect automatically',
]

interface Props { dark: boolean }

export function OfflineScreen({ dark }: Props) {
  const { green, muted, border, textC, bg } = themeTokens(dark)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'monospace',
    }}>
      <div style={{ width: '100%', maxWidth: 320, padding: '0 24px', textAlign: 'center' }}>
        <div style={{
          fontSize: 48, marginBottom: 20,
          filter: `drop-shadow(0 0 16px ${dark ? 'rgba(78,255,145,0.25)' : 'rgba(0,122,31,0.2)'})`,
        }}>📡</div>

        <p style={{ fontSize: 18, fontWeight: 700, color: textC, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          no connection
        </p>
        <p style={{ fontSize: 12, color: muted, margin: '0 0 28px', lineHeight: 1.8 }}>
          Whisper Room uses WebRTC — a network<br />
          connection is needed to find peers.
        </p>

        <div style={{ borderTop: `1px solid ${border}`, paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TIPS.map(tip => (
            <div key={tip} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: muted }}>
              <span style={{ color: green, fontSize: 10, flexShrink: 0 }}>◈</span>
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
