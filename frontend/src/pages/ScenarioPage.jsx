import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCat = searchParams.get('category') || 'all';
  const [filterCategory, setFilterCategory] = useState(initialCat);
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          category: scen.category || 'general',
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

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'workplace':
        return language === 'ur' ? 'دفتری مواصلات' : language === 'ur_rm' ? 'Workplace Comm' : 'Workplace Communication';
      case 'everyday':
        return language === 'ur' ? 'روزمرہ گفتگو' : language === 'ur_rm' ? 'Everyday Comm' : 'Everyday Communication';
      case 'peer_school':
        return language === 'ur' ? 'اسکول اور ساتھی' : language === 'ur_rm' ? 'Peer & School' : 'Peer & School';
      case 'problem_solving':
        return language === 'ur' ? 'عملی مسائل کا حل' : language === 'ur_rm' ? 'Problem Solving' : 'Practical Problem Solving';
      default:
        return language === 'ur' ? 'عمومی گفتگو' : 'General Practice';
    }
  };

  const categoryFilters = [
    { id: 'all', label: language === 'ur' ? 'تمام زمرے' : 'All Scenarios', icon: '🌟' },
    { id: 'workplace', label: language === 'ur' ? 'دفتری مواصلات' : 'Workplace Communication', icon: '💼' },
    { id: 'everyday', label: language === 'ur' ? 'روزمرہ گفتگو' : 'Everyday Communication', icon: '🗣️' },
    { id: 'peer_school', label: language === 'ur' ? 'اسکول اور ساتھی' : 'Peer & School', icon: '🏫' },
    { id: 'problem_solving', label: language === 'ur' ? 'عملی مسائل کا حل' : 'Problem Solving', icon: '🧩' },
  ];

  const handleSelectCategory = (catId) => {
    setFilterCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: catId });
    }
  };

  const filteredScenarios = (scenarios || []).filter((scen) => {
    if (!scen) return false;
    if (filterDifficulty !== 'all' && scen.difficulty !== filterDifficulty) return false;
    if (filterCategory !== 'all' && scen.category !== filterCategory) return false;
    return true;
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
    <div className="scenarios-page" dir={isRtl ? 'rtl' : 'ltr'} style={{ maxWidth: '1080px', margin: '0 auto', padding: 'var(--space-md) var(--space-sm)' }}>
      {/* Top Header */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <p className="eyebrow" style={{ color: 'var(--primary-green)', fontWeight: 800 }}>
          {t('nav.scenarios') || 'Communication Practice'}
        </p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.3rem', fontWeight: '700', color: 'var(--text-primary)' }}>
          {t('scenarios.title') || 'Interactive Communication Scenarios'}
        </h1>
        <p className="intro" style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', fontSize: '1.02rem', lineHeight: '1.6' }}>
          {language === 'ur'
            ? 'حقیقی دنیا کے دفتری، سماجی اور روزمرہ حالات میں باوقار اور پرسکون گفتگو کی مشق کریں۔'
            : 'Practice realistic workplace, school, and everyday social conversations in a calm, judgment-free space with voice or text.'}
        </p>
      </div>

      {/* Category Pills Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {categoryFilters.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={filterCategory === cat.id ? 'btn-primary' : 'btn-secondary'}
            style={{
              padding: '6px 14px',
              fontSize: '0.88rem',
              borderRadius: '9999px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onClick={() => handleSelectCategory(cat.id)}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Difficulty Filter Chips */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-md)', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {t('scenarios.filterDifficulty') || 'Difficulty'}:
        </span>
        {[
          { id: 'all', label: t('scenarios.all') || 'All Levels' },
          { id: 'easy', label: t('scenarios.easy') || 'Easy' },
          { id: 'medium', label: t('scenarios.medium') || 'Medium' },
          { id: 'challenging', label: t('scenarios.challenging') || 'Challenging' },
        ].map((d) => (
          <button
            key={d.id}
            type="button"
            className={`btn-secondary ${filterDifficulty === d.id ? 'btn-primary' : ''}`}
            style={{ padding: '3px 12px', fontSize: '0.82rem', borderRadius: 'var(--radius-full)' }}
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
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 'var(--space-xs)' }}>🔍</span>
          <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-xs)', color: 'var(--text-primary)' }}>
            {t('scenarios.noAvailable') || 'No scenarios found for this filter'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 'var(--space-md)' }}>
            {t('scenarios.noAvailableSub') || 'Try switching categories or setting difficulty to All.'}
          </p>
          <button
            type="button"
            className="btn-primary"
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
            onClick={() => {
              setFilterDifficulty('all');
              handleSelectCategory('all');
            }}
          >
            {t('scenarios.viewAll') || 'Reset Filters'} ➔
          </button>
        </div>
      ) : (
        <div
          className="activities-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
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
                padding: '1.4rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: '#4f46e5',
                    }}
                  >
                    {getCategoryLabel(scen.category)}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: '2px 8px',
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

                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '0.45rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {scen.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.9rem', lineHeight: '1.55' }}>
                  {scen.description}
                </p>

                <div
                  style={{
                    fontSize: '0.85rem',
                    marginBottom: '1rem',
                    color: 'var(--text-primary)',
                    background: 'var(--bg-primary)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>{t('scenarios.role') || 'AI Role'}:</span>{' '}
                  <strong>{getRoleLabel(scen.aiRole)}</strong>
                </div>
              </div>

              {/* Action Buttons: Text and Voice Roleplay */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1, padding: '0.65rem 0.8rem', fontSize: '0.9rem', fontWeight: 600 }}
                  onClick={() => handleStart(scen.id, 'text')}
                >
                  💬 {t('scenarios.startText') || 'Text Roleplay'}
                </button>
                <button
                  className="btn-secondary"
                  style={{ flex: 1, padding: '0.65rem 0.8rem', fontSize: '0.9rem', fontWeight: 600 }}
                  onClick={() => handleStart(scen.id, 'voice')}
                >
                  🎙️ {t('scenarios.startVoice') || 'Voice Call'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
