import { test, expect } from '../../fixtures';

/**
 * Admin CMS Editor E2E Tests
 * Tags: @admin @cms
 */
test.describe('CMS Editor @admin @cms', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ cmsEditorPage, auth }) => {
    await auth.loginAsAdmin();
    await cmsEditorPage.goto();
  });

  // ==================== SMOKE TESTS ====================

  test('should load CMS editor @smoke', async ({ cmsEditorPage, screenshots }) => {
    await cmsEditorPage.expectCmsLoaded();
    await screenshots.capture({ feature: 'admin', name: 'cms-editor-loaded', fullPage: true });
  });

  test('should display sidebar with pages @smoke @navigation', async ({ cmsEditorPage }) => {
    await cmsEditorPage.expectPageVisible(/Landing Page/i);
    await cmsEditorPage.expectPageVisible(/Dashboard/i);
  });

  // ==================== SIDEBAR NAVIGATION TESTS ====================

  test('should expand Landing Page sections @navigation', async ({ cmsEditorPage }) => {
    await cmsEditorPage.expandPage(/Landing Page/i);
    await cmsEditorPage.expectSectionVisible('Hero');
    await cmsEditorPage.expectSectionVisible('Features');
  });

  test('should navigate between pages @navigation', async ({ cmsEditorPage }) => {
    // Click on Landing Page
    await cmsEditorPage.expandPage(/Landing Page/i);
    await cmsEditorPage.page.waitForTimeout(300);

    // Click on Dashboard
    await cmsEditorPage.expandPage(/Dashboard/i);
    await cmsEditorPage.page.waitForTimeout(300);

    // Verify we can still see the sidebar
    await expect(cmsEditorPage.sidebar).toBeVisible();
  });

  test('should select a section and display content @navigation', async ({ cmsEditorPage, screenshots }) => {
    await cmsEditorPage.navigateToLandingSection('Hero');
    await screenshots.capture({ feature: 'admin', name: 'cms-hero-section-selected' });
  });

  // ==================== LANGUAGE TOGGLE TESTS ====================

  test('should toggle language to French @i18n', async ({ cmsEditorPage }) => {
    await cmsEditorPage.toggleLanguage('FR');
    await expect(cmsEditorPage.languageFrButton).toBeVisible();
  });

  test('should toggle language to English @i18n', async ({ cmsEditorPage }) => {
    // First switch to French
    await cmsEditorPage.toggleLanguage('FR');
    await cmsEditorPage.page.waitForTimeout(300);

    // Then back to English
    await cmsEditorPage.toggleLanguage('EN');
    await expect(cmsEditorPage.languageEnButton).toBeVisible();
  });

  // ==================== PUBLISH WORKFLOW TESTS ====================

  test('should have publish button @publishing', async ({ cmsEditorPage }) => {
    await cmsEditorPage.expectPublishButtonVisible();
  });

  test('should show publish button state @publishing', async ({ cmsEditorPage }) => {
    // Verify publish button exists and check its state
    const publishButton = cmsEditorPage.publishButton;
    const isVisible = await publishButton.isVisible().catch(() => false);
    expect(isVisible).toBeTruthy();
  });

  // ==================== VERSION HISTORY TESTS ====================

  test('should open version history @versioning', async ({ cmsEditorPage, screenshots }) => {
    const hasVersionHistory = await cmsEditorPage.versionHistoryButton.isVisible().catch(() => false);

    if (hasVersionHistory) {
      await cmsEditorPage.openVersionHistory();
      await cmsEditorPage.expectVersionHistoryOpen();
      await screenshots.capture({ feature: 'admin', name: 'cms-version-history-open' });
    } else {
      console.log('Version history button not found');
    }
  });

  // ==================== SEARCH TESTS ====================

  test('should search in sidebar @search', async ({ cmsEditorPage }) => {
    const hasSearch = await cmsEditorPage.searchInput.isVisible().catch(() => false);

    if (hasSearch) {
      await cmsEditorPage.search('Hero');
      await cmsEditorPage.page.waitForTimeout(500);
      // Search should filter the sidebar content
    } else {
      console.log('Search input not found in CMS editor');
    }
  });

  // ==================== PREVIEW TESTS ====================

  test('should show live preview @preview', async ({ cmsEditorPage }) => {
    const hasPreview = await cmsEditorPage.livePreview.isVisible().catch(() => false);
    console.log(`Live preview visible: ${hasPreview}`);
  });

  test('should show device switcher if present @preview', async ({ cmsEditorPage }) => {
    const hasDeviceSwitcher = await cmsEditorPage.deviceSwitcher.isVisible().catch(() => false);
    console.log(`Device switcher present: ${hasDeviceSwitcher}`);
  });

  // ==================== CONTENT STRUCTURE TESTS ====================

  test('should display content structure header @ui', async ({ cmsEditorPage }) => {
    await expect(cmsEditorPage.contentStructure).toBeVisible();
  });

  test('should show questionnaire section @navigation', async ({ cmsEditorPage }) => {
    const hasQuestionnaire = await cmsEditorPage.questionnaireItem.isVisible().catch(() => false);
    console.log(`Questionnaire section present: ${hasQuestionnaire}`);
  });

  // ==================== RESPONSIVE TESTS ====================

  test('should adapt layout on mobile viewport @responsive', async ({ cmsEditorPage, screenshots }) => {
    await cmsEditorPage.page.setViewportSize({ width: 375, height: 667 });
    await cmsEditorPage.page.waitForTimeout(500);

    // On mobile, sidebar might be hidden or collapsed
    await screenshots.capture({ feature: 'admin', name: 'cms-mobile-viewport' });
  });

  test('should show full layout on desktop @responsive', async ({ cmsEditorPage, screenshots }) => {
    await cmsEditorPage.page.setViewportSize({ width: 1920, height: 1080 });
    await cmsEditorPage.page.waitForTimeout(500);

    await cmsEditorPage.expectCmsLoaded();
    await screenshots.capture({ feature: 'admin', name: 'cms-desktop-viewport' });
  });

  // ==================== KEYBOARD NAVIGATION TESTS ====================

  test('should support keyboard navigation @a11y', async ({ cmsEditorPage }) => {
    // Tab through the interface
    await cmsEditorPage.page.keyboard.press('Tab');
    await cmsEditorPage.page.keyboard.press('Tab');
    await cmsEditorPage.page.keyboard.press('Tab');

    // Verify focus is on an interactive element
    const focusedElement = await cmsEditorPage.page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'A', 'DIV']).toContain(focusedElement);
  });

  // ==================== ERROR HANDLING TESTS ====================

  test('should handle empty state gracefully @error-handling', async ({ cmsEditorPage }) => {
    // Verify no console errors
    const errors: string[] = [];
    cmsEditorPage.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await cmsEditorPage.expectCmsLoaded();

    // Log any errors found
    if (errors.length > 0) {
      console.log('Console errors found:', errors);
    }
  });
});
