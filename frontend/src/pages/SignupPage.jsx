import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { DEFAULT_SENSORY } from '../utils/preferences';
import GoogleSignInButton from '../components/ui/GoogleSignInButton';
import { UserIcon, MailIcon, KeyIcon, LockIcon, EyeIcon, EyeOffIcon, ShieldIcon, SparklesIcon, CheckIcon } from '../components/ui/Icons';

export default function SignupPage() {
  const { signupUser, loginWithGoogle } = useUser();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
        persona: 'child', // default initial, user chooses in persona selection next
        language: 'en',
        sensoryPrefs: DEFAULT_SENSORY,
      });
      navigate('/persona-selection');
    } catch (err) {
      setError(err.message || t('common.error') || 'Failed to create account.');
    } finally {
      setSaving(false);
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
      setError(err.message || 'Google signup failed. Please try again or use standard registration.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = (err) => {
    setError(err.message || 'Unable to connect to Google authentication.');
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
            Start your
            <br />
            <span className="hero-accent">learning journey.</span>
          </h1>

          <p className="auth-hero-desc">
            Create your private account to experience tailored communication practice, adaptive scenarios, and supportive feedback.
          </p>

          <div className="auth-hero-features">
            <div className="feature-item">
              <span className="feature-icon-svg">
                <ShieldIcon size={20} />
              </span>
              <div>
                <strong>Private & Secure Account</strong>
                <p>Your profile and practice data stay completely protected</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon-svg">
                <SparklesIcon size={20} />
              </span>
              <div>
                <strong>Three Distinct Portals</strong>
                <p>Tailored experiences for Child, Teen, and Adult learners</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon-svg">
                <CheckIcon size={20} />
              </span>
              <div>
                <strong>Multilingual Coaching</strong>
                <p>English, Urdu, and Roman Urdu conversation support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-card-title">Create Account</h2>
            <p className="auth-card-subtitle">Set up your credentials to begin practicing</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Full Name */}
            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="signup-name">
                Full Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="auth-input-wrapper">
                <span className="input-icon-svg" aria-hidden="true">
                  <UserIcon size={18} />
                </span>
                <input
                  id="signup-name"
                  className="auth-text-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Zain Malik"
                  autoComplete="name"
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
                <span className="input-icon-svg" aria-hidden="true">
                  <MailIcon size={18} />
                </span>
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
              <div className="auth-label-row">
                <label className="auth-field-label" htmlFor="signup-password">
                  Password <span style={{ color: '#ef4444' }}>*</span>
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
                <span className="input-icon-svg" aria-hidden="true">
                  <LockIcon size={18} />
                </span>
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

            {error && (
              <div className="error-banner" role="alert">
                <span>{error}</span>
              </div>
            )}

            {/* Create Account Primary Button */}
            <button
              className="auth-primary-btn"
              type="submit"
              disabled={saving || googleLoading}
            >
              {saving ? t('common.loading') : 'Create Account'}
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
              disabled={saving || googleLoading}
            />

            <div className="auth-card-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
