import { Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Generation page object
 * Handles the AI generation process for business plans
 */
export class GenerationPage extends BasePage {
  readonly path = '/generation';
  readonly feature = 'generation';

  // ==================== LOCATORS ====================

  /**
   * Main generation container
   */
  get generationContainer(): Locator {
    return this.page.locator('[class*="generation"], main').first();
  }

  /**
   * Generation status title
   */
  get statusTitle(): Locator {
    return this.page.locator('h1, h2').filter({ hasText: /Generating|Creating|Building|En cours|Création/i }).first();
  }

  /**
   * Progress indicator (percentage or steps)
   */
  get progressIndicator(): Locator {
    return this.page.locator('[class*="progress"], [role="progressbar"]').first();
  }

  /**
   * Progress percentage text
   */
  get progressPercentage(): Locator {
    return this.page.locator('[class*="progress"]').filter({ hasText: /\d+%/ }).first();
  }

  /**
   * Current step/section being generated
   */
  get currentStepLabel(): Locator {
    return this.page.locator('[class*="step"], [class*="status"]').filter({ hasText: /Generating|Writing|Creating/i }).first();
  }

  /**
   * Section items showing generation progress
   */
  get sectionItems(): Locator {
    return this.page.locator('[class*="section-item"], [class*="step-item"], li').filter({ has: this.page.locator('svg, span') });
  }

  /**
   * Completed sections (with checkmark)
   */
  get completedSections(): Locator {
    return this.page.locator('[class*="completed"], [class*="done"]').filter({ has: this.page.locator('svg[class*="check"]') });
  }

  /**
   * In-progress section (with spinner)
   */
  get inProgressSection(): Locator {
    return this.page.locator('[class*="in-progress"], [class*="active"]').filter({ has: this.page.locator('.animate-spin, svg[class*="loader"]') }).first();
  }

  /**
   * Pending sections
   */
  get pendingSections(): Locator {
    return this.page.locator('[class*="pending"], [class*="waiting"]');
  }

  /**
   * Cancel button
   */
  get cancelButton(): Locator {
    return this.page.locator('button').filter({ hasText: /Cancel|Annuler/i }).first();
  }

  /**
   * View plan button (appears when complete)
   */
  get viewPlanButton(): Locator {
    return this.page.locator('button, a').filter({ hasText: /View|Preview|Voir|Aperçu/i }).first();
  }

  /**
   * Completion message
   */
  get completionMessage(): Locator {
    return this.page.locator('h1, h2, p').filter({ hasText: /Complete|Ready|Done|Terminé|Prêt/i }).first();
  }

  /**
   * Error message
   */
  get errorMessage(): Locator {
    return this.page.locator('[role="alert"], [class*="error"]').filter({ hasText: /Error|Failed|Erreur|Échec/i }).first();
  }

  /**
   * Retry button
   */
  get retryButton(): Locator {
    return this.page.locator('button').filter({ hasText: /Retry|Try again|Réessayer/i }).first();
  }

  /**
   * AI animation/visual
   */
  get aiAnimation(): Locator {
    return this.page.locator('[class*="ai-animation"], [class*="sparkle"], .animate-pulse').first();
  }

  /**
   * Estimated time remaining
   */
  get timeRemaining(): Locator {
    return this.page.locator('[class*="time"], [class*="eta"]').filter({ hasText: /minute|second|min|sec/i }).first();
  }

  // ==================== ACTIONS ====================

  /**
   * Navigate to generation page for a plan
   */
  async gotoForPlan(planId: string): Promise<void> {
    await this.page.goto(`/generation/${planId}`);
    await this.waitForGenerationStart();
  }

  /**
   * Wait for generation to start
   */
  async waitForGenerationStart(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    // Wait for progress indicator or status to appear
    await Promise.race([
      this.progressIndicator.waitFor({ state: 'visible', timeout: 10000 }),
      this.statusTitle.waitFor({ state: 'visible', timeout: 10000 }),
      this.sectionItems.first().waitFor({ state: 'visible', timeout: 10000 }),
    ]).catch(() => {});
  }

  /**
   * Wait for generation to complete
   */
  async waitForGenerationComplete(timeoutMs: number = 300000): Promise<void> {
    // Wait for either completion message or view button
    await Promise.race([
      this.completionMessage.waitFor({ state: 'visible', timeout: timeoutMs }),
      this.viewPlanButton.waitFor({ state: 'visible', timeout: timeoutMs }),
      // Or if redirected to preview page
      this.page.waitForURL(/\/business-plan\//, { timeout: timeoutMs }),
    ]);
  }

  /**
   * Wait for generation with progress polling
   */
  async waitForGenerationWithProgress(
    onProgress?: (progress: number) => void,
    timeoutMs: number = 300000
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      // Check if complete
      if (await this.isGenerationComplete()) {
        break;
      }

      // Check for error
      if (await this.hasError()) {
        throw new Error('Generation failed');
      }

      // Get progress if callback provided
      if (onProgress) {
        const progress = await this.getProgressPercentage();
        if (progress !== null) {
          onProgress(progress);
        }
      }

      await this.page.waitForTimeout(2000);
    }
  }

  /**
   * Click cancel button
   */
  async cancelGeneration(): Promise<void> {
    await this.cancelButton.click();
  }

  /**
   * Click view plan button
   */
  async viewPlan(): Promise<void> {
    await this.viewPlanButton.click();
    await this.page.waitForURL(/\/business-plan\//, { timeout: 10000 });
  }

  /**
   * Click retry button
   */
  async retry(): Promise<void> {
    await this.retryButton.click();
    await this.waitForGenerationStart();
  }

  /**
   * Check if generation is complete
   */
  async isGenerationComplete(): Promise<boolean> {
    const hasCompletion = await this.completionMessage.isVisible().catch(() => false);
    const hasViewButton = await this.viewPlanButton.isVisible().catch(() => false);
    const onPreview = this.page.url().includes('/business-plan/');
    return hasCompletion || hasViewButton || onPreview;
  }

  /**
   * Check if there's an error
   */
  async hasError(): Promise<boolean> {
    return this.errorMessage.isVisible({ timeout: 500 }).catch(() => false);
  }

  /**
   * Get current progress percentage
   */
  async getProgressPercentage(): Promise<number | null> {
    const text = await this.progressPercentage.textContent().catch(() => null);
    if (text) {
      const match = text.match(/(\d+)/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    return null;
  }

  /**
   * Get completed sections count
   */
  async getCompletedSectionsCount(): Promise<number> {
    return this.completedSections.count();
  }

  /**
   * Get total sections count
   */
  async getTotalSectionsCount(): Promise<number> {
    return this.sectionItems.count();
  }

  /**
   * Get current step name
   */
  async getCurrentStepName(): Promise<string | null> {
    return this.currentStepLabel.textContent();
  }

  // ==================== ASSERTIONS ====================

  /**
   * Assert generation is in progress
   */
  async expectGenerationInProgress(): Promise<void> {
    await expect(this.page).toHaveURL(/\/generation\//);
    // Should have either progress indicator or section items
    const hasProgress = await this.progressIndicator.isVisible().catch(() => false);
    const hasSections = await this.sectionItems.first().isVisible().catch(() => false);
    const hasStatus = await this.statusTitle.isVisible().catch(() => false);
    expect(hasProgress || hasSections || hasStatus).toBeTruthy();
  }

  /**
   * Assert generation is complete
   */
  async expectGenerationComplete(): Promise<void> {
    const isComplete = await this.isGenerationComplete();
    expect(isComplete).toBeTruthy();
  }

  /**
   * Assert view button is visible
   */
  async expectViewButtonVisible(): Promise<void> {
    await expect(this.viewPlanButton).toBeVisible();
  }

  /**
   * Assert error is displayed
   */
  async expectErrorDisplayed(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }

  /**
   * Assert retry button is visible
   */
  async expectRetryButtonVisible(): Promise<void> {
    await expect(this.retryButton).toBeVisible();
  }

  /**
   * Assert cancel button is visible
   */
  async expectCancelButtonVisible(): Promise<void> {
    await expect(this.cancelButton).toBeVisible();
  }

  /**
   * Assert progress indicator is visible
   */
  async expectProgressVisible(): Promise<void> {
    await expect(this.progressIndicator).toBeVisible();
  }

  /**
   * Assert some sections are completed
   */
  async expectSomeSectionsCompleted(): Promise<void> {
    const count = await this.getCompletedSectionsCount();
    expect(count).toBeGreaterThan(0);
  }
}
