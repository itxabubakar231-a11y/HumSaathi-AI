import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';
import { useUser } from '../../context/UserContext';
import { useState } from 'react';

const navItems = [
  { path: '/dashboard', labelKey: 'nav.dashboard', icon: '🏠', fallbackLabel: 'Home' },
  { path: '/scenarios', labelKey: 'nav.scenarios', icon: '🧩', fallbackLabel: 'Activities & Practice' },
  { path: '/progress', labelKey: 'nav.progress', icon: '📈', fallbackLabel: 'Progress Report' },
  { path: '/parent', labelKey: 'nav.parent', icon: '🛡️', fallbackLabel: 'Parent & Caregiver' },
  { path: '/settings', labelKey: 'nav.settings', icon: '⚙️', fallbackLabel: 'Settings & Sensory' },
];

export default function AppShell({ children }) {
  const { t, language } = useI18n();
  const { user, updateLanguage, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getPersonaBadgeColor = (persona) => {
    switch (persona) {
      case 'child': return '#F59E0B';
      case 'teen': return '#8B5CF6';
      case 'adult': return '#0EA5E9';
      default: return '#10B981';
    }
  };

  const getPersonaIcon = (persona) => {
    switch (persona) {
      case 'child': return '🧒';
      case 'teen': return '🧑‍🎓';
      case 'adult': return '💼';
      default: return '🎭';
    }
  };

  const handleLanguageToggle = async (newLang) => {
    await updateLanguage(newLang);
  };

  return (
    <div className="app-shell" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <header className="topbar">
        <div className="topbar-left">
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            ☰
          </button>
          
          <Link className="brand" to="/" aria-label="HumSaathi AI Home">
            <span className="brand-mark" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="white"/>
              </svg>
            </span>
            <div className="brand-titles">
              <span className="brand-text">
                HumSaathi <span className="brand-ai-badge">AI</span>
              </span>
              <span className="brand-subtext">
                {language === 'ur' ? 'آٹزم سپورٹ پلیٹ فارم' : language === 'ur_rm' ? 'Autism Support Platform' : 'Autism Support Platform'}
              </span>
            </div>
          </Link>
        </div>

        <div className="topbar-right">
          {/* Quick Language Toggle (EN | اردو | Rom) */}
          <div className="topbar-lang-switcher" title="Switch Language">
            <button
              className={`lang-btn ${language === 'en' ? 'is-active' : ''}`}
              onClick={() => handleLanguageToggle('en')}
            >
              EN
            </button>
            <button
              className={`lang-btn ${language === 'ur' ? 'is-active' : ''}`}
              onClick={() => handleLanguageToggle('ur')}
            >
              اردو
            </button>
            <button
              className={`lang-btn ${language === 'ur_rm' ? 'is-active' : ''}`}
              onClick={() => handleLanguageToggle('ur_rm')}
            >
              Rom
            </button>
          </div>

          {/* Persona Portal Switcher Badge */}
          {user?.persona && (
            <button
              className="portal-badge-btn"
              onClick={() => navigate('/persona-selection')}
              title="Click to switch persona portal (Child, Teen, Adult)"
            >
              <span className="portal-badge-icon">{getPersonaIcon(user.persona)}</span>
              <span className="portal-badge-text">
                <span className="portal-label-dim">{language === 'ur' ? 'پورٹل:' : 'Portal:'}</span>{' '}
                <strong style={{ color: getPersonaBadgeColor(user.persona) }}>
                  {user.persona.toUpperCase()}
                </strong>
              </span>
              <span className="portal-badge-switch">⚡</span>
            </button>
          )}

          {/* Admin Panel Quick Access Button */}
          {user?.role === 'ADMIN' && (
            <button
              className="admin-badge-btn"
              onClick={() => navigate('/admin/dashboard')}
              title="Open Administrator Control Center"
              style={{
                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                border: '1px solid #3b82f6',
                color: '#60a5fa',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>🛡️</span>
              <span>Admin Panel</span>
            </button>
          )}

          {/* User Profile Chip */}
          {user?.name && (
            <div className="user-profile-chip" onClick={() => navigate('/settings')} role="button" title="View Profile & Settings">
              <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
              <span className="user-name">{user.name}</span>
            </div>
          )}

          {/* Logout Action */}
          {user && (
            <button
              className="auth-logout-btn"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Log Out"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span>🚪</span>
              <span>{language === 'ur' ? 'لاگ آؤٹ' : 'Logout'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="workspace">
        {/* Left Desktop Sidebar Navigation */}
        <aside className={`sidebar ${mobileMenuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          <div className="sidebar-top">
            <div className="sidebar-slogan">
              <p className="slogan-ur">ہر بچے کی اپنی پہچان، ہر قدم پر ہم ساتھی ساتھ۔</p>
              <p className="slogan-en">Har Bachay Ki Apni Pehchan, Har Qadam Par HumSaathi Saath.</p>
            </div>

            <nav className="sidebar-nav">
              {user?.role === 'ADMIN' && (
                <button
                  className="nav-item admin-portal-nav-btn"
                  type="button"
                  onClick={() => {
                    navigate('/admin/dashboard');
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(30, 41, 59, 0.4))',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    color: '#60a5fa',
                    fontWeight: 600,
                    marginBottom: '0.75rem',
                  }}
                >
                  <span className="nav-icon" aria-hidden="true">🛡️</span>
                  <span className="nav-text">Admin Panel ➔</span>
                </button>
              )}
              <p className="sidebar-label">{language === 'ur' ? 'رہنمائی' : 'Main Menu'}</p>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    className={`nav-item ${isActive ? 'is-active' : ''}`}
                    key={item.path}
                    type="button"
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                    <span className="nav-text">{t(item.labelKey) || item.fallbackLabel}</span>
                    {isActive && <span className="nav-active-pill" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer User Card */}
          {user?.name && (
            <div className="sidebar-footer">
              <div className="sidebar-user-card" onClick={() => navigate('/persona-selection')} role="button" title="Switch Portal">
                <div className="sidebar-user-avatar" style={{ borderColor: getPersonaBadgeColor(user?.persona) }}>
                  {getPersonaIcon(user?.persona)}
                </div>
                <div className="sidebar-user-info">
                  <span className="sidebar-user-name">{user.name}</span>
                  <span className="sidebar-user-role" style={{ color: getPersonaBadgeColor(user?.persona) }}>
                    {user.persona ? `${user.persona.toUpperCase()} MODE` : 'LEARNER'}
                  </span>
                </div>
                <span className="sidebar-switch-icon">⇄</span>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content Viewport */}
        <main className="main-content" id="main">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Responsive Fallback) */}
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`mobile-nav-btn ${isActive ? 'is-active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="mobile-nav-icon">{item.icon}</span>
              <span className="mobile-nav-label">{t(item.labelKey) || item.fallbackLabel}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
