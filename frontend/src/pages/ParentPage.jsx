import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';

export default function ParentPage() {
  const { user } = useUser();
  const { t } = useI18n();
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
      setError(err.message);
    }
  };

  if (!user) return <p>{t('common.error')}</p>;

  return (
    <div className="parent-page">
      <p className="eyebrow">{t('parent.title')}</p>
      <h1>{t('parent.title')}</h1>
      <p className="intro">{t('parent.intro')}</p>

      {!view ? (
        <form onSubmit={loadView} className="pin-form">
          <label>
            {t('parent.pin')}
            <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} maxLength={8} />
          </label>
          {error && <p className="error-text">{error}</p>}
          <button className="btn-primary" type="submit">{t('parent.view')}</button>
        </form>
      ) : (
        <div className="parent-view">
          <section className="dashboard-card">
            <h2>{t('parent.learner')}</h2>
            <p>{view.learner.name} · {view.learner.persona} · {view.learner.language}</p>
            <p>{t('progress.level')}: {view.currentLevel}</p>
            <p>{t('progress.completed')}: {view.completedCount}</p>
            <p>{t('progress.accuracy')}: {view.avgAccuracy}%</p>
          </section>

          <section className="dashboard-card">
            <h2>{t('parent.strengths')}</h2>
            <p>{view.strengths.join(', ') || '—'}</p>
          </section>

          <section className="dashboard-card">
            <h2>{t('parent.needsPractice')}</h2>
            <p>{view.needsPractice.join(', ') || '—'}</p>
          </section>

          <section className="dashboard-card">
            <h2>{t('progress.recent')}</h2>
            <ul className="recent-list">
              {view.recentAttempts.map((a, i) => (
                <li key={i}>{a.title} — {a.score}%</li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
