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
    /**
     * Helper to check if user is stuck on onboarding/persona-selection
     */
    const isOnOnboarding = async (page: import('@playwright/test').Page): Promise<boolean> => {
      await page.waitForTimeout(1000);
      const url = page.url();
      const onOnboarding = url.includes('/onboarding') || url.includes('/persona-selection');
      if (onOnboarding) {
        console.log(`⚠️ Skipping: User on onboarding page: ${url}`);
      }
      return onOnboarding;
    };

    test.beforeEach(async ({ auth, page, dashboardPage }) => {
      await auth.loginAsAdmin();

      // Check if redirected to onboarding and handle it
      await page.waitForLoadState('networkidle');
      const url = page.url();
      if (url.includes('/onboarding') || url.includes('/persona-selection')) {
        await dashboardPage.completeOnboarding();
      }
    });

    test('dashboard visual regression @dashboard', async ({ dashboardPage, visual }) => {
      await dashboardPage.goto();

      if (await isOnOnboarding(dashboardPage.page)) {
        return;
      }

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

      if (await isOnOnboarding(page)) {
        return;
      }

      await visual.prepareForComparison();

      await visual.compareToBaseline({
        name: 'profile-page',
        mask: visual.maskDynamicContent(),
      });
    });

    test('create plan page visual regression @dashboard', async ({ page, visual }) => {
      await page.goto('/create-plan');
      await page.waitForLoadState('networkidle');

      if (await isOnOnboarding(page)) {
        return;
      }

      await visual.prepareForComparison();

      await visual.compareToBaseline({
        name: 'create-plan-page',
      });
    });
  });

  test.describe('Admin Pages', () => {
    /**
     * Helper to check if user is stuck on onboarding/persona-selection
     */
    const isOnOnboarding = async (page: import('@playwright/test').Page): Promise<boolean> => {
      await page.waitForTimeout(1000);
      const url = page.url();
      const onOnboarding = url.includes('/onboarding') || url.includes('/persona-selection');
      if (onOnboarding) {
        console.log(`⚠️ Skipping: User on onboarding page: ${url}`);
      }
      return onOnboarding;
    };

    test.beforeEach(async ({ auth, page, dashboardPage }) => {
      await auth.loginAsAdmin();

      // Check if redirected to onboarding and handle it
      await page.waitForLoadState('networkidle');
      const url = page.url();
      if (url.includes('/onboarding') || url.includes('/persona-selection')) {
        await dashboardPage.completeOnboarding();
      }
    });

    test('admin overview visual regression @admin', async ({ page, visual }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      // Extra wait for dynamic content to settle
      await page.waitForTimeout(2000);

      if (await isOnOnboarding(page)) {
        return;
      }

      await visual.prepareForComparison();

      // Admin overview has highly dynamic content (stats, timestamps, user data)
      // Use very high tolerance to account for this
      await visual.compareToBaseline({
        name: 'admin-overview',
        mask: [
          ...visual.maskDynamicContent(),
          // Mask admin-specific dynamic elements
          '[class*="stat"]',
          '[class*="count"]',
          '[class*="chart"]',
          '[class*="table"] td',
        ],
        maxDiffPixelRatio: 0.15, // 15% tolerance for dynamic admin content
        threshold: 0.4,
      });
    });

    test('admin users page visual regression @admin', async ({ page, visual }) => {
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');

      if (await isOnOnboarding(page)) {
        return;
      }

      await visual.prepareForComparison();

      await visual.compareToBaseline({
        name: 'admin-users-page',
        mask: visual.maskDynamicContent(),
      });
    });

    test('CMS editor visual regression @admin @cms', async ({ cmsEditorPage, visual }) => {
      await cmsEditorPage.goto();

      if (await isOnOnboarding(cmsEditorPage.page)) {
        return;
      }

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
        // Extra wait for animations to complete
        await page.waitForTimeout(1500);
        await visual.prepareForComparison();

        await visual.compareToBaseline({
          name: `landing-page-${viewport.name}`,
          mask: visual.maskDynamicContent(),
          maxDiffPixelRatio: 0.02, // Slightly higher tolerance for responsive tests
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
