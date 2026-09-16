import { useEffect, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  CircleAlert,
  RefreshCw,
  Database,
  Globe,
  Bug,
  Search,
  Activity,
  Server,
  Clock3,
} from "lucide-react";
import { apiFetch } from "./api";

type Source = {
  name: string;
  type: string;
  description: string;
  status: string;
  message: string;
};

export default function ThreatSources() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState("");

  const loadSources = async () => {
    try {
      setLoading(true);

      const response = await apiFetch("/api/threat-sources");

      if (!response.ok) {
        throw new Error("Backend unavailable");
      }

      const data = await response.json();

      setSources(data.sources || []);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (error) {
      console.error(error);
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();

    const timer = setInterval(loadSources, 30000);

    return () => clearInterval(timer);
  }, []);

  const connected = sources.filter(
    (s) => s.status === "connected"
  ).length;

  const errors = sources.filter(
    (s) => s.status === "error"
  ).length;

  const configured = sources.filter(
    (s) => s.status !== "error" && s.status !== "not_configured"
  ).length;

  const iconFor = (name: string) => {
    if (name === "AbuseIPDB") return <ShieldAlert size={21} />;
    if (name === "VirusTotal") return <Search size={21} />;
    if (name === "URLhaus") return <Globe size={21} />;
    if (name === "ThreatFox") return <Bug size={21} />;
    return <Database size={21} />;
  };

  const sourceClass = (status: string) => {
    if (status === "connected") return "source-connected";
    if (status === "error") return "source-error";
    return "source-warning";
  };

  return (
    <div className="sources-page">

      {/* HEADER */}
      <div className="sources-header">

        <div>
          <div className="sources-eyebrow">
            <span />
            THREAT INTELLIGENCE INFRASTRUCTURE
          </div>

          <h1>Threat Sources</h1>

          <p>
            Monitor and manage intelligence providers powering ThreatLens.
          </p>
        </div>

        <button
          className="sources-refresh"
          onClick={loadSources}
          disabled={loading}
        >
          <RefreshCw
            size={15}
            className={loading ? "spin" : ""}
          />
          {loading ? "Checking..." : "Refresh Sources"}
        </button>

      </div>


      {/* OVERVIEW */}
      <div className="sources-overview">

        <div className="source-stat-card">
          <div className="source-stat-icon green">
            <ShieldCheck size={19} />
          </div>

          <div>
            <span>CONNECTED</span>
            <strong>{connected}</strong>
            <small>Active providers</small>
          </div>
        </div>

        <div className="source-stat-card">
          <div className="source-stat-icon blue">
            <Server size={19} />
          </div>

          <div>
            <span>CONFIGURED</span>
            <strong>{configured}</strong>
            <small>Configured integrations</small>
          </div>
        </div>

        <div className="source-stat-card">
          <div className="source-stat-icon red">
            <CircleAlert size={19} />
          </div>

          <div>
            <span>ERRORS</span>
            <strong>{errors}</strong>
            <small>Provider issues</small>
          </div>
        </div>

        <div className="source-stat-card">
          <div className="source-stat-icon purple">
            <Database size={19} />
          </div>

          <div>
            <span>TOTAL SOURCES</span>
            <strong>{sources.length}</strong>
            <small>Intelligence providers</small>
          </div>
        </div>

      </div>


      {/* SOURCE GRID */}
      <div className="sources-section-header">
        <div>
          <span>INTELLIGENCE PROVIDERS</span>
          <h2>Provider Health</h2>
        </div>

        <div className="source-health">
          <Activity size={13} />
          REAL-TIME MONITORING
        </div>
      </div>


      <div className="sources-grid">

        {sources.length === 0 && !loading && (
          <div className="sources-empty">
            <Database size={30} />
            <strong>No source data available</strong>
            <span>
              ThreatLens could not retrieve provider information.
            </span>
          </div>
        )}

        {sources.map((source) => {

          const isConnected = source.status === "connected";
          const isError = source.status === "error";

          return (
            <div
              key={source.name}
              className={`source-card ${sourceClass(source.status)}`}
            >

              <div className="source-card-top">

                <div className="source-identity">

                  <div className="source-icon">
                    {iconFor(source.name)}
                  </div>

                  <div>
                    <h3>{source.name}</h3>
                    <span>{source.type}</span>
                  </div>

                </div>

                <div className="source-status">

                  {isConnected ? (
                    <>
                      <ShieldCheck size={14} />
                      CONNECTED
                    </>
                  ) : isError ? (
                    <>
                      <CircleAlert size={14} />
                      ERROR
                    </>
                  ) : (
                    <>
                      <ShieldAlert size={14} />
                      NOT CONFIGURED
                    </>
                  )}

                </div>

              </div>


              <div className="source-description">
                {source.description}
              </div>


              <div className="source-health-line">

                <span className="health-indicator" />

                <div>
                  <small>PROVIDER STATUS</small>
                  <strong>{source.message}</strong>
                </div>

              </div>


              <div className="source-footer">

                <div>
                  <Activity size={12} />
                  Threat intelligence
                </div>

                <div>
                  <Clock3 size={12} />
                  {lastChecked || "—"}
                </div>

              </div>

            </div>
          );
        })}

      </div>


      {/* FOOTER */}
      <div className="sources-system-footer">

        <div>
          <span className="system-live-dot" />
          ThreatLens intelligence monitoring active
        </div>

        <span>
          Auto-refresh: 30 seconds
        </span>

      </div>

    </div>
  );
}
