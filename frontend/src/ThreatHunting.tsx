import { useState } from "react";
import {
  Search,
  RefreshCw,
  ShieldAlert,
  Activity,
  AlertTriangle,
  Database,
  Crosshair,
} from "lucide-react";

const API = "http://127.0.0.1:8001";

type HuntResult = {
  query: string;
  total: number;
  iocs: Array<{
    id: number;
    ioc_type: string;
    value: string;
    source: string;
    confidence: number;
    tags: string | null;
    is_active: boolean;
  }>;
  events: Array<{
    id: number;
    event_type: string;
    source_ip: string | null;
    destination_ip: string | null;
    destination_domain: string | null;
    hostname: string | null;
    username: string | null;
    severity: string;
    created_at: string;
  }>;
  alerts: Array<{
    id: number;
    title: string;
    severity: string;
    status: string;
    ioc_id: number | null;
    event_id: number | null;
    created_at: string;
  }>;
  incidents: Array<{
    id: number;
    title: string;
    severity: string;
    status: string;
    alert_id: number | null;
    created_at: string;
  }>;
};

export default function ThreatHunting() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<HuntResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hunt = async (value?: string) => {
    const searchValue = (value ?? query).trim();

    if (!searchValue) {
      setError("Enter an IOC, IP, domain, hostname, alert or keyword.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API}/api/hunting/search?q=${encodeURIComponent(searchValue)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(
        err instanceof Error
          ? err.message
          : "Threat hunting request failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const severityClass = (severity: string) => {
    const value = severity.toLowerCase();

    if (value === "critical") return "alert-critical";
    if (value === "high") return "alert-high";
    if (value === "medium") return "alert-medium";
    return "alert-low";
  };

  return (
    <div className="page-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h1>Threat Hunting</h1>
          <p>
            Search IOCs, internal events, alerts and incidents across ThreatLens.
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <div
        className="card"
        style={{
          padding: 20,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
          }}
        >
          <div
            style={{
              flex: 1,
              position: "relative",
            }}
          >
            <Search
              size={18}
              style={{
                position: "absolute",
                left: 14,
                top: 14,
                opacity: 0.6,
              }}
            />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") hunt();
              }}
              placeholder="Search IP, domain, IOC, hostname, alert..."
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px 12px 42px",
              }}
            />
          </div>

          <button
            onClick={() => hunt()}
            disabled={loading}
            className="primary-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {loading ? (
              <RefreshCw size={16} />
            ) : (
              <Crosshair size={16} />
            )}

            {loading ? "Hunting..." : "Hunt"}
          </button>
        </div>

        <div
          style={{
            marginTop: 12,
            fontSize: 12,
            opacity: 0.6,
          }}
        >
          Try: 185.220.101.4
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div
          style={{
            padding: 15,
            marginBottom: 20,
            borderRadius: 10,
            border: "1px solid rgba(255,80,100,.3)",
            background: "rgba(255,40,70,.06)",
          }}
        >
          <strong>Hunt failed</strong>
          <div style={{ marginTop: 5, opacity: 0.75 }}>
            {error}
          </div>
        </div>
      )}

      {/* SUMMARY */}
      {result && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 14,
              marginBottom: 20,
            }}
          >
            <div className="stat-card">
              <span>TOTAL MATCHES</span>
              <strong>{result.total}</strong>
            </div>

            <div className="stat-card">
              <span>IOCs</span>
              <strong>{result.iocs.length}</strong>
            </div>

            <div className="stat-card">
              <span>EVENTS</span>
              <strong>{result.events.length}</strong>
            </div>

            <div className="stat-card">
              <span>ALERTS</span>
              <strong>{result.alerts.length}</strong>
            </div>

            <div className="stat-card">
              <span>INCIDENTS</span>
              <strong>{result.incidents.length}</strong>
            </div>
          </div>

          <div
            style={{
              marginBottom: 20,
              fontSize: 13,
              opacity: 0.7,
            }}
          >
            Search result for:{" "}
            <strong>{result.query}</strong>
          </div>

          {/* IOCs */}
          <section className="card" style={{ padding: 20, marginBottom: 18 }}>
            <h2>
              <Database
                size={18}
                style={{ verticalAlign: "middle", marginRight: 8 }}
              />
              IOC Matches
            </h2>

            {result.iocs.length === 0 ? (
              <p>No IOC matches.</p>
            ) : (
              result.iocs.map((ioc) => (
                <div
                  key={ioc.id}
                  style={{
                    padding: 14,
                    marginTop: 10,
                    borderTop: "1px solid rgba(100,120,160,.15)",
                  }}
                >
                  <strong>{ioc.value}</strong>

                  <div
                    style={{
                      marginTop: 7,
                      display: "flex",
                      gap: 16,
                      flexWrap: "wrap",
                      fontSize: 12,
                      opacity: 0.75,
                    }}
                  >
                    <span>Type: {ioc.ioc_type}</span>
                    <span>Source: {ioc.source}</span>
                    <span>Confidence: {ioc.confidence}</span>
                    <span>
                      Active: {ioc.is_active ? "Yes" : "No"}
                    </span>
                    {ioc.tags && <span>Tags: {ioc.tags}</span>}
                  </div>
                </div>
              ))
            )}
          </section>

          {/* EVENTS */}
          <section className="card" style={{ padding: 20, marginBottom: 18 }}>
            <h2>
              <Activity
                size={18}
                style={{ verticalAlign: "middle", marginRight: 8 }}
              />
              Internal Events
            </h2>

            {result.events.length === 0 ? (
              <p>No internal event matches.</p>
            ) : (
              result.events.map((event) => (
                <div
                  key={event.id}
                  style={{
                    padding: 14,
                    marginTop: 10,
                    borderTop: "1px solid rgba(100,120,160,.15)",
                  }}
                >
                  <strong>
                    Event #{event.id} — {event.event_type}
                  </strong>

                  <div
                    style={{
                      marginTop: 7,
                      fontSize: 13,
                      opacity: 0.75,
                    }}
                  >
                    {event.source_ip || "—"} →{" "}
                    {event.destination_ip ||
                      event.destination_domain ||
                      "—"}
                  </div>

                  <div
                    style={{
                      marginTop: 7,
                      display: "flex",
                      gap: 16,
                      flexWrap: "wrap",
                      fontSize: 12,
                      opacity: 0.7,
                    }}
                  >
                    <span>Host: {event.hostname || "—"}</span>
                    <span>User: {event.username || "—"}</span>
                    <span className={severityClass(event.severity)}>
                      <AlertTriangle size={12} />
                      {event.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* ALERTS */}
          <section className="card" style={{ padding: 20, marginBottom: 18 }}>
            <h2>
              <ShieldAlert
                size={18}
                style={{ verticalAlign: "middle", marginRight: 8 }}
              />
              Related Alerts
            </h2>

            {result.alerts.length === 0 ? (
              <p>No related alerts.</p>
            ) : (
              result.alerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    padding: 14,
                    marginTop: 10,
                    borderTop: "1px solid rgba(100,120,160,.15)",
                  }}
                >
                  <strong>{alert.title}</strong>

                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      gap: 14,
                      flexWrap: "wrap",
                      fontSize: 12,
                    }}
                  >
                    <span className={severityClass(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <span>Status: {alert.status.toUpperCase()}</span>
                    <span>IOC: #{alert.ioc_id ?? "—"}</span>
                    <span>Event: #{alert.event_id ?? "—"}</span>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* INCIDENTS */}
          <section className="card" style={{ padding: 20 }}>
            <h2>
              <AlertTriangle
                size={18}
                style={{ verticalAlign: "middle", marginRight: 8 }}
              />
              Related Incidents
            </h2>

            {result.incidents.length === 0 ? (
              <p>No related incidents.</p>
            ) : (
              result.incidents.map((incident) => (
                <div
                  key={incident.id}
                  style={{
                    padding: 14,
                    marginTop: 10,
                    borderTop: "1px solid rgba(100,120,160,.15)",
                  }}
                >
                  <strong>{incident.title}</strong>

                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      gap: 14,
                      flexWrap: "wrap",
                      fontSize: 12,
                    }}
                  >
                    <span className={severityClass(incident.severity)}>
                      {incident.severity.toUpperCase()}
                    </span>
                    <span>
                      Status: {incident.status.toUpperCase()}
                    </span>
                    <span>
                      Alert: #{incident.alert_id ?? "—"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
