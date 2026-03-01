import { test, expect } from '../../fixtures';
import { STANDARD_VIEWPORTS } from '../../helpers/visual-helper';

/**
 * Visual Regression E2E Tests
 * Tags: @visual @regression
 *
 * These tests capture and compare screenshots against baselines
 * Run `npm run test:e2e:visual:update` to update baselines
 */
test.describe('Visual Regression @visual @regression', () => {
  test.describe('Public Pages', () => {
    test('landing page visual regression @public', async ({ page, visual }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await visual.prepareForComparison();

      await visual.compareToBaseline({
        name: 'landing-page',
        mask: visual.maskDynamicContent(),
      });
    });

    test('login page visual regression @auth', async ({ loginPage, visual }) => {
      await loginPage.goto();
      await visual.prepareForComparison();

      await visual.compareToBaseline({
        name: 'login-page',
        maxDiffPixelRatio: 0.02,
      });
    });

    test('signup page visual regression @auth', async ({ page, visual }) => {
      await page.goto('/signup');
      await page.waitForLoadState('networkidle');
      await visual.prepareForComparison();

      await visual.compareToBaseline({
        name: 'signup-page',
        maxDiffPixelRatio: 0.02,
      });
    });

    test('forgot password page visual regression @auth', async ({ page, visual }) => {
      await page.goto('/forgot-password');
      await page.waitForLoadState('networkidle');
      await visual.prepareForComparison();

      await visual.compareToBaseline({
        name: 'forgot-password-page',
      });
    });
  });

  test.describe('Authenticated Pages', () => {
    test.beforeEach(async ({ auth, page }) => {
      await auth.loginAsAdmin();
    });

    test('dashboard visual regression @dashboard', async ({ dashboardPage, visual }) => {
      await dashboardPage.goto();
      await dashboardPage.waitForDashboardReady();
      await visual.prepareForComparison();

      await visual.compareToBaseline({
        name: 'dashboard-page',
        mask: visual.maskDynamicContent(),
      });
    });

    test('profile page visual regression @profile', async ({ page, visual }) => {
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      await visual.prepareForComparison();

      await visual.compareToBaseline({
        name: 'profile-page',
        mask: visual.maskDynamicContent(),
      });
    });

    test('create plan page visual regression @dashboard', async ({ page, visual }) => {
      await page.goto('/create-plan');
      await page.waitForLoadState('networkidle');
      await visual.prepareForComparison();

      await visual.compareToBaseline({
        name: 'create-plan-page',
      });
    });
  });

  test.describe('Admin Pages', () => {
    test.beforeEach(async ({ auth }) => {
      await auth.loginAsAdmin();
    });

    test('admin overview visual regression @admin', async ({ page, visual }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      await visual.prepareForComparison();

      await visual.compareToBaseline({
        name: 'admin-overview',
        mask: visual.maskDynamicContent(),
      });
    });

    test('admin users page visual regression @admin', async ({ page, visual }) => {
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');
      await visual.prepareForComparison();

      await visual.compareToBaseline({
        name: 'admin-users-page',
        mask: visual.maskDynamicContent(),
      });
    });

    test('CMS editor visual regression @admin @cms', async ({ cmsEditorPage, visual }) => {
      await cmsEditorPage.goto();
      await cmsEditorPage.waitForCmsReady();
      await visual.prepareForComparison();

      await visual.compareToBaseline({
        name: 'cms-editor',
        mask: visual.maskDynamicContent(),
      });
    });
  });

  test.describe('Responsive Visual Tests', () => {
    const viewportsToTest = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 },
    ];

    for (const viewport of viewportsToTest) {
      test(`landing page responsive - ${viewport.name} @responsive`, async ({ page, visual }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await visual.prepareForComparison();

        await visual.compareToBaseline({
          name: `landing-page-${viewport.name}`,
          mask: visual.maskDynamicContent(),
        });
      });

      test(`login page responsive - ${viewport.name} @responsive`, async ({ loginPage, visual }) => {
        await loginPage.page.setViewportSize({ width: viewport.width, height: viewport.height });
        await loginPage.goto();
        await visual.prepareForComparison();

        await visual.compareToBaseline({
          name: `login-page-${viewport.name}`,
        });
      });
    }
  });

  test.describe('Theme Visual Tests', () => {
    test('landing page dark mode @theme', async ({ page, visual }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await visual.prepareForComparison();

      await visual.compareToBaseline({
        name: 'landing-page-dark',
        mask: visual.maskDynamicContent(),
      });
    });

    test('login page dark mode @theme', async ({ loginPage, visual }) => {
      await loginPage.page.emulateMedia({ colorScheme: 'dark' });
      await loginPage.goto();
      await visual.prepareForComparison();

      await visual.compareToBaseline({
        name: 'login-page-dark',
      });
    });
  });

  test.describe('Component Visual Tests', () => {
    test('navigation header visual regression @component', async ({ page, visual }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const header = page.locator('header').first();
      await expect(header).toHaveScreenshot('navigation-header.png', {
        maxDiffPixelRatio: 0.01,
      });
    });

    test('footer visual regression @component', async ({ page, visual }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const footer = page.locator('footer').first();
      const isVisible = await footer.isVisible().catch(() => false);

      if (isVisible) {
        await footer.scrollIntoViewIfNeeded();
        await expect(footer).toHaveScreenshot('footer.png', {
          maxDiffPixelRatio: 0.01,
        });
      }
    });
  });
});
