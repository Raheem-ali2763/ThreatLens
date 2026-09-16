import { useState } from "react";
import {
  Globe,
  Search,
  Shield,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Database
} from "lucide-react";

const API = "http://127.0.0.1:8001";

type Result = {
  url: string;
  source: string;
  query_status?: string;
  risk_score: number;
  severity: string;
  url_status?: string;
  threat?: string;
  tags?: string[];
  host?: string;
  date_added?: string;
  reference?: string;
  malicious: boolean;
  message: string;
};

export default function URLScanner() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function scan() {
    if (!url.trim()) {
      setError("Enter a URL to investigate.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API}/api/scanner/url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "URL intelligence lookup failed"
        );
      }

      setResult(data.result);
    } catch (err: any) {
      setError(err.message || "Unable to connect to ThreatLens");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="url-scanner-page">

      <div className="url-hero">
        <div className="url-hero-icon">
          <Globe size={25} />
        </div>

        <div>
          <h1>URL Scanner</h1>
          <p>
            Investigate URLs against live threat intelligence.
          </p>
        </div>

        <div className="url-live">
          <span />
          LIVE INTELLIGENCE
        </div>
      </div>

      <div className="url-search-panel">

        <div className="url-title">
          <div>
            <strong>Investigate URL</strong>
            <small>
              ThreatLens → URLhaus intelligence
            </small>
          </div>

          <Database size={17} />
        </div>

        <div className="url-input">

          <Globe size={17} />

          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") scan();
            }}
            placeholder="https://example.com/path"
          />

          <button onClick={scan} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw size={14} className="spin" />
                Scanning
              </>
            ) : (
              <>
                <Search size={14} />
                Scan URL
              </>
            )}
          </button>

        </div>

        <div className="url-warning">
          <Shield size={13} />
          ThreatLens queries intelligence sources without opening the submitted URL.
        </div>

      </div>

      {error && (
        <div className="url-error">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {result && (
        <div className="url-result">

          <div className="url-result-header">
            <div>
              <h2>URL Intelligence Result</h2>
              <p>{result.message}</p>
            </div>

            <div
              className={`url-severity ${result.severity.toLowerCase()}`}
            >
              {result.severity}
            </div>
          </div>

          <div className="url-risk">

            <div className="url-risk-circle">
              {result.risk_score}
            </div>

            <div>
              <span>THREAT RISK SCORE</span>
              <strong>{result.risk_score}/100</strong>
            </div>

          </div>

          <div className="url-details">

            <div>
              <span>INDICATOR</span>
              <strong className="break">
                {result.url}
              </strong>
            </div>

            <div>
              <span>SOURCE</span>
              <strong>{result.source}</strong>
            </div>

            <div>
              <span>QUERY STATUS</span>
              <strong>
                {result.query_status || "Unknown"}
              </strong>
            </div>

            <div>
              <span>URL STATUS</span>
              <strong>
                {result.url_status || "Unknown"}
              </strong>
            </div>

            <div>
              <span>HOST</span>
              <strong>{result.host || "—"}</strong>
            </div>

            <div>
              <span>THREAT</span>
              <strong>{result.threat || "—"}</strong>
            </div>

            <div className="url-wide">
              <span>TAGS</span>
              <strong>
                {result.tags?.length
                  ? result.tags.join(", ")
                  : "No tags returned"}
              </strong>
            </div>

          </div>

          {result.reference && (
            <a
              className="url-reference"
              href={result.reference}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={14} />
              View URLhaus Intelligence Record
            </a>
          )}

          <div className="url-safe-note">

            {result.malicious ? (
              <>
                <AlertTriangle size={15} />
                URLhaus has intelligence for this URL.
              </>
            ) : (
              <>
                <CheckCircle size={15} />
                No URLhaus record found. This is inconclusive, not a clean verdict.
              </>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
