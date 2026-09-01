import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useI18n } from '../../context/I18nContext';
import { useUser } from '../../context/UserContext';
import {
  ActivitiesIcon, ArrowRightIcon, CloseIcon, HomeIcon, MenuIcon,
  ProgressIcon, SettingsIcon, ShieldIcon, UserIcon,
} from '../ui/Icons';

const navItems = [
  { path: '/dashboard', labelKey: 'nav.dashboard', label: 'Home', icon: HomeIcon },
  { path: '/scenarios', labelKey: 'nav.scenarios', label: 'Practice', icon: ActivitiesIcon },
  { path: '/progress', labelKey: 'nav.progress', label: 'Progress', icon: ProgressIcon },
  { path: '/parent', labelKey: 'nav.parent', label: 'Caregiver', icon: ShieldIcon },
  { path: '/settings', labelKey: 'nav.settings', label: 'Settings', icon: SettingsIcon },
];

const personaLabels = { child: 'Child', teen: 'Teen', adult: 'Adult' };

export default function AppShell({ children }) {
  const { t, language } = useI18n();
  const { user, updateLanguage, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const go = (path) => { navigate(path); setMobileMenuOpen(false); };
  const signOut = () => { logout(); navigate('/login'); };
  const persona = personaLabels[user?.persona] || 'Learner';

  const sidebarContent = (
    <>
      <div className="hs-shell-sidebar-head">
        <Link to="/" className="hs-shell-logo"><img src="/humsaathi-logo-v1.png" alt="HumSaathi" /></Link>
        <button className="hs-shell-close" type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu"><CloseIcon /></button>
      </div>

      <div className="hs-shell-greeting">
        <span>Learning space</span>
        <strong>{language === 'ur' ? 'خوش آمدید' : `Welcome, ${user?.name?.split(' ')[0] || 'learner'}`}</strong>
        <p>One thoughtful step at a time.</p>
      </div>

      <nav className="hs-shell-nav" aria-label="Main navigation">
        <span className="hs-shell-nav-label">Explore</span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path || (item.path === '/scenarios' && location.pathname.startsWith('/conversation'));
          return (
            <button key={item.path} className={`hs-shell-nav-item ${active ? 'is-active' : ''}`} type="button" onClick={() => go(item.path)} aria-current={active ? 'page' : undefined}>
              <Icon size={19} /><span>{t(item.labelKey) || item.label}</span>{active && <motion.i layoutId="shell-nav-indicator" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
            </button>
          );
        })}
        {user?.role === 'ADMIN' && (
          <button className="hs-shell-nav-item hs-shell-admin-link" type="button" onClick={() => go('/admin/dashboard')}><ShieldIcon size={19} /><span>Admin console</span><ArrowRightIcon size={15} /></button>
        )}
      </nav>

      <div className="hs-shell-sidebar-foot">
        <button className="hs-persona-card" type="button" onClick={() => go('/persona-selection')}>
          <span className="hs-persona-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'H'}</span>
          <span><strong>{user?.name || 'HumSaathi learner'}</strong><small>{persona} portal</small></span>
          <ArrowRightIcon size={16} />
        </button>
        <p className="hs-shell-motto"><span className="hs-urdu">ہر قدم پر، ہم ساتھی</span><small>With you, at every step.</small></p>
      </div>
    </>
  );

  return (
    <div className="hs-app-shell" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      <aside className="hs-shell-sidebar">{sidebarContent}</aside>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button className="hs-shell-backdrop" type="button" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.aside className="hs-shell-drawer" initial={reduceMotion ? false : { x: language === 'ur' ? '100%' : '-100%' }} animate={{ x: 0 }} exit={{ x: language === 'ur' ? '100%' : '-100%' }} transition={{ type: 'spring', stiffness: 360, damping: 34 }}>{sidebarContent}</motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="hs-shell-main">
        <header className="hs-shell-topbar">
          <div className="hs-shell-topbar-left">
            <button className="hs-shell-menu" type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation"><MenuIcon size={21} /></button>
            <div><span>{persona} portal</span><strong>{navItems.find((item) => location.pathname === item.path)?.label || 'Learning space'}</strong></div>
          </div>
          <div className="hs-shell-topbar-actions">
            <div className="hs-language-switch" aria-label="Language">
              {[['en', 'EN'], ['ur', 'اردو'], ['ur_rm', 'ROM']].map(([code, label]) => <button key={code} className={language === code ? 'is-active' : ''} type="button" onClick={() => updateLanguage(code)}>{label}</button>)}
            </div>
            <button className="hs-topbar-profile" type="button" onClick={() => go('/settings')} aria-label="Profile settings"><UserIcon size={18} /><span>{user?.name?.split(' ')[0] || 'Profile'}</span></button>
            <button className="hs-signout" type="button" onClick={signOut}>Sign out</button>
          </div>
        </header>

        <motion.main className="hs-shell-content" id="main" key={location.pathname} initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3, ease: 'easeOut' }}>
          {children}
        </motion.main>
      </div>

      <nav className="hs-mobile-nav" aria-label="Mobile navigation">
        {navItems.slice(0, 4).map((item) => { const Icon = item.icon; const active = location.pathname === item.path; return <button key={item.path} className={active ? 'is-active' : ''} type="button" onClick={() => go(item.path)}><Icon size={20} /><span>{item.label}</span></button>; })}
      </nav>
    </div>
  );
}
