import { Page } from 'playwright/test';

export const ADMIN_CREDENTIALS = {
  email: 'admin@sqordia.app',
  password: 'Sqordia2025!',
};

export async function loginAsAdmin(page: Page): Promise<boolean> {
  try {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill login form
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await emailInput.fill(ADMIN_CREDENTIALS.email);
    await passwordInput.fill(ADMIN_CREDENTIALS.password);
    await submitButton.click();

    // Wait for navigation after login
    await page.waitForURL(/\/(dashboard|onboarding|admin)/, { timeout: 15000 });

    return true;
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
}

export async function logout(page: Page): Promise<void> {
  // Look for logout button or profile dropdown
  const profileButton = page.locator('[data-testid="profile-menu"], button:has-text("Logout"), a:has-text("Logout")');
  if (await profileButton.first().isVisible()) {
    await profileButton.first().click();
  }
}

export async function isLoggedIn(page: Page): Promise<boolean> {
  // Check for authenticated indicators
  const dashboardLink = page.locator('a[href="/dashboard"]');
  const profileLink = page.locator('a[href="/profile"]');

  return (await dashboardLink.isVisible()) || (await profileLink.isVisible());
}
