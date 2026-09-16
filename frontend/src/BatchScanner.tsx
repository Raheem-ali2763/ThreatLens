import { useState } from "react";
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";

const API = "http://127.0.0.1:8001";

type Result = {
  value: string;
  ioc_type: string;
  found: boolean;
  source: string | null;
  confidence: number;
  severity: string;
  tags: string | null;
  ioc_id: number | null;
  is_active: boolean;
};

type ResponseData = {
  total: number;
  found: number;
  not_found: number;
  results: Result[];
};

export default function BatchScanner() {
  const [input, setInput] = useState(
    "185.220.101.4\nexample.com\n8.8.8.8"
  );
  const [data, setData] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const scan = async () => {
    const indicators = input
      .split(/\r?\n|,/)
      .map((x) => x.trim())
      .filter(Boolean);

    if (!indicators.length) {
      setError("Enter at least one indicator.");
      return;
    }

    if (indicators.length > 100) {
      setError("Maximum 100 indicators per batch.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API}/api/scanner/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ indicators }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setData(null);
      setError(
        err instanceof Error
          ? err.message
          : "Batch scan failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const severityClass = (severity: string) => {
    const s = severity.toLowerCase();

    if (s === "critical") return "alert-critical";
    if (s === "high") return "alert-high";
    if (s === "medium") return "alert-medium";
    if (s === "low") return "alert-low";

    return "";
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
          <h1>Batch Scanner</h1>
          <p>
            Scan multiple indicators against ThreatLens intelligence.
          </p>
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: 22,
          marginBottom: 20,
        }}
      >
        <h2>Batch Input</h2>

        <p style={{ opacity: 0.65 }}>
          Enter one IP, domain, URL or email per line.
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder={"185.220.101.4\nexample.com\n8.8.8.8"}
          style={{
            width: "100%",
            boxSizing: "border-box",
            resize: "vertical",
            padding: 14,
            marginTop: 10,
            fontFamily: "monospace",
          }}
        />

        <div
          style={{
            marginTop: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 12, opacity: 0.6 }}>
            Maximum 100 indicators
          </span>

          <button
            onClick={scan}
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
              <Search size={16} />
            )}

            {loading ? "Scanning..." : "Scan Batch"}
          </button>
        </div>
      </div>

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
          <strong>Batch scan failed</strong>
          <div style={{ marginTop: 5, opacity: 0.7 }}>
            {error}
          </div>
        </div>
      )}

      {data && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 15,
              marginBottom: 20,
            }}
          >
            <div className="stat-card">
              <span>TOTAL</span>
              <strong>{data.total}</strong>
            </div>

            <div className="stat-card">
              <span>FOUND IN THREAT INTEL</span>
              <strong>{data.found}</strong>
            </div>

            <div className="stat-card">
              <span>NOT FOUND</span>
              <strong>{data.not_found}</strong>
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h2>Scan Results</h2>

            <div style={{ display: "grid", gap: 10 }}>
              {data.results.map((item) => (
                <div
                  key={item.value}
                  style={{
                    padding: 16,
                    border: "1px solid rgba(100,120,160,.15)",
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 15,
                    }}
                  >
                    <div>
                      <strong>{item.value}</strong>

                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 12,
                          opacity: 0.65,
                        }}
                      >
                        Type: {item.ioc_type}
                        {" • "}
                        Source: {item.source || "No match"}
                        {item.ioc_id !== null &&
                          ` • IOC #${item.ioc_id}`}
                      </div>
                    </div>

                    {item.found ? (
                      <span
                        className={severityClass(item.severity)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <ShieldAlert size={14} />
                        {item.severity.toUpperCase()}
                      </span>
                    ) : (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          opacity: 0.65,
                        }}
                      >
                        <ShieldCheck size={14} />
                        NO MATCH
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      gap: 18,
                      flexWrap: "wrap",
                      fontSize: 12,
                      opacity: 0.7,
                    }}
                  >
                    <span>
                      Confidence: {item.confidence}
                    </span>

                    <span>
                      Active: {item.found && item.is_active ? "Yes" : "No"}
                    </span>

                    {item.tags && (
                      <span>
                        Tags: {item.tags}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
