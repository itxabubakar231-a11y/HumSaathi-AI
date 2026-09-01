import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';

export default function PersonaSelectionPage() {
  const { user, selectPersona } = useUser();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [selectedPersona, setSelectedPersona] = useState(user?.persona || 'child');
  const [saving, setSaving] = useState(false);

  const personas = [
    {
      id: 'child',
      icon: '🧒',
      badge: 'Ages 4 – 12',
      title: 'Child Portal',
      subtitle: 'Friendly, guided & sensory-calm',
      desc: 'Fun educational games, letters, numbers, emotion matching, daily routines & story adventures.',
      accent: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(251, 191, 36, 0.03) 100%)',
      highlights: ['🎮 Learning Games', '⭐ Star Rewards', '😊 Emotion Matching'],
    },
    {
      id: 'teen',
      icon: '🧑‍🎓',
      badge: 'Ages 13 – 17',
      title: 'Teen Portal',
      subtitle: 'Modern, independent & social',
      desc: 'School challenges, peer dynamics, Reading & Vocabulary, Problem Solving, and Communication.',
      accent: '#8b5cf6',
      bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(167, 139, 250, 0.03) 100%)',
      highlights: ['📚 Reading & Vocab', '🧩 Problem Solving', '💬 Communication'],
    },
    {
      id: 'adult',
      icon: '👨',
      badge: 'Ages 18+',
      title: 'Adult Portal',
      subtitle: 'Mature, practical & professional',
      desc: 'Functional Reading, Everyday Problem Solving (Shopping, Time, Money), and Everyday Communication.',
      accent: '#06b6d4',
      bgGradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(56, 189, 248, 0.03) 100%)',
      highlights: ['📄 Functional Reading', '💵 Shopping, Time & Money', '🗣️ Workplace & Daily Comm'],
    },
  ];

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await selectPersona(selectedPersona);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      navigate('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  const getActiveAccent = () => {
    const found = personas.find((p) => p.id === selectedPersona);
    return found ? found.accent : '#8b5cf6';
  };

  return (
    <div className="persona-experience-page">
      <div className="persona-hero-header">
        <span className="persona-eyebrow-badge">PORTAL SELECTION</span>
        <h1 className="persona-main-title">Choose Your Experience</h1>
        <p className="persona-main-subtitle">
          Select a practice portal tailored specifically to your age, communication goals, and learning level.
        </p>
      </div>

      {/* 3 Distinct Persona Cards */}
      <div className="persona-cards-container">
        {personas.map((p) => {
          const isSelected = selectedPersona === p.id;
          return (
            <div
              key={p.id}
              className={`persona-experience-card ${isSelected ? 'is-selected' : ''}`}
              style={{
                '--persona-accent': p.accent,
                '--persona-bg': p.bgGradient,
              }}
              onClick={() => setSelectedPersona(p.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedPersona(p.id)}
            >
              <div className="persona-card-topbar">
                <span className="persona-hero-icon">{p.icon}</span>
                <span className="persona-age-badge" style={{ backgroundColor: isSelected ? p.accent : undefined }}>
                  {p.badge}
                </span>
              </div>

              <div className="persona-card-body">
                <h3 className="persona-title">{p.title}</h3>
                <span className="persona-subtitle">{p.subtitle}</span>
                <p className="persona-description">{p.desc}</p>

                <div className="persona-highlights-list">
                  {p.highlights.map((h, idx) => (
                    <span key={idx} className="persona-highlight-chip">
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              <div className="persona-card-footer">
                <div className="radio-check-wrap">
                  <span className={`radio-circle ${isSelected ? 'is-checked' : ''}`}>
                    {isSelected ? '✓' : ''}
                  </span>
                  <span className="radio-label">
                    {isSelected ? 'Active Selection' : 'Click to select'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Action Button */}
      <div className="persona-action-area">
        <button
          className="persona-launch-btn"
          type="button"
          onClick={handleConfirm}
          disabled={saving}
          style={{ backgroundColor: getActiveAccent() }}
        >
          {saving ? t('common.loading') : `Enter ${selectedPersona.toUpperCase()} Portal 🚀`}
        </button>
      </div>
    </div>
  );
}
