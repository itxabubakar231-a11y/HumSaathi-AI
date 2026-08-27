import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { LANGUAGES, DEFAULT_SENSORY } from '../utils/preferences';
import SensoryPanel from '../components/ui/SensoryPanel';

export default function SignupPage() {
  const { setupUser } = useUser();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [language, setLanguage] = useState('en');
  const [sensoryPrefs, setSensoryPrefs] = useState(DEFAULT_SENSORY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSensoryChange = (patch) => {
    setSensoryPrefs((prev) => ({ ...prev, ...patch }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError('');

    try {
      await setupUser({
        name: name.trim(),
        persona: 'child', // Default persona, user chooses on persona selection screen next!
        language,
        sensoryPrefs,
      });
      navigate('/persona-selection');
    } catch (err) {
      setError(err.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="auth-split-layout">
      {/* Left Hero Panel */}
      <div className="auth-hero-panel">
        <div className="auth-hero-glow" aria-hidden="true" />
        <div className="auth-hero-content">
          <div className="auth-brand-logo">
            <span className="logo-icon">H</span>
            <span className="logo-text">HumSaathi AI</span>
          </div>

          <h1 className="auth-hero-title">
            Start Your
            <br />
            <span className="hero-accent">Learning Journey.</span>
          </h1>

          <p className="auth-hero-desc">
            Create your profile to experience communication practice, adaptive scenarios, and sensory-friendly settings.
          </p>

          <div className="auth-hero-features">
            <div className="feature-item">
              <span className="feature-icon">🌐</span>
              <div>
                <strong>Multilingual Practice</strong>
                <p>Support for English, Urdu & Roman Urdu</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚙️</span>
              <div>
                <strong>Sensory Accessibility</strong>
                <p>Text scale, contrast & calm modes</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🛡️</span>
              <div>
                <strong>Safe & Supportive</strong>
                <p>Calm, non-judgmental educational feedback</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-card-title">Create Profile</h2>
            <p className="auth-card-subtitle">Set up your name, preferred language, and sensory choices</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Learner Name */}
            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="signup-name">{t('setup.nameLabel')}</label>
              <div className="auth-input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="signup-name"
                  className="auth-text-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('setup.namePlaceholder')}
                  required
                />
              </div>
            </div>

            {/* Language Selection */}
            <div className="auth-field-group">
              <label className="auth-field-label">{t('setup.languageTitle')}</label>
              <div className="lang-pills-grid" role="group">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    className={`lang-pill-btn ${language === lang.id ? 'is-selected' : ''}`}
                    onClick={() => setLanguage(lang.id)}
                    aria-pressed={language === lang.id}
                  >
                    <span className="lang-flag">{lang.id === 'en' ? '🇬🇧' : '🇵🇰'}</span>
                    <span className="lang-name">{t(lang.labelKey)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sensory Controls */}
            <div className="auth-sensory-section">
              <SensoryPanel prefs={sensoryPrefs} onChange={handleSensoryChange} t={t} />
            </div>

            {error && <p className="error-banner">⚠️ {error}</p>}

            <button className="auth-primary-btn" type="submit" disabled={saving || !name.trim()}>
              {saving ? t('common.loading') : 'Create Profile & Choose Persona ➔'}
            </button>

            <div className="auth-card-footer">
              <p>
                Already have a profile?{' '}
                <Link to="/login" className="auth-link">
                  Log in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
