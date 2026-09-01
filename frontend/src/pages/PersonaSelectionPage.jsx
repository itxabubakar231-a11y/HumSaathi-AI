import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { ArrowRightIcon, CheckIcon, SparklesIcon } from '../components/ui/Icons';

export default function PersonaSelectionPage() {
  const { user, selectPersona } = useUser();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [selectedPersona, setSelectedPersona] = useState(user?.persona || 'child');
  const [saving, setSaving] = useState(false);

  const personas = [
    {
      id: 'child',
      badge: 'Ages 4 – 12',
      title: 'Child Portal',
      subtitle: 'Guided learning & sensory-calm focus',
      desc: 'Interactive early learning, letter sounds, numbers, emotion recognition, and daily routines.',
      accent: '#0B6B3A',
      highlights: ['Visual Matching', 'Foundational Skills', 'Guided Routines'],
    },
    {
      id: 'teen',
      badge: 'Ages 13 – 17',
      title: 'Teen Portal',
      subtitle: 'Academic, peer & social dynamics',
      desc: 'Reading comprehension, vocabulary building, everyday problem solving, and conversational practice.',
      accent: '#7C3AED',
      highlights: ['Reading & Vocabulary', 'Problem Solving', 'Peer Communication'],
    },
    {
      id: 'adult',
      badge: 'Ages 18+',
      title: 'Adult Portal',
      subtitle: 'Practical, workplace & life independence',
      desc: 'Functional literacy (invoices, notices), everyday problem solving (budgeting, transit), and workplace dialogue.',
      accent: '#0284C7',
      highlights: ['Functional Reading', 'Everyday Decisions', 'Professional Dialogue'],
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
    return found ? found.accent : '#0B6B3A';
  };

  return (
    <div className="persona-experience-page">
      <div className="persona-hero-header">
        <span className="persona-eyebrow-badge">PORTAL SELECTION</span>
        <h1 className="persona-main-title">Choose Your Practice Portal</h1>
        <p className="persona-main-subtitle">
          Select a learning experience tailored to your communication goals, developmental pace, and daily scenarios.
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
              }}
              onClick={() => setSelectedPersona(p.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedPersona(p.id)}
            >
              <div className="persona-card-topbar">
                <span
                  className="persona-portal-pill"
                  style={{
                    color: isSelected ? '#ffffff' : p.accent,
                    backgroundColor: isSelected ? p.accent : 'var(--bg-tertiary)',
                  }}
                >
                  {p.badge}
                </span>
                {isSelected && (
                  <span className="persona-selected-badge" style={{ color: p.accent }}>
                    <CheckIcon size={16} /> Selected
                  </span>
                )}
              </div>

              <div className="persona-card-body">
                <h2 className="persona-title">{p.title}</h2>
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
                    {isSelected ? <CheckIcon size={12} /> : null}
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
          <span>{saving ? t('common.loading') : `Enter ${selectedPersona.charAt(0).toUpperCase() + selectedPersona.slice(1)} Portal`}</span>
          <ArrowRightIcon size={18} />
        </button>
      </div>
    </div>
  );
}
