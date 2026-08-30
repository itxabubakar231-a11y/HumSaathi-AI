import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [actionFilter, setActionFilter] = useState('all');
  const [adminEmail, setAdminEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback((page = 1) => {
    setLoading(true);
    api.adminGetAuditLogs({
      page,
      limit: 15,
      action: actionFilter,
      admin_email: adminEmail,
    })
      .then((res) => {
        setLogs(res.logs || []);
        setPagination(res.pagination || { page: 1, limit: 15, total: 0, pages: 1 });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [actionFilter, adminEmail]);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const getActionBadgeClass = (action) => {
    if (action.includes('delete')) return 'audit-badge-danger';
    if (action.includes('deactivate')) return 'audit-badge-warning';
    if (action.includes('activate') || action.includes('grant')) return 'audit-badge-success';
    return 'audit-badge-info';
  };

  return (
    <div className="admin-audit-logs-page">
      <div className="admin-header-row">
        <div>
          <h1 className="admin-title">Administrative Audit Logs</h1>
          <p className="admin-subtitle">Chronological, tamper-evident record of administrative changes and system events</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-filters-toolbar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="admin-search-input"
            placeholder="Filter by admin email..."
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
          />
        </div>

        <div className="filter-select-group">
          <select
            className="admin-select"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            aria-label="Filter by Action"
          >
            <option value="all">All Actions</option>
            <option value="activate_user">Activate User</option>
            <option value="deactivate_user">Deactivate User</option>
            <option value="delete_user">Delete User</option>
            <option value="change_user_persona">Change Persona</option>
            <option value="update_scenario">Update Scenario</option>
            <option value="grant_permission">Grant Permission</option>
            <option value="revoke_permission">Revoke Permission</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="admin-table-card">
        {loading ? (
          <div className="admin-loading-state">
            <div className="loading-spinner" />
            <p>Loading audit trail...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="admin-empty-state">
            <span className="empty-icon">📜</span>
            <h3>No Audit Logs Found</h3>
            <p>No recorded administrative events matched your filters.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Admin Actor</th>
                  <th>Action</th>
                  <th>Target Type</th>
                  <th>Target ID</th>
                  <th style={{ textAlign: 'right' }}>Event Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <span className="date-text" style={{ fontFamily: 'monospace' }}>
                        {l.createdAt ? new Date(l.createdAt).toLocaleString() : '—'}
                      </span>
                    </td>
                    <td>
                      <strong>{l.adminEmail || 'SYSTEM'}</strong>
                    </td>
                    <td>
                      <span className={`audit-badge ${getActionBadgeClass(l.action)}`}>
                        {l.action.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="target-tag">{l.targetType || '—'}</span>
                    </td>
                    <td>
                      <code className="id-code">{l.targetId || '—'}</code>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="admin-btn-secondary"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                        onClick={() => setSelectedLog(l)}
                      >
                        Inspect Payload
                      </button>
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
            <span>Showing page {pagination.page} of {pagination.pages} ({pagination.total} total events)</span>
            <div className="pagination-btns">
              <button
                className="admin-page-btn"
                disabled={pagination.page <= 1 || loading}
                onClick={() => fetchLogs(pagination.page - 1)}
              >
                ◀ Prev
              </button>
              <button
                className="admin-page-btn"
                disabled={pagination.page >= pagination.pages || loading}
                onClick={() => fetchLogs(pagination.page + 1)}
              >
                Next ▶
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: View Log Details */}
      {selectedLog && (
        <div className="admin-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Audit Log Payload</h2>
              <button className="modal-close-btn" onClick={() => setSelectedLog(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p><strong>Action:</strong> {selectedLog.action}</p>
              <p><strong>Actor:</strong> {selectedLog.adminEmail}</p>
              <p><strong>Target:</strong> {selectedLog.targetType} ({selectedLog.targetId})</p>
              <label className="detail-label" style={{ marginTop: '1rem' }}>Captured Parameters:</label>
              <pre className="admin-code-block">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>
            <div className="modal-footer">
              <button className="admin-btn-secondary" onClick={() => setSelectedLog(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
