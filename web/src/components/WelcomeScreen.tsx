import { useState } from 'react'
import { LS_NAME_KEY } from '../utils/peers'
import { themeTokens } from '../utils/theme'
import { QRScanner } from './QRScanner'

const FEATURES = [
  'no sign-up — just pick a name and go',
  'chat disappears when you leave',
  'no one can read your messages but the room',
  'works on Wi-Fi without internet',
]

interface Props {
  dark: boolean
  onToggleTheme: () => void
  onJoin: (name: string, room: string) => void
}

export function WelcomeScreen({ dark, onToggleTheme, onJoin }: Props) {
  const [name, setName] = useState(localStorage.getItem(LS_NAME_KEY) ?? '')
  const [room, setRoom] = useState(() => new URLSearchParams(location.search).get('room') ?? '')
  const [showScanner, setShowScanner] = useState(false)
  const canJoin = name.trim() && room.trim()

  const { green, muted, border, textC } = themeTokens(dark)

  const fieldStyle: React.CSSProperties = {
    background: 'transparent', border: 'none',
    borderBottom: `1px solid ${border}`,
    color: textC, caretColor: green,
    fontFamily: 'monospace',
    outline: 'none', padding: '6px 0',
    width: '100%', letterSpacing: '0.02em',
  }

  function submit() {
    if (canJoin) onJoin(name.trim(), room.trim())
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', fontFamily: 'monospace' }}>
      <div style={{
        minHeight: '100%', boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>

          {/* theme toggle */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button onClick={onToggleTheme} title="Toggle theme" style={{
              background: 'transparent', border: `1px solid ${border}`,
              borderRadius: 2, color: muted,
              fontFamily: 'monospace', fontSize: 13, cursor: 'pointer',
              padding: '3px 8px', lineHeight: 1,
            }}>
              {dark ? '☀' : '☾'}
            </button>
          </div>

          {/* brand */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              fontSize: 48, lineHeight: 1, marginBottom: 16,
              filter: `drop-shadow(0 0 18px ${dark ? 'rgba(78,255,145,0.3)' : 'rgba(0,122,31,0.2)'})`,
            }}>📡</div>
            <h1 style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 35, fontWeight: 700, letterSpacing: '-0.04em',
              color: textC, margin: '0 0 10px',
            }}>Whisper Room</h1>
            <p style={{
              fontSize: 11, color: muted, margin: 0,
              letterSpacing: '0.16em', textTransform: 'uppercase',
            }}>
              p2p · no server · ephemeral
            </p>
          </div>

          <div style={{ borderTop: `1px solid ${border}`, marginBottom: 22 }} />

          {/* features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 26 }}>
            {FEATURES.map(text => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: muted }}>
                <span style={{ color: green, fontSize: 10, flexShrink: 0 }}>◈</span>
                {text}
              </div>
            ))}
          </div>

          <div style={{ borderTop: `1px solid ${border}`, marginBottom: 24 }} />

          {/* form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{
                fontSize: 10, color: green, letterSpacing: '0.18em',
                textTransform: 'uppercase', marginBottom: 8, fontWeight: 600,
              }}>name</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: green, fontSize: 12, flexShrink: 0 }}>▸</span>
                <input
                  className="bc-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="your display name"
                  autoFocus
                  style={fieldStyle}
                />
              </div>
            </div>

            <div>
              <div style={{
                fontSize: 10, color: green, letterSpacing: '0.18em',
                textTransform: 'uppercase', marginBottom: 8, fontWeight: 600,
              }}>room</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: green, fontSize: 12, flexShrink: 0 }}>▸</span>
                <input
                  className="bc-input"
                  value={room}
                  onChange={e => setRoom(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  placeholder="e.g. freeappstore, team-a"
                  style={fieldStyle}
                />
                <button
                  onClick={() => setShowScanner(true)}
                  title="Scan QR to join"
                  style={{
                    flexShrink: 0, background: 'transparent',
                    border: `1px solid ${border}`,
                    borderRadius: 4, cursor: 'pointer',
                    color: muted, fontSize: 16,
                    padding: '4px 6px', lineHeight: 1,
                  }}
                >⛶</button>
              </div>
            </div>

            <button
              onClick={submit}
              disabled={!canJoin}
              style={{
                marginTop: 4, padding: '12px 0',
                background:   canJoin ? green : 'transparent',
                color:        canJoin ? (dark ? '#0a0a0a' : '#fff') : muted,
                border:       `1px solid ${canJoin ? green : border}`,
                borderRadius: 3, fontFamily: 'monospace',
                fontSize: 13, fontWeight: 600, letterSpacing: '0.06em',
                cursor: canJoin ? 'pointer' : 'default', transition: 'all 0.15s',
              }}
            >
              Join room →
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 10, color: muted, marginTop: 24, letterSpacing: '0.04em' }}>
            same room name = same group
          </p>
          <p style={{ textAlign: 'center', fontSize: 10, marginTop: 16, marginBottom: 0 }}>
            <a
              href="https://freeappstore.online"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: muted, textDecoration: 'none', letterSpacing: '0.04em' }}
            >
              Built for freeappstore.online
            </a>
          </p>

        </div>
      </div>

      {showScanner && (
        <QRScanner
          dark={dark}
          onScan={roomId => { setRoom(roomId); setShowScanner(false) }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
}
