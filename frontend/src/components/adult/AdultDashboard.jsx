import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';

export default function AdultDashboard({ user, dashboard }) {
  const { t, language } = useI18n();
  const navigate = useNavigate();

  const adultModules = [
    {
      id: 'adult_functional_reading',
      titleKey: 'skills.adult.functionalReading.title',
      descKey: 'skills.adult.functionalReading.desc',
      icon: '📄',
      duration: '15 min',
      category: 'Functional Reading',
      categoryUr: 'روزمرہ مطالعہ',
      path: '/skill/adult_functional_reading',
    },
    {
      id: 'adult_problem_solving',
      titleKey: 'skills.adult.problemSolving.title',
      descKey: 'skills.adult.problemSolving.desc',
      icon: '🧩',
      duration: '12 min',
      category: 'Workplace Problem Solving',
      categoryUr: 'مسائل کا حل',
      path: '/skill/adult_problem_solving',
    },
    {
      id: 'adult_everyday_comm',
      titleKey: 'skills.adult.everydayComm.title',
      descKey: 'skills.adult.everydayComm.desc',
      icon: '🗣️',
      duration: '10 min',
      category: 'Everyday Communication',
      categoryUr: 'روزمرہ گفتگو',
      path: '/scenarios',
    },
  ];

  return (
    <div className="dashboard web-dashboard">
      {/* Top Welcome Hero Banner */}
      <header className="dashboard-hero-banner">
        <div className="hero-banner-content">
          <div className="hero-greeting-pill">
            <span className="hero-greeting-dot" />
            {language === 'ur' ? 'خوش آمدید' : 'Welcome Back'} 👋
          </div>
          <h1 className="hero-greeting-title">
            {language === 'ur' ? `السلام علیکم، ${user.name} 🌟` : `Assalam-o-Alaikum, ${user.name} 🌟`}
          </h1>
          <p className="hero-greeting-subtitle">
            {language === 'ur' 
              ? 'پیشہ ورانہ ماحول اور روزمرہ زندگی کے لیے اعتماد بخش بات چیت کی مشق۔'
              : 'Professional communication, workplace confidence, and independent living practice.'}
          </p>
          <div className="hero-meta-chips">
            <span className="hero-chip">💼 {t('persona.adult')} ({language === 'ur' ? '20+ سال' : '20+ years'})</span>
            <span className="hero-chip">⚡ Level: {dashboard?.currentLevel || 'Advanced'}</span>
          </div>
        </div>
        <div className="hero-banner-actions">
          <button className="btn-primary hero-cta-btn" onClick={() => navigate('/scenarios')}>
            🚀 {language === 'ur' ? 'آج کی مشق شروع کریں' : 'Start Today\'s Practice'}
          </button>
        </div>
      </header>

      {/* Row 1: Today's Plan, Current Streak, Overall Progress */}
      <section className="dashboard-stats-row">
        {/* Card 1: Today's Plan */}
        <div className="dashboard-stat-box plan-box">
          <div className="stat-box-header">
            <span className="stat-box-icon">📋</span>
            <div>
              <span className="stat-box-kicker">{language === 'ur' ? 'آج کا منصوبہ' : 'Today\'s Plan'}</span>
              <h3 className="stat-box-title">{dashboard?.completedCount || 0} / 3 {language === 'ur' ? 'سرگرمیاں' : 'Activities'}</h3>
            </div>
          </div>
          <p className="stat-box-desc">
            ⏱️ 15-20 min {language === 'ur' ? 'روزانہ مشق کا ہدف' : 'daily practice goal'}
          </p>
          <button className="btn-primary stat-action-btn" onClick={() => navigate('/scenarios')}>
            {language === 'ur' ? 'منصوبہ شروع کریں' : 'Start Plan'} →
          </button>
        </div>

        {/* Card 2: Current Streak */}
        <div className="dashboard-stat-box streak-box">
          <div className="stat-box-header">
            <span className="stat-box-icon">🔥</span>
            <div>
              <span className="stat-box-kicker">{language === 'ur' ? 'مسلسل کارکردگی' : 'Current Streak'}</span>
              <h3 className="stat-box-title">7 {language === 'ur' ? 'دن' : 'Days'}</h3>
            </div>
          </div>
          <p className="stat-box-desc">
            🌟 {language === 'ur' ? 'بہترین مستقل مزاجی! آگے بڑھتے رہیں۔' : 'Great consistency! Keep up the momentum.'}
          </p>
          <div className="streak-dots-bar">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <span key={i} className={`streak-dot ${i <= 4 ? 'is-active' : ''}`} title={`Day ${day}`}>
                {day}
              </span>
            ))}
          </div>
        </div>

        {/* Card 3: Overall Progress */}
        <div className="dashboard-stat-box progress-box">
          <div className="stat-box-header">
            <span className="stat-box-icon">📊</span>
            <div>
              <span className="stat-box-kicker">{language === 'ur' ? 'مجموعی پیشرفت' : 'Overall Progress'}</span>
              <h3 className="stat-box-title">{Math.round(dashboard?.avgAccuracy || 0)}% {language === 'ur' ? 'درستگی' : 'Accuracy'}</h3>
            </div>
          </div>
          <div className="mini-progress-bars">
            <div className="mini-prog-item">
              <span>{language === 'ur' ? 'دفتر کی گفتگو' : 'Workplace Comm'}</span>
              <div className="mini-bar-track"><div className="mini-bar-fill" style={{ width: '80%' }} /></div>
            </div>
            <div className="mini-prog-item">
              <span>{language === 'ur' ? 'روزمرہ مسائل' : 'Problem Solving'}</span>
              <div className="mini-bar-track"><div className="mini-bar-fill" style={{ width: '72%' }} /></div>
            </div>
          </div>
          <button className="text-btn view-all-btn" onClick={() => navigate('/progress')}>
            {language === 'ur' ? 'مکمل رپورٹ دیکھیں' : 'View Full Report'} ➔
          </button>
        </div>
      </section>

      {/* Row 2: Core Skill Modules & Practice Scenarios */}
      <section className="dashboard-section">
        <div className="section-title-wrap">
          <div>
            <p className="kicker">{t('skills.adult.kicker') || 'PRACTICE MODULES'}</p>
            <h2 className="section-main-heading">
              {t('skills.adult.heading') || 'Personalized Adult Skill Modules'}
            </h2>
          </div>
          <button className="btn-secondary btn-sm" onClick={() => navigate('/scenarios')}>
            {language === 'ur' ? 'تمام منظرنامے دیکھیں' : 'View All Scenarios'} ➔
          </button>
        </div>

        <div className="modules-web-grid">
          {adultModules.map((mod) => (
            <div key={mod.id} className="module-web-card">
              <div className="module-card-top">
                <div className="module-icon-badge">{mod.icon}</div>
                <div className="module-pill-group">
                  <span className="module-category-pill">
                    {language === 'ur' ? mod.categoryUr : mod.category}
                  </span>
                  <span className="module-duration-pill">⏱️ {mod.duration}</span>
                </div>
              </div>

              <div className="module-card-body">
                <h3 className="module-title">{t(mod.titleKey)}</h3>
                <p className="module-desc">{t(mod.descKey)}</p>
              </div>

              <div className="module-card-footer">
                <button
                  className="btn-primary module-launch-btn"
                  type="button"
                  onClick={() => navigate(mod.path)}
                >
                  {language === 'ur' ? 'مشق شروع کریں' : 'Start Practice'} →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Row 3: Progress Snapshot & Workplace Assistant Launch */}
      <section className="dashboard-section-split">
        {/* Left Card: Skill Snapshot */}
        <div className="dashboard-card snapshot-card">
          <div className="card-header-line">
            <h3 className="card-heading-title">📈 {t('dashboard.progressSnapshot') || 'Skill Mastery Snapshot'}</h3>
            <button className="text-btn" onClick={() => navigate('/progress')}>
              {language === 'ur' ? 'تفصیلات' : 'Details'} ➔
            </button>
          </div>
          
          <div className="progress-list">
            {dashboard?.progress?.length ? dashboard.progress.map((prog) => (
              <div key={prog.skill} className="progress-item">
                <div className="progress-label">
                  <span style={{ textTransform: 'capitalize' }}>{prog.skill.replace('_', ' ')}</span>
                  <strong>{Math.round(prog.accuracy)}%</strong>
                </div>
                <div className="progress-bar-container" aria-hidden="true">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${Math.max(10, Math.min(100, prog.accuracy))}%` }}
                  />
                </div>
              </div>
            )) : (
              <div className="empty-state-notice">
                <p>{language === 'ur' ? 'ابھی کوئی پیشرفت ریکارڈ نہیں ہوئی۔ پہلی مشق مکمل کریں!' : 'Complete your first scenario to see detailed skill insights!'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Quick AI Practice Assistant Launch */}
        <div className="dashboard-card ai-assistant-promo-card">
          <div className="ai-promo-content">
            <div className="ai-promo-badge">💼 Workplace & Social Coach</div>
            <h3>{language === 'ur' ? 'پیشہ ورانہ بات چیت کا ماڈل' : 'Real-World Workplace Simulations'}</h3>
            <p>
              {language === 'ur'
                ? 'مینیجر سے کام کی وضاحت طلب کرنا، سروس اپائنٹمنٹس لینا اور دفتری کمیونیکیشن کی پریکٹس کریں۔'
                : 'Prepare for managerial discussions, task clarifications, appointments, and social interactions with AI coaching.'}
            </p>
            <button className="btn-primary" onClick={() => navigate('/scenarios')}>
              🗣️ {language === 'ur' ? 'پریکٹس شروع کریں' : 'Start Scenario Practice'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
