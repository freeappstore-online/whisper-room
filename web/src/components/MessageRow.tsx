import type { LocalMsg } from '../types'
import { fmt } from '../utils/format'
import { peerColor } from '../utils/peers'
import { themeTokens } from '../utils/theme'
import { FileOffer } from './FileOffer'

interface Props { msg: LocalMsg; myName: string; dark: boolean }

export function MessageRow({ msg, myName, dark }: Props) {
  const { green, muted, textC } = themeTokens(dark)

  if (msg.isSystem) {
    return (
      <div style={{
        display: 'flex', alignItems: 'baseline',
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

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start',
      padding: '2px 0', fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6,
    }}>
      <span style={{ minWidth: 44, flexShrink: 0, color: muted, fontSize: 11, paddingTop: 1 }}>
        {fmt(msg.ts)}
      </span>
      <span style={{
        minWidth: 96, maxWidth: 96, flexShrink: 0, marginRight: 12,
        color: nameColor, fontWeight: 600,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {msg.from}
      </span>
      {msg.file ? (
        <FileOffer file={msg.file} isMine={msg.from === myName} dark={dark} />
      ) : (
        <span style={{ color: textC, flex: 1, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
          {msg.text}
        </span>
      )}
    </div>
  )
}
