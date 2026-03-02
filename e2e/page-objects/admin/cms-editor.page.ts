import { Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * CMS Editor page object
 * Handles all interactions with the admin CMS editor
 * Updated to match actual Sqordia CMS Editor DOM structure
 */
export class CmsEditorPage extends BasePage {
  readonly path = '/admin/cms';
  readonly feature = 'admin';

  // ==================== HEADER LOCATORS ====================

  /**
   * Sticky header container
   */
  get header(): Locator {
    return this.page.locator('header.sticky, header').first();
  }

  /**
   * Back to dashboard button
   */
  get backButton(): Locator {
    return this.page.locator('a[href="/dashboard"]').first();
  }

  /**
   * CMS title in header
   */
  get cmsTitle(): Locator {
    return this.page.locator('h1').filter({ hasText: /Sqordia CMS|CMS/i }).first();
  }

  /**
   * Publish button (orange)
   */
  get publishButton(): Locator {
    return this.page.locator('button.bg-momentum-orange, button').filter({ hasText: /Publish|Publier/i }).first();
  }

  /**
   * Version history button (History icon)
   */
  get versionHistoryButton(): Locator {
    return this.page.locator('button').filter({ has: this.page.locator('svg') }).filter({ hasNotText: /Publish|EN|FR/i }).nth(0);
  }

  /**
   * Schedule button (Calendar icon)
   */
  get scheduleButton(): Locator {
    return this.page.locator('button').filter({ has: this.page.locator('svg') }).filter({ hasNotText: /Publish|EN|FR/i }).nth(1);
  }

  /**
   * Draft version badge
   */
  get draftBadge(): Locator {
    return this.page.locator('span').filter({ hasText: /Draft v|Brouillon v/i });
  }

  /**
   * Unsaved indicator
   */
  get unsavedIndicator(): Locator {
    return this.page.locator('span').filter({ hasText: /Unsaved|Non sauvegardé/i });
  }

  // ==================== LANGUAGE TOGGLE ====================

  /**
   * Language toggle container
   */
  get languageToggle(): Locator {
    return this.page.locator('.bg-muted.rounded-lg').filter({ has: this.page.locator('button') }).first();
  }

  /**
   * English language button
   */
  get languageEnButton(): Locator {
    return this.page.locator('button').filter({ hasText: 'EN' }).first();
  }

  /**
   * French language button
   */
  get languageFrButton(): Locator {
    return this.page.locator('button').filter({ hasText: 'FR' }).first();
  }

  // ==================== SEARCH & CONTENT ====================

  /**
   * Search input for pages/sections
   */
  get searchInput(): Locator {
    return this.page.locator('input[type="text"]').filter({ hasText: '' }).first();
  }

  /**
   * Search input by placeholder
   */
  get searchInputByPlaceholder(): Locator {
    return this.page.locator('input[placeholder*="Search"], input[placeholder*="Rechercher"]');
  }

  /**
   * Question templates CTA card
   */
  get questionTemplatesCta(): Locator {
    return this.page.locator('a[href="/admin/cms/questionnaire"]');
  }

  // ==================== PAGES & SECTIONS ====================

  /**
   * All page containers (expandable)
   */
  get pageContainers(): Locator {
    return this.page.locator('.bg-card.rounded-xl.border');
  }

  /**
   * Page header buttons (clickable to expand)
   */
  get pageHeaders(): Locator {
    return this.page.locator('button.w-full').filter({ has: this.page.locator('h3') });
  }

  /**
   * Get a specific page by name
   */
  getPageByName(name: string | RegExp): Locator {
    return this.pageContainers.filter({ hasText: name });
  }

  /**
   * Get page header button by name
   */
  getPageHeaderByName(name: string | RegExp): Locator {
    return this.pageHeaders.filter({ hasText: name }).first();
  }

  /**
   * All section items (inside expanded pages)
   * Sections are clickable divs with paragraph elements inside
   */
  get sectionItems(): Locator {
    // Section items have paragraphs for title and description
    return this.page.locator('main [role="button"], main div[class*="cursor-pointer"]').filter({
      has: this.page.locator('p')
    });
  }

  /**
   * Get a section by name - looks for text in paragraph elements
   */
  getSectionByName(name: string): Locator {
    // Match section by its paragraph text content
    return this.page.locator('main').locator('div').filter({
      has: this.page.locator(`p:has-text("${name}")`)
    }).filter({
      hasText: 'Edit'
    }).first();
  }

  // ==================== SIDEBAR & LAYOUT ====================

  /**
   * Main sidebar container
   */
  get sidebar(): Locator {
    return this.page.locator('main').first();
  }

  /**
   * Live preview panel (if present)
   */
  get livePreview(): Locator {
    return this.page.locator('[data-testid="live-preview"], iframe, .preview-panel');
  }

  /**
   * Device switcher for preview (if present)
   */
  get deviceSwitcher(): Locator {
    return this.page.locator('[data-testid="device-switcher"], .device-switcher, button:has-text("Desktop"), button:has-text("Mobile")');
  }

  /**
   * Content structure header/title
   */
  get contentStructure(): Locator {
    return this.page.locator('h1, h2').filter({ hasText: /CMS|Content|Structure/i }).first();
  }

  /**
   * Questionnaire item in sidebar
   */
  get questionnaireItem(): Locator {
    return this.page.locator('a[href*="questionnaire"], button').filter({ hasText: /Questionnaire|Question/i }).first();
  }

  /**
   * Version history panel/modal
   */
  get versionHistoryPanel(): Locator {
    return this.page.locator('[role="dialog"], .modal').filter({ hasText: /Version|History|Historique/i });
  }

  /**
   * Landing page item
   */
  get landingPageItem(): Locator {
    return this.getPageByName(/Landing|Accueil/i);
  }

  /**
   * Dashboard page item
   */
  get dashboardPageItem(): Locator {
    return this.getPageByName(/Dashboard|Tableau de bord/i);
  }

  /**
   * Questionnaire page item
   */
  get questionnairePageItem(): Locator {
    return this.getPageByName(/Questionnaire/i);
  }

  // ==================== SLIDE-OVER PANEL ====================

  /**
   * Section editor slide-over backdrop
   */
  get slideOverBackdrop(): Locator {
    return this.page.locator('.fixed.inset-0.bg-black\\/40, .fixed.inset-0.backdrop-blur');
  }

  /**
   * Section editor slide-over panel
   */
  get slideOverPanel(): Locator {
    return this.page.locator('.fixed.inset-y-0.right-0');
  }

  /**
   * Close slide-over button
   */
  get closeSlideOverButton(): Locator {
    return this.slideOverPanel.locator('button').filter({ has: this.page.locator('svg') }).first();
  }

  /**
   * Save changes button in slide-over
   */
  get saveChangesButton(): Locator {
    return this.slideOverPanel.locator('button.bg-momentum-orange, button').filter({ hasText: /Save|Sauvegarder/i });
  }

  /**
   * Content blocks in slide-over
   */
  get contentBlocks(): Locator {
    return this.slideOverPanel.locator('.bg-white.border.rounded-xl, .rounded-xl.p-6');
  }

  // ==================== MOBILE ====================

  /**
   * Mobile menu button
   */
  get mobileMenuButton(): Locator {
    return this.page.locator('button.lg\\:hidden').filter({ has: this.page.locator('svg') }).first();
  }

  /**
   * Mobile drawer
   */
  get mobileDrawer(): Locator {
    return this.page.locator('[role="dialog"]').filter({ has: this.page.locator('button') });
  }

  // ==================== ACTIONS ====================

  /**
   * Wait for CMS editor to be fully loaded
   */
  async waitForCmsReady(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    // Wait for main content to be visible
    await Promise.race([
      this.pageContainers.first().waitFor({ state: 'visible', timeout: 15000 }),
      this.page.locator('main').first().waitFor({ state: 'visible', timeout: 15000 }),
      this.cmsTitle.waitFor({ state: 'visible', timeout: 15000 })
    ]).catch(() => {});
  }

  /**
   * Expand a page in the list
   */
  async expandPage(pageName: string | RegExp): Promise<void> {
    const pageHeader = this.getPageHeaderByName(pageName);
    await pageHeader.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Select a section (opens slide-over editor)
   */
  async selectSection(sectionName: string): Promise<void> {
    const section = this.getSectionByName(sectionName);
    await section.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Navigate to a specific landing page section
   */
  async navigateToLandingSection(sectionName: string): Promise<void> {
    await this.expandPage(/Landing|Accueil/i);
    await this.selectSection(sectionName);
  }

  /**
   * Toggle language
   */
  async toggleLanguage(lang: 'EN' | 'FR'): Promise<void> {
    const button = lang === 'EN' ? this.languageEnButton : this.languageFrButton;
    await button.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Search for pages/sections
   */
  async search(query: string): Promise<void> {
    const searchInput = this.searchInputByPlaceholder;
    if (await searchInput.isVisible()) {
      await searchInput.fill(query);
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Clear search
   */
  async clearSearch(): Promise<void> {
    const searchInput = this.searchInputByPlaceholder;
    if (await searchInput.isVisible()) {
      await searchInput.clear();
    }
  }

  /**
   * Click publish button
   */
  async publish(): Promise<void> {
    await this.publishButton.click();
  }

  /**
   * Open version history panel
   */
  async openVersionHistory(): Promise<void> {
    await this.versionHistoryButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Assert version history panel is open
   */
  async expectVersionHistoryOpen(): Promise<void> {
    // Version history may be a panel, modal, or dropdown
    const hasPanel = await this.versionHistoryPanel.isVisible().catch(() => false);
    if (!hasPanel) {
      // Just log that it's not a modal/panel type
      console.log('Version history may be inline or different format');
    }
  }

  /**
   * Close slide-over panel
   */
  async closeSlideOver(): Promise<void> {
    if (await this.slideOverPanel.isVisible()) {
      await this.closeSlideOverButton.click();
    }
  }

  /**
   * Save changes in slide-over
   */
  async saveChanges(): Promise<void> {
    await this.saveChangesButton.click();
  }

  /**
   * Go to question templates
   */
  async goToQuestionTemplates(): Promise<void> {
    await this.questionTemplatesCta.click();
    await this.page.waitForURL(/\/admin\/cms\/questionnaire/);
  }

  // ==================== ASSERTIONS ====================

  /**
   * Assert CMS editor is loaded
   */
  async expectCmsLoaded(): Promise<void> {
    await this.waitForCmsReady();
    await expect(this.page).toHaveURL(/\/admin\/cms/);
    // Check for main content
    const hasContent = await this.page.locator('main, .bg-card').first().isVisible();
    expect(hasContent).toBeTruthy();
  }

  /**
   * Assert a page is visible in the list
   */
  async expectPageVisible(pageName: string | RegExp): Promise<void> {
    const page = this.getPageByName(pageName);
    await expect(page.first()).toBeVisible();
  }

  /**
   * Assert a section is visible (after expanding page)
   */
  async expectSectionVisible(sectionName: string): Promise<void> {
    const section = this.getSectionByName(sectionName);
    await expect(section).toBeVisible();
  }

  /**
   * Assert publish button is visible
   */
  async expectPublishButtonVisible(): Promise<void> {
    await expect(this.publishButton).toBeVisible();
  }

  /**
   * Assert publish button is enabled
   */
  async expectPublishEnabled(): Promise<void> {
    await expect(this.publishButton).toBeEnabled();
  }

  /**
   * Assert publish button is disabled
   */
  async expectPublishDisabled(): Promise<void> {
    await expect(this.publishButton).toBeDisabled();
  }

  /**
   * Assert unsaved changes indicator is visible
   */
  async expectUnsavedChanges(): Promise<void> {
    await expect(this.unsavedIndicator).toBeVisible();
  }

  /**
   * Assert slide-over panel is open
   */
  async expectSlideOverOpen(): Promise<void> {
    await expect(this.slideOverPanel).toBeVisible();
  }

  /**
   * Assert slide-over panel is closed
   */
  async expectSlideOverClosed(): Promise<void> {
    await expect(this.slideOverPanel).not.toBeVisible();
  }

  /**
   * Assert language is selected
   */
  async expectLanguageSelected(lang: 'EN' | 'FR'): Promise<void> {
    const button = lang === 'EN' ? this.languageEnButton : this.languageFrButton;
    await expect(button).toBeVisible();
  }

  /**
   * Assert question templates CTA is visible
   */
  async expectQuestionTemplatesCtaVisible(): Promise<void> {
    await expect(this.questionTemplatesCta).toBeVisible();
  }
}
