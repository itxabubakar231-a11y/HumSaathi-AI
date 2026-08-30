import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [personaFilter, setPersonaFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewModalUser, setViewModalUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
  const [changePersonaUser, setChangePersonaUser] = useState(null);
  const [targetPersona, setTargetPersona] = useState('child');

  const fetchUsers = useCallback((page = 1) => {
    setLoading(true);
    api.adminGetUsers({
      search,
      persona: personaFilter,
      status: statusFilter,
      page,
      limit: 10,
    })
      .then((res) => {
        setUsers(res.users || []);
        setPagination(res.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
      })
      .catch((err) => {
        setFeedbackMsg(`⚠️ Error: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, [search, personaFilter, statusFilter]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleToggleStatus = async (user) => {
    const nextStatus = !user.isActive;
    const actionText = nextStatus ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${actionText} user "${user.name}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await api.adminUpdateUserStatus(user.id, nextStatus);
      setFeedbackMsg(`✅ User "${user.name}" status updated.`);
      fetchUsers(pagination.page);
    } catch (err) {
      setFeedbackMsg(`⚠️ Failed to update user status: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSavePersona = async () => {
    if (!changePersonaUser) return;
    setActionLoading(true);
    try {
      await api.adminUpdateUserPersona(changePersonaUser.id, targetPersona);
      setFeedbackMsg(`✅ Persona changed to ${targetPersona.toUpperCase()} for "${changePersonaUser.name}".`);
      setChangePersonaUser(null);
      fetchUsers(pagination.page);
    } catch (err) {
      setFeedbackMsg(`⚠️ Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirmDeleteUser) return;
    setActionLoading(true);
    try {
      await api.adminDeleteUser(confirmDeleteUser.id);
      setFeedbackMsg(`🗑️ User account "${confirmDeleteUser.name}" deleted.`);
      setConfirmDeleteUser(null);
      fetchUsers(pagination.page);
    } catch (err) {
      setFeedbackMsg(`⚠️ Failed to delete user: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="admin-users-page">
      <div className="admin-header-row">
        <div>
          <h1 className="admin-title">User Management</h1>
          <p className="admin-subtitle">Search, inspect, and manage registered learner accounts</p>
        </div>
      </div>

      {feedbackMsg && (
        <div className="admin-alert-banner">
          <span>{feedbackMsg}</span>
          <button className="admin-close-btn" onClick={() => setFeedbackMsg('')}>✕</button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="admin-filters-toolbar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by name or email..."
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
            <option value="child">Child Portal</option>
            <option value="teen">Teen Portal</option>
            <option value="adult">Adult Portal</option>
          </select>

          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by Status"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="deactivated">Deactivated Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-table-card">
        {loading ? (
          <div className="admin-loading-state">
            <div className="loading-spinner" />
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="admin-empty-state">
            <span className="empty-icon">👥</span>
            <h3>No Users Found</h3>
            <p>No user accounts matched the search criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Learner</th>
                  <th>Portal</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Sessions</th>
                  <th>Registered</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-table-cell">
                        <span className="user-avatar-small">
                          {u.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                        <div>
                          <strong>{u.name}</strong>
                          <span className="user-email-dim">{u.email || 'No email'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`portal-tag portal-${u.persona}`}>
                        {u.persona ? u.persona.toUpperCase() : 'CHILD'}
                      </span>
                    </td>
                    <td>
                      <span className={`role-badge-tag ${u.role === 'ADMIN' ? 'role-admin' : 'role-learner'}`}>
                        {u.role || 'learner'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill-badge ${u.isActive ? 'is-active' : 'is-deactivated'}`}>
                        {u.isActive ? '● Active' : '○ Deactivated'}
                      </span>
                    </td>
                    <td>
                      <span className="count-badge">{u.sessionCount} sessions</span>
                    </td>
                    <td>
                      <span className="date-text">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-buttons-group">
                        <button
                          className="action-btn"
                          title="View Details"
                          onClick={() => setViewModalUser(u)}
                        >
                          👁️
                        </button>
                        <button
                          className="action-btn"
                          title="Change Persona Portal"
                          onClick={() => {
                            setChangePersonaUser(u);
                            setTargetPersona(u.persona || 'child');
                          }}
                        >
                          🎭
                        </button>
                        <button
                          className={`action-btn ${u.isActive ? 'action-deactivate' : 'action-activate'}`}
                          title={u.isActive ? 'Deactivate User' : 'Activate User'}
                          onClick={() => handleToggleStatus(u)}
                          disabled={actionLoading}
                        >
                          {u.isActive ? '🔒' : '🔓'}
                        </button>
                        <button
                          className="action-btn action-delete"
                          title="Delete Account"
                          onClick={() => setConfirmDeleteUser(u)}
                          disabled={actionLoading}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.pages > 1 && (
          <div className="admin-pagination-bar">
            <span>Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)</span>
            <div className="pagination-btns">
              <button
                className="admin-page-btn"
                disabled={pagination.page <= 1 || loading}
                onClick={() => fetchUsers(pagination.page - 1)}
              >
                ◀ Prev
              </button>
              <button
                className="admin-page-btn"
                disabled={pagination.page >= pagination.pages || loading}
                onClick={() => fetchUsers(pagination.page + 1)}
              >
                Next ▶
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: View Details */}
      {viewModalUser && (
        <div className="admin-modal-overlay" onClick={() => setViewModalUser(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button className="modal-close-btn" onClick={() => setViewModalUser(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div>
                  <label className="detail-label">Full Name</label>
                  <p className="detail-value">{viewModalUser.name}</p>
                </div>
                <div>
                  <label className="detail-label">Email</label>
                  <p className="detail-value">{viewModalUser.email}</p>
                </div>
                <div>
                  <label className="detail-label">Assigned Portal</label>
                  <p className="detail-value">{viewModalUser.persona?.toUpperCase()}</p>
                </div>
                <div>
                  <label className="detail-label">Account Role</label>
                  <p className="detail-value">{viewModalUser.role}</p>
                </div>
                <div>
                  <label className="detail-label">Account Status</label>
                  <p className="detail-value">{viewModalUser.isActive ? 'Active' : 'Deactivated'}</p>
                </div>
                <div>
                  <label className="detail-label">Practice Sessions</label>
                  <p className="detail-value">{viewModalUser.sessionCount}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="admin-btn-secondary" onClick={() => setViewModalUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Change Persona */}
      {changePersonaUser && (
        <div className="admin-modal-overlay" onClick={() => setChangePersonaUser(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Learner Portal</h2>
              <button className="modal-close-btn" onClick={() => setChangePersonaUser(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Select target portal for <strong>{changePersonaUser.name}</strong>:</p>
              <div className="persona-option-cards">
                {['child', 'teen', 'adult'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`persona-select-card ${targetPersona === p ? 'is-selected' : ''}`}
                    onClick={() => setTargetPersona(p)}
                  >
                    <span className="p-icon">{p === 'child' ? '🧒' : p === 'teen' ? '🧑‍🎓' : '👨'}</span>
                    <strong className="p-name">{p.toUpperCase()} PORTAL</strong>
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="admin-btn-secondary" onClick={() => setChangePersonaUser(null)}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleSavePersona} disabled={actionLoading}>
                {actionLoading ? 'Saving...' : 'Apply Persona Change'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete User */}
      {confirmDeleteUser && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDeleteUser(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottomColor: '#fca5a5' }}>
              <h2 style={{ color: '#dc2626' }}>Delete User Account</h2>
              <button className="modal-close-btn" onClick={() => setConfirmDeleteUser(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to permanently delete the account for <strong>{confirmDeleteUser.name}</strong> ({confirmDeleteUser.email})?
              </p>
              <p style={{ color: '#dc2626', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                ⚠️ This action is irreversible. All practice sessions, attempts, and progress records for this user will be removed.
              </p>
            </div>
            <div className="modal-footer">
              <button className="admin-btn-secondary" onClick={() => setConfirmDeleteUser(null)}>Cancel</button>
              <button
                className="admin-btn-danger"
                onClick={handleDeleteUser}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
