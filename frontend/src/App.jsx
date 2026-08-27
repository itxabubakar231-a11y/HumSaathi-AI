import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { I18nProvider } from './context/I18nContext';
import AppShell from './components/layout/AppShell';
import LandingPage from './pages/LandingPage';
import SetupPage from './pages/SetupPage';
import AssessmentPage from './pages/AssessmentPage';
import DashboardPage from './pages/DashboardPage';
import ActivityPage from './pages/ActivityPage';
import FeedbackPage from './pages/FeedbackPage';
import ProgressPage from './pages/ProgressPage';
import SettingsPage from './pages/SettingsPage';
import ParentPage from './pages/ParentPage';
import ScenarioPage from './pages/ScenarioPage';
import ConversationPage from './pages/ConversationPage';
import ConversationFeedbackPage from './pages/ConversationFeedbackPage';
import SkillModulePage from './pages/SkillModulePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PersonaSelectionPage from './pages/PersonaSelectionPage';

function AppRoutes() {
  const { user, loading } = useUser();
  const language = user?.language || localStorage.getItem('humsaathi_language') || 'en';

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <I18nProvider language={language}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<Navigate to="/" replace />} />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/persona-selection" element={<PersonaSelectionPage />} />
        <Route path="/assessment" element={<AppShell><AssessmentPage /></AppShell>} />
        <Route path="/dashboard" element={<AppShell><DashboardPage /></AppShell>} />
        <Route path="/activity/:id" element={<AppShell><ActivityPage /></AppShell>} />
        <Route path="/feedback" element={<AppShell><FeedbackPage /></AppShell>} />
        <Route path="/progress" element={<AppShell><ProgressPage /></AppShell>} />
        <Route path="/settings" element={<AppShell><SettingsPage /></AppShell>} />
        <Route path="/parent" element={<AppShell><ParentPage /></AppShell>} />
        <Route path="/scenarios" element={<AppShell><ScenarioPage /></AppShell>} />
        <Route path="/conversation/:sessionId" element={<AppShell><ConversationPage /></AppShell>} />
        <Route path="/feedback/:sessionId" element={<AppShell><ConversationFeedbackPage /></AppShell>} />
        <Route path="/skill/:moduleId" element={<AppShell><SkillModulePage /></AppShell>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </I18nProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </BrowserRouter>
  );
}
