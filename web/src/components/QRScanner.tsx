import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { themeTokens } from '../utils/theme'

interface Props {
  dark: boolean
  onScan: (roomId: string) => void
  onClose: () => void
}

export function QRScanner({ dark, onScan, onClose }: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)
  const [error, setError] = useState<string | null>(null)

  const { green, muted, border, bg } = themeTokens(dark)

  useEffect(() => {
    let stream: MediaStream | null = null

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then(s => {
        stream = s
        const video = videoRef.current
        if (!video) return
        video.srcObject = s
        video.play()
        scan()
      })
      .catch(() => setError('camera access denied'))

    function scan() {
      const video  = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width  = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(video, 0, 0)
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imgData.data, imgData.width, imgData.height)
        if (code?.data) {
          stream?.getTracks().forEach(t => t.stop())
          // Try to parse ?room= from a URL, otherwise use raw data as room name
          try {
            const room = new URL(code.data).searchParams.get('room')
            onScan(room ?? code.data)
          } catch {
            onScan(code.data)
          }
          return
        }
      }
      rafRef.current = requestAnimationFrame(scan)
    }

    return () => {
      cancelAnimationFrame(rafRef.current)
      stream?.getTracks().forEach(t => t.stop())
    }
  }, [onScan])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: bg, borderRadius: 16, border: `1px solid ${border}`,
          padding: '20px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 14, width: 290, fontFamily: 'monospace',
        }}
      >
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: green, letterSpacing: '0.06em' }}>
          scan room QR
        </p>

        {error ? (
          <p style={{ margin: 0, fontSize: 12, color: '#ff7a72', textAlign: 'center', lineHeight: 1.6 }}>
            {error}
          </p>
        ) : (
          <div style={{ position: 'relative', width: 240, height: 240, borderRadius: 10, overflow: 'hidden' }}>
            <video
              ref={videoRef}
              muted playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* corner finder overlay */}
            {['0 0', '0 auto', 'auto 0', 'auto auto'].map((_pos, i) => (
              <div key={i} style={{
                position: 'absolute',
                top:    i < 2 ? 8 : undefined, bottom: i >= 2 ? 8 : undefined,
                left:   i % 2 === 0 ? 8 : undefined, right: i % 2 === 1 ? 8 : undefined,
                width: 24, height: 24,
                borderTop:    i < 2  ? `2px solid ${green}` : undefined,
                borderBottom: i >= 2 ? `2px solid ${green}` : undefined,
                borderLeft:   i % 2 === 0 ? `2px solid ${green}` : undefined,
                borderRight:  i % 2 === 1 ? `2px solid ${green}` : undefined,
              }} />
            ))}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        )}

        <p style={{ margin: 0, fontSize: 11, color: muted, textAlign: 'center' }}>
          point at a whisper-room QR code
        </p>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: muted, fontSize: 11, fontFamily: 'monospace',
          }}
        >
          cancel
        </button>
      </div>
    </div>
  )
}
