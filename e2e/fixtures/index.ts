import { test as base, Page } from '@playwright/test';
import { AuthHelper } from '../helpers/auth-helper';
import { ScreenshotHelper } from '../helpers/screenshot-helper';
import { VisualHelper } from '../helpers/visual-helper';

// Import page objects
import { LoginPage } from '../page-objects/auth/login.page';
import { DashboardPage } from '../page-objects/dashboard/dashboard.page';
import { CmsEditorPage } from '../page-objects/admin/cms-editor.page';
import { CreatePlanPage, QuestionnairePage, BusinessPlanPreviewPage, GenerationPage } from '../page-objects/business-plan';
import { SubscriptionPlansPage } from '../page-objects/subscription/subscription-plans.page';

/**
 * Custom test fixtures for Sqordia E2E tests
 */
export type TestFixtures = {
  // Helpers
  auth: AuthHelper;
  screenshots: ScreenshotHelper;
  visual: VisualHelper;

  // Page Objects
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  cmsEditorPage: CmsEditorPage;
  createPlanPage: CreatePlanPage;
  questionnairePage: QuestionnairePage;
  previewPage: BusinessPlanPreviewPage;
  generationPage: GenerationPage;
  subscriptionPlansPage: SubscriptionPlansPage;

  // Pre-authenticated pages
  authenticatedPage: Page;
  adminPage: Page;
};

/**
 * Extended test with custom fixtures
 * All fixtures that depend on 'page' are test-scoped
 */
export const test = base.extend<TestFixtures>({
  // Auth helper fixture
  auth: [async ({ page }, use) => {
    const auth = new AuthHelper(page);
    await use(auth);
  }, { scope: 'test' }],

  // Screenshot helper fixture
  screenshots: [async ({ page }, use) => {
    const screenshots = new ScreenshotHelper(page);
    await use(screenshots);
  }, { scope: 'test' }],

  // Visual helper fixture
  visual: [async ({ page }, use) => {
    const visual = new VisualHelper(page);
    await use(visual);
  }, { scope: 'test' }],

  // Login page object fixture
  loginPage: [async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  }, { scope: 'test' }],

  // Dashboard page object fixture
  dashboardPage: [async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  }, { scope: 'test' }],

  // CMS Editor page object fixture
  cmsEditorPage: [async ({ page }, use) => {
    const cmsEditorPage = new CmsEditorPage(page);
    await use(cmsEditorPage);
  }, { scope: 'test' }],

  // Create Plan page object fixture
  createPlanPage: [async ({ page }, use) => {
    const createPlanPage = new CreatePlanPage(page);
    await use(createPlanPage);
  }, { scope: 'test' }],

  // Questionnaire page object fixture
  questionnairePage: [async ({ page }, use) => {
    const questionnairePage = new QuestionnairePage(page);
    await use(questionnairePage);
  }, { scope: 'test' }],

  // Preview page object fixture
  previewPage: [async ({ page }, use) => {
    const previewPage = new BusinessPlanPreviewPage(page);
    await use(previewPage);
  }, { scope: 'test' }],

  // Generation page object fixture
  generationPage: [async ({ page }, use) => {
    const generationPage = new GenerationPage(page);
    await use(generationPage);
  }, { scope: 'test' }],

  // Subscription plans page object fixture
  subscriptionPlansPage: [async ({ page }, use) => {
    const subscriptionPlansPage = new SubscriptionPlansPage(page);
    await use(subscriptionPlansPage);
  }, { scope: 'test' }],

  // Authenticated page fixture (regular user)
  authenticatedPage: [async ({ page }, use) => {
    const auth = new AuthHelper(page);
    const success = await auth.loginAsUser();
    if (!success) {
      // Fallback to admin if regular user doesn't exist
      await auth.loginAsAdmin();
    }
    await use(page);
  }, { scope: 'test' }],

  // Admin page fixture
  adminPage: [async ({ page }, use) => {
    const auth = new AuthHelper(page);
    await auth.loginAsAdmin();
    await use(page);
  }, { scope: 'test' }],
});

// Re-export expect from Playwright
export { expect } from '@playwright/test';
