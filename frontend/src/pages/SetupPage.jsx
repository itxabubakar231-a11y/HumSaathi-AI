import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { PERSONAS, LANGUAGES, DEFAULT_SENSORY } from '../utils/preferences';
import SensoryPanel from '../components/ui/SensoryPanel';

export default function SetupPage() {
  const { user, setupUser } = useUser();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [persona, setPersona] = useState(user?.persona || 'child');
  const [language, setLanguage] = useState(user?.language || 'en');
  const [sensoryPrefs, setSensoryPrefs] = useState(user?.sensoryPrefs || DEFAULT_SENSORY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSensoryChange = (patch) => {
    setSensoryPrefs((prev) => ({ ...prev, ...patch }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      await setupUser({ name: name.trim(), persona, language, sensoryPrefs });
      navigate('/assessment');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings">
      <p className="eyebrow">{t('setup.eyebrow')}</p>
      <h1>{t('setup.title')}</h1>
      <p className="intro">{t('setup.intro')}</p>

      <form onSubmit={handleSubmit}>
        <label className="form-field">
          <span>{t('setup.nameLabel')}</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('setup.namePlaceholder')}
            required
          />
        </label>

        <section className="preference-section" aria-labelledby="persona-heading">
          <div className="section-heading">
            <div>
              <p className="section-kicker">{t('setup.personaKicker')}</p>
              <h2 id="persona-heading">{t('setup.personaTitle')}</h2>
            </div>
          </div>
          <div className="persona-grid">
            {PERSONAS.map((p) => (
              <button
                className={`persona-card ${persona === p.id ? 'is-selected' : ''}`}
                key={p.id}
                type="button"
                onClick={() => setPersona(p.id)}
                aria-pressed={persona === p.id}
              >
                <span className="persona-icon" aria-hidden="true">{t(p.labelKey)[0]}</span>
                <span className="persona-label">{t(p.labelKey)}</span>
                <span className="persona-detail">{t(p.detailKey)}</span>
                <span className="selection-mark" aria-hidden="true">{persona === p.id ? '✓' : '+'}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="language-section" aria-labelledby="language-heading">
          <div className="section-heading">
            <div>
              <p className="section-kicker">{t('setup.languageKicker')}</p>
              <h2 id="language-heading">{t('setup.languageTitle')}</h2>
            </div>
          </div>
          <div className="lang-pills-grid" role="group" aria-label={t('setup.languageTitle')}>
            {LANGUAGES.map((lang) => (
              <button
                className={`lang-pill-btn ${language === lang.id ? 'is-selected' : ''}`}
                key={lang.id}
                type="button"
                onClick={() => setLanguage(lang.id)}
                aria-pressed={language === lang.id}
              >
                <span className="lang-flag">{lang.id === 'en' ? '🇬🇧' : '🇵🇰'}</span>
                <span className="lang-name">{t(lang.labelKey)}</span>
              </button>
            ))}
          </div>
        </section>

        <SensoryPanel prefs={sensoryPrefs} onChange={handleSensoryChange} t={t} />

        {error && <p className="error-text" role="alert">{error}</p>}

        <button className="btn-primary" type="submit" disabled={saving}>
          {saving ? t('common.loading') : t('setup.continue')}
        </button>
      </form>
    </div>
  );
}
