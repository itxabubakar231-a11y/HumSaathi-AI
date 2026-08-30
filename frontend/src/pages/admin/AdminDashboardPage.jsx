import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.adminGetDashboard()
      .then((res) => setData(res))
      .catch((err) => setError(err.message || 'Failed to load dashboard metrics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="loading-spinner" />
        <p>Loading administrative dashboard metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error-card">
        <span className="error-icon">⚠️</span>
        <h3>Failed to Load Dashboard</h3>
        <p>{error}</p>
        <button className="btn-secondary" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const overview = data?.overview || {};
  const analytics = data?.analytics || {};
  const personaDist = analytics.personaDistribution || [];
  const langDist = analytics.languageDistribution || [];
  const modeDist = analytics.modeDistribution || [];
  const timeline = analytics.activityTimeline || [];

  return (
    <div className="admin-dashboard-page">
      {/* Page Header */}
      <div className="admin-header-row">
        <div>
          <h1 className="admin-title">System Overview</h1>
          <p className="admin-subtitle">Real-time aggregate platform performance and learner metrics</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn-primary" onClick={() => navigate('/admin/users')}>
            👥 Manage Users
          </button>
          <button className="admin-btn-secondary" onClick={() => navigate('/admin/scenarios')}>
            🧩 Edit Scenarios
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            👥
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Users</span>
            <span className="metric-value">{overview.totalUsers ?? 0}</span>
            <span className="metric-subtext">{overview.activeUsers ?? 0} active accounts</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            🧒
          </div>
          <div className="metric-info">
            <span className="metric-label">Child Learners</span>
            <span className="metric-value">{overview.childUsers ?? 0}</span>
            <span className="metric-subtext">Ages 4 – 12 portal</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            🧑‍🎓
          </div>
          <div className="metric-info">
            <span className="metric-label">Teen Learners</span>
            <span className="metric-value">{overview.teenUsers ?? 0}</span>
            <span className="metric-subtext">Ages 13 – 17 portal</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
            👨
          </div>
          <div className="metric-info">
            <span className="metric-label">Adult Learners</span>
            <span className="metric-value">{overview.adultUsers ?? 0}</span>
            <span className="metric-subtext">Ages 18+ portal</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            💬
          </div>
          <div className="metric-info">
            <span className="metric-label">Practice Sessions</span>
            <span className="metric-value">{overview.totalSessions ?? 0}</span>
            <span className="metric-subtext">{overview.completedScenarios ?? 0} completed</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
            🎯
          </div>
          <div className="metric-info">
            <span className="metric-label">Average Score</span>
            <span className="metric-value">{overview.averageScore ?? 0}%</span>
            <span className="metric-subtext">Across evaluated sessions</span>
          </div>
        </div>
      </div>

      {/* Analytics Rows */}
      <div className="admin-charts-grid">
        {/* Persona Breakdown Card */}
        <div className="admin-card">
          <div className="admin-card-head">
            <h3>Learners by Portal</h3>
            <span className="card-tag">Distribution</span>
          </div>
          <div className="persona-distribution-bars">
            {personaDist.map((item) => {
              const total = overview.totalUsers || 1;
              const pct = Math.round((item.value / total) * 100);
              return (
                <div key={item.name} className="dist-row">
                  <div className="dist-row-label">
                    <span>{item.name}</span>
                    <strong>{item.value} ({pct}%)</strong>
                  </div>
                  <div className="dist-track">
                    <div
                      className="dist-fill"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Practice Mode Breakdown */}
        <div className="admin-card">
          <div className="admin-card-head">
            <h3>Practice Modality</h3>
            <span className="card-tag">Voice vs Text</span>
          </div>
          <div className="mode-distribution-container">
            {modeDist.map((m) => (
              <div key={m.name} className="mode-stat-box">
                <span className="mode-icon">{m.name.includes('Voice') ? '🎙️' : '⌨️'}</span>
                <span className="mode-name">{m.name}</span>
                <strong className="mode-pct">{m.percent}%</strong>
                <span className="mode-count">{m.count} total sessions</span>
              </div>
            ))}
          </div>
        </div>

        {/* Language Breakdown */}
        <div className="admin-card">
          <div className="admin-card-head">
            <h3>Language Preference</h3>
            <span className="card-tag">Localization</span>
          </div>
          <div className="lang-distribution-list">
            {langDist.map((l) => (
              <div key={l.code} className="lang-stat-item">
                <span className="lang-icon">{l.code === 'en' ? '🇬🇧' : '🇵🇰'}</span>
                <div className="lang-details">
                  <span className="lang-title">{l.name}</span>
                  <span className="lang-sub">{l.count} registered learners</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Session Activity */}
        <div className="admin-card">
          <div className="admin-card-head">
            <h3>Session Activity (Last 7 Days)</h3>
            <span className="card-tag">Aggregate Trend</span>
          </div>
          <div className="timeline-chart-bars">
            {timeline.map((day) => (
              <div key={day.date} className="timeline-bar-col">
                <div className="timeline-bar-wrapper">
                  <div
                    className="timeline-bar-fill"
                    style={{
                      height: `${Math.max(15, Math.min(100, day.sessions * 20))}%`,
                      backgroundColor: 'var(--primary-color)',
                    }}
                    title={`${day.sessions} sessions`}
                  />
                </div>
                <span className="timeline-count">{day.sessions}</span>
                <span className="timeline-date">{day.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
