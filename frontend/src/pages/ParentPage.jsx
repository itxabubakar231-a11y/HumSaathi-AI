import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';

export default function ParentPage() {
  const { user } = useUser();
  const { t, language } = useI18n();
  const [pin, setPin] = useState('');
  const [view, setView] = useState(null);
  const [error, setError] = useState('');

  const loadView = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { parentView } = await api.getParentView(user.id, pin);
      setView(parentView);
    } catch (err) {
      setError(err.message || t('common.error'));
    }
  };

  const getPersonaBadge = (p) => {
    switch (p) {
      case 'child': return { label: t('persona.child'), icon: '', color: '#F59E0B' };
      case 'teen': return { label: t('persona.teen'), icon: '', color: '#8B5CF6' };
      case 'adult': return { label: t('persona.adult'), icon: '', color: '#0EA5E9' };
      default: return { label: t('persona.child'), icon: '', color: '#10B981' };
    }
  };

  if (!user) return <p>{t('common.error')}</p>;

  const personaInfo = getPersonaBadge(view?.learner?.persona || user.persona);

  return (
    <div className="parent-page">
      <p className="eyebrow">{t('parent.title')}</p>
      <h1>{t('parent.title')}</h1>
      <p className="intro">{t('parent.intro')}</p>

      {!view ? (
        <form onSubmit={loadView} className="pin-form">
          <label>
            {t('parent.pin')}
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={8}
              placeholder="1234"
            />
          </label>
          {error && <p className="error-text">{error}</p>}
          <button className="btn-primary" type="submit">{t('parent.view')}</button>
        </form>
      ) : (
        <div className="parent-view">
          {/* Learner & Active Portal Header Card */}
          <section className="dashboard-card parent-learner-card">
            <div className="parent-card-header">
              <h2>{t('parent.learner')}</h2>
              <span
                className="persona-tag"
                style={{ backgroundColor: `${personaInfo.color}18`, color: personaInfo.color, border: `1.5px solid ${personaInfo.color}40`, padding: '0.25rem 0.75rem', borderRadius: '9999px', fontWeight: 800 }}
              >
                {personaInfo.icon} {personaInfo.label} Portal
              </span>
            </div>
            <p className="learner-meta-text">
              <strong>{view.learner.name}</strong> · {t(`lang.${view.learner.language}`) || view.learner.language}
            </p>
            <div className="parent-stats-inline" style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <div><strong>{t('progress.level')}:</strong> {view.currentLevel}</div>
              <div><strong>{t('progress.completed')}:</strong> {view.completedCount}</div>
              <div><strong>{t('progress.accuracy')}:</strong> {view.avgAccuracy}%</div>
            </div>
          </section>

          {/* Evidence-Based Strengths for Current Persona */}
          <section className="dashboard-card">
            <h2> {t('parent.strengths')}</h2>
            {view.strengths?.length > 0 ? (
              <ul className="strengths-list-chips" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', listStyle: 'none', padding: 0 }}>
                {view.strengths.map((str, idx) => (
                  <li key={idx} style={{ background: '#D1FAE5', color: '#065F46', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.92rem' }}>
                    ✓ {str}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted-text">— {t('common.empty')}</p>
            )}
          </section>

          {/* Areas for Growth / Practice for Current Persona */}
          <section className="dashboard-card">
            <h2> {t('parent.needsPractice')}</h2>
            {view.needsPractice?.length > 0 ? (
              <ul className="practice-list-chips" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', listStyle: 'none', padding: 0 }}>
                {view.needsPractice.map((np, idx) => (
                  <li key={idx} style={{ background: '#FEF3C7', color: '#92400E', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.92rem' }}>
                     {np}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted-text">— {t('common.empty')}</p>
            )}
          </section>

          {/* Persona Skill Breakdown Meters */}
          {view.progress?.length > 0 && (
            <section className="dashboard-card">
              <h2> {t('parent.skillsBreakdown')}</h2>
              <div className="skills-meter-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                {view.progress.map((p, idx) => (
                  <div key={idx} className="skill-meter-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '0.25rem' }}>
                      <span>{p.skill.replace('_', ' ').toUpperCase()}</span>
                      <span>{p.accuracy}%</span>
                    </div>
                    <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.max(5, Math.min(100, p.accuracy))}%`, height: '100%', background: '#10B981', borderRadius: '9999px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Persona-Specific Recent History */}
          <section className="dashboard-card">
            <h2> {t('progress.recent')}</h2>
            {view.recentAttempts?.length > 0 ? (
              <ul className="recent-list" style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
                {view.recentAttempts.map((a, i) => (
                  <li key={i} style={{ marginBottom: '0.4rem' }}>
                    <strong>{a.title}</strong> — {a.score}% {language === 'ur' ? 'اسکور' : 'score'}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted-text">{t('parent.noAttempts')}</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
