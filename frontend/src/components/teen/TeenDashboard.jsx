import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';

const TEEN_DAILY_CHALLENGES = [
  {
    id: 'open_question',
    icon: '💬',
    title: {
      en: 'Ask an Open-Ended Question',
      ur: 'کھلا سوال پوچھیں جس کا تفصیلی جواب ہو',
      ur_rm: 'Open-ended question poochein',
    },
    desc: {
      en: 'Practice asking a question that requires more than a simple yes or no.',
      ur: 'ایسا سوال پوچھنے کی مشق کریں جس کا جواب صرف ہاں یا نہ میں نہ ہو۔',
      ur_rm: 'Aisa question poochein jo conversation ko actively expand kare.',
    },
    prompt: {
      en: 'Try asking: "What was the most interesting part of your day?" or "How did you approach this project?"',
      ur: 'کوشش کریں: "آج آپ کے دن کا سب سے دلچسپ حصہ کون سا تھا؟"',
      ur_rm: 'Try karein: "Aap ke din ka sab se interesting part konsa tha?"',
    },
    scenarioId: 'scenario_group_discussion',
    actionLabel: { en: 'Try Today\'s Challenge', ur: 'آج کا چیلنج آزمائیں', ur_rm: 'Aaj Ka Challenge Try Karein' },
  },
  {
    id: 'introduce_yourself',
    icon: '🤝',
    title: {
      en: 'Practice Introducing Yourself',
      ur: 'اپنا پرسکون تعارف کروائیں',
      ur_rm: 'Apna friendly introduction dein',
    },
    desc: {
      en: 'Practice stepping forward with confidence to share your name and an interest.',
      ur: 'اعتماد کے ساتھ اپنا نام اور کوئی پسندیدہ سرگرمی شیئر کرنے کی مشق کریں۔',
      ur_rm: 'Confidence ke sath apna name aur hobby share karne ki practice karein.',
    },
    prompt: {
      en: 'Try saying: "Hi, I\'m Ali. I\'m interested in coding and creative projects. What do you enjoy?"',
      ur: 'کوشش کریں: "ہیلو، میرا نام علی ہے۔ مجھے کمپیوٹر اور تخلیقی کام پسند ہیں۔ آپ کو کیا پسند ہے؟"',
      ur_rm: 'Try karein: "Hi, mera name Ali hai. Mujhe coding pasand hai. Aap ko kya pasand hai?"',
    },
    scenarioId: 'scenario_teen_intro_club',
    actionLabel: { en: 'Practice Introduction', ur: 'تعارف کی مشق کریں', ur_rm: 'Introduction Ki Practice' },
  },
  {
    id: 'ask_clarification',
    icon: '❓',
    title: {
      en: 'Ask Someone for Clarification',
      ur: 'شائستگی سے وضاحت طلب کریں',
      ur_rm: 'Politely clarification maangein',
    },
    desc: {
      en: 'When instructions feel confusing, practice asking for guidance without hesitation.',
      ur: 'جب کوئی بات سمجھ نہ آئے تو بغیر جھجھک شائستگی سے دوبارہ پوچھیں۔',
      ur_rm: 'Jab instruction samajh na aye toh bina jhijhak dobara poochein.',
    },
    prompt: {
      en: 'Try saying: "Could you please explain that step again? I want to make sure I understand correctly."',
      ur: 'کوشش کریں: "کیا آپ یہ مرحلہ دوبارہ سمجھا سکتے ہیں؟ میں تسلی کرنا چاہتا ہوں۔"',
      ur_rm: 'Try karein: "Kya aap yeh step dobara explain kar sakte hain?"',
    },
    scenarioId: 'scenario_teen_need_help',
    actionLabel: { en: 'Practice Asking Help', ur: 'وضاحت کی مشق کریں', ur_rm: 'Clarification Ki Practice' },
  },
  {
    id: 'express_opinion',
    icon: '🗣️',
    title: {
      en: 'Express an Opinion Politely',
      ur: 'شائستگی سے اپنی رائے کا اظہار کریں',
      ur_rm: 'Politely apni opinion share karein',
    },
    desc: {
      en: 'Share your perspective in a group discussion calmly, even if you see things differently.',
      ur: 'گروپ گفتگو میں اپنا مؤقف شائستہ انداز میں پیش کریں۔',
      ur_rm: 'Group discussion mein apna point of view calmly express karein.',
    },
    prompt: {
      en: 'Try saying: "I understand that viewpoint, and another idea we could consider is..."',
      ur: 'کوشش کریں: "میں آپ کی بات سمجھتا ہوں، اور ایک اور پہلو یہ بھی ہو سکتا ہے..."',
      ur_rm: 'Try karein: "Main aap ki baat samajhta hoon, aur doosra idea yeh hai..."',
    },
    scenarioId: 'scenario_teen_express_pref',
    actionLabel: { en: 'Practice in Discussion', ur: 'رائے دینے کی مشق کریں', ur_rm: 'Opinion Share Karein' },
  },
  {
    id: 'need_help',
    icon: '🆘',
    title: {
      en: 'Practice Saying "I Need Help"',
      ur: 'کھل کر کہیں "مجھے مدد درکار ہے"',
      ur_rm: 'Practice saying "I need help"',
    },
    desc: {
      en: 'Recognize when you are stuck and practice reaching out for support early.',
      ur: 'مشکل پیش آنے پر وقت پر استاد یا ساتھی سے مدد مانگیں۔',
      ur_rm: 'Difficulty hone par timely teacher ya peer se help maangein.',
    },
    prompt: {
      en: 'Try saying: "I\'m having trouble with this worksheet. Could we look at question 2 together?"',
      ur: 'کوشش کریں: "مجھے اس کام میں دشواری ہو رہی ہے۔ کیا ہم مل کر دیکھ سکتے ہیں؟"',
      ur_rm: 'Try karein: "Mujhe is task mein mushkil hai, kya hum mil kar dekh sakte hain?"',
    },
    scenarioId: 'scenario_teen_need_help',
    actionLabel: { en: 'Try This Challenge', ur: 'یہ چیلنج آزمائیں', ur_rm: 'Yeh Challenge Try Karein' },
  },
  {
    id: 'handle_disagreement',
    icon: '🎯',
    title: {
      en: 'Handle a Disagreement Constructively',
      ur: 'اختلاف رائے کو پرسکون انداز میں حل کریں',
      ur_rm: 'Disagreement ko constructively handle karein',
    },
    desc: {
      en: 'Practice hearing someone else out and finding a shared compromise.',
      ur: 'دوسرے کا مؤقف سنیں اور مل کر درمیانی راستہ نکالیں۔',
      ur_rm: 'Doosre ka perspective sun kar fair compromise find karein.',
    },
    prompt: {
      en: 'Try saying: "I see why you feel that way. Let\'s look at how we can divide the tasks fairly."',
      ur: 'کوشش کریں: "میں سمجھتا ہوں کہ آپ ایسا کیوں سوچتے ہیں۔ آئیے کام کی منصفانہ تقسیم کر لیتے ہیں۔"',
      ur_rm: 'Try karein: "Aaiye mil kar tasks ko fairly divide kar lete hain."',
    },
    scenarioId: 'scenario_teen_peer_dispute',
    actionLabel: { en: 'Practice Resolving Dispute', ur: 'مسئلہ حل کرنے کی مشق', ur_rm: 'Dispute Solve Karein' },
  },
  {
    id: 'active_listening',
    icon: '👂',
    title: {
      en: 'Practice Active Listening',
      ur: 'توجہ سے سنیں اور تصدیق کریں',
      ur_rm: 'Active listening ki practice karein',
    },
    desc: {
      en: 'Acknowledge what someone just said before replying to show full engagement.',
      ur: 'جواب دینے سے پہلے ساتھی کی بات دہرائیں تاکہ ظاہر ہو کہ آپ توجہ سے سن رہے ہیں۔',
      ur_rm: 'Reply dene se pehle summarize karein ke aap ne kya suna.',
    },
    prompt: {
      en: 'Try saying: "So if I heard you right, you prefer the first design because it is simpler?"',
      ur: 'کوشش کریں: "یعنی آپ اس ڈیزائن کو ترجیح دیتے ہیں کیونکہ یہ زیادہ آسان ہے؟"',
      ur_rm: 'Try karein: "Aap first option prefer karte hain kyunki yeh simple hai?"',
    },
    scenarioId: 'scenario_new_person',
    actionLabel: { en: 'Practice Active Listening', ur: 'سننے کی مشق کریں', ur_rm: 'Active Listening Practice' },
  },
];

export default function TeenDashboard({ user, dashboard, recommendation, activities }) {
  const { t, language } = useI18n();
  const navigate = useNavigate();

  // Pick today's challenge deterministically based on day of year
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % TEEN_DAILY_CHALLENGES.length;
  const todayChallenge = TEEN_DAILY_CHALLENGES[dayIndex];

  const teenModules = [
    {
      id: 'teen_reading_vocab',
      titleKey: 'skills.teen.readingVocab.title',
      descKey: 'skills.teen.readingVocab.desc',
      icon: '📖',
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
      icon: '💡',
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
      icon: '🗣️',
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
    if (recommendation?.scenarioId) {
      navigate('/scenarios');
      return;
    }
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
    if (key.includes('comm') || key.includes('social') || key.includes('conversation')) {
      return language === 'ur' ? 'گفتگو اور سماجی مہارتیں' : language === 'ur_rm' ? 'Social Communication' : 'Social Communication';
    }
    return skillKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Extract real metrics safely without fallback numbers
  const todayCount = dashboard?.todayCompletedCount || 0;
  const currentStreak = dashboard?.currentStreak || 0;
  const weeklyDays = Array.isArray(dashboard?.weeklyActivityDays) ? dashboard.weeklyActivityDays : [];
  const progressList = dashboard?.progress || [];
  const hasProgress = progressList.length > 0;

  // Find real skills
  const commProgress = progressList.find((p) => p.skill.includes('comm') || p.skill.includes('social') || p.skill.includes('conversation'));
  const readingProgress = progressList.find((p) => p.skill.includes('reading'));
  const vocabProgress = progressList.find((p) => p.skill.includes('vocab') || p.skill.includes('reading'));
  const problemProgress = progressList.find((p) => p.skill.includes('problem'));

  // Recommendation title formatting
  const recTitle =
    recommendation?.title?.[language] ||
    recommendation?.title?.en ||
    (recommendation?.title ? String(recommendation.title) : null) ||
    formatSkillName(recommendation?.topic || recommendation?.activityType) ||
    '🎯 Handling a Disagreement';

  const recDuration = recommendation?.duration || '5 minutes';
  const recDifficulty = recommendation?.difficulty ? String(recommendation.difficulty).toUpperCase() : 'INTERMEDIATE';
  const recReason =
    recommendation?.reason ||
    (language === 'ur'
      ? 'آپ کی حالیہ گفتگو کی مشق کی بنیاد پر تجویز کردہ۔'
      : 'Recommended based on your recent communication practice.');

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
              ? `السلام علیکم، ${user?.name || 'لرنر'} 👋`
              : language === 'ur_rm'
              ? `Assalam-o-Alaikum, ${user?.name || 'Learner'} 👋`
              : `Assalam-o-Alaikum, ${user?.name || 'Learner'} 👋`}
          </h1>
          <p className="hero-greeting-subtitle">
            {language === 'ur'
              ? 'مواصلات، بجٹ اور روزمرہ مسائل حل کرنے کی جدید، ذاتی اور پرسکون تعلیمی مشق۔'
              : language === 'ur_rm'
              ? 'Social communication, budget planning, aur real-world problem solving with adaptive practice.'
              : 'Empowering your communication, budget planning, and everyday decision making with calm, adaptive practice.'}
          </p>
          <div className="hero-meta-chips">
            <span className="hero-chip">🧑‍🎓 {t('persona.teen')} ({language === 'ur' ? '13-19 سال' : '13-19 years'})</span>
            <span className="hero-chip">📈 {language === 'ur' ? 'لیول' : 'Level'}: {dashboard?.currentLevel || 'Intermediate'}</span>
            <span className="hero-chip">✅ {dashboard?.completedCount || 0} {language === 'ur' ? 'سرگرمیاں مکمل' : language === 'ur_rm' ? 'Activities Done' : 'Activities Completed'}</span>
          </div>
        </div>
        <div className="hero-banner-actions">
          <button className="btn-primary hero-cta-btn" onClick={() => navigate('/scenarios')}>
            ⚡ {language === 'ur' ? 'آج کی مشق شروع کریں' : language === 'ur_rm' ? 'Aaj ki mashq shuru karein' : 'Start Today\'s Practice'}
          </button>
        </div>
      </header>

      {/* Row 0: "Your Next Best Practice" Recommendation Card */}
      <section
        className="dashboard-card teen-recommendation-card"
        style={{
          marginBottom: 'var(--space-md)',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.12) 100%)',
          border: '1.5px solid rgba(124, 111, 159, 0.35)',
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
                  background: 'var(--primary-green)',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {language === 'ur' ? 'آپ کا اگلا بہترین قدم' : language === 'ur_rm' ? 'Next Best Practice' : 'Your Next Best Practice'}
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
              boxShadow: '0 4px 14px rgba(11, 107, 58, 0.25)',
            }}
          >
            {language === 'ur' ? 'یہ مشق شروع کریں' : language === 'ur_rm' ? 'Start Practice' : 'Start Practice'} ➔
          </button>
        </div>
      </section>

      {/* Row 1: Teen Daily Communication Challenge */}
      <section
        className="dashboard-card teen-daily-challenge-card"
        style={{
          marginBottom: 'var(--space-md)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderInlineStart: '5px solid #6366f1',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: '1 1 320px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.2rem' }}>{todayChallenge.icon}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {language === 'ur' ? 'آج کا بات چیت کا چیلنج' : language === 'ur_rm' ? 'Daily Comm Challenge' : 'Teen Daily Communication Challenge'}
              </span>
            </div>
            <h3 style={{ margin: '4px 0 6px', fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              {todayChallenge.title[language] || todayChallenge.title.en}
            </h3>
            <p style={{ margin: '0 0 8px', fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {todayChallenge.desc[language] || todayChallenge.desc.en}
            </p>
            <div
              style={{
                background: 'rgba(99, 102, 241, 0.08)',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px dashed rgba(99, 102, 241, 0.3)',
                fontSize: '0.88rem',
                color: 'var(--text-primary)',
                fontStyle: 'italic',
              }}
            >
              💡 {todayChallenge.prompt[language] || todayChallenge.prompt.en}
            </div>
          </div>
          <button
            className="btn-primary"
            type="button"
            onClick={() => navigate('/scenarios')}
            style={{
              alignSelf: 'center',
              padding: '0.7rem 1.35rem',
              fontSize: '0.92rem',
              background: '#6366f1',
              color: '#fff',
            }}
          >
            {todayChallenge.actionLabel[language] || todayChallenge.actionLabel.en} ➔
          </button>
        </div>
      </section>

      {/* Row 2: Today's Plan, Real Streak, Overall Progress */}
      <section className="dashboard-stats-row">
        {/* Card 1: Today's Plan */}
        <div className="dashboard-stat-box plan-box">
          <div className="stat-box-header">
            <span className="stat-box-icon">🎯</span>
            <div>
              <span className="stat-box-kicker">
                {language === 'ur' ? 'آج کا ہدف' : language === 'ur_rm' ? 'Aaj Ka Goal' : 'Today\'s Goal'}
              </span>
              <h3 className="stat-box-title">
                {todayCount} / 3 {language === 'ur' ? 'سرگرمیاں' : language === 'ur_rm' ? 'Activities' : 'Activities'}
              </h3>
            </div>
          </div>
          <p className="stat-box-desc">
            {todayCount >= 3
              ? (language === 'ur' ? '🎉 زبردست! آج کا ہدف مکمل ہو گیا۔' : '🎉 Awesome! Daily goal accomplished.')
              : (language === 'ur' ? '15-20 منٹ روزانہ مشق کا پرسکون ہدف۔' : '15-20 min calm daily practice goal.')}
          </p>
          <div className="mini-bar-track" style={{ height: '8px', background: 'rgba(0,0,0,0.08)', borderRadius: '9999px', margin: '8px 0 12px' }}>
            <div
              className="mini-bar-fill"
              style={{
                width: `${Math.min(100, Math.round((todayCount / 3) * 100))}%`,
                height: '100%',
                background: 'var(--gradient-primary)',
                borderRadius: '9999px',
              }}
            />
          </div>
          <button className="btn-primary stat-action-btn" onClick={() => navigate('/scenarios')}>
            {language === 'ur' ? 'مشق شروع کریں' : language === 'ur_rm' ? 'Mashq Shuru Karein' : 'Practice Now'} →
          </button>
        </div>

        {/* Card 2: Current Streak (Real data only) */}
        <div className="dashboard-stat-box streak-box">
          <div className="stat-box-header">
            <span className="stat-box-icon">🔥</span>
            <div>
              <span className="stat-box-kicker">
                {language === 'ur' ? 'مسلسل کارکردگی' : language === 'ur_rm' ? 'Current Streak' : 'Current Streak'}
              </span>
              <h3 className="stat-box-title">
                {currentStreak} {language === 'ur' ? 'دن' : language === 'ur_rm' ? 'Days' : 'Days'}
              </h3>
            </div>
          </div>
          <p className="stat-box-desc">
            {currentStreak > 0
              ? (language === 'ur' ? 'شاندار مستقل مزاجی! آگے بڑھتے رہیں۔' : 'Great consistency! Keep up the momentum.')
              : (language === 'ur' ? 'آج کی مشق مکمل کر کے اپنا تسلسل شروع کریں۔' : 'Complete today\'s practice to start your streak!')}
          </p>
          {/* Weekly activity dots (only lit up for days with real activity) */}
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
                    background: isActive ? 'var(--primary-green)' : 'rgba(0,0,0,0.06)',
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

        {/* Card 3: Overall Progress */}
        <div className="dashboard-stat-box progress-box">
          <div className="stat-box-header">
            <span className="stat-box-icon">📊</span>
            <div>
              <span className="stat-box-kicker">
                {language === 'ur' ? 'مجموعی پیشرفت' : language === 'ur_rm' ? 'Overall Progress' : 'Overall Progress'}
              </span>
              <h3 className="stat-box-title">
                {dashboard?.avgAccuracy ? `${Math.round(dashboard.avgAccuracy)}%` : '0%'}{' '}
                {language === 'ur' ? 'درستگی' : language === 'ur_rm' ? 'Accuracy' : 'Accuracy'}
              </h3>
            </div>
          </div>
          {hasProgress ? (
            <div className="mini-progress-bars">
              {commProgress && (
                <div className="mini-prog-item">
                  <span style={{ fontSize: '0.85rem' }}>🗣️ {language === 'ur' ? 'گفتگو' : 'Communication'}</span>
                  <div className="mini-bar-track">
                    <div className="mini-bar-fill" style={{ width: `${Math.max(10, Math.min(100, Math.round(commProgress.accuracy * 100)))}%` }} />
                  </div>
                </div>
              )}
              {readingProgress && (
                <div className="mini-prog-item">
                  <span style={{ fontSize: '0.85rem' }}>📖 {language === 'ur' ? 'مطالعہ' : 'Reading'}</span>
                  <div className="mini-bar-track">
                    <div className="mini-bar-fill" style={{ width: `${Math.max(10, Math.min(100, Math.round(readingProgress.accuracy * 100)))}%` }} />
                  </div>
                </div>
              )}
              {problemProgress && (
                <div className="mini-prog-item">
                  <span style={{ fontSize: '0.85rem' }}>💡 {language === 'ur' ? 'مسائل کا حل' : 'Problem Solving'}</span>
                  <div className="mini-bar-track">
                    <div className="mini-bar-fill" style={{ width: `${Math.max(10, Math.min(100, Math.round(problemProgress.accuracy * 100)))}%` }} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: '10px 0' }}>
              {language === 'ur'
                ? 'ذاتی اعداد و شمار دیکھنے کے لیے چند سرگرمیاں مکمل کریں۔'
                : 'Complete a few activities to unlock personalized insights.'}
            </p>
          )}
          <button className="text-btn view-all-btn" onClick={() => navigate('/progress')} style={{ marginTop: 'auto' }}>
            {language === 'ur' ? 'مکمل رپورٹ دیکھیں' : language === 'ur_rm' ? 'Full Report Dekhein' : 'View Full Report'} ➔
          </button>
        </div>
      </section>

      {/* Row 3: Core Skill Modules */}
      <section className="dashboard-section" style={{ marginTop: 'var(--space-lg)' }}>
        <div className="section-title-wrap">
          <div>
            <p className="kicker">{t('skills.teen.kicker') || 'CORE PRACTICE MODULES'}</p>
            <h2 className="section-main-heading">
              {t('skills.teen.heading') || 'Personalized Teen Skill Modules'}
            </h2>
          </div>
          <button className="btn-secondary btn-sm" onClick={() => navigate('/scenarios')}>
            {language === 'ur' ? 'تمام منظرنامے دیکھیں' : language === 'ur_rm' ? 'Tamam Scenarios' : 'View All Scenarios'} ➔
          </button>
        </div>

        <div className="modules-web-grid">
          {teenModules.map((mod) => (
            <div key={mod.id} className="module-web-card">
              <div className="module-card-top">
                <div className="module-icon-badge" style={{ fontSize: '1.4rem' }}>{mod.icon}</div>
                <div className="module-pill-group">
                  <span className="module-category-pill">
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
                >
                  {language === 'ur' ? 'مشق شروع کریں' : language === 'ur_rm' ? 'Mashq Shuru Karein' : 'Start Practice'} →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Row 4: Core Skills Progress Snapshot & Safe AI Practice Hub */}
      <section className="dashboard-section-split" style={{ marginTop: 'var(--space-lg)' }}>
        {/* Left Card: 4 Core Skills Tracking */}
        <div className="dashboard-card snapshot-card">
          <div className="card-header-line">
            <h3 className="card-heading-title">📈 {t('dashboard.progressSnapshot') || 'Core Skills Snapshot'}</h3>
            <button className="text-btn" onClick={() => navigate('/progress')}>
              {language === 'ur' ? 'تفصیلات' : 'Details'} ➔
            </button>
          </div>

          <div className="progress-list" style={{ marginTop: '1rem' }}>
            {[
              { id: 'communication', icon: '🗣️', label: 'Communication', match: commProgress, path: '/scenarios' },
              { id: 'reading', icon: '📖', label: 'Reading', match: readingProgress, path: '/skill/teen_reading_vocab' },
              { id: 'vocab', icon: '📚', label: 'Vocabulary', match: vocabProgress, path: '/skill/teen_reading_vocab' },
              { id: 'problem_solving', icon: '💡', label: 'Problem Solving', match: problemProgress, path: '/skill/teen_problem_solving' },
            ].map((skillItem) => {
              const hasData = Boolean(skillItem.match && skillItem.match.attempts > 0);
              const acc = hasData ? Math.round(skillItem.match.accuracy * 100) : 0;
              return (
                <div key={skillItem.id} className="progress-item" style={{ marginBottom: '14px' }}>
                  <div className="progress-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {skillItem.icon} {skillItem.label}
                    </span>
                    {hasData ? (
                      <strong style={{ fontSize: '0.92rem', color: 'var(--primary-green)' }}>{acc}%</strong>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        {language === 'ur' ? 'مشق شروع کریں' : 'Ready to start'}
                      </span>
                    )}
                  </div>
                  <div className="progress-bar-container" style={{ height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: hasData ? `${Math.max(8, Math.min(100, acc))}%` : '0%',
                        height: '100%',
                        background: 'var(--gradient-primary)',
                        borderRadius: '9999px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {!hasProgress && (
            <div className="empty-state-notice" style={{ marginTop: '0.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <p>💡 {language === 'ur' ? 'مکمل اعداد و شمار دیکھنے کے لیے اپنی پہلی سرگرمی شروع کریں۔' : 'Complete a few activities to unlock personalized insights.'}</p>
            </div>
          )}
        </div>

        {/* Right Card: Safe AI Practice Assistant Hub */}
        <div className="dashboard-card ai-assistant-promo-card">
          <div className="ai-promo-content">
            <div className="ai-promo-badge">🤖 HumSaathi AI Coach</div>
            <h3 style={{ margin: '8px 0', fontSize: '1.35rem', fontWeight: 700 }}>
              {language === 'ur' ? 'بات چیت کا محفوظ اور دوستانہ ماحول' : language === 'ur_rm' ? 'Safe AI Conversation Space' : 'Safe AI Conversation Space'}
            </h3>
            <p style={{ fontSize: '0.94rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              {language === 'ur'
                ? 'اساتذہ سے سوالات، دوستوں کے ساتھ گروپ پروجیکٹ اور اختلاف رائے کو پرسکون حل کرنے کی حقیقت پسندانہ مشق کریں۔'
                : language === 'ur_rm'
                ? 'Teachers se guidance, classmates ke sath team project, aur disputes resolve karne ki realistic practice karein.'
                : 'Practice speaking with teachers, participating in group discussions, and resolving disagreements in a calm, supportive, judgment-free space.'}
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '1rem 0' }}>
              <button className="btn-primary" onClick={() => navigate('/scenarios')} style={{ fontSize: '0.92rem' }}>
                💬 {language === 'ur' ? 'کوچ کے ساتھ بات کریں' : language === 'ur_rm' ? 'AI Coach Se Baat Karein' : 'Chat with AI Coach'}
              </button>
              <button className="btn-secondary" onClick={() => navigate('/scenarios?category=peer_school')} style={{ fontSize: '0.92rem' }}>
                🏫 {language === 'ur' ? 'اسکول کے منظرنامے' : 'School Scenarios'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Row 5: Recent Achievements / Badges */}
      <section className="dashboard-card" style={{ marginTop: 'var(--space-md)', padding: '1.25rem 1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 10px', color: 'var(--text-primary)' }}>
          🏆 {language === 'ur' ? 'حالیہ کامیابیاں' : language === 'ur_rm' ? 'Recent Achievements' : 'Recent Achievements'}
        </h3>
        {dashboard?.rewards?.badges?.length > 0 ? (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {dashboard.rewards.badges.map((b, i) => (
              <span key={i} style={{ padding: '6px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600 }}>
                ⭐ {b.name || b.code || 'Milestone Badge'}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            {language === 'ur'
              ? 'آپ کے اعزازی بیجز مشق مکمل کرنے پر یہاں ظاہر ہوں گے۔'
              : 'Your milestone badges will appear here as you practice and complete scenarios.'}
          </p>
        )}
      </section>
    </div>
  );
}
