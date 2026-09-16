import { useEffect, useState } from "react";
import {
  Shield,
  User,
  Mail,
  KeyRound,
  Server,
  Activity,
  LogOut,
  CheckCircle2,
  Lock,
  RefreshCw,
} from "lucide-react";
import { apiFetch } from "./api";

type UserData = {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
};

type SettingsProps = {
  onLogout: () => void;
};

export default function Settings({ onLogout }: SettingsProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [apiStatus, setApiStatus] = useState("Checking...");
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    setLoading(true);

    try {
      const response = await apiFetch("/api/auth/me");

      if (!response.ok) {
        throw new Error("Authentication failed");
      }

      const data = await response.json();
      setUser(data);
      setApiStatus("Operational");
    } catch {
      setApiStatus("Unavailable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="settings-page">

      <div className="settings-header">
        <div>
          <div className="settings-eyebrow">
            <span />
            SYSTEM CONFIGURATION
          </div>

          <h1>Settings</h1>

          <p>
            Manage your ThreatLens account, security session and platform status.
          </p>
        </div>

        <button
          className="settings-refresh"
          onClick={loadSettings}
          disabled={loading}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      <div className="settings-grid">

        {/* ACCOUNT */}
        <section className="settings-card account-card">

          <div className="settings-card-header">
            <div className="settings-card-icon blue">
              <User size={19} />
            </div>

            <div>
              <span>ACCOUNT</span>
              <h2>Operator Profile</h2>
            </div>
          </div>

          <div className="profile-block">
            <div className="avatar">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>

            <div>
              <strong>
                {loading ? "Loading..." : user?.username}
              </strong>

              <span>
                {user?.role?.toUpperCase() || "USER"}
              </span>
            </div>

            <div className="active-badge">
              <CheckCircle2 size={13} />
              ACTIVE
            </div>
          </div>

          <div className="setting-row">
            <div>
              <User size={15} />
              <span>Username</span>
            </div>
            <strong>{user?.username || "—"}</strong>
          </div>

          <div className="setting-row">
            <div>
              <Mail size={15} />
              <span>Email</span>
            </div>
            <strong>{user?.email || "—"}</strong>
          </div>

          <div className="setting-row">
            <div>
              <Shield size={15} />
              <span>Role</span>
            </div>
            <strong className="role-value">
              {user?.role?.toUpperCase() || "—"}
            </strong>
          </div>

        </section>


        {/* SECURITY */}
        <section className="settings-card">

          <div className="settings-card-header">
            <div className="settings-card-icon purple">
              <Lock size={19} />
            </div>

            <div>
              <span>SECURITY</span>
              <h2>Authentication</h2>
            </div>
          </div>

          <div className="security-status">
            <div className="security-check">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <strong>JWT Authentication</strong>
              <span>Secure session is active</span>
            </div>
          </div>

          <div className="setting-row">
            <div>
              <KeyRound size={15} />
              <span>Session</span>
            </div>

            <strong className="green-text">
              AUTHENTICATED
            </strong>
          </div>

          <div className="setting-row">
            <div>
              <Shield size={15} />
              <span>Token</span>
            </div>

            <strong>BEARER JWT</strong>
          </div>

          <div className="setting-row">
            <div>
              <Activity size={15} />
              <span>Account</span>
            </div>

            <strong className="green-text">
              {user?.is_active ? "ACTIVE" : "DISABLED"}
            </strong>
          </div>

        </section>


        {/* SYSTEM */}
        <section className="settings-card">

          <div className="settings-card-header">
            <div className="settings-card-icon green">
              <Server size={19} />
            </div>

            <div>
              <span>PLATFORM</span>
              <h2>System Status</h2>
            </div>
          </div>

          <div className="system-row">
            <div>
              <span className="status-dot green-dot-settings" />
              <div>
                <strong>ThreatLens API</strong>
                <small>FastAPI backend</small>
              </div>
            </div>

            <b>{apiStatus}</b>
          </div>

          <div className="system-row">
            <div>
              <span className="status-dot green-dot-settings" />
              <div>
                <strong>Authentication</strong>
                <small>JWT security layer</small>
              </div>
            </div>

            <b>Operational</b>
          </div>

          <div className="system-row">
            <div>
              <span className="status-dot green-dot-settings" />
              <div>
                <strong>Threat Intelligence</strong>
                <small>IOC intelligence engine</small>
              </div>
            </div>

            <b>Active</b>
          </div>

          <div className="system-row">
            <div>
              <span className="status-dot green-dot-settings" />
              <div>
                <strong>Realtime Channel</strong>
                <small>WebSocket alert stream</small>
              </div>
            </div>

            <b>Connected</b>
          </div>

        </section>


        {/* SESSION */}
        <section className="settings-card session-card">

          <div className="settings-card-header">
            <div className="settings-card-icon orange">
              <Activity size={19} />
            </div>

            <div>
              <span>SESSION CONTROL</span>
              <h2>Current Session</h2>
            </div>
          </div>

          <div className="session-info">
            <div className="session-icon">
              <Shield size={24} />
            </div>

            <div>
              <strong>ThreatLens Secure Session</strong>
              <span>
                Your current browser session is authenticated using JWT.
              </span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={onLogout}
          >
            <LogOut size={16} />
            Sign Out Securely
          </button>

        </section>

      </div>

      <div className="settings-footer">
        <Shield size={14} />
        <span>ThreatLens Security Operations Platform</span>
        <span>•</span>
        <span>Authentication Protected</span>
      </div>

    </div>
  );
}
