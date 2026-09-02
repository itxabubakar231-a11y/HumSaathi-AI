import { motion, useReducedMotion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';

export default function ParentGrowthJourney({ companion, onNavigateTab }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const growth = companion?.growthJourney;
  const stages = growth?.stages || [];
  const milestones = growth?.milestones || [];
  const nextFocus = growth?.nextFocus;
  const overall = companion?.overallGrowth;

  return (
    <div className="parent-section-container">
      {/* Header */}
      <header className="parent-subview-header">
        <span className="parent-badge-kicker">Progression Timeline</span>
        <h2>📈 {t('parent.nav.growth') || 'Growth Journey'}</h2>
        <p className="parent-subview-desc">
          Follow your learner's developmental progression across milestones and mastery stages.
        </p>
      </header>

      {/* Visual Progression Stages */}
      <motion.section
        className="parent-card"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="parent-section-title-wrap">
          <span className="icon-badge">🏆</span>
          <h3>Developmental Progression</h3>
        </div>

        <div className="growth-stages-timeline">
          {stages.map((stg, idx) => (
            <div
              key={idx}
              className={`growth-stage-item ${stg.isCurrent ? 'is-current' : ''} ${stg.reached ? 'is-reached' : ''}`}
            >
              <div className="stage-marker">
                <span className="stage-index">{stg.reached ? '✓' : idx + 1}</span>
              </div>
              <div className="stage-info">
                <strong className="stage-name">{stg.name}</strong>
                <p className="stage-desc">{stg.description}</p>
              </div>
              {stg.isCurrent && <span className="current-stage-tag">Current Stage</span>}
            </div>
          ))}
        </div>
      </motion.section>

      {/* Recommended Next Focus Card */}
      {nextFocus && (
        <motion.section
          className="parent-card next-focus-card"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
        >
          <div className="next-focus-inner">
            <span className="focus-star-icon">🎯</span>
            <div className="next-focus-text">
              <span className="parent-badge-kicker">Recommended Next Step</span>
              <h3>{nextFocus.title}</h3>
              <p>{nextFocus.reason}</p>
            </div>
            <button
              className="btn-primary"
              type="button"
              onClick={() => navigate(nextFocus.actionLink || '/scenarios')}
            >
              Start Practice →
            </button>
          </div>
        </motion.section>
      )}

      {/* Milestone Progression History */}
      <motion.section
        className="parent-card"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.12 }}
      >
        <div className="parent-section-title-wrap">
          <span className="icon-badge">✨</span>
          <h3>Milestones & Achievements</h3>
        </div>

        {milestones.length > 0 ? (
          <div className="milestones-timeline-list">
            {milestones.map((m, idx) => (
              <div key={idx} className="milestone-item-row">
                <div className="milestone-badge-icon">{m.badge || '⭐'}</div>
                <div className="milestone-item-body">
                  <div className="milestone-header">
                    <strong>{m.title}</strong>
                    <span className="milestone-date">
                      {m.date ? new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                    </span>
                  </div>
                  <p>{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="parent-empty-text">Complete activities to unlock your learner's first milestone badge!</p>
        )}
      </motion.section>
    </div>
  );
}
