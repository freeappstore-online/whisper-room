import { useState, useEffect, useRef } from 'react'
import { joinRoom, selfId } from '@trystero-p2p/torrent'
import { useTheme } from '@freeappstore/sdk/hooks'

// ── Types ──────────────────────────────────────────────────────────────────

interface HelloPayload { displayName: string }
interface TextPayload  { text: string; displayName: string }
interface FilePayload  { displayName: string; file: FileInfo }
interface FileInfo     { id: string; name: string; size: number }

interface LocalMsg {
  id: string
  from: string
  text: string
  ts: number
  isSystem?: boolean
  file?: FileInfo
}

// Minimal action shape, avoids trystero's DataPayload constraint in generics
interface Action<T> {
  send: (data: T, opts?: { target?: string | string[] }) => Promise<void>
  onMessage: ((data: T, ctx: { peerId: string }) => void) | null
}

// ── Helpers ────────────────────────────────────────────────────────────────

const fmt = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const fmtSize = (b: number) =>
  b < 1024        ? `${b} B`
  : b < 1_048_576 ? `${(b / 1024).toFixed(1)} KB`
  :                 `${(b / 1_048_576).toFixed(1)} MB`

const LS_NAME_KEY = 'whisper-room:name'

const PEER_COLORS_DARK  = ['#4eff91','#61dafb','#ff9b76','#c9a7f5','#f9c74f','#90e0ef','#ff85c2','#a5d6a7']
const PEER_COLORS_LIGHT = ['#00662a','#1565c0','#bf360c','#4a148c','#e65100','#006064','#880e4f','#1b5e20']
const peerColor = (name: string, dark: boolean) =>
  (dark ? PEER_COLORS_DARK : PEER_COLORS_LIGHT)[name.charCodeAt(0) % 8]

// ── FileOffer ──────────────────────────────────────────────────────────────

function FileOffer({ file, isMine, dark }: { file: FileInfo; isMine: boolean; dark: boolean }) {
  const [phase, setPhase] = useState<'idle' | 'progress' | 'done'>('idle')
  const [pct, setPct]     = useState(0)

  function accept() {
    setPhase('progress')
    let p = 0
    const iv = setInterval(() => {
      p += Math.random() * 18 + 5
      if (p >= 100) { p = 100; clearInterval(iv); setPhase('done') }
      setPct(Math.min(p, 100))
    }, 120)
  }

  const g = dark ? '#4eff91' : '#007a1f'
  const border = dark ? 'rgba(78,255,145,0.18)' : 'rgba(0,122,31,0.15)'

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 6, marginTop: 2 }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        border: `1px solid ${border}`,
        borderRadius: 3, padding: '4px 10px',
        fontFamily: 'monospace', fontSize: 12,
        color: dark ? '#d4f7e4' : '#0a2010',
      }}>
        <span style={{ color: g }}>📎</span>
        <span>{file.name}</span>
        <span style={{ color: dark ? 'rgba(78,255,145,0.4)' : 'rgba(0,122,31,0.5)', fontSize: 11 }}>
          {fmtSize(file.size)}
        </span>
      </span>

      {phase === 'done' ? (
        <span>
          <button style={btnStyle(g, dark, true)}>↓ download</button>
        </span>
      ) : phase === 'progress' ? (
        <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 3, minWidth: 160 }}>
          <span style={{
            display: 'block', height: 3, background: border, borderRadius: 2, overflow: 'hidden',
          }}>
            <span style={{
              display: 'block', height: '100%', background: g,
              width: `${pct}%`, transition: 'width 0.1s',
            }} />
          </span>
          <span style={{ fontSize: 10, color: dark ? 'rgba(78,255,145,0.5)' : 'rgba(0,122,31,0.5)' }}>
            {Math.round(pct)}%
          </span>
        </span>
      ) : !isMine ? (
        <span style={{ display: 'inline-flex', gap: 6 }}>
          <button onClick={accept} style={btnStyle(g, dark, true)}>accept</button>
          <button style={btnStyle(g, dark, false)}>decline</button>
        </span>
      ) : (
        <span style={{ fontSize: 11, color: dark ? 'rgba(78,255,145,0.35)' : 'rgba(0,122,31,0.4)' }}>
          waiting for acceptance…
        </span>
      )}
    </span>
  )
}

function btnStyle(g: string, dark: boolean, filled: boolean): React.CSSProperties {
  return {
    padding: '3px 10px', borderRadius: 2, cursor: 'pointer', fontSize: 11, letterSpacing: '0.05em',
    fontFamily: 'monospace', fontWeight: 500,
    background:   filled ? g          : 'transparent',
    color:        filled ? (dark ? '#0a0a0a' : '#fff') : (dark ? 'rgba(78,255,145,0.5)' : 'rgba(0,122,31,0.5)'),
    border:       `1px solid ${filled ? g : (dark ? 'rgba(78,255,145,0.2)' : 'rgba(0,122,31,0.2)')}`,
    transition:   'all 0.12s',
  }
}

// ── MessageRow ─────────────────────────────────────────────────────────────

function MessageRow({ msg, myName, dark }: { msg: LocalMsg; myName: string; dark: boolean }) {

  const muted  = dark ? 'rgba(78,255,145,0.35)' : 'rgba(0,122,31,0.4)'
  const textC  = dark ? '#d4f7e4' : '#0a2010'
  const green  = dark ? '#4eff91' : '#007a1f'

  if (msg.isSystem) {
    return (
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 0,
        padding: '2px 0', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6,
      }}>
        <span style={{ minWidth: 44, flexShrink: 0, color: muted, fontSize: 11 }}>
          {fmt(msg.ts)}
        </span>
        <span style={{ color: muted, fontStyle: 'italic', fontSize: 12 }}>
          · {msg.text}
        </span>
      </div>
    )
  }

  const nameColor = msg.from === myName ? green : peerColor(msg.from, dark)
  const nameWidth = 96

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 0,
      padding: '2px 0', fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6,
    }}>
      <span style={{
        minWidth: 44, flexShrink: 0,
        color: muted, fontSize: 11, paddingTop: 1,
      }}>
        {fmt(msg.ts)}
      </span>
      <span style={{
        minWidth: nameWidth, maxWidth: nameWidth,
        flexShrink: 0, marginRight: 12,
        color: nameColor, fontWeight: 600,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {msg.from}
      </span>
      {msg.file ? (
        <FileOffer file={msg.file} isMine={msg.from === myName} dark={dark} />
      ) : (
        <span style={{
          color: textC, flex: 1, wordBreak: 'break-word', whiteSpace: 'pre-wrap',
        }}>
          {msg.text}
        </span>
      )}
    </div>
  )
}

// ── WelcomeScreen ──────────────────────────────────────────────────────────

function WelcomeScreen({ onJoin, dark, onToggleTheme }: {
  onJoin: (name: string, room: string) => void
  dark: boolean
  onToggleTheme: () => void
}) {
  const [name, setName] = useState(localStorage.getItem(LS_NAME_KEY) ?? '')
  const [room, setRoom] = useState('')
  const canJoin = name.trim() && room.trim()


  const green   = dark ? '#4eff91' : '#007a1f'
  const muted   = dark ? 'rgba(78,255,145,0.40)' : 'rgba(0,122,31,0.45)'
  const border  = dark ? 'rgba(78,255,145,0.13)' : 'rgba(0,122,31,0.10)'
  const textC   = dark ? '#d4f7e4' : '#0a2010'

  const fieldStyle: React.CSSProperties = {
    background: 'transparent', border: 'none',
    borderBottom: `1px solid ${border}`,
    color: textC, caretColor: green,
    fontFamily: 'monospace', fontSize: 13,
    outline: 'none', padding: '6px 0',
    width: '100%', letterSpacing: '0.02em',
  }

  const FEATURES = [
    ['◈', 'peer-to-peer via WebRTC'],
    ['◈', 'no account required'],
    ['◈', 'messages not stored'],
    ['◈', 'works on local network'],
  ]

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
          <button
            onClick={onToggleTheme}
            title="Toggle theme"
            style={{
              background: 'transparent', border: `1px solid ${border}`,
              borderRadius: 2, color: muted,
              fontFamily: 'monospace', fontSize: 13, cursor: 'pointer',
              padding: '3px 8px', lineHeight: 1,
            }}
          >{dark ? '☀' : '☾'}</button>
        </div>

        {/* ── Brand ── */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            fontSize: 48, lineHeight: 1, marginBottom: 16,
            filter: `drop-shadow(0 0 18px ${dark ? 'rgba(78,255,145,0.3)' : 'rgba(0,122,31,0.2)'})`,
          }}>📡</div>

          <h1 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 40, fontWeight: 700, letterSpacing: '-0.04em',
            color: textC, margin: '0 0 10px',
          }}>whisper-room</h1>

          <p style={{
            fontSize: 11, color: muted, margin: 0,
            letterSpacing: '0.16em', textTransform: 'uppercase',
          }}>
            p2p · no server · ephemeral
          </p>
        </div>

        {/* ── Separator ── */}
        <div style={{ borderTop: `1px solid ${border}`, marginBottom: 22 }} />

        {/* ── Features ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 26 }}>
          {FEATURES.map(([icon, text]) => (
            <div key={text} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              fontSize: 12, color: muted,
            }}>
              <span style={{ color: green, fontSize: 10, flexShrink: 0 }}>{icon}</span>
              {text}
            </div>
          ))}
        </div>

        {/* ── Separator ── */}
        <div style={{ borderTop: `1px solid ${border}`, marginBottom: 24 }} />

        {/* ── Form ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{
              fontSize: 9, color: green, letterSpacing: '0.18em',
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
              fontSize: 9, color: green, letterSpacing: '0.18em',
              textTransform: 'uppercase', marginBottom: 8, fontWeight: 600,
            }}>room</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: green, fontSize: 12, flexShrink: 0 }}>▸</span>
              <input
                className="bc-input"
                value={room}
                onChange={e => setRoom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && canJoin && onJoin(name.trim(), room.trim())}
                placeholder="e.g. office, team-a"
                style={fieldStyle}
              />
            </div>
          </div>

          <button
            onClick={() => canJoin && onJoin(name.trim(), room.trim())}
            disabled={!canJoin}
            style={{
              marginTop: 4,
              padding: '12px 0',
              background:   canJoin ? green : 'transparent',
              color:        canJoin ? (dark ? '#0a0a0a' : '#fff') : muted,
              border:       `1px solid ${canJoin ? green : border}`,
              borderRadius: 3,
              fontFamily:   'monospace',
              fontSize:     13, fontWeight: 600, letterSpacing: '0.06em',
              cursor:       canJoin ? 'pointer' : 'default',
              transition:   'all 0.15s',
            }}
          >
            join room →
          </button>
        </div>

        <p style={{
          textAlign: 'center', fontSize: 10, color: muted,
          marginTop: 24, letterSpacing: '0.04em',
        }}>
          same room name = same group
        </p>

        <p style={{ textAlign: 'center', fontSize: 10, marginTop: 16, marginBottom: 0 }}>
          <a
            href="https://freeappstore.online"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: muted, textDecoration: 'none', letterSpacing: '0.04em' }}
          >
            built for freeappstore.online
          </a>
        </p>
      </div>
      </div>
    </div>
  )
}

// ── ChatScreen ─────────────────────────────────────────────────────────────

function ChatScreen({ myName, roomId, onLeave, dark, onToggleTheme }: {
  myName: string; roomId: string; onLeave: () => void; dark: boolean; onToggleTheme: () => void
}) {
  const [messages, setMessages]     = useState<LocalMsg[]>([])
  const [input,    setInput]        = useState('')
  const [peerDisplay, setPeerDisplay] = useState<string[]>([])
  const peerNamesRef  = useRef<Map<string, string>>(new Map())
  const msgActionRef  = useRef<Action<TextPayload>  | null>(null)
  const fileActionRef = useRef<Action<FilePayload>  | null>(null)
  const bottomRef     = useRef<HTMLDivElement>(null)
  const joinedRef     = useRef(false)

  useEffect(() => {
    if (joinedRef.current) return
    joinedRef.current = true

    const room = joinRoom({ appId: 'whisper-room' }, roomId)

    const hello = room.makeAction('hello') as unknown as Action<HelloPayload>
    const msg   = room.makeAction('msg')   as unknown as Action<TextPayload>
    const file  = room.makeAction('file')  as unknown as Action<FilePayload>

    msgActionRef.current  = msg
    fileActionRef.current = file

    setMessages([{
      id: 'sys-self', from: '', text: `joined #${roomId}`, ts: Date.now(), isSystem: true,
    }])

    room.onPeerJoin = (peerId) => {
      hello.send({ displayName: myName }, { target: peerId })
    }

    room.onPeerLeave = (peerId) => {
      const name = peerNamesRef.current.get(peerId) ?? peerId.slice(0, 8)
      peerNamesRef.current.delete(peerId)
      setPeerDisplay(Array.from(peerNamesRef.current.values()))
      setMessages(ms => [...ms, {
        id: `leave-${peerId}-${Date.now()}`,
        from: '', text: `${name} left`, ts: Date.now(), isSystem: true,
      }])
    }

    hello.onMessage = ({ displayName }, { peerId }) => {
      const isNew = !peerNamesRef.current.has(peerId)
      peerNamesRef.current.set(peerId, displayName)
      setPeerDisplay(Array.from(peerNamesRef.current.values()))
      if (isNew) {
        setMessages(ms => [...ms, {
          id: `join-${peerId}-${Date.now()}`,
          from: '', text: `${displayName} joined`, ts: Date.now(), isSystem: true,
        }])
        hello.send({ displayName: myName }, { target: peerId })
      }
    }

    msg.onMessage = ({ text, displayName }) => {
      setMessages(ms => [...ms, {
        id: `msg-${Date.now()}-${Math.random()}`,
        from: displayName, text, ts: Date.now(),
      }])
    }

    file.onMessage = ({ file: f, displayName }) => {
      setMessages(ms => [...ms, {
        id: `file-${Date.now()}-${Math.random()}`,
        from: displayName, text: '', ts: Date.now(), file: f,
      }])
    }

    return () => { room.leave() }
  }, [roomId, myName])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send() {
    const text = input.trim()
    if (!text) return
    msgActionRef.current?.send({ text, displayName: myName })
    setMessages(ms => [...ms, {
      id: `local-${Date.now()}`, from: myName, text, ts: Date.now(),
    }])
    setInput('')
  }

  function sendFile() {
    const f = { id: `f${Date.now()}`, name: 'screenshot.png', size: 820_000 }
    fileActionRef.current?.send({ displayName: myName, file: f })
    setMessages(ms => [...ms, {
      id: `local-file-${Date.now()}`, from: myName, text: '', ts: Date.now(), file: f,
    }])
  }


  const green  = dark ? '#4eff91' : '#007a1f'
  const muted  = dark ? 'rgba(78,255,145,0.38)' : 'rgba(0,122,31,0.42)'
  const border = dark ? 'rgba(78,255,145,0.13)' : 'rgba(0,122,31,0.10)'
  const textC  = dark ? '#d4f7e4' : '#0a2010'
  const online = peerDisplay.length + 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'monospace' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
        paddingTop: 'max(10px, env(safe-area-inset-top))',
        borderBottom: `1px solid ${border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: green, letterSpacing: '-0.01em' }}>
            #{roomId}
          </span>
          <span style={{
            fontSize: 11, color: muted, display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: green,
              display: 'inline-block',
              boxShadow: `0 0 6px ${green}`,
            }} />
            {online} online
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={onToggleTheme}
            title="Toggle theme"
            style={{
              padding: '4px 8px', cursor: 'pointer',
              background: 'transparent',
              border: `1px solid ${border}`,
              borderRadius: 2, color: muted,
              fontFamily: 'monospace', fontSize: 13, lineHeight: 1,
            }}
          >{dark ? '☀' : '☾'}</button>
          <button
            onClick={onLeave}
            style={{
              padding: '4px 10px', cursor: 'pointer',
              background: 'transparent',
              border: `1px solid ${border}`,
              borderRadius: 2, color: muted,
              fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.06em',
            }}
          >leave</button>
        </div>
      </div>

      {/* ── Peers strip ── */}
      <div style={{
        display: 'flex', gap: 0, padding: '6px 16px',
        borderBottom: `1px solid ${border}`,
        overflowX: 'auto', alignItems: 'center',
        fontSize: 11, color: muted,
        flexShrink: 0,
      }}>
        {[myName, ...peerDisplay].map((name, i) => (
          <span key={i === 0 ? selfId : name} style={{ flexShrink: 0 }}>
            <span style={{ color: peerColor(name, dark), fontWeight: 600 }}>
              {name}
            </span>
            {i === 0 && (
              <span style={{ color: muted, fontSize: 10 }}> (you)</span>
            )}
            {i < peerDisplay.length && (
              <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
            )}
          </span>
        ))}
      </div>

      {/* ── Messages ── */}
      <div
        className="bc-scrollbar"
        style={{
          flex: 1, overflowY: 'auto',
          padding: '12px 16px',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {messages.map(m => (
          <MessageRow key={m.id} msg={m} myName={myName} dark={dark} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px',
        paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
        borderTop: `1px solid ${border}`,
      }}>
        <button
          onClick={sendFile}
          title="Send file"
          style={{
            flexShrink: 0, background: 'transparent', border: 'none',
            color: muted, fontSize: 16, cursor: 'pointer', padding: '4px',
            lineHeight: 1,
          }}
        >📎</button>

        <span style={{ color: green, fontSize: 13, flexShrink: 0 }}>▸</span>

        <input
          className="bc-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="type a message…"
          style={{
            flex: 1, background: 'transparent', border: 'none',
            color: textC, caretColor: green,
            fontFamily: 'monospace', fontSize: 13,
            outline: 'none', padding: '4px 0',
          }}
        />

        <button
          onClick={send}
          disabled={!input.trim()}
          style={{
            flexShrink: 0, padding: '5px 14px',
            background:   input.trim() ? green : 'transparent',
            color:        input.trim() ? (dark ? '#0a0a0a' : '#fff') : muted,
            border:       `1px solid ${input.trim() ? green : border}`,
            borderRadius: 2, cursor: input.trim() ? 'pointer' : 'default',
            fontFamily: 'monospace', fontSize: 12, fontWeight: 600,
            letterSpacing: '0.06em', transition: 'all 0.12s',
          }}
        >send</button>
      </div>
    </div>
  )
}

// ── Desktop phone-frame ────────────────────────────────────────────────────

function useIsDesktop() {
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

function PhoneClock() {
  const [time, setTime] = useState(() => {
    const d = new Date()
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0')
  })
  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setTime(d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0'))
    }
    const id = setInterval(tick, 15000)
    return () => clearInterval(id)
  }, [])
  return <span>{time}</span>
}

function PhoneFrame({ children, dark }: { children: React.ReactNode; dark: boolean }) {
  const frameH = Math.min(720, window.innerHeight - 48)
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
        background: bezel,
        borderRadius: 50,
        padding: 10,
        boxShadow: '0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* screen */}
        <div style={{
          flex: 1, borderRadius: 42,
          background: bg,
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          position: 'relative',
        }}>
          {/* iOS status bar */}
          <div style={{
            height: 44, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 22px',
            color: statusC,
            fontFamily: 'system-ui, sans-serif',
            fontSize: 15, fontWeight: 600,
            position: 'relative', zIndex: 10,
          }}>
            {/* time */}
            <PhoneClock />

            {/* Dynamic Island */}
            <div style={{
              position: 'absolute', left: '50%', top: 10,
              transform: 'translateX(-50%)',
              width: 120, height: 34,
              background: '#000',
              borderRadius: 20,
            }} />

            {/* signal + battery */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {/* signal bars */}
              <svg width="17" height="12" viewBox="0 0 17 12" fill={statusC}>
                <rect x="0"  y="7" width="3" height="5" rx="0.8"/>
                <rect x="4.5"  y="4.5" width="3" height="7.5" rx="0.8"/>
                <rect x="9"  y="2" width="3" height="10" rx="0.8"/>
                <rect x="13.5" y="0" width="3" height="12" rx="0.8"/>
              </svg>
              {/* battery */}
              <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
                <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke={statusC} strokeWidth="1"/>
                <rect x="22" y="3.5" width="2.5" height="5" rx="1.25" fill={statusC}/>
                <rect x="2" y="2" width="16" height="8" rx="2" fill={statusC}/>
              </svg>
            </div>
          </div>

          {/* app content — fills remaining height */}
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── App ────────────────────────────────────────────────────────────────────

export default function App() {
  const { theme, setPreference } = useTheme()
  const dark = theme === 'dark'
  const isDesktop = useIsDesktop()
  const [session, setSession] = useState<{ displayName: string; roomId: string } | null>(null)
  const toggleTheme = () => setPreference(dark ? 'light' : 'dark')

  const cssVars = dark ? `
    :root {
      --bc-green:  #4eff91;
      --bc-border: rgba(78,255,145,0.13);
      --bc-muted:  rgba(78,255,145,0.38);
    }
    .bc-input::placeholder { color: rgba(78,255,145,0.3) !important; }
  ` : `
    :root {
      --bc-green:  #007a1f;
      --bc-border: rgba(0,122,31,0.12);
      --bc-muted:  rgba(0,122,31,0.42);
    }
    .bc-input::placeholder { color: rgba(0,122,31,0.35) !important; }
  `

  const content = session ? (
    <ChatScreen
      key={session.roomId}
      myName={session.displayName}
      roomId={session.roomId}
      onLeave={() => setSession(null)}
      dark={dark}
      onToggleTheme={toggleTheme}
    />
  ) : (
    <WelcomeScreen
      dark={dark}
      onToggleTheme={toggleTheme}
      onJoin={(name, room) => {
        localStorage.setItem(LS_NAME_KEY, name)
        setSession({ displayName: name, roomId: room })
      }}
    />
  )

  return (
    <>
      <style>{cssVars}</style>
      {isDesktop ? (
        <PhoneFrame dark={dark}>{content}</PhoneFrame>
      ) : (
        content
      )}
    </>
  )
}
