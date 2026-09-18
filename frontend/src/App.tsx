import PremiumIOC from "./PremiumIOC";
import Settings from "./Settings";
import DashboardHome from "./DashboardHome";
import Login from "./Login";
import LiveAlertOverlay from "./LiveAlertOverlay";
import ThreatSources from "./ThreatSources";
import Alerts from "./Alerts";
import Incidents from "./Incidents";
import ThreatHunting from "./ThreatHunting";
import BatchScanner from "./BatchScanner";
import Reports from "./Reports";
import RealtimeStatus from "./RealtimeStatus";
import { useEffect, useState } from "react";
import FileScanner from "./FileScanner";
import URLScanner from "./URLScanner";
import {
  Shield,
  LayoutDashboard,
  Search,
  FileScan,
  Globe,
  Radio,
  Crosshair,
  Bell,
  AlertTriangle,
  ShieldAlert,
  Activity,
  Database,
  ChevronRight,
  RefreshCw,
  ArrowLeft,
  Zap,
  LogOut,
} from "lucide-react";

const API = "https://threatlens-backend-ig3f.onrender.com";

type IOC = {
  id: number;
  ioc_type: string;
  value: string;
  source: string;
  confidence: number;
  severity: string;
  tags?: string;
  first_seen?: string;
  last_seen?: string;
  is_active?: boolean;
};

function severityClass(severity: string) {
  return severity.toLowerCase();
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("threatlens_token");
    setIsAuthenticated(true);
  };

  const [page, setPage] = useState("IOC Intelligence");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IOC[]>([]);
  const [selected, setSelected] = useState<IOC | null>(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [overview, setOverview] = useState<any>(null);

  async function loadOverview() {
    try {
      const res = await fetch(`${API}/api/dashboard/overview`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOverview(data);
      setConnected(true);
    } catch {
      setConnected(false);
    }
  }

  async function searchIOC(value = query) {
    if (!value.trim()) {
      setResults([]);
      setSelected(null);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${API}/api/intelligence/search?q=${encodeURIComponent(value)}`
      );

      if (!res.ok) throw new Error();

      const data = await res.json();
      setResults(data.results || []);
      setSelected(null);
      setConnected(true);
    } catch {
      setConnected(false);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOverview();
    const timer = setInterval(loadOverview, 15000);
    return () => clearInterval(timer);
  }, []);

  const totalIOCs =
    overview?.total_iocs ??
    overview?.stats?.total_iocs ??
    0;

  const openAlerts =
    overview?.open_alerts ??
    overview?.stats?.open_alerts ??
    0;

  const incidents =
    overview?.active_incidents ??
    overview?.stats?.active_incidents ??
    0;

  const nav = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "IOC Intelligence", icon: Search },
    { name: "File Scanner", icon: FileScan },
    { name: "URL Scanner", icon: Globe },
    { name: "Batch Scanner", icon: Radio },
    { name: "Threat Hunting", icon: Crosshair },
  ];

  const ops = [
    { name: "Alerts", icon: Bell },
    { name: "Incidents", icon: ShieldAlert },
    { name: "Threat Sources", icon: Activity },
    { name: "Reports", icon: Database },
    { name: "Settings", icon: Zap },
    { name: "Logout", icon: LogOut },
  ];

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <LiveAlertOverlay />

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Shield size={20} />
          </div>
          <div>
            <div className="brand-name">ThreatLens</div>
            <div className="brand-sub">THREAT INTELLIGENCE</div>
          </div>
        </div>

        <div className="section-label">COMMAND CENTER</div>

        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              className={`nav-item ${
                page === item.name ? "active" : ""
              }`}
              onClick={() => {
                if (item.name === "Logout") {
                  handleLogout();
                } else {
                  setPage(item.name);
                }
              }}
            >
              <Icon size={15} />
              <span>{item.name}</span>
            </button>
          );
        })}

        <div className="section-label operations">OPERATIONS</div>

        {ops.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              className={`nav-item ${page === item.name ? "active" : ""}`}
              onClick={() => {
                if (item.name === "Logout") {
                  handleLogout();
                } else {
                  setPage(item.name);
                }
              }}
            >
              <Icon size={15} />
              <span>{item.name}</span>
            </button>
          );
        })}

        <div className="ai-card">
          <div className="ai-icon">
            <Zap size={16} />
          </div>
          <div>
            <strong>ThreatLens AI</strong>
            <small>Intelligence engine active</small>
          </div>
          <div className="online-dot" />
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">

        {/* TOP BAR */}
        <header className="topbar">
          <div>
            <div className="eyebrow">SECURITY OPERATIONS CENTER</div>
            <h2>{page}</h2>
          </div>

          <div className="top-actions">
            <div className="global-search">
              <Search size={14} />
              <input
                placeholder="Search intelligence..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") searchIOC();
                }}
              />
              <span>⌘ K</span>
            </div>

            <button className="icon-btn">
              <Bell size={16} />
            </button>

            <div className="profile">
              <RealtimeStatus />
              <div className="avatar">TL</div>
              <div>
                <strong>Analyst</strong>
                <small>Security Team</small>
              </div>
            </div>
          </div>
        </header>

        {page === "Reports" ? (
          <Reports />
        ) : page === "Batch Scanner" ? (
          <BatchScanner />
        ) : page === "Threat Hunting" ? (
          <ThreatHunting />
        ) : page === "Incidents" ? (
          <Incidents />
        ) : page === "Alerts" ? (
          <Alerts />
        ) : page === "Threat Sources" ? (
        <ThreatSources />
      ) : page === "File Scanner" ? (
          <FileScanner />
        ) : page === "URL Scanner" ? (
          <URLScanner />
        ) : page === "Overview" ? (
          <DashboardHome />
        ) : page === "Settings" ? (
          <Settings onLogout={handleLogout} />
        ) : page === "IOC Intelligence" ? (
          <PremiumIOC />
        ) : page !== "IOC Intelligence" ? (
          <div className="coming-page">
            <Shield size={38} />
            <h1>{page}</h1>
            <p>
            </p>
            <button
              className="primary-btn"
              onClick={() => setPage("IOC Intelligence")}
            >
              <ArrowLeft size={16} />
              Back to IOC Intelligence
            </button>
          </div>
        ) : (

          <section className="content">

            {/* HERO */}
            <div className="hero">
              <div className="hero-left">
                <div className="hero-icon">
                  <Search size={21} />
                </div>
                <div>
                  <h1>IOC Intelligence</h1>
                  <p>
                    Investigate indicators against your ThreatLens intelligence database.
                  </p>
                </div>
              </div>

              <div className="connection">
                <span className={connected ? "green-dot" : "red-dot"} />
                {connected ? "LIVE API CONNECTED" : "API OFFLINE"}
              </div>
            </div>

            {/* SEARCH PANEL */}
            <div className="search-panel">
              <div className="search-title">
                <div>
                  <strong>Investigate Indicator</strong>
                  <span>IP • Domain • URL • File Hash</span>
                </div>

                <button
                  className="refresh-btn"
                  onClick={() => {
                    loadOverview();
                    if (query) searchIOC();
                  }}
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              <div className="ioc-search">
                <Search size={18} />
                <input
                  autoFocus
                  placeholder="Enter IP, domain, URL, hash or tag..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") searchIOC();
                  }}
                />
                <button onClick={() => searchIOC()}>
                  {loading ? "Searching..." : "Investigate"}
                </button>
              </div>

              <div className="quick-searches">
                <span>Quick search:</span>
                <button onClick={() => {
                  setQuery("185.220.101.4");
                  searchIOC("185.220.101.4");
                }}>
                  185.220.101.4
                </button>
                <button onClick={() => {
                  setQuery("tor");
                  searchIOC("tor");
                }}>
                  tor
                </button>
                <button onClick={() => {
                  setQuery("suspicious");
                  searchIOC("suspicious");
                }}>
                  suspicious
                </button>
              </div>
            </div>

            {/* LIVE STATS */}
            <div className="stats-grid">

              <div className="stat-card">
                <div className="stat-icon blue">
                  <Database size={17} />
                </div>
                <div>
                  <span>TOTAL IOCs</span>
                  <strong>{totalIOCs}</strong>
                  <small>Live database</small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon red">
                  <Bell size={17} />
                </div>
                <div>
                  <span>OPEN ALERTS</span>
                  <strong>{openAlerts}</strong>
                  <small>Requires attention</small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">
                  <AlertTriangle size={17} />
                </div>
                <div>
                  <span>ACTIVE INCIDENTS</span>
                  <strong>{incidents}</strong>
                  <small>Under investigation</small>
                </div>
              </div>

            </div>

            {/* RESULTS */}
            <div className="results-panel">

              <div className="panel-header">
                <div>
                  <h3>Investigation Results</h3>
                  <span>
                    {results.length
                      ? `${results.length} indicator(s) found`
                      : "Search your intelligence database"}
                  </span>
                </div>
              </div>

              {loading && (
                <div className="empty-state">
                  <RefreshCw className="spin" size={25} />
                  <p>Querying ThreatLens intelligence...</p>
                </div>
              )}

              {!loading && query && results.length === 0 && (
                <div className="empty-state">
                  <Search size={28} />
                  <p>No matching IOC found.</p>
                  <small>
                    Try an IP, domain, URL, hash, source or tag.
                  </small>
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="results-list">
                  {results.map((ioc) => (
                    <button
                      className="ioc-row"
                      key={ioc.id}
                      onClick={() => setSelected(ioc)}
                    >
                      <div className="ioc-main">
                        <div className={`ioc-type ${ioc.ioc_type}`}>
                          {ioc.ioc_type.toUpperCase()}
                        </div>
                        <div>
                          <strong>{ioc.value}</strong>
                          <small>
                            Source: {ioc.source} • Confidence: {ioc.confidence}%
                          </small>
                        </div>
                      </div>

                      <div className="ioc-right">
                        <span className={`severity ${severityClass(ioc.severity)}`}>
                          {ioc.severity}
                        </span>
                        <ChevronRight size={15} />
                      </div>
                    </button>
                  ))}
                </div>
              )}

            </div>

            {/* DETAILS */}
            {selected && (
              <div className="details-panel">

                <div className="panel-header">
                  <div>
                    <h3>IOC Investigation</h3>
                    <span>Indicator #{selected.id}</span>
                  </div>

                  <button
                    className={`severity ${severityClass(selected.severity)}`}
                  >
                    {selected.severity}
                  </button>
                </div>

                <div className="detail-grid">

                  <div className="detail-box">
                    <span>IOC TYPE</span>
                    <strong>{selected.ioc_type}</strong>
                  </div>

                  <div className="detail-box">
                    <span>CONFIDENCE</span>
                    <strong>{selected.confidence}%</strong>
                  </div>

                  <div className="detail-box wide">
                    <span>INDICATOR VALUE</span>
                    <strong>{selected.value}</strong>
                  </div>

                  <div className="detail-box">
                    <span>SOURCE</span>
                    <strong>{selected.source}</strong>
                  </div>

                  <div className="detail-box">
                    <span>STATUS</span>
                    <strong>
                      {selected.is_active ? "ACTIVE" : "INACTIVE"}
                    </strong>
                  </div>

                  <div className="detail-box wide">
                    <span>TAGS</span>
                    <strong>{selected.tags || "No tags"}</strong>
                  </div>

                  <div className="detail-box">
                    <span>FIRST SEEN</span>
                    <strong>{selected.first_seen || "—"}</strong>
                  </div>

                  <div className="detail-box">
                    <span>LAST SEEN</span>
                    <strong>{selected.last_seen || "—"}</strong>
                  </div>

                </div>

              </div>
            )}

          </section>
        )}

      </main>
    </div>
  );
}

export default App;
