import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';

export default function ChildDashboard({ user, dashboard, recommendation, activities = [] }) {
  const { t, language } = useI18n();
  const navigate = useNavigate();

  const hasAssessment = dashboard?.assessmentSummary !== null;
  const rewards = dashboard?.rewards || { totalStars: 0, earnedCount: 0, badges: [] };
  const completedCount = dashboard?.completedCount || 0;

  const startRecommended = () => {
    if (recommendation?.activityId) {
      navigate(`/activity/${recommendation.activityId}`, { state: { recommendation } });
    } else {
      startActivityByTopicOrType('letters');
    }
  };

  const startActivityByTopicOrType = (topicOrType) => {
    // 1. Try finding in activities array
    const match = activities.find(
      (a) => a.topic === topicOrType || a.type === topicOrType
    );
    if (match?.id) {
      navigate(`/activity/${match.id}`);
      return;
    }

    // 2. Direct topic fallback — backend supports topic slugs directly
    navigate(`/activity/${topicOrType}`);
  };

  const getChildLevelLabel = (level) => {
    const key = `child.level.${level || 'beginner'}`;
    return t(key) || level || 'Explorer';
  };

  const getTopicIcon = (topic) => {
    switch (topic) {
      case 'letters':
      case 'letter':
        return '';
      case 'numbers':
      case 'number':
        return '';
      case 'colors':
      case 'shapes':
      case 'shape_color_match':
        return '';
      case 'counting':
        return '';
      case 'animals':
      case 'animal_matching':
        return '';
      case 'emotions':
      case 'emotion_learning':
        return '';
      case 'routines':
      case 'routine_sequencing':
        return '';
      default:
        return '';
    }
  };

  // Grouped games for child-friendly navigation
  const foundationGames = [
    { type: 'letter', topic: 'letters', icon: '', titleKey: 'child.game.letter', desc: 'Alphabet letters & sounds' },
    { type: 'number', topic: 'numbers', icon: '', titleKey: 'child.game.number', desc: 'Number recognition & order' },
    { type: 'shape_color_match', topic: 'colors', icon: '', titleKey: 'child.game.shape_color_match', desc: 'Colors, shapes & matching' },
    { type: 'counting', topic: 'counting', icon: '', titleKey: 'child.game.counting', desc: 'Count friendly objects' },
  ];

  const worldGames = [
    { type: 'animal_matching', topic: 'animals', icon: '', titleKey: 'child.game.animal_matching', desc: 'Friendly animals & habitats' },
    { type: 'emotion_learning', topic: 'emotions', icon: '', titleKey: 'child.game.emotion_learning', desc: 'Recognize feelings & expressions' },
    { type: 'routine_sequencing', topic: 'routines', icon: '', titleKey: 'child.game.routine_sequencing', desc: 'Morning to evening daily steps' },
  ];

  // Learning journey structured steps
  const journeySteps = [
    {
      stepNumber: '01',
      title: 'Initial Learning Check',
      subtitle: hasAssessment ? `Level: ${getChildLevelLabel(dashboard.assessmentSummary?.level)} (${dashboard.assessmentSummary?.score}%)` : 'Find your starting pace',
      icon: '',
      state: hasAssessment ? 'completed' : 'recommended',
      actionLabel: hasAssessment ? 'Revisit' : 'Start Assessment ',
      onClick: () => navigate('/assessment'),
    },
    {
      stepNumber: '02',
      title: 'Foundations',
      subtitle: 'Letters, Numbers, Colors & Counting',
      icon: '',
      state: hasAssessment ? (completedCount >= 2 ? 'completed' : 'current') : 'locked',
      actionLabel: hasAssessment ? (completedCount >= 2 ? 'Practice More ➔' : 'Start Learning ') : 'Complete Assessment',
      onClick: () => (hasAssessment ? startActivityByTopicOrType('letters') : navigate('/assessment')),
    },
    {
      stepNumber: '03',
      title: 'Communication Coach',
      subtitle: 'Real-world practice with AI Friend & Teacher',
      icon: '',
      state: hasAssessment ? 'available' : 'locked',
      actionLabel: hasAssessment ? 'Open Scenarios ➔' : 'Complete Assessment',
      onClick: () => navigate('/scenarios'),
    },
    {
      stepNumber: '04',
      title: 'World & Life Skills',
      subtitle: 'Animals, Emotions & Daily Routines',
      icon: '',
      state: hasAssessment ? (completedCount >= 4 ? 'completed' : 'available') : 'locked',
      actionLabel: hasAssessment ? 'Explore Games ➔' : 'Complete Assessment',
      onClick: () => (hasAssessment ? startActivityByTopicOrType('animals') : navigate('/assessment')),
    },
    {
      stepNumber: '05',
      title: 'Daily Recommendation',
      subtitle: recommendation?.topic ? `Personalized task: ${recommendation.topic}` : 'Daily adaptive activities',
      icon: '',
      state: hasAssessment && recommendation ? 'recommended' : (hasAssessment ? 'available' : 'locked'),
      actionLabel: hasAssessment ? 'Play Now ' : 'Complete Assessment',
      onClick: () => (hasAssessment ? startRecommended() : navigate('/assessment')),
    },
  ];

  return (
    <div className="child-dashboard">
      {/* Welcome Area & Star Counter */}
      <header className="child-header">
        <div className="child-header-main">
          <div className="child-avatar-wrap">
            <span className="child-avatar-icon" aria-hidden="true"></span>
          </div>
          <div className="child-welcome">
            <p className="child-greeting-kicker">{t('child.greeting')},</p>
            <h1 className="child-name">{user?.name || 'Learner'}!</h1>
            <p className="child-subgreeting">{t('child.subgreeting')}</p>
          </div>
        </div>

        {/* Big Star Bank */}
        <div className="child-star-bank" aria-label={`${rewards.totalStars || 0} ${t('child.stars')}`}>
          <span className="star-bank-icon" aria-hidden="true"></span>
          <div className="star-bank-info">
            <span className="star-bank-count">{rewards.totalStars || 0}</span>
            <span className="star-bank-label">{t('child.stars')}</span>
          </div>
        </div>
      </header>

      {/* Next Milestone / Goal Track */}
      {rewards.nextMilestone && (
        <section className="child-milestone-card" aria-label="Learning Goal">
          <div className="milestone-content">
            <div className="milestone-text">
              <p className="milestone-kicker"> {t('child.nextMilestone')}</p>
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
            <span className="child-hero-icon" aria-hidden="true"></span>
            <h2>{t('assessment.title')}</h2>
            <p className="child-hero-desc">{t('assessment.intro')}</p>
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
            <span className="child-hero-badge">
              {getChildLevelLabel(recommendation.difficulty)}
            </span>
            <h2>
              {t(`child.game.${recommendation.topic === 'colors' || recommendation.topic === 'shapes' ? 'shape_color_match' : (recommendation.topic || recommendation.activityType)}`) || recommendation.topic}
            </h2>
            <button
              className="btn-child-primary"
              type="button"
              onClick={startRecommended}
            >
              {dashboard.completedCount > 0 ? t('child.continuePlay') : t('child.startAdventure')}
            </button>
          </div>
        </section>
      )}

      {/*  PRACTICE SCENARIOS / AI COACH FEATURE (PROMINENT) */}
      <section className="child-section child-ai-coach-banner">
        <div className="ai-coach-card-content">
          <div className="ai-coach-text">
            <span className="ai-coach-badge"> AI Practice Companion</span>
            <h2>{language === 'ur' ? 'اے آئی دوست کے ساتھ بات چیت کریں' : 'Talk with your AI Coach & Friends!'}</h2>
            <p>
              {language === 'ur'
                ? 'استاد سے مدد مانگیں، نئے دوست بنائیں یا روزمرہ کی گفتگو بول کر یا لکھ کر مشق کریں۔'
                : 'Practice talking to a helpful teacher, making friends, or asking for directions using voice or text.'}
            </p>
          </div>
          <div className="ai-coach-actions">
            <button
              className="btn-primary btn-coach-start"
              type="button"
              onClick={() => navigate('/scenarios')}
            >
               {language === 'ur' ? 'بات چیت شروع کریں' : 'Start Practice Scenarios'} ➔
            </button>
          </div>
        </div>
      </section>

      {/*  MY LEARNING JOURNEY (STRUCTURED PROGRESSION TIMELINE) */}
      <section className="child-section child-journey-section">
        <div className="child-section-header">
          <div>
            <span className="child-section-kicker">STEP BY STEP PROGRESSION</span>
            <h2 className="child-section-title">
              <span aria-hidden="true"></span> {t('child.myJourney')}
            </h2>
          </div>
        </div>

        <div className="child-journey-timeline">
          {journeySteps.map((step, idx) => {
            const isCompleted = step.state === 'completed';
            const isCurrent = step.state === 'current';
            const isRecommended = step.state === 'recommended';
            const isLocked = step.state === 'locked';

            return (
              <div
                key={step.stepNumber}
                className={`journey-timeline-node is-${step.state}`}
              >
                {/* Step Connector Line */}
                {idx < journeySteps.length - 1 && (
                  <div className={`journey-line-segment ${isCompleted ? 'is-done' : ''}`} aria-hidden="true" />
                )}

                {/* Node Status Badge */}
                <div className="journey-node-badge">
                  {isCompleted && <span className="node-icon-completed">✓</span>}
                  {isCurrent && <span className="node-icon-current"></span>}
                  {isRecommended && <span className="node-icon-recommended"></span>}
                  {isLocked && <span className="node-icon-locked"></span>}
                  {!isCompleted && !isCurrent && !isRecommended && !isLocked && (
                    <span className="node-icon-available">{step.stepNumber}</span>
                  )}
                </div>

                {/* Node Card Content */}
                <div
                  className="journey-node-card"
                  onClick={!isLocked ? step.onClick : undefined}
                  role={!isLocked ? 'button' : undefined}
                  tabIndex={!isLocked ? 0 : undefined}
                  onKeyDown={!isLocked ? (e) => e.key === 'Enter' && step.onClick() : undefined}
                >
                  <div className="journey-node-main">
                    <span className="journey-node-icon" aria-hidden="true">{step.icon}</span>
                    <div className="journey-node-info">
                      <div className="journey-node-meta">
                        <span className="journey-step-tag">STEP {step.stepNumber}</span>
                        <span className={`journey-state-pill pill-${step.state}`}>
                          {isCompleted && '✓ Completed'}
                          {isCurrent && ' Current Task'}
                          {isRecommended && ' Suggested Next'}
                          {isLocked && ' Complete Previous'}
                          {step.state === 'available' && 'Available'}
                        </span>
                      </div>
                      <h3 className="journey-node-title">{step.title}</h3>
                      <p className="journey-node-subtitle">{step.subtitle}</p>
                    </div>
                  </div>

                  <div className="journey-node-action">
                    <button
                      type="button"
                      className={`btn-journey-action btn-state-${step.state}`}
                      disabled={isLocked}
                      onClick={(e) => {
                        e.stopPropagation();
                        step.onClick();
                      }}
                    >
                      {step.actionLabel}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/*  CHOOSE AN ADVENTURE - FOUNDATIONS */}
      {hasAssessment && (
        <section className="child-section">
          <div className="child-section-header">
            <div>
              <span className="child-section-kicker">CORE SKILLS</span>
              <h2 className="child-section-title">
                <span aria-hidden="true"></span> {t('child.category.foundations')}
              </h2>
            </div>
          </div>
          <div className="child-game-grid">
            {foundationGames.map((game) => (
              <button
                key={game.type}
                className="child-game-card is-interactive-card"
                type="button"
                onClick={() => startActivityByTopicOrType(game.topic)}
              >
                <span className="child-game-icon" aria-hidden="true">{game.icon}</span>
                <div className="child-game-text">
                  <h3>{t(game.titleKey)}</h3>
                  <p className="child-game-desc">{game.desc}</p>
                </div>
                <span className="child-game-action-btn">{t('child.play')} ➔</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/*  CHOOSE AN ADVENTURE - WORLD & LIFE SKILLS */}
      {hasAssessment && (
        <section className="child-section">
          <div className="child-section-header">
            <div>
              <span className="child-section-kicker">EVERYDAY UNDERSTANDING</span>
              <h2 className="child-section-title">
                <span aria-hidden="true"></span> {t('child.category.world')}
              </h2>
            </div>
          </div>
          <div className="child-game-grid">
            {worldGames.map((game) => (
              <button
                key={game.type}
                className="child-game-card is-interactive-card"
                type="button"
                onClick={() => startActivityByTopicOrType(game.topic)}
              >
                <span className="child-game-icon" aria-hidden="true">{game.icon}</span>
                <div className="child-game-text">
                  <h3>{t(game.titleKey)}</h3>
                  <p className="child-game-desc">{game.desc}</p>
                </div>
                <span className="child-game-action-btn">{t('child.play')} ➔</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/*  MY STRENGTHS & SUPERPOWERS */}
      {dashboard?.strengths?.length > 0 && (
        <section className="child-section child-strengths-section">
          <div className="child-section-header">
            <div>
              <span className="child-section-kicker">
                {language === 'ur' ? 'میری طاقت' : language === 'ur_rm' ? 'MERI MAZBOOT SKILLS' : 'SUPERPOWERS'}
              </span>
              <h2 className="child-section-title">
                <span aria-hidden="true"></span> {t('parent.strengths') || (language === 'ur' ? 'میری بہترین مہارتیں' : 'My Strengths')}
              </h2>
            </div>
          </div>

          <div className="child-strengths-grid">
            {dashboard.strengths.map((str, idx) => (
              <div key={idx} className="child-strength-card">
                <div className="strength-card-top">
                  <span className="strength-card-icon" aria-hidden="true">
                    {getTopicIcon(str.skill)}
                  </span>
                  <span className="strength-badge-pill">
                    {str.accuracy}% {language === 'ur' ? 'درستگی' : 'Mastery'}
                  </span>
                </div>
                <h4 className="strength-card-title">
                  {t(`child.game.${str.skill}`) || t(`child.game.${str.skill.replace(/s$/, '')}`) || str.skill.replace('_', ' ').toUpperCase()}
                </h4>
                <p className="strength-card-meta">
                   {str.attempts} {language === 'ur' ? 'کامیاب مشقیں' : language === 'ur_rm' ? 'mukammal mashqein' : 'completed practices'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/*  RECENT ACTIVITY / RECENT ADVENTURES */}
      {dashboard?.recentAttempts?.length > 0 && (
        <section className="child-section child-recent-section">
          <div className="child-section-header">
            <div>
              <span className="child-section-kicker">{language === 'ur' ? 'حالیہ سرگرمیاں' : 'PRACTICE HISTORY'}</span>
              <h2 className="child-section-title">
                <span aria-hidden="true"></span> {t('progress.recent') || 'Recent Activity'}
              </h2>
            </div>
            <button className="text-btn" type="button" onClick={() => navigate('/progress')}>
              {language === 'ur' ? 'مکمل رپورٹ' : 'Full Progress'} ➔
            </button>
          </div>

          <div className="child-recent-grid">
            {dashboard.recentAttempts.map((attempt) => (
              <div key={attempt.id} className="child-recent-card">
                <div className="recent-card-left">
                  <span className="recent-card-icon" aria-hidden="true">
                    {getTopicIcon(attempt.topic || attempt.title)}
                  </span>
                  <div className="recent-card-details">
                    <h4 className="recent-card-title">{attempt.title || 'Learning Activity'}</h4>
                    <div className="recent-card-meta">
                      <span className="recent-diff-badge">{getChildLevelLabel(attempt.difficulty)}</span>
                      <span className="recent-score-badge"> {attempt.score}%</span>
                    </div>
                  </div>
                </div>
                <div className="recent-card-right">
                  <div className="recent-stars-awarded" aria-label={`${attempt.starsAwarded || 1} stars`}>
                    {Array.from({ length: Math.max(1, Math.min(3, attempt.starsAwarded || 1)) }).map((_, sIdx) => (
                      <span key={sIdx} className="recent-star-icon" aria-hidden="true"></span>
                    ))}
                  </div>
                  <button
                    className="btn-replay-activity"
                    type="button"
                    onClick={() => startActivityByTopicOrType(attempt.topic || 'letters')}
                  >
                     {language === 'ur' ? 'دوبارہ کھیلیں' : 'Play Again'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/*  MY BADGES GALLERY */}
      {rewards.badges?.length > 0 && (
        <section className="child-section">
          <div className="child-section-header">
            <div>
              <span className="child-section-kicker">ACHIEVEMENTS</span>
              <h2 className="child-section-title">
                <span aria-hidden="true"></span> {t('child.myBadges')}
              </h2>
            </div>
          </div>
          <div className="child-badges-grid">
            {rewards.badges.map((badge) => (
              <div
                key={badge.code}
                className={`child-badge-card ${badge.isUnlocked ? 'is-unlocked' : 'is-locked'}`}
              >
                <span className="child-badge-icon" aria-hidden="true">{badge.icon}</span>
                <div className="child-badge-text">
                  <h4>{t(badge.titleKey)}</h4>
                  <p>{badge.isUnlocked ? t(badge.descKey) : ' Complete activities to unlock'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Simple Bottom Navigation */}
      <footer className="child-footer-nav">
        <button
          className="child-nav-btn"
          type="button"
          onClick={() => navigate('/scenarios')}
        >
          <span></span> Practice Scenarios
        </button>
        <button
          className="child-nav-btn"
          type="button"
          onClick={() => navigate('/progress')}
        >
          <span></span> {t('nav.progress')}
        </button>
        <button
          className="child-nav-btn"
          type="button"
          onClick={() => navigate('/settings')}
        >
          <span></span> {t('nav.settings')}
        </button>
        <button
          className="child-nav-btn child-parent-btn"
          type="button"
          onClick={() => navigate('/parent')}
        >
          <span></span> {t('child.parentGate')}
        </button>
      </footer>
    </div>
  );
}
