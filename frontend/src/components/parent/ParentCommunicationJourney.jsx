import { motion, useReducedMotion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';

export default function ParentCommunicationJourney({ companion }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const sessions = companion?.communicationJourney || [];

  const renderStars = (count) => {
    return '⭐'.repeat(Math.max(1, Math.min(5, count || 4)));
  };

  return (
    <div className="parent-section-container">
      {/* Header */}
      <header className="parent-subview-header">
        <span className="parent-badge-kicker">Communication History</span>
        <h2>🗣️ {t('parent.nav.communication') || 'Communication Journey'}</h2>
        <p className="parent-subview-desc">
          Review your learner's roleplay conversation practice sessions, communication strengths, and key growth areas.
        </p>
      </header>

      {/* Sessions List */}
      {sessions.length > 0 ? (
        <div className="parent-comm-sessions-list">
          {sessions.map((s, idx) => (
            <motion.div
              key={s.sessionId || idx}
              className="parent-card parent-comm-session-card"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <div className="comm-card-head">
                <div>
                  <span className="comm-mode-tag">
                    {s.mode === 'voice' ? '🎙️ Voice Practice' : '💬 Text Roleplay'}
                  </span>
                  <h3 className="comm-scenario-title">{s.scenarioTitle}</h3>
                  <span className="comm-session-date">
                    {s.date ? new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent Practice'}
                  </span>
                </div>
                <div className="comm-score-badge">
                  <span className="comm-score-number">{s.overallScore}%</span>
                  <small>Overall</small>
                </div>
              </div>

              {/* 5-Metric Star Ratings */}
              <div className="comm-ratings-grid">
                <div className="comm-rating-item">
                  <span className="rating-label">Greeting</span>
                  <span className="rating-stars">{renderStars(s.ratings?.greeting)}</span>
                </div>
                <div className="comm-rating-item">
                  <span className="rating-label">Clarity</span>
                  <span className="rating-stars">{renderStars(s.ratings?.clarity)}</span>
                </div>
                <div className="comm-rating-item">
                  <span className="rating-label">Response</span>
                  <span className="rating-stars">{renderStars(s.ratings?.response)}</span>
                </div>
                <div className="comm-rating-item">
                  <span className="rating-label">Initiation</span>
                  <span className="rating-stars">{renderStars(s.ratings?.initiation)}</span>
                </div>
                <div className="comm-rating-item">
                  <span className="rating-label">Flow</span>
                  <span className="rating-stars">{renderStars(s.ratings?.communication)}</span>
                </div>
              </div>

              {/* Privacy-Friendly Observation Summary */}
              <div className="comm-privacy-summary-box">
                <strong className="summary-label">AI Observation:</strong>
                <p>{s.privacySummary}</p>
              </div>

              {/* Strengths & Improvements */}
              <div className="comm-feedback-chips-row">
                {s.strengths?.length > 0 && (
                  <div className="comm-strengths-col">
                    <span className="sub-label">🌟 Strengths Observed:</span>
                    <div className="chips-wrap">
                      {s.strengths.map((str, i) => (
                        <span key={i} className="mini-chip strength-chip">{str}</span>
                      ))}
                    </div>
                  </div>
                )}
                {s.improvements?.length > 0 && (
                  <div className="comm-improvements-col">
                    <span className="sub-label">🎯 Opportunity:</span>
                    <div className="chips-wrap">
                      {s.improvements.map((imp, i) => (
                        <span key={i} className="mini-chip focus-chip">{imp}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="parent-empty-card">
          <p>No conversation sessions completed yet. Practice a roleplay scenario to generate your first communication report.</p>
          <button className="btn-primary" type="button" onClick={() => navigate('/scenarios')}>
            Explore Scenarios →
          </button>
        </div>
      )}

      {/* Start Practice Floating CTA */}
      <div className="parent-section-bottom-cta">
        <button className="btn-primary" type="button" onClick={() => navigate('/scenarios')}>
          Practice More Communication Scenarios →
        </button>
      </div>
    </div>
  );
}
