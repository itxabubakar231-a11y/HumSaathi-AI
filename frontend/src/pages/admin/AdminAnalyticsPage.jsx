import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.adminGetDashboard()
      .then((res) => setData(res))
      .catch((err) => setError(err.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="loading-spinner" />
        <p>Calculating platform analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error-card">
        <h3>Analytics Unavailable</h3>
        <p>{error}</p>
      </div>
    );
  }

  const overview = data?.overview || {};
  const analytics = data?.analytics || {};
  const personaDist = analytics.personaDistribution || [];
  const diffDist = analytics.difficultyDistribution || [];
  const modeDist = analytics.modeDistribution || [];
  const langDist = analytics.languageDistribution || [];

  return (
    <div className="admin-analytics-page">
      <div className="admin-header-row">
        <div>
          <h1 className="admin-title">Analytics & Intelligence</h1>
          <p className="admin-subtitle">Aggregate metrics on learner engagement, scenario difficulty, and modality</p>
        </div>
      </div>

      <div className="admin-analytics-summary-strip">
        <div className="summary-strip-card">
          <span>Overall Success Rate</span>
          <strong>{overview.totalSessions > 0 ? Math.round((overview.completedScenarios / overview.totalSessions) * 100) : 0}%</strong>
          <small>{overview.completedScenarios} completed of {overview.totalSessions} sessions</small>
        </div>
        <div className="summary-strip-card">
          <span>Average Performance Score</span>
          <strong>{overview.averageScore || 0}%</strong>
          <small>AI rubric evaluated metric</small>
        </div>
        <div className="summary-strip-card">
          <span>Total Activity Attempts</span>
          <strong>{overview.totalAttempts || 0}</strong>
          <small>Foundational exercises attempted</small>
        </div>
      </div>

      <div className="admin-charts-grid">
        {/* Scenario Difficulty Distribution */}
        <div className="admin-card">
          <div className="admin-card-head">
            <h3>Difficulty Distribution</h3>
            <span className="card-tag">Scenarios</span>
          </div>
          <div className="difficulty-bars-container">
            {diffDist.map((d) => (
              <div key={d.difficulty} className="diff-bar-item">
                <div className="diff-bar-header">
                  <span>{d.difficulty}</span>
                  <strong>{d.count} scenarios</strong>
                </div>
                <div className="dist-track">
                  <div
                    className="dist-fill"
                    style={{
                      width: `${Math.min(100, d.count * 15)}%`,
                      backgroundColor: d.difficulty === 'Easy' ? '#10b981' : d.difficulty === 'Medium' ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portal Breakdown */}
        <div className="admin-card">
          <div className="admin-card-head">
            <h3>Portal Enrollment</h3>
            <span className="card-tag">Learners</span>
          </div>
          <div className="persona-distribution-bars">
            {personaDist.map((p) => {
              const total = overview.totalUsers || 1;
              const pct = Math.round((p.value / total) * 100);
              return (
                <div key={p.name} className="dist-row">
                  <div className="dist-row-label">
                    <span>{p.name}</span>
                    <strong>{p.value} ({pct}%)</strong>
                  </div>
                  <div className="dist-track">
                    <div className="dist-fill" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Voice vs Text Ratio */}
        <div className="admin-card">
          <div className="admin-card-head">
            <h3>Conversation Modality</h3>
            <span className="card-tag">Practice Sessions</span>
          </div>
          <div className="mode-distribution-container">
            {modeDist.map((m) => (
              <div key={m.name} className="mode-stat-box">
                <span className="mode-icon">{m.name.includes('Voice') ? '' : ''}</span>
                <span className="mode-name">{m.name}</span>
                <strong className="mode-pct">{m.percent}%</strong>
                <span className="mode-count">{m.count} total sessions</span>
              </div>
            ))}
          </div>
        </div>

        {/* Language Preferences */}
        <div className="admin-card">
          <div className="admin-card-head">
            <h3>Localization Preferences</h3>
            <span className="card-tag">Learner Locales</span>
          </div>
          <div className="lang-distribution-list">
            {langDist.map((l) => (
              <div key={l.code} className="lang-stat-item">
                <span className="lang-icon">{l.code === 'en' ? '' : ''}</span>
                <div className="lang-details">
                  <span className="lang-title">{l.name}</span>
                  <span className="lang-sub">{l.count} active profiles</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
