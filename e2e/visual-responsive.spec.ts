import { test, expect } from 'playwright/test';
import { loginAsAdmin } from './auth-setup';

const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 },
];

test.describe('Visual and Responsive Testing', () => {
  test.describe('Landing Page Responsive', () => {
    for (const viewport of viewports) {
      test(`landing page on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await page.screenshot({
          path: `bugs_report/screenshots/landing-${viewport.name}.png`,
          fullPage: true,
        });

        // Check for horizontal scroll (indicates responsive issues)
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        if (hasHorizontalScroll) {
          console.log(`WARNING: Horizontal scroll detected on landing page at ${viewport.name} viewport`);
        }

        await expect(page.locator('body')).toBeVisible();
      });
    }
  });

  test.describe('Login Page Responsive', () => {
    for (const viewport of viewports) {
      test(`login page on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        await page.screenshot({
          path: `bugs_report/screenshots/login-${viewport.name}.png`,
          fullPage: true,
        });

        // Check form is visible and usable
        const emailInput = page.locator('input[name="email"]');
        const passwordInput = page.locator('input[name="password"]');
        const submitButton = page.locator('button[type="submit"]');

        await expect(emailInput).toBeVisible();
        await expect(passwordInput).toBeVisible();
        await expect(submitButton).toBeVisible();
      });
    }
  });

  test.describe('Dashboard Responsive (Authenticated)', () => {
    for (const viewport of viewports) {
      test(`dashboard on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await loginAsAdmin(page);
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        await page.screenshot({
          path: `bugs_report/screenshots/dashboard-${viewport.name}.png`,
          fullPage: true,
        });

        await expect(page.locator('body')).toBeVisible();
      });
    }
  });

  test.describe('Admin Panel Responsive', () => {
    for (const viewport of viewports) {
      test(`admin panel on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await loginAsAdmin(page);
        await page.goto('/admin');
        await page.waitForLoadState('networkidle');

        await page.screenshot({
          path: `bugs_report/screenshots/admin-${viewport.name}.png`,
          fullPage: true,
        });

        await expect(page.locator('body')).toBeVisible();
      });
    }
  });
});

test.describe('Visual Element Checks', () => {
  test('check for broken images on landing page', async ({ page }) => {
    const brokenImages: string[] = [];

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      const src = await img.getAttribute('src');

      if (naturalWidth === 0 && src) {
        brokenImages.push(src);
      }
    }

    if (brokenImages.length > 0) {
      console.log('Broken images found:', brokenImages);
    }
  });

  test('check for broken images on dashboard', async ({ page }) => {
    const brokenImages: string[] = [];

    await loginAsAdmin(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      const src = await img.getAttribute('src');

      if (naturalWidth === 0 && src) {
        brokenImages.push(src);
      }
    }

    if (brokenImages.length > 0) {
      console.log('Broken images found on dashboard:', brokenImages);
    }
  });

  test('check for text overflow issues', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for elements with overflow
    const overflowingElements = await page.evaluate(() => {
      const elements: string[] = [];
      document.querySelectorAll('*').forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.scrollWidth > htmlEl.clientWidth && htmlEl.clientWidth > 0) {
          const text = htmlEl.textContent?.substring(0, 50) || '';
          if (text.trim()) {
            elements.push(`${htmlEl.tagName}.${htmlEl.className}: "${text}..."`);
          }
        }
      });
      return elements.slice(0, 10); // Limit to first 10
    });

    if (overflowingElements.length > 0) {
      console.log('Potential text overflow issues:', overflowingElements);
    }
  });
});

test.describe('Dark Mode Testing', () => {
  test('test dark mode on landing page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Try to toggle dark mode if button exists
    const darkModeToggle = page.locator('button[aria-label*="dark"], button[aria-label*="theme"], [data-testid="theme-toggle"]');
    if (await darkModeToggle.first().isVisible()) {
      await darkModeToggle.first().click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({
      path: 'bugs_report/screenshots/landing-dark-mode.png',
      fullPage: true,
    });
  });

  test('test dark mode on login page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Emulate dark mode preference
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'bugs_report/screenshots/login-dark-mode.png',
      fullPage: true,
    });
  });
});
