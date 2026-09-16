import { useEffect, useState } from "react";

type AlertData = {
  type: string;
  id?: number;
  title?: string;
  severity?: string;
  status?: string;
  ioc_id?: number;
  event_id?: number;
  message?: string;
};

export default function LiveAlertOverlay() {
  const [alert, setAlert] = useState<AlertData | null>(null);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: number | undefined;

    const connect = () => {
      socket = new WebSocket("ws://127.0.0.1:8001/ws/alerts");

      socket.onmessage = (event) => {
        try {
          const data: AlertData = JSON.parse(event.data);

          if (data.type === "alert") {
            setAlert(data);

            window.setTimeout(() => {
              setAlert(null);
            }, 7000);
          }
        } catch {
          console.log("Invalid realtime message");
        }
      };

      socket.onclose = () => {
        reconnectTimer = window.setTimeout(connect, 3000);
      };

      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }

      socket?.close();
    };
  }, []);

  if (!alert) return null;

  const severity = String(alert.severity || "alert").toUpperCase();

  return (
    <div
      style={{
        position: "fixed",
        right: "24px",
        bottom: "24px",
        width: "370px",
        zIndex: 99999,
        padding: "18px",
        borderRadius: "14px",
        background: "#090e1c",
        border: "1px solid rgba(255,70,100,.65)",
        boxShadow: "0 20px 60px rgba(0,0,0,.65)",
        color: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <strong
          style={{
            color: "#ff4d6d",
            fontSize: "13px",
            letterSpacing: "1px",
          }}
        >
          🚨 LIVE {severity} THREAT
        </strong>

        <button
          onClick={() => setAlert(null)}
          style={{
            background: "transparent",
            border: "none",
            color: "#888",
            cursor: "pointer",
            fontSize: "18px",
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          fontSize: "16px",
          fontWeight: 700,
          marginBottom: "10px",
        }}
      >
        {alert.title || "Threat detected"}
      </div>

      <div
        style={{
          fontSize: "12px",
          opacity: 0.7,
          lineHeight: 1.8,
        }}
      >
        IOC #{alert.ioc_id ?? "-"} &nbsp;•&nbsp; Event #{alert.event_id ?? "-"}
        <br />
        Status: {alert.status || "open"}
      </div>

      <div
        style={{
          marginTop: "13px",
          paddingTop: "10px",
          borderTop: "1px solid rgba(255,255,255,.08)",
          color: "#8ff0c0",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: ".5px",
        }}
      >
        ● REAL-TIME ALERT RECEIVED
      </div>
    </div>
  );
}
