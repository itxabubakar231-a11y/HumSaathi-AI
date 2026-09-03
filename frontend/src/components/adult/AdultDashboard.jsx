import { useState } from 'react';
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
      icon: '💡',
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
    if (recommendation?.scenarioId) {
      navigate('/scenarios');
      return;
    }
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
      return language === 'ur' ? 'عملی مطالعہ (دفتری نوٹس، بلز)' : language === 'ur_rm' ? 'Functional Reading' : 'Functional Reading';
    }
    if (key.includes('problem') || key.includes('solving')) {
      return language === 'ur' ? 'روزمرہ مسائل کا حل (ٹرانزٹ، ترجیحات)' : language === 'ur_rm' ? 'Practical Problem Solving' : 'Practical Problem Solving';
    }
    if (key.includes('workplace')) {
      return language === 'ur' ? 'پیشہ ورانہ و دفتری گفتگو' : language === 'ur_rm' ? 'Workplace Communication' : 'Workplace Communication';
    }
    if (key.includes('comm') || key.includes('social') || key.includes('everyday')) {
      return language === 'ur' ? 'روزمرہ گفتگو (بینک، ڈاکٹر، شاپنگ)' : language === 'ur_rm' ? 'Everyday Communication' : 'Everyday Communication';
    }
    return skillKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Extract real metrics safely without fallback numbers
  const todayCount = dashboard?.todayCompletedCount || 0;
  const currentStreak = dashboard?.currentStreak || 0;
  const weeklyDays = Array.isArray(dashboard?.weeklyActivityDays) ? dashboard.weeklyActivityDays : [];
  const progressList = dashboard?.progress || [];
  const hasProgress = progressList.length > 0;

  // Real skills
  const workplaceProgress = progressList.find((p) => p.skill.includes('workplace'));
  const everydayProgress = progressList.find((p) => p.skill.includes('everyday') || p.skill.includes('comm') || p.skill.includes('conversation'));
  const readingProgress = progressList.find((p) => p.skill.includes('reading') || p.skill.includes('functional'));
  const problemProgress = progressList.find((p) => p.skill.includes('problem'));

  // Workplace scenarios goal count (from real attempts / progress)
  const workplaceCompletedCount = workplaceProgress?.attempts || (dashboard?.recentAttempts?.filter(a => String(a.topic).includes('workplace') || String(a.title).toLowerCase().includes('manager') || String(a.title).toLowerCase().includes('interview') || String(a.title).toLowerCase().includes('shift')).length || 0);

  // Recommendation title formatting
  const recTitle =
    recommendation?.title?.[language] ||
    recommendation?.title?.en ||
    (recommendation?.title ? String(recommendation.title) : null) ||
    formatSkillName(recommendation?.topic || recommendation?.activityType) ||
    '🎯 Handling a Workplace Disagreement';

  const recDuration = recommendation?.duration || '5 minutes';
  const recDifficulty = recommendation?.difficulty ? String(recommendation.difficulty).toUpperCase() : 'PRACTICAL';
  const recReason =
    recommendation?.reason ||
    (language === 'ur'
      ? 'آپ کی حالیہ پیشرفت کی روشنی میں اگلا تجویز کردہ عملی ٹاسک۔'
      : 'Recommended based on your recent communication and workplace practice.');

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
              ? `خوش آمدید، ${user?.name || 'لرنر'} 👋`
              : language === 'ur_rm'
              ? `Welcome, ${user?.name || 'Learner'} 👋`
              : `Welcome, ${user?.name || 'Learner'} 👋`}
          </h1>
          <p className="hero-greeting-subtitle">
            {language === 'ur'
              ? 'دفتری مواصلات، بجٹ، فارم پر کرنے اور روزمرہ مسائل کو اعتماد کے ساتھ حل کرنے کا پرسکون ذاتی پلیٹ فارم۔'
              : language === 'ur_rm'
              ? 'Workplace communication, bill calculations, safety notices, aur daily decision-making practice.'
              : 'Practical workplace communication, bill calculations, safety notices, and everyday decision-making.'}
          </p>
          <div className="hero-meta-chips">
            <span className="hero-chip">💼 {t('persona.adult')} ({language === 'ur' ? '20+ سال' : '20+ years'})</span>
            <span className="hero-chip">🎯 {language === 'ur' ? 'مہارت کی سطح' : 'Proficiency'}: {dashboard?.currentLevel || 'Practical Intermediate'}</span>
            <span className="hero-chip">✅ {dashboard?.completedCount || 0} {language === 'ur' ? 'عملی ٹاسک مکمل' : language === 'ur_rm' ? 'Tasks Completed' : 'Tasks Completed'}</span>
          </div>
        </div>
        <div className="hero-banner-actions">
          <button className="btn-primary hero-cta-btn" onClick={() => navigate('/scenarios')} style={{ background: '#2C7A7B' }}>
            💼 {language === 'ur' ? 'عملی مشق شروع کریں' : language === 'ur_rm' ? 'Practical Mashq Shuru Karein' : 'Start Practical Practice'}
          </button>
        </div>
      </header>

      {/* Row 0: "Your Next Best Practice" Recommendation Card */}
      <section
        className="dashboard-card adult-recommendation-card"
        style={{
          marginBottom: 'var(--space-md)',
          background: 'linear-gradient(135deg, rgba(49, 151, 149, 0.1) 0%, rgba(59, 130, 246, 0.08) 100%)',
          border: '1.5px solid rgba(49, 151, 149, 0.35)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: '1 1 320px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  background: '#2C7A7B',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {language === 'ur' ? 'تجویز کردہ اگلا اقدام' : language === 'ur_rm' ? 'Recommended Next Action' : 'Your Next Best Practice'}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {recDifficulty} · {recDuration}
              </span>
            </div>
            <h3 style={{ margin: '4px 0 6px', fontSize: '1.35rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 700 }}>
              {recTitle}
            </h3>
            <p style={{ margin: 0, fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: '1.55' }}>
              {recReason}
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={startRecommended}
            style={{
              padding: '0.75rem 1.4rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              background: '#2C7A7B',
              boxShadow: '0 4px 14px rgba(44, 122, 123, 0.25)',
            }}
          >
            {language === 'ur' ? 'یہ ٹاسک شروع کریں' : language === 'ur_rm' ? 'Start This Task' : 'Start This Task'} ➔
          </button>
        </div>
      </section>

      {/* Row 1: Key Routine, Weekly Consistency, Workplace Goals */}
      <section className="dashboard-stats-row">
        {/* Card 1: Today's Routine */}
        <div className="dashboard-stat-box plan-box">
          <div className="stat-box-header">
            <span className="stat-box-icon">📋</span>
            <div>
              <span className="stat-box-kicker">
                {language === 'ur' ? 'آج کا روٹین' : language === 'ur_rm' ? 'Today\'s Routine' : 'Today\'s Routine'}
              </span>
              <h3 className="stat-box-title">
                {todayCount} / 3 {language === 'ur' ? 'ٹاسک' : language === 'ur_rm' ? 'Tasks' : 'Tasks'}
              </h3>
            </div>
          </div>
          <p className="stat-box-desc">
            {todayCount >= 3
              ? (language === 'ur' ? '🎉 روزانہ کا روٹین مکمل ہو گیا۔' : '🎉 Routine goal accomplished today.')
              : (language === 'ur' ? '10-15 منٹ خود مختار مہارتوں کی روزانہ مشق۔' : '10-15 min daily life-skills practice.')}
          </p>
          <div className="mini-bar-track" style={{ height: '8px', background: 'rgba(0,0,0,0.08)', borderRadius: '9999px', margin: '8px 0 12px' }}>
            <div
              className="mini-bar-fill"
              style={{
                width: `${Math.min(100, Math.round((todayCount / 3) * 100))}%`,
                height: '100%',
                background: '#2C7A7B',
                borderRadius: '9999px',
              }}
            />
          </div>
          <button className="btn-primary stat-action-btn" onClick={() => navigate('/scenarios')} style={{ background: '#2C7A7B' }}>
            {language === 'ur' ? 'روٹین شروع کریں' : language === 'ur_rm' ? 'Routine Shuru Karein' : 'Start Routine'} →
          </button>
        </div>

        {/* Card 2: Weekly Consistency (Real data only) */}
        <div className="dashboard-stat-box streak-box">
          <div className="stat-box-header">
            <span className="stat-box-icon">🔥</span>
            <div>
              <span className="stat-box-kicker">
                {language === 'ur' ? 'ہفتہ وار تسلسل' : language === 'ur_rm' ? 'Weekly Consistency' : 'Weekly Consistency'}
              </span>
              <h3 className="stat-box-title">
                {currentStreak} {language === 'ur' ? 'دن متواتر' : language === 'ur_rm' ? 'Days Active' : 'Days Active'}
              </h3>
            </div>
          </div>
          <p className="stat-box-desc">
            {currentStreak > 0
              ? (language === 'ur' ? 'بہترین مستقل مزاجی! کیریئر اور خود مختاری کے اہداف پورے ہو رہے ہیں۔' : 'Great consistency! Career & life goals on track.')
              : (language === 'ur' ? 'آج کی مشق کر کے اپنا ہفتہ وار تسلسل قائم کریں۔' : 'Complete today\'s practice to start your consistency streak.')}
          </p>
          {/* Real weekly activity dots */}
          <div className="streak-dots-bar" style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
              const isActive = weeklyDays.includes(i);
              return (
                <span
                  key={i}
                  className={`streak-dot ${isActive ? 'is-active' : ''}`}
                  title={`Day ${day}: ${isActive ? 'Active' : 'No practice recorded'}`}
                  style={{
                    width: '28px',
                    height: '28px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: isActive ? '#2C7A7B' : 'rgba(0,0,0,0.06)',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    border: isActive ? 'none' : '1px solid var(--border-color)',
                  }}
                >
                  {day}
                </span>
              );
            })}
          </div>
        </div>

        {/* Card 3: Workplace Goal: Complete 2 workplace scenarios */}
        <div className="dashboard-stat-box progress-box">
          <div className="stat-box-header">
            <span className="stat-box-icon">🏢</span>
            <div>
              <span className="stat-box-kicker">
                {language === 'ur' ? 'دفتری ہدف' : language === 'ur_rm' ? 'Workplace Goal' : 'Workplace Goal'}
              </span>
              <h3 className="stat-box-title">
                {Math.min(2, workplaceCompletedCount)} / 2 {language === 'ur' ? 'منظرنامے' : 'Scenarios'}
              </h3>
            </div>
          </div>
          <p className="stat-box-desc">
            {workplaceCompletedCount >= 2
              ? (language === 'ur' ? '🎉 دفتری اہداف مکمل! آپ اعتماد کے ساتھ بات چیت کر رہے ہیں۔' : '🎉 Goal met! You are communicating with workplace confidence.')
              : (language === 'ur' ? 'کیریئر کی ترقی کے لیے 2 دفتری منظرنامے مکمل کریں۔' : 'Goal: Complete 2 workplace scenarios to build communication mastery.')}
          </p>
          <div className="mini-bar-track" style={{ height: '8px', background: 'rgba(0,0,0,0.08)', borderRadius: '9999px', margin: '8px 0 12px' }}>
            <div
              className="mini-bar-fill"
              style={{
                width: `${Math.min(100, Math.round((Math.min(2, workplaceCompletedCount) / 2) * 100))}%`,
                height: '100%',
                background: '#2C7A7B',
                borderRadius: '9999px',
              }}
            />
          </div>
          <button className="text-btn view-all-btn" onClick={() => navigate('/scenarios?category=workplace')} style={{ marginTop: 'auto' }}>
            {language === 'ur' ? 'دفتری مشقیں دیکھیں' : language === 'ur_rm' ? 'Workplace Scenarios' : 'View Workplace Scenarios'} ➔
          </button>
        </div>
      </section>

      {/* Row 2: Workplace Communication Scenarios Grid */}
      <section className="dashboard-section" style={{ marginTop: 'var(--space-lg)' }}>
        <div className="section-title-wrap">
          <div>
            <p className="kicker" style={{ color: '#2C7A7B' }}>CAREER & WORKPLACE</p>
            <h2 className="section-main-heading">
              💼 {language === 'ur' ? 'دفتری مواصلاتی مشقیں' : 'Workplace Communication'}
            </h2>
          </div>
          <button className="btn-secondary btn-sm" onClick={() => navigate('/scenarios?category=workplace')}>
            {language === 'ur' ? 'تمام دفتری منظرنامے' : 'View All Workplace'} ➔
          </button>
        </div>

        <div className="modules-web-grid">
          {[
            {
              id: 'scenario_adult_job_interview',
              icon: '👔',
              title: 'Job Interview Practice',
              desc: 'Answering questions about experience, strengths, and professional interest with calm confidence.',
              tag: 'Interview Prep',
            },
            {
              id: 'scenario_manager_clarification',
              icon: '📋',
              title: 'Talking to a Manager',
              desc: 'Asking for guidance when project priorities or deadlines need immediate clarification.',
              tag: 'Management',
            },
            {
              id: 'scenario_adult_workplace_meeting',
              icon: '👥',
              title: 'Workplace Meeting Participation',
              desc: 'Providing crisp status updates, confirming deadlines, and collaborating on deliverables.',
              tag: 'Team Meetings',
            },
            {
              id: 'scenario_adult_workplace_disagreement',
              icon: '⚖️',
              title: 'Workplace Disagreement',
              desc: 'Resolving a task allocation dispute with a coworker constructively without conflict.',
              tag: 'Conflict Resolution',
            },
            {
              id: 'scenario_adult_prof_intro',
              icon: '🤝',
              title: 'Professional Introduction',
              desc: 'Introducing yourself clearly to a new team member and initiating a positive dialogue.',
              tag: 'Networking',
            },
            {
              id: 'scenario_adult_colleague_shift',
              icon: '🔄',
              title: 'Requesting a Shift Swap',
              desc: 'Explaining a scheduling conflict and proposing a fair shift exchange with a peer.',
              tag: 'Peer Dialogue',
            },
          ].map((item) => (
            <div key={item.id} className="module-web-card">
              <div className="module-card-top">
                <div className="module-icon-badge" style={{ fontSize: '1.4rem' }}>{item.icon}</div>
                <span className="module-category-pill" style={{ background: 'rgba(49, 151, 149, 0.15)', color: '#2C7A7B' }}>
                  {item.tag}
                </span>
              </div>
              <div className="module-card-body">
                <h3 className="module-title">{item.title}</h3>
                <p className="module-desc">{item.desc}</p>
              </div>
              <div className="module-card-footer">
                <button
                  className="btn-primary module-launch-btn"
                  type="button"
                  onClick={() => navigate('/scenarios')}
                  style={{ background: '#2C7A7B' }}
                >
                  {language === 'ur' ? 'مشق شروع کریں' : 'Practice Scenario'} ➔
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Row 3: Everyday Communication & Practical Problem Solving */}
      <section className="dashboard-section-split" style={{ marginTop: 'var(--space-lg)' }}>
        {/* Left: Everyday Communication */}
        <div className="dashboard-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div className="card-header-line">
            <div>
              <span className="kicker" style={{ color: '#2C7A7B' }}>EVERYDAY LIFE</span>
              <h3 className="card-heading-title" style={{ marginTop: '2px' }}>
                🗣️ Everyday Communication
              </h3>
            </div>
            <button className="text-btn" onClick={() => navigate('/scenarios?category=everyday')}>
              View All ➔
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem' }}>
            {[
              { icon: '🩺', title: 'Doctor Appointment', desc: 'Booking, rescheduling, and discussing symptoms clearly.' },
              { icon: '🏦', title: 'Bank Conversation', desc: 'Inquiring about account statements and debit card activation.' },
              { icon: '🍽️', title: 'Restaurant Dining', desc: 'Ordering meals and asking about ingredients politely.' },
              { icon: '📞', title: 'Customer Support', desc: 'Resolving a billing dispute calmly and factually.' },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => navigate('/scenarios')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)',
                  transition: 'background 0.2s ease',
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)', display: 'block' }}>{item.title}</strong>
                  <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{item.desc}</small>
                </div>
                <span style={{ color: '#2C7A7B', fontWeight: 700 }}>➔</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Practical Problem Solving & Real-World Phone Practice */}
        <div className="dashboard-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div className="card-header-line">
            <div>
              <span className="kicker" style={{ color: '#2C7A7B' }}>INDEPENDENCE</span>
              <h3 className="card-heading-title" style={{ marginTop: '2px' }}>
                🧩 Practical Problem Solving
              </h3>
            </div>
            <button className="text-btn" onClick={() => navigate('/scenarios?category=problem_solving')}>
              View All ➔
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '1rem' }}>
            <div
              style={{
                padding: '12px 14px',
                background: 'rgba(49, 151, 149, 0.08)',
                border: '1px solid rgba(49, 151, 149, 0.25)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span>🚌</span>
                <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>Your bus was cancelled and you need to reach work. What would you do?</strong>
              </div>
              <p style={{ margin: '4px 0 8px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Practice calling your supervisor, giving a realistic ETA, and deciding on alternative transit.
              </p>
              <button
                className="btn-primary"
                onClick={() => navigate('/scenarios')}
                style={{ fontSize: '0.82rem', padding: '5px 12px', background: '#2C7A7B' }}
              >
                Practice Transit Scenario ➔
              </button>
            </div>

            <div
              style={{
                padding: '12px 14px',
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span>✉️</span>
                <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>You received an email you do not understand. How would you ask for clarification?</strong>
              </div>
              <p style={{ margin: '4px 0 8px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Practice asking your lead specific questions politely without feeling embarrassed.
              </p>
              <button
                className="btn-primary"
                onClick={() => navigate('/scenarios')}
                style={{ fontSize: '0.82rem', padding: '5px 12px', background: '#6366f1' }}
              >
                Practice Clarification Scenario ➔
              </button>
            </div>

            {/* Voice / Real-World Phone Call Simulation Banner */}
            <div
              style={{
                padding: '10px 14px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', display: 'block' }}>🎙️ Adult Phone Call Practice</strong>
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Voice-assisted real-world simulation</small>
              </div>
              <button
                className="btn-secondary"
                onClick={() => navigate('/scenarios')}
                style={{ fontSize: '0.82rem', padding: '4px 10px' }}
              >
                Launch Voice Practice
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Row 4: Core Functional Modules & Skill Meters */}
      <section className="dashboard-section" style={{ marginTop: 'var(--space-lg)' }}>
        <div className="section-title-wrap">
          <div>
            <p className="kicker" style={{ color: '#2C7A7B' }}>{t('skills.adult.kicker') || 'INDEPENDENT LIVING & WORKPLACE'}</p>
            <h2 className="section-main-heading">
              {t('skills.adult.heading') || 'Practical Adult Skill Modules'}
            </h2>
          </div>
        </div>

        <div className="modules-web-grid">
          {adultModules.map((mod) => (
            <div key={mod.id} className="module-web-card">
              <div className="module-card-top">
                <div className="module-icon-badge" style={{ fontSize: '1.4rem' }}>{mod.icon}</div>
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

      {/* Row 5: Real Skill Snapshot */}
      <section className="dashboard-card" style={{ marginTop: 'var(--space-lg)', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <div className="card-header-line">
          <h3 className="card-heading-title">📈 Workplace & Independent Life Mastery</h3>
          <button className="text-btn" onClick={() => navigate('/progress')}>
            View Analytics ➔
          </button>
        </div>

        <div className="metric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {[
            { id: 'workplace', label: 'Workplace Communication', match: workplaceProgress, defaultLevel: 'Developing' },
            { id: 'everyday', label: 'Everyday Communication', match: everydayProgress, defaultLevel: 'Developing' },
            { id: 'reading', label: 'Functional Reading', match: readingProgress, defaultLevel: 'Practicing' },
            { id: 'problem', label: 'Problem Solving & Decisions', match: problemProgress, defaultLevel: 'Practicing' },
          ].map((item) => {
            const hasData = Boolean(item.match && item.match.attempts > 0);
            const acc = hasData ? Math.round(item.match.accuracy * 100) : 0;
            return (
              <div key={item.id} style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</span>
                  {hasData ? (
                    <strong style={{ fontSize: '0.92rem', color: '#2C7A7B' }}>{acc}%</strong>
                  ) : (
                    <small style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Not started</small>
                  )}
                </div>
                <div style={{ height: '6px', background: 'rgba(0,0,0,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: hasData ? `${Math.max(8, Math.min(100, acc))}%` : '0%',
                      height: '100%',
                      background: '#2C7A7B',
                      borderRadius: '9999px',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {!hasProgress && (
          <p style={{ margin: '1rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center' }}>
            Complete your first practical module or scenario to unlock personalized performance metrics.
          </p>
        )}
      </section>
    </div>
  );
}
