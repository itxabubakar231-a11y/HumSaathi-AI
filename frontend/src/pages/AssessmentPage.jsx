import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!user?.id) {
      navigate('/setup');
      return;
    }
    api.getAssessmentQuestions(user.id)
      .then((data) => setQuestions(data.questions))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const current = questions[index];

  const selectAnswer = (answer) => {
    setSelected(answer);
  };

  const goNext = () => {
    if (selected === null) return;
    const nextResponses = [...responses, { questionId: current.id, answer: selected }];
    setResponses(nextResponses);
    setSelected(null);
    if (index < questions.length - 1) {
      setIndex(index + 1);
    } else {
      submitAssessment(nextResponses);
    }
  };

  const submitAssessment = async (finalResponses) => {
    setSubmitting(true);
    try {
      const { assessment } = await api.submitAssessment(user.id, finalResponses);
      setResults(assessment);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getRecommendationAndGo = async () => {
    setSubmitting(true);
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

  if (loading) return <p>{t('common.loading')}</p>;
  if (error) return <p className="error-text">{error}</p>;

  if (results) {
    return (
      <div className="assessment-results">
        <p className="eyebrow">{t('assessment.eyebrow')}</p>
        <h1>{t('assessment.resultsTitle')}</h1>
        <div className="results-card">
          <p className="stat-highlight">{Math.round(results.score * 100)}%</p>
          <p>{t('assessment.score')}: {results.correct}/{results.total}</p>
          <p className="card-desc">{results.summary}</p>
          <ul className="area-list">
            {results.areas?.map((a) => (
              <li key={a.skill}>{a.skill}: {a.level}</li>
            ))}
          </ul>
        </div>
        <button className="btn-primary" type="button" onClick={getRecommendationAndGo} disabled={submitting}>
          {t('assessment.continue')}
        </button>
      </div>
    );
  }

  return (
    <div className="assessment">
      <p className="eyebrow">{t('assessment.eyebrow')}</p>
      <h1>{t('assessment.title')}</h1>
      <p className="intro">{t('assessment.intro')}</p>

      <div className="question-card">
        <p className="question-meta">
          {t('assessment.question')} {index + 1} {t('assessment.of')} {questions.length}
        </p>
        <h2>{current?.prompt}</h2>
        <div className="option-grid">
          {current?.options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`option-btn ${selected === opt ? 'is-selected' : ''}`}
              onClick={() => selectAnswer(opt)}
              aria-pressed={selected === opt}
            >
              {opt}
            </button>
          ))}
        </div>
        <button
          className="btn-primary"
          type="button"
          onClick={goNext}
          disabled={selected === null || submitting}
        >
          {index === questions.length - 1 ? t('assessment.submit') : t('activity.next')}
        </button>
      </div>
    </div>
  );
}
