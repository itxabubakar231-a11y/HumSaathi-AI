import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';
import {
  SparklesIcon,
  ArrowRightIcon,
  ActivitiesIcon,
  AnalyticsIcon,
  CheckIcon,
  MessageIcon,
} from '../ui/Icons';

export default function AdultDashboard({ user, dashboard, recommendation, activities }) {
  const { t, language } = useI18n();
  const navigate = useNavigate();

  const adultModules = [
    {
      id: 'adult_functional_reading',
      titleKey: 'skills.adult.functionalReading.title',
      descKey: 'skills.adult.functionalReading.desc',
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
      return language === 'ur' ? 'عملی مطالعہ (دفتری نوٹس، بلز، ایس ایم ایس)' : 'Functional Reading';
    }
    if (key.includes('problem') || key.includes('solving')) {
      return language === 'ur' ? 'روزمرہ مسائل کا حل (بجٹ، ترجیحات)' : 'Practical Problem Solving';
    }
    if (key.includes('comm') || key.includes('social')) {
      return language === 'ur' ? 'پیشہ ورانہ و سماجی گفتگو' : 'Workplace & Social Communication';
    }
    return skillKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="dashboard web-dashboard adult-portal-theme">
      {/* Top Welcome Hero Banner */}
      <header className="dashboard-hero-banner adult-hero-banner">
        <div className="hero-banner-content">
          <div className="hero-greeting-pill" style={{ background: 'rgba(2, 132, 199, 0.12)', color: '#0284C7' }}>
            <span className="hero-greeting-dot" style={{ background: '#0284C7' }} />
            {language === 'ur' ? 'خود مختار زندگی اور کیریئر کی مہارتیں' : 'Independent Living & Career Skills'}
          </div>
          <h1 className="hero-greeting-title">
            {language === 'ur'
              ? `خوش آمدید، ${user.name}`
              : `Welcome, ${user.name}`}
          </h1>
          <p className="hero-greeting-subtitle">
            {language === 'ur'
              ? 'دفتری مواصلات، بجٹ، فارم پر کرنے اور روزمرہ مسائل کو اعتماد کے ساتھ حل کرنے کا ذاتی پلیٹ فارم۔'
              : 'Master workplace communication, budgeting decisions, and practical independent living.'}
          </p>
          <div className="hero-meta-chips">
            <span className="hero-chip">{t('persona.adult')} ({language === 'ur' ? '18+ سال' : '18+ years'})</span>
            <span className="hero-chip">{language === 'ur' ? 'لیول' : 'Level'}: {dashboard?.currentLevel || 'Intermediate'}</span>
            <span className="hero-chip">{dashboard?.completedCount || 0} {language === 'ur' ? 'ماڈیولز مکمل' : 'Modules Completed'}</span>
          </div>
        </div>
        <div className="hero-banner-actions">
          <button className="btn-primary hero-cta-btn" onClick={() => navigate('/scenarios')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>{language === 'ur' ? 'روزمرہ مشق شروع کریں' : 'Start Today\'s Practice'}</span>
            <ArrowRightIcon size={16} />
          </button>
        </div>
      </header>

      {/* Row 0: Personalized Next Recommended Activity Banner */}
      {recommendation && (
        <section className="dashboard-card adult-recommendation-card" style={{ marginBottom: 'var(--space-md)', background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(14, 165, 233, 0.05) 100%)', border: '1.5px solid rgba(2, 132, 199, 0.25)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
            <div style={{ flex: '1 1 300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ background: '#0284C7', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {language === 'ur' ? 'اگلا تجویز کردہ قدم' : 'Recommended Next Step'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {recommendation.difficulty ? recommendation.difficulty.toUpperCase() : 'PRACTICAL'}
                </span>
              </div>
              <h3 style={{ margin: '4px 0', fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
                {formatSkillName(recommendation.topic || recommendation.activityType)}
              </h3>
              <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {recommendation.reason || (language === 'ur' ? 'آپ کے پیشہ ورانہ اور روزمرہ اہداف کے مطابق اگلی تجویز کردہ مشق۔' : 'Personalized recommendation based on your recent skill accuracy.')}
              </p>
            </div>
            <button className="btn-primary" onClick={startRecommended} style={{ padding: '0.65rem 1.25rem', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>{language === 'ur' ? 'تجویز کردہ مشق شروع کریں' : 'Start Recommended'}</span>
              <ArrowRightIcon size={14} />
            </button>
          </div>
        </section>
      )}

      {/* Row 1: Today's Plan, Current Streak, Overall Progress */}
      <section className="dashboard-stats-row">
        {/* Card 1: Daily Target */}
        <div className="dashboard-stat-box plan-box">
          <div className="stat-box-header">
            <span className="stat-box-icon-wrap" style={{ color: '#0284C7' }}>
              <ActivitiesIcon size={20} />
            </span>
            <div>
              <span className="stat-box-kicker">{language === 'ur' ? 'روزانہ ہدف' : 'Daily Goal'}</span>
              <h3 className="stat-box-title">{dashboard?.completedCount || 0} / 3 {language === 'ur' ? 'ماڈیولز' : 'Modules'}</h3>
            </div>
          </div>
          <p className="stat-box-desc">
            15 min {language === 'ur' ? 'روزمرہ پیشہ ورانہ مشق کا ہدف' : 'daily workplace & life practice'}
          </p>
          <button className="btn-primary stat-action-btn" onClick={() => navigate('/scenarios')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>{language === 'ur' ? 'مشق شروع کریں' : 'Start Goal'}</span>
            <ArrowRightIcon size={14} />
          </button>
        </div>

        {/* Card 2: Habit Streak */}
        <div className="dashboard-stat-box streak-box">
          <div className="stat-box-header">
            <span className="stat-box-icon-wrap" style={{ color: '#D97706' }}>
              <SparklesIcon size={20} />
            </span>
            <div>
              <span className="stat-box-kicker">{language === 'ur' ? 'مسلسل کارکردگی' : 'Active Streak'}</span>
              <h3 className="stat-box-title">7 {language === 'ur' ? 'دن' : 'Days'}</h3>
            </div>
          </div>
          <p className="stat-box-desc">
            {language === 'ur' ? 'شاندار مستقل مزاجی! پیشہ ورانہ اعتماد میں اضافہ ہو رہا ہے۔' : 'Consistent practice builds long-term confidence.'}
          </p>
          <div className="streak-dots-bar">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <span key={i} className={`streak-dot ${i <= 4 ? 'is-active' : ''}`} title={`Day ${day}`}>
                {day}
              </span>
            ))}
          </div>
        </div>

        {/* Card 3: Skills Accuracy */}
        <div className="dashboard-stat-box progress-box">
          <div className="stat-box-header">
            <span className="stat-box-icon-wrap" style={{ color: '#0B6B3A' }}>
              <AnalyticsIcon size={20} />
            </span>
            <div>
              <span className="stat-box-kicker">{language === 'ur' ? 'مہارت کی درستگی' : 'Overall Mastery'}</span>
              <h3 className="stat-box-title">{Math.round(dashboard?.avgAccuracy || 0)}% {language === 'ur' ? 'درستگی' : 'Accuracy'}</h3>
            </div>
          </div>
          <div className="mini-progress-bars">
            <div className="mini-prog-item">
              <span>{language === 'ur' ? 'عملی مطالعہ' : 'Functional Reading'}</span>
              <div className="mini-bar-track">
                <div className="mini-bar-fill" style={{ width: `${Math.max(15, Math.min(100, (dashboard?.progress?.find(p => p.skill.includes('functional') || p.skill.includes('reading'))?.accuracy || 80)))}%` }} />
              </div>
            </div>
            <div className="mini-prog-item">
              <span>{language === 'ur' ? 'روزمرہ مسائل' : 'Problem Solving'}</span>
              <div className="mini-bar-track">
                <div className="mini-bar-fill" style={{ width: `${Math.max(15, Math.min(100, (dashboard?.progress?.find(p => p.skill.includes('problem'))?.accuracy || 72)))}%` }} />
              </div>
            </div>
          </div>
          <button className="text-btn view-all-btn" onClick={() => navigate('/progress')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>{language === 'ur' ? 'مکمل رپورٹ دیکھیں' : 'View Full Report'}</span>
            <ArrowRightIcon size={13} />
          </button>
        </div>
      </section>

      {/* Row 2: Adult Skill Modules & Scenarios */}
      <section className="dashboard-section">
        <div className="section-title-wrap">
          <div>
            <p className="kicker">{t('skills.adult.kicker') || 'CAREER & INDEPENDENCE MODULES'}</p>
            <h2 className="section-main-heading">
              {t('skills.adult.heading') || 'Essential Adult Skill Modules'}
            </h2>
          </div>
          <button className="btn-secondary btn-sm" onClick={() => navigate('/scenarios')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>{language === 'ur' ? 'تمام منظرنامے دیکھیں' : 'View All Scenarios'}</span>
            <ArrowRightIcon size={13} />
          </button>
        </div>

        <div className="modules-web-grid">
          {adultModules.map((mod) => (
            <div key={mod.id} className="module-web-card">
              <div className="module-card-topbar">
                <span className="module-cat-pill">{getCategoryLabel(mod)}</span>
                <span className="module-duration">{mod.duration}</span>
              </div>
              <h3 className="module-title">{t(mod.titleKey) || mod.category}</h3>
              <p className="module-desc">{t(mod.descKey)}</p>
              <div className="module-tags-row">
                {getTags(mod).map((tag, idx) => (
                  <span key={idx} className="module-tag-chip">{tag}</span>
                ))}
              </div>
              <button className="btn-primary module-launch-btn" onClick={() => navigate(mod.path)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <span>{language === 'ur' ? 'ماڈیول شروع کریں' : 'Start Module'}</span>
                <ArrowRightIcon size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
