import { motion, useReducedMotion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';

export default function ParentOverview({ companion, onNavigateTab }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  if (!companion || !companion.learner) {
    return (
      <div className="parent-empty-card">
        <p>{t('parent.emptyLearner')}</p>
        <button className="btn-primary" type="button" onClick={() => navigate('/scenarios')}>
          {t('parent.startFirstActivity')}
        </button>
      </div>
    );
  }

  const { learner, overallGrowth, whatINoticed, strengths, needsPractice, skillProgress } = companion;
  const isNew = overallGrowth?.isNewLearner || (overallGrowth?.completedActivities === 0 && !skillProgress?.length);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning 👋';
    if (hour < 18) return 'Good afternoon 👋';
    return 'Good evening 👋';
  };

  const getPersonaBadge = (p) => {
    switch (p) {
      case 'child': return { label: 'Child Portal', color: '#F59E0B', bg: '#FEF3C7' };
      case 'teen': return { label: 'Teen Portal', color: '#8B5CF6', bg: '#F3E8FF' };
      case 'adult': return { label: 'Adult Portal', color: '#0EA5E9', bg: '#E0F2FE' };
      default: return { label: 'Learner Portal', color: '#10B981', bg: '#D1FAE5' };
    }
  };

  const pBadge = getPersonaBadge(learner.persona);

  return (
    <div className="parent-section-container">
      {/* Warm Header */}
      <header className="parent-overview-header">
        <div className="parent-overview-greeting">
          <span className="parent-greeting-pill">{getGreeting()}</span>
          <h2>{t('parent.subtitle') || "Here's how your learner is doing this week."}</h2>
          <p className="parent-learner-meta">
            <strong>{learner.name}</strong> · <span style={{ color: pBadge.color, fontWeight: 700 }}>{pBadge.label}</span>
          </p>
        </div>
      </header>

      {/* Overall Growth Banner */}
      <motion.section
        className="parent-card parent-growth-card"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="parent-growth-header">
          <div>
            <span className="parent-badge-kicker">{t('parent.overallGrowth')}</span>
            <h3 className="parent-growth-level">{overallGrowth.level}</h3>
          </div>
          <div className="parent-growth-pill">
            <span>{overallGrowth.growthText}</span>
          </div>
        </div>

        <div className="parent-metrics-grid">
          <div className="parent-metric-box">
            <span className="metric-label">Completed Sessions</span>
            <strong className="metric-value">{overallGrowth.completedActivities}</strong>
          </div>
          <div className="parent-metric-box">
            <span className="metric-label">Avg. Accuracy</span>
            <strong className="metric-value">{overallGrowth.avgAccuracy}%</strong>
          </div>
          <div className="parent-metric-box">
            <span className="metric-label">Practice Time</span>
            <strong className="metric-value">{overallGrowth.practiceTimeMinutes} mins</strong>
          </div>
        </div>
      </motion.section>

      {/* AI Insight Card: What I noticed */}
      <motion.section
        className="parent-card parent-ai-noticed-card"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
      >
        <div className="parent-card-header-row">
          <div className="parent-card-title-group">
            <span className="ai-sparkle-badge">🤖 {t('parent.whatINoticed')}</span>
            <span className="ai-live-tag">AI Observed</span>
          </div>
          <button className="parent-text-btn" type="button" onClick={() => onNavigateTab('insights')}>
            Explore Insights →
          </button>
        </div>
        <p className="parent-ai-summary-text">{whatINoticed}</p>
      </motion.section>

      {/* Two Column: Strengths & Areas to Work On */}
      <div className="parent-two-col-grid">
        {/* Strengths */}
        <motion.section
          className="parent-card"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12 }}
        >
          <div className="parent-section-title-wrap">
            <span className="icon-badge strength-badge">🌟</span>
            <h3>{t('parent.strengths')}</h3>
          </div>
          {strengths?.length > 0 ? (
            <ul className="parent-chip-list">
              {strengths.map((str, idx) => (
                <li key={idx} className="parent-strength-chip">
                  <span className="chip-check">✓</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="parent-empty-text">Complete activities to reveal identified strengths.</p>
          )}
        </motion.section>

        {/* Areas to Work On */}
        <motion.section
          className="parent-card"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16 }}
        >
          <div className="parent-section-title-wrap">
            <span className="icon-badge focus-badge">🎯</span>
            <h3>{t('parent.needsPractice')}</h3>
          </div>
          {needsPractice?.length > 0 ? (
            <ul className="parent-chip-list">
              {needsPractice.map((np, idx) => (
                <li key={idx} className="parent-focus-chip">
                  <span className="chip-dot">•</span>
                  <span>{np}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="parent-empty-text">No immediate areas of struggle detected.</p>
          )}
        </motion.section>
      </div>

      {/* Skill Progress Meters */}
      <motion.section
        className="parent-card"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="parent-card-header-row">
          <div className="parent-section-title-wrap">
            <span className="icon-badge">📊</span>
            <h3>{t('parent.skillsBreakdown')}</h3>
          </div>
          <button className="parent-text-btn" type="button" onClick={() => onNavigateTab('growth')}>
            View Growth Journey →
          </button>
        </div>

        {skillProgress?.length > 0 ? (
          <div className="parent-skills-grid">
            {skillProgress.map((item, idx) => (
              <div key={idx} className="parent-skill-meter-row">
                <div className="skill-meta-line">
                  <span className="skill-name">{item.title}</span>
                  <span className="skill-percent">{item.accuracy}%</span>
                </div>
                <div className="skill-track" role="progressbar" aria-valuenow={item.accuracy} aria-valuemin={0} aria-valuemax={100}>
                  <div
                    className="skill-fill"
                    style={{
                      width: `${Math.max(6, Math.min(100, item.accuracy))}%`,
                      backgroundColor: item.accuracy >= 80 ? '#10B981' : item.accuracy >= 50 ? '#0B6B3A' : '#F59E0B'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="parent-empty-card">
            <p>{t('parent.emptyLearner')}</p>
            <button className="btn-primary" type="button" onClick={() => navigate('/scenarios')}>
              {t('parent.startFirstActivity')}
            </button>
          </div>
        )}
      </motion.section>

      {/* Quick Action Cards */}
      <div className="parent-action-cards-grid">
        <div className="parent-action-card practice-action" onClick={() => onNavigateTab('practice')}>
          <span className="action-emoji">🎯</span>
          <div>
            <strong>Home Practice</strong>
            <p>Short, 5-minute activities you can do together at home.</p>
          </div>
          <span className="action-arrow">→</span>
        </div>
        <div className="parent-action-card chat-action" onClick={() => onNavigateTab('insights')}>
          <span className="action-emoji">💬</span>
          <div>
            <strong>Ask HumSaathi AI</strong>
            <p>Ask anything about your learner's progress and next steps.</p>
          </div>
          <span className="action-arrow">→</span>
        </div>
      </div>
    </div>
  );
}
