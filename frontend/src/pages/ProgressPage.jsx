import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';

export default function ProgressPage() {
  const { user } = useUser();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      navigate('/setup');
      return;
    }
    api.getDashboard(user.id)
      .then((data) => setDashboard(data.dashboard))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="error-card">
        <p className="error-text">{t('common.error')}</p>
      </div>
    );
  }

  return (
    <div className="progress-page">
      <div className="progress-page-header">
        <p className="eyebrow">{t('nav.progress')}</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: '600' }}>
          {t('progress.title')}
        </h1>
      </div>

      {/* Stats Summary Grid */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <div className="stat-card" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)' }}>
          <span className="stat-label">{t('progress.completed')}</span>
          <span className="stat-value">{dashboard.completedCount}</span>
        </div>
        <div className="stat-card" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)' }}>
          <span className="stat-label">{t('progress.accuracy')}</span>
          <span className="stat-value">{dashboard.avgAccuracy}%</span>
        </div>
        <div className="stat-card" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)' }}>
          <span className="stat-label">{t('progress.level')}</span>
          <span className="stat-value" style={{ textTransform: 'capitalize' }}>{dashboard.currentLevel}</span>
        </div>
      </div>

      {/* Skill Strengths & Growth Areas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <section className="dashboard-card" style={{ padding: 'var(--space-md)', borderLeft: '4px solid var(--accent-positive)', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 'var(--space-xs)', fontWeight: '600' }}>
            🌟 {t('progress.strongest')}
          </h2>
          <p style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--accent-positive)', textTransform: 'capitalize' }}>
            {dashboard.strongest?.skill ? dashboard.strongest.skill.replace('_', ' ') : '—'} 
            {dashboard.strongest?.accuracy !== undefined && ` (${dashboard.strongest.accuracy}%)`}
          </p>
        </section>

        <section className="dashboard-card" style={{ padding: 'var(--space-md)', borderLeft: '4px solid var(--accent-highlight)', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 'var(--space-xs)', fontWeight: '600' }}>
            🎯 {t('progress.needsPractice')}
          </h2>
          <p style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--accent-highlight)', textTransform: 'capitalize' }}>
            {dashboard.needsPractice?.skill ? dashboard.needsPractice.skill.replace('_', ' ') : '—'} 
            {dashboard.needsPractice?.accuracy !== undefined && ` (${dashboard.needsPractice.accuracy}%)`}
          </p>
        </section>
      </div>

      {/* Recent Activity Log */}
      <section className="dashboard-card" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: 'var(--space-sm)', fontWeight: '600' }}>
          {t('progress.recent')}
        </h2>

        {dashboard.recentAttempts?.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            {dashboard.recentAttempts.map((a) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{a.title}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                    Difficulty: {a.difficulty}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--interactive-primary)' }}>
                    {a.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>{t('progress.none')}</p>
        )}
      </section>
    </div>
  );
}
