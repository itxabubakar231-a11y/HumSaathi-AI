import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useI18n } from '../../context/I18nContext';
import { api } from '../../services/api';

export default function ParentSettings({ companion, userId, onPinUpdated }) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();

  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdatePin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPin || !newPin || !confirmPin) {
      setError('Please fill in all PIN fields.');
      return;
    }
    if (newPin !== confirmPin) {
      setError('New PIN and Confirm PIN do not match.');
      return;
    }
    if (newPin.length < 4 || newPin.length > 8 || !/^\d+$/.test(newPin)) {
      setError('New PIN must be between 4 and 8 digits.');
      return;
    }

    setLoading(true);
    try {
      await api.updateParentPin(userId, oldPin, newPin);
      setSuccess(t('parent.pinUpdated') || 'Caregiver PIN updated successfully!');
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      if (onPinUpdated) onPinUpdated(newPin);
    } catch (err) {
      setError(err.message || 'Failed to update PIN. Please verify your current PIN.');
    } finally {
      setLoading(false);
    }
  };

  const learner = companion?.learner || {};

  return (
    <div className="parent-section-container">
      {/* Header */}
      <header className="parent-subview-header">
        <span className="parent-badge-kicker">Preferences & Security</span>
        <h2>⚙️ {t('parent.nav.settings') || 'Parent Settings'}</h2>
        <p className="parent-subview-desc">
          Manage your caregiver security PIN, review learner profile settings, and control privacy preferences.
        </p>
      </header>

      <div className="parent-two-col-grid">
        {/* PIN Change Form */}
        <motion.div
          className="parent-card"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="parent-section-title-wrap">
            <span className="icon-badge">🔒</span>
            <h3>{t('parent.changePin') || 'Change Caregiver PIN'}</h3>
          </div>
          <p className="parent-card-hint">
            The PIN secures caregiver insights and prevents young learners from accessing parent controls.
          </p>

          <form className="parent-settings-form" onSubmit={handleUpdatePin}>
            <label className="parent-input-label">
              <span>{t('parent.oldPin') || 'Current PIN'}</span>
              <input
                type="password"
                className="parent-text-input"
                maxLength={8}
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                placeholder="••••"
                required
              />
            </label>

            <label className="parent-input-label">
              <span>{t('parent.newPin') || 'New PIN (4-8 digits)'}</span>
              <input
                type="password"
                className="parent-text-input"
                maxLength={8}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="••••"
                required
              />
            </label>

            <label className="parent-input-label">
              <span>{t('parent.confirmPin') || 'Confirm New PIN'}</span>
              <input
                type="password"
                className="parent-text-input"
                maxLength={8}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="••••"
                required
              />
            </label>

            {error && <div className="parent-error-alert">{error}</div>}
            {success && <div className="parent-success-alert">{success}</div>}

            <button className="btn-primary parent-save-btn" type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Save New PIN'}
            </button>
          </form>
        </motion.div>

        {/* Profile & Privacy Overview */}
        <motion.div
          className="parent-card"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
        >
          <div className="parent-section-title-wrap">
            <span className="icon-badge">🛡️</span>
            <h3>Privacy & Data Protection</h3>
          </div>

          <div className="parent-privacy-points">
            <div className="privacy-point-item">
              <strong>🔒 Strict Data Isolation</strong>
              <p>Your learner's performance, conversations, and reports are private to this account and never shared with other learners.</p>
            </div>
            <div className="privacy-point-item">
              <strong>🛡️ Safe AI Environment</strong>
              <p>HumSaathi AI operates strictly as an educational support assistant with zero clinical claims or medical diagnosis generation.</p>
            </div>
            <div className="privacy-point-item">
              <strong>👤 Learner Profile</strong>
              <p>Name: <strong>{learner.name}</strong> · Language: <strong>{learner.language}</strong> · Persona: <strong>{learner.persona}</strong></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
