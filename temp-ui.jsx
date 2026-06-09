import { useState, useRef, useEffect } from "react";

const ME = "Minh";
const PEERS = ["Lan", "Tuấn"];

const INIT_MSGS = [
  { id: 1, from: "system", text: "Lan joined #office", ts: Date.now() - 300000 },
  { id: 2, from: "Lan", text: "hey team 👋", ts: Date.now() - 280000 },
  { id: 3, from: "Tuấn", text: "chào mọi người!", ts: Date.now() - 260000 },
  { id: 4, from: "system", text: "Tuấn joined #office", ts: Date.now() - 259000 },
  { id: 5, from: "Lan", text: "ai có file design mới không?", ts: Date.now() - 120000 },
  {
    id: 6, from: "Tuấn", text: "", ts: Date.now() - 90000, type: "file-offer",
    file: { id: "f1", name: "design-v3.figma", size: 4200000, mimeType: "application/figma" }
  },
  { id: 7, from: "Lan", text: "ok nhận rồi, cảm ơn!", ts: Date.now() - 60000 },
  { id: 8, from: "Minh", text: "tôi vừa vào, có gì mới không?", ts: Date.now() - 30000 },
  { id: 9, from: "Lan", text: "đang review design, Tuấn vừa gửi file", ts: Date.now() - 20000 },
];

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function formatSize(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function Avatar({ name, size = 28 }) {
  const colors = ["#d86f4d","#4c97b5","#4d9a6a","#9b6fd8","#d8b44d"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color, color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.42, fontWeight: 700, flexShrink: 0,
      fontFamily: "Manrope, sans-serif",
    }}>
      {name[0]}
    </div>
  );
}

function FileTransferDemo({ file, isMine }) {
  const [state, setState] = useState("idle"); // idle | receiving | done
  const [progress, setProgress] = useState(0);

  function accept() {
    setState("receiving");
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18 + 5;
      if (p >= 100) { p = 100; clearInterval(iv); setState("done"); }
      setProgress(Math.min(p, 100));
    }, 120);
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 14, padding: "10px 14px",
      minWidth: 220, maxWidth: 260,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: "rgba(216,111,77,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, flexShrink: 0,
        }}>📎</div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: "#f0f0f0",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{file.name}</div>
          <div style={{ fontSize: 11, color: "#888" }}>{formatSize(file.size)}</div>
        </div>
      </div>

      {state === "done" ? (
        <button style={{
          width: "100%", padding: "6px 0", borderRadius: 8,
          background: "#4d9a6a", color: "#fff", fontSize: 12,
          fontWeight: 600, border: "none", cursor: "pointer",
          fontFamily: "Manrope, sans-serif",
        }}>Download ↓</button>
      ) : state === "receiving" ? (
        <div>
          <div style={{
            height: 4, background: "rgba(255,255,255,0.1)",
            borderRadius: 4, overflow: "hidden", marginBottom: 4,
          }}>
            <div style={{
              height: "100%", borderRadius: 4,
              background: "linear-gradient(90deg, #d86f4d, #ff9b76)",
              width: `${progress}%`, transition: "width 0.1s",
            }} />
          </div>
          <div style={{ fontSize: 11, color: "#888", textAlign: "center" }}>
            {Math.round(progress)}%
          </div>
        </div>
      ) : !isMine ? (
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={accept} style={{
            flex: 1, padding: "6px 0", borderRadius: 8,
            background: "#d86f4d", color: "#fff", fontSize: 12,
            fontWeight: 600, border: "none", cursor: "pointer",
            fontFamily: "Manrope, sans-serif",
          }}>Accept</button>
          <button style={{
            flex: 1, padding: "6px 0", borderRadius: 8,
            background: "rgba(255,255,255,0.08)", color: "#aaa", fontSize: 12,
            fontWeight: 600, border: "none", cursor: "pointer",
            fontFamily: "Manrope, sans-serif",
          }}>Decline</button>
        </div>
      ) : (
        <div style={{ fontSize: 11, color: "#666", textAlign: "center" }}>
          Waiting for acceptance…
        </div>
      )}
    </div>
  );
}

function MessageBubble({ msg }) {
  const isMine = msg.from === ME;
  if (msg.type === "system" || msg.from === "system") {
    return (
      <div style={{ textAlign: "center", padding: "2px 0" }}>
        <span style={{
          fontSize: 11, color: "#555",
          background: "rgba(255,255,255,0.04)",
          padding: "2px 10px", borderRadius: 20,
        }}>{msg.text}</span>
      </div>
    );
  }
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: isMine ? "flex-end" : "flex-start",
      gap: 3,
    }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, flexDirection: isMine ? "row-reverse" : "row" }}>
        {!isMine && <Avatar name={msg.from} size={26} />}
        <div style={{ maxWidth: "72%" }}>
          {!isMine && (
            <div style={{ fontSize: 11, color: "#666", marginBottom: 3, paddingLeft: 2 }}>{msg.from}</div>
          )}
          {msg.type === "file-offer" ? (
            <FileTransferDemo file={msg.file} isMine={isMine} />
          ) : (
            <div style={{
              padding: "9px 14px", borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: isMine
                ? "linear-gradient(135deg, #d86f4d, #e8845f)"
                : "rgba(255,255,255,0.07)",
              color: isMine ? "#fff" : "#e8e8e8",
              fontSize: 13.5, lineHeight: 1.5,
              boxShadow: isMine ? "0 2px 12px rgba(216,111,77,0.3)" : "none",
            }}>{msg.text}</div>
          )}
        </div>
      </div>
      <div style={{ fontSize: 10, color: "#444", paddingLeft: isMine ? 0 : 32 }}>
        {formatTime(msg.ts)}
      </div>
    </div>
  );
}

// ── Join Screen ────────────────────────────────────────────────────────────

function JoinScreen({ onJoin }) {
  const [name, setName] = useState("Minh");
  const [room, setRoom] = useState("office");

  return (
    <div style={{
      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: "absolute", top: "15%", left: "10%",
        width: 200, height: 200, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(216,111,77,0.12), transparent 70%)",
        filter: "blur(40px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "20%", right: "8%",
        width: 180, height: 180, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(76,151,181,0.1), transparent 70%)",
        filter: "blur(40px)", pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: 360, position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            fontSize: 44, marginBottom: 8,
            filter: "drop-shadow(0 4px 12px rgba(216,111,77,0.4))",
          }}>📡</div>
          <h1 style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 36, fontWeight: 700,
            color: "#f0f0f0", letterSpacing: "-0.04em",
            margin: "0 0 6px",
          }}>lan-chat</h1>
          <p style={{ fontSize: 13, color: "#555", margin: 0 }}>
            No internet · No server · No account
          </p>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
              Your name
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: "100%", padding: "12px 16px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, color: "#f0f0f0",
                fontSize: 14, fontFamily: "Manrope, sans-serif",
                outline: "none", boxSizing: "border-box",
              }}
              placeholder="e.g. Minh"
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
              Room
            </label>
            <input
              value={room}
              onChange={e => setRoom(e.target.value)}
              style={{
                width: "100%", padding: "12px 16px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, color: "#f0f0f0",
                fontSize: 14, fontFamily: "Manrope, sans-serif",
                outline: "none", boxSizing: "border-box",
              }}
              placeholder="e.g. office"
            />
          </div>
          <button
            onClick={() => onJoin(name, room)}
            disabled={!name.trim() || !room.trim()}
            style={{
              padding: "13px 0", borderRadius: 12,
              background: "linear-gradient(135deg, #d86f4d, #c05a38)",
              color: "#fff", fontSize: 14, fontWeight: 700,
              border: "none", cursor: "pointer",
              fontFamily: "Manrope, sans-serif",
              boxShadow: "0 4px 20px rgba(216,111,77,0.35)",
              marginTop: 4,
            }}
          >
            Join room →
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: "#444", marginTop: 20 }}>
          Everyone on the same network + room name can see each other.
        </p>
      </div>
    </div>
  );
}

// ── Chat Screen ────────────────────────────────────────────────────────────

function ChatScreen({ myName, room, onLeave }) {
  const [messages, setMessages] = useState(INIT_MSGS);
  const [input, setInput] = useState("");
  const [showPeers, setShowPeers] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send() {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, {
      id: Date.now(), from: myName, text, ts: Date.now(), type: "text"
    }]);
    setInput("");
  }

  function sendFakeFile() {
    setMessages(prev => [...prev, {
      id: Date.now(), from: myName, text: "", ts: Date.now(), type: "file-offer",
      file: { id: `f${Date.now()}`, name: "screenshot.png", size: 820000, mimeType: "image/png" }
    }]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(0,0,0,0.3)", backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#f0f0f0", fontFamily: "Manrope, sans-serif" }}>
            #{room}
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            background: "rgba(47,143,87,0.15)",
            border: "1px solid rgba(47,143,87,0.3)",
            borderRadius: 20, padding: "2px 8px",
            fontSize: 11, color: "#74d49a",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#74d49a", display: "inline-block" }} />
            {PEERS.length + 1} online
          </span>
        </div>
        <button
          onClick={onLeave}
          style={{
            padding: "5px 12px", borderRadius: 8,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#666", fontSize: 12, cursor: "pointer",
            fontFamily: "Manrope, sans-serif",
          }}
        >Leave</button>
      </div>

      {/* Peers bar */}
      {showPeers && (
        <div style={{
          display: "flex", gap: 6, padding: "8px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          overflowX: "auto",
        }}>
          {[myName, ...PEERS].map((p, i) => (
            <div key={p} style={{
              display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20, padding: "3px 10px 3px 6px",
            }}>
              <Avatar name={p} size={18} />
              <span style={{ fontSize: 12, color: "#aaa", fontFamily: "Manrope, sans-serif" }}>
                {p}{i === 0 ? " (you)" : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "16px",
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        display: "flex", gap: 8, padding: "12px 16px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(0,0,0,0.3)", backdropFilter: "blur(12px)",
      }}>
        <button
          onClick={sendFakeFile}
          title="Send file"
          style={{
            flexShrink: 0, width: 42, height: 42,
            borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)", fontSize: 18,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >📎</button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Type a message…"
          style={{
            flex: 1, padding: "10px 14px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10, color: "#e8e8e8",
            fontSize: 13.5, fontFamily: "Manrope, sans-serif",
            outline: "none",
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          style={{
            flexShrink: 0, padding: "10px 18px",
            borderRadius: 10, border: "none",
            background: input.trim() ? "linear-gradient(135deg, #d86f4d, #c05a38)" : "rgba(255,255,255,0.06)",
            color: input.trim() ? "#fff" : "#444",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            fontFamily: "Manrope, sans-serif",
            transition: "all 0.15s",
            boxShadow: input.trim() ? "0 2px 12px rgba(216,111,77,0.3)" : "none",
          }}
        >Send</button>
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────

export default function App() {
  const [session, setSession] = useState(null);

  return (
    <div style={{
      width: "100%", height: "100vh", // allow-100vh
      background: "#000",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Manrope, sans-serif",
      overflow: "hidden",
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 0; }
        input::placeholder { color: #444; }
        button { transition: opacity 0.15s, transform 0.12s; }
        button:hover:not(:disabled) { opacity: 0.88; }
        button:active:not(:disabled) { transform: scale(0.97); }
      `}</style>

      {/* Phone frame */}
      <div style={{
        width: 375, height: 720,
        borderRadius: 44,
        border: "8px solid #1a1a1a",
        background: "#050505",
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06), inset 0 0 0 1px rgba(255,255,255,0.03)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Status bar */}
        <div style={{
          height: 44, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px 0 28px",
          background: "rgba(0,0,0,0.6)",
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#e0e0e0" }}>9:41</span>
          <div style={{
            width: 100, height: 24, borderRadius: 12,
            background: "#111", border: "1px solid #222",
          }} />
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#e0e0e0" }}>●●●</span>
          </div>
        </div>

        {/* App content */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
          {session ? (
            <ChatScreen myName={session.name} room={session.room} onLeave={() => setSession(null)} />
          ) : (
            <JoinScreen onJoin={(name, room) => setSession({ name, room })} />
          )}
        </div>
      </div>

      {/* Hint */}
      <div style={{
        position: "absolute", bottom: 20,
        fontSize: 12, color: "#333",
        fontFamily: "Manrope, sans-serif",
      }}>
        Click 📎 to demo file transfer · Enter to send · Click Leave to go back
      </div>
    </div>
  );
}