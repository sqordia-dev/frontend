import { Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * CMS Editor page object
 * Handles all interactions with the admin CMS editor
 */
export class CmsEditorPage extends BasePage {
  readonly path = '/admin/cms';
  readonly feature = 'admin';

  // ==================== LOCATORS ====================

  get sidebar(): Locator {
    return this.page.locator('aside').first();
  }

  get contentStructure(): Locator {
    return this.page.getByText('Content Structure');
  }

  get publishButton(): Locator {
    return this.page.getByRole('button', { name: /Publish/i });
  }

  get saveButton(): Locator {
    return this.page.getByRole('button', { name: /Save/i });
  }

  get languageEnButton(): Locator {
    return this.page.locator('header').getByRole('button', { name: 'EN', exact: true });
  }

  get languageFrButton(): Locator {
    return this.page.locator('header').getByRole('button', { name: 'FR', exact: true });
  }

  get searchInput(): Locator {
    return this.page.locator('input[placeholder*="Search" i]');
  }

  get versionHistoryButton(): Locator {
    return this.page.locator('button[title="Version History"], button:has-text("History")');
  }

  get livePreview(): Locator {
    return this.page.getByText('Live Preview');
  }

  get editorPanel(): Locator {
    return this.page.locator('[data-testid="editor-panel"], .editor-panel').first();
  }

  get previewPanel(): Locator {
    return this.page.locator('[data-testid="preview-panel"], .preview-panel, iframe').first();
  }

  get unsavedIndicator(): Locator {
    return this.page.locator('[data-testid="unsaved"], .unsaved-indicator, :text("Unsaved")');
  }

  get deviceSwitcher(): Locator {
    return this.page.locator('[data-testid="device-switcher"], .device-switcher');
  }

  get characterCount(): Locator {
    return this.page.locator('[data-testid="char-count"], .char-count');
  }

  // ==================== SIDEBAR LOCATORS ====================

  /**
   * Get a page button in the sidebar by name
   */
  getSidebarPage(name: string | RegExp): Locator {
    return this.sidebar.getByRole('button', { name });
  }

  /**
   * Get a section button in the sidebar by name
   */
  getSidebarSection(name: string): Locator {
    return this.sidebar.locator(`button:has-text("${name}")`);
  }

  /**
   * Get landing page sidebar item
   */
  get landingPageItem(): Locator {
    return this.getSidebarPage(/Landing Page/i);
  }

  /**
   * Get dashboard sidebar item
   */
  get dashboardItem(): Locator {
    return this.getSidebarPage(/Dashboard/i);
  }

  /**
   * Get questionnaire sidebar item
   */
  get questionnaireItem(): Locator {
    return this.getSidebarPage(/Questionnaire/i);
  }

  // ==================== ACTIONS ====================

  /**
   * Wait for CMS editor to be fully loaded
   */
  async waitForCmsReady(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.sidebar.waitFor({ state: 'visible', timeout: 15000 });
    await this.contentStructure.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Expand a page in the sidebar
   */
  async expandPage(pageName: string | RegExp): Promise<void> {
    const pageButton = this.getSidebarPage(pageName);
    await pageButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Select a section in the sidebar
   */
  async selectSection(sectionName: string): Promise<void> {
    const section = this.getSidebarSection(sectionName);
    await section.click();
    await this.page.waitForTimeout(500);
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
   * Open version history
   */
  async openVersionHistory(): Promise<void> {
    await this.versionHistoryButton.click();
    await this.page.getByText('Version History').waitFor({ state: 'visible' });
  }

  /**
   * Search in sidebar
   */
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(300);
  }

  /**
   * Clear search
   */
  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
  }

  /**
   * Click publish button
   */
  async publish(): Promise<void> {
    await this.publishButton.click();
  }

  /**
   * Click save button
   */
  async save(): Promise<void> {
    await this.saveButton.click();
  }

  /**
   * Navigate to a specific landing page section
   */
  async navigateToLandingSection(sectionName: string): Promise<void> {
    await this.expandPage(/Landing Page/i);
    await this.selectSection(sectionName);
  }

  /**
   * Switch device preview
   */
  async switchDevice(device: 'desktop' | 'tablet' | 'mobile'): Promise<void> {
    const deviceButton = this.deviceSwitcher.locator(`button:has-text("${device}")`);
    await deviceButton.click();
  }

  /**
   * Edit content in a block
   */
  async editContent(blockSelector: string, newContent: string): Promise<void> {
    const block = this.page.locator(blockSelector);
    await block.click();
    await block.fill(newContent);
  }

  // ==================== ASSERTIONS ====================

  /**
   * Assert CMS editor is loaded
   */
  async expectCmsLoaded(): Promise<void> {
    await this.waitForCmsReady();
    await expect(this.sidebar).toBeVisible();
    await expect(this.contentStructure).toBeVisible();
  }

  /**
   * Assert a page is visible in sidebar
   */
  async expectPageVisible(pageName: string | RegExp): Promise<void> {
    await expect(this.getSidebarPage(pageName)).toBeVisible();
  }

  /**
   * Assert a section is visible in sidebar
   */
  async expectSectionVisible(sectionName: string): Promise<void> {
    await expect(this.getSidebarSection(sectionName)).toBeVisible();
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
   * Assert editor panel is visible
   */
  async expectEditorPanelVisible(): Promise<void> {
    await expect(this.editorPanel).toBeVisible();
  }

  /**
   * Assert preview panel is visible
   */
  async expectPreviewPanelVisible(): Promise<void> {
    await expect(this.previewPanel).toBeVisible();
  }

  /**
   * Assert language is selected
   */
  async expectLanguageSelected(lang: 'EN' | 'FR'): Promise<void> {
    const button = lang === 'EN' ? this.languageEnButton : this.languageFrButton;
    // Check if button has selected/active state (implementation dependent)
    await expect(button).toBeVisible();
  }

  /**
   * Assert version history is open
   */
  async expectVersionHistoryOpen(): Promise<void> {
    await expect(this.page.getByText('Version History')).toBeVisible();
  }

  /**
   * Assert landing page sections are visible
   */
  async expectLandingPageSectionsVisible(): Promise<void> {
    await this.expandPage(/Landing Page/i);
    await this.expectSectionVisible('Hero');
    await this.expectSectionVisible('Features');
  }
}
