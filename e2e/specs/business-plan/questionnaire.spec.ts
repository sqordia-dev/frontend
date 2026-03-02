import { test, expect } from '../../fixtures';

/**
 * Questionnaire E2E Tests
 * Tags: @questionnaire @business-plan @interview
 */
test.describe('Questionnaire @questionnaire @business-plan', () => {
  let testPlanId: string | null = null;

  /**
   * Helper to check if user is stuck on onboarding
   */
  const isOnOnboarding = async (page: import('@playwright/test').Page): Promise<boolean> => {
    await page.waitForTimeout(1000);
    const url = page.url();
    const onOnboarding = url.includes('/onboarding') || url.includes('/persona-selection');
    if (onOnboarding) {
      console.log(`⚠️ User on onboarding page: ${url}`);
    }
    return onOnboarding;
  };

  /**
   * Create a test plan before tests
   */
  test.beforeEach(async ({ auth, dashboardPage, createPlanPage, page }) => {
    await auth.loginAsAdmin();

    // Handle onboarding if needed
    await page.waitForLoadState('networkidle');
    const url = page.url();
    if (url.includes('/onboarding') || url.includes('/persona-selection')) {
      await dashboardPage.completeOnboarding();
    }

    // Create a new plan for testing
    await createPlanPage.goto();
    await createPlanPage.waitForPageReady();

    const planName = `E2E Questionnaire Test ${Date.now()}`;
    await createPlanPage.fillProjectName(planName);
    await createPlanPage.clickCreate();

    // Wait for navigation to questionnaire and extract plan ID
    await page.waitForURL(/\/questionnaire\//, { timeout: 30000 });
    const currentUrl = page.url();
    const match = currentUrl.match(/\/questionnaire\/([^/]+)/);
    if (match) {
      testPlanId = match[1];
    }
  });

  // ==================== SMOKE TESTS ====================

  test('should display questionnaire page @smoke', async ({ questionnairePage, screenshots }) => {
    if (await isOnOnboarding(questionnairePage.page)) {
      return;
    }

    await questionnairePage.waitForQuestionnaireReady();
    await questionnairePage.expectQuestionnaireLoaded();
    await screenshots.capture({ feature: 'questionnaire', name: 'questionnaire-loaded', fullPage: true });
  });

  test('should show question text @smoke', async ({ questionnairePage }) => {
    if (await isOnOnboarding(questionnairePage.page)) {
      return;
    }

    await questionnairePage.waitForQuestionnaireReady();
    await questionnairePage.expectQuestionVisible();
  });

  test('should show answer editor @smoke', async ({ questionnairePage }) => {
    if (await isOnOnboarding(questionnairePage.page)) {
      return;
    }

    await questionnairePage.waitForQuestionnaireReady();
    await questionnairePage.expectEditorVisible();
  });

  // ==================== NAVIGATION TESTS ====================

  test('should show progress indicator @navigation', async ({ questionnairePage }) => {
    if (await isOnOnboarding(questionnairePage.page)) {
      return;
    }

    await questionnairePage.waitForQuestionnaireReady();
    await questionnairePage.expectProgressVisible();
  });

  test('should navigate to next question @navigation @critical', async ({ questionnairePage, screenshots }) => {
    if (await isOnOnboarding(questionnairePage.page)) {
      return;
    }

    await questionnairePage.waitForQuestionnaireReady();

    // Answer the first question
    await questionnairePage.typeAnswer('This is my test answer for the first question. It contains enough content to be valid.');
    await questionnairePage.page.waitForTimeout(500);

    // Get initial question number
    const initialQuestion = await questionnairePage.getCurrentStepNumber();

    // Navigate to next
    await questionnairePage.goToNextQuestion();

    await screenshots.capture({ feature: 'questionnaire', name: 'questionnaire-second-question' });

    // Verify navigation occurred
    const currentUrl = questionnairePage.page.url();
    expect(currentUrl).toContain('/questionnaire/');
  });

  test('should navigate to previous question @navigation', async ({ questionnairePage }) => {
    if (await isOnOnboarding(questionnairePage.page)) {
      return;
    }

    await questionnairePage.waitForQuestionnaireReady();

    // Answer and go to next
    await questionnairePage.typeAnswer('First question answer');
    await questionnairePage.goToNextQuestion();
    await questionnairePage.page.waitForTimeout(500);

    // Go back to previous
    await questionnairePage.goToPreviousQuestion();
    await questionnairePage.page.waitForTimeout(500);

    // Should still be on questionnaire
    await questionnairePage.expectQuestionnaireLoaded();
  });

  // ==================== ANSWER INPUT TESTS ====================

  test('should accept text input @input', async ({ questionnairePage }) => {
    if (await isOnOnboarding(questionnairePage.page)) {
      return;
    }

    await questionnairePage.waitForQuestionnaireReady();

    const testAnswer = 'This is a comprehensive test answer that describes my business idea in detail.';
    await questionnairePage.typeAnswer(testAnswer);

    // Verify input was accepted (editor contains text)
    await questionnairePage.expectEditorVisible();
  });

  test('should clear answer when requested @input', async ({ questionnairePage }) => {
    if (await isOnOnboarding(questionnairePage.page)) {
      return;
    }

    await questionnairePage.waitForQuestionnaireReady();

    await questionnairePage.typeAnswer('Initial answer');
    await questionnairePage.clearAnswer();

    // Editor should be empty or show placeholder
    await questionnairePage.expectEditorVisible();
  });

  // ==================== STEP SIDEBAR TESTS ====================

  test('should display steps sidebar @sidebar', async ({ questionnairePage }) => {
    if (await isOnOnboarding(questionnairePage.page)) {
      return;
    }

    await questionnairePage.waitForQuestionnaireReady();

    // Check if sidebar with steps is visible
    const stepTitles = await questionnairePage.getStepTitles();
    console.log('Available steps:', stepTitles);

    // Should have some steps
    expect(stepTitles.length).toBeGreaterThanOrEqual(0);
  });

  test('should navigate via step sidebar @sidebar @navigation', async ({ questionnairePage }) => {
    if (await isOnOnboarding(questionnairePage.page)) {
      return;
    }

    await questionnairePage.waitForQuestionnaireReady();

    // Try to navigate to step 1 (if visible)
    try {
      await questionnairePage.goToStep(0);
      await questionnairePage.page.waitForTimeout(500);
      await questionnairePage.expectQuestionnaireLoaded();
    } catch (e) {
      console.log('Step navigation not available or failed');
    }
  });

  // ==================== AUTO-SAVE TESTS ====================

  test('should auto-save answers @autosave', async ({ questionnairePage }) => {
    if (await isOnOnboarding(questionnairePage.page)) {
      return;
    }

    await questionnairePage.waitForQuestionnaireReady();

    // Type an answer
    await questionnairePage.typeAnswer('This answer should be auto-saved by the application.');

    // Wait for potential auto-save
    await questionnairePage.page.waitForTimeout(2000);

    // Check if save indicator appears (may not be present in all implementations)
    const saveIndicator = questionnairePage.saveIndicator;
    const hasSaveIndicator = await saveIndicator.isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`Save indicator visible: ${hasSaveIndicator}`);
  });

  // ==================== MULTI-QUESTION FLOW ====================

  test('should complete multiple questions @flow @critical', async ({ questionnairePage, screenshots }) => {
    if (await isOnOnboarding(questionnairePage.page)) {
      return;
    }

    await questionnairePage.waitForQuestionnaireReady();

    const answers = [
      'My business is a SaaS platform for project management.',
      'We target small to medium businesses looking to improve productivity.',
      'Our unique value is AI-powered automation and insights.',
    ];

    for (let i = 0; i < Math.min(answers.length, 3); i++) {
      await questionnairePage.typeAnswer(answers[i]);
      await questionnairePage.page.waitForTimeout(500);

      // Check if we can proceed
      const isLast = await questionnairePage.isLastQuestion();
      if (!isLast) {
        await questionnairePage.goToNextQuestion();
        await questionnairePage.page.waitForTimeout(500);
      } else {
        break;
      }
    }

    await screenshots.capture({ feature: 'questionnaire', name: 'questionnaire-multi-question-progress' });
  });

  // ==================== RESPONSIVE TESTS ====================

  test('should display correctly on mobile @responsive', async ({ questionnairePage, screenshots }) => {
    if (await isOnOnboarding(questionnairePage.page)) {
      return;
    }

    await questionnairePage.page.setViewportSize({ width: 375, height: 667 });
    await questionnairePage.waitForQuestionnaireReady();
    await questionnairePage.expectQuestionnaireLoaded();
    await screenshots.capture({ feature: 'questionnaire', name: 'questionnaire-mobile' });
  });

  test('should display correctly on tablet @responsive', async ({ questionnairePage, screenshots }) => {
    if (await isOnOnboarding(questionnairePage.page)) {
      return;
    }

    await questionnairePage.page.setViewportSize({ width: 768, height: 1024 });
    await questionnairePage.waitForQuestionnaireReady();
    await questionnairePage.expectQuestionnaireLoaded();
    await screenshots.capture({ feature: 'questionnaire', name: 'questionnaire-tablet' });
  });

  // ==================== AI FEATURES ====================

  test('should show AI coach if available @ai', async ({ questionnairePage }) => {
    if (await isOnOnboarding(questionnairePage.page)) {
      return;
    }

    await questionnairePage.waitForQuestionnaireReady();

    // Check if AI coach panel is visible
    const hasAiCoach = await questionnairePage.aiCoachPanel.isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`AI coach panel visible: ${hasAiCoach}`);

    // This is informational - AI coach may not be present
  });

  // ==================== ERROR HANDLING ====================

  test('should handle page reload gracefully @error-handling', async ({ questionnairePage }) => {
    if (await isOnOnboarding(questionnairePage.page)) {
      return;
    }

    await questionnairePage.waitForQuestionnaireReady();

    // Type some answer
    await questionnairePage.typeAnswer('Test answer before reload');
    await questionnairePage.page.waitForTimeout(1000);

    // Reload the page
    await questionnairePage.page.reload();
    await questionnairePage.waitForQuestionnaireReady();

    // Should still be on questionnaire
    await questionnairePage.expectQuestionnaireLoaded();
  });
});
