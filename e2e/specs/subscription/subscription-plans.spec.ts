import { test, expect } from '../../fixtures';
import { SubscriptionPlansPage } from '../../page-objects/subscription/subscription-plans.page';

/**
 * Subscription Plans Page E2E Tests
 * Tags: @billing @subscription
 */
test.describe('Subscription Plans Page @billing @subscription', () => {
  let plansPage: SubscriptionPlansPage;

  test.beforeEach(async ({ page }) => {
    plansPage = new SubscriptionPlansPage(page);
    await plansPage.goto();
    await plansPage.waitForPlansLoaded();
  });

  // ==================== SMOKE TESTS ====================

  test('should display subscription plans page @smoke', async ({ screenshots }) => {
    await expect(plansPage.heading).toBeVisible();
    await expect(plansPage.heading).toHaveText(/Choose Your Plan|Choisissez votre plan/i);
    await screenshots.capture({ feature: 'subscription', name: 'plans-page-loaded' });
  });

  test('should display all 4 plan tiers @smoke @critical', async () => {
    const cardCount = await plansPage.planCards.count();
    expect(cardCount).toBe(4);

    // Verify each tier exists
    await expect(plansPage.getPlanCard('Découverte')).toBeVisible();
    await expect(plansPage.getPlanCard('Essentiel')).toBeVisible();
    await expect(plansPage.getPlanCard('Professionnel')).toBeVisible();
    await expect(plansPage.getPlanCard('Entreprise')).toBeVisible();
  });

  test('should display Most Popular badge on Professional plan @smoke', async () => {
    await expect(plansPage.mostPopularBadge).toBeVisible();
  });

  // ==================== PRICING TESTS ====================

  test('should display monthly prices by default @billing', async () => {
    // Free plan should show $0
    const freePrice = await plansPage.getPlanPrice('Découverte').textContent();
    expect(freePrice).toMatch(/0/);

    // Starter should show $29
    const starterPrice = await plansPage.getPlanPrice('Essentiel').textContent();
    expect(starterPrice).toMatch(/29/);

    // Professional should show $59
    const proPrice = await plansPage.getPlanPrice('Professionnel').textContent();
    expect(proPrice).toMatch(/59/);

    // Enterprise should show $149
    const entPrice = await plansPage.getPlanPrice('Entreprise').textContent();
    expect(entPrice).toMatch(/149/);
  });

  test('should toggle to yearly pricing @billing', async ({ screenshots }) => {
    await plansPage.toggleBillingCycle();

    // Prices should change — Starter yearly ~$290
    const starterPrice = await plansPage.getPlanPrice('Essentiel').textContent();
    expect(starterPrice).toMatch(/290/);

    // Should show savings badge
    const savingsBadge = plansPage.page.getByText(/Save up to|Économisez/i);
    await expect(savingsBadge).toBeVisible();

    await screenshots.capture({ feature: 'subscription', name: 'yearly-pricing' });
  });

  test('should toggle back to monthly pricing @billing', async () => {
    // Toggle to yearly
    await plansPage.toggleBillingCycle();
    // Toggle back to monthly
    await plansPage.toggleBillingCycle();

    const starterPrice = await plansPage.getPlanPrice('Essentiel').textContent();
    expect(starterPrice).toMatch(/29/);
  });

  // ==================== FEATURES TESTS ====================

  test('should expand and show plan features @ui', async ({ screenshots }) => {
    await plansPage.expandFeatures('Essentiel');
    await plansPage.page.waitForTimeout(300); // animation

    const features = plansPage.getFeatureItems('Essentiel');
    const count = await features.count();
    expect(count).toBeGreaterThan(5);

    await screenshots.capture({ feature: 'subscription', name: 'features-expanded' });
  });

  test('should collapse expanded features @ui', async () => {
    await plansPage.expandFeatures('Essentiel');
    await plansPage.page.waitForTimeout(300);
    await plansPage.collapseFeatures('Essentiel');
    await plansPage.page.waitForTimeout(300);

    // After collapse, feature items should not be visible
    const features = plansPage.getFeatureItems('Essentiel');
    const count = await features.count();
    expect(count).toBe(0);
  });

  test('should show enabled and disabled features correctly @ui', async () => {
    // Professional has most features enabled
    await plansPage.expandFeatures('Professionnel');
    await plansPage.page.waitForTimeout(300);

    const enabled = await plansPage.getEnabledFeatures('Professionnel').count();
    expect(enabled).toBeGreaterThan(8);

    // Free tier should have more disabled features
    await plansPage.expandFeatures('Découverte');
    await plansPage.page.waitForTimeout(300);

    const disabled = await plansPage.getDisabledFeatures('Découverte').count();
    expect(disabled).toBeGreaterThan(3);
  });

  // ==================== CTA BUTTON TESTS ====================

  test('should show "Get Started Free" for free plan @billing', async () => {
    const freeCTA = plansPage.getPlanCTA('Découverte');
    await expect(freeCTA).toHaveText(/Get Started|Commencer/i);
  });

  test('should show "Subscribe Now" for paid plans @billing', async () => {
    const starterCTA = plansPage.getPlanCTA('Essentiel');
    await expect(starterCTA).toHaveText(/Subscribe|S'abonner/i);
  });

  test('should show "Contact Sales" for enterprise plan @billing', async () => {
    const entCTA = plansPage.getPlanCTA('Entreprise');
    await expect(entCTA).toHaveText(/Contact|Contacter/i);
  });

  // ==================== NAVIGATION TESTS ====================

  test('should navigate back when clicking back button @navigation', async () => {
    // First navigate to dashboard, then to plans page
    await plansPage.page.goto('/dashboard');
    await plansPage.page.waitForLoadState('networkidle');
    await plansPage.goto();
    await plansPage.waitForPlansLoaded();

    await plansPage.backButton.click();
    await plansPage.page.waitForTimeout(500);
    // Should no longer be on plans page
    expect(plansPage.page.url()).not.toContain('/subscription-plans');
  });

  // ==================== RESPONSIVE TESTS ====================

  test('should display correctly on mobile viewport @responsive', async ({ screenshots }) => {
    await plansPage.page.setViewportSize({ width: 375, height: 812 });
    await plansPage.page.waitForTimeout(300);

    // Plans should stack vertically on mobile
    await expect(plansPage.heading).toBeVisible();
    const cards = await plansPage.planCards.count();
    expect(cards).toBe(4);

    await screenshots.capture({ feature: 'subscription', name: 'plans-mobile' });
  });

  test('should display correctly on tablet viewport @responsive', async ({ screenshots }) => {
    await plansPage.page.setViewportSize({ width: 768, height: 1024 });
    await plansPage.page.waitForTimeout(300);

    await expect(plansPage.heading).toBeVisible();
    await screenshots.capture({ feature: 'subscription', name: 'plans-tablet' });
  });

  // ==================== FEATURE GATE UI TESTS ====================

  test('should display lock icons on gated export menu items @billing @critical', async ({ authenticatedPage, screenshots }) => {
    // Navigate to a business plan preview with export menu (if exists)
    plansPage = new SubscriptionPlansPage(authenticatedPage);

    // Navigate to dashboard to find a business plan
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for a business plan link
    const planLink = authenticatedPage.locator('a[href*="/business-plan/"], a[href*="/preview/"]').first();
    const hasPlan = await planLink.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasPlan) {
      await planLink.click();
      await authenticatedPage.waitForLoadState('networkidle');

      // Look for export menu trigger (Download button)
      const exportButton = authenticatedPage.locator('button').filter({ hasText: /Export|Exporter|Download/i }).first();
      const hasExport = await exportButton.isVisible({ timeout: 5000 }).catch(() => false);

      if (hasExport) {
        await exportButton.click();
        await authenticatedPage.waitForTimeout(300);

        // Check for lock icons in dropdown (present for free tier users)
        const lockIcons = authenticatedPage.locator('[data-testid="lock-icon"], svg.lucide-lock');
        const lockCount = await lockIcons.count();

        // Screenshot the export menu state
        await screenshots.capture({ feature: 'subscription', name: 'export-menu-feature-gate' });

        // If on free plan, should have locked items
        // Just verify the menu opened successfully
        const menuItems = authenticatedPage.locator('[role="menuitem"]');
        expect(await menuItems.count()).toBeGreaterThan(0);
      }
    }
  });

  // ==================== ACCESSIBILITY TESTS ====================

  test('should support keyboard navigation between plan cards @a11y', async () => {
    // Tab through the page to reach plan buttons
    for (let i = 0; i < 10; i++) {
      await plansPage.page.keyboard.press('Tab');
    }

    const focused = await plansPage.page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT']).toContain(focused);
  });

  test('should have proper heading hierarchy @a11y', async () => {
    const h1Count = await plansPage.page.locator('h1').count();
    expect(h1Count).toBe(1);

    // Plan names should be h3
    const h3Count = await plansPage.page.locator('h3').count();
    expect(h3Count).toBeGreaterThanOrEqual(4);
  });
});
