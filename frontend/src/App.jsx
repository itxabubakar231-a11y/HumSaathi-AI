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

function ProtectedRoute({ children }) {
  const { user, loading } = useUser();
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  if (!user || !user.id) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

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

        {/* Public Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/setup" element={<SetupPage />} />

        {/* Protected Routes */}
        <Route
          path="/persona-selection"
          element={
            <ProtectedRoute>
              <PersonaSelectionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment"
          element={
            <ProtectedRoute>
              <AppShell>
                <AssessmentPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppShell>
                <DashboardPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity/:id"
          element={
            <ProtectedRoute>
              <AppShell>
                <ActivityPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <AppShell>
                <FeedbackPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <AppShell>
                <ProgressPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppShell>
                <SettingsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent"
          element={
            <ProtectedRoute>
              <AppShell>
                <ParentPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/scenarios"
          element={
            <ProtectedRoute>
              <AppShell>
                <ScenarioPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/conversation/:sessionId"
          element={
            <ProtectedRoute>
              <AppShell>
                <ConversationPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback/:sessionId"
          element={
            <ProtectedRoute>
              <AppShell>
                <ConversationFeedbackPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/skill/:moduleId"
          element={
            <ProtectedRoute>
              <AppShell>
                <SkillModulePage />
              </AppShell>
            </ProtectedRoute>
          }
        />
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
