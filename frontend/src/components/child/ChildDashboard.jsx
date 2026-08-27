import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';

export default function ChildDashboard({ user, dashboard, recommendation, activities = [] }) {
  const { t } = useI18n();
  const navigate = useNavigate();

  const hasAssessment = dashboard?.assessmentSummary !== null;
  const rewards = dashboard?.rewards || { totalStars: 0, earnedCount: 0, badges: [] };

  const startRecommended = () => {
    if (recommendation?.activityId) {
      navigate(`/activity/${recommendation.activityId}`, { state: { recommendation } });
    }
  };

  const startActivityByTopicOrType = (topicOrType) => {
    const match = activities.find(
      (a) => a.topic === topicOrType || a.type === topicOrType
    );
    if (match) {
      navigate(`/activity/${match.id}`);
    } else if (recommendation?.activityId) {
      navigate(`/activity/${recommendation.activityId}`);
    }
  };

  const getChildLevelLabel = (level) => {
    const key = `child.level.${level || 'beginner'}`;
    return t(key);
  };

  const getTopicIcon = (topic) => {
    switch (topic) {
      case 'letters':
      case 'letter':
        return '🔤';
      case 'numbers':
      case 'number':
        return '🔢';
      case 'colors':
      case 'shapes':
      case 'shape_color_match':
        return '🎨';
      case 'counting':
        return '🍎';
      case 'animals':
      case 'animal_matching':
        return '🐾';
      case 'emotions':
      case 'emotion_learning':
        return '💛';
      case 'routines':
      case 'routine_sequencing':
        return '⏰';
      default:
        return '✨';
    }
  };

  // Grouped games for child-friendly navigation
  const foundationGames = [
    { type: 'letter', topic: 'letters', icon: '🔤', titleKey: 'child.game.letter' },
    { type: 'number', topic: 'numbers', icon: '🔢', titleKey: 'child.game.number' },
    { type: 'shape_color_match', topic: 'colors', icon: '🎨', titleKey: 'child.game.shape_color_match' },
    { type: 'counting', topic: 'counting', icon: '🍎', titleKey: 'child.game.counting' },
  ];

  const worldGames = [
    { type: 'animal_matching', topic: 'animals', icon: '🐾', titleKey: 'child.game.animal_matching' },
    { type: 'emotion_learning', topic: 'emotions', icon: '💛', titleKey: 'child.game.emotion_learning' },
    { type: 'routine_sequencing', topic: 'routines', icon: '⏰', titleKey: 'child.game.routine_sequencing' },
  ];

  return (
    <div className="child-dashboard">
      {/* Child Header Banner with Star Counter */}
      <header className="child-header">
        <div className="child-header-main">
          <div className="child-avatar-wrap">
            <span className="child-avatar-icon" aria-hidden="true">🌱</span>
          </div>
          <div className="child-welcome">
            <p className="child-greeting-kicker">{t('child.greeting')},</p>
            <h1 className="child-name">{user?.name}!</h1>
            <p className="child-subgreeting">{t('child.subgreeting')}</p>
          </div>
        </div>

        {/* Persistent Star Counter */}
        <div className="child-star-bank" aria-label={`${rewards.totalStars || 0} ${t('child.stars')}`}>
          <span className="star-bank-icon" aria-hidden="true">⭐</span>
          <div className="star-bank-info">
            <span className="star-bank-count">{rewards.totalStars || 0}</span>
            <span className="star-bank-label">{t('child.stars')}</span>
          </div>
        </div>
      </header>

      {/* Next Milestone / Learning Goal Track */}
      {rewards.nextMilestone && (
        <section className="child-milestone-card" aria-label="Learning Goal">
          <div className="milestone-content">
            <div className="milestone-text">
              <p className="milestone-kicker">🎯 {t('child.nextMilestone')}</p>
              <h3 className="milestone-title">
                {rewards.nextMilestone.icon} {t(rewards.nextMilestone.labelKey)}
              </h3>
            </div>
            <div className="milestone-progress-wrap">
              <span className="milestone-ratio">
                {rewards.nextMilestone.current} / {rewards.nextMilestone.target}
              </span>
              <div className="milestone-bar-track" aria-hidden="true">
                <div
                  className="milestone-bar-fill"
                  style={{
                    width: `${Math.min(100, Math.max(10, (rewards.nextMilestone.current / rewards.nextMilestone.target) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* No Assessment State */}
      {!hasAssessment && (
        <section className="child-hero-card">
          <div className="child-hero-content">
            <span className="child-hero-icon" aria-hidden="true">🌟</span>
            <h2>{t('assessment.title')}</h2>
            <p>{t('assessment.intro')}</p>
            <button
              className="btn-child-primary"
              type="button"
              onClick={() => navigate('/assessment')}
            >
              {t('dashboard.goAssessment')}
            </button>
          </div>
        </section>
      )}

      {/* Main Play Action Hero Card */}
      {hasAssessment && recommendation && (
        <section className="child-hero-card">
          <div className="child-hero-content">
            <span className="child-hero-icon" aria-hidden="true">
              {getTopicIcon(recommendation.topic || recommendation.activityType)}
            </span>
            <p className="child-hero-badge">
              {getChildLevelLabel(recommendation.difficulty)}
            </p>
            <h2>
              {t(`child.game.${recommendation.topic === 'colors' || recommendation.topic === 'shapes' ? 'shape_color_match' : (recommendation.topic || recommendation.activityType)}`) || recommendation.topic}
            </h2>
            <p className="child-hero-desc">{recommendation.reason}</p>
            <button
              className="btn-child-primary"
              type="button"
              onClick={startRecommended}
            >
              {dashboard.completedCount > 0 ? t('child.continuePlay') : t('child.startAdventure')} 🚀
            </button>
          </div>
        </section>
      )}

      {/* Choose an Adventure - Foundations */}
      {hasAssessment && (
        <section className="child-section">
          <h2 className="child-section-title">
            <span aria-hidden="true">🧩</span> {t('child.category.foundations')}
          </h2>
          <div className="child-game-grid">
            {foundationGames.map((game) => (
              <button
                key={game.type}
                className="child-game-card"
                type="button"
                onClick={() => startActivityByTopicOrType(game.topic)}
              >
                <span className="child-game-icon" aria-hidden="true">{game.icon}</span>
                <div className="child-game-text">
                  <h3>{t(game.titleKey)}</h3>
                </div>
                <span className="child-game-action-btn">{t('child.play')} ➔</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Choose an Adventure - World & Life Skills */}
      {hasAssessment && (
        <section className="child-section">
          <h2 className="child-section-title">
            <span aria-hidden="true">🌍</span> {t('child.category.world')}
          </h2>
          <div className="child-game-grid">
            {worldGames.map((game) => (
              <button
                key={game.type}
                className="child-game-card"
                type="button"
                onClick={() => startActivityByTopicOrType(game.topic)}
              >
                <span className="child-game-icon" aria-hidden="true">{game.icon}</span>
                <div className="child-game-text">
                  <h3>{t(game.titleKey)}</h3>
                </div>
                <span className="child-game-action-btn">{t('child.play')} ➔</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* My Badges & Milestones Gallery */}
      {rewards.badges?.length > 0 && (
        <section className="child-section">
          <div className="child-section-header">
            <h2 className="child-section-title">
              <span aria-hidden="true">🏆</span> {t('child.myBadges')}
            </h2>
          </div>
          <div className="child-badges-grid">
            {rewards.badges.map((badge) => (
              <div
                key={badge.code}
                className={`child-badge-card ${badge.isUnlocked ? 'is-unlocked' : 'is-locked'}`}
                title={badge.isUnlocked ? t(badge.descKey) : t('child.nextMilestone')}
              >
                <span className="child-badge-icon" aria-hidden="true">{badge.icon}</span>
                <div className="child-badge-text">
                  <h4>{t(badge.titleKey)}</h4>
                  <p>{badge.isUnlocked ? t(badge.descKey) : '🔒'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Child Learning Journey (Visual Badges) */}
      {hasAssessment && dashboard?.progress?.length > 0 && (
        <section className="child-section">
          <h2 className="child-section-title">
            <span aria-hidden="true">🗺️</span> {t('child.myJourney')}
          </h2>
          <div className="child-skill-grid">
            {dashboard.progress.map((prog) => (
              <button
                key={prog.skill}
                className="child-skill-card is-interactive"
                type="button"
                onClick={() => startActivityByTopicOrType(prog.skill)}
                title={`${t('child.play')} ${t(`child.game.${prog.skill === 'colors' || prog.skill === 'shapes' ? 'shape_color_match' : prog.skill}`) || prog.skill}`}
              >
                <span className="child-skill-icon" aria-hidden="true">
                  {getTopicIcon(prog.skill)}
                </span>
                <div className="child-skill-info">
                  <h3>{t(`child.game.${prog.skill === 'colors' || prog.skill === 'shapes' ? 'shape_color_match' : prog.skill}`) || prog.skill}</h3>
                  <span className="child-skill-badge">
                    {getChildLevelLabel(prog.level)}
                  </span>
                </div>
                <div className="child-progress-track" aria-hidden="true">
                  <div
                    className="child-progress-fill"
                    style={{ width: `${Math.max(15, prog.accuracy)}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Recent Adventures (Clickable Replay) */}
      {dashboard?.recentAttempts?.length > 0 && (
        <section className="child-section">
          <div className="child-section-header">
            <h2 className="child-section-title">
              <span aria-hidden="true">🎯</span> {t('child.recentAdventures')}
            </h2>
            <button
              className="text-btn"
              type="button"
              onClick={() => navigate('/progress')}
            >
              {t('dashboard.viewAll')}
            </button>
          </div>
          <div className="child-recent-list">
            {dashboard.recentAttempts.map((item) => (
              <button
                key={item.id}
                className="child-recent-card is-interactive"
                type="button"
                onClick={() => startActivityByTopicOrType(item.topic)}
                title={`${t('child.continuePlay')} ${item.title}`}
              >
                <span className="child-recent-icon" aria-hidden="true">
                  {getTopicIcon(item.topic)}
                </span>
                <div className="child-recent-text">
                  <h3>{item.title}</h3>
                  <p>
                    {getChildLevelLabel(item.difficulty)}
                    {item.starsAwarded ? ` · ${'⭐'.repeat(item.starsAwarded)}` : ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Quick Navigation Footer */}
      <footer className="child-footer-nav">
        <button
          className="child-nav-btn"
          type="button"
          onClick={() => navigate('/progress')}
        >
          <span>📊</span> {t('nav.progress')}
        </button>
        <button
          className="child-nav-btn"
          type="button"
          onClick={() => navigate('/settings')}
        >
          <span>⚙️</span> {t('nav.settings')}
        </button>
        <button
          className="child-nav-btn child-parent-btn"
          type="button"
          onClick={() => navigate('/parent')}
        >
          <span>🔒</span> {t('child.parentGate')}
        </button>
      </footer>
    </div>
  );
}
