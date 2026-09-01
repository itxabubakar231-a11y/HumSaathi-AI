import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';
import GoogleSignInButton from '../components/ui/GoogleSignInButton';
import { MailIcon, KeyIcon, EyeIcon, EyeOffIcon, ShieldIcon, SparklesIcon, CheckIcon } from '../components/ui/Icons';

export default function LoginPage() {
  const { loginUser, loginWithGoogle, setUser } = useUser();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
      } else if (!loggedUser?.persona) {
        navigate('/persona-selection');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || t('common.error') || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential) => {
    setError('');
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle(credential);
      const userObj = result?.user;
      if (userObj?.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (result?.isNewUser || !userObj?.persona) {
        navigate('/persona-selection');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Google authentication failed. Please try again or use email login.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = (err) => {
    setError(err.message || 'Unable to connect to Google authentication.');
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
      {/* Left Branding Hero Panel */}
      <div className="auth-hero-panel">
        <div className="auth-hero-glow" aria-hidden="true" />
        <div className="auth-hero-content">
          <div className="auth-brand-logo">
            <span className="brand-mark" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="white"/>
              </svg>
            </span>
            <span className="logo-text">HumSaathi AI</span>
          </div>

          <h1 className="auth-hero-title">
            Practice conversations.
            <br />
            <span className="hero-accent">Grow with confidence.</span>
          </h1>

          <p className="auth-hero-desc">
            An adaptive AI communication companion tailored for child, teen, and adult learners.
          </p>

          <div className="auth-hero-features">
            <div className="feature-item">
              <span className="feature-icon-svg">
                <ShieldIcon size={20} />
              </span>
              <div>
                <strong>Private & Protected</strong>
                <p>Isolated learning history and secure individual profiles</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon-svg">
                <SparklesIcon size={20} />
              </span>
              <div>
                <strong>Personalized Coaching</strong>
                <p>Adaptive conversational scenarios and real-time guidance</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon-svg">
                <CheckIcon size={20} />
              </span>
              <div>
                <strong>Voice & Text Practice</strong>
                <p>Interactive speech recognition, synthesis, and feedback</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-card-title">Sign In</h2>
            <p className="auth-card-subtitle">Log in to access your personalized learning portal</p>
          </div>

          {!hasAdmin && (
            <div className="admin-setup-alert" role="status">
              <div>
                <strong>Administrator Setup Required</strong>
                <p>No admin account exists in this database yet.</p>
              </div>
              <button
                type="button"
                className="admin-btn-primary"
                onClick={() => setShowSetupModal(true)}
              >
                Set Up Admin
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
                <span className="input-icon-svg" aria-hidden="true">
                  <MailIcon size={18} />
                </span>
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
              <div className="auth-label-row">
                <label className="auth-field-label" htmlFor="login-password">
                  Password
                </label>
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <>
                      <EyeOffIcon size={14} /> <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <EyeIcon size={14} /> <span>Show</span>
                    </>
                  )}
                </button>
              </div>
              <div className="auth-input-wrapper">
                <span className="input-icon-svg" aria-hidden="true">
                  <KeyIcon size={18} />
                </span>
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
              <div className="error-banner" role="alert">
                <span>{error}</span>
              </div>
            )}

            {/* Sign In Primary Button */}
            <button
              className="auth-primary-btn"
              type="submit"
              disabled={loading || googleLoading}
            >
              {loading ? t('common.loading') : 'Sign In'}
            </button>

            {/* Divider */}
            <div className="auth-divider" aria-hidden="true">
              <span>or</span>
            </div>

            {/* Real Google OAuth Button */}
            <GoogleSignInButton
              text="Continue with Google"
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              disabled={loading || googleLoading}
            />

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
              <h2>Set Up Master Administrator</h2>
              <button className="modal-close-btn" onClick={() => setShowSetupModal(false)} aria-label="Close modal">✕</button>
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
                  <div className="error-banner" style={{ marginTop: '1rem' }}>
                    <span>{setupError}</span>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowSetupModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary" disabled={setupLoading}>
                  {setupLoading ? 'Creating Admin...' : 'Create Admin & Log In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
