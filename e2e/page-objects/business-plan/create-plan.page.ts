import { Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Create Plan page object
 * Handles business plan creation flow
 */
export class CreatePlanPage extends BasePage {
  readonly path = '/create-plan';
  readonly feature = 'business-plan';

  // ==================== LOCATORS ====================

  /**
   * Page title/heading
   */
  get pageTitle(): Locator {
    return this.page.locator('h1').first();
  }

  /**
   * Project name input field
   */
  get projectNameInput(): Locator {
    return this.page.locator('#projectName, input[id="projectName"], input[placeholder*="project"], input[placeholder*="Project"]').first();
  }

  /**
   * Submit/Create button
   */
  get createButton(): Locator {
    return this.page.locator('button[type="submit"]').first();
  }

  /**
   * Back to dashboard link
   */
  get backToDashboard(): Locator {
    return this.page.locator('a[href="/dashboard"]').first();
  }

  /**
   * Error message element
   */
  get errorMessage(): Locator {
    return this.page.locator('[role="alert"], .text-destructive').filter({ has: this.page.locator('svg, p') });
  }

  /**
   * Loading spinner in button
   */
  get buttonLoader(): Locator {
    return this.page.locator('button[type="submit"] .animate-spin, button[type="submit"] [class*="spinner"]');
  }

  /**
   * AI badge
   */
  get aiBadge(): Locator {
    return this.page.locator('.bg-momentum-orange, .bg-gradient-to-r').filter({ hasText: /AI|Powered/i }).first();
  }

  /**
   * Feature list items
   */
  get featureItems(): Locator {
    return this.page.locator('.flex.items-center.gap-2').filter({ has: this.page.locator('svg') });
  }

  // ==================== ACTIONS ====================

  /**
   * Fill in the project name
   */
  async fillProjectName(name: string): Promise<void> {
    await this.projectNameInput.fill(name);
  }

  /**
   * Clear the project name input
   */
  async clearProjectName(): Promise<void> {
    await this.projectNameInput.clear();
  }

  /**
   * Click the create button
   */
  async clickCreate(): Promise<void> {
    await this.createButton.click();
  }

  /**
   * Create a new plan with the given name
   */
  async createPlan(projectName: string): Promise<void> {
    await this.fillProjectName(projectName);
    await this.clickCreate();
  }

  /**
   * Create a plan and wait for navigation to questionnaire
   */
  async createPlanAndWaitForQuestionnaire(projectName: string): Promise<string> {
    await this.fillProjectName(projectName);

    // Wait for button to be enabled (org loaded)
    await this.page.waitForFunction(
      () => {
        const button = document.querySelector('button[type="submit"]');
        return button && !button.hasAttribute('disabled');
      },
      { timeout: 15000 }
    );

    await this.clickCreate();

    // Wait for navigation with longer timeout
    await this.page.waitForURL(/\/questionnaire\//, { timeout: 60000 });

    // Extract and return the plan ID
    const match = this.page.url().match(/\/questionnaire\/([^/]+)/);
    return match ? match[1] : '';
  }

  /**
   * Go back to dashboard
   */
  async goBackToDashboard(): Promise<void> {
    await this.backToDashboard.click();
    await this.page.waitForURL('/dashboard');
  }

  /**
   * Wait for the page to be ready (button enabled means org is loaded)
   */
  async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    // Wait for the create button to be visible
    await this.createButton.waitFor({ state: 'visible', timeout: 10000 });
    // Wait for organization to load (button becomes enabled when projectName is entered)
    // Check if any loading spinner is visible in the button
    const hasSpinner = await this.buttonLoader.isVisible().catch(() => false);
    if (hasSpinner) {
      await this.buttonLoader.waitFor({ state: 'hidden', timeout: 15000 });
    }
    // Wait for any loading states to complete
    await this.page.waitForTimeout(500);
  }

  /**
   * Check if create button is enabled
   */
  async isCreateButtonEnabled(): Promise<boolean> {
    return this.createButton.isEnabled();
  }

  /**
   * Check if there's an error displayed
   */
  async hasErrorMessage(): Promise<boolean> {
    return this.errorMessage.isVisible({ timeout: 2000 }).catch(() => false);
  }

  /**
   * Get error message text
   */
  async getErrorText(): Promise<string | null> {
    if (await this.hasErrorMessage()) {
      return this.errorMessage.locator('p').textContent();
    }
    return null;
  }

  // ==================== ASSERTIONS ====================

  /**
   * Assert page is loaded
   */
  async expectPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/create-plan/);
    await expect(this.pageTitle).toBeVisible();
    await expect(this.projectNameInput).toBeVisible();
    await expect(this.createButton).toBeVisible();
  }

  /**
   * Assert project name has specific value
   */
  async expectProjectName(name: string): Promise<void> {
    await expect(this.projectNameInput).toHaveValue(name);
  }

  /**
   * Assert create button is enabled
   */
  async expectCreateButtonEnabled(): Promise<void> {
    await expect(this.createButton).toBeEnabled();
  }

  /**
   * Assert create button is disabled
   */
  async expectCreateButtonDisabled(): Promise<void> {
    await expect(this.createButton).toBeDisabled();
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
   * Assert AI badge is visible
   */
  async expectAIBadgeVisible(): Promise<void> {
    await expect(this.aiBadge).toBeVisible();
  }
}
