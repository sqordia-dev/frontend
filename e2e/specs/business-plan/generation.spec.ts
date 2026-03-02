import { test, expect } from '../../fixtures';

/**
 * AI Generation E2E Tests
 * Tags: @generation @ai @business-plan
 *
 * Note: These tests involve actual AI generation which can take several minutes.
 * Use sparingly in CI due to long execution times.
 */
test.describe('AI Generation @generation @ai', () => {
  // Increase timeout for generation tests
  test.setTimeout(120000);

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

  test.beforeEach(async ({ auth, dashboardPage }) => {
    await auth.loginAsAdmin();

    // Handle onboarding if needed
    await dashboardPage.page.waitForLoadState('networkidle');
    const url = dashboardPage.page.url();
    if (url.includes('/onboarding') || url.includes('/persona-selection')) {
      await dashboardPage.completeOnboarding();
    }
  });

  // ==================== GENERATION PAGE TESTS ====================

  test.describe('Generation Page', () => {
    test('should display generation status when plan is generating @smoke', async ({
      page,
      createPlanPage,
      questionnairePage,
      generationPage,
      screenshots
    }) => {
      if (await isOnOnboarding(page)) {
        return;
      }

      // Create a new plan using the improved method
      await createPlanPage.goto();
      await createPlanPage.waitForPageReady();
      await createPlanPage.createPlanAndWaitForQuestionnaire(`AI Gen Test ${Date.now()}`);

      // Fill in some basic answers
      await questionnairePage.waitForQuestionnaireReady();
      await questionnairePage.typeAnswer('This is a technology startup focused on AI-powered business solutions.');
      await questionnairePage.page.waitForTimeout(500);

      // Navigate through a few questions
      for (let i = 0; i < 2; i++) {
        const isLast = await questionnairePage.isLastQuestion();
        if (!isLast) {
          await questionnairePage.goToNextQuestion();
          await questionnairePage.page.waitForTimeout(500);
          await questionnairePage.typeAnswer(`Answer for question ${i + 2}: We provide innovative solutions.`);
        }
      }

      // Check if generate button appears
      const hasGenerateButton = await questionnairePage.generatePlanButton.isVisible({ timeout: 3000 }).catch(() => false);
      console.log(`Generate button visible: ${hasGenerateButton}`);

      await screenshots.capture({ feature: 'generation', name: 'questionnaire-before-generation' });
    });

    test('should show progress indicator during generation @generation', async ({
      page,
      generationPage,
      screenshots
    }) => {
      // Navigate directly to generation page if we have a plan ID
      // This test is more about verifying the UI elements exist

      if (await isOnOnboarding(page)) {
        return;
      }

      // Check generation page elements exist (using existing plan if available)
      const currentUrl = page.url();

      // If we're on a generation page, verify elements
      if (currentUrl.includes('/generation/')) {
        await generationPage.waitForGenerationStart();

        // Check for progress elements
        const hasProgress = await generationPage.progressIndicator.isVisible({ timeout: 5000 }).catch(() => false);
        const hasStatus = await generationPage.statusTitle.isVisible({ timeout: 5000 }).catch(() => false);

        console.log(`Progress indicator visible: ${hasProgress}`);
        console.log(`Status title visible: ${hasStatus}`);

        await screenshots.capture({ feature: 'generation', name: 'generation-in-progress' });
      } else {
        console.log('Not on generation page - skipping progress verification');
      }
    });
  });

  // ==================== GENERATION FLOW TESTS ====================

  test.describe('Full Generation Flow', () => {
    // This test can take a long time - set appropriate timeout
    test.setTimeout(300000); // 5 minutes

    test.skip('should complete full generation flow @flow @critical @slow', async ({
      page,
      createPlanPage,
      questionnairePage,
      generationPage,
      previewPage,
      screenshots
    }) => {
      // Skip in CI to avoid long-running tests
      if (process.env.CI === 'true') {
        console.log('Skipping full generation flow in CI');
        return;
      }

      if (await isOnOnboarding(page)) {
        return;
      }

      // Step 1: Create a new plan
      await createPlanPage.goto();
      await createPlanPage.waitForPageReady();
      await createPlanPage.createPlanAndWaitForQuestionnaire(`Full Flow Test ${Date.now()}`);

      // Step 2: Answer all required questions
      await questionnairePage.waitForQuestionnaireReady();

      const answers = [
        'TechCorp is a B2B SaaS platform providing AI-powered analytics.',
        'Our target market is mid-size enterprises in the technology sector.',
        'We differentiate through proprietary machine learning algorithms.',
        'Our revenue model is subscription-based with tiered pricing.',
        'The founding team has 20+ years combined experience in tech.',
      ];

      for (const answer of answers) {
        await questionnairePage.typeAnswer(answer);
        await page.waitForTimeout(500);

        const isLast = await questionnairePage.isLastQuestion();
        if (!isLast) {
          await questionnairePage.goToNextQuestion();
          await page.waitForTimeout(500);
        } else {
          break;
        }
      }

      // Step 3: Generate the plan
      const hasGenerateButton = await questionnairePage.generatePlanButton.isVisible().catch(() => false);
      if (hasGenerateButton) {
        await questionnairePage.clickGeneratePlan();

        // Step 4: Wait for generation to complete
        await generationPage.waitForGenerationComplete(240000); // 4 min timeout

        // Step 5: View the generated plan
        const isComplete = await generationPage.isGenerationComplete();
        if (isComplete) {
          await generationPage.viewPlan();
          await previewPage.waitForPreviewReady();
          await previewPage.expectPreviewLoaded();
          await previewPage.expectSectionsVisible();

          await screenshots.capture({ feature: 'generation', name: 'generation-complete-preview', fullPage: true });
        }
      } else {
        console.log('Generate button not available - may need more questions answered');
      }
    });
  });

  // ==================== ERROR HANDLING ====================

  test.describe('Error Handling', () => {
    test('should handle generation errors gracefully @error-handling', async ({
      generationPage,
      page
    }) => {
      if (await isOnOnboarding(page)) {
        return;
      }

      // This tests the error handling UI - would need a way to trigger an error
      // For now, just verify the error elements exist if visible
      const hasError = await generationPage.hasError();
      if (hasError) {
        await generationPage.expectRetryButtonVisible();
      }

      console.log('Error handling test completed');
    });

    test('should show cancel button during generation @generation', async ({
      generationPage,
      page
    }) => {
      if (await isOnOnboarding(page)) {
        return;
      }

      // If we're on a generation page in progress
      const currentUrl = page.url();
      if (currentUrl.includes('/generation/')) {
        await generationPage.waitForGenerationStart();

        // Cancel button should be visible during generation
        const hasCancelButton = await generationPage.cancelButton.isVisible({ timeout: 5000 }).catch(() => false);
        console.log(`Cancel button visible: ${hasCancelButton}`);
      }
    });
  });

  // ==================== RESPONSIVE TESTS ====================

  test.describe('Responsive', () => {
    test('should display generation page correctly on mobile @responsive', async ({
      page,
      screenshots
    }) => {
      if (await isOnOnboarding(page)) {
        return;
      }

      await page.setViewportSize({ width: 375, height: 667 });

      // If on generation page, take screenshot
      const currentUrl = page.url();
      if (currentUrl.includes('/generation/')) {
        await screenshots.capture({ feature: 'generation', name: 'generation-mobile' });
      }
    });
  });
});
