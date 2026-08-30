import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';

export default function SkillModulePage() {
  const { moduleId } = useParams();
  const { user } = useUser();
  const { t, language } = useI18n();
  const navigate = useNavigate();

  const [moduleData, setModuleData] = useState(null);
  const [activeDifficulty, setActiveDifficulty] = useState('all');
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [customText, setCustomText] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [completedScenarios, setCompletedScenarios] = useState({});
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [error, setError] = useState('');

  const loadModule = (diff = null) => {
    setLoading(true);
    setError('');
    api.getSkillModule(moduleId, user?.language, diff === 'all' ? null : diff)
      .then((data) => {
        if (!data?.module) {
          setError('Module not found');
        } else if (data.module.redirectToScenarios) {
          navigate('/scenarios');
        } else {
          setModuleData(data.module);
          setActiveScenarioIdx(0);
          setEvaluationResult(null);
          setSelectedOptionId('');
          setCustomText('');
        }
      })
      .catch((err) => {
        setError(err.message || t('common.error'));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!user?.id) {
      navigate('/setup');
      return;
    }
    loadModule(activeDifficulty);
  }, [moduleId, user, navigate, activeDifficulty]);

  const scenarios = moduleData?.scenarios || [];
  const currentScenario = scenarios[activeScenarioIdx];

  const handleDifficultyChange = (diff) => {
    setActiveDifficulty(diff);
    setCompletedScenarios({});
    setShowCompletionModal(false);
  };

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
      setCompletedScenarios((prev) => ({
        ...prev,
        [currentScenario.id]: result.score,
      }));
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
    if (activeScenarioIdx + 1 < scenarios.length) {
      setActiveScenarioIdx((prev) => prev + 1);
    } else {
      setShowCompletionModal(true);
    }
  };

  const handleRetryCurrent = () => {
    setEvaluationResult(null);
    setSelectedOptionId('');
    setCustomText('');
  };

  const calculateOverallScore = () => {
    const scores = Object.values(completedScenarios);
    if (scores.length === 0) return 0;
    const total = scores.reduce((sum, s) => sum + s, 0);
    return Math.round(total / scores.length);
  };

  if (loading && !moduleData) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (error && !moduleData) {
    return (
      <div className="error-card" style={{ maxWidth: '600px', margin: 'var(--space-xl) auto', padding: 'var(--space-lg)' }}>
        <p className="error-text">{error}</p>
        <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ marginTop: 'var(--space-md)' }}>
          {language === 'ur' ? 'ڈیش بورڈ پر واپس جائیں' : language === 'ur_rm' ? 'Dashboard Par Wapis Jayein' : 'Back to Dashboard'}
        </button>
      </div>
    );
  }

  if (!currentScenario) {
    return (
      <div className="error-card" style={{ maxWidth: '600px', margin: 'var(--space-xl) auto', padding: 'var(--space-lg)' }}>
        <p>{language === 'ur' ? 'اس درجے کے لیے کوئی منظر نامہ دستیاب نہیں ہے۔' : language === 'ur_rm' ? 'Is level ke liye scenarios available nahi hain.' : 'No scenarios available for this difficulty level.'}</p>
        <button className="btn-primary" onClick={() => handleDifficultyChange('all')} style={{ marginTop: 'var(--space-md)' }}>
          {language === 'ur' ? 'تمام منظرنامے دیکھیں' : language === 'ur_rm' ? 'View All Scenarios' : 'View All Scenarios'}
        </button>
      </div>
    );
  }

  const progressPercent = Math.round(((activeScenarioIdx + 1) / scenarios.length) * 100);

  return (
    <div className="skill-module-page" style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--space-md) var(--space-sm)' }}>
      {/* Top Header Breadcrumb */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <p className="eyebrow" style={{ margin: 0 }}>
            {moduleData.persona.toUpperCase()} · {t('nav.dashboard')} · {moduleData.skillKey.replace(/_/g, ' ').toUpperCase()}
          </p>
          <button className="text-btn" onClick={() => navigate('/dashboard')} style={{ fontSize: '0.9rem' }}>
            ← {language === 'ur' ? 'ڈیش بورڈ' : language === 'ur_rm' ? 'Dashboard' : 'Dashboard'}
          </button>
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: '600', margin: '4px 0' }}>
          {moduleData.title}
        </h1>
        <p className="intro" style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          {moduleData.description}
        </p>
      </div>

      {/* Difficulty Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-md)', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          ⚡ {language === 'ur' ? 'درجہ بندی' : language === 'ur_rm' ? 'Difficulty' : 'Difficulty'}:
        </span>
        {[
          { id: 'all', label: language === 'ur' ? 'تمام' : language === 'ur_rm' ? 'All' : 'All' },
          { id: 'easy', label: language === 'ur' ? 'آسان (Easy)' : language === 'ur_rm' ? 'Easy' : 'Easy' },
          { id: 'medium', label: language === 'ur' ? 'متوسط (Medium)' : language === 'ur_rm' ? 'Medium' : 'Medium' },
          { id: 'challenging', label: language === 'ur' ? 'چیلنجنگ (Challenging)' : language === 'ur_rm' ? 'Challenging' : 'Challenging' },
        ].map((diff) => (
          <button
            key={diff.id}
            type="button"
            className={`btn-secondary ${activeDifficulty === diff.id ? 'btn-primary' : ''}`}
            style={{ padding: '4px 14px', fontSize: '0.85rem', borderRadius: 'var(--radius-full)' }}
            onClick={() => handleDifficultyChange(diff.id)}
          >
            {diff.label}
          </button>
        ))}
      </div>

      {/* Visual Progress Bar & Question Counter */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          <span>
            {language === 'ur'
              ? `سوال ${activeScenarioIdx + 1} از ${scenarios.length}`
              : language === 'ur_rm'
              ? `Question ${activeScenarioIdx + 1} of ${scenarios.length}`
              : `Scenario ${activeScenarioIdx + 1} of ${scenarios.length}`}
          </span>
          <span style={{ textTransform: 'uppercase', color: currentScenario.difficulty === 'challenging' ? '#e53e3e' : currentScenario.difficulty === 'medium' ? '#dd6b20' : '#38a169' }}>
            ● {currentScenario.difficulty || 'Easy'}
          </span>
        </div>
        <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '9999px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, var(--interactive-primary), #6366f1)',
              transition: 'width 0.4s ease-in-out',
            }}
          />
        </div>
      </div>

      {/* Completion Modal / State */}
      {showCompletionModal ? (
        <div className="dashboard-card" style={{ backgroundColor: 'var(--bg-secondary)', border: '2px solid var(--interactive-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-xs)' }}>🎉</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
            {language === 'ur' ? 'ماڈیول مکمل ہو گیا!' : language === 'ur_rm' ? 'Module Complete!' : 'Module Complete!'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto var(--space-md)' }}>
            {language === 'ur'
              ? `آپ نے تمام منظرنامے مکمل کر لیے ہیں۔ آپ کی اوسط درستگی ${calculateOverallScore()}% ہے۔`
              : language === 'ur_rm'
              ? `Aap ne tamam scenarios complete kar liye. Average score: ${calculateOverallScore()}%.`
              : `You have successfully completed all scenarios in this module with an average score of ${calculateOverallScore()}%.`}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>
              {language === 'ur' ? 'ڈیش بورڈ پر جائیں' : language === 'ur_rm' ? 'Dashboard Jayein' : 'Go to Dashboard'} ➔
            </button>
            <button className="btn-secondary" onClick={() => { setShowCompletionModal(false); setActiveScenarioIdx(0); }}>
              🔄 {language === 'ur' ? 'دوبارہ مشق کریں' : language === 'ur_rm' ? 'Practice Again' : 'Practice Again'}
            </button>
          </div>
        </div>
      ) : (
        /* Main Interactive Question Card */
        <div className="dashboard-card" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)', flexWrap: 'wrap', gap: '6px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--text-primary)', fontWeight: '600', margin: 0 }}>
              {currentScenario.title}
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
              {currentScenario.category?.replace(/_/g, ' ').toUpperCase() || 'PRACTICE'}
            </span>
          </div>

          {/* Reading Passage / Functional Material */}
          {currentScenario.passage && (
            <div style={{ backgroundColor: 'rgba(124, 111, 159, 0.08)', border: '1px solid rgba(124, 111, 159, 0.25)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)', fontSize: '1.02rem', lineHeight: '1.75' }}>
              <p style={{ fontWeight: '700', color: 'var(--interactive-primary)', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '0.05em' }}>
                📄 {language === 'ur' ? 'مطالعہ کا مواد / نوٹس' : language === 'ur_rm' ? 'Reading Material / Notice' : 'Reading Material / Notice'}
              </p>
              <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-primary)' }}>{currentScenario.passage}</p>
            </div>
          )}

          {/* Vocabulary Focus */}
          {currentScenario.vocabulary && (
            <div style={{ backgroundColor: 'rgba(56, 161, 105, 0.1)', border: '1px solid var(--accent-positive)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)', fontSize: '0.95rem' }}>
              <p style={{ fontWeight: '600', color: 'var(--accent-positive)', margin: 0 }}>
                💡 {currentScenario.vocabulary}
              </p>
            </div>
          )}

          {/* Situation / Task */}
          <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)', fontSize: '1rem', lineHeight: '1.6' }}>
            <p style={{ margin: 0 }}>
              <strong>📖 {language === 'ur' ? 'صورتحال / منظرنامہ:' : language === 'ur_rm' ? 'Situation / Task:' : 'Situation / Task:'}</strong> {currentScenario.situation}
            </p>
          </div>

          <p style={{ fontWeight: '600', marginBottom: 'var(--space-sm)', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
            🎯 {currentScenario.prompt}
          </p>

          {/* Options / Form */}
          {!evaluationResult ? (
            <form onSubmit={handleSubmit}>
              {!isCustomMode ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', marginBottom: 'var(--space-md)' }}>
                  {currentScenario.options.map((opt, idx) => (
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
                      <span style={{ fontWeight: 700, color: 'var(--interactive-primary)', minWidth: '1.4rem', fontSize: '0.95rem' }}>
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <span style={{ fontSize: '0.96rem', lineHeight: '1.5', color: 'var(--text-primary)' }}>{opt.text}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <textarea
                    rows={4}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder={language === 'ur' ? 'وضاحت کریں کہ آپ اس صورتحال میں کیا کریں گے...' : language === 'ur_rm' ? 'Apna solution likhein...' : 'Explain how you would handle this situation...'}
                    style={{ width: '100%', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-color)', fontFamily: 'inherit', fontSize: '0.95rem' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => setIsCustomMode(!isCustomMode)}
                  style={{ fontSize: '0.88rem' }}
                >
                  {isCustomMode
                    ? (language === 'ur' ? '← دیے گئے اختیارات میں سے منتخب کریں' : language === 'ur_rm' ? '← Choose from options' : '← Choose from suggested options')
                    : (language === 'ur' ? '✏️ اپنا جواب خود تحریر کریں' : language === 'ur_rm' ? '✏️ Write custom solution' : '✏️ Write your own solution instead')}
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={evaluating || (!selectedOptionId && !customText.trim())}
                >
                  {evaluating
                    ? t('common.loading')
                    : (language === 'ur' ? 'تجزیہ حاصل کریں ✨' : language === 'ur_rm' ? 'Analyze Solution ✨' : 'Submit & Analyze ✨')}
                </button>
              </div>
            </form>
          ) : (
            /* Feedback and Consequence View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {/* Score Banner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', backgroundColor: evaluationResult.score >= 80 ? 'rgba(56, 161, 105, 0.12)' : 'rgba(221, 107, 32, 0.12)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '2rem' }}>{evaluationResult.score >= 80 ? '🌟' : '💡'}</span>
                <div>
                  <h3 style={{ fontSize: '1.1rem', margin: 0, color: evaluationResult.score >= 80 ? 'var(--accent-positive)' : 'var(--accent-highlight)' }}>
                    {evaluationResult.score >= 80
                      ? (language === 'ur' ? 'بہترین فیصلہ / جواب!' : language === 'ur_rm' ? 'Effective Solution!' : 'Effective Solution!')
                      : (language === 'ur' ? 'سیکھنے کا موقع' : language === 'ur_rm' ? 'Learning Opportunity' : 'Learning Opportunity')} ({evaluationResult.score}%)
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {evaluationResult.feedback}
                  </p>
                </div>
              </div>

              {/* Consequences Analysis */}
              {evaluationResult.consequences && (
                <div style={{ padding: 'var(--space-sm) var(--space-md)', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '4px', color: 'var(--text-primary)' }}>
                    🔍 {language === 'ur' ? 'امکانی نتائج اور اثرات:' : language === 'ur_rm' ? 'Likely Outcomes & Consequences:' : 'Likely Outcomes & Consequences:'}
                  </h4>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: 0 }}>{evaluationResult.consequences}</p>
                </div>
              )}

              {/* Better Approach */}
              {evaluationResult.betterApproach && (
                <div style={{ padding: 'var(--space-sm) var(--space-md)', backgroundColor: 'var(--interactive-active)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '4px', color: 'var(--interactive-primary)' }}>
                    💡 {language === 'ur' ? 'بہترین طریقہ کار اور مشورہ:' : language === 'ur_rm' ? 'Recommended Pro Tip:' : 'Recommended Pro Tip:'}
                  </h4>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', margin: 0 }}>{evaluationResult.betterApproach}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)', flexWrap: 'wrap' }}>
                <button className="btn-secondary" onClick={handleRetryCurrent}>
                  🔄 {language === 'ur' ? 'دوبارہ کوشش کریں' : language === 'ur_rm' ? 'Try Again' : 'Try Again'}
                </button>
                <button className="btn-primary" onClick={handleNextScenario}>
                  {activeScenarioIdx + 1 < scenarios.length
                    ? (language === 'ur' ? 'اگلا منظر نامہ ➔' : language === 'ur_rm' ? 'Next Scenario ➔' : 'Next Scenario ➔')
                    : (language === 'ur' ? 'ماڈیول مکمل کریں ➔' : language === 'ur_rm' ? 'Complete Module ➔' : 'Complete Module ➔')}
                </button>
                <button className="btn-outline" onClick={() => navigate('/dashboard')}>
                  {language === 'ur' ? 'ڈیش بورڈ پر واپس جائیں' : language === 'ur_rm' ? 'Back to Dashboard' : 'Back to Dashboard'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
