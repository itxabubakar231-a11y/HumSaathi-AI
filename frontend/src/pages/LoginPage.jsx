import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';

export default function LoginPage() {
  const { loginUser } = useUser();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      await loginUser({ email: trimmedEmail, password });
      navigate('/persona-selection');
    } catch (err) {
      setError(err.message || t('common.error') || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-layout">
      {/* Left Branding Panel */}
      <div className="auth-hero-panel">
        <div className="auth-hero-glow" aria-hidden="true" />
        <div className="auth-hero-content">
          <div className="auth-brand-logo">
            <span className="logo-icon">H</span>
            <span className="logo-text">HumSaathi AI</span>
          </div>

          <h1 className="auth-hero-title">
            Practice. Communicate.
            <br />
            <span className="hero-accent">Grow with Confidence.</span>
          </h1>

          <p className="auth-hero-desc">
            An adaptive AI communication companion tailored for child, teen, and adult learners.
          </p>

          <div className="auth-hero-features">
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <div>
                <strong>Private & Protected</strong>
                <p>Isolated learning history & secure profile</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <div>
                <strong>Personalized Coaching</strong>
                <p>Adaptive scenarios & real-time feedback</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🗣️</span>
              <div>
                <strong>Voice & Text Practice</strong>
                <p>Interactive speech recognition & synthesis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-card-title">Welcome Back</h2>
            <p className="auth-card-subtitle">Log in with your private email and password</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form" noValidate>
            {/* Email Address */}
            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="login-email">
                Email Address
              </label>
              <div className="auth-input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  id="login-email"
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
                <label className="auth-field-label" htmlFor="login-password">
                  Password
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
                  id="login-password"
                  className="auth-text-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="error-banner" role="alert" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
                ⚠️ {error}
              </div>
            )}

            <button
              className="auth-primary-btn"
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.85rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? t('common.loading') : 'Log In ➔'}
            </button>

            <div className="auth-card-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/signup" className="auth-link">
                  Create an account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
