import type { FileInfo } from '../types'
import { fmtSize } from '../utils/format'

interface Props {
  file: FileInfo
  isMine: boolean
  dark: boolean
  blobUrl?: string
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

function download(url: string, name: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
}

export function FileOffer({ file, isMine, dark, blobUrl }: Props) {
  const isImage   = !!file.mimeType?.startsWith('image/')
  const textMuted = isMine
    ? (dark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.7)')
    : (dark ? 'rgba(78,255,145,0.45)' : 'rgba(0,122,31,0.5)')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* image preview */}
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

      {/* action */}
      {blobUrl ? (
        <button
          onClick={() => download(blobUrl, file.name)}
          style={{
            alignSelf: 'flex-start',
            padding: '4px 12px', borderRadius: 6, cursor: 'pointer',
            fontSize: 11, fontFamily: 'monospace', fontWeight: 600,
            background: isMine
              ? (dark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.3)')
              : (dark ? 'rgba(78,255,145,0.15)' : 'rgba(0,122,31,0.1)'),
            color: isMine
              ? (dark ? '#0a0a0a' : '#fff')
              : (dark ? '#4eff91' : '#007a1f'),
            border: 'none',
          }}
        >
          ↓ download
        </button>
      ) : !isMine ? (
        <span style={{ fontSize: 11, color: textMuted }}>receiving···</span>
      ) : null}
    </div>
  )
}
