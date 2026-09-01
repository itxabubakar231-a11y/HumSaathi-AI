import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';

export default function AdminScenariosPage() {
  const [scenarios, setScenarios] = useState([]);
  const [counts, setCounts] = useState({ child: { active: 6, required: 6 }, teen: { active: 5, required: 5 }, adult: { active: 5, required: 5 } });
  const [warnings, setWarnings] = useState([]);
  const [search, setSearch] = useState('');
  const [personaFilter, setPersonaFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [editScenario, setEditScenario] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchScenarios = useCallback(() => {
    setLoading(true);
    api.adminGetScenarios({
      persona: personaFilter,
      difficulty: difficultyFilter,
      search,
    })
      .then((res) => {
        setScenarios(res.scenarios || []);
        if (res.counts) setCounts(res.counts);
        if (res.warnings) setWarnings(res.warnings);
      })
      .catch((err) => {
        setFeedbackMsg(` Error: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, [personaFilter, difficultyFilter, search]);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  const handleToggleActive = async (scen) => {
    const nextState = !scen.isActive;
    try {
      await api.adminUpdateScenario(scen.id, { isActive: nextState });
      setFeedbackMsg(` Scenario "${scen.title}" status updated.`);
      fetchScenarios();
    } catch (err) {
      setFeedbackMsg(` Failed to update scenario: ${err.message}`);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editScenario) return;
    setSaving(true);
    try {
      await api.adminUpdateScenario(editScenario.id, {
        title: editScenario.title,
        description: editScenario.description,
        aiRole: editScenario.aiRole,
        difficulty: editScenario.difficulty,
        isActive: editScenario.isActive,
      });
      setFeedbackMsg(` Scenario "${editScenario.title}" saved successfully.`);
      setEditScenario(null);
      fetchScenarios();
    } catch (err) {
      setFeedbackMsg(` Failed to save scenario: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-scenarios-page">
      <div className="admin-header-row">
        <div>
          <h1 className="admin-title">Scenario Management</h1>
          <p className="admin-subtitle">Inspect, edit, and configure conversational practice scenarios</p>
        </div>
      </div>

      {/* Required Demo Counts & Safeguard Badges */}
      <div className="admin-safeguard-cards">
        <div className={`safeguard-card ${counts.child.active === 6 ? 'is-valid' : 'is-warning'}`}>
          <span className="sg-icon"></span>
          <div>
            <strong className="sg-title">Child Portal</strong>
            <span className="sg-count">{counts.child.active} / {counts.child.required} Scenarios</span>
          </div>
          <span className="sg-status">{counts.child.active === 6 ? '✓ Standard Match' : ' Count Adjusted'}</span>
        </div>

        <div className={`safeguard-card ${counts.teen.active === 5 ? 'is-valid' : 'is-warning'}`}>
          <span className="sg-icon"></span>
          <div>
            <strong className="sg-title">Teen Portal</strong>
            <span className="sg-count">{counts.teen.active} / {counts.teen.required} Scenarios</span>
          </div>
          <span className="sg-status">{counts.teen.active === 5 ? '✓ Standard Match' : ' Count Adjusted'}</span>
        </div>

        <div className={`safeguard-card ${counts.adult.active === 5 ? 'is-valid' : 'is-warning'}`}>
          <span className="sg-icon"></span>
          <div>
            <strong className="sg-title">Adult Portal</strong>
            <span className="sg-count">{counts.adult.active} / {counts.adult.required} Scenarios</span>
          </div>
          <span className="sg-status">{counts.adult.active === 5 ? '✓ Standard Match' : ' Count Adjusted'}</span>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="admin-warning-box">
          {warnings.map((w, idx) => (
            <p key={idx}> {w}</p>
          ))}
        </div>
      )}

      {feedbackMsg && (
        <div className="admin-alert-banner">
          <span>{feedbackMsg}</span>
          <button className="admin-close-btn" onClick={() => setFeedbackMsg('')}>✕</button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="admin-filters-toolbar">
        <div className="search-input-wrapper">
          <span className="search-icon"></span>
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search scenarios by title or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-select-group">
          <select
            className="admin-select"
            value={personaFilter}
            onChange={(e) => setPersonaFilter(e.target.value)}
            aria-label="Filter by Persona"
          >
            <option value="all">All Portals</option>
            <option value="child">Child (6 Scenarios)</option>
            <option value="teen">Teen (5 Scenarios)</option>
            <option value="adult">Adult (5 Scenarios)</option>
          </select>

          <select
            className="admin-select"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            aria-label="Filter by Difficulty"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="challenging">Challenging</option>
          </select>
        </div>
      </div>

      {/* Scenario Cards Grid */}
      {loading ? (
        <div className="admin-loading-state">
          <div className="loading-spinner" />
          <p>Loading scenarios...</p>
        </div>
      ) : scenarios.length === 0 ? (
        <div className="admin-empty-state">
          <span className="empty-icon"></span>
          <h3>No Scenarios Found</h3>
          <p>No scenarios matched your filter criteria.</p>
        </div>
      ) : (
        <div className="admin-scenarios-grid">
          {scenarios.map((scen) => (
            <div key={scen.id} className={`admin-scenario-card ${!scen.isActive ? 'is-disabled' : ''}`}>
              <div className="scen-card-header">
                <div className="scen-card-tags">
                  <span className={`diff-pill diff-${scen.difficulty}`}>
                    {scen.difficulty.toUpperCase()}
                  </span>
                  {scen.personas.map((p) => (
                    <span key={p} className={`persona-tag-small tag-${p}`}>
                      {p.toUpperCase()}
                    </span>
                  ))}
                </div>
                <span className={`scen-status-pill ${scen.isActive ? 'active-pill' : 'inactive-pill'}`}>
                  {scen.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>

              <h3 className="scen-title">{scen.title}</h3>
              <p className="scen-role">
                <strong>AI Persona:</strong> {scen.aiRole}
              </p>
              <p className="scen-desc">{scen.description}</p>

              <div className="scen-footer">
                <span className="scen-session-count"> {scen.sessionCount || 0} student sessions</span>
                <div className="scen-actions">
                  <button
                    className="admin-btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    onClick={() => setEditScenario(scen)}
                  >
                     Edit
                  </button>
                  <button
                    className={`toggle-btn ${scen.isActive ? 'toggle-on' : 'toggle-off'}`}
                    onClick={() => handleToggleActive(scen)}
                    title={scen.isActive ? 'Disable Scenario' : 'Enable Scenario'}
                  >
                    {scen.isActive ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Scenario Modal */}
      {editScenario && (
        <div className="admin-modal-overlay" onClick={() => setEditScenario(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Practice Scenario</h2>
              <button className="modal-close-btn" onClick={() => setEditScenario(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="detail-label">Scenario Title</label>
                  <input
                    type="text"
                    className="admin-search-input"
                    value={editScenario.title}
                    onChange={(e) => setEditScenario({ ...editScenario, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="detail-label">AI Partner Role</label>
                  <input
                    type="text"
                    className="admin-search-input"
                    value={editScenario.aiRole}
                    onChange={(e) => setEditScenario({ ...editScenario, aiRole: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="detail-label">Difficulty Level</label>
                  <select
                    className="admin-select"
                    style={{ width: '100%' }}
                    value={editScenario.difficulty}
                    onChange={(e) => setEditScenario({ ...editScenario, difficulty: e.target.value })}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="challenging">Challenging</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="detail-label">Description / Instructions</label>
                  <textarea
                    className="admin-search-input"
                    style={{ height: '80px', resize: 'vertical' }}
                    value={editScenario.description}
                    onChange={(e) => setEditScenario({ ...editScenario, description: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="scen-active-check"
                    checked={editScenario.isActive}
                    onChange={(e) => setEditScenario({ ...editScenario, isActive: e.target.checked })}
                  />
                  <label htmlFor="scen-active-check" style={{ fontWeight: 600, cursor: 'pointer' }}>
                    Scenario is Active & Available to Learners
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setEditScenario(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Scenario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
