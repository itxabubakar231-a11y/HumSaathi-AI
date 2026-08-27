import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';

export default function LoginPage() {
  const { loginUser } = useUser();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getProfiles()
      .then((data) => setProfiles(data.users || []))
      .catch(() => setProfiles([]));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');

    try {
      await loginUser({ name: name.trim() });
      navigate('/persona-selection');
    } catch (err) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfile = async (profile) => {
    setLoading(true);
    setError('');
    try {
      await loginUser({ userId: profile.id });
      navigate('/persona-selection');
    } catch (err) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const getPersonaEmoji = (persona) => {
    switch (persona) {
      case 'child': return '🧒';
      case 'teen': return '🧑‍🎓';
      case 'adult': return '👨';
      default: return '👤';
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
            <div className="feature-item">
              <span className="feature-icon">🎭</span>
              <div>
                <strong>3 Distinct Portals</strong>
                <p>Tailored experiences for Child, Teen & Adult</p>
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
            <p className="auth-card-subtitle">Log in to access your personalized learning portal</p>
          </div>

          {/* Quick Profile Selection */}
          {profiles.length > 0 && (
            <div className="quick-profiles-container">
              <p className="quick-profiles-label">Select Recent Profile</p>
              <div className="quick-profiles-grid">
                {profiles.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="profile-chip-btn"
                    onClick={() => handleSelectProfile(p)}
                  >
                    <span className="profile-chip-avatar">{getPersonaEmoji(p.persona)}</span>
                    <div className="profile-chip-info">
                      <strong className="profile-chip-name">{p.name}</strong>
                      <span className="profile-chip-meta">{p.persona || 'learner'} · {(p.language || 'en').toUpperCase()}</span>
                    </div>
                    <span className="profile-chip-arrow">➔</span>
                  </button>
                ))}
              </div>
              <div className="auth-divider"><span>OR LOG IN BY NAME</span></div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="auth-form">
            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="login-name">Learner Name</label>
              <div className="auth-input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="login-name"
                  className="auth-text-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your registered name..."
                  required
                />
              </div>
            </div>

            {error && <p className="error-banner">⚠️ {error}</p>}

            <button className="auth-primary-btn" type="submit" disabled={loading || !name.trim()}>
              {loading ? t('common.loading') : 'Log In & Continue 🚀'}
            </button>

            <div className="auth-card-footer">
              <p>
                Don't have a profile yet?{' '}
                <Link to="/signup" className="auth-link">
                  Create a new profile
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
