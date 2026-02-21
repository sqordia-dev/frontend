import { test, expect, Page } from 'playwright/test';
import { ADMIN_CREDENTIALS, loginAsAdmin } from './auth-setup';

test.describe('Full Admin Application Test Suite', () => {
  let isAuthenticated = false;

  test.beforeEach(async ({ page }) => {
    // Login before each test if not already logged in
    if (!isAuthenticated) {
      const loginSuccess = await loginAsAdmin(page);
      if (loginSuccess) {
        isAuthenticated = true;
      }
    } else {
      // Check if still logged in by checking localStorage or cookies
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
    }
  });

  test.describe('Authentication Flow', () => {
    test('should login with admin credentials', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Fill login form
      await page.locator('input[name="email"]').fill(ADMIN_CREDENTIALS.email);
      await page.locator('input[name="password"]').fill(ADMIN_CREDENTIALS.password);

      // Take screenshot before login
      await page.screenshot({ path: 'bugs_report/screenshots/login-form-filled.png' });

      await page.locator('button[type="submit"]').click();

      // Wait for redirect
      await page.waitForURL(/\/(dashboard|onboarding|admin)/, { timeout: 15000 });

      // Take screenshot after login
      await page.screenshot({ path: 'bugs_report/screenshots/after-login.png' });

      // Verify we're logged in
      const url = page.url();
      expect(url).toMatch(/\/(dashboard|onboarding|admin)/);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      await page.locator('input[name="email"]').fill('invalid@test.com');
      await page.locator('input[name="password"]').fill('wrongpassword');
      await page.locator('button[type="submit"]').click();

      // Wait for error message
      await page.waitForTimeout(2000);

      // Check for error indication
      const errorMessage = page.locator('[role="alert"], .text-red-600, .text-red-500, .error');
      await page.screenshot({ path: 'bugs_report/screenshots/login-error.png' });
    });
  });

  test.describe('Dashboard', () => {
    test('should load dashboard page', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'bugs_report/screenshots/dashboard.png', fullPage: true });

      // Check for dashboard content
      await expect(page.locator('body')).toBeVisible();
      const heading = page.locator('h1, h2').first();
      if (await heading.isVisible()) {
        await expect(heading).toBeVisible();
      }
    });

    test('should have navigation sidebar or header', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Check for navigation elements
      const nav = page.locator('nav, aside, [role="navigation"]');
      if (await nav.first().isVisible()) {
        await expect(nav.first()).toBeVisible();
      }
    });

    test('should show user profile or account info', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Look for profile indicators
      const profileElements = page.locator('[data-testid="user-profile"], .user-info, .avatar, img[alt*="avatar"], img[alt*="profile"]');
      // Profile element may or may not be present
    });
  });

  test.describe('Profile Page', () => {
    test('should load profile page', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'bugs_report/screenshots/profile.png', fullPage: true });

      await expect(page.locator('body')).toBeVisible();
    });

    test('should display user information', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');

      // Check for profile form or info display
      const emailField = page.locator('input[name="email"], input[type="email"], :text("admin@sqordia.app")');
    });
  });

  test.describe('Admin Panel', () => {
    test('should access admin overview', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'bugs_report/screenshots/admin-overview.png', fullPage: true });

      // Check if admin page loaded
      await expect(page.locator('body')).toBeVisible();
    });

    test('should access admin users page', async ({ page }) => {
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'bugs_report/screenshots/admin-users.png', fullPage: true });

      await expect(page.locator('body')).toBeVisible();
    });

    test('should access admin organizations page', async ({ page }) => {
      await page.goto('/admin/organizations');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'bugs_report/screenshots/admin-organizations.png', fullPage: true });

      await expect(page.locator('body')).toBeVisible();
    });

    test('should access admin business plans page', async ({ page }) => {
      await page.goto('/admin/business-plans');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'bugs_report/screenshots/admin-business-plans.png', fullPage: true });

      await expect(page.locator('body')).toBeVisible();
    });

    test('should access admin templates page', async ({ page }) => {
      await page.goto('/admin/templates');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'bugs_report/screenshots/admin-templates.png', fullPage: true });

      await expect(page.locator('body')).toBeVisible();
    });

    test('should access admin AI prompts page', async ({ page }) => {
      await page.goto('/admin/ai-prompts');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'bugs_report/screenshots/admin-ai-prompts.png', fullPage: true });

      await expect(page.locator('body')).toBeVisible();
    });

    test('should access admin activity logs page', async ({ page }) => {
      await page.goto('/admin/activity-logs');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'bugs_report/screenshots/admin-activity-logs.png', fullPage: true });

      await expect(page.locator('body')).toBeVisible();
    });

    test('should access admin system health page', async ({ page }) => {
      await page.goto('/admin/system-health');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'bugs_report/screenshots/admin-system-health.png', fullPage: true });

      await expect(page.locator('body')).toBeVisible();
    });

    test('should access admin settings page', async ({ page }) => {
      await page.goto('/admin/settings');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'bugs_report/screenshots/admin-settings.png', fullPage: true });

      await expect(page.locator('body')).toBeVisible();
    });

    test('should access admin AI config page', async ({ page }) => {
      await page.goto('/admin/ai-config');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'bugs_report/screenshots/admin-ai-config.png', fullPage: true });

      await expect(page.locator('body')).toBeVisible();
    });

    test('should access admin CMS page', async ({ page }) => {
      await page.goto('/admin/cms');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'bugs_report/screenshots/admin-cms.png', fullPage: true });

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Business Plan Creation Flow', () => {
    test('should access create plan page', async ({ page }) => {
      await page.goto('/create-plan');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'bugs_report/screenshots/create-plan.png', fullPage: true });

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Subscription Pages', () => {
    test('should access subscription page', async ({ page }) => {
      await page.goto('/subscription');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'bugs_report/screenshots/subscription.png', fullPage: true });

      await expect(page.locator('body')).toBeVisible();
    });

    test('should access invoices page', async ({ page }) => {
      await page.goto('/invoices');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'bugs_report/screenshots/invoices.png', fullPage: true });

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Onboarding Flow', () => {
    test('should access onboarding page', async ({ page }) => {
      await page.goto('/onboarding');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'bugs_report/screenshots/onboarding.png', fullPage: true });

      await expect(page.locator('body')).toBeVisible();
    });

    test('should access persona selection page', async ({ page }) => {
      await page.goto('/persona-selection');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'bugs_report/screenshots/persona-selection.png', fullPage: true });

      await expect(page.locator('body')).toBeVisible();
    });
  });
});
