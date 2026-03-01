import { Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Login page object
 * Handles all interactions with the login page
 */
export class LoginPage extends BasePage {
  readonly path = '/login';
  readonly feature = 'auth';

  // ==================== LOCATORS ====================

  get emailInput(): Locator {
    return this.page.locator('input[name="email"]');
  }

  get passwordInput(): Locator {
    return this.page.locator('input[name="password"]');
  }

  get submitButton(): Locator {
    return this.page.locator('button[type="submit"]');
  }

  get signupLink(): Locator {
    return this.page.locator('a[href="/signup"]');
  }

  get forgotPasswordLink(): Locator {
    return this.page.locator('a[href="/forgot-password"]');
  }

  get googleLoginButton(): Locator {
    return this.page.locator('button:has-text("Google")');
  }

  get microsoftLoginButton(): Locator {
    return this.page.locator('button:has-text("Microsoft")');
  }

  get errorMessage(): Locator {
    return this.page.locator('[role="alert"], .text-red-600, .error, .text-destructive').first();
  }

  get rememberMeCheckbox(): Locator {
    return this.page.locator('input[name="rememberMe"], input[type="checkbox"]').first();
  }

  get passwordToggle(): Locator {
    return this.page.locator('button[aria-label*="password"], [data-testid="password-toggle"]');
  }

  get formTitle(): Locator {
    return this.page.locator('h1, h2').first();
  }

  // ==================== ACTIONS ====================

  /**
   * Fill the email input
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  /**
   * Fill the password input
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * Clear the email input
   */
  async clearEmail(): Promise<void> {
    await this.emailInput.clear();
  }

  /**
   * Clear the password input
   */
  async clearPassword(): Promise<void> {
    await this.passwordInput.clear();
  }

  /**
   * Submit the login form
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Fill and submit login form
   */
  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  /**
   * Login and wait for redirect to dashboard/admin
   */
  async loginAndWaitForRedirect(email: string, password: string): Promise<void> {
    await this.login(email, password);
    await this.page.waitForURL(/\/(dashboard|onboarding|admin)/, { timeout: 15000 });
  }

  /**
   * Toggle password visibility
   */
  async togglePasswordVisibility(): Promise<void> {
    if (await this.passwordToggle.isVisible()) {
      await this.passwordToggle.click();
    }
  }

  /**
   * Check the remember me checkbox
   */
  async checkRememberMe(): Promise<void> {
    if (await this.rememberMeCheckbox.isVisible()) {
      await this.rememberMeCheckbox.check();
    }
  }

  /**
   * Click on signup link
   */
  async goToSignup(): Promise<void> {
    await this.signupLink.click();
    await this.page.waitForURL('/signup');
  }

  /**
   * Click on forgot password link
   */
  async goToForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
    await this.page.waitForURL('/forgot-password');
  }

  /**
   * Click Google login button
   */
  async clickGoogleLogin(): Promise<void> {
    await this.googleLoginButton.click();
  }

  /**
   * Click Microsoft login button
   */
  async clickMicrosoftLogin(): Promise<void> {
    await this.microsoftLoginButton.click();
  }

  // ==================== ASSERTIONS ====================

  /**
   * Assert form is visible and ready
   */
  async expectFormVisible(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  /**
   * Assert error message is visible
   */
  async expectErrorVisible(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }

  /**
   * Assert error message contains text
   */
  async expectErrorContains(text: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toContainText(text);
  }

  /**
   * Assert social login buttons are visible
   */
  async expectSocialLoginVisible(): Promise<void> {
    const hasGoogle = await this.googleLoginButton.isVisible().catch(() => false);
    const hasMicrosoft = await this.microsoftLoginButton.isVisible().catch(() => false);
    expect(hasGoogle || hasMicrosoft).toBeTruthy();
  }

  /**
   * Assert email input has validation error
   */
  async expectEmailInvalid(): Promise<void> {
    const ariaInvalid = await this.emailInput.getAttribute('aria-invalid');
    expect(ariaInvalid).toBe('true');
  }

  /**
   * Assert password input has validation error
   */
  async expectPasswordInvalid(): Promise<void> {
    const ariaInvalid = await this.passwordInput.getAttribute('aria-invalid');
    expect(ariaInvalid).toBe('true');
  }

  /**
   * Assert password is masked
   */
  async expectPasswordMasked(): Promise<void> {
    const inputType = await this.passwordInput.getAttribute('type');
    expect(inputType).toBe('password');
  }

  /**
   * Assert password is visible (not masked)
   */
  async expectPasswordVisible(): Promise<void> {
    const inputType = await this.passwordInput.getAttribute('type');
    expect(inputType).toBe('text');
  }

  /**
   * Assert submit button is enabled
   */
  async expectSubmitEnabled(): Promise<void> {
    await expect(this.submitButton).toBeEnabled();
  }

  /**
   * Assert submit button is disabled
   */
  async expectSubmitDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
  }
}
