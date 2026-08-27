import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';

export default function SkillModulePage() {
  const { moduleId } = useParams();
  const { user } = useUser();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [moduleData, setModuleData] = useState(null);
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [customText, setCustomText] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) {
      navigate('/setup');
      return;
    }

    api.getSkillModule(moduleId, user.language)
      .then((data) => {
        if (!data?.module) {
          setError('Module not found');
        } else if (data.module.redirectToScenarios) {
          navigate('/scenarios');
        } else {
          setModuleData(data.module);
        }
      })
      .catch((err) => {
        setError(err.message || t('common.error'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [moduleId, user, navigate, t]);

  const currentScenario = moduleData?.scenarios?.[activeScenarioIdx];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOptionId && !customText.trim()) return;

    setEvaluating(true);
    setError('');

    try {
      const result = await api.evaluateSkillSolution({
        userId: user.id,
        moduleId,
        scenarioId: currentScenario.id,
        optionId: isCustomMode ? null : selectedOptionId,
        customSolution: isCustomMode ? customText.trim() : null,
      });

      setEvaluationResult(result);
    } catch (err) {
      setError(err.message || t('common.error'));
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextScenario = () => {
    setEvaluationResult(null);
    setSelectedOptionId('');
    setCustomText('');
    setIsCustomMode(false);
    if (activeScenarioIdx + 1 < (moduleData?.scenarios?.length || 0)) {
      setActiveScenarioIdx((prev) => prev + 1);
    } else {
      setActiveScenarioIdx(0);
    }
  };

  const handleRetryCurrent = () => {
    setEvaluationResult(null);
    setSelectedOptionId('');
    setCustomText('');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (error && !moduleData) {
    return (
      <div className="error-card">
        <p className="error-text">{error}</p>
      </div>
    );
  }

  if (!currentScenario) {
    return (
      <div className="error-card">
        <p className="error-text">No scenarios available.</p>
      </div>
    );
  }

  return (
    <div className="skill-module-page" style={{ maxWidth: '750px', margin: '0 auto', padding: 'var(--space-md)' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <p className="eyebrow">{moduleData.persona.toUpperCase()} · {t('nav.dashboard')}</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: '600' }}>{moduleData.title}</h1>
        <p className="intro" style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{moduleData.description}</p>
      </div>

      {/* Scenario Selector */}
      {moduleData.scenarios.length > 1 && (
        <div style={{ display: 'flex', gap: 'var(--space-xs)', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
          {moduleData.scenarios.map((s, idx) => (
            <button
              key={s.id}
              className={`btn-secondary ${activeScenarioIdx === idx ? 'btn-primary' : ''}`}
              style={{ padding: '4px 14px', fontSize: '0.85rem', borderRadius: 'var(--radius-full)' }}
              onClick={() => {
                setActiveScenarioIdx(idx);
                setEvaluationResult(null);
                setSelectedOptionId('');
                setCustomText('');
              }}
            >
              Scenario {idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* Main Interactive Card */}
      <div className="dashboard-card" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: '600' }}>{currentScenario.title}</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
            {activeScenarioIdx + 1} of {moduleData.scenarios.length}
          </span>
        </div>

        {/* Reading Passage / Material (if present) */}
        {currentScenario.passage && (
          <div style={{ backgroundColor: 'rgba(124, 111, 159, 0.08)', border: '1px solid rgba(124, 111, 159, 0.2)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)', fontSize: '1.05rem', lineHeight: '1.75' }}>
            <p style={{ fontWeight: '600', color: 'var(--interactive-primary)', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
              📄 Reading Material / Passage
            </p>
            <p style={{ margin: 0, fontStyle: 'italic' }}>{currentScenario.passage}</p>
          </div>
        )}

        {/* Vocabulary Focus (if present) */}
        {currentScenario.vocabulary && (
          <div style={{ backgroundColor: '#f0f9f4', border: '1px solid var(--accent-positive)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)', fontSize: '0.95rem' }}>
            <p style={{ fontWeight: '600', color: 'var(--accent-positive)', margin: 0 }}>
              💡 {currentScenario.vocabulary}
            </p>
          </div>
        )}

        {/* Situation / Task */}
        <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)', fontSize: '1rem', lineHeight: '1.6' }}>
          <p style={{ margin: 0 }}><strong>📖 Situation / Task:</strong> {currentScenario.situation}</p>
        </div>

        <p style={{ fontWeight: '600', marginBottom: 'var(--space-sm)', fontSize: '1.05rem' }}>
          🎯 {currentScenario.prompt}
        </p>

        {/* Options / Form */}
        {!evaluationResult ? (
          <form onSubmit={handleSubmit}>
            {!isCustomMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', marginBottom: 'var(--space-md)' }}>
                {currentScenario.options.map((opt) => (
                  <label
                    key={opt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--space-sm)',
                      padding: 'var(--space-sm) var(--space-md)',
                      borderRadius: 'var(--radius-md)',
                      border: selectedOptionId === opt.id ? '2px solid var(--interactive-primary)' : '1px solid var(--border-color)',
                      backgroundColor: selectedOptionId === opt.id ? 'var(--interactive-active)' : 'var(--bg-primary)',
                      cursor: 'pointer',
                      transition: 'var(--transition-soft)',
                    }}
                  >
                    <input
                      type="radio"
                      name="scenario_option"
                      value={opt.id}
                      checked={selectedOptionId === opt.id}
                      onChange={() => setSelectedOptionId(opt.id)}
                      style={{ marginTop: '4px' }}
                    />
                    <span style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>{opt.text}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <textarea
                  rows={4}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Explain how you would handle this situation..."
                  style={{ width: '100%', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-color)', fontFamily: 'inherit', fontSize: '0.95rem' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
              <button
                type="button"
                className="text-btn"
                onClick={() => setIsCustomMode(!isCustomMode)}
                style={{ fontSize: '0.85rem' }}
              >
                {isCustomMode ? '← Choose from suggested options' : '✏️ Write your own solution instead'}
              </button>

              <button
                type="submit"
                className="btn-primary"
                disabled={evaluating || (!selectedOptionId && !customText.trim())}
              >
                {evaluating ? t('common.loading') : 'Submit & Analyze ✨'}
              </button>
            </div>
          </form>
        ) : (
          /* Feedback View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {/* Score Banner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', backgroundColor: evaluationResult.score >= 80 ? '#f0f9f4' : '#fff9f0', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '2rem' }}>{evaluationResult.score >= 80 ? '🌟' : '💡'}</span>
              <div>
                <h3 style={{ fontSize: '1.1rem', margin: 0, color: evaluationResult.score >= 80 ? 'var(--accent-positive)' : 'var(--accent-highlight)' }}>
                  {evaluationResult.score >= 80 ? 'Effective Solution' : 'Learning Opportunity'} ({evaluationResult.score}%)
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {evaluationResult.feedback}
                </p>
              </div>
            </div>

            {/* Consequences Analysis */}
            {evaluationResult.consequences && (
              <div style={{ padding: 'var(--space-sm) var(--space-md)', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '4px', color: 'var(--text-primary)' }}>🔍 Likely Outcomes & Consequences:</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>{evaluationResult.consequences}</p>
              </div>
            )}

            {/* Better Approach */}
            {evaluationResult.betterApproach && (
              <div style={{ padding: 'var(--space-sm) var(--space-md)', backgroundColor: 'var(--interactive-active)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '4px', color: 'var(--interactive-primary)' }}>💡 Recommended Pro Tip:</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>{evaluationResult.betterApproach}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)', flexWrap: 'wrap' }}>
              <button className="btn-secondary" onClick={handleRetryCurrent}>
                🔄 Try Again
              </button>
              {moduleData.scenarios.length > 1 && (
                <button className="btn-primary" onClick={handleNextScenario}>
                  Next Scenario ➔
                </button>
              )}
              <button className="btn-outline" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
