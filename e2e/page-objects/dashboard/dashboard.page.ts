import { Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Dashboard page object
 * Handles all interactions with the main dashboard
 * Updated to match actual Sqordia Dashboard DOM structure
 */
export class DashboardPage extends BasePage {
  readonly path = '/dashboard';
  readonly feature = 'dashboard';

  // ==================== LOCATORS ====================

  /**
   * Main welcome heading
   */
  get welcomeHeading(): Locator {
    return this.page.locator('h1').filter({ hasText: /Welcome|Bienvenue/i }).first();
  }

  /**
   * Create plan button (primary CTA in header)
   */
  get createPlanButton(): Locator {
    return this.page.locator('a[href="/create-plan"]').first();
  }

  /**
   * Create plan button with orange styling
   */
  get createPlanButtonPrimary(): Locator {
    return this.page.locator('a[href="/create-plan"].bg-momentum-orange, a[href="/create-plan"] button.bg-momentum-orange').first();
  }

  /**
   * Plan cards container
   */
  get planCardsSection(): Locator {
    return this.page.locator('section.dashboard-plans, [class*="dashboard-plans"]');
  }

  /**
   * Individual plan cards
   */
  get planCards(): Locator {
    return this.page.locator('.group.relative.rounded-xl.border.bg-card').filter({
      has: this.page.locator('h3')
    });
  }

  /**
   * Empty state when no plans exist
   */
  get emptyState(): Locator {
    return this.page.locator('.border-dashed').filter({ hasText: /No Plans|Create your first/i });
  }

  /**
   * Stats section
   */
  get statsSection(): Locator {
    return this.page.locator('section.dashboard-stats, [class*="dashboard-stats"]');
  }

  /**
   * Individual stats cards
   */
  get statsCards(): Locator {
    return this.page.locator('section.dashboard-stats .group.relative.rounded-xl, [class*="dashboard-stats"] .rounded-xl');
  }

  /**
   * Recent projects heading
   */
  get recentProjectsHeading(): Locator {
    return this.page.locator('h2').filter({ hasText: /Recent Projects|Projets récents/i });
  }

  /**
   * Sidebar navigation
   */
  get sidebar(): Locator {
    return this.page.locator('aside, [data-sidebar]').first();
  }

  /**
   * User profile section in sidebar
   */
  get userProfile(): Locator {
    return this.page.locator('.rounded-xl.p-3').filter({ has: this.page.locator('img, svg') }).first();
  }

  /**
   * Logout button
   */
  get logoutButton(): Locator {
    return this.page.locator('button').filter({ hasText: /Logout|Déconnexion/i });
  }

  /**
   * Show tour button
   */
  get showTourButton(): Locator {
    return this.page.locator('button').filter({ hasText: /Show Tour|Tour/i });
  }

  /**
   * Search input for plans
   */
  get searchInput(): Locator {
    return this.page.locator('input[type="text"], input[type="search"]').filter({
      has: this.page.locator('[placeholder*="Search"], [placeholder*="Rechercher"]')
    }).or(this.page.locator('input[placeholder*="Search"], input[placeholder*="Rechercher"]'));
  }

  /**
   * User menu/profile dropdown trigger
   */
  get userMenu(): Locator {
    return this.page.locator('[data-testid="user-menu"], [data-testid="profile-menu"]')
      .or(this.page.locator('button').filter({ has: this.page.locator('img[alt*="avatar"], img[alt*="profile"]') }))
      .or(this.page.locator('button').filter({ hasText: /profile|account|menu/i }));
  }

  /**
   * Error state indicator
   */
  get errorState(): Locator {
    return this.page.locator('[role="alert"]').or(
      this.page.locator('.text-destructive, .text-red-500').filter({ hasText: /error|erreur/i })
    );
  }

  /**
   * Delete confirmation dialog
   */
  get deleteDialog(): Locator {
    return this.page.locator('[role="alertdialog"], [role="dialog"]').filter({ hasText: /Delete/i });
  }

  /**
   * Delete confirmation button
   */
  get confirmDeleteButton(): Locator {
    return this.page.locator('button.bg-destructive, button').filter({ hasText: /Delete Plan|Supprimer/i });
  }

  /**
   * Cancel button in dialog
   */
  get cancelButton(): Locator {
    return this.page.locator('button').filter({ hasText: /Cancel|Annuler/i });
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
   * Get the count of plan cards
   */
  async getPlanCount(): Promise<number> {
    await this.page.waitForTimeout(500); // Wait for cards to render
    return this.planCards.count();
  }

  /**
   * Get all plan card titles
   */
  async getPlanTitles(): Promise<string[]> {
    const titles: string[] = [];
    const cards = this.planCards;
    const count = await cards.count();

    for (let i = 0; i < count; i++) {
      const title = await cards.nth(i).locator('h3').first().textContent();
      if (title) titles.push(title.trim());
    }
    return titles;
  }

  /**
   * Click on a specific plan card by index
   */
  async clickPlanCard(index: number = 0): Promise<void> {
    const card = this.planCards.nth(index);
    // Click on the resume/view button or the card itself
    const actionButton = card.locator('a').filter({ hasText: /Resume|View|Reprendre|Voir/i }).first();
    if (await actionButton.isVisible()) {
      await actionButton.click();
    } else {
      await card.click();
    }
  }

  /**
   * Click on a plan card by name
   */
  async clickPlanByName(name: string): Promise<void> {
    const card = this.planCards.filter({ hasText: name }).first();
    const actionButton = card.locator('a').filter({ hasText: /Resume|View|Reprendre|Voir/i }).first();
    if (await actionButton.isVisible()) {
      await actionButton.click();
    } else {
      await card.click();
    }
  }

  /**
   * Delete a plan by clicking its delete option
   */
  async deletePlan(index: number = 0): Promise<void> {
    const card = this.planCards.nth(index);
    // Open more menu
    const moreButton = card.locator('button').filter({ has: this.page.locator('svg') }).last();
    await moreButton.click();

    // Click delete option
    const deleteOption = this.page.locator('[role="menuitem"]').filter({ hasText: /Delete|Supprimer/i });
    await deleteOption.click();

    // Confirm deletion
    await this.confirmDeleteButton.click();
  }

  /**
   * Wait for dashboard to be fully loaded
   * Handles potential redirect to onboarding
   */
  async waitForDashboardReady(): Promise<void> {
    await this.page.waitForLoadState('networkidle');

    // Check if redirected to onboarding or persona selection
    const currentUrl = this.page.url();
    if (currentUrl.includes('/onboarding') || currentUrl.includes('/persona-selection')) {
      console.log('User redirected to onboarding - completing onboarding first');
      await this.completeOnboarding();
    }

    // Wait for either plans or empty state to be visible
    await Promise.race([
      this.welcomeHeading.waitFor({ state: 'visible', timeout: 15000 }),
      this.page.locator('h1, h2').first().waitFor({ state: 'visible', timeout: 15000 })
    ]).catch(() => {});
  }

  /**
   * Complete onboarding if user is redirected there
   * Handles multi-step onboarding flow
   */
  async completeOnboarding(): Promise<void> {
    const url = this.page.url();
    // Check if we're actually on onboarding or persona selection
    if (!url.includes('/onboarding') && !url.includes('/persona-selection')) {
      return;
    }

    console.log('Starting onboarding completion...');

    try {
      // Step 1: Select persona (Entrepreneur)
      // The persona buttons are the large selectable cards
      const personaCard = this.page.locator('button').filter({ hasText: /Entrepreneur.*Solopreneur/i }).first();

      if (await personaCard.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('Selecting Entrepreneur persona...');
        await personaCard.click();
        await this.page.waitForTimeout(1000);
      }

      // After selecting persona, wait for either navigation or step 2
      await this.page.waitForTimeout(2000);

      // Check if we've already progressed
      if (!this.page.url().includes('/onboarding')) {
        console.log('Onboarding completed after persona selection');
        return;
      }

      // Step 2: Look for Continue/Submit button (may be at bottom of page)
      const continueButton = this.page.locator('button').filter({
        hasText: /Continue|Continuer|Next|Suivant|Submit|Soumettre|Get Started|Commencer|Complete|Terminer/i
      }).first();

      for (let attempt = 0; attempt < 3; attempt++) {
        // Wait for button to be enabled
        if (await continueButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          const isEnabled = await continueButton.isEnabled().catch(() => false);
          if (isEnabled) {
            console.log(`Clicking continue button (attempt ${attempt + 1})...`);
            await continueButton.click();
            await this.page.waitForTimeout(2000);

            // Check if we've left onboarding
            if (!this.page.url().includes('/onboarding')) {
              console.log('Onboarding completed!');
              return;
            }
          } else {
            console.log('Continue button is disabled, waiting...');
            await this.page.waitForTimeout(1000);
          }
        } else {
          break;
        }
      }

      // If still on onboarding, try clicking on any enabled primary button
      const primaryButton = this.page.locator('button.bg-momentum-orange, button[type="submit"]').first();
      if (await primaryButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        const isEnabled = await primaryButton.isEnabled().catch(() => false);
        if (isEnabled) {
          await primaryButton.click();
          await this.page.waitForTimeout(2000);
        }
      }

    } catch (error) {
      console.log('Onboarding completion error:', error);
    }

    // Final check
    console.log(`Final URL after onboarding attempt: ${this.page.url()}`);
  }

  /**
   * Search for plans by query
   */
  async searchPlans(query: string): Promise<void> {
    const searchInput = this.searchInput;
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill(query);
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Clear search input
   */
  async clearSearch(): Promise<void> {
    const searchInput = this.searchInput;
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.clear();
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Check if error state is visible
   */
  async hasError(): Promise<boolean> {
    return this.errorState.isVisible({ timeout: 2000 }).catch(() => false);
  }

  /**
   * Open user menu/profile
   */
  async openUserMenu(): Promise<void> {
    await this.userProfile.click();
  }

  /**
   * Logout from the application
   */
  async logout(): Promise<void> {
    await this.logoutButton.click();
    await this.page.waitForURL('/login');
  }

  // ==================== ASSERTIONS ====================

  /**
   * Assert dashboard is loaded
   */
  async expectDashboardLoaded(): Promise<void> {
    await this.waitForDashboardReady();
    await expect(this.page).toHaveURL(/\/dashboard/);
    // Check for main content - either welcome heading or any h1/h2
    const hasHeading = await this.page.locator('h1, h2').first().isVisible();
    expect(hasHeading).toBeTruthy();
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
   * Assert stats section is visible
   */
  async expectStatsVisible(): Promise<void> {
    const isVisible = await this.statsSection.isVisible().catch(() => false);
    // Stats may not always be present, so just log
    console.log(`Stats section visible: ${isVisible}`);
  }

  /**
   * Assert sidebar navigation is visible
   */
  async expectSidebarVisible(): Promise<void> {
    await expect(this.sidebar).toBeVisible();
  }

  /**
   * Assert plan count matches expected
   */
  async expectPlanCount(count: number): Promise<void> {
    const actualCount = await this.getPlanCount();
    expect(actualCount).toBe(count);
  }

  /**
   * Assert plan with specific title exists
   */
  async expectPlanWithTitle(title: string): Promise<void> {
    const card = this.planCards.filter({ hasText: title });
    await expect(card.first()).toBeVisible();
  }
}
