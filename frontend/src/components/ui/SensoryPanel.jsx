export default function SensoryPanel({ prefs, onChange, t }) {
  const toggle = (key) => onChange({ [key]: !prefs[key] });

  const sensoryOptions = [
    { key: 'soundEnabled', labelKey: 'sensory.sound', icon: '🔊', desc: 'Audio cues and speech playback' },
    { key: 'animationsEnabled', labelKey: 'sensory.animations', icon: '✨', desc: 'Visual screen transitions and effects' },
    { key: 'reducedMotion', labelKey: 'sensory.reducedMotion', icon: '🧘', desc: 'Minimize motion for visual comfort' },
    { key: 'highContrast', labelKey: 'sensory.highContrast', icon: '🌓', desc: 'Maximum contrast for high readability' },
    { key: 'calmMode', labelKey: 'sensory.calmMode', icon: '🌿', desc: 'Soothing colors and gentle tones' },
  ];

  return (
    <section className="sensory-panel preference-section" aria-labelledby="sensory-heading">
      <div className="section-heading">
        <p className="section-kicker">{t('setup.sensoryKicker') || 'ACCESSIBILITY'}</p>
        <h2 id="sensory-heading">{t('setup.sensoryTitle')}</h2>
      </div>

      <div className="sensory-list">
        {/* Text Size Row */}
        <div className="sensory-item-row">
          <div className="sensory-item-info">
            <span className="sensory-item-title">
              <span className="sensory-icon" aria-hidden="true">🔤</span>
              {t('sensory.textSize')}
            </span>
            <span className="sensory-item-desc">Adjust reading text scale across all pages</span>
          </div>
          <div className="sensory-item-action">
            <select
              className="sensory-select-control"
              value={prefs.textSize || 'medium'}
              onChange={(e) => onChange({ textSize: e.target.value })}
              aria-label={t('sensory.textSize')}
            >
              <option value="small">{t('size.small')}</option>
              <option value="medium">{t('size.medium')}</option>
              <option value="large">{t('size.large')}</option>
              <option value="xlarge">{t('size.xlarge')}</option>
            </select>
          </div>
        </div>

        {/* Toggle Rows */}
        {sensoryOptions.map(({ key, labelKey, icon, desc }) => {
          const isOn = Boolean(prefs[key]);
          return (
            <div className="sensory-item-row" key={key}>
              <div className="sensory-item-info">
                <span className="sensory-item-title">
                  <span className="sensory-icon" aria-hidden="true">{icon}</span>
                  {t(labelKey)}
                </span>
                <span className="sensory-item-desc">{desc}</span>
              </div>
              <div className="sensory-item-action">
                <button
                  type="button"
                  className={`modern-toggle-switch ${isOn ? 'is-on' : 'is-off'}`}
                  onClick={() => toggle(key)}
                  aria-pressed={isOn}
                  aria-label={`${t(labelKey)} toggle`}
                >
                  <span className="toggle-switch-track">
                    <span className="toggle-switch-thumb" />
                  </span>
                  <span className="toggle-switch-badge">
                    {isOn ? t('sensory.on') : t('sensory.off')}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
