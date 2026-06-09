export const LS_NAME_KEY = 'whisper-room:name'

const DARK  = ['#4eff91','#61dafb','#ff9b76','#c9a7f5','#f9c74f','#90e0ef','#ff85c2','#a5d6a7']
const LIGHT = ['#00662a','#1565c0','#bf360c','#4a148c','#e65100','#006064','#880e4f','#1b5e20']

export const peerColor = (name: string, dark: boolean) =>
  (dark ? DARK : LIGHT)[name.charCodeAt(0) % 8]
