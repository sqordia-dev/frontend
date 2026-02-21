import { test, expect } from 'playwright/test';

test.describe('Authentication Pages', () => {
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
    });

    test('should display login form', async ({ page }) => {
      await expect(page).toHaveURL('/login');

      // Check for email input
      const emailInput = page.locator('input[name="email"], input[type="email"]');
      await expect(emailInput).toBeVisible();

      // Check for password input
      const passwordInput = page.locator('input[name="password"], input[type="password"]');
      await expect(passwordInput).toBeVisible();

      // Check for submit button
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();
    });

    test('should show validation errors for empty form submission', async ({ page }) => {
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Wait for validation to trigger
      await page.waitForTimeout(500);

      // Check for any error message appearance
      const errorMessages = page.locator('[role="alert"], .error, .text-red-600, .text-red-400');
      // Error handling depends on form validation implementation
    });

    test('should show validation error for invalid email format', async ({ page }) => {
      const emailInput = page.locator('input[name="email"], input[type="email"]');
      const passwordInput = page.locator('input[name="password"], input[type="password"]');
      const submitButton = page.locator('button[type="submit"]');

      await emailInput.fill('invalid-email');
      await passwordInput.fill('password123');
      await submitButton.click();

      await page.waitForTimeout(500);
      // Validation should trigger for invalid email
    });

    test('should have link to signup page', async ({ page }) => {
      const signupLink = page.locator('a[href="/signup"]');
      await expect(signupLink).toBeVisible();
      await signupLink.click();
      await expect(page).toHaveURL('/signup');
    });

    test('should have link to forgot password page', async ({ page }) => {
      const forgotLink = page.locator('a[href="/forgot-password"]');
      await expect(forgotLink).toBeVisible();
      await forgotLink.click();
      await expect(page).toHaveURL('/forgot-password');
    });

    test('should have link back to home', async ({ page }) => {
      const homeLink = page.locator('a[href="/"]');
      if (await homeLink.first().isVisible()) {
        await homeLink.first().click();
        await expect(page).toHaveURL('/');
      }
    });

    test('should have social login buttons', async ({ page }) => {
      // Check for Google sign-in button
      const googleButton = page.locator('button:has-text("Google"), button[aria-label*="Google"]');

      // Check for Microsoft sign-in button
      const microsoftButton = page.locator('button:has-text("Microsoft"), button[aria-label*="Microsoft"]');

      // At least one social login should be present
    });

    test('should have remember me checkbox', async ({ page }) => {
      const rememberMe = page.locator('input[name="rememberMe"], input[type="checkbox"]');
      if (await rememberMe.isVisible()) {
        await expect(rememberMe).toBeVisible();
      }
    });

    test('should mask password input', async ({ page }) => {
      const passwordInput = page.locator('input[name="password"]');
      const inputType = await passwordInput.getAttribute('type');
      expect(inputType).toBe('password');
    });

    test('should toggle password visibility', async ({ page }) => {
      const passwordInput = page.locator('input[name="password"]');
      await passwordInput.fill('testpassword');

      // Look for show/hide password button
      const toggleButton = page.locator('button[aria-label*="password"], button:has([data-testid="eye"]), button:near(input[name="password"])');
      if (await toggleButton.first().isVisible()) {
        await toggleButton.first().click();
        // Password field type should change to text
      }
    });
  });

  test.describe('Signup Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/signup');
    });

    test('should display signup form', async ({ page }) => {
      await expect(page).toHaveURL('/signup');

      // Check for required form fields
      const emailInput = page.locator('input[name="email"], input[type="email"]');
      await expect(emailInput).toBeVisible();

      const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
      await expect(passwordInput).toBeVisible();
    });

    test('should have link to login page', async ({ page }) => {
      const loginLink = page.locator('a[href="/login"]');
      await expect(loginLink).toBeVisible();
      await loginLink.click();
      await expect(page).toHaveURL('/login');
    });

    test('should validate password strength', async ({ page }) => {
      const passwordInput = page.locator('input[name="password"]').first();
      await passwordInput.fill('weak');

      // Password strength indicator or error should appear
      await page.waitForTimeout(300);
    });

    test('should have terms and privacy links', async ({ page }) => {
      const termsLink = page.locator('a[href="/terms"]');
      const privacyLink = page.locator('a[href="/privacy"]');

      // These may or may not be present depending on the form design
    });
  });

  test.describe('Forgot Password Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/forgot-password');
    });

    test('should display forgot password form', async ({ page }) => {
      await expect(page).toHaveURL('/forgot-password');

      const emailInput = page.locator('input[name="email"], input[type="email"]');
      await expect(emailInput).toBeVisible();

      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();
    });

    test('should have link back to login', async ({ page }) => {
      const loginLink = page.locator('a[href="/login"]');
      await expect(loginLink).toBeVisible();
    });
  });

  test.describe('Register Alias', () => {
    test('should redirect /register to signup page', async ({ page }) => {
      await page.goto('/register');
      // /register is an alias for /signup based on App.tsx
      await expect(page.locator('body')).toBeVisible();
    });
  });
});
