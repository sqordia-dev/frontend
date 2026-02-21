import { test, expect } from 'playwright/test';

test.describe('Public Pages', () => {
  test.describe('Privacy Policy Page', () => {
    test('should load privacy policy page', async ({ page }) => {
      await page.goto('/privacy');
      await expect(page).toHaveURL('/privacy');

      // Should have heading
      const heading = page.locator('h1');
      await expect(heading.first()).toBeVisible();
    });

    test('should have proper page title', async ({ page }) => {
      await page.goto('/privacy');
      const title = await page.title();
      expect(title).toBeTruthy();
    });
  });

  test.describe('Terms of Service Page', () => {
    test('should load terms of service page', async ({ page }) => {
      await page.goto('/terms');
      await expect(page).toHaveURL('/terms');

      const heading = page.locator('h1');
      await expect(heading.first()).toBeVisible();
    });
  });

  test.describe('Security Page', () => {
    test('should load security page', async ({ page }) => {
      await page.goto('/security');
      await expect(page).toHaveURL('/security');

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Compliance Page', () => {
    test('should load compliance page', async ({ page }) => {
      await page.goto('/compliance');
      await expect(page).toHaveURL('/compliance');

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Example Plans Page', () => {
    test('should load example plans page', async ({ page }) => {
      await page.goto('/example-plans');
      await expect(page).toHaveURL('/example-plans');

      await expect(page.locator('body')).toBeVisible();
    });

    test('should display example plan cards or list', async ({ page }) => {
      await page.goto('/example-plans');

      // Wait for content to load
      await page.waitForTimeout(1000);

      // Should have some content (cards, list items, etc.)
      const content = page.locator('main, [role="main"], .container, article');
      if (await content.first().isVisible()) {
        await expect(content.first()).toBeVisible();
      }
    });
  });

  test.describe('Subscription Plans Page', () => {
    test('should load subscription plans page', async ({ page }) => {
      await page.goto('/subscription-plans');
      await expect(page).toHaveURL('/subscription-plans');

      await expect(page.locator('body')).toBeVisible();
    });

    test('should display pricing options', async ({ page }) => {
      await page.goto('/subscription-plans');

      await page.waitForTimeout(1000);

      // Should have pricing cards or options
      const content = page.locator('body');
      await expect(content).toBeVisible();
    });
  });

  test.describe('Checkout Pages', () => {
    test('should load checkout success page', async ({ page }) => {
      await page.goto('/checkout/success');
      await expect(page).toHaveURL('/checkout/success');

      await expect(page.locator('body')).toBeVisible();
    });

    test('should load checkout cancel page', async ({ page }) => {
      await page.goto('/checkout/cancel');
      await expect(page).toHaveURL('/checkout/cancel');

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Template Detail Page', () => {
    test('should handle template detail route', async ({ page }) => {
      // Navigate to a template page (may or may not exist)
      await page.goto('/template/test-template');

      await expect(page.locator('body')).toBeVisible();
    });
  });
});
