export interface HelloPayload { displayName: string }
export interface TextPayload  { text: string; displayName: string }
export interface FilePayload  { displayName: string; file: FileInfo }

export interface FileInfo {
  id: string
  name: string
  size: number
  mimeType?: string
}

export interface FileDataPayload {
  id: string
  data: ArrayBuffer
  mimeType: string
}

export interface LocalMsg {
  id: string
  from: string
  text: string
  ts: number
  isSystem?: boolean
  file?: FileInfo
}

// Minimal action shape — avoids trystero's DataPayload constraint in generics
export interface Action<T> {
  send: (data: T, opts?: { target?: string | string[] }) => Promise<void>
  onMessage: ((data: T, ctx: { peerId: string }) => void) | null
}

export interface Session {
  displayName: string
  roomId: string
}
