import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { themeTokens } from '../utils/theme'

interface Props {
  roomId: string
  dark: boolean
  onClose: () => void
}

export function QRModal({ roomId, dark, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const { green, muted, border, bg } = themeTokens(dark)

  const url = `${location.origin}/?room=${encodeURIComponent(roomId)}`

  function copyUrl() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: bg, borderRadius: 16,
          border: `1px solid ${border}`,
          padding: '28px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          width: 280, fontFamily: 'monospace',
          boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
        }}
      >
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: green, letterSpacing: '0.06em' }}>
          #{roomId}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: muted, textAlign: 'center', lineHeight: 1.6 }}>
          scan to join this room
        </p>

        {/* QR code */}
        <div style={{
          padding: 12, background: '#ffffff', borderRadius: 10,
          lineHeight: 0,
        }}>
          <QRCodeSVG
            value={url}
            size={180}
            bgColor="#ffffff"
            fgColor="#0a0a0a"
          />
        </div>

        {/* copy URL */}
        <button
          onClick={copyUrl}
          style={{
            width: '100%', padding: '8px 0',
            background: 'transparent',
            border: `1px solid ${border}`,
            borderRadius: 6, cursor: 'pointer',
            color: copied ? green : muted,
            fontFamily: 'monospace', fontSize: 12,
            transition: 'color 0.2s',
          }}
        >
          {copied ? '✓ copied!' : 'copy link'}
        </button>

        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: muted, fontSize: 11, fontFamily: 'monospace',
          }}
        >
          close
        </button>
      </div>
    </div>
  )
}
