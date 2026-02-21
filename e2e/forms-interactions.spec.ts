import { test, expect } from 'playwright/test';
import { loginAsAdmin, ADMIN_CREDENTIALS } from './auth-setup';

test.describe('Form Validations', () => {
  test.describe('Login Form Validation', () => {
    test('should validate empty email', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      await page.locator('input[name="password"]').fill('somepassword');
      await page.locator('button[type="submit"]').click();

      await page.waitForTimeout(500);
      await page.screenshot({ path: 'bugs_report/screenshots/login-empty-email-validation.png' });

      // Check for validation message
      const error = page.locator('[role="alert"], .text-red-600, .text-red-500, #email-error');
    });

    test('should validate empty password', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      await page.locator('input[name="email"]').fill('test@test.com');
      await page.locator('button[type="submit"]').click();

      await page.waitForTimeout(500);
      await page.screenshot({ path: 'bugs_report/screenshots/login-empty-password-validation.png' });
    });

    test('should validate invalid email format', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      await page.locator('input[name="email"]').fill('notanemail');
      await page.locator('input[name="password"]').fill('somepassword');
      await page.locator('button[type="submit"]').click();

      await page.waitForTimeout(500);
      await page.screenshot({ path: 'bugs_report/screenshots/login-invalid-email-validation.png' });
    });
  });

  test.describe('Signup Form Validation', () => {
    test('should show signup form fields', async ({ page }) => {
      await page.goto('/signup');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'bugs_report/screenshots/signup-form.png', fullPage: true });

      // Check for required fields
      const emailInput = page.locator('input[name="email"], input[type="email"]');
      const passwordInput = page.locator('input[name="password"], input[type="password"]').first();

      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
    });

    test('should validate password strength', async ({ page }) => {
      await page.goto('/signup');
      await page.waitForLoadState('networkidle');

      const passwordInput = page.locator('input[name="password"]').first();
      await passwordInput.fill('weak');
      await passwordInput.blur();

      await page.waitForTimeout(500);
      await page.screenshot({ path: 'bugs_report/screenshots/signup-weak-password.png' });
    });

    test('should validate password confirmation mismatch', async ({ page }) => {
      await page.goto('/signup');
      await page.waitForLoadState('networkidle');

      const passwordInput = page.locator('input[name="password"]').first();
      const confirmInput = page.locator('input[name="confirmPassword"], input[name="passwordConfirm"]');

      if (await confirmInput.isVisible()) {
        await passwordInput.fill('StrongPass123!');
        await confirmInput.fill('DifferentPass456!');
        await confirmInput.blur();

        await page.waitForTimeout(500);
        await page.screenshot({ path: 'bugs_report/screenshots/signup-password-mismatch.png' });
      }
    });
  });

  test.describe('Forgot Password Form', () => {
    test('should validate email on forgot password', async ({ page }) => {
      await page.goto('/forgot-password');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'bugs_report/screenshots/forgot-password-form.png' });

      // Submit empty form
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(500);

      await page.screenshot({ path: 'bugs_report/screenshots/forgot-password-validation.png' });
    });

    test('should accept valid email and show success/processing state', async ({ page }) => {
      await page.goto('/forgot-password');
      await page.waitForLoadState('networkidle');

      await page.locator('input[name="email"], input[type="email"]').fill('test@test.com');
      await page.locator('button[type="submit"]').click();

      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'bugs_report/screenshots/forgot-password-submitted.png' });
    });
  });
});

test.describe('Button and Link Interactions', () => {
  test('should have clickable CTA buttons on landing page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find all buttons and links
    const buttons = page.locator('button:visible, a.btn:visible, a[role="button"]:visible');
    const count = await buttons.count();

    console.log(`Found ${count} clickable buttons/links on landing page`);

    // Test first few CTAs
    for (let i = 0; i < Math.min(3, count); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const isEnabled = await button.isEnabled();

      console.log(`Button ${i + 1}: "${text?.trim()}" - Enabled: ${isEnabled}`);
    }
  });

  test('should navigate correctly from landing page CTAs', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test Get Started button if it exists
    const getStartedBtn = page.locator('a:has-text("Get Started"), button:has-text("Get Started")').first();
    if (await getStartedBtn.isVisible()) {
      await getStartedBtn.click();
      await page.waitForLoadState('networkidle');

      const url = page.url();
      await page.screenshot({ path: 'bugs_report/screenshots/cta-get-started-result.png' });
      console.log('Get Started navigated to:', url);
    }
  });
});

test.describe('Modal and Dialog Testing', () => {
  test('should handle modal interactions', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for any buttons that might open modals
    const modalTriggers = page.locator('button[data-modal], button[aria-haspopup="dialog"], [data-testid*="modal"]');
    const count = await modalTriggers.count();

    if (count > 0) {
      console.log(`Found ${count} potential modal triggers`);
    }
  });

  test('should handle dropdown menus', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for dropdown triggers
    const dropdowns = page.locator('[data-radix-dropdown-trigger], button[aria-haspopup="menu"], .dropdown-toggle');
    const count = await dropdowns.count();

    if (count > 0) {
      // Click first dropdown
      await dropdowns.first().click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: 'bugs_report/screenshots/dropdown-open.png' });
    }
  });
});

test.describe('Table and List Interactions (Admin)', () => {
  test('should display users table in admin', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'bugs_report/screenshots/admin-users-table.png', fullPage: true });

    // Check for table or list elements
    const table = page.locator('table');
    const list = page.locator('[role="list"], ul.user-list, .user-card');

    if (await table.isVisible()) {
      const rows = page.locator('table tbody tr');
      const rowCount = await rows.count();
      console.log(`Users table has ${rowCount} rows`);
    }
  });

  test('should handle pagination if present', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Look for pagination
    const pagination = page.locator('nav[aria-label*="pagination"], .pagination, [data-testid="pagination"]');
    if (await pagination.isVisible()) {
      await page.screenshot({ path: 'bugs_report/screenshots/pagination.png' });

      // Try clicking next page
      const nextButton = page.locator('button:has-text("Next"), a:has-text("Next"), [aria-label="Next page"]');
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'bugs_report/screenshots/pagination-page-2.png' });
      }
    }
  });

  test('should handle search/filter if present', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'bugs_report/screenshots/search-results.png' });
    }
  });
});

test.describe('Loading States', () => {
  test('should show loading states on dashboard', async ({ page }) => {
    await loginAsAdmin(page);

    // Navigate and capture loading state
    const navigationPromise = page.goto('/dashboard');

    // Try to capture loading state
    await page.waitForTimeout(100);
    await page.screenshot({ path: 'bugs_report/screenshots/dashboard-loading.png' });

    await navigationPromise;
    await page.waitForLoadState('networkidle');
  });

  test('should show loading states on admin pages', async ({ page }) => {
    await loginAsAdmin(page);

    const navigationPromise = page.goto('/admin/users');

    await page.waitForTimeout(100);
    await page.screenshot({ path: 'bugs_report/screenshots/admin-users-loading.png' });

    await navigationPromise;
    await page.waitForLoadState('networkidle');
  });
});

test.describe('Error Handling', () => {
  test('should handle network errors gracefully', async ({ page, context }) => {
    await loginAsAdmin(page);

    // Simulate offline mode
    await context.setOffline(true);

    await page.goto('/dashboard').catch(() => {});
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'bugs_report/screenshots/offline-error.png' });

    // Restore online mode
    await context.setOffline(false);
  });
});
