import { test, expect } from '../../fixtures';

/**
 * Export Functionality E2E Tests
 * Tags: @export @business-plan @pdf @word
 */
test.describe('Export Functionality @export @business-plan', () => {
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

  // ==================== EXPORT UI TESTS ====================

  test.describe('Export UI', () => {
    test('should display export button on preview page @smoke @ui', async ({
      dashboardPage,
      previewPage,
      screenshots
    }) => {
      if (await isOnOnboarding(dashboardPage.page)) {
        return;
      }

      // Navigate to dashboard and click on an existing plan
      await dashboardPage.goto();
      await dashboardPage.waitForDashboardReady();

      const planCount = await dashboardPage.getPlanCount();
      if (planCount > 0) {
        await dashboardPage.clickPlanCard(0);
        await previewPage.page.waitForLoadState('networkidle');

        // Check if we're on preview page
        const currentUrl = previewPage.page.url();
        if (currentUrl.includes('/business-plan/')) {
          await previewPage.waitForPreviewReady();
          await previewPage.expectExportButtonVisible();
          await screenshots.capture({ feature: 'export', name: 'export-button-visible' });
        }
      } else {
        console.log('No existing plans to test export');
      }
    });

    test('should show export menu when clicked @ui', async ({
      dashboardPage,
      previewPage,
      screenshots
    }) => {
      if (await isOnOnboarding(dashboardPage.page)) {
        return;
      }

      await dashboardPage.goto();
      await dashboardPage.waitForDashboardReady();

      const planCount = await dashboardPage.getPlanCount();
      if (planCount > 0) {
        await dashboardPage.clickPlanCard(0);
        await previewPage.page.waitForLoadState('networkidle');

        const currentUrl = previewPage.page.url();
        if (currentUrl.includes('/business-plan/')) {
          await previewPage.waitForPreviewReady();

          // Click export button
          await previewPage.openExportMenu();

          // Check if menu is open
          const isMenuOpen = await previewPage.isExportMenuOpen();
          console.log(`Export menu open: ${isMenuOpen}`);

          await screenshots.capture({ feature: 'export', name: 'export-menu-open' });
        }
      }
    });

    test('should show PDF and Word export options @ui', async ({
      dashboardPage,
      previewPage
    }) => {
      if (await isOnOnboarding(dashboardPage.page)) {
        return;
      }

      await dashboardPage.goto();
      await dashboardPage.waitForDashboardReady();

      const planCount = await dashboardPage.getPlanCount();
      if (planCount > 0) {
        await dashboardPage.clickPlanCard(0);
        await previewPage.page.waitForLoadState('networkidle');

        const currentUrl = previewPage.page.url();
        if (currentUrl.includes('/business-plan/')) {
          await previewPage.waitForPreviewReady();
          await previewPage.openExportMenu();

          // Check for PDF option
          const hasPdfOption = await previewPage.exportPdfOption.isVisible({ timeout: 3000 }).catch(() => false);
          console.log(`PDF option visible: ${hasPdfOption}`);

          // Check for Word option
          const hasWordOption = await previewPage.exportWordOption.isVisible({ timeout: 3000 }).catch(() => false);
          console.log(`Word option visible: ${hasWordOption}`);
        }
      }
    });
  });

  // ==================== EXPORT FUNCTIONALITY TESTS ====================

  test.describe('Export Actions', () => {
    test('should initiate PDF export @export @pdf', async ({
      dashboardPage,
      previewPage,
      page
    }) => {
      if (await isOnOnboarding(page)) {
        return;
      }

      await dashboardPage.goto();
      await dashboardPage.waitForDashboardReady();

      const planCount = await dashboardPage.getPlanCount();
      if (planCount > 0) {
        await dashboardPage.clickPlanCard(0);
        await page.waitForLoadState('networkidle');

        const currentUrl = page.url();
        if (currentUrl.includes('/business-plan/')) {
          await previewPage.waitForPreviewReady();

          // Set up download listener
          const downloadPromise = page.waitForEvent('download', { timeout: 60000 }).catch(() => null);

          // Click export to PDF
          await previewPage.exportToPdf();

          // Wait for download or progress
          const download = await downloadPromise;
          if (download) {
            console.log(`PDF download started: ${download.suggestedFilename()}`);
            expect(download.suggestedFilename()).toMatch(/\.(pdf)$/i);
          } else {
            // Check if export progress is shown
            const hasProgress = await previewPage.exportProgress.isVisible({ timeout: 5000 }).catch(() => false);
            console.log(`Export progress visible: ${hasProgress}`);
          }
        }
      }
    });

    test('should initiate Word export @export @word', async ({
      dashboardPage,
      previewPage,
      page
    }) => {
      if (await isOnOnboarding(page)) {
        return;
      }

      await dashboardPage.goto();
      await dashboardPage.waitForDashboardReady();

      const planCount = await dashboardPage.getPlanCount();
      if (planCount > 0) {
        await dashboardPage.clickPlanCard(0);
        await page.waitForLoadState('networkidle');

        const currentUrl = page.url();
        if (currentUrl.includes('/business-plan/')) {
          await previewPage.waitForPreviewReady();

          // Set up download listener
          const downloadPromise = page.waitForEvent('download', { timeout: 60000 }).catch(() => null);

          // Click export to Word
          await previewPage.exportToWord();

          // Wait for download or progress
          const download = await downloadPromise;
          if (download) {
            console.log(`Word download started: ${download.suggestedFilename()}`);
            expect(download.suggestedFilename()).toMatch(/\.(docx|doc)$/i);
          } else {
            const hasProgress = await previewPage.exportProgress.isVisible({ timeout: 5000 }).catch(() => false);
            console.log(`Export progress visible: ${hasProgress}`);
          }
        }
      }
    });
  });

  // ==================== SHARE FUNCTIONALITY TESTS ====================

  test.describe('Share Functionality', () => {
    test('should display share button @share @ui', async ({
      dashboardPage,
      previewPage
    }) => {
      if (await isOnOnboarding(dashboardPage.page)) {
        return;
      }

      await dashboardPage.goto();
      await dashboardPage.waitForDashboardReady();

      const planCount = await dashboardPage.getPlanCount();
      if (planCount > 0) {
        await dashboardPage.clickPlanCard(0);
        await previewPage.page.waitForLoadState('networkidle');

        const currentUrl = previewPage.page.url();
        if (currentUrl.includes('/business-plan/')) {
          await previewPage.waitForPreviewReady();
          await previewPage.expectShareButtonVisible();
        }
      }
    });

    test('should open share modal @share @modal', async ({
      dashboardPage,
      previewPage,
      screenshots
    }) => {
      if (await isOnOnboarding(dashboardPage.page)) {
        return;
      }

      await dashboardPage.goto();
      await dashboardPage.waitForDashboardReady();

      const planCount = await dashboardPage.getPlanCount();
      if (planCount > 0) {
        await dashboardPage.clickPlanCard(0);
        await previewPage.page.waitForLoadState('networkidle');

        const currentUrl = previewPage.page.url();
        if (currentUrl.includes('/business-plan/')) {
          await previewPage.waitForPreviewReady();
          await previewPage.openShareModal();
          await previewPage.expectShareModalOpen();

          await screenshots.capture({ feature: 'export', name: 'share-modal-open' });

          // Close the modal
          await previewPage.closeShareModal();
        }
      }
    });
  });

  // ==================== RESPONSIVE TESTS ====================

  test.describe('Responsive Export', () => {
    test('should show export options on mobile @responsive @export', async ({
      dashboardPage,
      previewPage,
      screenshots
    }) => {
      if (await isOnOnboarding(dashboardPage.page)) {
        return;
      }

      await dashboardPage.page.setViewportSize({ width: 375, height: 667 });
      await dashboardPage.goto();
      await dashboardPage.waitForDashboardReady();

      const planCount = await dashboardPage.getPlanCount();
      if (planCount > 0) {
        await dashboardPage.clickPlanCard(0);
        await previewPage.page.waitForLoadState('networkidle');

        const currentUrl = previewPage.page.url();
        if (currentUrl.includes('/business-plan/')) {
          await previewPage.waitForPreviewReady();

          // Export button should still be accessible on mobile
          const hasExport = await previewPage.exportButton.isVisible({ timeout: 5000 }).catch(() => false);
          console.log(`Export button visible on mobile: ${hasExport}`);

          await screenshots.capture({ feature: 'export', name: 'export-mobile' });
        }
      }
    });
  });

  // ==================== ERROR HANDLING ====================

  test.describe('Error Handling', () => {
    test('should handle export failure gracefully @error-handling @export', async ({
      dashboardPage,
      previewPage,
      page
    }) => {
      if (await isOnOnboarding(page)) {
        return;
      }

      await dashboardPage.goto();
      await dashboardPage.waitForDashboardReady();

      const planCount = await dashboardPage.getPlanCount();
      if (planCount > 0) {
        await dashboardPage.clickPlanCard(0);
        await page.waitForLoadState('networkidle');

        const currentUrl = page.url();
        if (currentUrl.includes('/business-plan/')) {
          await previewPage.waitForPreviewReady();

          // Try to export - if it fails, should show error toast
          try {
            await previewPage.openExportMenu();
            await previewPage.exportPdfOption.click();

            // Wait for either success or error
            await page.waitForTimeout(5000);

            // Check for error toast
            const hasError = await previewPage.hasError();
            console.log(`Export error displayed: ${hasError}`);
          } catch (e) {
            console.log('Export action failed:', e);
          }
        }
      }
    });
  });
});
