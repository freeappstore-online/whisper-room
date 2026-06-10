# Whisper Room 📡

A free, private chat app. No sign-up, no servers, no trace.

**Live:** [whisper-room.freeappstore.online](https://whisper-room.freeappstore.online)

---

## For everyone

Whisper Room lets you chat privately with anyone — no account, no phone number, no email. Just pick a name, pick a room, and share the room name (or a QR code) with whoever you want to talk to.

**How to start a chat:**

1. Open the app and type any display name you like.
2. Type a room name — anything works: `coffee`, `project-x`, `family`.
3. Share that room name with the people you want to chat with. Anyone who types the same room name joins your conversation.

**What you can do:**

- Send text messages in real time.
- Send files and images — photos appear inline, any file can be downloaded.
- Share your room as a QR code (tap **⊞** in the chat) so others can scan and join instantly.
- Scan a QR code to join a room without typing.
- Switch between dark and light theme.

**Privacy:**

- Messages exist only while you are in the room. Leave the room and everything disappears — nothing is saved anywhere.
- Your conversation goes directly between devices (peer-to-peer). It does not pass through any server.
- No account, no tracking, no ads. Free forever.

---

## For engineers

### How it works

Whisper Room uses [Trystero](https://github.com/dmotz/trystero) (WebTorrent transport) to establish serverless WebRTC data channels between peers. The room name is the only shared secret — Trystero hashes it to find peers on the BitTorrent DHT tracker network, then negotiates a direct connection.

Three named Trystero actions carry all traffic:

| Action     | Payload                               | Purpose                |
| ---------- | ------------------------------------- | ---------------------- |
| `hello`    | `{ displayName }`                     | Peer handshake on join |
| `msg`      | `{ text, displayName }`               | Text message           |
| `file`     | `{ file: FileInfo, displayName }`     | File metadata          |
| `fileData` | `{ id, data: ArrayBuffer, mimeType }` | Raw file bytes         |

File data is sent as `ArrayBuffer` over the data channel. On receipt the browser creates a `Blob` → `URL.createObjectURL`, so downloads never touch a server. Blob URLs are revoked on room leave.

### Project structure

```text
web/src/
  App.tsx                    # root — theme, session state, desktop frame
  types.ts                   # shared interfaces (FileInfo, LocalMsg, Action<T>, …)
  utils/
    format.ts                # fmt(), fmtSize()
    peers.ts                 # peer color palette, LS_NAME_KEY
    theme.ts                 # themeTokens(dark) → { green, muted, border, textC, bg }
  hooks/
    useIsDesktop.ts          # reactive matchMedia ≥ 720 px
    useOnline.ts             # navigator.onLine + online/offline events
  components/
    WelcomeScreen.tsx        # join form; reads ?room= from URL; QR scanner
    ChatScreen.tsx           # room logic, file transfer, QR share modal
    MessageRow.tsx           # messenger-style bubble (sent right / received left)
    FileOffer.tsx            # file card — image preview, download button
    PhoneFrame.tsx           # iOS bezel + status bar shown on desktop
    OfflineScreen.tsx        # fixed overlay when navigator.onLine = false
    QRModal.tsx              # SVG QR code + copy-link (qrcode.react)
    QRScanner.tsx            # camera → canvas → jsQR decode loop
```

### Stack

| Layer          | Library                                                              |
| -------------- | -------------------------------------------------------------------- |
| Build          | Vite 8 + React 19 + TypeScript 6                                     |
| P2P transport  | [@trystero-p2p/torrent](https://github.com/dmotz/trystero) 0.25      |
| QR generation  | [qrcode.react](https://github.com/zpao/qrcode.react)                 |
| QR scanning    | [jsQR](https://github.com/cozmo/jsQR)                                |
| Styling        | Inline styles + CSS custom properties (no CSS-in-JS runtime)         |
| PWA            | vite-plugin-pwa (Workbox)                                            |
| Platform       | [@freeappstore/sdk](https://freeappstore.online) — theme, compliance |

### Dev & deploy

```bash
pnpm install
pnpm dev              # Vite dev server with HMR

pnpm build            # tsc + Vite build → web/dist/
pnpm fas check        # FreeAppStore compliance check
pnpm fas screencheck  # Playwright viewport regression (12 device sizes)

git push origin main  # triggers GitHub Actions → deploy to Cloudflare R2
```

### Compliance notes

- All `fontFamily` values use only `'monospace'`, `system-ui`, or the brand fonts (`Manrope`, `Fraunces`) — no named web fonts in inline styles.
- `#root` is constrained to `height: 100dvh; overflow: hidden` so the document never scrolls (required by `fas screencheck`).
- Input `font-size` is forced to `16px` via CSS `!important` to prevent iOS Safari auto-zoom on focus.
- `web/public/manifest.json` is a static copy of the PWA manifest (required by the screencheck CLI).

## License

MIT.
