import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';
import { useUser } from '../../context/UserContext';

const navItems = [
  { path: '/dashboard', labelKey: 'nav.dashboard', icon: '📊' },
  { path: '/scenarios', labelKey: 'nav.scenarios', icon: '💬' },
  { path: '/progress', labelKey: 'nav.progress', icon: '📈' },
  { path: '/settings', labelKey: 'nav.settings', icon: '⚙️' },
  { path: '/parent', labelKey: 'nav.parent', icon: '🛡️' },
];

export default function AppShell({ children }) {
  const { t } = useI18n();
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const getPersonaBadgeColor = (persona) => {
    switch (persona) {
      case 'child': return '#eab308';
      case 'teen': return '#8b5cf6';
      case 'adult': return '#06b6d4';
      default: return '#6366f1';
    }
  };

  const getPersonaIcon = (persona) => {
    switch (persona) {
      case 'child': return '🧒';
      case 'teen': return '🧑‍🎓';
      case 'adult': return '👨';
      default: return '🎭';
    }
  };

  return (
    <div className="app-shell">
      {/* Top Header */}
      <header className="topbar">
        <Link className="brand" to="/" aria-label={`${t('app.name')} home`}>
          <span className="brand-mark" aria-hidden="true">H</span>
          <span className="brand-text">
            {t('app.name').replace(' AI', '')} <em className="brand-ai">AI</em>
          </span>
        </Link>

        <div className="topbar-right">
          {user?.persona && (
            <button
              className="portal-badge-btn"
              onClick={() => navigate('/persona-selection')}
              title="Click to switch persona portal"
            >
              <span className="portal-badge-icon">{getPersonaIcon(user.persona)}</span>
              <span className="portal-badge-text">
                Portal: <strong style={{ color: getPersonaBadgeColor(user.persona) }}>{user.persona.toUpperCase()}</strong>
              </span>
              <span className="portal-badge-switch">Switch ⚡</span>
            </button>
          )}

          {user?.name && (
            <div className="user-profile-chip">
              <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
              <span className="user-name">{user.name}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <div className="workspace">
        {/* Sidebar Navigation */}
        <aside className="sidebar" aria-label="Main navigation">
          <div className="sidebar-section">
            <p className="sidebar-label">Navigation</p>
            <nav className="sidebar-nav">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    className={`nav-item ${isActive ? 'is-active' : ''}`}
                    key={item.path}
                    type="button"
                    onClick={() => navigate(item.path)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                    <span className="nav-text">{t(item.labelKey)}</span>
                    {isActive && <span className="nav-active-pill" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer Info Card */}
          {user?.name && (
            <div className="sidebar-user-card">
              <div className="sidebar-user-avatar">{getPersonaIcon(user?.persona)}</div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user.name}</span>
                <span className="sidebar-user-role">{user.persona ? `${user.persona.toUpperCase()} MODE` : 'LEARNER'}</span>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="main-content" id="main">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {navItems.slice(0, 4).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`mobile-nav-btn ${isActive ? 'is-active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="mobile-nav-icon">{item.icon}</span>
              <span className="mobile-nav-label">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
