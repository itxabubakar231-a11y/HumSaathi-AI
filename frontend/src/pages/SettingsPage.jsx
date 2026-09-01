import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { PERSONAS, LANGUAGES, DEFAULT_SENSORY } from '../utils/preferences';
import SensoryPanel from '../components/ui/SensoryPanel';
import { CheckIcon } from '../components/ui/Icons';

export default function SettingsPage() {
  const { user, setupUser, updateSensory, updateLanguage, selectPersona } = useUser();
  const { t } = useI18n();
  const [persona, setPersona] = useState(user?.persona || 'child');
  const [language, setLanguage] = useState(user?.language || 'en');
  const [sensoryPrefs, setSensoryPrefs] = useState(user?.sensoryPrefs || DEFAULT_SENSORY);
  const [saved, setSaved] = useState(false);

  const handlePersonaSelect = async (pId) => {
    setPersona(pId);
    if (user) await selectPersona(pId);
  };

  const handleLanguageSelect = async (langId) => {
    setLanguage(langId);
    await updateLanguage(langId);
  };

  const handleSensoryChange = async (patch) => {
    const next = { ...sensoryPrefs, ...patch };
    setSensoryPrefs(next);
    await updateSensory(next);
  };

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

  return (
    <div className="settings" style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--space-md) var(--space-sm)' }}>
      <p className="eyebrow">{t('nav.settings')}</p>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', marginBottom: '1.5rem' }}>{t('settings.title')}</h1>

      <section className="preference-section dashboard-card" style={{ padding: '1.5rem', marginBottom: '1.25rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
        <div className="section-heading" style={{ marginBottom: '1rem' }}>
          <p className="section-kicker" style={{ fontSize: '0.8rem', color: 'var(--primary-green)', fontWeight: 700 }}>{t('setup.personaKicker')}</p>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t('setup.personaTitle')}</h2>
        </div>
        <div className="persona-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {PERSONAS.map((p) => (
            <button
              className={`persona-card ${persona === p.id ? 'is-selected' : ''}`}
              key={p.id}
              type="button"
              onClick={() => handlePersonaSelect(p.id)}
              aria-pressed={persona === p.id}
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: persona === p.id ? '2px solid var(--primary-green)' : '1px solid var(--border-color)',
                background: persona === p.id ? 'var(--light-green-surface)' : 'var(--bg-tertiary)',
                cursor: 'pointer',
                fontWeight: 600,
                color: 'var(--text-primary)',
                textAlign: 'center',
              }}
            >
              <span className="persona-label">{t(p.labelKey)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="language-section dashboard-card" style={{ padding: '1.5rem', marginBottom: '1.25rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
        <div className="section-heading" style={{ marginBottom: '1rem' }}>
          <p className="section-kicker" style={{ fontSize: '0.8rem', color: 'var(--primary-green)', fontWeight: 700 }}>{t('setup.languageKicker')}</p>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t('setup.languageTitle')}</h2>
        </div>
        <div className="lang-pills-grid" role="group" aria-label={t('setup.languageTitle')} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
          {LANGUAGES.map((lang) => (
            <button
              className={`lang-pill-btn ${language === lang.id ? 'is-selected' : ''}`}
              key={lang.id}
              type="button"
              onClick={() => handleLanguageSelect(lang.id)}
              aria-pressed={language === lang.id}
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: language === lang.id ? '2px solid var(--primary-green)' : '1px solid var(--border-color)',
                background: language === lang.id ? 'var(--light-green-surface)' : 'var(--bg-tertiary)',
                cursor: 'pointer',
                fontWeight: 600,
                color: 'var(--text-primary)',
                textAlign: 'center',
              }}
            >
              <span className="lang-name">{t(lang.labelKey)}</span>
            </button>
          ))}
        </div>
      </section>

      <SensoryPanel prefs={sensoryPrefs} onChange={handleSensoryChange} t={t} />

      <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn-primary" type="button" onClick={saveSettings} style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}>
          Save Preferences
        </button>
        {saved && (
          <span className="saved-note" style={{ color: 'var(--primary-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckIcon size={16} /> {t('settings.saved')}
          </span>
        )}
      </div>
    </div>
  );
}
