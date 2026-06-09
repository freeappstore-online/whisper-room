export const fmt = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export const fmtSize = (b: number) =>
  b < 1024        ? `${b} B`
  : b < 1_048_576 ? `${(b / 1024).toFixed(1)} KB`
  :                 `${(b / 1_048_576).toFixed(1)} MB`
