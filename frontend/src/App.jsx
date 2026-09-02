import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { I18nProvider } from './context/I18nContext';
import AppShell from './components/layout/AppShell';
import LandingPage from './pages/LandingPage';
const SetupPage = lazy(() => import('./pages/SetupPage'));
const AssessmentPage = lazy(() => import('./pages/AssessmentPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ActivityPage = lazy(() => import('./pages/ActivityPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ParentPage = lazy(() => import('./pages/ParentPage'));
const ScenarioPage = lazy(() => import('./pages/ScenarioPage'));
const ConversationPage = lazy(() => import('./pages/ConversationPage'));
const ConversationFeedbackPage = lazy(() => import('./pages/ConversationFeedbackPage'));
const SkillModulePage = lazy(() => import('./pages/SkillModulePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const PersonaSelectionPage = lazy(() => import('./pages/PersonaSelectionPage'));

// Admin Components & Pages
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminScenariosPage = lazy(() => import('./pages/admin/AdminScenariosPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const AdminPermissionsPage = lazy(() => import('./pages/admin/AdminPermissionsPage'));
const AdminAiMonitoringPage = lazy(() => import('./pages/admin/AdminAiMonitoringPage'));
const AdminAuditLogsPage = lazy(() => import('./pages/admin/AdminAuditLogsPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));

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

function AdminProtectedRoute({ children }) {
  const { user, loading } = useUser();
  if (loading) {
    return <div className="loading-screen">Verifying authorization...</div>;
  }
  if (!user || !user.id) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'ADMIN') {
    // Normal learners cannot access /admin, redirect to their normal portal
    return <Navigate to="/dashboard" replace />;
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
      <Suspense fallback={<div className="loading-screen"><span className="loading-orbit" />Loading HumSaathi...</div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<Navigate to="/" replace />} />

        {/* Public Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/setup" element={<SetupPage />} />

        {/* Protected Learner Routes */}
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

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminDashboardPage />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminUsersPage />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/scenarios"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminScenariosPage />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminAnalyticsPage />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/permissions"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminPermissionsPage />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/ai-monitoring"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminAiMonitoringPage />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminAuditLogsPage />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminSettingsPage />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
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
