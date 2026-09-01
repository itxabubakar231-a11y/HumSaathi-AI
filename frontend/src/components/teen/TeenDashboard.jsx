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

export default function TeenDashboard({ user, dashboard, recommendation, activities }) {
  const { t, language } = useI18n();
  const navigate = useNavigate();

  const teenModules = [
    {
      id: 'teen_reading_vocab',
      titleKey: 'skills.teen.readingVocab.title',
      descKey: 'skills.teen.readingVocab.desc',
      duration: '15 min',
      difficulty: 'Adaptive',
      category: 'Reading & Vocab',
      categoryUr: 'مطالعہ اور الفاظ',
      categoryUrRm: 'Reading & Vocab',
      tags: ['Passages', 'Context Clues', 'Vocab'],
      tagsUr: ['مضامین', 'الفاظ کا فہم', 'لغت'],
      tagsUrRm: ['Passages', 'Context Clues', 'Vocab'],
      path: '/skill/teen_reading_vocab',
    },
    {
      id: 'teen_problem_solving',
      titleKey: 'skills.teen.problemSolving.title',
      descKey: 'skills.teen.problemSolving.desc',
      duration: '12 min',
      difficulty: 'Adaptive',
      category: 'Problem Solving',
      categoryUr: 'مسائل کا حل',
      categoryUrRm: 'Problem Solving',
      tags: ['Budget Math', 'Time Management', 'Peer Dynamics'],
      tagsUr: ['بجٹ مینجمنٹ', 'ٹائم مینجمنٹ', 'فیصلہ سازی'],
      tagsUrRm: ['Budget Math', 'Time Management', 'Decisions'],
      path: '/skill/teen_problem_solving',
    },
    {
      id: 'teen_communication',
      titleKey: 'skills.teen.communication.title',
      descKey: 'skills.teen.communication.desc',
      duration: '10 min',
      difficulty: 'Interactive',
      category: 'AI Communication',
      categoryUr: 'بات چیت کی مشق',
      categoryUrRm: 'AI Communication',
      tags: ['Teachers', 'Classmates', 'Resolving Disputes'],
      tagsUr: ['اساتذہ', 'ہم جماعت', 'مسائل کا حل'],
      tagsUrRm: ['Teachers', 'Classmates', 'Disputes'],
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
    if (topic.includes('reading') || topic.includes('vocab')) {
      navigate('/skill/teen_reading_vocab');
    } else if (topic.includes('problem') || topic.includes('solving')) {
      navigate('/skill/teen_problem_solving');
    } else if (topic.includes('comm') || topic.includes('scenario')) {
      navigate('/scenarios');
    } else if (recommendation.activityId && recommendation.activityId.startsWith('teen_')) {
      navigate(`/skill/${recommendation.activityId}`);
    } else {
      navigate('/scenarios');
    }
  };

  const formatSkillName = (skillKey) => {
    if (!skillKey) return '';
    const key = skillKey.toLowerCase();
    if (key.includes('reading') || key.includes('vocab')) {
      return language === 'ur' ? 'مطالعہ اور الفاظ' : language === 'ur_rm' ? 'Reading & Vocab' : 'Reading & Vocabulary';
    }
    if (key.includes('problem') || key.includes('solving')) {
      return language === 'ur' ? 'مسائل کا حل' : language === 'ur_rm' ? 'Problem Solving' : 'Problem Solving';
    }
    if (key.includes('comm') || key.includes('social')) {
      return language === 'ur' ? 'گفتگو اور سماجی مہارتیں' : language === 'ur_rm' ? 'Social Communication' : 'Social Communication';
    }
    return skillKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="dashboard web-dashboard teen-portal-theme">
      {/* Top Welcome Hero Banner */}
      <header className="dashboard-hero-banner teen-hero-banner">
        <div className="hero-banner-content">
          <div className="hero-greeting-pill">
            <span className="hero-greeting-dot" />
            {language === 'ur' ? 'خوش آمدید' : language === 'ur_rm' ? 'Khush Aamdeed' : 'Welcome Back'}
          </div>
          <h1 className="hero-greeting-title">
            {language === 'ur'
              ? `السلام علیکم، ${user.name}`
              : `Assalam-o-Alaikum, ${user.name}`}
          </h1>
          <p className="hero-greeting-subtitle">
            {language === 'ur'
              ? 'مواصلات، بجٹ، اور روزمرہ مسائل حل کرنے کی جدید و ذاتی تعلیمی مشق۔'
              : 'Empowering your communication, budget planning, and everyday decision making with adaptive practice.'}
          </p>
          <div className="hero-meta-chips">
            <span className="hero-chip">{t('persona.teen')} ({language === 'ur' ? '13-19 سال' : '13-19 years'})</span>
            <span className="hero-chip">{language === 'ur' ? 'لیول' : 'Level'}: {dashboard?.currentLevel || 'Intermediate'}</span>
            <span className="hero-chip">{dashboard?.completedCount || 0} {language === 'ur' ? 'سرگرمیاں مکمل' : 'Activities Completed'}</span>
          </div>
        </div>
        <div className="hero-banner-actions">
          <button className="btn-primary hero-cta-btn" onClick={() => navigate('/scenarios')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>{language === 'ur' ? 'آج کی مشق شروع کریں' : 'Start Today\'s Practice'}</span>
            <ArrowRightIcon size={16} />
          </button>
        </div>
      </header>

      {/* Row 0: Personalized Next Recommended Activity Banner */}
      {recommendation && (
        <section className="dashboard-card teen-recommendation-card" style={{ marginBottom: 'var(--space-md)', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%)', border: '1.5px solid rgba(124, 58, 237, 0.25)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
            <div style={{ flex: '1 1 300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ background: '#7C3AED', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {language === 'ur' ? 'اگلا تجویز کردہ قدم' : 'Your Next Step'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {recommendation.difficulty ? recommendation.difficulty.toUpperCase() : 'MEDIUM'}
                </span>
              </div>
              <h3 style={{ margin: '4px 0', fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
                {formatSkillName(recommendation.topic || recommendation.activityType)}
              </h3>
              <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {recommendation.reason || (language === 'ur' ? 'آپ کی پیشرفت کے مطابق اگلی موزوں مشق۔' : 'Personalized recommendation based on your recent skill accuracy.')}
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
        {/* Card 1: Today's Plan */}
        <div className="dashboard-stat-box plan-box">
          <div className="stat-box-header">
            <span className="stat-box-icon-wrap" style={{ color: '#7C3AED' }}>
              <ActivitiesIcon size={20} />
            </span>
            <div>
              <span className="stat-box-kicker">{language === 'ur' ? 'آج کا منصوبہ' : 'Today\'s Plan'}</span>
              <h3 className="stat-box-title">{dashboard?.completedCount || 0} / 3 {language === 'ur' ? 'سرگرمیاں' : 'Activities'}</h3>
            </div>
          </div>
          <p className="stat-box-desc">
            15-20 min {language === 'ur' ? 'روزانہ مشق کا ہدف' : 'daily practice goal'}
          </p>
          <button className="btn-primary stat-action-btn" onClick={() => navigate('/scenarios')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>{language === 'ur' ? 'منصوبہ شروع کریں' : 'Start Plan'}</span>
            <ArrowRightIcon size={14} />
          </button>
        </div>

        {/* Card 2: Current Streak */}
        <div className="dashboard-stat-box streak-box">
          <div className="stat-box-header">
            <span className="stat-box-icon-wrap" style={{ color: '#F59E0B' }}>
              <SparklesIcon size={20} />
            </span>
            <div>
              <span className="stat-box-kicker">{language === 'ur' ? 'مسلسل کارکردگی' : 'Current Streak'}</span>
              <h3 className="stat-box-title">7 {language === 'ur' ? 'دن' : 'Days'}</h3>
            </div>
          </div>
          <p className="stat-box-desc">
            {language === 'ur' ? 'شاندار مستقل مزاجی! آگے بڑھتے رہیں۔' : 'Great consistency! Keep up the momentum.'}
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
            <span className="stat-box-icon-wrap" style={{ color: '#0284C7' }}>
              <AnalyticsIcon size={20} />
            </span>
            <div>
              <span className="stat-box-kicker">{language === 'ur' ? 'مجموعی پیشرفت' : 'Overall Progress'}</span>
              <h3 className="stat-box-title">{Math.round(dashboard?.avgAccuracy || 0)}% {language === 'ur' ? 'درستگی' : 'Accuracy'}</h3>
            </div>
          </div>
          <div className="mini-progress-bars">
            <div className="mini-prog-item">
              <span>{language === 'ur' ? 'مطالعہ و الفاظ' : 'Reading & Vocab'}</span>
              <div className="mini-bar-track">
                <div className="mini-bar-fill" style={{ width: `${Math.max(15, Math.min(100, (dashboard?.progress?.find(p => p.skill.includes('reading'))?.accuracy || 75)))}%` }} />
              </div>
            </div>
            <div className="mini-prog-item">
              <span>{language === 'ur' ? 'مسائل کا حل' : 'Problem Solving'}</span>
              <div className="mini-bar-track">
                <div className="mini-bar-fill" style={{ width: `${Math.max(15, Math.min(100, (dashboard?.progress?.find(p => p.skill.includes('problem'))?.accuracy || 68)))}%` }} />
              </div>
            </div>
          </div>
          <button className="text-btn view-all-btn" onClick={() => navigate('/progress')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>{language === 'ur' ? 'مکمل رپورٹ دیکھیں' : 'View Full Report'}</span>
            <ArrowRightIcon size={13} />
          </button>
        </div>
      </section>

      {/* Row 2: Core Skill Modules & Practice Scenarios */}
      <section className="dashboard-section">
        <div className="section-title-wrap">
          <div>
            <p className="kicker">{t('skills.teen.kicker') || 'CORE PRACTICE MODULES'}</p>
            <h2 className="section-main-heading">
              {t('skills.teen.heading') || 'Personalized Teen Skill Modules'}
            </h2>
          </div>
          <button className="btn-secondary btn-sm" onClick={() => navigate('/scenarios')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>{language === 'ur' ? 'تمام منظرنامے دیکھیں' : 'View All Scenarios'}</span>
            <ArrowRightIcon size={13} />
          </button>
        </div>

        <div className="modules-web-grid">
          {teenModules.map((mod) => (
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
