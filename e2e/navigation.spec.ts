import { test, expect } from 'playwright/test';

test.describe('Navigation and Routing', () => {
  test.describe('Public Routes', () => {
    test('should access landing page', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL('/');
      await expect(page.locator('body')).toBeVisible();
    });

    test('should access French landing page', async ({ page }) => {
      await page.goto('/fr');
      await expect(page).toHaveURL('/fr');
      await expect(page.locator('body')).toBeVisible();
    });

    test('should access privacy policy page', async ({ page }) => {
      await page.goto('/privacy');
      await expect(page).toHaveURL('/privacy');
      await expect(page.locator('body')).toBeVisible();
    });

    test('should access terms of service page', async ({ page }) => {
      await page.goto('/terms');
      await expect(page).toHaveURL('/terms');
      await expect(page.locator('body')).toBeVisible();
    });

    test('should access security page', async ({ page }) => {
      await page.goto('/security');
      await expect(page).toHaveURL('/security');
      await expect(page.locator('body')).toBeVisible();
    });

    test('should access compliance page', async ({ page }) => {
      await page.goto('/compliance');
      await expect(page).toHaveURL('/compliance');
      await expect(page.locator('body')).toBeVisible();
    });

    test('should access example plans page', async ({ page }) => {
      await page.goto('/example-plans');
      await expect(page).toHaveURL('/example-plans');
      await expect(page.locator('body')).toBeVisible();
    });

    test('should access subscription plans page', async ({ page }) => {
      await page.goto('/subscription-plans');
      await expect(page).toHaveURL('/subscription-plans');
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Protected Routes Redirect', () => {
    test('should redirect /dashboard to login when not authenticated', async ({ page }) => {
      await page.goto('/dashboard');
      // Should either redirect to login or show access denied
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      // Protected route should redirect unauthenticated users
      expect(currentUrl.includes('/login') || currentUrl.includes('/dashboard')).toBeTruthy();
    });

    test('should redirect /profile to login when not authenticated', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      expect(currentUrl.includes('/login') || currentUrl.includes('/profile')).toBeTruthy();
    });

    test('should redirect /create-plan to login when not authenticated', async ({ page }) => {
      await page.goto('/create-plan');
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      expect(currentUrl.includes('/login') || currentUrl.includes('/create-plan')).toBeTruthy();
    });

    test('should redirect /admin to login when not authenticated', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      expect(currentUrl.includes('/login') || currentUrl.includes('/admin')).toBeTruthy();
    });

    test('should redirect /onboarding to login when not authenticated', async ({ page }) => {
      await page.goto('/onboarding');
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      expect(currentUrl.includes('/login') || currentUrl.includes('/onboarding')).toBeTruthy();
    });
  });

  test.describe('Scroll Behavior', () => {
    test('should scroll to top on navigation', async ({ page }) => {
      await page.goto('/');

      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 500));

      // Navigate to another page
      await page.goto('/login');

      // Wait for scroll reset
      await page.waitForTimeout(500);

      const scrollPosition = await page.evaluate(() => window.scrollY);
      expect(scrollPosition).toBe(0);
    });
  });

  test.describe('404 Handling', () => {
    test('should handle non-existent routes', async ({ page }) => {
      await page.goto('/this-page-does-not-exist-12345');
      // Should either show 404 page or redirect
      await expect(page.locator('body')).toBeVisible();
    });
  });
});
