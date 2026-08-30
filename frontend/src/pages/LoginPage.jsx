import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';

export default function LoginPage() {
  const { loginUser, setUser } = useUser();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initial Admin Provisioning Modal state
  const [hasAdmin, setHasAdmin] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [adminName, setAdminName] = useState('Administrator');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState('');

  useEffect(() => {
    api.adminCheckExists()
      .then((res) => {
        if (res && res.hasAdmin === false) {
          setHasAdmin(false);
        }
      })
      .catch(() => {});
  }, []);

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
      const loggedUser = await loginUser({ email: trimmedEmail, password });
      if (loggedUser?.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/persona-selection');
      }
    } catch (err) {
      setError(err.message || t('common.error') || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleInitialAdminSetup = async (e) => {
    e.preventDefault();
    setSetupError('');

    const trimmed = adminEmail.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setSetupError('Please enter a valid admin email address.');
      return;
    }
    if (!adminPassword || adminPassword.length < 6) {
      setSetupError('Admin password must be at least 6 characters.');
      return;
    }

    setSetupLoading(true);
    try {
      const res = await api.adminSetupInitial({
        name: adminName.trim() || 'Administrator',
        email: trimmed,
        password: adminPassword,
      });
      if (res?.token) {
        localStorage.setItem('humsaathi_auth_token', res.token);
      }
      if (res?.user) {
        setUser(res.user);
      }
      setShowSetupModal(false);
      navigate('/admin/dashboard');
    } catch (err) {
      setSetupError(err.message || 'Failed to initialize administrator account.');
    } finally {
      setSetupLoading(false);
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

          {!hasAdmin && (
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                fontSize: '0.88rem',
                color: '#1e40af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong>🛡️ First-Time Admin Setup</strong>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#3b82f6' }}>
                  No admin exists in this database yet.
                </p>
              </div>
              <button
                type="button"
                className="admin-btn-primary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                onClick={() => setShowSetupModal(true)}
              >
                Setup Admin ➔
              </button>
            </div>
          )}

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

      {/* Initial Admin Setup Modal */}
      {showSetupModal && (
        <div className="admin-modal-overlay" onClick={() => setShowSetupModal(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🛡️ Set Up Master Administrator</h2>
              <button className="modal-close-btn" onClick={() => setShowSetupModal(false)}>✕</button>
            </div>
            <form onSubmit={handleInitialAdminSetup}>
              <div className="modal-body">
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Create the master administrator credentials for this deployment. Once created, initial setup is permanently locked.
                </p>

                <div className="auth-field-group" style={{ marginBottom: '1rem' }}>
                  <label className="detail-label">Admin Full Name</label>
                  <input
                    type="text"
                    className="admin-search-input"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-field-group" style={{ marginBottom: '1rem' }}>
                  <label className="detail-label">Admin Email Address</label>
                  <input
                    type="email"
                    className="admin-search-input"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="e.g. admin@humsaathi.ai"
                    required
                  />
                </div>

                <div className="auth-field-group">
                  <label className="detail-label">Admin Password (min 6 characters)</label>
                  <input
                    type="password"
                    className="admin-search-input"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter secure master password"
                    required
                  />
                </div>

                {setupError && (
                  <div className="error-banner" style={{ marginTop: '1rem', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                    ⚠️ {setupError}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowSetupModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary" disabled={setupLoading}>
                  {setupLoading ? 'Creating Admin...' : 'Create Admin & Log In ➔'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
