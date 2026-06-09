import { useState } from 'react'
import { useTheme } from '@freeappstore/sdk/hooks'
import type { Session } from './types'
import { LS_NAME_KEY } from './utils/peers'
import { useIsDesktop } from './hooks/useIsDesktop'
import { useOnline } from './hooks/useOnline'
import { WelcomeScreen } from './components/WelcomeScreen'
import { ChatScreen } from './components/ChatScreen'
import { PhoneFrame } from './components/PhoneFrame'
import { OfflineScreen } from './components/OfflineScreen'

const CSS_VARS = {
  dark: `
    :root {
      --bc-green:  #4eff91;
      --bc-border: rgba(78,255,145,0.13);
      --bc-muted:  rgba(78,255,145,0.38);
    }
    .bc-input::placeholder { color: rgba(78,255,145,0.3) !important; }
  `,
  light: `
    :root {
      --bc-green:  #007a1f;
      --bc-border: rgba(0,122,31,0.12);
      --bc-muted:  rgba(0,122,31,0.42);
    }
    .bc-input::placeholder { color: rgba(0,122,31,0.35) !important; }
  `,
}

export default function App() {
  const { theme, setPreference } = useTheme()
  const dark      = theme === 'dark'
  const isDesktop = useIsDesktop()
  const online    = useOnline()
  const [session, setSession] = useState<Session | null>(null)

  const toggleTheme = () => setPreference(dark ? 'light' : 'dark')

  const content = session ? (
    <ChatScreen
      key={session.roomId}
      myName={session.displayName}
      roomId={session.roomId}
      dark={dark}
      onLeave={() => setSession(null)}
      onToggleTheme={toggleTheme}
    />
  ) : (
    <WelcomeScreen
      dark={dark}
      onToggleTheme={toggleTheme}
      onJoin={(name, room) => {
        localStorage.setItem(LS_NAME_KEY, name)
        setSession({ displayName: name, roomId: room })
      }}
    />
  )

  return (
    <>
      <style>{dark ? CSS_VARS.dark : CSS_VARS.light}</style>
      {!online && <OfflineScreen dark={dark} />}
      {isDesktop ? <PhoneFrame dark={dark}>{content}</PhoneFrame> : content}
    </>
  )
}
