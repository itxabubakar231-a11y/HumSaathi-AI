import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';

function getLocalizedText(val, lang, fallback = '') {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return val[lang] || val.en || val.ur || val.ur_rm || fallback;
  }
  return String(val);
}

export default function ScenarioPage() {
  const { user } = useUser();
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  const fetchScenarios = () => {
    setLoading(true);
    setError('');
    const currentPersona = user?.persona || 'teen';
    const currentLang = user?.language || language || 'en';

    api.getScenarios({ persona: currentPersona, language: currentLang })
      .then((data) => {
        const rawList = data?.scenarios || (Array.isArray(data) ? data : []);
        const normalized = rawList.filter(Boolean).map((scen) => ({
          ...scen,
          id: scen.id || `scen_${Math.random().toString(36).substring(2, 9)}`,
          title: getLocalizedText(scen.title, currentLang, t('scenarios.title')),
          description: getLocalizedText(scen.description, currentLang, t('scenarios.intro')),
          aiRole: getLocalizedText(scen.aiRole, currentLang, scen.aiRole || 'Coach'),
          difficulty: scen.difficulty ? String(scen.difficulty).toLowerCase() : 'easy',
          options: Array.isArray(scen.options) ? scen.options : [],
        }));
        setScenarios(normalized);
      })
      .catch((err) => {
        setError(err.message || t('common.error'));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }
    fetchScenarios();
  }, [user, language, navigate]);

  const handleStart = async (scenarioId, mode) => {
    try {
      const activeLang = user?.language || language || 'en';
      const res = await api.startConversation({
        userId: user?.id,
        scenarioId,
        mode,
        language: activeLang,
      });
      const sessionId = res?.session?.id || res?.id || res?.sessionId;
      if (sessionId) {
        navigate(`/conversation/${sessionId}`);
      } else {
        setError(t('common.error') || 'Unable to start conversation session');
      }
    } catch (err) {
      setError(err?.message || t('common.error'));
    }
  };

  const getRoleLabel = (roleStr) => {
    if (!roleStr) return 'AI Coach';
    const key = `role.${String(roleStr).toLowerCase().replace(/\s+/g, '_')}`;
    const translated = t(key);
    if (translated && translated !== key) return translated;
    return getLocalizedText(roleStr, language, roleStr);
  };

  const getDifficultyLabel = (diff) => {
    const key = `scenarios.${String(diff).toLowerCase()}`;
    const translated = t(key);
    if (translated && translated !== key) return translated;
    return diff;
  };

  const filteredScenarios = (scenarios || []).filter((scen) => {
    if (!scen) return false;
    if (filterDifficulty === 'all') return true;
    return scen.difficulty === filterDifficulty;
  });

  const isRtl = language === 'ur';

  if (loading && scenarios.length === 0) {
    return (
      <div className="loading-screen" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="loading-spinner" />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (error && scenarios.length === 0) {
    return (
      <div className="error-card" dir={isRtl ? 'rtl' : 'ltr'} style={{ maxWidth: '600px', margin: 'var(--space-xl) auto', padding: 'var(--space-lg)' }}>
        <p className="error-text">{error}</p>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          <button className="btn-primary" onClick={fetchScenarios}>
             {t('common.playAgain') || t('common.continue') || 'Retry'}
          </button>
          <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
            ← {t('nav.dashboard')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="scenarios-page" dir={isRtl ? 'rtl' : 'ltr'} style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--space-md) var(--space-sm)' }}>
      {/* Top Header */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <p className="eyebrow">{t('nav.scenarios')}</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: '600' }}>
          {t('scenarios.title')}
        </h1>
        <p className="intro" style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
          {t('scenarios.intro')}
        </p>
      </div>

      {/* Difficulty Filter Chips */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-md)', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
           {t('scenarios.filterDifficulty')}
        </span>
        {[
          { id: 'all', label: t('scenarios.all') },
          { id: 'easy', label: t('scenarios.easy') },
          { id: 'medium', label: t('scenarios.medium') },
          { id: 'challenging', label: t('scenarios.challenging') },
        ].map((d) => (
          <button
            key={d.id}
            type="button"
            className={`btn-secondary ${filterDifficulty === d.id ? 'btn-primary' : ''}`}
            style={{ padding: '4px 14px', fontSize: '0.85rem', borderRadius: 'var(--radius-full)' }}
            onClick={() => setFilterDifficulty(d.id)}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Scenarios Grid or Localized Empty State Card */}
      {filteredScenarios.length === 0 ? (
        <div
          className="dashboard-card"
          style={{
            padding: 'var(--space-xl) var(--space-md)',
            textAlign: 'center',
            borderRadius: 'var(--radius-lg)',
            marginTop: 'var(--space-md)',
            background: 'var(--bg-secondary)',
            border: '1.5px dashed var(--border-color)',
          }}
        >
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 'var(--space-xs)' }}></span>
          <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-xs)', color: 'var(--text-primary)' }}>
            {t('scenarios.noAvailable')}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 'var(--space-md)' }}>
            {t('scenarios.noAvailableSub')}
          </p>
          <button
            type="button"
            className="btn-primary"
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
            onClick={() => setFilterDifficulty('all')}
          >
            {t('scenarios.viewAll')} ➔
          </button>
        </div>
      ) : (
        <div
          className="activities-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--space-md)',
            marginTop: 'var(--space-sm)',
          }}
        >
          {filteredScenarios.map((scen) => (
            <div
              key={scen.id}
              className="dashboard-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xs)' }}>
                  <span className="module-icon-wrap" style={{ width: '2.75rem', height: '2.75rem', fontSize: '1.25rem', marginBottom: 0 }}>

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
                      color:
                        scen.difficulty === 'challenging'
                          ? '#e53e3e'
                          : scen.difficulty === 'medium'
                          ? '#dd6b20'
                          : '#38a169',
                    }}
                  >
                    {getDifficultyLabel(scen.difficulty)}
                  </span>
                </div>

                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: 'var(--space-xs)', fontWeight: '600' }}>
                  {scen.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--space-sm)', lineHeight: '1.5' }}>
                  {scen.description}
                </p>

                <div
                  style={{
                    fontSize: '0.85rem',
                    marginBottom: 'var(--space-sm)',
                    color: 'var(--text-primary)',
                    background: 'var(--bg-primary)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>{t('scenarios.role')}:</span>{' '}
                  <strong>{getRoleLabel(scen.aiRole)}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-xs)', marginTop: 'var(--space-xs)' }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1, padding: '0.6rem 0.8rem', fontSize: '0.9rem' }}
                  onClick={() => handleStart(scen.id, 'text')}
                >
                   {t('scenarios.startText')}
                </button>
                <button
                  className="btn-secondary"
                  style={{ flex: 1, padding: '0.6rem 0.8rem', fontSize: '0.9rem' }}
                  onClick={() => handleStart(scen.id, 'voice')}
                >
                   {t('scenarios.startVoice')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
