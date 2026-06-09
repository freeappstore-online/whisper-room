import { useState } from 'react'
import type { FileInfo } from '../types'
import { fmtSize } from '../utils/format'
import { themeTokens } from '../utils/theme'

function btnStyle(g: string, dark: boolean, filled: boolean): React.CSSProperties {
  return {
    padding: '3px 10px', borderRadius: 2, cursor: 'pointer', fontSize: 11, letterSpacing: '0.05em',
    fontFamily: 'monospace', fontWeight: 500,
    background: filled ? g : 'transparent',
    color:      filled ? (dark ? '#0a0a0a' : '#fff') : (dark ? 'rgba(78,255,145,0.5)' : 'rgba(0,122,31,0.5)'),
    border:     `1px solid ${filled ? g : (dark ? 'rgba(78,255,145,0.2)' : 'rgba(0,122,31,0.2)')}`,
    transition: 'all 0.12s',
  }
}

interface Props { file: FileInfo; isMine: boolean; dark: boolean }

export function FileOffer({ file, isMine, dark }: Props) {
  const [phase, setPhase] = useState<'idle' | 'progress' | 'done'>('idle')
  const [pct, setPct]     = useState(0)

  const { green: g, textC } = themeTokens(dark)
  const fileBorder = dark ? 'rgba(78,255,145,0.18)' : 'rgba(0,122,31,0.15)'

  function accept() {
    setPhase('progress')
    let p = 0
    const iv = setInterval(() => {
      p += Math.random() * 18 + 5
      if (p >= 100) { p = 100; clearInterval(iv); setPhase('done') }
      setPct(Math.min(p, 100))
    }, 120)
  }

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 6, marginTop: 2 }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        border: `1px solid ${fileBorder}`, borderRadius: 3, padding: '4px 10px',
        fontFamily: 'monospace', fontSize: 12, color: textC,
      }}>
        <span style={{ color: g }}>📎</span>
        <span>{file.name}</span>
        <span style={{ color: dark ? 'rgba(78,255,145,0.4)' : 'rgba(0,122,31,0.5)', fontSize: 11 }}>
          {fmtSize(file.size)}
        </span>
      </span>

      {phase === 'done' ? (
        <span><button style={btnStyle(g, dark, true)}>↓ download</button></span>
      ) : phase === 'progress' ? (
        <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 3, minWidth: 160 }}>
          <span style={{ display: 'block', height: 3, background: fileBorder, borderRadius: 2, overflow: 'hidden' }}>
            <span style={{ display: 'block', height: '100%', background: g, width: `${pct}%`, transition: 'width 0.1s' }} />
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
