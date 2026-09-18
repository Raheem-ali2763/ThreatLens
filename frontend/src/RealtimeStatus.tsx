import { useEffect, useState } from "react";

export default function RealtimeStatus() {
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState(
    "Connecting to realtime channel..."
  );

  useEffect(() => {
    const ws = new WebSocket("wss://threatlens-backend-ig3f.onrender.com/ws/alerts");

    ws.onopen = () => {
      setConnected(true);
      setMessage("LIVE ALERT CHANNEL CONNECTED");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "connection") {
          setMessage(data.message);
        }
      } catch {
        setMessage("Realtime message received");
      }
    };

    ws.onerror = () => {
      setConnected(false);
      setMessage("Realtime channel unavailable");
    };

    ws.onclose = () => {
      setConnected(false);
      setMessage("Realtime channel disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 12,
        padding: "7px 11px",
        borderRadius: 8,
        border: "1px solid rgba(100,120,160,.18)",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          display: "inline-block",
          background: connected ? "#22c55e" : "#888",
        }}
      />

      <span>
        {connected ? "LIVE" : "OFFLINE"} — {message}
      </span>
    </div>
  );
}
