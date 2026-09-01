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
    <div className="feedback-page" dir={isRtl ? 'rtl' : 'ltr'} style={{ maxWidth: '820px', margin: '0 auto', padding: 'var(--space-md) var(--space-sm)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
        <span className="eyebrow" style={{ color: 'var(--primary-green)', fontWeight: 800, letterSpacing: '0.08em' }}>
          {t('evaluation.snapshotTitle') || 'Your Communication Snapshot'}
        </span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
          {scenarioTitle}
        </h1>
      </div>

      {/* Main Score Hero Card */}
      <div className="feedback-score-hero" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '2rem 1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="score-circle" style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--gradient-primary)', color: '#fff', fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(11, 107, 58, 0.25)', marginBottom: '1rem' }}>
          {evaluation?.overallScore || 0}%
        </div>
        <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', fontWeight: '700', marginBottom: '0.5rem' }}>
          {t('evaluation.overallScore') || 'Overall Score'}
        </h3>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '560px', lineHeight: '1.65', fontSize: '1rem', margin: 0 }}>
          {evaluation?.feedback || 'Great effort in completing this conversation scenario! Continue practicing to build confidence and natural conversational flow.'}
        </p>
      </div>

      {/* Real Metrics Breakdown */}
      <section className="dashboard-card" style={{ marginBottom: '1.5rem', padding: '1.75rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
          📊 {t('evaluation.breakdownTitle')}
        </h3>
        <div className="metric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {scores.map((s, idx) => (
            <div key={idx} className="metric-card" style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="metric-label" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s.label}</span>
                <span className="metric-value" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-green)' }}>{s.value}%</span>
              </div>
              <div className="metric-bar" style={{ height: '8px', background: 'rgba(0, 0, 0, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div className="metric-bar-fill" style={{ width: `${Math.max(8, Math.min(100, s.value))}%`, height: '100%', background: 'var(--gradient-primary)', borderRadius: '9999px' }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Strengths & Improvements */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {evaluation?.strengths && evaluation.strengths.length > 0 && (
          <section className="dashboard-card" style={{ padding: '1.5rem', borderInlineStart: '4px solid var(--primary-green)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderInlineStartWidth: '4px' }}>
            <h3 style={{ color: 'var(--primary-green)', fontSize: '1.15rem', marginBottom: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              ✅ {t('evaluation.whatYouDidWell') || 'What you did well'}
            </h3>
            <ul style={{ paddingInlineStart: '1.2rem', fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
              {evaluation.strengths.map((str, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>{str}</li>
              ))}
            </ul>
          </section>
        )}

        {evaluation?.improvements && evaluation.improvements.length > 0 && (
          <section className="dashboard-card" style={{ padding: '1.5rem', borderInlineStart: '4px solid #8b5cf6', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderInlineStartWidth: '4px' }}>
            <h3 style={{ color: '#7c3aed', fontSize: '1.15rem', marginBottom: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              🎯 {t('evaluation.nextOpportunity') || 'Your next opportunity'}
            </h3>
            <ul style={{ paddingInlineStart: '1.2rem', fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
              {evaluation.improvements.map((imp, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>{imp}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Better Response Recommendation */}
      {evaluation?.betterResponse && (
        <section className="dashboard-card" style={{ marginBottom: '1.5rem', padding: '1.5rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-green)', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            💡 {t('evaluation.betterResponse')}
          </h4>
          <blockquote style={{ fontStyle: 'italic', color: 'var(--text-primary)', margin: 0, paddingInlineStart: '1rem', borderInlineStart: '3px solid var(--primary-green)', fontSize: '1.05rem', lineHeight: '1.55' }}>
            "{evaluation.betterResponse}"
          </blockquote>
        </section>
      )}

      {/* Next Recommendation Card */}
      {recommendation && (
        <section className="dashboard-card" style={{ marginBottom: '1.5rem', padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--light-green-surface)', border: '1px solid rgba(11, 107, 58, 0.2)' }}>
          <span className="eyebrow" style={{ color: 'var(--primary-green)', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.06em' }}>
            🚀 {t('evaluation.recommendedPractice') || 'Recommended practice'}
          </span>
          <h4 style={{ fontSize: '1.25rem', marginTop: '0.35rem', marginBottom: '0.35rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
            {getLocalizedText(recommendation.title, language, recommendation.title)}
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: '1.5' }}>
            {recommendation.reason}
          </p>
          <button className="btn-primary" onClick={handleStartRecommendation} style={{ fontSize: '0.95rem', padding: '0.65rem 1.35rem' }}>
            {t('evaluation.nextScenario')} ➔
          </button>
        </section>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={handlePracticeAgain} disabled={practicingAgain} style={{ padding: '0.75rem 1.6rem', fontSize: '0.95rem' }}>
          🔄 {t('evaluation.practiceAgain')}
        </button>
        <button className="btn-secondary" onClick={() => navigate('/scenarios')} style={{ padding: '0.75rem 1.4rem', fontSize: '0.95rem' }}>
          💬 {t('nav.scenarios')}
        </button>
        <button className="btn-secondary" onClick={() => navigate('/dashboard')} style={{ padding: '0.75rem 1.4rem', fontSize: '0.95rem' }}>
          📊 {t('evaluation.backDashboard')}
        </button>
      </div>
    </div>
  );
}
