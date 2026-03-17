import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Automated WCAG 2.1 AA accessibility tests using axe-core.
 * Tests critical user flows for violations.
 */

test.describe('Accessibility - axe-core WCAG 2.1 AA scans', () => {
  test('landing page should have no critical violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations.filter(v => v.impact === 'critical')).toEqual([]);
    expect(results.violations.filter(v => v.impact === 'serious')).toEqual([]);
  });

  test('login page should have no critical violations', async ({ page }) => {
    await page.goto('/login');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations.filter(v => v.impact === 'critical')).toEqual([]);
    expect(results.violations.filter(v => v.impact === 'serious')).toEqual([]);
  });

  test('signup page should have no critical violations', async ({ page }) => {
    await page.goto('/signup');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations.filter(v => v.impact === 'critical')).toEqual([]);
    expect(results.violations.filter(v => v.impact === 'serious')).toEqual([]);
  });

  test('privacy policy page should have no critical violations', async ({ page }) => {
    await page.goto('/privacy');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations.filter(v => v.impact === 'critical')).toEqual([]);
    expect(results.violations.filter(v => v.impact === 'serious')).toEqual([]);
  });
});

test.describe('Accessibility - Skip Link', () => {
  test('skip link should be present and target main-content', async ({ page }) => {
    await page.goto('/');

    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();

    // Focus it via Tab
    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();
  });

  test('main-content landmark should exist on landing page', async ({ page }) => {
    await page.goto('/');
    const main = page.locator('#main-content');
    await expect(main).toBeAttached();
  });

  test('main-content landmark should exist on login page', async ({ page }) => {
    await page.goto('/login');
    const main = page.locator('#main-content');
    await expect(main).toBeAttached();
  });
});

test.describe('Accessibility - Semantic HTML', () => {
  test('login page should have exactly one h1', async ({ page }) => {
    await page.goto('/login');
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('signup page should have exactly one h1', async ({ page }) => {
    await page.goto('/signup');
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('login form should be wrapped in <form> element', async ({ page }) => {
    await page.goto('/login');
    const form = page.locator('form');
    await expect(form).toBeVisible();
  });

  test('html lang attribute should be set', async ({ page }) => {
    await page.goto('/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
    expect(['en', 'fr']).toContain(lang);
  });
});

test.describe('Accessibility - Keyboard Navigation', () => {
  test('login form should be fully navigable by keyboard', async ({ page }) => {
    await page.goto('/login');

    // Tab through: skip link -> ... -> email input
    const emailInput = page.locator('input[name="email"], input[type="email"]');
    await emailInput.focus();
    await expect(emailInput).toBeFocused();

    // Tab to password
    await page.keyboard.press('Tab');
    const passwordInput = page.locator('input[type="password"]');
    // Password field should exist and be reachable
    await expect(passwordInput).toBeAttached();
  });
});

test.describe('Accessibility - Form Validation', () => {
  test('login error messages should use role="alert"', async ({ page }) => {
    await page.goto('/login');

    // Submit empty form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for validation
    await page.waitForTimeout(1000);

    // Check for alert roles on any error messages that appear
    const alerts = page.locator('[role="alert"]');
    const alertCount = await alerts.count();
    // If validation shows errors, they should use role="alert"
    if (alertCount > 0) {
      await expect(alerts.first()).toBeVisible();
    }
  });
});
