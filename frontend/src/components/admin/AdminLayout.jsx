import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { api } from '../../services/api';

const adminNavItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '' },
  { path: '/admin/users', label: 'Users', icon: '' },
  { path: '/admin/scenarios', label: 'Scenarios', icon: '' },
  { path: '/admin/analytics', label: 'Analytics', icon: '' },
  { path: '/admin/permissions', label: 'Permissions', icon: '' },
  { path: '/admin/ai-monitoring', label: 'AI Monitoring', icon: '' },
  { path: '/admin/audit-logs', label: 'Audit Logs', icon: '' },
  { path: '/admin/settings', label: 'System Status', icon: '' },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [systemStatus, setSystemStatus] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    api.adminGetSystemStatus()
      .then((data) => setSystemStatus(data))
      .catch(() => setSystemStatus({ status: 'degraded' }));
  }, []);

  const isCurrentActive = (path) => {
    if (path === '/admin/dashboard' && (location.pathname === '/admin' || location.pathname === '/admin/dashboard')) {
      return true;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-shell">
      {/* Admin Sidebar */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'is-open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin/dashboard" className="admin-brand-link">
            <span className="admin-logo-badge"></span>
            <div>
              <span className="admin-brand-title">HumSaathi AI</span>
              <span className="admin-brand-subtitle">Control Center</span>
            </div>
          </Link>
        </div>

        <nav className="admin-nav">
          <p className="admin-nav-heading">MANAGEMENT</p>
          {adminNavItems.map((item) => {
            const active = isCurrentActive(item.path);
            return (
              <button
                key={item.path}
                type="button"
                className={`admin-nav-item ${active ? 'is-active' : ''}`}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span className="admin-nav-text">{item.label}</span>
                {active && <span className="admin-nav-indicator" />}
              </button>
            );
          })}
        </nav>

        {/* Admin Footer User Bar */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-info-card">
            <div className="admin-user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="admin-user-details">
              <span className="admin-user-name">{user?.name || 'Admin'}</span>
              <span className="admin-role-badge">ADMIN</span>
            </div>
          </div>

          <div className="admin-footer-actions">
            <button
              className="admin-secondary-btn"
              onClick={() => navigate('/dashboard')}
              title="Switch to Learner Portal"
            >
               Learner View
            </button>
            <button
              className="admin-logout-btn"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Log Out"
            >
               Exit
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="admin-main-wrapper">
        {/* Top Header */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              ☰
            </button>
            <span className="admin-page-breadcrumb">
              Control Panel &nbsp;/&nbsp; <strong style={{ color: 'var(--text-primary)' }}>{adminNavItems.find((i) => isCurrentActive(i.path))?.label || 'Administration'}</strong>
            </span>
          </div>

          <div className="admin-topbar-right">
            {/* System Status Pill */}
            <div className="admin-status-pill">
              <span
                className="status-dot"
                style={{
                  backgroundColor: systemStatus?.status === 'operational' ? '#10b981' : '#f59e0b',
                }}
              />
              <span className="status-label">
                {systemStatus?.status === 'operational' ? 'System Operational' : 'Degraded Mode'}
              </span>
            </div>

            <div className="admin-profile-chip" onClick={() => navigate('/admin/settings')}>
              <span className="admin-chip-icon"></span>
              <span className="admin-chip-email">{user?.email || 'admin@humsaathi.ai'}</span>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="admin-content-container">
          {children}
        </main>
      </div>
    </div>
  );
}
