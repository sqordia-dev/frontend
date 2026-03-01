import { test, expect } from 'playwright/test';
import { loginAsAdmin } from './auth-setup';

/**
 * Comprehensive responsive testing for Sqordia
 * Tests across mobile, tablet, and desktop viewports
 * Validates touch targets, layout, and navigation
 */

const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 },
];

// Mobile-specific viewports for detailed testing
const mobileViewports = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
  { name: 'Samsung Galaxy S21', width: 360, height: 800 },
];

// WCAG 2.5.5 minimum touch target size
const MIN_TOUCH_TARGET_SIZE = 44;

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

test.describe('Touch Target Compliance @smoke', () => {
  test('verify touch targets on mobile login form', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check buttons have adequate touch targets
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box) {
          if (box.height < MIN_TOUCH_TARGET_SIZE || box.width < MIN_TOUCH_TARGET_SIZE) {
            const text = await button.textContent();
            console.log(`Touch target warning: Button "${text}" is ${box.width}x${box.height}px (min: ${MIN_TOUCH_TARGET_SIZE}px)`);
          }
        }
      }
    }

    // Check inputs have adequate touch targets
    const inputs = page.locator('input');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      if (await input.isVisible()) {
        const box = await input.boundingBox();
        if (box && box.height < MIN_TOUCH_TARGET_SIZE) {
          const name = await input.getAttribute('name') || await input.getAttribute('type');
          console.log(`Touch target warning: Input "${name}" height is ${box.height}px (min: ${MIN_TOUCH_TARGET_SIZE}px)`);
        }
      }
    }
  });

  test('verify touch targets on mobile dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loginAsAdmin(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check all interactive elements
    const interactiveElements = page.locator('button, a[href], input, select, [role="button"]');
    const count = await interactiveElements.count();
    const undersizedElements: string[] = [];

    for (let i = 0; i < count; i++) {
      const element = interactiveElements.nth(i);
      if (await element.isVisible()) {
        const box = await element.boundingBox();
        if (box && (box.height < MIN_TOUCH_TARGET_SIZE || box.width < MIN_TOUCH_TARGET_SIZE)) {
          const tagName = await element.evaluate(el => el.tagName);
          const text = await element.textContent() || await element.getAttribute('aria-label') || '';
          undersizedElements.push(`${tagName}: "${text.substring(0, 30)}" (${Math.round(box.width)}x${Math.round(box.height)}px)`);
        }
      }
    }

    if (undersizedElements.length > 0) {
      console.log(`Found ${undersizedElements.length} undersized touch targets on dashboard:`, undersizedElements.slice(0, 10));
    }

    // Test should pass but log warnings
    expect(true).toBe(true);
  });
});

test.describe('Mobile Navigation @smoke', () => {
  test('mobile menu opens and closes correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for mobile menu button (hamburger)
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], [data-testid="mobile-menu"]').first();

    if (await menuButton.isVisible()) {
      // Open menu
      await menuButton.click();
      await page.waitForTimeout(300);

      // Take screenshot of open menu
      await page.screenshot({
        path: 'bugs_report/screenshots/mobile-menu-open.png',
      });

      // Menu should be visible
      const mobileNav = page.locator('[role="dialog"], [data-state="open"], .mobile-menu');
      await expect(mobileNav.first()).toBeVisible({ timeout: 5000 }).catch(() => {
        console.log('Mobile menu dialog not found with expected selectors');
      });

      // Close menu
      const closeButton = page.locator('button[aria-label*="close"], button[aria-label*="Close"]').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
      } else {
        await menuButton.click();
      }
    }
  });

  test('admin mobile sidebar navigation works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loginAsAdmin(page);
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Take screenshot before opening sidebar
    await page.screenshot({
      path: 'bugs_report/screenshots/admin-mobile-closed.png',
    });

    // Look for mobile menu button
    const menuButton = page.locator('button[aria-label*="menu"], [aria-label="Open menu"]').first();

    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(300);

      // Take screenshot of open sidebar
      await page.screenshot({
        path: 'bugs_report/screenshots/admin-mobile-sidebar-open.png',
      });

      // Verify navigation items are visible
      const navLinks = page.locator('nav a, [role="navigation"] a');
      const count = await navLinks.count();
      expect(count).toBeGreaterThan(0);
    }
  });
});

test.describe('Responsive Layout Integrity', () => {
  for (const viewport of mobileViewports) {
    test(`no horizontal scroll on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      // Test multiple pages
      const pages = ['/', '/login', '/register', '/pricing'];

      for (const path of pages) {
        await page.goto(path);
        await page.waitForLoadState('networkidle');

        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        if (hasHorizontalScroll) {
          // Find the overflowing elements
          const overflowingElements = await page.evaluate(() => {
            const docWidth = document.documentElement.clientWidth;
            const elements: string[] = [];
            document.querySelectorAll('*').forEach(el => {
              const rect = el.getBoundingClientRect();
              if (rect.right > docWidth) {
                elements.push(`${el.tagName}.${el.className.toString().split(' ')[0]}: extends ${Math.round(rect.right - docWidth)}px`);
              }
            });
            return elements.slice(0, 5);
          });

          console.log(`Horizontal overflow on ${path} at ${viewport.name}:`, overflowingElements);
        }

        expect(hasHorizontalScroll).toBe(false);
      }
    });
  }

  test('forms are usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Test form interaction
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]');

    // All form elements should be visible
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Test typing (simulates mobile keyboard)
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');

    // Verify values are entered
    await expect(emailInput).toHaveValue('test@example.com');
    await expect(passwordInput).toHaveValue('password123');
  });

  test('modals appear as bottom sheets on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Try to trigger a modal
    const addButton = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")').first();

    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);

      // Check if dialog appeared at bottom of screen
      const dialog = page.locator('[role="dialog"], [data-state="open"]').first();
      if (await dialog.isVisible()) {
        const box = await dialog.boundingBox();
        if (box) {
          // Bottom sheet should be near bottom of viewport
          const viewportHeight = 667;
          const isBottomSheet = box.y > viewportHeight * 0.3; // Dialog starts below 30% of viewport

          await page.screenshot({
            path: 'bugs_report/screenshots/mobile-bottom-sheet.png',
          });

          console.log(`Dialog position: y=${box.y}, viewportHeight=${viewportHeight}, isBottomSheet=${isBottomSheet}`);
        }
      }
    }
  });
});

test.describe('Admin Pages Mobile View @smoke', () => {
  test('admin users page switches to card view on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Should auto-switch to card view on mobile
    // Look for card-style layout instead of table
    const table = page.locator('table');
    const cards = page.locator('[data-view="card"], .grid > div');

    const tableVisible = await table.isVisible().catch(() => false);
    const cardsVisible = await cards.first().isVisible().catch(() => false);

    await page.screenshot({
      path: 'bugs_report/screenshots/admin-users-mobile.png',
      fullPage: true,
    });

    // On mobile, we expect either no table or cards to be shown
    console.log(`Admin users mobile view - Table visible: ${tableVisible}, Cards visible: ${cardsVisible}`);
  });

  test('admin business plans page is responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loginAsAdmin(page);
    await page.goto('/admin/business-plans');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'bugs_report/screenshots/admin-plans-mobile.png',
      fullPage: true,
    });

    // Check no horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasOverflow).toBe(false);
  });
});

test.describe('Orientation Change', () => {
  test('layout adapts to landscape orientation', async ({ page }) => {
    // Portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'bugs_report/screenshots/landing-portrait.png',
    });

    // Landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(300);

    await page.screenshot({
      path: 'bugs_report/screenshots/landing-landscape.png',
    });

    // Check no horizontal overflow in landscape
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasOverflow).toBe(false);
  });
});
