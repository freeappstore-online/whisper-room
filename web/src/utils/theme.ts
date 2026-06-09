export interface ThemeTokens {
  green:  string
  muted:  string
  border: string
  textC:  string
  bg:     string
}

export function themeTokens(dark: boolean): ThemeTokens {
  return dark ? {
    green:  '#4eff91',
    muted:  'rgba(78,255,145,0.38)',
    border: 'rgba(78,255,145,0.13)',
    textC:  '#d4f7e4',
    bg:     '#000000',
  } : {
    green:  '#007a1f',
    muted:  'rgba(0,122,31,0.42)',
    border: 'rgba(0,122,31,0.10)',
    textC:  '#0a2010',
    bg:     '#ffffff',
  }
}
