import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';

export default function LandingPage() {
  const { user } = useUser();
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* Soft atmospheric background glow */}
      <div className="landing-bg-glow" aria-hidden="true" />

      <div className="landing-content">
        {/* Welcome Eyebrow */}
        <p className="eyebrow">{t('landing.eyebrow')}</p>

        {/* Large Elegant Headline */}
        <h1>
          {t('landing.title')}
          <br />
          <span className="title-accent">{t('landing.titleAccent')}</span>
        </h1>

        {/* Sub-tagline */}
        <p className="landing-tagline">PRACTICE. COMMUNICATE. GROW.</p>

        {/* Intro */}
        <p className="intro">{t('landing.intro')}</p>

        {/* Action Buttons */}
        <div className="landing-actions">
          {user?.setupComplete ? (
            <>
              <button className="btn-primary" type="button" onClick={() => navigate('/dashboard')}>
                {t('landing.continue')} ➔
              </button>
              <button className="btn-secondary" type="button" onClick={() => navigate('/persona-selection')}>
                Switch Practice Persona 🎭
              </button>
            </>
          ) : (
            <>
              <Link className="btn-primary" to="/signup">{t('landing.getStarted')} 🚀</Link>
              <Link className="btn-secondary" to="/login">Log In to Profile 👤</Link>
            </>
          )}
        </div>

        {/* Feature Pills */}
        <div className="landing-features">
          <div className="landing-feature-pill">🎯 AI-Powered Coaching</div>
          <div className="landing-feature-pill">🗣️ Voice & Text Practice</div>
          <div className="landing-feature-pill">📊 Progress Tracking</div>
          <div className="landing-feature-pill">🌍 Multilingual Support</div>
        </div>

        {/* Bottom Disclaimer */}
        <p className="disclaimer">{t('app.disclaimer')}</p>
      </div>
    </div>
  );
}
