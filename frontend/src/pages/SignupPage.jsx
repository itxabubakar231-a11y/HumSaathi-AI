import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { LANGUAGES, DEFAULT_SENSORY } from '../utils/preferences';
import SensoryPanel from '../components/ui/SensoryPanel';

export default function SignupPage() {
  const { signupUser } = useUser();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState('en');
  const [sensoryPrefs, setSensoryPrefs] = useState(DEFAULT_SENSORY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Password strength calculator
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'transparent' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Weak (min 6 characters)', color: '#ef4444' };
      case 2:
        return { score: 50, label: 'Fair', color: '#f59e0b' };
      case 3:
        return { score: 75, label: 'Good', color: '#3b82f6' };
      case 4:
        return { score: 100, label: 'Strong', color: '#10b981' };
      default:
        return { score: 10, label: 'Too Short', color: '#ef4444' };
    }
  }, [password]);

  const handleSensoryChange = (patch) => {
    setSensoryPrefs((prev) => ({ ...prev, ...patch }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please check and try again.');
      return;
    }

    setSaving(true);

    try {
      await signupUser({
        name: trimmedName,
        email: trimmedEmail,
        password,
        persona: 'child', // default initial, user confirms in persona selection next
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
            Create your private account to experience tailored communication practice, adaptive scenarios, and sensory-friendly settings.
          </p>

          <div className="auth-hero-features">
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <div>
                <strong>Private & Secure Account</strong>
                <p>Your profile and learning data stay protected</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🌐</span>
              <div>
                <strong>Multilingual Practice</strong>
                <p>English, Urdu & Roman Urdu support</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚙️</span>
              <div>
                <strong>Sensory Accessibility</strong>
                <p>Text scaling, high contrast & calm modes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-card-title">Create Your Account</h2>
            <p className="auth-card-subtitle">Set up your secure credentials and personalized preferences</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Full Name */}
            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="signup-name">
                Full Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="auth-input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="signup-name"
                  className="auth-text-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Zain Malik"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="signup-email">
                Email Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="auth-input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  id="signup-email"
                  className="auth-text-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="auth-field-label" htmlFor="signup-password">
                  Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    padding: 0,
                  }}
                >
                  {showPassword ? '🙈 Hide' : '👁️ Show'}
                </button>
              </div>
              <div className="auth-input-wrapper">
                <span className="input-icon">🔑</span>
                <input
                  id="signup-password"
                  className="auth-text-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  required
                />
              </div>
              {/* Password Strength Indicator */}
              {password && (
                <div style={{ marginTop: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem', color: passwordStrength.color }}>
                    <span>Strength:</span>
                    <strong>{passwordStrength.label}</strong>
                  </div>
                  <div style={{ height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${passwordStrength.score}%`,
                        background: passwordStrength.color,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="signup-confirm-password">
                Confirm Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="auth-input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="signup-confirm-password"
                  className="auth-text-input"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {/* Preferred Language */}
            <div className="auth-field-group">
              <label className="auth-field-label">{t('setup.languageTitle') || 'Preferred Language'}</label>
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

            {/* Sensory Settings */}
            <div className="auth-sensory-section">
              <SensoryPanel prefs={sensoryPrefs} onChange={handleSensoryChange} t={t} />
            </div>

            {error && (
              <div className="error-banner" role="alert" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
                ⚠️ {error}
              </div>
            )}

            {/* Standard Accessible Submit Button (No decorative motion buttons) */}
            <button
              className="auth-primary-btn"
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                padding: '0.85rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? t('common.loading') : 'Create Account & Choose Persona ➔'}
            </button>

            <div className="auth-card-footer">
              <p>
                Already have an account?{' '}
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
