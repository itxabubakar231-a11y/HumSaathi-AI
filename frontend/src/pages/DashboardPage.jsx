import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';
import { PERSONAS, LANGUAGES } from '../utils/preferences';
import ChildDashboard from '../components/child/ChildDashboard';
import TeenDashboard from '../components/teen/TeenDashboard';
import AdultDashboard from '../components/adult/AdultDashboard';

export default function DashboardPage() {
  const { user } = useUser();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }
    if (!user?.persona) {
      navigate('/persona-selection');
      return;
    }
    Promise.all([
      api.getDashboard(user.id).catch(() => ({ dashboard: { completedCount: 0, avgAccuracy: 0, progress: [], recentAttempts: [], assessmentSummary: null } })),
      api.getLatestAssessment(user.id).catch(() => ({ assessment: null })),
      api.recommend(user.id).catch(() => null),
      api.getActivities({ persona: user.persona, language: user.language }).catch(() => ({ activities: [] })),
    ]).then(([dash, assessment, rec, acts]) => {
      setDashboard(dash?.dashboard || { completedCount: 0, avgAccuracy: 0, progress: [], recentAttempts: [], assessmentSummary: null });
      setActivities(acts?.activities || []);
      if (!assessment?.assessment) {
        setRecommendation(null);
      } else if (rec?.recommendation) {
        setRecommendation(rec.recommendation);
      }
    }).catch((err) => {
      console.error('Dashboard error:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, [user, navigate]);

  const personaLabel = PERSONAS.find((p) => p.id === user?.persona);
  const langLabel = LANGUAGES.find((l) => l.id === user?.language);

  const startRecommended = () => {
    if (recommendation?.activityId) {
      navigate(`/activity/${recommendation.activityId}`, { state: { recommendation } });
    }
  };

  if (loading) return <p>{t('common.loading')}</p>;
  if (!dashboard) return <p className="error-text">{t('common.error')}</p>;

  const hasAssessment = dashboard.assessmentSummary !== null;

  if (user?.persona === 'child') {
    return (
      <ChildDashboard
        user={user}
        dashboard={dashboard}
        recommendation={recommendation}
        activities={activities}
      />
    );
  }

  if (user?.persona === 'teen') {
    return (
      <TeenDashboard
        user={user}
        dashboard={dashboard}
        recommendation={recommendation}
        activities={activities}
      />
    );
  }

  if (user?.persona === 'adult') {
    return (
      <AdultDashboard
        user={user}
        dashboard={dashboard}
        recommendation={recommendation}
        activities={activities}
      />
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="welcome-text">
          <p className="eyebrow">{t('dashboard.welcome')} </p>
          <h1>{user?.name || 'Learner'}</h1>
        </div>
        <div className="context-indicator">
          <span>{personaLabel ? t(personaLabel.labelKey) : 'Select Persona'} · {langLabel ? t(langLabel.labelKey) : 'English'}</span>
          <button className="text-btn" type="button" onClick={() => navigate('/settings')}>
            {t('common.changeSettings')}
          </button>
        </div>
      </header>

      <section className="dashboard-card today-plan" style={{ marginTop: 'var(--space-md)' }}>
        <h2>Choose Your Practice Portal</h2>
        <p className="card-desc">Please select a persona portal (Child, Teen, or Adult) to customize your practice modules.</p>
        <button className="btn-primary" type="button" onClick={() => navigate('/persona-selection')} style={{ marginTop: 'var(--space-sm)' }}>
          Select Practice Persona
        </button>
      </section>
    </div>
  );
}
