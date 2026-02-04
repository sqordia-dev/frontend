import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { SkipLink } from '@/components/ui/skip-link';
import LandingPage from './pages/LandingPageNew';
// Auth pages
import {
  SignupPage,
  LoginPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
  MicrosoftCallbackPage,
} from './pages/auth';
import PersonaSelectionPage from './pages/PersonaSelectionPage';
import OnboardingPage from './pages/onboarding';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import CreatePlanPage from './pages/CreatePlanPage';
import WizardQuestionnairePage from './pages/WizardQuestionnairePage';
import { QuestionnairePage as NewQuestionnairePage } from './pages/questionnaire';
import PlanViewPage from './pages/PlanViewPage';
// Generation and Preview pages
import { GenerationPage } from './pages/generation';
import { BusinessPlanPreviewPage } from './pages/business-plan';
import TemplateDetailPage from './pages/TemplateDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import DashboardLayout from './components/DashboardLayout';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminOrganizationsPage from './pages/admin/AdminOrganizationsPage';
import AdminBusinessPlansPage from './pages/admin/AdminBusinessPlansPage';
import AdminAIPromptsPage from './pages/admin/AdminAIPromptsPage';
import AdminActivityLogsPage from './pages/admin/AdminActivityLogsPage';
import AdminSystemHealthPage from './pages/admin/AdminSystemHealthPage';
import AdminTemplatesPage from './pages/admin/AdminTemplatesPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import { AdminAIConfigPage } from './pages/admin/AdminAIConfigPage';
import AdminCmsPage from './pages/admin/AdminCmsPage';
import AdminCmsPreviewPage from './pages/admin/AdminCmsPreviewPage';
import SubscriptionPlansPage from './pages/SubscriptionPlansPage';
import SubscriptionPage from './pages/SubscriptionPage';
import InvoicesPage from './pages/InvoicesPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import CheckoutCancelPage from './pages/CheckoutCancelPage';
import ExamplePlansPage from './pages/ExamplePlansPage';
import ExamplePlanDetailPage from './pages/ExamplePlanDetailPage';
import BlogPostPage from './pages/BlogPostPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import SecurityPage from './pages/SecurityPage';
import CompliancePage from './pages/CompliancePage';
import ScrollToTop from './components/ScrollToTop';

// Component to handle scroll restoration prevention
function ScrollRestorationHandler() {
  const location = useLocation();

  useEffect(() => {
    // Prevent browser from restoring scroll position
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [location.pathname]);

  return null;
}

function App() {
  // Prevent scroll restoration globally
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <ToastProvider>
      <Router>
        {/* Prevent browser from restoring scroll position */}
        <ScrollRestorationHandler />
        <ScrollToTop />
        {/* Skip to main content link for accessibility */}
        <SkipLink targetId="main-content" />
        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/fr" element={<LandingPage />} />
        {/* New auth pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/register" element={<SignupPage />} /> {/* Alias for signup */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/auth/microsoft/callback" element={<MicrosoftCallbackPage />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/persona-selection"
          element={
            <ProtectedRoute>
              <PersonaSelectionPage />
            </ProtectedRoute>
          }
        />
        <Route path="/template/:templateId" element={<TemplateDetailPage />} />
        <Route path="/example-plans" element={<ExamplePlansPage />} />
        <Route path="/example-plans/:id" element={<ExamplePlanDetailPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/compliance" element={<CompliancePage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
        </Route>
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ProfilePage />} />
        </Route>
        <Route
          path="/create-plan"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CreatePlanPage />} />
        </Route>
        <Route
          path="/questionnaire/:planId"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<WizardQuestionnairePage />} />
        </Route>
        {/* New questionnaire flow (card-based) */}
        <Route
          path="/questionnaire-new/:planId"
          element={
            <ProtectedRoute>
              <NewQuestionnairePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plans/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PlanViewPage />} />
        </Route>
        {/* Generation page - full-screen AI generation progress */}
        <Route
          path="/generation/:planId"
          element={
            <ProtectedRoute>
              <GenerationPage />
            </ProtectedRoute>
          }
        />
        {/* Business plan preview page - full-screen document preview */}
        <Route
          path="/business-plan/:id/preview"
          element={
            <ProtectedRoute>
              <BusinessPlanPreviewPage />
            </ProtectedRoute>
          }
        />
        <Route path="/subscription-plans" element={<SubscriptionPlansPage />} />
        <Route
          path="/subscription"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SubscriptionPage />} />
        </Route>
        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<InvoicesPage />} />
        </Route>
        {/* CMS routes - standalone (no AdminLayout sidebar) */}
        <Route path="/admin/cms" element={<ProtectedRoute><AdminCmsPage /></ProtectedRoute>} />
        <Route path="/admin/cms/preview" element={<ProtectedRoute><AdminCmsPreviewPage /></ProtectedRoute>} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverviewPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="organizations" element={<AdminOrganizationsPage />} />
          <Route path="business-plans" element={<AdminBusinessPlansPage />} />
          <Route path="templates" element={<AdminTemplatesPage />} />
          <Route path="prompts-studio" element={<AdminAIPromptsPage />} />
          <Route path="ai-prompts" element={<AdminAIPromptsPage />} />
          <Route path="activity-logs" element={<AdminActivityLogsPage />} />
          <Route path="system-health" element={<AdminSystemHealthPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="ai-config" element={<AdminAIConfigPage />} />
        </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
