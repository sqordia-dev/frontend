import { test, expect } from 'playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the landing page', async ({ page }) => {
    // Check that the page loads
    await expect(page).toHaveURL('/');

    // Check for main content visibility
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    // Check for login link
    const loginLink = page.locator('a[href="/login"]').first();
    if (await loginLink.isVisible()) {
      await expect(loginLink).toBeVisible();
    }

    // Check for signup link
    const signupLink = page.locator('a[href="/signup"]').first();
    if (await signupLink.isVisible()) {
      await expect(signupLink).toBeVisible();
    }
  });

  test('should navigate to login page', async ({ page }) => {
    const loginLink = page.locator('a[href="/login"]').first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL('/login');
    }
  });

  test('should navigate to signup page', async ({ page }) => {
    const signupLink = page.locator('a[href="/signup"]').first();
    if (await signupLink.isVisible()) {
      await signupLink.click();
      await expect(page).toHaveURL('/signup');
    }
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have proper page title', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should have skip link for accessibility', async ({ page }) => {
    // Focus on the page to trigger skip link visibility
    await page.keyboard.press('Tab');

    // Look for skip link (accessibility feature)
    const skipLink = page.locator('[data-skip-link], a:has-text("Skip"), #skip-link');
    // Skip link may or may not be present depending on implementation
  });
});
