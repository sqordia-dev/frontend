import { Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Questionnaire page object
 * Handles the business plan questionnaire/interview flow
 */
export class QuestionnairePage extends BasePage {
  readonly path = '/questionnaire';
  readonly feature = 'questionnaire';

  // ==================== LOCATORS ====================

  /**
   * Current question text
   */
  get currentQuestion(): Locator {
    return this.page.locator('h2, h3, [class*="question"]').filter({ hasText: /.+\?|.{20,}/ }).first();
  }

  /**
   * Question number indicator
   */
  get questionIndicator(): Locator {
    return this.page.locator('[class*="question"]').filter({ hasText: /Question \d+ of \d+|Question \d+ sur \d+/i }).first();
  }

  /**
   * Answer text area/editor
   */
  get answerEditor(): Locator {
    return this.page.locator('textarea, [contenteditable="true"], .ProseMirror, [data-testid="answer-editor"]').first();
  }

  /**
   * Next button
   */
  get nextButton(): Locator {
    return this.page.locator('button').filter({ hasText: /Next|Suivant|Continue/i }).first();
  }

  /**
   * Previous button
   */
  get previousButton(): Locator {
    return this.page.locator('button').filter({ hasText: /Previous|Précédent|Back/i }).first();
  }

  /**
   * Generate plan button (appears at the end)
   */
  get generatePlanButton(): Locator {
    return this.page.locator('button').filter({ hasText: /Generate|Générer/i }).first();
  }

  /**
   * Progress indicator
   */
  get progressBar(): Locator {
    return this.page.locator('[role="progressbar"], .progress-bar, [class*="progress"]').first();
  }

  /**
   * Section/step sidebar
   */
  get stepsSidebar(): Locator {
    return this.page.locator('aside, [class*="sidebar"]').filter({ has: this.page.locator('button, a') }).first();
  }

  /**
   * Step items in sidebar
   */
  get stepItems(): Locator {
    return this.stepsSidebar.locator('button, a').filter({ hasText: /\d|Identity|Vision|Offering|Market|Financial/i });
  }

  /**
   * Current active step
   */
  get activeStep(): Locator {
    return this.stepsSidebar.locator('[aria-current="step"], .active, [class*="active"], [data-state="active"]').first();
  }

  /**
   * AI coach/helper panel
   */
  get aiCoachPanel(): Locator {
    return this.page.locator('[class*="coach"], [class*="ai-assist"], [data-testid="ai-coach"]').first();
  }

  /**
   * AI suggestion/tip
   */
  get aiSuggestion(): Locator {
    return this.page.locator('[class*="suggestion"], [class*="tip"], [class*="advice"]').first();
  }

  /**
   * Back to dashboard link
   */
  get backToDashboard(): Locator {
    return this.page.locator('a').filter({ hasText: /Dashboard|Tableau de bord/i }).first();
  }

  /**
   * Save indicator
   */
  get saveIndicator(): Locator {
    return this.page.locator('[class*="save"], [class*="saved"]').filter({ hasText: /Saved|Saving|Sauvegardé/i }).first();
  }

  /**
   * Help text for current question
   */
  get helpText(): Locator {
    return this.page.locator('[class*="help"], [class*="hint"], .text-muted-foreground').first();
  }

  /**
   * Language switcher
   */
  get languageSwitcher(): Locator {
    return this.page.locator('button, [class*="language"]').filter({ hasText: /EN|FR/i }).first();
  }

  // ==================== ACTIONS ====================

  /**
   * Navigate to questionnaire for a specific plan
   */
  async gotoForPlan(planId: string): Promise<void> {
    await this.page.goto(`/questionnaire/${planId}`);
    await this.waitForQuestionnaireReady();
  }

  /**
   * Wait for questionnaire to be ready
   */
  async waitForQuestionnaireReady(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    // Wait for either a question or loading to complete
    await Promise.race([
      this.currentQuestion.waitFor({ state: 'visible', timeout: 15000 }),
      this.answerEditor.waitFor({ state: 'visible', timeout: 15000 }),
    ]).catch(() => {});
    await this.page.waitForTimeout(500);
  }

  /**
   * Type an answer in the editor
   */
  async typeAnswer(answer: string): Promise<void> {
    const editor = this.answerEditor;
    await editor.click();
    await editor.fill(answer);
  }

  /**
   * Clear the current answer
   */
  async clearAnswer(): Promise<void> {
    const editor = this.answerEditor;
    await editor.click();
    await editor.fill('');
  }

  /**
   * Go to next question
   */
  async goToNextQuestion(): Promise<void> {
    await this.nextButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Go to previous question
   */
  async goToPreviousQuestion(): Promise<void> {
    await this.previousButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Answer current question and proceed
   */
  async answerAndProceed(answer: string): Promise<void> {
    await this.typeAnswer(answer);
    await this.page.waitForTimeout(300); // Wait for auto-save
    await this.goToNextQuestion();
  }

  /**
   * Navigate to specific step by index
   */
  async goToStep(stepIndex: number): Promise<void> {
    const stepButton = this.stepItems.nth(stepIndex);
    await stepButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Click generate plan button
   */
  async clickGeneratePlan(): Promise<void> {
    await this.generatePlanButton.click();
  }

  /**
   * Generate plan and wait for navigation
   */
  async generatePlanAndWait(): Promise<void> {
    await this.clickGeneratePlan();
    // Wait for navigation to generation page or preview
    await this.page.waitForURL(/\/(generation|business-plan)\//, { timeout: 60000 });
  }

  /**
   * Get current question text
   */
  async getCurrentQuestionText(): Promise<string | null> {
    return this.currentQuestion.textContent();
  }

  /**
   * Get current step number
   */
  async getCurrentStepNumber(): Promise<number | null> {
    const indicator = await this.questionIndicator.textContent();
    if (indicator) {
      const match = indicator.match(/Question (\d+)/i);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    return null;
  }

  /**
   * Get total questions count
   */
  async getTotalQuestions(): Promise<number | null> {
    const indicator = await this.questionIndicator.textContent();
    if (indicator) {
      const match = indicator.match(/of (\d+)|sur (\d+)/i);
      if (match) {
        return parseInt(match[1] || match[2], 10);
      }
    }
    return null;
  }

  /**
   * Check if on last question
   */
  async isLastQuestion(): Promise<boolean> {
    const generateButton = this.generatePlanButton;
    return generateButton.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Get all step titles
   */
  async getStepTitles(): Promise<string[]> {
    const titles: string[] = [];
    const count = await this.stepItems.count();
    for (let i = 0; i < count; i++) {
      const text = await this.stepItems.nth(i).textContent();
      if (text) titles.push(text.trim());
    }
    return titles;
  }

  // ==================== ASSERTIONS ====================

  /**
   * Assert questionnaire is loaded
   */
  async expectQuestionnaireLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/questionnaire\//);
    await expect(this.answerEditor.or(this.currentQuestion)).toBeVisible();
  }

  /**
   * Assert current question is visible
   */
  async expectQuestionVisible(): Promise<void> {
    await expect(this.currentQuestion).toBeVisible();
  }

  /**
   * Assert answer editor is visible
   */
  async expectEditorVisible(): Promise<void> {
    await expect(this.answerEditor).toBeVisible();
  }

  /**
   * Assert next button is enabled
   */
  async expectNextEnabled(): Promise<void> {
    await expect(this.nextButton).toBeEnabled();
  }

  /**
   * Assert next button is disabled
   */
  async expectNextDisabled(): Promise<void> {
    await expect(this.nextButton).toBeDisabled();
  }

  /**
   * Assert generate button is visible
   */
  async expectGenerateButtonVisible(): Promise<void> {
    await expect(this.generatePlanButton).toBeVisible();
  }

  /**
   * Assert progress is shown
   */
  async expectProgressVisible(): Promise<void> {
    const hasProgress = await this.progressBar.isVisible().catch(() => false);
    const hasIndicator = await this.questionIndicator.isVisible().catch(() => false);
    expect(hasProgress || hasIndicator).toBeTruthy();
  }

  /**
   * Assert specific step is active
   */
  async expectStepActive(stepText: string | RegExp): Promise<void> {
    await expect(this.activeStep).toContainText(stepText);
  }
}
