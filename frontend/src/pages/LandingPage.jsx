import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import {
  SparklesIcon,
  ArrowRightIcon,
  ShieldIcon,
  MessageIcon,
  AiIcon,
  CheckIcon,
  UserIcon,
} from '../components/ui/Icons';

export default function LandingPage() {
  const { user } = useUser();
  const { t, language } = useI18n();
  const navigate = useNavigate();

  const isRtl = language === 'ur';

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Soft atmospheric background glow */}
      <div className="landing-bg-glow" aria-hidden="true" />

      <div className="landing-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-md) var(--space-sm)' }}>
        {/* Hero Split Layout */}
        <div className="landing-hero-container">
          {/* Left Column: Headline & Action CTAs */}
          <div className="landing-hero-text">
            <p className="eyebrow" style={{ color: 'var(--primary-green)', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              {t('landing.eyebrow') || 'AI-POWERED ACCESSIBLE COMMUNICATION'}
            </p>

            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.4rem, 4vw, 3.4rem)', lineHeight: '1.18', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              Practice conversations.
              <br />
              <span className="title-accent" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Build confidence. Navigate the real world.
              </span>
            </h1>

            <p className="intro" style={{ fontSize: '1.1rem', lineHeight: '1.65', color: 'var(--text-secondary)', marginBottom: '1.85rem', maxWidth: '580px' }}>
              {t('landing.heroSub') || 'HumSaathi AI is an adaptive communication and life-skills coach that helps learners safely practice real-world conversations.'}
            </p>

            {/* Action CTAs */}
            <div className="landing-actions" style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '2rem' }}>
              {user?.id ? (
                <>
                  <button className="btn-primary" type="button" onClick={() => navigate('/dashboard')} style={{ padding: '0.85rem 1.85rem', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{t('landing.startPracticing') || 'Start Practicing'}</span>
                    <ArrowRightIcon size={16} />
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => navigate('/persona-selection')} style={{ padding: '0.85rem 1.5rem', fontSize: '0.95rem' }}>
                    {t('landing.switchPersona') || 'Switch Portal'}
                  </button>
                </>
              ) : (
                <>
                  <Link className="btn-primary" to="/signup" style={{ padding: '0.85rem 1.85rem', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{t('landing.startPracticing') || 'Start Practicing'}</span>
                    <ArrowRightIcon size={16} />
                  </Link>
                  <button className="btn-secondary" type="button" onClick={() => scrollToSection('how-it-works')} style={{ padding: '0.85rem 1.5rem', fontSize: '0.95rem' }}>
                    {t('landing.exploreHow') || 'Explore How It Works'}
                  </button>
                  <Link className="text-btn" to="/login" style={{ fontSize: '0.92rem', padding: '0.5rem 0.75rem' }}>
                    {t('landing.loginProfile') || 'Sign In'}
                  </Link>
                </>
              )}
            </div>

            {/* Quick Feature Pills */}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="landing-feature-pill" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)', color: 'var(--text-secondary)' }}>
                Adaptive AI Coaching
              </span>
              <span className="landing-feature-pill" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)', color: 'var(--text-secondary)' }}>
                Real-time Voice & Text
              </span>
              <span className="landing-feature-pill" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)', color: 'var(--text-secondary)' }}>
                English · اردو · Roman Urdu
              </span>
            </div>
          </div>

          {/* Right Column: Realistic Live AI Conversation Preview Mockup */}
          <div className="landing-hero-preview">
            <div className="landing-chat-mockup-card">
              <div className="mockup-header-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="online-pulse-dot" />
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>AI COACH</strong>
                  <span style={{ fontSize: '0.75rem', background: 'var(--light-green)', color: 'var(--primary-green)', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                    Online
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Joining a Group Discussion
                </span>
              </div>

              <div className="mockup-chat-feed">
                {/* Learner Bubble */}
                <div className="mockup-bubble-learner">
                  <span style={{ fontSize: '0.72rem', display: 'block', opacity: 0.85, marginBottom: '2px', fontWeight: 600 }}>
                    Learner
                  </span>
                  "{t('landing.previewLearner') || 'I don\'t know what to say.'}"
                </div>

                {/* AI Coach Bubble */}
                <div className="mockup-bubble-coach">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '4px' }}>
                    <AiIcon size={16} />
                    <strong style={{ fontSize: '0.8rem', color: 'var(--primary-green)' }}>HumSaathi Coach</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                    "{t('landing.previewCoach') || 'That’s okay. We can take it one step at a time. Would you like to ask for help or explain what you\'re unsure about?'}"
                  </p>
                </div>
              </div>

              {/* Sub-card AI Context telemetry indicator */}
              <div className="mockup-badge-footer">
                <span style={{ color: 'var(--primary-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <SparklesIcon size={13} /> {t('landing.aiCoachBadge') || 'AI Coach • Context-aware • Multi-turn'}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                  Adaptive simulation
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Distinct Persona Preview Grid */}
        <section id="how-it-works" style={{ marginTop: '4rem', marginBottom: '2.5rem', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="eyebrow" style={{ color: 'var(--primary-green)', fontSize: '0.82rem', letterSpacing: '0.08em', fontWeight: 800 }}>
              PERSONA ISOLATION & TAILORED LEARNING
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', color: 'var(--text-primary)', marginTop: '0.35rem' }}>
              Three Tailored Portals. One Intelligent Companion.
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
              width: '100%',
            }}
          >
            {/* Child Portal */}
            <div
              style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(11, 107, 58, 0.1)', color: '#0B6B3A' }}>
                  Ages 4 – 12
                </span>
              </div>
              <strong style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.4rem', fontFamily: 'var(--font-serif)' }}>
                Child Portal
              </strong>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                Guided foundational games: alphabet letters, numbers, emotion recognition, daily routines, and encouraging star rewards.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', background: 'var(--bg-tertiary)', padding: '2px 7px', borderRadius: '4px', color: 'var(--text-secondary)' }}>7 Foundational Modules</span>
                <span style={{ fontSize: '0.75rem', background: 'var(--bg-tertiary)', padding: '2px 7px', borderRadius: '4px', color: 'var(--text-secondary)' }}>Sensory-Calm Pace</span>
              </div>
            </div>

            {/* Teen Portal */}
            <div
              style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
                  Ages 13 – 17
                </span>
              </div>
              <strong style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.4rem', fontFamily: 'var(--font-serif)' }}>
                Teen Portal
              </strong>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                Peer discussions, school projects, Reading & Vocabulary, Problem Solving, and collaborative communication practice.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', background: 'var(--bg-tertiary)', padding: '2px 7px', borderRadius: '4px', color: 'var(--text-secondary)' }}>Reading & Vocabulary</span>
                <span style={{ fontSize: '0.75rem', background: 'var(--bg-tertiary)', padding: '2px 7px', borderRadius: '4px', color: 'var(--text-secondary)' }}>Problem Solving Scenarios</span>
              </div>
            </div>

            {/* Adult Portal */}
            <div
              style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7' }}>
                  Ages 18+
                </span>
              </div>
              <strong style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.4rem', fontFamily: 'var(--font-serif)' }}>
                Adult Portal
              </strong>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                Workplace dialogues, manager task clarification, functional reading of utility invoices and transit schedules, and independent living.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', background: 'var(--bg-tertiary)', padding: '2px 7px', borderRadius: '4px', color: 'var(--text-secondary)' }}>Functional Literacy</span>
                <span style={{ fontSize: '0.75rem', background: 'var(--bg-tertiary)', padding: '2px 7px', borderRadius: '4px', color: 'var(--text-secondary)' }}>Workplace Dialogue</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <div className="landing-features" style={{ marginTop: '2rem' }}>
          <div className="landing-feature-pill">Contextual AI Role-Play</div>
          <div className="landing-feature-pill">Natural Voice & Text Modes</div>
          <div className="landing-feature-pill">Persona-Calibrated Feedback</div>
          <div className="landing-feature-pill">English, Urdu & Roman Urdu</div>
          <div className="landing-feature-pill">Sensory & Calm Accessibility</div>
        </div>

        {/* Bottom Disclaimer */}
        <p className="disclaimer" style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          {t('app.disclaimer')}
        </p>
      </div>
    </div>
  );
}
