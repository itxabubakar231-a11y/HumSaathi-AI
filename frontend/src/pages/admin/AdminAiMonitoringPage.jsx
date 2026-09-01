import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function AdminAiMonitoringPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.adminGetAiMonitoring()
      .then((res) => setData(res))
      .catch((err) => setError(err.message || 'Failed to load AI monitoring data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="loading-spinner" />
        <p>Inspecting AI engine telemetry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error-card">
        <h3>AI Monitoring Unavailable</h3>
        <p>{error}</p>
      </div>
    );
  }

  const overview = data?.overview || {};
  const evalBreakdown = data?.evaluationBreakdown || {};
  const modeComp = data?.modeComparison || [];

  return (
    <div className="admin-ai-monitoring-page">
      <div className="admin-header-row">
        <div>
          <h1 className="admin-title">AI Engine Monitoring</h1>
          <p className="admin-subtitle">Real-time health, response performance, and conversational rubric scoring</p>
        </div>
      </div>

      {/* Engine Status Banner */}
      <div className="admin-engine-status-card">
        <div className="engine-status-left">
          <span className="engine-icon"></span>
          <div>
            <h3 className="engine-title">Active AI Model: <code>{overview.aiModel || 'gemini-1.5-flash'}</code></h3>
            <p className="engine-desc">
              Engine Mode: <strong>{overview.engineMode === 'gemini-live' ? ' Direct Gemini Live API' : ' Rule-Based Intelligent Fallback'}</strong>
            </p>
          </div>
        </div>
        <div className="engine-status-right">
          <span className={`engine-badge ${overview.aiAvailable ? 'engine-live' : 'engine-fallback'}`}>
            {overview.aiAvailable ? '● Connected' : '○ Fallback Active'}
          </span>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="admin-metrics-grid" style={{ marginTop: '1.5rem' }}>
        <div className="admin-metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>

          </div>
          <div className="metric-info">
            <span className="metric-label">Total AI Turns</span>
            <span className="metric-value">{overview.totalTurns || 0}</span>
            <span className="metric-subtext">{overview.averageTurnsPerSession || 0} turns/session avg</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>

          </div>
          <div className="metric-info">
            <span className="metric-label">Evaluated Sessions</span>
            <span className="metric-value">{overview.totalEvaluations || 0}</span>
            <span className="metric-subtext">Rubric evaluations scored</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>

          </div>
          <div className="metric-info">
            <span className="metric-label">Overall Rubric Avg</span>
            <span className="metric-value">{overview.averageOverallScore || 0}%</span>
            <span className="metric-subtext">Communication mastery</span>
          </div>
        </div>
      </div>

      {/* Rubric Breakdown Grid */}
      <div className="admin-charts-grid" style={{ marginTop: '1.5rem' }}>
        <div className="admin-card">
          <div className="admin-card-head">
            <h3>Rubric Dimension Averages</h3>
            <span className="card-tag">5-Star Scale</span>
          </div>
          <div className="rubric-bars-list">
            <div className="dist-row">
              <div className="dist-row-label">
                <span>Clarity & Expression</span>
                <strong>{evalBreakdown.clarity || 0} / 5</strong>
              </div>
              <div className="dist-track">
                <div className="dist-fill" style={{ width: `${((evalBreakdown.clarity || 0) / 5) * 100}%`, backgroundColor: '#3b82f6' }} />
              </div>
            </div>

            <div className="dist-row">
              <div className="dist-row-label">
                <span>Relevance & Appropriateness</span>
                <strong>{evalBreakdown.relevance || 0} / 5</strong>
              </div>
              <div className="dist-track">
                <div className="dist-fill" style={{ width: `${((evalBreakdown.relevance || 0) / 5) * 100}%`, backgroundColor: '#10b981' }} />
              </div>
            </div>

            <div className="dist-row">
              <div className="dist-row-label">
                <span>Conversation Flow</span>
                <strong>{evalBreakdown.conversationFlow || 0} / 5</strong>
              </div>
              <div className="dist-track">
                <div className="dist-fill" style={{ width: `${((evalBreakdown.conversationFlow || 0) / 5) * 100}%`, backgroundColor: '#8b5cf6' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-head">
            <h3>Modality Performance</h3>
            <span className="card-tag">Sessions</span>
          </div>
          <div className="mode-distribution-container">
            {modeComp.map((m) => (
              <div key={m.mode} className="mode-stat-box">
                <span className="mode-icon">{m.mode.includes('Voice') ? '' : ''}</span>
                <span className="mode-name">{m.mode}</span>
                <strong className="mode-pct">{m.percent}%</strong>
                <span className="mode-count">{m.count} total sessions</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
