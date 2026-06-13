import type { LocalMsg } from '../types'
import { fmt } from '../utils/format'
import { peerColor } from '../utils/peers'
import { themeTokens } from '../utils/theme'
import { FileOffer } from './FileOffer'

interface Props {
  msg: LocalMsg
  myName: string
  dark: boolean
  blobUrl?: string
  isAccepted?: boolean
  onAccept?: () => void
  onReject?: () => void
}

export function MessageRow({ msg, myName, dark, blobUrl, isAccepted, onAccept, onReject }: Props) {
  const { green, muted, border, textC } = themeTokens(dark)
  const isMine = msg.from === myName

  // system message — centered italic line
  if (msg.isSystem) {
    return (
      <div style={{
        textAlign: 'center', padding: '6px 0',
        fontFamily: 'monospace', fontSize: 11,
        color: muted, fontStyle: 'italic',
      }}>
        · {msg.text} ·
      </div>
    )
  }

  const bubbleBg = isMine
    ? green
    : (dark ? 'rgba(78,255,145,0.1)' : 'rgba(0,122,31,0.07)')

  const bubbleText = isMine
    ? (dark ? '#0a0a0a' : '#ffffff')
    : textC

  // cut the inner corner (iMessage-style)
  const bubbleRadius = isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px'

  const nameColor = peerColor(msg.from, dark)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: isMine ? 'flex-end' : 'flex-start',
      padding: '3px 0',
    }}>
      {/* sender name — only for received messages */}
      {!isMine && (
        <span style={{
          fontSize: 11, fontFamily: 'monospace', fontWeight: 600,
          color: nameColor, marginBottom: 3, marginLeft: 4,
        }}>
          {msg.from}
        </span>
      )}

      {/* bubble */}
      <div style={{
        maxWidth: '75%',
        background: bubbleBg,
        color: bubbleText,
        borderRadius: bubbleRadius,
        padding: msg.file ? '10px 12px' : '8px 14px',
        border: isMine ? 'none' : `1px solid ${border}`,
        fontFamily: 'monospace', fontSize: 13, lineHeight: 1.5,
        wordBreak: 'break-word', whiteSpace: msg.file ? undefined : 'pre-wrap',
      }}>
        {msg.file ? (
          <FileOffer
              file={msg.file} isMine={isMine} dark={dark} blobUrl={blobUrl}
              isAccepted={isAccepted}
              onAccept={onAccept}
              onReject={onReject}
            />
        ) : (
          msg.text
        )}
      </div>

      {/* timestamp below bubble */}
      <span style={{
        fontSize: 10, fontFamily: 'monospace',
        color: muted, marginTop: 3,
        marginLeft: isMine ? 0 : 4,
        marginRight: isMine ? 4 : 0,
      }}>
        {fmt(msg.ts)}
      </span>
    </div>
  )
}
