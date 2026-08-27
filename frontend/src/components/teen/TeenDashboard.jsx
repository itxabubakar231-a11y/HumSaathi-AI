import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';

export default function TeenDashboard({ user, dashboard }) {
  const { t } = useI18n();
  const navigate = useNavigate();

  const teenModules = [
    {
      id: 'teen_reading_vocab',
      titleKey: 'skills.teen.readingVocab.title',
      descKey: 'skills.teen.readingVocab.desc',
      icon: '📚',
      path: '/skill/teen_reading_vocab',
    },
    {
      id: 'teen_problem_solving',
      titleKey: 'skills.teen.problemSolving.title',
      descKey: 'skills.teen.problemSolving.desc',
      icon: '🧩',
      path: '/skill/teen_problem_solving',
    },
    {
      id: 'teen_communication',
      titleKey: 'skills.teen.communication.title',
      descKey: 'skills.teen.communication.desc',
      icon: '💬',
      path: '/scenarios',
    },
  ];

  return (
    <div className="dashboard teen-dashboard">
      <header className="dashboard-header">
        <div className="welcome-text">
          <p className="eyebrow">{t('dashboard.welcome')} 👋</p>
          <h1>{user.name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            🌱 {t('persona.teen')} · {t('persona.teenDetail')}
          </p>
        </div>
        <div className="context-indicator">
          <button className="text-btn" type="button" onClick={() => navigate('/settings')}>
            {t('common.changeSettings')}
          </button>
        </div>
      </header>

      {/* Core Skill Modules */}
      <section>
        <div style={{ marginBottom: 'var(--space-sm)' }}>
          <p className="kicker">{t('skills.teen.kicker')}</p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: '600' }}>
            {t('skills.teen.heading')}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-md)' }}>
          {teenModules.map((mod) => (
            <div
              key={mod.id}
              className="dashboard-card"
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div className="module-icon-wrap">{mod.icon}</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-xs)', fontWeight: '600' }}>
                  {t(mod.titleKey)}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.55', marginBottom: 'var(--space-sm)' }}>
                  {t(mod.descKey)}
                </p>
              </div>

              <button
                className="btn-primary"
                type="button"
                onClick={() => navigate(mod.path)}
                style={{ width: '100%', marginTop: 'var(--space-xs)' }}
              >
                {t('skills.startPractice')} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Stats & Progress */}
      <div className="dashboard-grid" style={{ marginTop: 'var(--space-md)' }}>
        <section className="dashboard-card today-plan">
          <h2>{t('dashboard.plan')}</h2>
          <div className="plan-stats">
            <span className="stat-highlight">{dashboard?.completedCount || 0} {t('dashboard.activities')}</span>
            <span className="stat-time">{Math.round(dashboard?.avgAccuracy || 0)}% {t('progress.accuracy').toLowerCase()}</span>
          </div>
          <button className="btn-secondary" type="button" onClick={() => navigate('/progress')}>
            {t('dashboard.viewAll')}
          </button>
        </section>

        <section className="dashboard-card progress-snapshot">
          <h2>{t('dashboard.progressSnapshot')}</h2>
          <div className="progress-list">
            {dashboard?.progress?.length ? dashboard.progress.map((prog) => (
              <div key={prog.skill} className="progress-item">
                <div className="progress-label">
                  <span style={{ textTransform: 'capitalize' }}>{prog.skill.replace('_', ' ')}</span>
                  <span>{Math.round(prog.accuracy)}%</span>
                </div>
                <div className="progress-bar-container" aria-hidden="true">
                  <div className="progress-bar-fill" style={{ width: `${Math.max(10, Math.min(100, prog.accuracy))}%` }} />
                </div>
              </div>
            )) : (
              <p className="card-desc">{t('progress.none')}</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
