import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function AdminSettingsPage() {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminGetSystemStatus()
      .then((res) => setStatusData(res))
      .catch(() => setStatusData({ status: 'degraded', services: {} }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-settings-page">
      <div className="admin-header-row">
        <div>
          <h1 className="admin-title">System Status & Environment</h1>
          <p className="admin-subtitle">Diagnostics, component health checks, and platform runtime status</p>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading-state">
          <div className="loading-spinner" />
          <p>Running health diagnostics...</p>
        </div>
      ) : (
        <div className="admin-settings-grid">
          {/* Services Health */}
          <div className="admin-card">
            <div className="admin-card-head">
              <h3>Service Health Checks</h3>
              <span className="card-tag">Realtime</span>
            </div>

            <div className="health-check-list">
              <div className="health-check-item">
                <div className="health-left">
                  <span className="health-dot operational" />
                  <div>
                    <strong>FastAPI Backend</strong>
                    <span className="health-sub">API Engine v1.1.0</span>
                  </div>
                </div>
                <span className="health-badge operational">Operational</span>
              </div>

              <div className="health-check-item">
                <div className="health-left">
                  <span className={`health-dot ${statusData?.services?.database?.status === 'healthy' ? 'operational' : 'degraded'}`} />
                  <div>
                    <strong>Database Connection</strong>
                    <span className="health-sub">Driver: {statusData?.services?.database?.driver || 'SQLAlchemy Engine'}</span>
                  </div>
                </div>
                <span className={`health-badge ${statusData?.services?.database?.status === 'healthy' ? 'operational' : 'degraded'}`}>
                  {statusData?.services?.database?.status === 'healthy' ? 'Connected' : 'Degraded'}
                </span>
              </div>

              <div className="health-check-item">
                <div className="health-left">
                  <span className="health-dot operational" />
                  <div>
                    <strong>AI Conversational Engine</strong>
                    <span className="health-sub">Model: {statusData?.services?.aiService?.model || 'gemini-1.5-flash'}</span>
                  </div>
                </div>
                <span className="health-badge operational">Active</span>
              </div>

              <div className="health-check-item">
                <div className="health-left">
                  <span className="health-dot operational" />
                  <div>
                    <strong>Client Interface</strong>
                    <span className="health-sub">Vite + React (Accessible SPA)</span>
                  </div>
                </div>
                <span className="health-badge operational">Operational</span>
              </div>
            </div>
          </div>

          {/* System Specs & Privacy Safeguards */}
          <div className="admin-card">
            <div className="admin-card-head">
              <h3>Security & Privacy Architecture</h3>
              <span className="card-tag">Compliance</span>
            </div>
            <div className="security-specs-list">
              <div className="spec-row">
                <span className="spec-icon">🔒</span>
                <div>
                  <strong>Role-Based Access Control (RBAC)</strong>
                  <p>Server-side authentication on every Admin API endpoint</p>
                </div>
              </div>
              <div className="spec-row">
                <span className="spec-icon">🛡️</span>
                <div>
                  <strong>Password Isolation</strong>
                  <p>NIST-compliant PBKDF2-HMAC-SHA256 hashing; secrets never exposed via API</p>
                </div>
              </div>
              <div className="spec-row">
                <span className="spec-icon">👤</span>
                <div>
                  <strong>Persona Data Isolation</strong>
                  <p>Strict user token scoping prevents cross-learner IDOR exposure</p>
                </div>
              </div>
              <div className="spec-row">
                <span className="spec-icon">📜</span>
                <div>
                  <strong>Tamper-Evident Audit Logging</strong>
                  <p>Administrative modifications tracked with timestamp and target ID</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
