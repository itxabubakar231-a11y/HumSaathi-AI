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
        <p className="eyebrow">{t('landing.eyebrow') || 'AI-POWERED ACCESSIBLE COMMUNICATION'}</p>

        {/* Large Elegant Headline */}
        <h1>
          {t('landing.title')}
          <br />
          <span className="title-accent">{t('landing.titleAccent')}</span>
        </h1>

        {/* Sub-tagline */}
        <p className="landing-tagline">SAFE PRACTICE · ADAPTIVE AI · REAL-WORLD CONFIDENCE</p>

        {/* Intro */}
        <p className="intro">
          HumSaathi AI helps neurodiverse learners practice real-world communication in a safe, supportive environment. Adapting across Child, Teen, and Adult portals with interactive text, natural voice mode, and personalized feedback.
        </p>

        {/* Action Buttons */}
        <div className="landing-actions">
          {user?.id ? (
            <>
              <button className="btn-primary" type="button" onClick={() => navigate('/dashboard')}>
                {t('landing.continue') || 'Continue Learning'} ➔
              </button>
              <button className="btn-secondary" type="button" onClick={() => navigate('/persona-selection')}>
                Switch Persona 🎭
              </button>
            </>
          ) : (
            <>
              <Link className="btn-primary" to="/signup">{t('landing.getStarted')} 🚀</Link>
              <Link className="btn-secondary" to="/login">Log In to Profile 👤</Link>
            </>
          )}
        </div>

        {/* 3 Distinct Persona Preview Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            width: '100%',
            maxWidth: '820px',
            marginTop: '2rem',
            marginBottom: '1.5rem',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              padding: '1.2rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🧒</div>
            <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
              Child Portal
            </strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
              Guided foundational games, letters, numbers, emotions & star rewards.
            </p>
          </div>

          <div
            style={{
              padding: '1.2rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🧑‍🎓</div>
            <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
              Teen Portal
            </strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
              Peer discussions, school projects & practical problem-solving.
            </p>
          </div>

          <div
            style={{
              padding: '1.2rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>💼</div>
            <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
              Adult Portal
            </strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
              Workplace dialogues, manager task clarification & daily living skills.
            </p>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="landing-features">
          <div className="landing-feature-pill">🎯 Contextual AI Role-Play</div>
          <div className="landing-feature-pill">🗣️ Voice & Text Practice</div>
          <div className="landing-feature-pill">📊 Persona-Calibrated Feedback</div>
          <div className="landing-feature-pill">🌍 English, Urdu (اردو) & Roman Urdu</div>
        </div>

        {/* Bottom Disclaimer */}
        <p className="disclaimer">{t('app.disclaimer')}</p>
      </div>
    </div>
  );
}
