import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';
import { ShieldIcon, CheckIcon, SparklesIcon, LockIcon } from '../components/ui/Icons';

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
      case 'child': return { label: t('persona.child'), color: '#0B6B3A' };
      case 'teen': return { label: t('persona.teen'), color: '#7C3AED' };
      case 'adult': return { label: t('persona.adult'), color: '#0284C7' };
      default: return { label: t('persona.child'), color: '#0B6B3A' };
    }
  };

  if (!user) return <p>{t('common.error')}</p>;

  const personaInfo = getPersonaBadge(view?.learner?.persona || user.persona);

  return (
    <div className="parent-page" style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--space-md) var(--space-sm)' }}>
      <p className="eyebrow">{t('parent.title')}</p>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', marginBottom: '0.5rem' }}>{t('parent.title')}</h1>
      <p className="intro" style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{t('parent.intro')}</p>

      {!view ? (
        <form onSubmit={loadView} className="pin-form dashboard-card" style={{ maxWidth: '420px', padding: '2rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <LockIcon size={16} /> {t('parent.pin')}
            </span>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={8}
              placeholder="1234"
              className="auth-text-input"
              style={{ fontSize: '1.2rem', letterSpacing: '0.2em', textAlign: 'center' }}
            />
          </label>
          {error && <p className="error-text" style={{ marginTop: '0.75rem', fontSize: '0.88rem' }}>{error}</p>}
          <button className="btn-primary" type="submit" style={{ width: '100%', marginTop: '1.25rem' }}>
            {t('parent.view')}
          </button>
        </form>
      ) : (
        <div className="parent-view" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Learner & Active Portal Header Card */}
          <section className="dashboard-card parent-learner-card" style={{ padding: '1.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
            <div className="parent-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{t('parent.learner')}</h2>
              <span
                className="persona-tag"
                style={{ backgroundColor: `${personaInfo.color}15`, color: personaInfo.color, border: `1.5px solid ${personaInfo.color}40`, padding: '0.25rem 0.75rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.85rem' }}
              >
                {personaInfo.label} Portal
              </span>
            </div>
            <p className="learner-meta-text" style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              <strong>{view.learner.name}</strong> · {t(`lang.${view.learner.language}`) || view.learner.language}
            </p>
            <div className="parent-stats-inline" style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', flexWrap: 'wrap', fontSize: '0.92rem' }}>
              <div><strong>{t('progress.level')}:</strong> {view.currentLevel}</div>
              <div><strong>{t('progress.completed')}:</strong> {view.completedCount}</div>
              <div><strong>{t('progress.accuracy')}:</strong> {view.avgAccuracy}%</div>
            </div>
          </section>

          {/* Evidence-Based Strengths for Current Persona */}
          <section className="dashboard-card" style={{ padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0B6B3A' }}>
              <CheckIcon size={18} />
              <span>{t('parent.strengths')}</span>
            </h2>
            {view.strengths?.length > 0 ? (
              <ul className="strengths-list-chips" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', listStyle: 'none', padding: 0 }}>
                {view.strengths.map((str, idx) => (
                  <li key={idx} style={{ background: '#E8F7F0', color: '#0B6B3A', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontWeight: 600, fontSize: '0.88rem' }}>
                    ✓ {str}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted-text">— {t('common.empty')}</p>
            )}
          </section>

          {/* Areas for Growth / Practice for Current Persona */}
          <section className="dashboard-card" style={{ padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#7C3AED' }}>
              <SparklesIcon size={18} />
              <span>{t('parent.needsPractice')}</span>
            </h2>
            {view.needsPractice?.length > 0 ? (
              <ul className="needs-practice-list-chips" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', listStyle: 'none', padding: 0 }}>
                {view.needsPractice.map((np, idx) => (
                  <li key={idx} style={{ background: '#F3E8FF', color: '#6D28D9', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontWeight: 600, fontSize: '0.88rem' }}>
                    • {np}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted-text">— {t('common.empty')}</p>
            )}
          </section>

          {/* Sensory Profile Summary */}
          <section className="dashboard-card" style={{ padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldIcon size={18} />
              <span>{t('parent.sensorySummary')}</span>
            </h2>
            <div className="sensory-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {Object.entries(view.sensoryPrefs || {}).map(([k, v]) => (
                <div key={k} className="sensory-summary-item" style={{ background: 'var(--bg-tertiary)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
                  <span className="sensory-key" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>{k}</span>
                  <strong className="sensory-val" style={{ fontSize: '0.9rem' }}>{String(v)}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
