import { Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Questionnaire page object
 * Handles the business plan questionnaire/interview flow
 */
export class QuestionnairePage extends BasePage {
  readonly path = '/interview';
  readonly feature = 'questionnaire';

  // ==================== LOCATORS ====================

  /**
   * Current question text - displayed in AIInterviewer component
   * Format: "Q{number}. {questionText}"
   */
  get currentQuestion(): Locator {
    return this.page.locator('.text-lg.font-medium').filter({ has: this.page.locator('span.text-orange-500') }).first();
  }

  /**
   * Question number indicator - "Question X of Y" in navigation area
   */
  get questionIndicator(): Locator {
    return this.page.locator('div.text-sm').filter({ hasText: /Question \d+ of \d+|Question \d+ sur \d+/i }).first();
  }

  /**
   * Answer text area/editor - NotionStyleEditor uses ProseMirror
   */
  get answerEditor(): Locator {
    return this.page.locator('.ProseMirror, [contenteditable="true"], textarea, [data-testid="answer-editor"]').first();
  }

  /**
   * Next button - orange button with "Next" text
   */
  get nextButton(): Locator {
    return this.page.locator('button').filter({ hasText: /Next|Suivant/i }).first();
  }

  /**
   * Previous button
   */
  get previousButton(): Locator {
    return this.page.locator('button').filter({ hasText: /Previous|Précédent/i }).first();
  }

  /**
   * Generate plan button (appears at the end - green button with Sparkles icon)
   */
  get generatePlanButton(): Locator {
    return this.page.locator('button').filter({ hasText: /Generate.*Plan|Générer.*plan/i }).first();
  }

  /**
   * Progress indicator - the progress bar in header
   */
  get progressBar(): Locator {
    return this.page.locator('.h-2.rounded-full.overflow-hidden').first();
  }

  /**
   * Answered count indicator - "X / Y answered" in header
   */
  get answeredIndicator(): Locator {
    return this.page.locator('.text-sm').filter({ hasText: /\d+\s*\/\s*\d+\s*(answered|répondu)/i }).first();
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
   * AI Coach floating bubble button (bottom-right corner)
   */
  get aiCoachBubble(): Locator {
    return this.page.locator('button[aria-label*="coach"], button[aria-label*="Sqordia"]').first();
  }

  /**
   * AI Coach bubble button (alternative selector)
   */
  get aiCoachBubbleAlt(): Locator {
    return this.page.locator('.fixed.z-40 button.rounded-full').filter({ has: this.page.locator('svg') }).first();
  }

  /**
   * AI coach/helper panel (widget when open)
   */
  get aiCoachPanel(): Locator {
    return this.page.locator('[class*="coach"], [class*="ai-assist"], [data-testid="ai-coach"]').first();
  }

  /**
   * AI Coach widget container (when opened)
   */
  get aiCoachWidget(): Locator {
    return this.page.locator('.fixed').filter({ hasText: /Sqordia|coach/i }).first();
  }

  /**
   * AI Coach widget title
   */
  get aiCoachTitle(): Locator {
    return this.page.locator('h2, h3, .font-bold').filter({ hasText: 'Sqordia' }).first();
  }

  /**
   * AI Coach widget close button
   */
  get aiCoachCloseButton(): Locator {
    return this.aiCoachWidget.locator('button').filter({ has: this.page.locator('svg.lucide-x') }).first();
  }

  /**
   * AI Coach input textarea
   */
  get aiCoachInput(): Locator {
    return this.page.locator('textarea[placeholder*="question"], textarea[placeholder*="Question"]').first();
  }

  /**
   * AI Coach send button
   */
  get aiCoachSendButton(): Locator {
    return this.page.locator('button[type="submit"]').filter({ has: this.page.locator('svg') }).first();
  }

  /**
   * AI Coach messages container
   */
  get aiCoachMessages(): Locator {
    return this.page.locator('.overflow-y-auto').filter({ has: this.page.locator('[class*="message"]') }).first();
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
    await this.page.goto(`/interview/${planId}`);
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
    // Try the AIInterviewer question first
    const questionVisible = await this.currentQuestion.isVisible({ timeout: 3000 }).catch(() => false);
    if (questionVisible) {
      return this.currentQuestion.textContent();
    }
    // Fallback: look for any text that looks like a question
    const fallback = this.page.locator('.text-lg, h2, h3').filter({ hasText: /\?|Q\d+/ }).first();
    return fallback.textContent();
  }

  /**
   * Get current step number from "Question X of Y" indicator or "X / Y answered" format
   */
  async getCurrentStepNumber(): Promise<number | null> {
    // Try the "Question X of Y" format first
    const indicatorVisible = await this.questionIndicator.isVisible({ timeout: 3000 }).catch(() => false);
    if (indicatorVisible) {
      const indicator = await this.questionIndicator.textContent();
      if (indicator) {
        const match = indicator.match(/Question (\d+)/i);
        if (match) {
          return parseInt(match[1], 10);
        }
      }
    }

    // Fallback: try the "X / Y answered" format in header
    const answeredVisible = await this.answeredIndicator.isVisible({ timeout: 2000 }).catch(() => false);
    if (answeredVisible) {
      const text = await this.answeredIndicator.textContent();
      if (text) {
        // This gives us answered count, not current question - return null
        return null;
      }
    }

    return null;
  }

  /**
   * Get total questions count
   */
  async getTotalQuestions(): Promise<number | null> {
    // Try the "Question X of Y" format
    const indicatorVisible = await this.questionIndicator.isVisible({ timeout: 3000 }).catch(() => false);
    if (indicatorVisible) {
      const indicator = await this.questionIndicator.textContent();
      if (indicator) {
        const match = indicator.match(/of (\d+)|sur (\d+)/i);
        if (match) {
          return parseInt(match[1] || match[2], 10);
        }
      }
    }

    // Fallback: try the "X / Y answered" format in header
    const answeredVisible = await this.answeredIndicator.isVisible({ timeout: 2000 }).catch(() => false);
    if (answeredVisible) {
      const text = await this.answeredIndicator.textContent();
      if (text) {
        const match = text.match(/\/\s*(\d+)/);
        if (match) {
          return parseInt(match[1], 10);
        }
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
    await expect(this.page).toHaveURL(/\/interview\//);
    // Wait for any content indicating the questionnaire is ready
    const hasContent = await Promise.race([
      this.answerEditor.waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
      this.currentQuestion.waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
      this.page.locator('.text-lg.font-medium').first().waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
    ]).catch(() => false);
    expect(hasContent).toBeTruthy();
  }

  /**
   * Assert current question is visible
   * Uses multiple fallback strategies for question detection
   */
  async expectQuestionVisible(): Promise<void> {
    // Try multiple selectors for question visibility
    const isVisible = await Promise.race([
      this.currentQuestion.isVisible({ timeout: 5000 }),
      this.page.locator('.text-lg.font-medium').first().isVisible({ timeout: 5000 }),
      this.page.locator('span.text-orange-500').filter({ hasText: /Q\d+/ }).first().isVisible({ timeout: 5000 }),
    ]).catch(() => false);
    expect(isVisible).toBeTruthy();
  }

  /**
   * Assert answer editor is visible
   */
  async expectEditorVisible(): Promise<void> {
    const isVisible = await this.answerEditor.isVisible({ timeout: 5000 }).catch(() => false);
    expect(isVisible).toBeTruthy();
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
   * Assert progress is shown - looks for progress bar or answered indicator
   */
  async expectProgressVisible(): Promise<void> {
    const hasProgress = await this.progressBar.isVisible({ timeout: 3000 }).catch(() => false);
    const hasIndicator = await this.questionIndicator.isVisible({ timeout: 3000 }).catch(() => false);
    const hasAnswered = await this.answeredIndicator.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasProgress || hasIndicator || hasAnswered).toBeTruthy();
  }

  /**
   * Assert specific step is active
   */
  async expectStepActive(stepText: string | RegExp): Promise<void> {
    await expect(this.activeStep).toContainText(stepText);
  }
}
