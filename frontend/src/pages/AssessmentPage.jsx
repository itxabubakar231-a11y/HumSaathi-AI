import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';

export default function AssessmentPage() {
  const { user } = useUser();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [cardAnimationKey, setCardAnimationKey] = useState(0);

  useEffect(() => {
    if (!user?.id) {
      navigate('/signup');
      return;
    }
    api.getAssessmentQuestions(user.id)
      .then((data) => {
        setQuestions(data.questions || []);
      })
      .catch((e) => setError(e.message || t('common.error')))
      .finally(() => setLoading(false));
  }, [user, navigate, t]);

  const current = questions[index];
  const total = questions.length || 5;
  const progressPercent = total > 0 ? Math.round(((index + 1) / total) * 100) : 0;

  const selectAnswer = useCallback((answer) => {
    setSelected(answer);
  }, []);

  const goNext = useCallback(() => {
    if (selected === null || !current) return;

    const nextResponses = [...responses, { questionId: current.id, answer: selected }];
    setResponses(nextResponses);
    setSelected(null);

    if (index < questions.length - 1) {
      setIndex((prev) => prev + 1);
      setCardAnimationKey((prev) => prev + 1);
    } else {
      submitAssessment(nextResponses);
    }
  }, [selected, current, responses, index, questions.length]);

  // Keyboard accessibility: Press 1, 2, 3 to select options, Enter to proceed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!current?.options || submitting) return;

      if (e.key === '1' && current.options[0] !== undefined) {
        selectAnswer(current.options[0]);
      } else if (e.key === '2' && current.options[1] !== undefined) {
        selectAnswer(current.options[1]);
      } else if (e.key === '3' && current.options[2] !== undefined) {
        selectAnswer(current.options[2]);
      } else if (e.key === '4' && current.options[3] !== undefined) {
        selectAnswer(current.options[3]);
      } else if (e.key === 'Enter' && selected !== null) {
        goNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [current, selected, submitting, selectAnswer, goNext]);

  const submitAssessment = async (finalResponses) => {
    setSubmitting(true);
    try {
      const { assessment } = await api.submitAssessment(user.id, finalResponses);
      setResults(assessment);
    } catch (e) {
      setError(e.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const getRecommendationAndGo = async () => {
    setSubmitting(true);
    try {
      const { recommendation } = await api.recommend(user.id);
      if (recommendation?.activityId) {
        navigate(`/activity/${recommendation.activityId}`, { state: { recommendation } });
      } else {
        navigate('/dashboard');
      }
    } catch {
      navigate('/dashboard');
    }
  };

  const getOptionBadgeLetter = (optIdx) => {
    const letters = ['A', 'B', 'C', 'D', 'E'];
    return letters[optIdx] || String(optIdx + 1);
  };

  const isShortChoice = (opt) => {
    return typeof opt === 'string' && opt.trim().length <= 3;
  };

  if (loading) {
    return (
      <div className="assessment-loading-state">
        <div className="assessment-spinner" aria-hidden="true" />
        <h2>{t('common.loading')}</h2>
        <p className="loading-subtext">Preparing your personalized questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assessment-error-state">
        <span className="error-icon" aria-hidden="true"></span>
        <h2>Unable to load assessment</h2>
        <p className="error-text">{error}</p>
        <button className="btn-primary" type="button" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  if (results) {
    const scorePct = Math.round((results.score || 0) * 100);
    const correctCount = results.correct ?? 0;
    const totalCount = results.total ?? questions.length;

    return (
      <div className="assessment-results-container">
        {/* Results Hero Card */}
        <div className="assessment-results-hero">
          <div className="results-badge-pill">
            <span> Assessment Complete</span>
          </div>

          <h1 className="results-main-title">{t('assessment.resultsTitle')}</h1>
          <p className="results-sub-title">
            Great job! We have customized your starting activities based on your performance.
          </p>

          <div className="results-score-circle-wrapper">
            <div className="results-score-circle">
              <span className="score-percentage">{scorePct}%</span>
              <span className="score-label">{correctCount} of {totalCount} Correct</span>
            </div>
          </div>

          {results.estimatedLevel && (
            <div className="results-level-badge">
              <span className="level-label">Recommended Level:</span>
              <strong className="level-value">
                {results.estimatedLevel.toUpperCase()}
              </strong>
            </div>
          )}

          {results.summary && (
            <div className="results-ai-summary-card">
              <div className="ai-summary-header">
                <span className="ai-sparkle"></span>
                <strong>AI Learning Summary</strong>
              </div>
              <p className="ai-summary-text">{results.summary}</p>
            </div>
          )}

          {results.areas && Array.isArray(results.areas) && results.areas.length > 0 && (
            <div className="results-skills-breakdown">
              <p className="skills-breakdown-title">Skill Assessment Overview</p>
              <div className="skills-chips-grid">
                {results.areas.map((a) => (
                  <div key={a.skill} className="skill-chip-card">
                    <span className="skill-name">{a.skill}</span>
                    <span className="skill-level-tag">{a.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="results-action-area">
            <button
              className="btn-primary btn-launch-activity"
              type="button"
              onClick={getRecommendationAndGo}
              disabled={submitting}
            >
              {submitting ? t('common.loading') : `${t('assessment.continue')} `}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-container" role="main">
      {/* Assessment Header & Progress Bar */}
      <div className="assessment-header-panel">
        <div className="assessment-top-meta">
          <span className="assessment-kicker">
             {t('assessment.eyebrow') || 'Initial Check'}
          </span>
          <span className="assessment-counter" aria-live="polite">
            {t('assessment.question')} <strong>{index + 1}</strong> {t('assessment.of')} {total}
          </span>
        </div>

        {/* Smooth Modern Progress Bar */}
        <div
          className="assessment-progress-track"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label={`Question ${index + 1} of ${total}`}
        >
          <div
            className="assessment-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Dots */}
        <div className="assessment-step-dots" aria-hidden="true">
          {Array.from({ length: total }).map((_, dotIdx) => {
            const isCompleted = dotIdx < index;
            const isCurrent = dotIdx === index;
            return (
              <span
                key={dotIdx}
                className={`step-dot ${isCompleted ? 'is-completed' : ''} ${isCurrent ? 'is-current' : ''}`}
              />
            );
          })}
        </div>
      </div>

      {/* Main Question Card with Staggered Animations */}
      <div className="assessment-main-card" key={`q-${index}`}>
        <div className="question-prompt-wrapper">
          <h1 className="assessment-question-heading">{current?.prompt}</h1>
          <p className="assessment-support-text">
            Take your time. Choose the correct answer below.
          </p>
        </div>

        {/* Large Interactive Answer Cards Grid */}
        <div
          className="assessment-options-grid"
          role="radiogroup"
          aria-label={current?.prompt}
          key={`options-${cardAnimationKey}`}
        >
          {current?.options.map((opt, optIdx) => {
            const isSelected = selected === opt;
            const shortText = isShortChoice(opt);
            const badgeLetter = getOptionBadgeLetter(optIdx);

            return (
              <button
                key={`${opt}-${optIdx}`}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`assessment-answer-card ${isSelected ? 'is-selected' : ''} ${shortText ? 'is-short-letter' : 'is-phrase-choice'}`}
                style={{ '--stagger-delay': `${optIdx * 0.08}s` }}
                onClick={() => selectAnswer(opt)}
                aria-label={`Option ${badgeLetter}: ${opt}`}
              >
                {/* Option Letter Tag */}
                <div className="answer-card-header">
                  <span className="option-badge-letter">{badgeLetter}</span>
                  <span className="option-key-hint">Press {optIdx + 1}</span>
                </div>

                {/* Main Option Content */}
                <div className="answer-card-body">
                  <span className={`option-main-text ${shortText ? 'letter-hero' : 'phrase-hero'}`}>
                    {opt}
                  </span>
                </div>

                {/* Selection Footer Indicator */}
                <div className="answer-card-footer">
                  <div className={`selection-indicator ${isSelected ? 'is-active' : ''}`}>
                    <span className="indicator-check">{isSelected ? '✓' : ''}</span>
                    <span className="indicator-label">{isSelected ? 'Selected' : 'Click to select'}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Button Bar */}
        <div className="assessment-actions-bar">
          <button
            className="btn-primary assessment-next-btn"
            type="button"
            onClick={goNext}
            disabled={selected === null || submitting}
            aria-disabled={selected === null || submitting}
          >
            {submitting ? (
              <span>Evaluating...</span>
            ) : index === questions.length - 1 ? (
              <span>{t('assessment.submit')} </span>
            ) : (
              <span>{t('activity.next')} ➔</span>
            )}
          </button>

          <p className="assessment-shortcut-hint">
             <em>Tip: You can also press <strong>1, 2, 3</strong> on your keyboard to select, and <strong>Enter</strong> to continue.</em>
          </p>
        </div>
      </div>
    </div>
  );
}
