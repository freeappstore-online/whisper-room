import { useState, useEffect, useRef } from 'react'
import { joinRoom, selfId } from '@trystero-p2p/torrent'
import type { Action, HelloPayload, TextPayload, FilePayload, FileDataPayload, LocalMsg } from '../types'
import { peerColor } from '../utils/peers'
import { themeTokens } from '../utils/theme'
import { MessageRow } from './MessageRow'
import { QRModal } from './QRModal'

interface Props {
  myName: string
  roomId: string
  dark: boolean
  onLeave: () => void
  onToggleTheme: () => void
}

export function ChatScreen({ myName, roomId, dark, onLeave, onToggleTheme }: Props) {
  const [messages,    setMessages]    = useState<LocalMsg[]>([])
  const [input,       setInput]       = useState('')
  const [peerDisplay, setPeerDisplay] = useState<string[]>([])
  const [readyFiles,  setReadyFiles]  = useState<Record<string, string>>({})
  const [showQR,      setShowQR]      = useState(false)

  const peerNamesRef    = useRef<Map<string, string>>(new Map())
  const msgActionRef    = useRef<Action<TextPayload>    | null>(null)
  const fileActionRef   = useRef<Action<FilePayload>    | null>(null)
  const fileDataActionRef = useRef<Action<FileDataPayload> | null>(null)
  const fileInputRef    = useRef<HTMLInputElement>(null)
  const blobUrlsRef     = useRef<string[]>([])
  const bottomRef       = useRef<HTMLDivElement>(null)
  const joinedRef       = useRef(false)

  const { green, muted, border, textC } = themeTokens(dark)
  const onlineCount = peerDisplay.length + 1

  useEffect(() => {
    if (joinedRef.current) return
    joinedRef.current = true

    const room     = joinRoom({ appId: 'whisper-room' }, roomId)
    const hello    = room.makeAction('hello')    as unknown as Action<HelloPayload>
    const msg      = room.makeAction('msg')      as unknown as Action<TextPayload>
    const file     = room.makeAction('file')     as unknown as Action<FilePayload>
    const fileData = room.makeAction('fileData') as unknown as Action<FileDataPayload>

    msgActionRef.current      = msg
    fileActionRef.current     = file
    fileDataActionRef.current = fileData

    setMessages([{ id: 'sys-self', from: '', text: `joined #${roomId}`, ts: Date.now(), isSystem: true }])

    room.onPeerJoin = peerId => hello.send({ displayName: myName }, { target: peerId })

    room.onPeerLeave = peerId => {
      const name = peerNamesRef.current.get(peerId) ?? peerId.slice(0, 8)
      peerNamesRef.current.delete(peerId)
      setPeerDisplay(Array.from(peerNamesRef.current.values()))
      setMessages(ms => [...ms, {
        id: `leave-${peerId}-${Date.now()}`, from: '', text: `${name} left`, ts: Date.now(), isSystem: true,
      }])
    }

    hello.onMessage = ({ displayName }, { peerId }) => {
      const isNew = !peerNamesRef.current.has(peerId)
      peerNamesRef.current.set(peerId, displayName)
      setPeerDisplay(Array.from(peerNamesRef.current.values()))
      if (isNew) {
        setMessages(ms => [...ms, {
          id: `join-${peerId}-${Date.now()}`, from: '', text: `${displayName} joined`, ts: Date.now(), isSystem: true,
        }])
        hello.send({ displayName: myName }, { target: peerId })
      }
    }

    msg.onMessage = ({ text, displayName }) => {
      setMessages(ms => [...ms, {
        id: `msg-${Date.now()}-${Math.random()}`, from: displayName, text, ts: Date.now(),
      }])
    }

    file.onMessage = ({ file: f, displayName }) => {
      setMessages(ms => [...ms, {
        id: `file-${Date.now()}-${Math.random()}`, from: displayName, text: '', ts: Date.now(), file: f,
      }])
    }

    fileData.onMessage = ({ id, data, mimeType }) => {
      const blob = new Blob([data], { type: mimeType })
      const url  = URL.createObjectURL(blob)
      blobUrlsRef.current.push(url)
      setReadyFiles(prev => ({ ...prev, [id]: url }))
    }

    return () => {
      room.leave()
      blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url))
    }
  }, [roomId, myName])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send() {
    const text = input.trim()
    if (!text) return
    msgActionRef.current?.send({ text, displayName: myName })
    setMessages(ms => [...ms, { id: `local-${Date.now()}`, from: myName, text, ts: Date.now() }])
    setInput('')
  }

  async function sendFile(f: File) {
    const id       = `f${Date.now()}`
    const mimeType = f.type || 'application/octet-stream'
    const fileInfo = { id, name: f.name, size: f.size, mimeType }
    const data     = await f.arrayBuffer()

    // Send metadata + raw data to peers
    await fileActionRef.current?.send({ displayName: myName, file: fileInfo })
    await fileDataActionRef.current?.send({ id, data, mimeType })

    // Sender gets local preview immediately
    const blob = new Blob([data], { type: mimeType })
    const url  = URL.createObjectURL(blob)
    blobUrlsRef.current.push(url)
    setReadyFiles(prev => ({ ...prev, [id]: url }))
    setMessages(ms => [...ms, { id: `local-file-${Date.now()}`, from: myName, text: '', ts: Date.now(), file: fileInfo }])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'monospace' }}>

      {/* header */}
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
          <span style={{ fontSize: 11, color: muted, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: green, display: 'inline-block', boxShadow: `0 0 6px ${green}` }} />
            {onlineCount} online
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setShowQR(true)} title="Share room QR" style={{
            padding: '4px 8px', cursor: 'pointer', background: 'transparent',
            border: `1px solid ${border}`, borderRadius: 2, color: muted,
            fontFamily: 'monospace', fontSize: 13, lineHeight: 1,
          }}>⊞</button>
          <button onClick={onToggleTheme} title="Toggle theme" style={{
            padding: '4px 8px', cursor: 'pointer', background: 'transparent',
            border: `1px solid ${border}`, borderRadius: 2, color: muted,
            fontFamily: 'monospace', fontSize: 13, lineHeight: 1,
          }}>{dark ? '☀' : '☾'}</button>
          <button onClick={onLeave} style={{
            padding: '4px 10px', cursor: 'pointer', background: 'transparent',
            border: `1px solid ${border}`, borderRadius: 2, color: muted,
            fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.06em',
          }}>leave</button>
        </div>
      </div>

      {/* peers strip */}
      <div style={{
        display: 'flex', padding: '6px 16px',
        borderBottom: `1px solid ${border}`,
        overflowX: 'auto', alignItems: 'center',
        fontSize: 11, color: muted, flexShrink: 0,
      }}>
        {[myName, ...peerDisplay].map((name, i) => (
          <span key={i === 0 ? selfId : name} style={{ flexShrink: 0 }}>
            <span style={{ color: peerColor(name, dark), fontWeight: 600 }}>{name}</span>
            {i === 0 && <span style={{ color: muted, fontSize: 10 }}> (you)</span>}
            {i < peerDisplay.length && <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>}
          </span>
        ))}
      </div>

      {/* messages */}
      <div className="bc-scrollbar" style={{
        flex: 1, overflowY: 'auto', padding: '12px 16px',
        display: 'flex', flexDirection: 'column',
      }}>
        {messages.map(m => (
          <MessageRow
            key={m.id} msg={m} myName={myName} dark={dark}
            blobUrl={m.file ? readyFiles[m.file.id] : undefined}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* input bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px',
        paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
        borderTop: `1px solid ${border}`,
      }}>
        {/* hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="*/*"
          style={{ display: 'none' }}
          onChange={e => {
            const f = e.target.files?.[0]
            if (f) sendFile(f)
            e.target.value = ''
          }}
        />
        <button onClick={() => fileInputRef.current?.click()} title="Send file" style={{
          flexShrink: 0, background: 'transparent', border: 'none',
          color: muted, fontSize: 18, cursor: 'pointer', padding: '4px', lineHeight: 1,
        }}>📎</button>

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
            fontFamily: 'monospace',
            outline: 'none', padding: '4px 0',
          }}
        />

        <button
          onClick={send}
          disabled={!input.trim()}
          style={{
            flexShrink: 0, padding: '5px 14px',
            background: input.trim() ? green : 'transparent',
            color:      input.trim() ? (dark ? '#0a0a0a' : '#fff') : muted,
            border:     `1px solid ${input.trim() ? green : border}`,
            borderRadius: 2, cursor: input.trim() ? 'pointer' : 'default',
            fontFamily: 'monospace', fontSize: 12, fontWeight: 600,
            letterSpacing: '0.06em', transition: 'all 0.12s',
          }}
        >send</button>
      </div>

      {showQR && <QRModal roomId={roomId} dark={dark} onClose={() => setShowQR(false)} />}
    </div>
  )
}
