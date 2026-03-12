import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { SkipLink } from '@/components/ui/skip-link';
import PageLoader from './components/PageLoader';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import SessionExpiryWarning from './components/SessionExpiryWarning';

// Critical path - eagerly loaded for fast initial render
import LandingPage from './pages/LandingPageNew';
import LoginPage from './pages/auth/login';
import SignupPage from './pages/auth/signup';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Lazy-loaded pages - split into separate chunks
// Auth pages (non-critical)
const ForgotPasswordPage = lazy(() => import('./pages/auth/forgot-password'));
const ResetPasswordPage = lazy(() => import('./pages/auth/reset-password'));
const VerifyEmailPage = lazy(() => import('./pages/auth/verify-email'));
const MicrosoftCallbackPage = lazy(() => import('./pages/auth/microsoft-callback'));

// Core app pages
const OnboardingPage = lazy(() => import('./pages/onboarding'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CreatePlanPage = lazy(() => import('./pages/CreatePlanPage'));
const InterviewQuestionnairePage = lazy(() => import('./pages/InterviewQuestionnairePage'));

// Generation and Preview pages
const GenerationPage = lazy(() => import('./pages/generation/GenerationPage'));
const BusinessPlanPreviewPage = lazy(() => import('./pages/business-plan/BusinessPlanPreviewPage'));

// Templates and Examples
const TemplateDetailPage = lazy(() => import('./pages/TemplateDetailPage'));
const ExamplePlansPage = lazy(() => import('./pages/ExamplePlansPage'));
const ExamplePlanDetailPage = lazy(() => import('./pages/ExamplePlanDetailPage'));

// Organization management (for org owners/admins)
const OrganizationManagePage = lazy(() => import('./pages/OrganizationManagePage'));

// Subscription and Billing
const SubscriptionPlansPage = lazy(() => import('./pages/SubscriptionPlansPage'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));
const InvoicesPage = lazy(() => import('./pages/InvoicesPage'));
const CheckoutSuccessPage = lazy(() => import('./pages/CheckoutSuccessPage'));
const CheckoutCancelPage = lazy(() => import('./pages/CheckoutCancelPage'));

// Static pages
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const SecurityPage = lazy(() => import('./pages/SecurityPage'));
const CompliancePage = lazy(() => import('./pages/CompliancePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const BugReportPage = lazy(() => import('./pages/BugReportPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const NotificationPreferencesPage = lazy(() => import('./pages/NotificationPreferencesPage'));

// Financial Projections (Previsio) pages
const FinancialProjectionsPage = lazy(() => import('./pages/financial/FinancialProjectionsPage'));
const SalesSection = lazy(() => import('./pages/financial/SalesSection'));
const COGSSection = lazy(() => import('./pages/financial/COGSSection'));
const PayrollSection = lazy(() => import('./pages/financial/PayrollSection'));
const SalesExpensesSection = lazy(() => import('./pages/financial/SalesExpensesSection'));
const AdminExpensesSection = lazy(() => import('./pages/financial/AdminExpensesSection'));
const CapexSection = lazy(() => import('./pages/financial/CapexSection'));
const ProjectCostSection = lazy(() => import('./pages/financial/ProjectCostSection'));
const FinancingSection = lazy(() => import('./pages/financial/FinancingSection'));
const ReportsSection = lazy(() => import('./pages/financial/ReportsSection'));

// Layouts - lazy loaded as they're only needed after auth
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const DashboardLayout = lazy(() => import('./components/DashboardLayout'));

// Admin pages - all lazy loaded (admin section is rarely accessed)
const AdminOverviewPage = lazy(() => import('./pages/admin/AdminOverviewPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminUserDetailPage = lazy(() => import('./pages/admin/AdminUserDetailPage'));
const AdminOrganizationsPage = lazy(() => import('./pages/admin/AdminOrganizationsPage'));
const AdminOrganizationDetailPage = lazy(() => import('./pages/admin/AdminOrganizationDetailPage'));
const AdminBusinessPlansPage = lazy(() => import('./pages/admin/AdminBusinessPlansPage'));
const AdminAIPromptsPage = lazy(() => import('./pages/admin/AdminAIPromptsPage'));
const AdminActivityLogsPage = lazy(() => import('./pages/admin/AdminActivityLogsPage'));
const AdminSystemHealthPage = lazy(() => import('./pages/admin/AdminSystemHealthPage'));
const AdminTemplatesPage = lazy(() => import('./pages/admin/AdminTemplatesPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));
const PromptRegistryDocPage = lazy(() => import('./pages/admin/PromptRegistryDocPage'));
// AI Studio pages
const AIStudioDashboard = lazy(() => import('./pages/admin/ai-studio/AIStudioDashboard'));
const AIStudioPromptsPage = lazy(() => import('./pages/admin/ai-studio/AIStudioPromptsPage'));
const AIStudioPromptEditorPage = lazy(() => import('./pages/admin/ai-studio/AIStudioPromptEditorPage'));
const AIStudioAnalyticsPage = lazy(() => import('./pages/admin/ai-studio/AIStudioAnalyticsPage'));
const AIStudioABTestingPage = lazy(() => import('./pages/admin/ai-studio/AIStudioABTestingPage'));
const AIStudioQuestionsPage = lazy(() => import('./pages/admin/ai-studio/AIStudioQuestionsPage'));
const AIStudioConfigPage = lazy(() => import('./pages/admin/ai-studio/AIStudioConfigPage'));
const AIStudioMLMonitoringPage = lazy(() => import('./pages/admin/ai-studio/AIStudioMLMonitoringPage'));
const AIStudioTelemetryPage = lazy(() => import('./pages/admin/ai-studio/AIStudioTelemetryPage'));
const AdminSubscriptionIntelligencePage = lazy(() => import('./pages/admin/AdminSubscriptionIntelligencePage'));
const AdminMetricsPage = lazy(() => import('./pages/admin/AdminMetricsPage'));
const AdminIssueTrackerPage = lazy(() => import('./pages/admin/AdminIssueTrackerPage'));
const AdminFeatureFlagsPage = lazy(() => import('./pages/admin/AdminFeatureFlagsPage'));
const AdminEmailTemplatesPage = lazy(() => import('./pages/admin/AdminEmailTemplatesPage'));
const EmailTemplatesDocPage = lazy(() => import('./pages/admin/EmailTemplatesDocPage'));
const CmsEditorPage = lazy(() => import('./pages/admin/CmsEditorPage'));
const CmsQuestionnairePage = lazy(() => import('./pages/admin/CmsQuestionnairePage'));
const AdminQuestionnairePreviewPage = lazy(() => import('./pages/admin/AdminQuestionnairePreviewPage'));
const ContentManagerPage = lazy(() => import('./pages/admin/content/ContentManagerPage'));
const QuestionnaireManagerPage = lazy(() => import('./pages/admin/questionnaire/QuestionnaireManagerPage'));

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

// Redirect old /questionnaire/:planId to new /interview/:planId
function RedirectToInterview() {
  const location = useLocation();
  const planId = location.pathname.split('/')[2];
  return <Navigate to={`/interview/${planId}${location.hash}`} replace />;
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

            <SessionExpiryWarning />
            <ErrorBoundary>
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
            {/* Redirect legacy persona-selection to onboarding */}
            <Route path="/persona-selection" element={<Navigate to="/onboarding" replace />} />

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

            {/* Organization management */}
            <Route
              path="/organization/:organizationId/manage"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<OrganizationManagePage />} />
            </Route>

            {/* Interview - full screen */}
            <Route
              path="/interview/:planId"
              element={
                <ProtectedRoute>
                  <InterviewQuestionnairePage />
                </ProtectedRoute>
              }
            />

            {/* Legacy route redirects */}
            <Route path="/questionnaire/:planId" element={<RedirectToInterview />} />
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

            {/* Financial Projections (Previsio) */}
            <Route
              path="/business-plan/:id/financials"
              element={
                <ProtectedRoute>
                  <FinancialProjectionsPage />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="sales" replace />} />
              <Route path="sales" element={<SalesSection />} />
              <Route path="cogs" element={<COGSSection />} />
              <Route path="payroll" element={<PayrollSection />} />
              <Route path="sales-expenses" element={<SalesExpensesSection />} />
              <Route path="admin-expenses" element={<AdminExpensesSection />} />
              <Route path="capex" element={<CapexSection />} />
              <Route path="project-cost" element={<ProjectCostSection />} />
              <Route path="financing" element={<FinancingSection />} />
              <Route path="reports" element={<ReportsSection />} />
            </Route>

            {/* Notifications */}
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<NotificationsPage />} />
              <Route path="preferences" element={<NotificationPreferencesPage />} />
            </Route>

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
                <AdminRoute>
                  <CmsEditorPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/cms/questionnaire"
              element={
                <AdminRoute>
                  <CmsQuestionnairePage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/cms/questionnaire-preview"
              element={
                <AdminRoute>
                  <AdminQuestionnairePreviewPage />
                </AdminRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminOverviewPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="users/:userId" element={<AdminUserDetailPage />} />
              <Route path="organizations" element={<AdminOrganizationsPage />} />
              <Route path="organizations/:organizationId" element={<AdminOrganizationDetailPage />} />
              <Route path="business-plans" element={<AdminBusinessPlansPage />} />
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
              <Route path="ai-studio/ml-monitoring" element={<AIStudioMLMonitoringPage />} />
              <Route path="ai-studio/telemetry" element={<AIStudioTelemetryPage />} />
              <Route path="subscription-intelligence" element={<AdminSubscriptionIntelligencePage />} />
              <Route path="feature-flags" element={<AdminFeatureFlagsPage />} />
              <Route path="bug-report" element={<AdminIssueTrackerPage />} />
              <Route path="email-templates" element={<AdminEmailTemplatesPage />} />
              <Route path="email-templates/docs" element={<EmailTemplatesDocPage />} />
              <Route path="metrics" element={<AdminMetricsPage />} />
              <Route path="content" element={<ContentManagerPage />} />
              <Route path="questionnaire" element={<QuestionnaireManagerPage />} />
            </Route>

            {/* 404 catch-all route - must be last */}
            <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
            </ErrorBoundary>
        </Router>
    </ToastProvider>
  );
}

export default App;
