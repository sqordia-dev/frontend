import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { MaintenanceProvider, useMaintenance } from './contexts/MaintenanceContext';
import { SkipLink } from '@/components/ui/skip-link';
import PageLoader from './components/PageLoader';
import ScrollToTop from './components/ScrollToTop';
import { authService } from './lib/auth-service';

// Critical path - eagerly loaded for fast initial render
import LandingPage from './routes/LandingPageNew';
import LoginPage from './routes/auth/login';
import SignupPage from './routes/auth/signup';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy-loaded pages - split into separate chunks
// Auth pages (non-critical)
const ForgotPasswordPage = lazy(() => import('./routes/auth/forgot-password'));
const ResetPasswordPage = lazy(() => import('./routes/auth/reset-password'));
const VerifyEmailPage = lazy(() => import('./routes/auth/verify-email'));
const MicrosoftCallbackPage = lazy(() => import('./routes/auth/microsoft-callback'));

// Core app pages
const PersonaSelectionPage = lazy(() => import('./routes/PersonaSelectionPage'));
const OnboardingPage = lazy(() => import('./routes/onboarding'));
const DashboardPage = lazy(() => import('./routes/DashboardPage'));
const ProfilePage = lazy(() => import('./routes/ProfilePage'));
const CreatePlanPage = lazy(() => import('./routes/CreatePlanPage'));
const InterviewQuestionnairePage = lazy(() => import('./routes/InterviewQuestionnairePage'));

// Generation and Preview pages
const GenerationPage = lazy(() => import('./routes/generation/GenerationPage'));
const BusinessPlanPreviewPage = lazy(() => import('./routes/business-plan/BusinessPlanPreviewPage'));

// Templates and Examples
const TemplateDetailPage = lazy(() => import('./routes/TemplateDetailPage'));
const ExamplePlansPage = lazy(() => import('./routes/ExamplePlansPage'));
const ExamplePlanDetailPage = lazy(() => import('./routes/ExamplePlanDetailPage'));

// Subscription and Billing
const SubscriptionPlansPage = lazy(() => import('./routes/SubscriptionPlansPage'));
const SubscriptionPage = lazy(() => import('./routes/SubscriptionPage'));
const InvoicesPage = lazy(() => import('./routes/InvoicesPage'));
const CheckoutSuccessPage = lazy(() => import('./routes/CheckoutSuccessPage'));
const CheckoutCancelPage = lazy(() => import('./routes/CheckoutCancelPage'));

// Static pages
const BlogPostPage = lazy(() => import('./routes/BlogPostPage'));
const PrivacyPolicyPage = lazy(() => import('./routes/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./routes/TermsOfServicePage'));
const SecurityPage = lazy(() => import('./routes/SecurityPage'));
const CompliancePage = lazy(() => import('./routes/CompliancePage'));
const NotFoundPage = lazy(() => import('./routes/NotFoundPage'));
const BugReportPage = lazy(() => import('./routes/BugReportPage'));
const MaintenancePage = lazy(() => import('./routes/MaintenancePage'));

// Layouts - lazy loaded as they're only needed after auth
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const DashboardLayout = lazy(() => import('./components/DashboardLayout'));

// Admin pages - all lazy loaded (admin section is rarely accessed)
const AdminOverviewPage = lazy(() => import('./routes/admin/AdminOverviewPage'));
const AdminUsersPage = lazy(() => import('./routes/admin/AdminUsersPage'));
const AdminUserDetailPage = lazy(() => import('./routes/admin/AdminUserDetailPage'));
const AdminOrganizationsPage = lazy(() => import('./routes/admin/AdminOrganizationsPage'));
const AdminAIPromptsPage = lazy(() => import('./routes/admin/AdminAIPromptsPage'));
const AdminActivityLogsPage = lazy(() => import('./routes/admin/AdminActivityLogsPage'));
const AdminSystemHealthPage = lazy(() => import('./routes/admin/AdminSystemHealthPage'));
const AdminTemplatesPage = lazy(() => import('./routes/admin/AdminTemplatesPage'));
const AdminSettingsPage = lazy(() => import('./routes/admin/AdminSettingsPage'));
const PromptRegistryDocPage = lazy(() => import('./routes/admin/PromptRegistryDocPage'));
// AI Studio pages
const AIStudioDashboard = lazy(() => import('./routes/admin/ai-studio/AIStudioDashboard'));
const AIStudioPromptsPage = lazy(() => import('./routes/admin/ai-studio/AIStudioPromptsPage'));
const AIStudioPromptEditorPage = lazy(() => import('./routes/admin/ai-studio/AIStudioPromptEditorPage'));
const AIStudioAnalyticsPage = lazy(() => import('./routes/admin/ai-studio/AIStudioAnalyticsPage'));
const AIStudioABTestingPage = lazy(() => import('./routes/admin/ai-studio/AIStudioABTestingPage'));
const AIStudioQuestionsPage = lazy(() => import('./routes/admin/ai-studio/AIStudioQuestionsPage'));
const AIStudioConfigPage = lazy(() => import('./routes/admin/ai-studio/AIStudioConfigPage'));
const AdminIssueTrackerPage = lazy(() => import('./routes/admin/AdminIssueTrackerPage'));
const AdminFeatureFlagsPage = lazy(() => import('./routes/admin/AdminFeatureFlagsPage'));
const CmsEditorPage = lazy(() => import('./routes/admin/CmsEditorPage'));
const CmsQuestionnairePage = lazy(() => import('./routes/admin/CmsQuestionnairePage'));
const AdminQuestionnairePreviewPage = lazy(() => import('./routes/admin/AdminQuestionnairePreviewPage'));

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

// Redirect old /plans/:id routes to new /business-plan/:id/preview
function RedirectToPreview() {
  const location = useLocation();
  const id = location.pathname.split('/')[2]; // Extract ID from /plans/:id or /plans/:id/preview
  return <Navigate to={`/business-plan/${id}/preview`} replace />;
}

// Maintenance gate - shows maintenance page when app is in maintenance mode
function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const { isInMaintenance, isLoading, status } = useMaintenance();
  const [user, setUser] = useState<{ role?: string } | null>(null);

  // Fetch current user for admin bypass check
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      }
    };

    // Only fetch if we might need to check admin bypass
    if (authService.isAuthenticated()) {
      fetchUser();
    }

    // Listen for storage events (auth state changes)
    const handleAuthChange = () => {
      if (authService.isAuthenticated()) {
        fetchUser();
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleAuthChange);
    return () => window.removeEventListener('storage', handleAuthChange);
  }, []);

  // Don't block during initial loading
  if (isLoading) {
    return <>{children}</>;
  }

  // Check if maintenance mode is active
  if (isInMaintenance) {
    // Allow admin bypass if configured
    const isAdmin = user?.role === 'Admin' || user?.role === 'Administrator';
    if (status?.allowAdminAccess && isAdmin) {
      return <>{children}</>;
    }

    // Show maintenance page
    return (
      <Suspense fallback={<PageLoader />}>
        <MaintenancePage />
      </Suspense>
    );
  }

  return <>{children}</>;
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
      <MaintenanceProvider>
        <Router>
          {/* Prevent browser from restoring scroll position */}
          <ScrollRestorationHandler />
          <ScrollToTop />
          {/* Skip to main content link for accessibility */}
          <SkipLink targetId="main-content" />

          <MaintenanceGate>
            <Suspense fallback={<PageLoader />}>
              <Routes>
            {/* Public routes - Landing and Auth (critical path) */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/fr" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/register" element={<SignupPage />} />

            {/* Auth routes - lazy loaded */}
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/auth/microsoft/callback" element={<MicrosoftCallbackPage />} />

            {/* Onboarding */}
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

            {/* Public content pages */}
            <Route path="/template/:templateId" element={<TemplateDetailPage />} />
            <Route path="/example-plans" element={<ExamplePlansPage />} />
            <Route path="/example-plans/:id" element={<ExamplePlanDetailPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/compliance" element={<CompliancePage />} />
            <Route path="/subscription-plans" element={<SubscriptionPlansPage />} />

            {/* Checkout pages */}
            <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
            <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />

            {/* Dashboard routes */}
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

            {/* Questionnaire - full screen */}
            <Route
              path="/questionnaire/:planId"
              element={
                <ProtectedRoute>
                  <InterviewQuestionnairePage />
                </ProtectedRoute>
              }
            />

            {/* Legacy route redirects */}
            <Route path="/plans/:id" element={<RedirectToPreview />} />
            <Route path="/plans/:id/preview" element={<RedirectToPreview />} />

            {/* Generation page - full-screen AI generation progress */}
            <Route
              path="/generation/:planId"
              element={
                <ProtectedRoute>
                  <GenerationPage />
                </ProtectedRoute>
              }
            />

            {/* Business plan preview - full-screen document preview */}
            <Route
              path="/business-plan/:id/preview"
              element={
                <ProtectedRoute>
                  <BusinessPlanPreviewPage />
                </ProtectedRoute>
              }
            />

            {/* Subscription management */}
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

            {/* Bug Report - standalone */}
            <Route
              path="/bug-report"
              element={
                <ProtectedRoute>
                  <BugReportPage />
                </ProtectedRoute>
              }
            />

            {/* CMS routes - standalone (no AdminLayout sidebar) */}
            <Route
              path="/admin/cms"
              element={
                <ProtectedRoute>
                  <CmsEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cms/questionnaire"
              element={
                <ProtectedRoute>
                  <CmsQuestionnairePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cms/questionnaire-preview"
              element={
                <ProtectedRoute>
                  <AdminQuestionnairePreviewPage />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
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
              <Route path="users/:userId" element={<AdminUserDetailPage />} />
              <Route path="organizations" element={<AdminOrganizationsPage />} />
              <Route path="templates" element={<AdminTemplatesPage />} />
              <Route path="prompts-studio" element={<AdminAIPromptsPage />} />
              <Route path="ai-prompts" element={<AdminAIPromptsPage />} />
              <Route path="activity-logs" element={<AdminActivityLogsPage />} />
              <Route path="system-health" element={<AdminSystemHealthPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="prompt-registry/docs" element={<PromptRegistryDocPage />} />
              {/* AI Studio routes */}
              <Route path="ai-studio" element={<AIStudioDashboard />} />
              <Route path="ai-studio/prompts" element={<AIStudioPromptsPage />} />
              <Route path="ai-studio/prompts/:id" element={<AIStudioPromptEditorPage />} />
              <Route path="ai-studio/analytics" element={<AIStudioAnalyticsPage />} />
              <Route path="ai-studio/ab-testing" element={<AIStudioABTestingPage />} />
              <Route path="ai-studio/questions" element={<AIStudioQuestionsPage />} />
              <Route path="ai-studio/config" element={<AIStudioConfigPage />} />
              <Route path="feature-flags" element={<AdminFeatureFlagsPage />} />
              <Route path="bug-report" element={<AdminIssueTrackerPage />} />
            </Route>

            {/* 404 catch-all route - must be last */}
            <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </MaintenanceGate>
        </Router>
      </MaintenanceProvider>
    </ToastProvider>
  );
}

export default App;
