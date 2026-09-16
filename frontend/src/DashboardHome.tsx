import { useEffect, useState } from "react";
import { apiFetch } from "./api";
import {
  Shield,
  AlertTriangle,
  Activity,
  Database,
  Server,
  Radio,
  ArrowUpRight,
  Clock,
  Crosshair,
  FileWarning,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Overview = {
  total_iocs: number;
  total_events: number;
  open_alerts: number;
  active_incidents: number;
  environment_risk: number;
  severity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  activity: {
    date: string;
    alerts: number;
  }[];
  alerts: {
    id: number;
    title: string;
    description: string;
    severity: string;
    status: string;
    ioc_id: number;
    event_id: number;
    created_at: string;
  }[];
};

export default function DashboardHome() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const response = await apiFetch("/api/dashboard/overview");

      if (!response.ok) {
        throw new Error("Dashboard API failed");
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    const timer = setInterval(loadDashboard, 15000);

    return () => clearInterval(timer);
  }, []);

  if (loading || !data) {
    return (
      <div className="dashboard-loading">
        <div className="loading-orb">
          <Shield size={30} />
        </div>
        <h2>Initializing ThreatLens</h2>
        <p>Loading live security telemetry...</p>
      </div>
    );
  }

  const risk =
    data.environment_risk >= 85
      ? "CRITICAL"
      : data.environment_risk >= 60
      ? "HIGH"
      : data.environment_risk >= 30
      ? "MEDIUM"
      : "LOW";

  return (
    <div className="premium-dashboard">

      <div className="dashboard-hero">
        <div>
          <div className="eyebrow">
            <span className="live-dot" />
            LIVE SECURITY OPERATIONS
          </div>

          <h1>Threat Intelligence Overview</h1>

          <p>
            Real-time visibility across indicators, events, alerts and incidents.
          </p>
        </div>

        <div className="system-status">
          <Activity size={16} />
          <div>
            <strong>THREATLENS CORE</strong>
            <span>Operational</span>
          </div>
        </div>
      </div>

      <div className="metric-grid">

        <div className="metric-card">
          <div className="metric-icon blue">
            <Database size={20} />
          </div>

          <div>
            <span>Total IOCs</span>
            <strong>{data.total_iocs}</strong>
            <small>
              <ArrowUpRight size={12} />
              Intelligence database
            </small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon purple">
            <Activity size={20} />
          </div>

          <div>
            <span>Security Events</span>
            <strong>{data.total_events}</strong>
            <small>Correlated telemetry</small>
          </div>
        </div>

        <div className="metric-card danger">
          <div className="metric-icon red">
            <AlertTriangle size={20} />
          </div>

          <div>
            <span>Open Alerts</span>
            <strong>{data.open_alerts}</strong>
            <small>Requires attention</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon orange">
            <FileWarning size={20} />
          </div>

          <div>
            <span>Active Incidents</span>
            <strong>{data.active_incidents}</strong>
            <small>Under investigation</small>
          </div>
        </div>

      </div>

      <div className="dashboard-main-grid">

        <div className="panel activity-panel">

          <div className="panel-header">
            <div>
              <span className="panel-kicker">TELEMETRY</span>
              <h2>Threat Activity</h2>
            </div>

            <div className="panel-live">
              <span />
              LIVE
            </div>
          </div>

          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.activity}>
                <defs>
                  <linearGradient
                    id="threatGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopOpacity={0.35} />
                    <stop offset="100%" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => value.slice(5)}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="alerts"
                  strokeWidth={2}
                  fill="url(#threatGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel risk-panel">

          <div className="panel-header">
            <div>
              <span className="panel-kicker">ENVIRONMENT</span>
              <h2>Risk Score</h2>
            </div>
          </div>

          <div className="risk-circle">
            <div>
              <strong>{data.environment_risk}</strong>
              <span>/ 100</span>
            </div>
          </div>

          <div className="risk-label">{risk} RISK</div>

          <div className="severity-list">
            <div>
              <span>Critical</span>
              <strong>{data.severity.critical}</strong>
            </div>

            <div>
              <span>High</span>
              <strong>{data.severity.high}</strong>
            </div>

            <div>
              <span>Medium</span>
              <strong>{data.severity.medium}</strong>
            </div>

            <div>
              <span>Low</span>
              <strong>{data.severity.low}</strong>
            </div>
          </div>
        </div>

      </div>

      <div className="panel alerts-panel">

        <div className="panel-header">
          <div>
            <span className="panel-kicker">SOC QUEUE</span>
            <h2>Recent Threat Alerts</h2>
          </div>

          <div className="alert-count">
            {data.alerts.length} ACTIVE
          </div>
        </div>

        <div className="alert-table">

          {data.alerts.length === 0 ? (
            <div className="empty-state">
              <Shield size={28} />
              <strong>No active threats</strong>
              <span>ThreatLens has no open alerts.</span>
            </div>
          ) : (
            data.alerts.map((alert) => (
              <div className="alert-row" key={alert.id}>

                <div className={`severity-dot ${alert.severity}`}>
                  <AlertTriangle size={14} />
                </div>

                <div className="alert-info">
                  <strong>{alert.title}</strong>
                  <span>{alert.description}</span>
                </div>

                <div className="alert-meta">
                  <b>{alert.severity.toUpperCase()}</b>
                  <span>IOC #{alert.ioc_id}</span>
                </div>

                <div className="alert-time">
                  <Clock size={13} />
                  {new Date(alert.created_at).toLocaleTimeString()}
                </div>

              </div>
            ))
          )}

        </div>
      </div>

      <div className="quick-grid">

        <div className="quick-card">
          <Crosshair size={19} />
          <div>
            <strong>Threat Hunting</strong>
            <span>Search the intelligence environment</span>
          </div>
        </div>

        <div className="quick-card">
          <Server size={19} />
          <div>
            <strong>Internal Correlation</strong>
            <span>Monitor endpoint activity</span>
          </div>
        </div>

        <div className="quick-card">
          <Radio size={19} />
          <div>
            <strong>Live Detection</strong>
            <span>WebSocket channel connected</span>
          </div>
        </div>

      </div>

    </div>
  );
}
