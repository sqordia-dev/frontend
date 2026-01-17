import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import CreatePlanPage from './pages/CreatePlanPage';
import QuestionnairePage from './pages/QuestionnairePage';
import PlanViewPage from './pages/PlanViewPage';
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

function App() {
  return (
    <Router>
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
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
          <Route index element={<QuestionnairePage />} />
        </Route>
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
        <Route
          path="/subscription-plans"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SubscriptionPlansPage />} />
        </Route>
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
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
