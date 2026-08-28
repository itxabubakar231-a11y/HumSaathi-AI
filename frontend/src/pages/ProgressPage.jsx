import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';

export default function ProgressPage() {
  const { user } = useUser();
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      navigate('/setup');
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
          <p className="eyebrow">{language === 'ur' ? 'کارکردگی کی رپورٹ' : 'PROGRESS & ANALYTICS'}</p>
          <h1 className="progress-title">
            {language === 'ur' ? 'پیشرفت کا جائزہ (Progress Overview)' : t('progress.title')}
          </h1>
          <p className="progress-subtitle">
            {language === 'ur'
              ? 'آپ کی روزانہ کی سرگرمیوں اور مہارتوں کے ارتقا کا تفصیلی چارٹ۔'
              : 'Track your growth, accuracy trends, and skill milestones over time.'}
          </p>
        </div>
        <div className="progress-header-badge">
          📅 {language === 'ur' ? 'اس ہفتے' : 'This Week'}
        </div>
      </div>

      {/* Row 1: High-Level Metric Cards Grid */}
      <div className="stats-grid web-stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon-wrap" style={{ background: '#E8F7F0', color: '#0B6B3A' }}>
            ✅
          </div>
          <div className="stat-card-content">
            <span className="stat-label">{language === 'ur' ? 'مکمل سرگرمیاں' : t('progress.completed')}</span>
            <span className="stat-value">{dashboard.completedCount}</span>
            <span className="stat-hint">🎯 {language === 'ur' ? 'ہفتہ وار ہدف جاری ہے' : 'Target on track'}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon-wrap" style={{ background: '#EBF5FF', color: '#0284C7' }}>
            🎯
          </div>
          <div className="stat-card-content">
            <span className="stat-label">{language === 'ur' ? 'اوسط درستگی' : t('progress.accuracy')}</span>
            <span className="stat-value">{Math.round(dashboard.avgAccuracy)}%</span>
            <span className="stat-hint">📈 +5% {language === 'ur' ? 'پچھلے ہفتے سے بہتر' : 'vs last week'}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon-wrap" style={{ background: '#FEF3C7', color: '#D97706' }}>
            🔥
          </div>
          <div className="stat-card-content">
            <span className="stat-label">{language === 'ur' ? 'مسلسل سلسلہ' : 'Active Streak'}</span>
            <span className="stat-value">7 {language === 'ur' ? 'دن' : 'Days'}</span>
            <span className="stat-hint">⚡ Level: <strong style={{ textTransform: 'capitalize' }}>{dashboard.currentLevel}</strong></span>
          </div>
        </div>
      </div>

      {/* Row 2: Skill Strengths & Growth Areas */}
      <div className="dashboard-grid-split" style={{ marginBottom: 'var(--space-md)' }}>
        <section className="dashboard-card strength-highlight-card">
          <div className="card-header-flex">
            <span className="badge-highlight-pill green-pill">🌟 {t('progress.strongest')}</span>
          </div>
          <h3 className="highlight-skill-title">
            {dashboard.strongest?.skill ? dashboard.strongest.skill.replace('_', ' ') : 'Communication'}
          </h3>
          <p className="highlight-skill-desc">
            {language === 'ur'
              ? 'آپ نے اس شعبے میں سب سے زیادہ مستقل مزاجی اور درستگی کا مظاہرہ کیا ہے۔'
              : 'Highest accuracy demonstrated across scenarios and interactive practice.'}
          </p>
          <div className="highlight-score-badge">
            {dashboard.strongest?.accuracy !== undefined ? `${Math.round(dashboard.strongest.accuracy)}% Mastery` : '85% Mastery'}
          </div>
        </section>

        <section className="dashboard-card practice-highlight-card">
          <div className="card-header-flex">
            <span className="badge-highlight-pill amber-pill">🎯 {t('progress.needsPractice')}</span>
          </div>
          <h3 className="highlight-skill-title">
            {dashboard.needsPractice?.skill ? dashboard.needsPractice.skill.replace('_', ' ') : 'Problem Solving'}
          </h3>
          <p className="highlight-skill-desc">
            {language === 'ur'
              ? 'مزید مشق کے ذریعے اس شعبے میں اپنی مہارت اور رفتار کو بہتر بنائیں۔'
              : 'Recommended for your next practice session to boost confidence.'}
          </p>
          <button className="btn-primary btn-sm" onClick={() => navigate('/scenarios')}>
            🚀 {language === 'ur' ? 'ابھی مشق شروع کریں' : 'Practice Now'}
          </button>
        </section>
      </div>

      {/* Row 3: Detailed Skill Progression Meters */}
      <section className="dashboard-card skill-breakdown-card" style={{ marginBottom: 'var(--space-md)' }}>
        <div className="card-header-line">
          <h3 className="card-heading-title">📊 {language === 'ur' ? 'مہارتوں کا تفصیلی جائزہ' : 'Detailed Skills Mastery Breakdown'}</h3>
          <span className="card-meta-note">
            {language === 'ur' ? 'خودکار AI تجزیہ' : 'AI-Evaluated Performance'}
          </span>
        </div>

        <div className="skills-meter-grid">
          {dashboard?.progress?.length ? dashboard.progress.map((prog) => (
            <div key={prog.skill} className="skill-meter-row">
              <div className="meter-info">
                <span className="meter-name">{prog.skill.replace('_', ' ')}</span>
                <span className="meter-val">{Math.round(prog.accuracy)}%</span>
              </div>
              <div className="meter-track">
                <div
                  className="meter-fill"
                  style={{ width: `${Math.max(12, Math.min(100, prog.accuracy))}%` }}
                />
              </div>
            </div>
          )) : (
            <>
              <div className="skill-meter-row">
                <div className="meter-info">
                  <span className="meter-name">💬 {language === 'ur' ? 'مواصلات اور بات چیت' : 'Communication & Dialogue'}</span>
                  <span className="meter-val">72%</span>
                </div>
                <div className="meter-track"><div className="meter-fill" style={{ width: '72%' }} /></div>
              </div>
              <div className="skill-meter-row">
                <div className="meter-info">
                  <span className="meter-name">🎭 {language === 'ur' ? 'جذبات کی پہچان' : 'Emotions & Expressions'}</span>
                  <span className="meter-val">68%</span>
                </div>
                <div className="meter-track"><div className="meter-fill" style={{ width: '68%' }} /></div>
              </div>
              <div className="skill-meter-row">
                <div className="meter-info">
                  <span className="meter-name">🤝 {language === 'ur' ? 'سماجی مہارتیں' : 'Social Interaction Skills'}</span>
                  <span className="meter-val">56%</span>
                </div>
                <div className="meter-track"><div className="meter-fill" style={{ width: '56%' }} /></div>
              </div>
              <div className="skill-meter-row">
                <div className="meter-info">
                  <span className="meter-name">🧩 {language === 'ur' ? 'روزمرہ مسائل کا حل' : 'Daily Life & Problem Solving'}</span>
                  <span className="meter-val">70%</span>
                </div>
                <div className="meter-track"><div className="meter-fill" style={{ width: '70%' }} /></div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Row 4: Recent Activity Log */}
      <section className="dashboard-card recent-log-card">
        <h3 className="card-heading-title" style={{ marginBottom: 'var(--space-sm)' }}>
          ⏱️ {t('progress.recent') || 'Recent Practice Sessions'}
        </h3>

        {dashboard.recentAttempts?.length ? (
          <div className="attempts-table-wrap">
            {dashboard.recentAttempts.map((a) => (
              <div key={a.id} className="attempt-row-item">
                <div className="attempt-info">
                  <strong className="attempt-title">{a.title}</strong>
                  <span className="attempt-diff-badge">
                    Difficulty: <span style={{ textTransform: 'capitalize' }}>{a.difficulty}</span>
                  </span>
                </div>
                <div className="attempt-score-wrap">
                  <span className="attempt-score-val">{a.score}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-notice">{t('progress.none') || 'No practice sessions recorded yet.'}</p>
        )}
      </section>
    </div>
  );
}
