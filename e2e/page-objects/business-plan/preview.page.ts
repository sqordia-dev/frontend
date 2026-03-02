import { Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Business Plan Preview page object
 * Handles viewing, editing, regenerating, and exporting business plans
 */
export class BusinessPlanPreviewPage extends BasePage {
  readonly path = '/business-plan';
  readonly feature = 'business-plan';

  // ==================== LOCATORS ====================

  /**
   * Plan title
   */
  get planTitle(): Locator {
    return this.page.locator('h1, [class*="title"]').first();
  }

  /**
   * Cover page section
   */
  get coverPage(): Locator {
    return this.page.locator('[class*="cover-page"], [data-testid="cover-page"]').first();
  }

  /**
   * Table of contents
   */
  get tableOfContents(): Locator {
    return this.page.locator('[class*="table-of-contents"], [class*="toc"]').first();
  }

  /**
   * Sidebar navigation
   */
  get sidebar(): Locator {
    return this.page.locator('aside, [class*="sidebar"]').first();
  }

  /**
   * Section navigation items in sidebar
   */
  get sectionNavItems(): Locator {
    return this.sidebar.locator('button, a').filter({ has: this.page.locator('span, svg') });
  }

  /**
   * Main content area
   */
  get contentArea(): Locator {
    return this.page.locator('main, [class*="content"], [class*="preview"]').first();
  }

  /**
   * Section cards
   */
  get sectionCards(): Locator {
    return this.page.locator('[class*="section-card"], [class*="SectionCard"], article').filter({ has: this.page.locator('h2, h3') });
  }

  /**
   * Export buttons container
   */
  get exportButtonsContainer(): Locator {
    return this.page.locator('.plan-export-buttons');
  }

  /**
   * Export button (generic - fallback)
   */
  get exportButton(): Locator {
    // Find any export button in the container
    return this.exportButtonsContainer.locator('button').first();
  }

  /**
   * Export to PDF button - uses aria-label
   */
  get exportPdfOption(): Locator {
    return this.page.locator('button[aria-label*="PDF"], button[aria-label*="pdf"]').first();
  }

  /**
   * Export to Word button - uses aria-label
   */
  get exportWordOption(): Locator {
    return this.page.locator('button[aria-label*="Word"], button[aria-label*="word"]').first();
  }

  /**
   * Share button - uses aria-label
   */
  get shareButton(): Locator {
    return this.page.locator('button[aria-label*="Share"], button[aria-label*="Partager"]').first();
  }

  /**
   * Export dropdown/menu - not used in current UI, kept for compatibility
   */
  get exportMenu(): Locator {
    return this.page.locator('[role="menu"], [class*="dropdown"], [class*="popover"]').filter({ hasText: /PDF|Word|DOCX/i }).first();
  }

  /**
   * Share modal
   */
  get shareModal(): Locator {
    return this.page.locator('[role="dialog"]').filter({ hasText: /Share|Partager|Link/i }).first();
  }

  /**
   * Edit section button (on hover)
   */
  get editSectionButton(): Locator {
    return this.page.locator('button').filter({ has: this.page.locator('svg') }).filter({ hasText: /Edit|Modifier/i }).first();
  }

  /**
   * Regenerate section button
   */
  get regenerateButton(): Locator {
    return this.page.locator('button').filter({ hasText: /Regenerate|Régénérer|AI/i }).first();
  }

  /**
   * Section editor modal
   */
  get sectionEditorModal(): Locator {
    return this.page.locator('[role="dialog"]').filter({ has: this.page.locator('textarea, [contenteditable="true"], .ProseMirror') }).first();
  }

  /**
   * Save button in editor
   */
  get saveButton(): Locator {
    return this.page.locator('button').filter({ hasText: /Save|Enregistrer/i }).first();
  }

  /**
   * Cancel button in editor
   */
  get cancelButton(): Locator {
    return this.page.locator('button').filter({ hasText: /Cancel|Annuler/i }).first();
  }

  /**
   * Back to dashboard link
   */
  get backToDashboard(): Locator {
    return this.page.locator('a, button').filter({ hasText: /Dashboard|Tableau|Back/i }).first();
  }

  /**
   * Loading overlay
   */
  get loadingOverlay(): Locator {
    return this.page.locator('[class*="loading"], [class*="spinner"], .animate-spin').first();
  }

  /**
   * Export progress indicator
   */
  get exportProgress(): Locator {
    return this.page.locator('[class*="progress"], [class*="loading"]').filter({ hasText: /Export|Generating|Préparation/i }).first();
  }

  /**
   * Cover page edit button
   */
  get editCoverPageButton(): Locator {
    return this.coverPage.locator('button').filter({ has: this.page.locator('svg') }).first();
  }

  /**
   * TOC style selector
   */
  get tocStyleButton(): Locator {
    return this.page.locator('button').filter({ hasText: /Style|TOC/i }).first();
  }

  // ==================== ACTIONS ====================

  /**
   * Navigate to preview for a specific plan
   */
  async gotoForPlan(planId: string): Promise<void> {
    await this.page.goto(`/business-plan/${planId}`);
    await this.waitForPreviewReady();
  }

  /**
   * Wait for preview to be ready
   */
  async waitForPreviewReady(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    // Wait for content to load
    await Promise.race([
      this.sectionCards.first().waitFor({ state: 'visible', timeout: 30000 }),
      this.planTitle.waitFor({ state: 'visible', timeout: 30000 }),
    ]).catch(() => {});
    await this.page.waitForTimeout(500);
  }

  /**
   * Click on a section in the sidebar
   */
  async clickSection(sectionIndex: number): Promise<void> {
    await this.sectionNavItems.nth(sectionIndex).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Click on a section by name
   */
  async clickSectionByName(name: string | RegExp): Promise<void> {
    const item = this.sectionNavItems.filter({ hasText: name }).first();
    await item.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Open export menu - no-op in current UI (buttons are directly visible)
   */
  async openExportMenu(): Promise<void> {
    // In current UI, export buttons are directly visible, no menu to open
    await this.page.waitForTimeout(300);
  }

  /**
   * Export to PDF - direct button click
   */
  async exportToPdf(): Promise<void> {
    await this.exportPdfOption.click();
  }

  /**
   * Export to Word - direct button click
   */
  async exportToWord(): Promise<void> {
    await this.exportWordOption.click();
  }

  /**
   * Check if export buttons are visible
   */
  async areExportButtonsVisible(): Promise<boolean> {
    const pdfVisible = await this.exportPdfOption.isVisible({ timeout: 3000 }).catch(() => false);
    const wordVisible = await this.exportWordOption.isVisible({ timeout: 3000 }).catch(() => false);
    return pdfVisible || wordVisible;
  }

  /**
   * Wait for export to complete
   */
  async waitForExportComplete(): Promise<void> {
    // Wait for progress indicator to appear and then disappear
    const hasProgress = await this.exportProgress.isVisible({ timeout: 5000 }).catch(() => false);
    if (hasProgress) {
      await this.exportProgress.waitFor({ state: 'hidden', timeout: 60000 });
    }
    // Also wait for any download to start
    await this.page.waitForTimeout(2000);
  }

  /**
   * Open share modal
   */
  async openShareModal(): Promise<void> {
    await this.shareButton.click();
    await this.shareModal.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Close share modal
   */
  async closeShareModal(): Promise<void> {
    const closeButton = this.shareModal.locator('button').filter({ has: this.page.locator('svg[class*="close"], svg[class*="x"]') }).first();
    await closeButton.click();
  }

  /**
   * Edit a section by clicking edit on hover
   */
  async editSection(sectionIndex: number): Promise<void> {
    const section = this.sectionCards.nth(sectionIndex);
    await section.hover();
    await this.page.waitForTimeout(300);
    const editBtn = section.locator('button').filter({ has: this.page.locator('svg') }).first();
    await editBtn.click();
    await this.sectionEditorModal.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Save section edits
   */
  async saveSectionEdits(): Promise<void> {
    await this.saveButton.click();
    await this.sectionEditorModal.waitFor({ state: 'hidden', timeout: 10000 });
  }

  /**
   * Cancel section edits
   */
  async cancelSectionEdits(): Promise<void> {
    await this.cancelButton.click();
    await this.sectionEditorModal.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Regenerate a section
   */
  async regenerateSection(sectionIndex: number): Promise<void> {
    const section = this.sectionCards.nth(sectionIndex);
    await section.hover();
    const regenBtn = section.locator('button').filter({ hasText: /Regenerate|Régénérer/i }).first();
    if (await regenBtn.isVisible()) {
      await regenBtn.click();
    }
  }

  /**
   * Get section count
   */
  async getSectionCount(): Promise<number> {
    return this.sectionCards.count();
  }

  /**
   * Get section titles
   */
  async getSectionTitles(): Promise<string[]> {
    const titles: string[] = [];
    const cards = this.sectionCards;
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const title = await cards.nth(i).locator('h2, h3').first().textContent();
      if (title) titles.push(title.trim());
    }
    return titles;
  }

  /**
   * Check if export buttons are visible (no menu in current UI)
   */
  async isExportMenuOpen(): Promise<boolean> {
    // In current UI, buttons are always visible when the page is loaded
    return this.areExportButtonsVisible();
  }

  // ==================== ASSERTIONS ====================

  /**
   * Assert preview is loaded
   */
  async expectPreviewLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/business-plan\//);
    // Wait for any content to be visible
    const hasContent = await Promise.race([
      this.contentArea.waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
      this.planTitle.waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
      this.page.locator('h1, h2').first().waitFor({ state: 'visible', timeout: 10000 }).then(() => true),
    ]).catch(() => false);
    expect(hasContent).toBeTruthy();
  }

  /**
   * Assert sections are visible
   */
  async expectSectionsVisible(): Promise<void> {
    const count = await this.getSectionCount();
    expect(count).toBeGreaterThan(0);
  }

  /**
   * Assert specific section count
   */
  async expectSectionCount(count: number): Promise<void> {
    const actual = await this.getSectionCount();
    expect(actual).toBe(count);
  }

  /**
   * Assert export buttons are visible (PDF or Word)
   */
  async expectExportButtonVisible(): Promise<void> {
    const isVisible = await this.areExportButtonsVisible();
    expect(isVisible).toBeTruthy();
  }

  /**
   * Assert share button is visible
   */
  async expectShareButtonVisible(): Promise<void> {
    const isVisible = await this.shareButton.isVisible({ timeout: 5000 }).catch(() => false);
    expect(isVisible).toBeTruthy();
  }

  /**
   * Assert cover page is visible
   */
  async expectCoverPageVisible(): Promise<void> {
    await expect(this.coverPage).toBeVisible();
  }

  /**
   * Assert sidebar is visible
   */
  async expectSidebarVisible(): Promise<void> {
    await expect(this.sidebar).toBeVisible();
  }

  /**
   * Assert section editor is open
   */
  async expectEditorOpen(): Promise<void> {
    await expect(this.sectionEditorModal).toBeVisible();
  }

  /**
   * Assert section editor is closed
   */
  async expectEditorClosed(): Promise<void> {
    await expect(this.sectionEditorModal).not.toBeVisible();
  }

  /**
   * Assert share modal is open
   */
  async expectShareModalOpen(): Promise<void> {
    await expect(this.shareModal).toBeVisible();
  }
}
