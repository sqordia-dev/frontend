import { Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Dashboard page object
 * Handles all interactions with the main dashboard
 */
export class DashboardPage extends BasePage {
  readonly path = '/dashboard';
  readonly feature = 'dashboard';

  // ==================== LOCATORS ====================

  get createPlanButton(): Locator {
    return this.page.locator('a[href="/create-plan"], button:has-text("Create"), [data-testid="create-plan-button"]').first();
  }

  get planCards(): Locator {
    return this.page.locator('[data-testid="plan-card"], .plan-card, [data-testid="business-plan-card"]');
  }

  get emptyState(): Locator {
    return this.page.locator('[data-testid="empty-state"], .empty-state');
  }

  get searchInput(): Locator {
    return this.page.locator('input[placeholder*="search" i], input[placeholder*="Search" i], [data-testid="search-input"]');
  }

  get filterDropdown(): Locator {
    return this.page.locator('[data-testid="filter-dropdown"], button:has-text("Filter")');
  }

  get sortDropdown(): Locator {
    return this.page.locator('[data-testid="sort-dropdown"], button:has-text("Sort")');
  }

  get statsSection(): Locator {
    return this.page.locator('[data-testid="stats"], .stats-section, .stats-cards');
  }

  get statsCards(): Locator {
    return this.page.locator('[data-testid="stats-card"], .stats-card');
  }

  get welcomeMessage(): Locator {
    return this.page.locator('h1, h2, [data-testid="welcome-message"]').first();
  }

  get sidebarNavigation(): Locator {
    return this.page.locator('aside nav, [data-testid="sidebar"]');
  }

  get userMenu(): Locator {
    return this.page.locator('[data-testid="user-menu"], [data-testid="profile-menu"]');
  }

  get loadingSpinner(): Locator {
    return this.page.locator('[data-testid="loading"], .loading, .spinner');
  }

  // ==================== ACTIONS ====================

  /**
   * Click the create plan button
   */
  async clickCreatePlan(): Promise<void> {
    await this.createPlanButton.click();
    await this.page.waitForURL('/create-plan');
  }

  /**
   * Search for plans
   */
  async searchPlans(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500); // Debounce wait
  }

  /**
   * Clear search
   */
  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
    await this.page.waitForTimeout(500);
  }

  /**
   * Click on a specific plan card by index
   */
  async clickPlanCard(index: number = 0): Promise<void> {
    await this.planCards.nth(index).click();
  }

  /**
   * Click on a plan card by name
   */
  async clickPlanByName(name: string): Promise<void> {
    const card = this.planCards.filter({ hasText: name }).first();
    await card.click();
  }

  /**
   * Get the count of plan cards
   */
  async getPlanCount(): Promise<number> {
    return this.planCards.count();
  }

  /**
   * Get all plan card titles
   */
  async getPlanTitles(): Promise<string[]> {
    const titles: string[] = [];
    const count = await this.planCards.count();
    for (let i = 0; i < count; i++) {
      const title = await this.planCards.nth(i).locator('h3, h4, .title').textContent();
      if (title) titles.push(title.trim());
    }
    return titles;
  }

  /**
   * Open filter dropdown
   */
  async openFilter(): Promise<void> {
    await this.filterDropdown.click();
  }

  /**
   * Open sort dropdown
   */
  async openSort(): Promise<void> {
    await this.sortDropdown.click();
  }

  /**
   * Wait for dashboard to be fully loaded
   */
  async waitForDashboardReady(): Promise<void> {
    await this.waitForPageLoad();
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }

  /**
   * Delete a plan by clicking its delete button
   */
  async deletePlan(index: number = 0): Promise<void> {
    const planCard = this.planCards.nth(index);
    const deleteButton = planCard.locator('button:has-text("Delete"), [data-testid="delete-button"]');
    await deleteButton.click();

    // Confirm deletion in modal
    const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Delete"), [data-testid="confirm-delete"]');
    await confirmButton.click();
  }

  /**
   * Duplicate a plan
   */
  async duplicatePlan(index: number = 0): Promise<void> {
    const planCard = this.planCards.nth(index);
    const duplicateButton = planCard.locator('button:has-text("Duplicate"), [data-testid="duplicate-button"]');
    await duplicateButton.click();
  }

  /**
   * Open user menu
   */
  async openUserMenu(): Promise<void> {
    await this.userMenu.click();
  }

  // ==================== ASSERTIONS ====================

  /**
   * Assert dashboard is loaded
   */
  async expectDashboardLoaded(): Promise<void> {
    await this.waitForDashboardReady();
    await expect(this.page).toHaveURL(/\/dashboard/);
    await expect(this.mainContent).toBeVisible();
  }

  /**
   * Assert plans are visible
   */
  async expectPlansVisible(): Promise<void> {
    const count = await this.getPlanCount();
    expect(count).toBeGreaterThan(0);
  }

  /**
   * Assert empty state is shown
   */
  async expectEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
  }

  /**
   * Assert create plan button is visible
   */
  async expectCreateButtonVisible(): Promise<void> {
    await expect(this.createPlanButton).toBeVisible();
  }

  /**
   * Assert search input is visible
   */
  async expectSearchVisible(): Promise<void> {
    await expect(this.searchInput).toBeVisible();
  }

  /**
   * Assert stats section is visible
   */
  async expectStatsVisible(): Promise<void> {
    await expect(this.statsSection).toBeVisible();
  }

  /**
   * Assert sidebar navigation is visible
   */
  async expectSidebarVisible(): Promise<void> {
    await expect(this.sidebarNavigation).toBeVisible();
  }

  /**
   * Assert plan count matches expected
   */
  async expectPlanCount(count: number): Promise<void> {
    await expect(this.planCards).toHaveCount(count);
  }

  /**
   * Assert plan with specific title exists
   */
  async expectPlanWithTitle(title: string): Promise<void> {
    const card = this.planCards.filter({ hasText: title });
    await expect(card).toBeVisible();
  }
}
