import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';

import ParentOverview from '../components/parent/ParentOverview';
import ParentGrowthJourney from '../components/parent/ParentGrowthJourney';
import ParentAiInsights from '../components/parent/ParentAiInsights';
import ParentCommunicationJourney from '../components/parent/ParentCommunicationJourney';
import ParentHomePractice from '../components/parent/ParentHomePractice';
import ParentWeeklyReport from '../components/parent/ParentWeeklyReport';
import ParentSettings from '../components/parent/ParentSettings';

const NAV_TABS = [
  { id: 'overview', labelKey: 'parent.nav.overview', defaultLabel: 'Overview', icon: '🏠' },
  { id: 'growth', labelKey: 'parent.nav.growth', defaultLabel: 'Growth Journey', icon: '📈' },
  { id: 'insights', labelKey: 'parent.nav.insights', defaultLabel: 'AI Insights', icon: '🤖' },
  { id: 'communication', labelKey: 'parent.nav.communication', defaultLabel: 'Communication', icon: '🗣️' },
  { id: 'practice', labelKey: 'parent.nav.practice', defaultLabel: 'Home Practice', icon: '🎯' },
  { id: 'reports', labelKey: 'parent.nav.reports', defaultLabel: 'Weekly Reports', icon: '📅' },
  { id: 'settings', labelKey: 'parent.nav.settings', defaultLabel: 'Parent Settings', icon: '⚙️' },
];

export default function ParentPage() {
  const { user } = useUser();
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();

  const [pin, setPin] = useState('');
  const [companion, setCompanion] = useState(null);
  const [legacyView, setLegacyView] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadCompanionData = async (e) => {
    if (e) e.preventDefault();
    if (!pin) {
      setError('Please enter your 4-digit PIN.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const data = await api.getParentCompanion(user.id, pin);
      setLegacyView(data?.parentView || null);
      setCompanion(data?.parentCompanion || null);
    } catch (err) {
      setError(err.message || 'Incorrect PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLockPortal = () => {
    setCompanion(null);
    setLegacyView(null);
    setPin('');
    setActiveTab('overview');
  };

  if (!user) {
    return (
      <div className="parent-page-wrapper">
        <div className="parent-empty-card">
          <p>{t('common.error')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="parent-page-wrapper">
      {!companion ? (
        /* PIN Entry Gate Screen */
        <motion.div
          className="parent-pin-gate"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="pin-gate-badge">
            <span className="pin-gate-icon">🛡️</span>
            <span className="pin-gate-title">Parent Companion 2.0</span>
          </div>

          <h1>{t('parent.title') || 'Parent Companion'}</h1>
          <p className="pin-gate-intro">
            {t('parent.intro') || 'Enter your Caregiver PIN to access personalized insights, communication history, and home practice guidance.'}
          </p>

          <form onSubmit={loadCompanionData} className="parent-pin-form">
            <label className="pin-input-label">
              <span>{t('parent.pin') || 'Caregiver PIN'}</span>
              <div className="pin-input-container">
                <input
                  type="password"
                  className="pin-input-field"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={8}
                  placeholder="••••"
                  autoFocus
                  required
                />
              </div>
            </label>

            {error && <div className="parent-error-alert">{error}</div>}

            <button className="btn-primary pin-unlock-btn" type="submit" disabled={loading || !pin}>
              {loading ? (
                <span>Unlocking...</span>
              ) : (
                <span>{t('parent.view') || 'Unlock Parent Portal'} →</span>
              )}
            </button>

            <div className="pin-gate-hint">
              <small>Default PIN is <strong>1234</strong>. You can customize this in Parent Settings.</small>
            </div>
          </form>
        </motion.div>
      ) : (
        /* Unlocked Parent Portal 2.0 Companion Shell */
        <div className="parent-portal-shell">
          {/* Top Bar with Navigation Tabs */}
          <div className="parent-shell-header">
            <div className="parent-shell-title-row">
              <div className="parent-shell-branding">
                <span className="shell-shield-icon">🛡️</span>
                <div>
                  <span className="parent-brand-sub">HumSaathi AI</span>
                  <h1>{t('parent.title') || 'Parent Companion'}</h1>
                </div>
              </div>

              <div className="parent-shell-actions">
                <button
                  className="parent-lock-btn"
                  type="button"
                  onClick={handleLockPortal}
                  title="Lock Caregiver Portal"
                >
                  🔒 Lock Portal
                </button>
              </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <nav className="parent-subnav-bar" aria-label="Parent Portal Navigation">
              {NAV_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    className={`parent-tab-item ${isActive ? 'is-active' : ''}`}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-label">{t(tab.labelKey) || tab.defaultLabel}</span>
                    {isActive && (
                      <motion.span
                        className="tab-indicator"
                        layoutId="parent-tab-indicator"
                        transition={{ type: 'spring', stiffness: 420, damping: 35 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Active Subview Container */}
          <main className="parent-shell-content-body">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && (
                  <ParentOverview companion={companion} onNavigateTab={setActiveTab} />
                )}
                {activeTab === 'growth' && (
                  <ParentGrowthJourney companion={companion} onNavigateTab={setActiveTab} />
                )}
                {activeTab === 'insights' && (
                  <ParentAiInsights companion={companion} userId={user.id} />
                )}
                {activeTab === 'communication' && (
                  <ParentCommunicationJourney companion={companion} />
                )}
                {activeTab === 'practice' && (
                  <ParentHomePractice companion={companion} />
                )}
                {activeTab === 'reports' && (
                  <ParentWeeklyReport companion={companion} />
                )}
                {activeTab === 'settings' && (
                  <ParentSettings
                    companion={companion}
                    userId={user.id}
                    onPinUpdated={(newPin) => setPin(newPin)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      )}
    </div>
  );
}
