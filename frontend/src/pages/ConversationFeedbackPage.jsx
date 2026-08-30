import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';

function getLocalizedText(val, lang, fallback = '') {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return val[lang] || val.en || val.ur || val.ur_rm || fallback;
  }
  return String(val);
}

export default function FeedbackPage() {
  const { sessionId } = useParams();
  const { user } = useUser();
  const { t, language } = useI18n();
  const navigate = useNavigate();

  const [evaluation, setEvaluation] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [practicingAgain, setPracticingAgain] = useState(false);

  const isRtl = language === 'ur';

  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }

    Promise.all([
      api.evaluateConversation({ sessionId, userId: user.id }),
      api.getSession(sessionId),
    ])
      .then(([evalData, sessionData]) => {
        setEvaluation(evalData?.evaluation || evalData);
        setRecommendation(evalData?.recommendation || null);
        setSession(sessionData?.session || sessionData);
      })
      .catch((err) => {
        Promise.all([
          api.getEvaluation(sessionId).catch(() => null),
          api.getSession(sessionId).catch(() => null),
        ]).then(([evalData, sessionData]) => {
          if (evalData) setEvaluation(evalData.evaluation || evalData);
          if (sessionData) setSession(sessionData.session || sessionData);
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
        mode: session.mode || 'text',
      });
      if (res && (res.session || res.id)) {
        const nextId = res.session?.id || res.id;
        navigate(`/conversation/${nextId}`);
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
        mode: session?.mode || 'text',
      });
      if (res && (res.session || res.id)) {
        const nextId = res.session?.id || res.id;
        navigate(`/conversation/${nextId}`);
      }
    } catch (err) {
      setError(err.message || t('common.error'));
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="loading-spinner" />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (error && !evaluation) {
    return (
      <div className="error-card" dir={isRtl ? 'rtl' : 'ltr'} style={{ maxWidth: '600px', margin: 'var(--space-xl) auto', padding: 'var(--space-lg)' }}>
        <p className="error-text">{error}</p>
        <button className="btn-primary" onClick={() => navigate('/scenarios')} style={{ marginTop: 'var(--space-md)' }}>
          ← {t('conversation.backToScenarios')}
        </button>
      </div>
    );
  }

  const scores = [
    { label: t('evaluation.clarity'), value: evaluation?.clarity || 0 },
    { label: t('evaluation.relevance'), value: evaluation?.relevance || 0 },
    { label: t('evaluation.appropriateness'), value: evaluation?.appropriateness || 0 },
    { label: t('evaluation.communication'), value: evaluation?.communication || 0 },
    { label: t('evaluation.conversationFlow'), value: evaluation?.conversationFlow || 0 },
  ];

  const scenarioTitle = getLocalizedText(session?.scenario?.title, language, t('scenarios.title'));

  return (
    <div className="feedback-page" dir={isRtl ? 'rtl' : 'ltr'} style={{ maxWidth: '720px', margin: '0 auto', padding: 'var(--space-md) var(--space-sm)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-md)' }}>
        <p className="eyebrow">{t('evaluation.title')}</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: '600' }}>
          {scenarioTitle}
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
          {t('evaluation.breakdownTitle')}
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
          <section className="dashboard-card" style={{ padding: 'var(--space-md)', borderInlineStart: '4px solid var(--accent-positive)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ color: 'var(--accent-positive)', fontSize: '1.1rem', marginBottom: 'var(--space-xs)', fontWeight: '600' }}>
              ✅ {t('evaluation.strengths')}
            </h3>
            <ul style={{ paddingInlineStart: '1.2rem', fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
              {evaluation.strengths.map((str, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>{str}</li>
              ))}
            </ul>
          </section>
        )}

        {evaluation?.improvements && evaluation.improvements.length > 0 && (
          <section className="dashboard-card" style={{ padding: 'var(--space-md)', borderInlineStart: '4px solid var(--accent-highlight)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ color: 'var(--accent-highlight)', fontSize: '1.1rem', marginBottom: 'var(--space-xs)', fontWeight: '600' }}>
              🎯 {t('evaluation.improvements')}
            </h3>
            <ul style={{ paddingInlineStart: '1.2rem', fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
              {evaluation.improvements.map((imp, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>{imp}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Better Response Recommendation */}
      {evaluation?.betterResponse && (
        <section className="dashboard-card" style={{ marginBottom: 'var(--space-md)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
          <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-xs)' }}>
            💡 {t('evaluation.betterResponse')}
          </h4>
          <blockquote style={{ fontStyle: 'italic', color: 'var(--text-primary)', margin: 0, paddingInlineStart: '0.75rem', borderInlineStart: '3px solid var(--accent-primary)', fontSize: '1rem', lineHeight: '1.5' }}>
            "{evaluation.betterResponse}"
          </blockquote>
        </section>
      )}

      {/* Next Recommendation Card */}
      {recommendation && (
        <section className="dashboard-card" style={{ marginBottom: 'var(--space-md)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
          <span className="eyebrow" style={{ color: 'var(--accent-primary)', fontSize: '0.8rem' }}>
            🚀 {t('evaluation.recommendation')}
          </span>
          <h4 style={{ fontSize: '1.15rem', marginTop: '0.2rem', marginBottom: '0.25rem', fontWeight: '600' }}>
            {getLocalizedText(recommendation.title, language, recommendation.title)}
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--space-sm)' }}>
            {recommendation.reason}
          </p>
          <button className="btn-primary" onClick={handleStartRecommendation} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
            {t('evaluation.nextScenario')} ➔
          </button>
        </section>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center', marginTop: 'var(--space-lg)', flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={handlePracticeAgain} disabled={practicingAgain}>
          🔄 {t('evaluation.practiceAgain')}
        </button>
        <button className="btn-secondary" onClick={() => navigate('/scenarios')}>
          💬 {t('nav.scenarios')}
        </button>
        <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
          📊 {t('evaluation.backDashboard')}
        </button>
      </div>
    </div>
  );
}
