import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';

export default function ScenarioPage() {
  const { user } = useUser();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) {
      navigate('/setup');
      return;
    }
    api.getScenarios({ persona: user.persona, language: user.language })
      .then((data) => {
        setScenarios(data.scenarios || []);
      })
      .catch((err) => {
        setError(err.message || t('common.error'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, navigate, t]);

  const handleStart = async (scenarioId, mode) => {
    try {
      const res = await api.startConversation({
        userId: user.id,
        scenarioId,
        mode
      });
      if (res && res.session) {
        navigate(`/conversation/${res.session.id}`);
      }
    } catch (err) {
      setError(err.message || t('common.error'));
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-card">
        <p className="error-text">{error}</p>
      </div>
    );
  }

  return (
    <div className="scenarios-page">
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <p className="eyebrow">{t('nav.scenarios')}</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: '600' }}>
          {t('scenarios.title')}
        </h1>
        <p className="intro" style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
          {t('scenarios.intro')}
        </p>
      </div>

      <div
        className="activities-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 'var(--space-md)',
          marginTop: 'var(--space-md)'
        }}
      >
        {scenarios.map((scen) => (
          <div
            key={scen.id}
            className="dashboard-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xs)' }}>
                <span className="module-icon-wrap" style={{ width: '2.75rem', height: '2.75rem', fontSize: '1.25rem', marginBottom: 0 }}>
                  💬
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {scen.difficulty}
                </span>
              </div>

              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: 'var(--space-xs)', fontWeight: '600' }}>
                {scen.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--space-sm)', lineHeight: '1.5' }}>
                {scen.description}
              </p>

              <div style={{ fontSize: '0.85rem', marginBottom: 'var(--space-sm)', color: 'var(--text-primary)', background: 'var(--bg-primary)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t('scenarios.role')}:</span> <strong>{scen.aiRole}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-xs)', marginTop: 'var(--space-xs)' }}>
              <button
                className="btn-primary"
                style={{ flex: 1, padding: '0.6rem 0.8rem', fontSize: '0.9rem' }}
                onClick={() => handleStart(scen.id, 'text')}
              >
                💬 {t('scenarios.startText')}
              </button>
              <button
                className="btn-secondary"
                style={{ flex: 1, padding: '0.6rem 0.8rem', fontSize: '0.9rem' }}
                onClick={() => handleStart(scen.id, 'voice')}
              >
                🎙️ {t('scenarios.startVoice')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
