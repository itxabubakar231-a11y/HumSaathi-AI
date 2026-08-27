import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';

export default function FeedbackPage() {
  const { sessionId } = useParams();
  const { user } = useUser();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [evaluation, setEvaluation] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [practicingAgain, setPracticingAgain] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      navigate('/setup');
      return;
    }

    // Trigger evaluation on page mount, fetch session in parallel
    Promise.all([
      api.evaluateConversation({ sessionId, userId: user.id }),
      api.getSession(sessionId),
    ])
      .then(([evalData, sessionData]) => {
        setEvaluation(evalData.evaluation);
        setRecommendation(evalData.recommendation);
        setSession(sessionData.session);
      })
      .catch((err) => {
        // Try getting existing evaluation + session separately
        Promise.all([
          api.getEvaluation(sessionId).catch(() => null),
          api.getSession(sessionId).catch(() => null),
        ]).then(([evalData, sessionData]) => {
          if (evalData) setEvaluation(evalData.evaluation || evalData);
          if (sessionData) setSession(sessionData.session);
          if (!evalData) setError(err.message || t('common.error'));
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sessionId, user, navigate, t]);

  const handlePracticeAgain = async () => {
    if (!session || practicingAgain) return;
    setPracticingAgain(true);
    try {
      const res = await api.startConversation({
        userId: user.id,
        scenarioId: session.scenarioId,
        mode: session.mode
      });
      if (res && res.session) {
        navigate(`/conversation/${res.session.id}`);
      }
    } catch (err) {
      setError(err.message || t('common.error'));
      setPracticingAgain(false);
    }
  };

  const handleStartRecommendation = async () => {
    if (!recommendation?.scenarioId) return;
    setLoading(true);
    try {
      const res = await api.startConversation({
        userId: user.id,
        scenarioId: recommendation.scenarioId,
        mode: session?.mode || 'text'
      });
      if (res && res.session) {
        navigate(`/conversation/${res.session.id}`);
      }
    } catch (err) {
      setError(err.message || t('common.error'));
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (error && !evaluation) {
    return (
      <div className="error-card">
        <p className="error-text">{error}</p>
      </div>
    );
  }

  const scores = [
    { label: 'Clarity', value: evaluation?.clarity || 0 },
    { label: 'Relevance', value: evaluation?.relevance || 0 },
    { label: 'Appropriateness', value: evaluation?.appropriateness || 0 },
    { label: 'Communication', value: evaluation?.communication || 0 },
    { label: 'Conversation Flow', value: evaluation?.conversationFlow || 0 },
  ];

  return (
    <div className="feedback-page" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-md)' }}>
        <p className="eyebrow">{t('evaluation.title')}</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: '600' }}>
          {session?.scenario?.title || 'Practice Complete'}
        </h1>
      </div>

      {/* Main Score Circle Hero */}
      <div className="feedback-score-hero">
        <div className="score-circle">
          {evaluation?.overallScore || 0}%
        </div>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: '600' }}>
          {t('evaluation.overallScore')}
        </h3>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '520px', lineHeight: '1.6' }}>
          {evaluation?.feedback}
        </p>
      </div>

      {/* Metrics Breakdown */}
      <section className="dashboard-card" style={{ marginBottom: 'var(--space-md)', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: 'var(--space-md)', fontWeight: '600' }}>
          Breakdown by Skill
        </h3>
        <div className="metric-grid">
          {scores.map((s, idx) => (
            <div key={idx} className="metric-card">
              <span className="metric-label">{s.label}</span>
              <span className="metric-value">{s.value}%</span>
              <div className="metric-bar">
                <div className="metric-bar-fill" style={{ width: `${s.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Strengths & Improvements */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
        {evaluation?.strengths && evaluation.strengths.length > 0 && (
          <section className="dashboard-card" style={{ padding: 'var(--space-md)', borderLeft: '4px solid var(--accent-positive)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ color: 'var(--accent-positive)', fontSize: '1.1rem', marginBottom: 'var(--space-xs)', fontWeight: '600' }}>
              ✅ {t('evaluation.strengths')}
            </h3>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
              {evaluation.strengths.map((str, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>{str}</li>
              ))}
            </ul>
          </section>
        )}

        {evaluation?.improvements && evaluation.improvements.length > 0 && (
          <section className="dashboard-card" style={{ padding: 'var(--space-md)', borderLeft: '4px solid var(--accent-highlight)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ color: 'var(--accent-highlight)', fontSize: '1.1rem', marginBottom: 'var(--space-xs)', fontWeight: '600' }}>
              🎯 {t('evaluation.improvements')}
            </h3>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
              {evaluation.improvements.map((imp, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>{imp}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Try this response */}
      {evaluation?.betterResponse && (
        <section className="dashboard-card" style={{ marginBottom: 'var(--space-md)', padding: 'var(--space-md)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-xs)', fontWeight: '600' }}>
            💡 {t('evaluation.betterResponse')}
          </h3>
          <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            "{evaluation.betterResponse}"
          </p>
        </section>
      )}

      {/* Recommendations */}
      {recommendation && (
        <section className="dashboard-card recommended" style={{ marginBottom: 'var(--space-md)', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)' }}>
          <p className="kicker">{t('evaluation.recommendation')}</p>
          <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-xs)', fontWeight: '600' }}>{recommendation.title}</h3>
          <p className="card-desc" style={{ marginBottom: 'var(--space-sm)' }}>{recommendation.reason}</p>
          <button className="btn-primary" onClick={handleStartRecommendation}>
            {t('evaluation.nextScenario')} →
          </button>
        </section>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)', flexWrap: 'wrap' }}>
        <button className="btn-primary" style={{ flex: 1, minWidth: '180px' }} onClick={handlePracticeAgain} disabled={practicingAgain}>
          {practicingAgain ? t('common.loading') : `🔄 ${t('evaluation.practiceAgain')}`}
        </button>
        <button className="btn-secondary" style={{ flex: 1, minWidth: '180px' }} onClick={() => navigate('/dashboard')}>
          {t('evaluation.backDashboard')}
        </button>
      </div>
    </div>
  );
}
