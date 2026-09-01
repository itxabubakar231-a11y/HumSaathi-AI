import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';

export default function AdultDashboard({ user, dashboard, recommendation, activities }) {
  const { t, language } = useI18n();
  const navigate = useNavigate();

  const adultModules = [
    {
      id: 'adult_functional_reading',
      titleKey: 'skills.adult.functionalReading.title',
      descKey: 'skills.adult.functionalReading.desc',
      icon: '📄',
      duration: '10 min',
      difficulty: 'Practical',
      category: 'Functional Reading',
      categoryUr: 'عملی مطالعہ',
      categoryUrRm: 'Functional Reading',
      tags: ['Workplace Notices', 'Utility Invoices', 'Transit Timetables', 'SMS Alerts'],
      tagsUr: ['دفتری نوٹس', 'یوٹیلیٹی بلز', 'ٹرانزٹ شیڈول', 'ایس ایم ایس الرٹس'],
      tagsUrRm: ['Workplace Notices', 'Utility Invoices', 'Transit Schedule', 'SMS Alerts'],
      path: '/skill/adult_functional_reading',
    },
    {
      id: 'adult_problem_solving',
      titleKey: 'skills.adult.problemSolving.title',
      descKey: 'skills.adult.problemSolving.desc',
      icon: '🧩',
      duration: '15 min',
      difficulty: 'Practical',
      category: 'Problem Solving',
      categoryUr: 'روزمرہ مسائل کا حل',
      categoryUrRm: 'Daily Problem Solving',
      tags: ['Shopping Value', 'Transit vs Taxi', 'Overcharge Disputes', 'Task Priorities'],
      tagsUr: ['قیمتوں کا موازنہ', 'سفر کا فیصلہ', 'بل کا تنازعہ', 'دفتری ترجیحات'],
      tagsUrRm: ['Shopping Value', 'Transit Choices', 'Bill Disputes', 'Workplace Priorities'],
      path: '/skill/adult_problem_solving',
    },
    {
      id: 'adult_everyday_comm',
      titleKey: 'skills.adult.everydayComm.title',
      descKey: 'skills.adult.everydayComm.desc',
      icon: '🗣️',
      duration: '10 min',
      difficulty: 'Interactive',
      category: 'Everyday Communication',
      categoryUr: 'روزمرہ گفتگو',
      categoryUrRm: 'Everyday Communication',
      tags: ['Managers', 'Shift Swaps', 'Pharmacists', 'Customer Support'],
      tagsUr: ['مینیجرز', 'شفٹ کا تبادلہ', 'فارماسسٹ', 'کسٹمر سپورٹ'],
      tagsUrRm: ['Managers', 'Shift Swaps', 'Pharmacists', 'Customer Support'],
      path: '/scenarios',
    },
  ];

  const getCategoryLabel = (mod) => {
    if (language === 'ur') return mod.categoryUr;
    if (language === 'ur_rm') return mod.categoryUrRm;
    return mod.category;
  };

  const getTags = (mod) => {
    if (language === 'ur') return mod.tagsUr;
    if (language === 'ur_rm') return mod.tagsUrRm;
    return mod.tags;
  };

  const startRecommended = () => {
    if (!recommendation) {
      navigate('/scenarios');
      return;
    }
    const topic = recommendation.topic || recommendation.activityId || '';
    if (topic.includes('functional') || topic.includes('reading')) {
      navigate('/skill/adult_functional_reading');
    } else if (topic.includes('problem') || topic.includes('solving')) {
      navigate('/skill/adult_problem_solving');
    } else if (topic.includes('comm') || topic.includes('scenario')) {
      navigate('/scenarios');
    } else if (recommendation.activityId && recommendation.activityId.startsWith('adult_')) {
      navigate(`/skill/${recommendation.activityId}`);
    } else {
      navigate('/scenarios');
    }
  };

  const formatSkillName = (skillKey) => {
    if (!skillKey) return '';
    const key = skillKey.toLowerCase();
    if (key.includes('functional') || key.includes('reading')) {
      return language === 'ur' ? 'عملی مطالعہ (دفتری نوٹس، بلز، ایس ایم ایس)' : language === 'ur_rm' ? 'Functional Reading' : 'Functional Reading';
    }
    if (key.includes('problem') || key.includes('solving')) {
      return language === 'ur' ? 'روزمرہ مسائل کا حل (بجٹ، ترجیحات)' : language === 'ur_rm' ? 'Practical Problem Solving' : 'Practical Problem Solving';
    }
    if (key.includes('comm') || key.includes('social')) {
      return language === 'ur' ? 'پیشہ ورانہ و سماجی گفتگو' : language === 'ur_rm' ? 'Workplace & Social Communication' : 'Workplace & Social Communication';
    }
    return skillKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="dashboard web-dashboard adult-portal-theme">
      {/* Top Welcome Hero Banner */}
      <header className="dashboard-hero-banner adult-hero-banner">
        <div className="hero-banner-content">
          <div className="hero-greeting-pill" style={{ background: 'rgba(56, 178, 172, 0.15)', color: '#2C7A7B' }}>
            <span className="hero-greeting-dot" style={{ background: '#319795' }} />
            {language === 'ur' ? 'خود مختار زندگی اور کیریئر کی مہارتیں' : language === 'ur_rm' ? 'Independent Living & Career Skills' : 'Independent Living & Career Skills'}
          </div>
          <h1 className="hero-greeting-title">
            {language === 'ur'
              ? `خوش آمدید، ${user.name} 💼`
              : language === 'ur_rm'
              ? `Welcome, ${user.name} 💼`
              : `Welcome, ${user.name} 💼`}
          </h1>
          <p className="hero-greeting-subtitle">
            {language === 'ur'
              ? 'دفتری مواصلات، بجٹ، فارم پر کرنے اور روزمرہ مسائل کو اعتماد کے ساتھ حل کرنے کا ذاتی پلیٹ فارم۔'
              : language === 'ur_rm'
              ? 'Workplace communication, bill calculations, safety notices, aur daily decision-making practice.'
              : 'Practical workplace communication, bill calculations, safety notices, and everyday decision-making.'}
          </p>
          <div className="hero-meta-chips">
            <span className="hero-chip">💼 {t('persona.adult')} ({language === 'ur' ? '20+ سال' : '20+ years'})</span>
            <span className="hero-chip">📈 {language === 'ur' ? 'مہارت کی سطح' : 'Proficiency'}: {dashboard?.currentLevel || 'Intermediate'}</span>
            <span className="hero-chip">✅ {dashboard?.completedCount || 0} {language === 'ur' ? 'عملی ٹاسک مکمل' : language === 'ur_rm' ? 'Tasks Completed' : 'Tasks Completed'}</span>
          </div>
        </div>
        <div className="hero-banner-actions">
          <button className="btn-primary hero-cta-btn" onClick={() => navigate('/scenarios')} style={{ background: 'var(--interactive-primary)' }}>
            🎯 {language === 'ur' ? 'عملی مشق شروع کریں' : language === 'ur_rm' ? 'Practical Mashq Shuru Karein' : 'Start Practical Practice'}
          </button>
        </div>
      </header>

      {/* Row 0: Next Recommended Action */}
      {recommendation && (
        <section className="dashboard-card adult-recommendation-card" style={{ marginBottom: 'var(--space-md)', background: 'linear-gradient(135deg, rgba(49, 151, 149, 0.1) 0%, rgba(59, 130, 246, 0.08) 100%)', border: '1.5px solid rgba(49, 151, 149, 0.35)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
            <div style={{ flex: '1 1 300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ background: '#2C7A7B', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🎯 {language === 'ur' ? 'تجویز کردہ اگلا اقدام' : language === 'ur_rm' ? 'Recommended Next Action' : 'Recommended Next Action'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  ⚡ {recommendation.difficulty ? recommendation.difficulty.toUpperCase() : 'PRACTICAL'}
                </span>
              </div>
              <h3 style={{ margin: '4px 0', fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
                {formatSkillName(recommendation.topic || recommendation.activityType)}
              </h3>
              <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {recommendation.reason || (language === 'ur' ? 'آپ کی حالیہ پیشرفت کی روشنی میں اگلا تجویز کردہ عملی ٹاسک۔' : 'Personalized recommendation based on your recent skill accuracy.')}
              </p>
            </div>
            <button className="btn-primary" onClick={startRecommended} style={{ padding: '0.65rem 1.25rem', fontSize: '0.95rem', background: '#2C7A7B' }}>
              💼 {language === 'ur' ? 'یہ ٹاسک شروع کریں' : language === 'ur_rm' ? 'Start This Task' : 'Start This Task'} →
            </button>
          </div>
        </section>
      )}

      {/* Row 1: Key Metrics */}
      <section className="dashboard-stats-row">
        {/* Card 1: Today's Routine */}
        <div className="dashboard-stat-box plan-box">
          <div className="stat-box-header">
            <span className="stat-box-icon">💼</span>
            <div>
              <span className="stat-box-kicker">{language === 'ur' ? 'آج کا روٹین' : language === 'ur_rm' ? 'Today\'s Routine' : 'Today\'s Routine'}</span>
              <h3 className="stat-box-title">{dashboard?.completedCount || 0} / 3 {language === 'ur' ? 'ٹاسک' : language === 'ur_rm' ? 'Tasks' : 'Tasks'}</h3>
            </div>
          </div>
          <p className="stat-box-desc">
            ⏱️ 10-15 min {language === 'ur' ? 'خود مختار مہارتوں کی روزانہ مشق' : language === 'ur_rm' ? 'daily life-skills practice' : 'daily life-skills practice'}
          </p>
          <button className="btn-primary stat-action-btn" onClick={() => navigate('/scenarios')} style={{ background: '#2C7A7B' }}>
            {language === 'ur' ? 'روٹین شروع کریں' : language === 'ur_rm' ? 'Routine Shuru Karein' : 'Start Routine'} →
          </button>
        </div>

        {/* Card 2: Weekly Consistency */}
        <div className="dashboard-stat-box streak-box">
          <div className="stat-box-header">
            <span className="stat-box-icon">📅</span>
            <div>
              <span className="stat-box-kicker">{language === 'ur' ? 'ہفتہ وار تسلسل' : language === 'ur_rm' ? 'Weekly Consistency' : 'Weekly Consistency'}</span>
              <h3 className="stat-box-title">7 {language === 'ur' ? 'دن متواتر' : language === 'ur_rm' ? 'Days Active' : 'Days Active'}</h3>
            </div>
          </div>
          <p className="stat-box-desc">
            🌟 {language === 'ur' ? 'بہترین مستقل مزاجی! کیریئر اور خود مختاری کے اہداف پورے ہو رہے ہیں۔' : language === 'ur_rm' ? 'Great consistency! Career & life goals on track.' : 'Great consistency! Career & life goals on track.'}
          </p>
          <div className="streak-dots-bar">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <span key={i} className={`streak-dot ${i <= 4 ? 'is-active' : ''}`} title={`Day ${day}`}>
                {day}
              </span>
            ))}
          </div>
        </div>

        {/* Card 3: Decision Accuracy */}
        <div className="dashboard-stat-box progress-box">
          <div className="stat-box-header">
            <span className="stat-box-icon">🎯</span>
            <div>
              <span className="stat-box-kicker">{language === 'ur' ? 'فیصلہ سازی کی درستگی' : language === 'ur_rm' ? 'Decision Accuracy' : 'Decision Accuracy'}</span>
              <h3 className="stat-box-title">{Math.round(dashboard?.avgAccuracy || 0)}% {language === 'ur' ? 'درستگی' : language === 'ur_rm' ? 'Accuracy' : 'Accuracy'}</h3>
            </div>
          </div>
          <div className="mini-progress-bars">
            <div className="mini-prog-item">
              <span>{language === 'ur' ? 'عملی مطالعہ' : language === 'ur_rm' ? 'Functional Reading' : 'Functional Reading'}</span>
              <div className="mini-bar-track">
                <div className="mini-bar-fill" style={{ width: `${Math.max(15, Math.min(100, (dashboard?.progress?.find(p => p.skill.includes('reading'))?.accuracy || 80)))}%`, background: '#2C7A7B' }} />
              </div>
            </div>
            <div className="mini-prog-item">
              <span>{language === 'ur' ? 'مسائل کا حل' : language === 'ur_rm' ? 'Problem Solving' : 'Problem Solving'}</span>
              <div className="mini-bar-track">
                <div className="mini-bar-fill" style={{ width: `${Math.max(15, Math.min(100, (dashboard?.progress?.find(p => p.skill.includes('problem'))?.accuracy || 72)))}%`, background: '#2C7A7B' }} />
              </div>
            </div>
          </div>
          <button className="text-btn view-all-btn" onClick={() => navigate('/progress')}>
            {language === 'ur' ? 'مکمل رپورٹ دیکھیں' : language === 'ur_rm' ? 'Full Analytics Dekhein' : 'View Full Analytics'} ➔
          </button>
        </div>
      </section>

      {/* Row 2: Core Functional Modules */}
      <section className="dashboard-section">
        <div className="section-title-wrap">
          <div>
            <p className="kicker">{t('skills.adult.kicker') || 'INDEPENDENT LIVING & WORKPLACE'}</p>
            <h2 className="section-main-heading">
              {t('skills.adult.heading') || 'Practical Adult Skill Modules'}
            </h2>
          </div>
          <button className="btn-secondary btn-sm" onClick={() => navigate('/scenarios')}>
            {language === 'ur' ? 'تمام منظرنامے دیکھیں' : language === 'ur_rm' ? 'Tamam Scenarios' : 'View All Scenarios'} ➔
          </button>
        </div>

        <div className="modules-web-grid">
          {adultModules.map((mod) => (
            <div key={mod.id} className="module-web-card">
              <div className="module-card-top">
                <div className="module-icon-badge">{mod.icon}</div>
                <div className="module-pill-group">
                  <span className="module-category-pill" style={{ background: 'rgba(49, 151, 149, 0.15)', color: '#2C7A7B' }}>
                    {getCategoryLabel(mod)}
                  </span>
                  <span className="module-duration-pill">⏱️ {mod.duration}</span>
                </div>
              </div>

              <div className="module-card-body">
                <h3 className="module-title">{t(mod.titleKey)}</h3>
                <p className="module-desc">{t(mod.descKey)}</p>

                {/* Sub-skill pills */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {getTags(mod).map((tag, idx) => (
                    <span key={idx} style={{ fontSize: '0.75rem', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="module-card-footer">
                <button
                  className="btn-primary module-launch-btn"
                  type="button"
                  onClick={() => navigate(mod.path)}
                  style={{ background: '#2C7A7B' }}
                >
                  {language === 'ur' ? 'ماڈیول شروع کریں' : language === 'ur_rm' ? 'Module Shuru Karein' : 'Start Module'} →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Row 3: Mastery Snapshot & AI Workplace Simulation */}
      <section className="dashboard-section-split">
        {/* Left Card: Skill Snapshot */}
        <div className="dashboard-card snapshot-card">
          <div className="card-header-line">
            <h3 className="card-heading-title">📊 {t('dashboard.progressSnapshot') || 'Workplace & Life Mastery'}</h3>
            <button className="text-btn" onClick={() => navigate('/progress')}>
              {language === 'ur' ? 'تفصیلات' : 'Details'} ➔
            </button>
          </div>

          <div className="progress-list">
            {dashboard?.progress?.length ? dashboard.progress.map((prog) => (
              <div key={prog.skill} className="progress-item">
                <div className="progress-label">
                  <span style={{ textTransform: 'capitalize' }}>{formatSkillName(prog.skill)}</span>
                  <strong>{Math.round(prog.accuracy)}%</strong>
                </div>
                <div className="progress-bar-container" aria-hidden="true">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${Math.max(10, Math.min(100, prog.accuracy))}%`, background: '#2C7A7B' }}
                  />
                </div>
              </div>
            )) : (
              <div className="empty-state-notice">
                <p>{language === 'ur' ? 'ابھی کوئی پیشرفت ریکارڈ نہیں ہوئی۔ پہلا عملی ٹاسک مکمل کریں!' : language === 'ur_rm' ? 'Pehla practical task complete kar ke insights dekhein!' : 'Complete your first practical module to view skill mastery!'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Quick AI Workplace Roleplay Assistant */}
        <div className="dashboard-card ai-assistant-promo-card">
          <div className="ai-promo-content">
            <div className="ai-promo-badge" style={{ background: '#2C7A7B', color: '#fff' }}>🤖 AI Professional Coach</div>
            <h3>{language === 'ur' ? 'پیشہ ورانہ گفتگو کا حقیقی ماحول' : language === 'ur_rm' ? 'Realistic Workplace Conversations' : 'Realistic Workplace Conversations'}</h3>
            <p>
              {language === 'ur'
                ? 'مینیجرز سے کام کی وضاحت، ساتھیوں سے شفٹ کا تبادلہ، اور کسٹمر کیئر سے بات چیت کی باوقار مشق کریں۔'
                : language === 'ur_rm'
                ? 'Managers se instructions, colleagues se shift swap, aur customer support se professional communication practice karein.'
                : 'Practice talking to managers, swapping shifts with coworkers, and handling customer support calls professionally.'}
            </p>
            <button className="btn-primary" onClick={() => navigate('/scenarios')} style={{ background: '#2C7A7B' }}>
              🗣️ {language === 'ur' ? 'اے آئی کے ساتھ بات چیت کریں' : language === 'ur_rm' ? 'Start Workplace Roleplay' : 'Start Workplace Roleplay'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
