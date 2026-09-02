import { motion, useReducedMotion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';

export default function ParentHomePractice({ companion }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const activities = companion?.homePractice || [];

  return (
    <div className="parent-section-container">
      {/* Header */}
      <header className="parent-subview-header">
        <span className="parent-badge-kicker">Guided Home Activities</span>
        <h2>🎯 {t('parent.nav.practice') || 'Home Practice'}</h2>
        <p className="parent-subview-desc">
          Short, empowering 5-10 minute activities designed to reinforce your learner's current focus areas during daily moments.
        </p>
      </header>

      {/* Practice Cards List */}
      <div className="home-practice-cards-grid">
        {activities.map((act, idx) => (
          <motion.div
            key={act.id || idx}
            className="parent-card home-practice-card"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.06 }}
          >
            <div className="practice-card-head">
              <div>
                <span className="practice-diff-badge">{act.difficulty || 'Gentle'}</span>
                <h3 className="practice-activity-title">{act.activityName}</h3>
              </div>
              <span className="practice-duration-pill">⏱️ {act.duration}</span>
            </div>

            <div className="practice-goal-box">
              <strong>Goal:</strong> {act.goal}
            </div>

            <div className="practice-steps-section">
              <span className="step-label">Instructions:</span>
              <p className="step-text">{act.instructions}</p>
            </div>

            {/* Parent Prompt & Learner Practice */}
            <div className="practice-dialogue-guide">
              <div className="dialogue-role-box parent-role-box">
                <span className="role-tag">Parent / Caregiver says:</span>
                <p className="quote-text">"{act.parentPrompt}"</p>
              </div>
              <div className="dialogue-role-box learner-role-box">
                <span className="role-tag">Learner practices:</span>
                <p className="quote-text">{act.learnerPractice}</p>
              </div>
            </div>

            {/* Start Practice Action Button */}
            <div className="practice-card-footer">
              <button
                className="btn-primary start-practice-btn"
                type="button"
                onClick={() => navigate(act.actionLink || '/scenarios')}
              >
                {t('parent.startPractice') || 'Start Practice'} →
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
