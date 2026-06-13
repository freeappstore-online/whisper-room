import type { FileInfo } from '../types'
import { fmtSize } from '../utils/format'

interface Props {
  file: FileInfo
  isMine: boolean
  dark: boolean
  blobUrl?: string
  isAccepted?: boolean
  onAccept?: () => void
  onReject?: () => void
}

const ICON: Record<string, string> = {
  'image': '🖼',
  'video': '🎬',
  'audio': '🎵',
  'application/pdf': '📄',
}

function fileIcon(mimeType?: string) {
  if (!mimeType) return '📎'
  const cat = mimeType.split('/')[0]
  return ICON[mimeType] ?? ICON[cat] ?? '📎'
}

// iOS Safari requires the <a> to be in the DOM before .click()
function download(url: string, name: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export function FileOffer({ file, isMine, dark, blobUrl, isAccepted, onAccept, onReject }: Props) {
  const isImage   = !!file.mimeType?.startsWith('image/')
  const textMuted = isMine
    ? (dark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.7)')
    : (dark ? 'rgba(78,255,145,0.45)' : 'rgba(0,122,31,0.5)')

  const btnBase: React.CSSProperties = {
    padding: '4px 12px', borderRadius: 6, cursor: 'pointer',
    fontSize: 11, fontFamily: 'monospace', fontWeight: 600, border: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* image preview — only shown once blob is ready */}
      {isImage && blobUrl && (
        <img
          src={blobUrl}
          alt={file.name}
          style={{ maxWidth: 220, borderRadius: 8, display: 'block' }}
        />
      )}

      {/* file info row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
        <span>{fileIcon(file.mimeType)}</span>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.name}
        </span>
        <span style={{ color: textMuted, flexShrink: 0, fontSize: 11 }}>
          {fmtSize(file.size)}
        </span>
      </div>

      {/* action area */}
      {blobUrl ? (
        <button
          onClick={() => download(blobUrl, file.name)}
          style={{
            ...btnBase,
            alignSelf: 'flex-start',
            background: isMine
              ? (dark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.3)')
              : (dark ? 'rgba(78,255,145,0.15)' : 'rgba(0,122,31,0.1)'),
            color: isMine
              ? (dark ? '#0a0a0a' : '#fff')
              : (dark ? '#4eff91' : '#007a1f'),
          }}
        >
          ↓ download
        </button>
      ) : !isMine ? (
        isAccepted ? (
          <span style={{ fontSize: 11, color: textMuted }}>downloading···</span>
        ) : (
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={onAccept}
              style={{
                ...btnBase,
                background: dark ? 'rgba(78,255,145,0.2)' : 'rgba(0,122,31,0.12)',
                color: dark ? '#4eff91' : '#007a1f',
              }}
            >
              accept
            </button>
            <button
              onClick={onReject}
              style={{
                ...btnBase,
                background: 'transparent',
                color: textMuted,
              }}
            >
              reject
            </button>
          </div>
        )
      ) : null}
    </div>
  )
}
