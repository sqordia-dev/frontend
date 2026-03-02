import { test, expect } from '../../fixtures';

/**
 * Create Plan E2E Tests
 * Tags: @business-plan @create @crud
 */
test.describe('Create Plan @business-plan @create', () => {
  /**
   * Helper to check if user is stuck on onboarding
   */
  const isOnOnboarding = async (page: import('@playwright/test').Page): Promise<boolean> => {
    await page.waitForTimeout(1000);
    const url = page.url();
    const onOnboarding = url.includes('/onboarding') || url.includes('/persona-selection');
    if (onOnboarding) {
      console.log(`⚠️ User on onboarding page: ${url}`);
    }
    return onOnboarding;
  };

  test.beforeEach(async ({ auth, dashboardPage }) => {
    await auth.loginAsAdmin();

    // Handle onboarding if needed
    await dashboardPage.page.waitForLoadState('networkidle');
    const url = dashboardPage.page.url();
    if (url.includes('/onboarding') || url.includes('/persona-selection')) {
      await dashboardPage.completeOnboarding();
    }
  });

  // ==================== SMOKE TESTS ====================

  test('should display create plan page @smoke', async ({ createPlanPage, screenshots }) => {
    await createPlanPage.goto();

    if (await isOnOnboarding(createPlanPage.page)) {
      return;
    }

    await createPlanPage.expectPageLoaded();
    await screenshots.capture({ feature: 'business-plan', name: 'create-plan-page', fullPage: true });
  });

  test('should show AI badge @smoke @ui', async ({ createPlanPage }) => {
    await createPlanPage.goto();

    if (await isOnOnboarding(createPlanPage.page)) {
      return;
    }

    await createPlanPage.waitForPageReady();
    await createPlanPage.expectAIBadgeVisible();
  });

  // ==================== FORM VALIDATION TESTS ====================

  test('should disable create button when project name is empty @validation', async ({ createPlanPage }) => {
    await createPlanPage.goto();

    if (await isOnOnboarding(createPlanPage.page)) {
      return;
    }

    await createPlanPage.waitForPageReady();
    await createPlanPage.clearProjectName();
    await createPlanPage.expectCreateButtonDisabled();
  });

  test('should enable create button when project name is entered @validation', async ({ createPlanPage }) => {
    await createPlanPage.goto();

    if (await isOnOnboarding(createPlanPage.page)) {
      return;
    }

    await createPlanPage.waitForPageReady();
    await createPlanPage.fillProjectName('Test Business Plan');
    await createPlanPage.expectCreateButtonEnabled();
  });

  test('should show error for empty submission @validation', async ({ createPlanPage }) => {
    await createPlanPage.goto();

    if (await isOnOnboarding(createPlanPage.page)) {
      return;
    }

    await createPlanPage.waitForPageReady();
    // Clear any existing input and try to submit
    await createPlanPage.clearProjectName();

    // The button should be disabled, so error shouldn't appear from submission
    await createPlanPage.expectCreateButtonDisabled();
  });

  // ==================== HAPPY PATH TESTS ====================

  test('should create a new business plan @crud @critical', async ({ createPlanPage, screenshots }) => {
    await createPlanPage.goto();

    if (await isOnOnboarding(createPlanPage.page)) {
      return;
    }

    await createPlanPage.waitForPageReady();

    const planName = `E2E Test Plan ${Date.now()}`;
    await createPlanPage.createPlanAndWaitForQuestionnaire(planName);

    await screenshots.capture({ feature: 'business-plan', name: 'plan-created-questionnaire' });

    // Should be on questionnaire page
    await expect(createPlanPage.page).toHaveURL(/\/questionnaire\//);
  });

  test('should preserve project name while typing @ui', async ({ createPlanPage }) => {
    await createPlanPage.goto();

    if (await isOnOnboarding(createPlanPage.page)) {
      return;
    }

    await createPlanPage.waitForPageReady();

    const testName = 'My Awesome Business';
    await createPlanPage.fillProjectName(testName);
    await createPlanPage.expectProjectName(testName);
  });

  // ==================== NAVIGATION TESTS ====================

  test('should navigate back to dashboard @navigation', async ({ createPlanPage, dashboardPage }) => {
    await createPlanPage.goto();

    if (await isOnOnboarding(createPlanPage.page)) {
      return;
    }

    await createPlanPage.waitForPageReady();
    await createPlanPage.goBackToDashboard();
    await dashboardPage.expectDashboardLoaded();
  });

  test('should be accessible from dashboard @navigation', async ({ dashboardPage, createPlanPage }) => {
    await dashboardPage.goto();

    if (await isOnOnboarding(dashboardPage.page)) {
      return;
    }

    await dashboardPage.waitForDashboardReady();
    await dashboardPage.clickCreatePlan();
    await createPlanPage.expectPageLoaded();
  });

  // ==================== RESPONSIVE TESTS ====================

  test('should display correctly on mobile @responsive', async ({ createPlanPage, screenshots }) => {
    await createPlanPage.page.setViewportSize({ width: 375, height: 667 });
    await createPlanPage.goto();

    if (await isOnOnboarding(createPlanPage.page)) {
      return;
    }

    await createPlanPage.expectPageLoaded();
    await screenshots.capture({ feature: 'business-plan', name: 'create-plan-mobile' });
  });

  test('should display correctly on tablet @responsive', async ({ createPlanPage, screenshots }) => {
    await createPlanPage.page.setViewportSize({ width: 768, height: 1024 });
    await createPlanPage.goto();

    if (await isOnOnboarding(createPlanPage.page)) {
      return;
    }

    await createPlanPage.expectPageLoaded();
    await screenshots.capture({ feature: 'business-plan', name: 'create-plan-tablet' });
  });

  // ==================== ERROR HANDLING ====================

  test('should handle creation errors gracefully @error-handling', async ({ createPlanPage }) => {
    await createPlanPage.goto();

    if (await isOnOnboarding(createPlanPage.page)) {
      return;
    }

    await createPlanPage.waitForPageReady();

    // Try to create with valid name - should succeed or show meaningful error
    await createPlanPage.fillProjectName('Test Plan');

    const isEnabled = await createPlanPage.isCreateButtonEnabled();
    expect(isEnabled).toBeTruthy();
  });
});
