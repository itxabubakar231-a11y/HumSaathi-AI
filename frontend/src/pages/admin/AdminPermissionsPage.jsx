import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function AdminPermissionsPage() {
  const [data, setData] = useState({ permissions: [], admins: [] });
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchPermissions = () => {
    setLoading(true);
    api.adminGetPermissions()
      .then((res) => setData(res))
      .catch((err) => setFeedbackMsg(` Error: ${err.message}`))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleTogglePermission = async (adminId, permId, currentlyGranted) => {
    setUpdating(true);
    try {
      if (currentlyGranted) {
        await api.adminRevokePermission(adminId, permId);
        setFeedbackMsg(` Revoked permission "${permId}".`);
      } else {
        await api.adminGrantPermission(adminId, permId);
        setFeedbackMsg(` Granted permission "${permId}".`);
      }
      fetchPermissions();
    } catch (err) {
      setFeedbackMsg(` Failed to update permission: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="admin-permissions-page">
      <div className="admin-header-row">
        <div>
          <h1 className="admin-title">Role & Permission Matrix</h1>
          <p className="admin-subtitle">Inspect role capabilities and manage fine-grained administrator privileges</p>
        </div>
      </div>

      {feedbackMsg && (
        <div className="admin-alert-banner">
          <span>{feedbackMsg}</span>
          <button className="admin-close-btn" onClick={() => setFeedbackMsg('')}>✕</button>
        </div>
      )}

      {/* Permissions Directory */}
      <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-card-head">
          <h3>System Capabilities</h3>
          <span className="card-tag">Built-in Policies</span>
        </div>
        <div className="permissions-grid">
          {data.permissions.map((p) => (
            <div key={p.id} className="permission-item-card">
              <div className="perm-header">
                <span className="perm-category-tag">{p.category}</span>
                <strong className="perm-name">{p.name}</strong>
              </div>
              <p className="perm-desc">{p.description}</p>
              <code className="perm-key">{p.id}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Users Matrix */}
      <div className="admin-table-card">
        <div className="admin-card-head" style={{ padding: '1.25rem' }}>
          <h3>Admin Account Assignments</h3>
          <span className="card-tag">Access Matrix</span>
        </div>

        {loading ? (
          <div className="admin-loading-state">
            <div className="loading-spinner" />
            <p>Loading permissions matrix...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Administrator</th>
                  {data.permissions.map((p) => (
                    <th key={p.id} style={{ textAlign: 'center', fontSize: '0.8rem' }}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.admins.map((adm) => (
                  <tr key={adm.id}>
                    <td>
                      <div className="user-table-cell">
                        <span className="user-avatar-small"></span>
                        <div>
                          <strong>{adm.name}</strong>
                          <span className="user-email-dim">{adm.email}</span>
                        </div>
                      </div>
                    </td>
                    {data.permissions.map((p) => {
                      const isGranted = (adm.grantedPermissions || []).includes(p.id) || true; // Full ADMIN
                      return (
                        <td key={p.id} style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className={`perm-check-btn ${isGranted ? 'is-granted' : 'is-revoked'}`}
                            onClick={() => handleTogglePermission(adm.id, p.id, isGranted)}
                            disabled={updating}
                            title={`${isGranted ? 'Revoke' : 'Grant'} ${p.name}`}
                          >
                            {isGranted ? '✓ Enabled' : '— Disabled'}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
