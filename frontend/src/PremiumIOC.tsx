import { useState } from "react";
import {
  Search,
  Shield,
  Globe,
  Server,
  Link,
  Mail,
  FileKey,
  Activity,
  AlertTriangle,
  Clock,
  Database,
  Crosshair,
} from "lucide-react";
import { apiFetch } from "./api";

type IOCData = {
  id: number;
  ioc_type: string;
  value: string;
  source: string;
  first_seen: string | null;
  last_seen: string | null;
  confidence: number;
  tags: string | null;
  is_active: boolean;
};

type IntelligenceData = {
  ioc: IOCData;
  severity?: string;
  events?: unknown[];
  alerts?: unknown[];
  incidents?: unknown[];
};

function typeIcon(type: string) {
  if (type === "ip") return <Server size={19} />;
  if (type === "domain") return <Globe size={19} />;
  if (type === "url") return <Link size={19} />;
  if (type === "email") return <Mail size={19} />;
  return <FileKey size={19} />;
}

export default function PremiumIOC() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const searchIOC = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setMessage("");
    setData(null);

    try {
      const response = await apiFetch(
        `/api/intelligence/search?q=${encodeURIComponent(query.trim())}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (!result || result.total === 0) {
        setMessage("No matching IOC found in ThreatLens intelligence database.");
        return;
      }

      const first =
        result.iocs?.[0] ||
        result.results?.[0] ||
        result[0];

      if (!first) {
        setMessage("IOC found, but intelligence details were unavailable.");
        return;
      }

      const id = first.id || first.ioc_id;

      if (id) {
        const detailResponse = await apiFetch(`/api/intelligence/${id}`);

        if (detailResponse.ok) {
          setData(await detailResponse.json());
          return;
        }
      }

      setData({
        ioc: first,
        severity: first.severity,
      });
    } catch {
      setMessage("Unable to connect to ThreatLens intelligence service.");
    } finally {
      setLoading(false);
    }
  };

  const ioc = data?.ioc;

  const severity =
    data?.severity ||
    (ioc && ioc.confidence >= 85
      ? "critical"
      : ioc && ioc.confidence >= 60
      ? "high"
      : ioc && ioc.confidence >= 30
      ? "medium"
      : "low");

  const eventsCount = Array.isArray(data?.events)
    ? data?.events.length
    : 0;

  const alertsCount = Array.isArray(data?.alerts)
    ? data?.alerts.length
    : 0;

  const incidentsCount = Array.isArray(data?.incidents)
    ? data?.incidents.length
    : 0;

  return (
    <div className="premium-ioc-page">

      <div className="ioc-page-header">
        <div>
          <div className="ioc-eyebrow">
            <span />
            THREAT INTELLIGENCE CENTER
          </div>

          <h1>IOC Intelligence</h1>

          <p>
            Investigate indicators across the ThreatLens intelligence environment.
          </p>
        </div>

        <div className="ioc-engine-status">
          <Activity size={16} />
          <span>INTELLIGENCE ENGINE ACTIVE</span>
        </div>
      </div>

      <div className="ioc-search-panel">

        <div className="ioc-search-label">
          <Search size={15} />
          SEARCH INDICATOR
        </div>

        <div className="ioc-search-box">
          <Search size={18} />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") searchIOC();
            }}
            placeholder="IP address, domain, URL, hash or email..."
          />

          <button onClick={searchIOC} disabled={loading}>
            {loading ? "INVESTIGATING..." : "INVESTIGATE"}
          </button>
        </div>

        <div className="ioc-search-hint">
          <Shield size={12} />
          Search is performed against the ThreatLens intelligence database.
        </div>
      </div>

      {message && (
        <div className="ioc-message">
          <AlertTriangle size={18} />
          <span>{message}</span>
        </div>
      )}

      {ioc && (
        <>
          <div className="ioc-profile-grid">

            <div className="ioc-profile-main">

              <div className="ioc-profile-top">

                <div className="ioc-type-icon">
                  {typeIcon(ioc.ioc_type)}
                </div>

                <div className="ioc-value-block">
                  <span>INDICATOR OF COMPROMISE</span>
                  <h2>{ioc.value}</h2>
                  <small>
                    {ioc.ioc_type.toUpperCase()} • IOC #{ioc.id}
                  </small>
                </div>

                <div className={`ioc-severity ${severity}`}>
                  <AlertTriangle size={15} />
                  {severity.toUpperCase()}
                </div>

              </div>

              <div className="ioc-detail-grid">

                <div>
                  <span>SOURCE</span>
                  <strong>{ioc.source || "Unknown"}</strong>
                </div>

                <div>
                  <span>CONFIDENCE</span>
                  <strong>{ioc.confidence}%</strong>
                </div>

                <div>
                  <span>STATUS</span>
                  <strong className="active-ioc">
                    {ioc.is_active ? "ACTIVE" : "INACTIVE"}
                  </strong>
                </div>

                <div>
                  <span>TAGS</span>
                  <strong>{ioc.tags || "—"}</strong>
                </div>

              </div>

            </div>

            <div className="ioc-confidence-card">

              <span>CONFIDENCE SCORE</span>

              <div className="confidence-ring">
                <strong>{ioc.confidence}</strong>
                <small>/100</small>
              </div>

              <div className="confidence-bar">
                <div
                  style={{
                    width: `${Math.min(100, Math.max(0, ioc.confidence))}%`,
                  }}
                />
              </div>

              <p>
                Threat confidence calculated from available intelligence.
              </p>

            </div>

          </div>

          <div className="ioc-section-title">
            <Crosshair size={15} />
            CORRELATION & ACTIVITY
          </div>

          <div className="ioc-correlation-grid">

            <div className="ioc-stat-card">
              <Activity size={18} />
              <span>RELATED EVENTS</span>
              <strong>{eventsCount}</strong>
              <small>Internal telemetry matches</small>
            </div>

            <div className="ioc-stat-card alert-stat">
              <AlertTriangle size={18} />
              <span>GENERATED ALERTS</span>
              <strong>{alertsCount}</strong>
              <small>Security detections</small>
            </div>

            <div className="ioc-stat-card incident-stat">
              <Shield size={18} />
              <span>RELATED INCIDENTS</span>
              <strong>{incidentsCount}</strong>
              <small>Investigation cases</small>
            </div>

            <div className="ioc-stat-card">
              <Database size={18} />
              <span>INTELLIGENCE SOURCE</span>
              <strong>{ioc.source || "—"}</strong>
              <small>Origin of indicator</small>
            </div>

          </div>

          <div className="ioc-timeline">

            <div className="ioc-section-title">
              <Clock size={15} />
              INDICATOR TIMELINE
            </div>

            <div className="timeline-row">
              <div className="timeline-marker" />

              <div>
                <strong>First Seen</strong>
                <span>
                  {ioc.first_seen
                    ? new Date(ioc.first_seen).toLocaleString()
                    : "Not available"}
                </span>
              </div>
            </div>

            <div className="timeline-row">
              <div className="timeline-marker" />

              <div>
                <strong>Last Seen</strong>
                <span>
                  {ioc.last_seen
                    ? new Date(ioc.last_seen).toLocaleString()
                    : "Not available"}
                </span>
              </div>
            </div>

            <div className="timeline-row">
              <div className="timeline-marker active-marker" />

              <div>
                <strong>Current Status</strong>
                <span>
                  {ioc.is_active
                    ? "Indicator remains active in ThreatLens."
                    : "Indicator is currently inactive."}
                </span>
              </div>
            </div>

          </div>
        </>
      )}

      {!ioc && !message && (
        <div className="ioc-empty">
          <div>
            <Shield size={34} />
          </div>
          <h2>Ready for Investigation</h2>
          <p>
            Enter an indicator above to begin threat intelligence analysis.
          </p>
        </div>
      )}

    </div>
  );
}
