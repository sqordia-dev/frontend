import { test, expect } from 'playwright/test';
import { loginAsAdmin, ADMIN_CREDENTIALS } from './auth-setup';

interface ConsoleError {
  type: string;
  text: string;
  url: string;
}

test.describe('Console Errors and Warnings Detection', () => {
  const consoleErrors: ConsoleError[] = [];
  const consoleWarnings: ConsoleError[] = [];

  test.beforeEach(async ({ page }) => {
    // Collect console errors and warnings
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();

      if (type === 'error') {
        consoleErrors.push({
          type: 'error',
          text: text,
          url: page.url(),
        });
      } else if (type === 'warning') {
        consoleWarnings.push({
          type: 'warning',
          text: text,
          url: page.url(),
        });
      }
    });

    // Collect page errors
    page.on('pageerror', (error) => {
      consoleErrors.push({
        type: 'page-error',
        text: error.message,
        url: page.url(),
      });
    });
  });

  test('check landing page for console errors', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'bugs_report/screenshots/landing-console-check.png', fullPage: true });

    // Filter out known/expected errors
    const criticalErrors = consoleErrors.filter(
      (e) => !e.text.includes('favicon') && !e.text.includes('404')
    );

    console.log('Landing page errors:', criticalErrors);
  });

  test('check login page for console errors', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'bugs_report/screenshots/login-console-check.png', fullPage: true });

    console.log('Login page errors:', consoleErrors);
  });

  test('check authenticated pages for console errors', async ({ page }) => {
    // Login first
    await loginAsAdmin(page);

    const pagesToCheck = [
      '/dashboard',
      '/profile',
      '/create-plan',
      '/admin',
      '/admin/users',
      '/subscription',
    ];

    for (const pagePath of pagesToCheck) {
      consoleErrors.length = 0; // Reset errors
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      if (consoleErrors.length > 0) {
        console.log(`Errors on ${pagePath}:`, consoleErrors);
      }
    }
  });
});

test.describe('Network Request Failures', () => {
  test('detect failed API requests on dashboard', async ({ page }) => {
    const failedRequests: string[] = [];

    page.on('response', (response) => {
      if (response.status() >= 400) {
        failedRequests.push(`${response.status()} - ${response.url()}`);
      }
    });

    await loginAsAdmin(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('Failed requests on dashboard:', failedRequests);
  });

  test('detect failed API requests on admin pages', async ({ page }) => {
    const failedRequests: string[] = [];

    page.on('response', (response) => {
      if (response.status() >= 400) {
        failedRequests.push(`${response.status()} - ${response.url()}`);
      }
    });

    await loginAsAdmin(page);

    const adminPages = [
      '/admin',
      '/admin/users',
      '/admin/organizations',
      '/admin/business-plans',
    ];

    for (const pagePath of adminPages) {
      failedRequests.length = 0;
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      if (failedRequests.length > 0) {
        console.log(`Failed requests on ${pagePath}:`, failedRequests);
      }
    }
  });
});
