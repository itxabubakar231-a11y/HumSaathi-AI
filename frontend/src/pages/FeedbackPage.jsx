import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';
import { RefreshIcon, ArrowRightIcon, HomeIcon, SparklesIcon, CheckIcon } from '../components/ui/Icons';

export default function FeedbackPage() {
  const { state } = useLocation();
  const { user } = useUser();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!state?.attempt || !state?.feedback) {
    return (
      <div className="feedback-page">
        <p className="error-text">{t('common.error')}</p>
        <button className="btn-primary" type="button" onClick={() => navigate('/dashboard')}>
          {t('feedback.dashboard')}
        </button>
      </div>
    );
  }

  const { attempt, feedback, activity } = state;
  const isChild = user?.persona === 'child';

  const goNext = async () => {
    setLoading(true);
    try {
      const { recommendation } = await api.recommend(user.id);
      if (recommendation.activityId) {
        navigate(`/activity/${recommendation.activityId}`, { state: { recommendation } });
      } else {
        navigate('/dashboard');
      }
    } catch {
      navigate('/dashboard');
    }
  };

  const retry = () => {
    navigate(`/activity/${activity.id}`);
  };

  // Dedicated Child Feedback UI
  if (isChild) {
    return (
      <div className="feedback-page child-feedback-page">
        <div className="child-celebration-hero">
          <span className="child-celebration-icon" aria-hidden="true">★</span>
          <h1 className="child-feedback-title">{t('child.sessionComplete')}</h1>
          <p className="child-feedback-subtitle">
            {feedback.message || t('child.greatJob')}
          </p>
        </div>

        <div className="child-completion-card">
          {/* Stars Awarded Display */}
          <div className="child-stars-celebration" aria-label={`${attempt.starsAwarded || 1} ${t('child.stars')}`}>
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className={`child-reward-star ${i < (attempt.starsAwarded || 1) ? 'is-earned' : 'is-empty'}`}
                aria-hidden="true"
              >
                ★
              </span>
            ))}
          </div>

          {/* Newly Unlocked Badge Banner */}
          {attempt.newlyUnlockedBadges?.length > 0 && (
            <div className="child-new-badge-banner">
              <div className="new-badge-info">
                <p className="new-badge-kicker">{t('child.newBadge')}</p>
                <h3 className="new-badge-title">
                  {t(attempt.newlyUnlockedBadges[0].titleKey)}
                </h3>
                <p className="new-badge-desc">{t(attempt.newlyUnlockedBadges[0].descKey)}</p>
              </div>
            </div>
          )}

          <div className="child-task-badge">
            <span className="badge-icon" aria-hidden="true"><CheckIcon size={16} /></span>
            <span>
              {t('child.completedTasks').replace('{count}', String(attempt.totalCount))}
            </span>
          </div>

          <p className="child-encouragement-text">
            {feedback.encouragement || t('child.greatJob')}
          </p>

          {feedback.nextStepHint && (
            <p className="child-hint-step">
              {feedback.nextStepHint}
            </p>
          )}
        </div>

        <div className="child-feedback-actions">
          {(feedback.shouldRetry || attempt.adaptation?.shouldRetry) && (
            <button className="btn-child-secondary" type="button" onClick={retry}>
              <RefreshIcon size={16} /> <span>{t('child.tryAgain')}</span>
            </button>
          )}
          <button className="btn-child-primary" type="button" onClick={goNext} disabled={loading}>
            <span>{t('child.nextAdventure')}</span> <ArrowRightIcon size={16} />
          </button>
          <button className="btn-child-outline" type="button" onClick={() => navigate('/dashboard')}>
            <HomeIcon size={16} /> <span>{t('child.home')}</span>
          </button>
        </div>
      </div>
    );
  }

  // Standard Teen / Adult Feedback UI
  const scorePct = Math.round(attempt.score * 100);

  return (
    <div className="feedback-page">
      <p className="eyebrow">{t('feedback.title')}</p>
      <h1>{feedback.message}</h1>

      <div className="results-card">
        <p className="stat-highlight">{scorePct}%</p>
        <p>{t('feedback.score')}</p>
        <p>{t('feedback.correct')}: {attempt.correctCount}/{attempt.totalCount}</p>
        <p className="card-desc">{feedback.encouragement}</p>
        {feedback.nextStepHint && <p className="card-desc">{feedback.nextStepHint}</p>}
      </div>

      <div className="feedback-actions">
        {(feedback.shouldRetry || attempt.adaptation?.shouldRetry) && (
          <button className="btn-secondary" type="button" onClick={retry}>
            <RefreshIcon size={15} /> <span>{t('feedback.retry')}</span>
          </button>
        )}
        <button className="btn-primary" type="button" onClick={goNext} disabled={loading}>
          <span>{t('feedback.next')}</span> <ArrowRightIcon size={15} />
        </button>
        <button className="btn-outline" type="button" onClick={() => navigate('/dashboard')}>
          <HomeIcon size={15} /> <span>{t('feedback.dashboard')}</span>
        </button>
      </div>
    </div>
  );
}
