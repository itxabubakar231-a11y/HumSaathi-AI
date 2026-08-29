import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';
import ShapeVisual from '../components/activities/ShapeVisual';

export default function ActivityPage() {
  const { id } = useParams();
  const { user } = useUser();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [checkedState, setCheckedState] = useState(null); // 'correct' | 'incorrect' | null
  const [showHint, setShowHint] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [attemptsUsed, setAttemptsUsed] = useState(1);
  const [isFirstTryCorrect, setIsFirstTryCorrect] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!user?.id) {
      navigate('/setup');
      return;
    }
    api.getActivity(id)
      .then((data) => setActivity(data.activity))
      .catch(() => navigate('/dashboard'));
  }, [id, user, navigate]);

  if (!activity) return <p className="loading-text">{t('common.loading')}</p>;

  const questions = activity.content?.questions || [];
  const question = questions[qIndex];
  const isLastQuestion = qIndex >= questions.length - 1;

  const handleSelect = (option) => {
    if (checkedState === 'correct') return; // already solved this task
    setSelected(option);
    setCheckedState(null);
    setErrorMessage('');
  };

  const handleCheck = () => {
    if (!selected || !question) return;

    // Check if the selected answer matches the correct answer
    const expected = question.correctAnswer;
    const isMatch = expected !== undefined && expected !== null
      ? String(expected).trim().toLowerCase() === String(selected).trim().toLowerCase()
      : false;

    if (isMatch) {
      setCheckedState('correct');
    } else {
      setCheckedState('incorrect');
      setIsFirstTryCorrect(false);
    }
  };

  const handleTryAgain = () => {
    setSelected(null);
    setCheckedState(null);
    setAttemptsUsed((prev) => prev + 1);
  };

  const handleNext = () => {
    const entry = {
      questionId: question.id,
      answer: selected,
      correct: isFirstTryCorrect,
      attemptsUsed,
    };
    const nextAnswers = [...answers, entry];

    if (isLastQuestion) {
      finishActivity(nextAnswers);
    } else {
      setAnswers(nextAnswers);
      setQIndex((prev) => prev + 1);
      setSelected(null);
      setCheckedState(null);
      setShowHint(false);
      setAttemptsUsed(1);
      setIsFirstTryCorrect(true);
      setErrorMessage('');
    }
  };

  const finishActivity = async (finalAnswers) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const timeMs = Date.now() - startTime;
      const result = await api.submitAttempt(user.id, {
        activityId: activity.id,
        answers: finalAnswers,
        timeMs,
      });
      navigate('/feedback', {
        state: {
          attempt: result.attempt,
          feedback: result.feedback,
          activity,
        },
      });
    } catch {
      setErrorMessage(t('common.error'));
      setSubmitting(false);
    }
  };

  return (
    <div className="activity-page child-activity-container">
      {/* Session Progress Tracker */}
      <header className="activity-session-header">
        <div className="activity-title-wrap">
          <p className="activity-session-badge">{activity.title}</p>
          <span className="activity-counter">
            {t('child.task')} {qIndex + 1} {t('child.of')} {questions.length}
          </span>
        </div>
        <div className="activity-progress-dots" aria-hidden="true">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`progress-dot ${i < qIndex ? 'is-done' : ''} ${i === qIndex ? 'is-current' : ''}`}
            />
          ))}
        </div>
      </header>

      {/* Task Prompt */}
      <h1 className="activity-prompt">{question?.prompt}</h1>

      {/* Visual Prompt (Counting Objects, Animal, Emotion, Routine Card) */}
      {question?.visualPrompt && (
        <div className="activity-visual-prompt" aria-label="Task Visual">
          {question.visualPrompt.type === 'counting' && (
            <div className="counting-cluster" aria-label={`${question.visualPrompt.count} ${question.visualPrompt.label}`}>
              {Array.from({ length: question.visualPrompt.count }).map((_, i) => (
                <span key={i} className="counting-item" aria-hidden="true">
                  {question.visualPrompt.icon}
                </span>
              ))}
            </div>
          )}

          {question.visualPrompt.type === 'animal' && (
            <div className="visual-focus-card">
              <span className="visual-large-icon" aria-hidden="true">{question.visualPrompt.icon}</span>
            </div>
          )}

          {question.visualPrompt.type === 'emotion' && (
            <div className="visual-focus-card emotion-card">
              <span className="visual-large-icon" aria-hidden="true">{question.visualPrompt.icon}</span>
            </div>
          )}

          {question.visualPrompt.type === 'routine' && (
            <div className="visual-focus-card routine-card">
              <span className="visual-large-icon" aria-hidden="true">{question.visualPrompt.icon}</span>
              <p className="visual-card-caption">{question.visualPrompt.label}</p>
            </div>
          )}
        </div>
      )}

      {/* Optional Hint Toggle */}
      {question?.hint && (
        <div className="activity-hint-area">
          <button
            type="button"
            className="btn-hint"
            onClick={() => setShowHint((prev) => !prev)}
            aria-expanded={showHint}
          >
            💡 {showHint ? t('child.hideHint') : t('child.hint')}
          </button>
          {showHint && (
            <div className="hint-box" role="note">
              <p>{question.hint}</p>
            </div>
          )}
        </div>
      )}

      {/* Visual or Text Options Grid */}
      {question?.visual ? (
        <div className="shape-grid">
          {question.visual.map((item) => {
            const isSelected = selected === item.label;
            const isSolved = checkedState === 'correct' && isSelected;
            const isWrong = checkedState === 'incorrect' && isSelected;
            return (
              <button
                key={item.label}
                type="button"
                className={`shape-option ${isSelected ? 'is-selected' : ''} ${isSolved ? 'is-correct' : ''} ${isWrong ? 'is-retry' : ''}`}
                onClick={() => handleSelect(item.label)}
                aria-pressed={isSelected}
                disabled={checkedState === 'correct'}
              >
                <ShapeVisual shape={item.shape} color={item.color} />
                <span className="shape-label-text">{item.label}</span>
                {isSolved && <span className="option-check-badge" aria-hidden="true">✓</span>}
              </button>
            );
          })}
        </div>
      ) : (
        <div className={`option-grid ${question?.options?.every((opt) => String(opt).length <= 3) ? 'option-grid-letters' : 'option-grid-large'}`}>
          {question?.options.map((opt) => {
            const isSelected = selected === opt;
            const isSolved = checkedState === 'correct' && isSelected;
            const isWrong = checkedState === 'incorrect' && isSelected;
            const isShort = String(opt).length <= 3;
            return (
              <button
                key={opt}
                type="button"
                className={`option-btn ${isShort ? 'is-short-letter' : ''} ${isSelected ? 'is-selected' : ''} ${isSolved ? 'is-correct' : ''} ${isWrong ? 'is-retry' : ''}`}
                onClick={() => handleSelect(opt)}
                aria-pressed={isSelected}
                disabled={checkedState === 'correct'}
              >
                <span className="option-text-val">{opt}</span>
                {isSolved && <span className="option-check-badge" aria-hidden="true">✓</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Inline Gentle Feedback Message */}
      {checkedState === 'correct' && (
        <div className="gentle-feedback-banner correct" role="status">
          <span className="banner-icon" aria-hidden="true">🎉</span>
          <p>{t('child.wellDone')}</p>
        </div>
      )}

      {checkedState === 'incorrect' && (
        <div className="gentle-feedback-banner retry" role="status">
          <span className="banner-icon" aria-hidden="true">🌱</span>
          <p>{t('child.tryAgainPrompt')}</p>
        </div>
      )}

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {/* Action Controls */}
      <div className="activity-action-footer">
        {checkedState === null && (
          <button
            className="btn-primary btn-large"
            type="button"
            onClick={handleCheck}
            disabled={!selected}
          >
            {t('activity.check')}
          </button>
        )}

        {checkedState === 'incorrect' && (
          <button
            className="btn-secondary btn-large"
            type="button"
            onClick={handleTryAgain}
          >
            🔄 {t('child.tryAgain')}
          </button>
        )}

        {checkedState === 'correct' && (
          <button
            className="btn-primary btn-large"
            type="button"
            onClick={handleNext}
            disabled={submitting}
          >
            {isLastQuestion ? t('activity.finish') : t('child.keepGoing')} ➔
          </button>
        )}
      </div>
    </div>
  );
}
