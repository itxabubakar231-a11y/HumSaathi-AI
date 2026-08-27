import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { PERSONAS, LANGUAGES, DEFAULT_SENSORY } from '../utils/preferences';
import SensoryPanel from '../components/ui/SensoryPanel';

export default function SettingsPage() {
  const { user, setupUser, updateSensory } = useUser();
  const { t } = useI18n();
  const [persona, setPersona] = useState(user?.persona || 'child');
  const [language, setLanguage] = useState(user?.language || 'en');
  const [sensoryPrefs, setSensoryPrefs] = useState(user?.sensoryPrefs || DEFAULT_SENSORY);
  const [saved, setSaved] = useState(false);

  const saveSettings = async () => {
    if (!user) return;
    await setupUser({
      name: user.name,
      persona,
      language,
      sensoryPrefs,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSensoryChange = async (patch) => {
    const next = { ...sensoryPrefs, ...patch };
    setSensoryPrefs(next);
    if (user) await updateSensory(next);
  };

  return (
    <div className="settings">
      <p className="eyebrow">{t('nav.settings')}</p>
      <h1>{t('settings.title')}</h1>

      <section className="preference-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">{t('setup.personaKicker')}</p>
            <h2>{t('setup.personaTitle')}</h2>
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
              <span className="persona-label">{t(p.labelKey)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="language-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">{t('setup.languageKicker')}</p>
            <h2>{t('setup.languageTitle')}</h2>
          </div>
        </div>
        <div className="language-options">
          {LANGUAGES.map((lang) => (
            <button
              className={`language-option ${language === lang.id ? 'is-selected' : ''}`}
              key={lang.id}
              type="button"
              onClick={() => setLanguage(lang.id)}
              aria-pressed={language === lang.id}
            >
              {t(lang.labelKey)}
            </button>
          ))}
        </div>
      </section>

      <SensoryPanel prefs={sensoryPrefs} onChange={handleSensoryChange} t={t} />

      <button className="btn-primary" type="button" onClick={saveSettings}>
        {t('settings.title')}
      </button>
      {saved && <p className="saved-note">{t('settings.saved')}</p>}
    </div>
  );
}
