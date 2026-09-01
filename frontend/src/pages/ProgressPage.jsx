import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';
import {
  CheckIcon,
  ProgressIcon,
  SparklesIcon,
  ArrowRightIcon,
  ActivitiesIcon,
  AnalyticsIcon,
} from '../components/ui/Icons';

export default function ProgressPage() {
  const { user } = useUser();
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }
    api.getDashboard(user.id)
      .then((data) => setDashboard(data.dashboard))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="error-card">
        <p className="error-text">{t('common.error')}</p>
      </div>
    );
  }

  return (
    <div className="progress-page web-progress-page">
      {/* Page Header */}
      <div className="progress-page-header">
        <div>
          <p className="eyebrow">{language === 'ur' ? 'کارکردگی کی رپورٹ' : language === 'ur_rm' ? 'Progress aur Analytics' : 'PROGRESS & ANALYTICS'}</p>
          <h1 className="progress-title">
            {language === 'ur' ? 'پیشرفت کا جائزہ' : language === 'ur_rm' ? 'Tafseeli Jaiza' : t('progress.title')}
          </h1>
          <p className="progress-subtitle">
            {language === 'ur'
              ? 'آپ کی روزانہ کی سرگرمیوں اور مہارتوں کے ارتقا کا تفصیلی چارٹ۔'
              : language === 'ur_rm'
              ? 'Aap ki rozmarrah activities aur skills ki progress ka jaiza.'
              : 'Track your growth, accuracy trends, and skill milestones over time.'}
          </p>
        </div>
        <div className="progress-header-badge">
          {language === 'ur' ? 'اس ہفتے' : language === 'ur_rm' ? 'Is hafte' : 'This Week'}
        </div>
      </div>

      {/* Row 1: High-Level Metric Cards Grid */}
      <div className="stats-grid web-stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon-wrap" style={{ background: '#E8F7F0', color: '#0B6B3A' }}>
            <CheckIcon size={20} />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">{language === 'ur' ? 'مکمل سرگرمیاں' : t('progress.completed')}</span>
            <span className="stat-value">{dashboard.completedCount}</span>
            <span className="stat-hint">{language === 'ur' ? 'ہفتہ وار ہدف جاری ہے' : language === 'ur_rm' ? 'Hadaf jari hai' : 'Target on track'}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon-wrap" style={{ background: '#EBF5FF', color: '#0284C7' }}>
            <ProgressIcon size={20} />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">{language === 'ur' ? 'اوسط درستگی' : t('progress.accuracy')}</span>
            <span className="stat-value">{Math.round(dashboard.avgAccuracy)}%</span>
            <span className="stat-hint">{language === 'ur' ? 'پچھلے ہفتے سے بہتر' : language === 'ur_rm' ? 'Pichlay hafte se behtar' : 'Mastery average'}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon-wrap" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <SparklesIcon size={20} />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">{language === 'ur' ? 'مسلسل سلسلہ' : 'Active Streak'}</span>
            <span className="stat-value">7 {language === 'ur' ? 'دن' : 'Days'}</span>
            <span className="stat-hint">Level: <strong style={{ textTransform: 'capitalize' }}>{dashboard.currentLevel}</strong></span>
          </div>
        </div>
      </div>

      {/* Row 2: Skill Strengths & Growth Areas */}
      {dashboard.strongest ? (
        <div className="dashboard-grid-split" style={{ marginBottom: 'var(--space-md)' }}>
          <section className="dashboard-card strength-highlight-card">
            <div className="card-header-flex">
              <span className="badge-highlight-pill green-pill">{t('progress.strongest')}</span>
            </div>
            <h3 className="highlight-skill-title">
              {dashboard.strongest.skill.replace('_', ' ').toUpperCase()}
            </h3>
            <p className="highlight-skill-desc">
              {language === 'ur'
                ? 'آپ نے اس شعبے میں سب سے زیادہ مستقل مزاجی اور درستگی کا مظاہرہ کیا ہے۔'
                : language === 'ur_rm'
                ? 'Aap ne is skill mein sab se achi consistency aur accuracy ka muzahira kiya hai.'
                : 'Highest accuracy demonstrated across interactive practice.'}
            </p>
            <div className="highlight-score-badge">
              {Math.round(dashboard.strongest.accuracy)}% {language === 'ur' ? 'مہارت' : 'Mastery'}
            </div>
          </section>

          <section className="dashboard-card practice-highlight-card">
            <div className="card-header-flex">
              <span className="badge-highlight-pill amber-pill">{t('progress.needsPractice')}</span>
            </div>
            <h3 className="highlight-skill-title">
              {dashboard.needsPractice ? dashboard.needsPractice.skill.replace('_', ' ').toUpperCase() : 'Skill Practice'}
            </h3>
            <p className="highlight-skill-desc">
              {language === 'ur'
                ? 'مزید مشق کے ذریعے اس شعبے میں اپنی مہارت اور رفتار کو بہتر بنائیں۔'
                : language === 'ur_rm'
                ? 'Mazeed mashq ke zariye is skill mein confidence barhayein.'
                : 'Recommended for your next practice session to boost confidence.'}
            </p>
            <button className="btn-primary btn-sm" onClick={() => navigate(user?.persona === 'child' ? '/dashboard' : '/scenarios')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>{language === 'ur' ? 'ابھی مشق شروع کریں' : language === 'ur_rm' ? 'Abhi mashq karein' : 'Practice Now'}</span>
              <ArrowRightIcon size={14} />
            </button>
          </section>
        </div>
      ) : null}

      {/* Row 3: Detailed Skill Progression Meters */}
      <section className="dashboard-card skill-breakdown-card" style={{ marginBottom: 'var(--space-md)' }}>
        <div className="card-header-line">
          <h3 className="card-heading-title">{language === 'ur' ? 'مہارتوں کا تفصیلی جائزہ' : language === 'ur_rm' ? 'Skills Ka Tafseeli Jaiza' : 'Detailed Skills Mastery Breakdown'}</h3>
          <span className="card-meta-note">
            {language === 'ur' ? 'خودکار AI تجزیہ' : language === 'ur_rm' ? 'AI Jaiza' : 'AI-Evaluated Performance'}
          </span>
        </div>

        <div className="skills-meter-list">
          {dashboard.progress && dashboard.progress.length > 0 ? (
            dashboard.progress.map((item, idx) => (
              <div key={idx} className="skill-meter-row">
                <div className="skill-meter-info">
                  <span className="skill-name">{item.skill.replace('_', ' ').toUpperCase()}</span>
                  <span className="skill-pct">{Math.round(item.accuracy)}%</span>
                </div>
                <div className="skill-progress-track">
                  <div
                    className="skill-progress-fill"
                    style={{
                      width: `${Math.max(6, Math.min(100, item.accuracy))}%`,
                      background: item.accuracy >= 70 ? 'var(--gradient-primary)' : item.accuracy >= 45 ? '#F59E0B' : '#8B5CF6',
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', padding: '1rem 0' }}>
              No practice attempts recorded yet. Start practicing to generate skill breakdown!
            </p>
          )}
        </div>
      </section>

      {/* Row 4: Activity Attempt History */}
      <section className="dashboard-card history-card">
        <h3 className="card-heading-title" style={{ marginBottom: '1rem' }}>
          {language === 'ur' ? 'حالیہ سرگرمیوں کا ریکارڈ' : language === 'ur_rm' ? 'Recent History' : 'Recent Activity History'}
        </h3>
        <div className="recent-history-list">
          {dashboard.recentAttempts && dashboard.recentAttempts.length > 0 ? (
            dashboard.recentAttempts.map((att, idx) => (
              <div key={idx} className="history-item-row">
                <div className="history-item-left">
                  <span className="history-activity-name">
                    {att.activityId ? att.activityId.replace('_', ' ').toUpperCase() : `Activity #${att.id.slice(-4)}`}
                  </span>
                  <span className="history-date">
                    {att.createdAt ? new Date(att.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
                <div className="history-item-right">
                  <span className="history-score-badge" style={{ color: att.score >= 0.7 ? '#0B6B3A' : '#D97706' }}>
                    {Math.round((att.score || 0) * 100)}%
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No recent attempts.</p>
          )}
        </div>
      </section>
    </div>
  );
}
