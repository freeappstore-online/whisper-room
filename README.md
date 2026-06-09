# Whisper Room 📡

A free, serverless P2P chat app — no accounts, no message storage, no tracking.

**Live:** [whisper-room.freeappstore.online](https://whisper-room.freeappstore.online)

## How it works

Enter a display name and a room name. Anyone who types the same room name connects directly to you via WebRTC (powered by [Trystero](https://github.com/dmotz/trystero)). Messages exist only in memory — leave the room and they're gone.

- Peer-to-peer via WebRTC — no relay server
- No account required
- Messages are never stored
- Works on local networks (LAN)
- File sharing between peers
- Dark / light theme toggle
- iOS phone-frame UI on desktop (≥720px)

## Dev

```bash
pnpm install
pnpm dev
```

## Build & deploy

```bash
pnpm build          # Vite + PWA build into web/dist/
git push origin main # auto-deploys to R2 via GitHub Actions
```

## Stack

- [Vite](https://vitejs.dev/) + React + TypeScript
- [@trystero-p2p/torrent](https://github.com/dmotz/trystero) — serverless WebRTC
- [@freeappstore/sdk](https://freeappstore.online) — theme, PWA, compliance

## License

MIT.
