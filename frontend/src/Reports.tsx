import {
  FileText,
  Download,
  FileSpreadsheet,
  Shield,
  FileCode2,
  Database,
  Activity,
  Clock3,
  CheckCircle2,
} from "lucide-react";

const API = "http://127.0.0.1:8001";

export default function Reports() {
  const download = (type: "csv" | "stix" | "pdf") => {
    window.open(`${API}/api/reports/${type}`, "_blank");
  };

  return (
    <div className="reports-page">

      <div className="reports-header">
        <div>
          <div className="reports-eyebrow">
            <span />
            SECURITY REPORTING CENTER
          </div>
          <h1>Reports</h1>
          <p>
            Generate intelligence reports from live ThreatLens security data.
          </p>
        </div>

        <div className="reports-live">
          <Activity size={13} />
          LIVE DATA EXPORT
        </div>
      </div>

      <div className="reports-stats">

        <div className="report-stat">
          <Database size={18} />
          <div>
            <span>DATA SOURCE</span>
            <strong>PostgreSQL</strong>
          </div>
        </div>

        <div className="report-stat">
          <Shield size={18} />
          <div>
            <span>INTELLIGENCE</span>
            <strong>IOC + Alerts</strong>
          </div>
        </div>

        <div className="report-stat">
          <FileText size={18} />
          <div>
            <span>FORMATS</span>
            <strong>3 Available</strong>
          </div>
        </div>

        <div className="report-stat">
          <Clock3 size={18} />
          <div>
            <span>REPORT MODE</span>
            <strong>On Demand</strong>
          </div>
        </div>

      </div>

      <div className="reports-section-title">
        <span>EXPORT CENTER</span>
        <h2>Threat Intelligence Reports</h2>
      </div>

      <div className="reports-grid">

        <div className="report-card">
          <div className="report-card-top">
            <div className="report-icon csv">
              <FileSpreadsheet size={23} />
            </div>

            <div className="report-format">CSV</div>
          </div>

          <h3>Security Data Export</h3>

          <p>
            Export current IOCs, internal events, alerts and incidents
            stored in the ThreatLens PostgreSQL database.
          </p>

          <div className="report-includes">
            <span><CheckCircle2 size={12} /> IOC records</span>
            <span><CheckCircle2 size={12} /> Security events</span>
            <span><CheckCircle2 size={12} /> Alerts & incidents</span>
          </div>

          <button
            className="report-download"
            onClick={() => download("csv")}
          >
            <Download size={15} />
            Download CSV
          </button>
        </div>


        <div className="report-card">
          <div className="report-card-top">
            <div className="report-icon stix">
              <FileCode2 size={23} />
            </div>

            <div className="report-format">STIX 2.1</div>
          </div>

          <h3>Threat Intelligence Package</h3>

          <p>
            Export structured threat intelligence using the STIX 2.1
            format for security tooling and intelligence workflows.
          </p>

          <div className="report-includes">
            <span><CheckCircle2 size={12} /> Indicators</span>
            <span><CheckCircle2 size={12} /> IOC patterns</span>
            <span><CheckCircle2 size={12} /> Confidence data</span>
          </div>

          <button
            className="report-download"
            onClick={() => download("stix")}
          >
            <Download size={15} />
            Download STIX 2.1
          </button>
        </div>


        <div className="report-card">
          <div className="report-card-top">
            <div className="report-icon pdf">
              <FileText size={23} />
            </div>

            <div className="report-format">PDF</div>
          </div>

          <h3>Security Operations Report</h3>

          <p>
            Generate a readable security report containing current
            ThreatLens intelligence and operational findings.
          </p>

          <div className="report-includes">
            <span><CheckCircle2 size={12} /> Threat overview</span>
            <span><CheckCircle2 size={12} /> Detection data</span>
            <span><CheckCircle2 size={12} /> Incident information</span>
          </div>

          <button
            className="report-download"
            onClick={() => download("pdf")}
          >
            <Download size={15} />
            Download PDF
          </button>
        </div>

      </div>

      <div className="reports-footer">
        <div>
          <span />
          ThreatLens reporting engine operational
        </div>

        <small>
          Exports are generated from live backend data
        </small>
      </div>

    </div>
  );
}
