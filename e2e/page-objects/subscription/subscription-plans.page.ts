import { Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Page object for the Subscription Plans page (/subscription-plans)
 */
export class SubscriptionPlansPage extends BasePage {
  readonly path = '/subscription-plans';
  readonly feature = 'subscription';

  // ── Locators ──────────────────────────────────────────

  /** Page heading */
  get heading(): Locator {
    return this.page.locator('h1');
  }

  /** Billing cycle toggle button */
  get billingToggle(): Locator {
    return this.page.locator('button').filter({ has: this.page.locator('span.rounded-full.bg-white') });
  }

  /** Monthly label */
  get monthlyLabel(): Locator {
    return this.page.getByText(/^(Monthly|Mensuel)$/);
  }

  /** Yearly label */
  get yearlyLabel(): Locator {
    return this.page.getByText(/^(Yearly|Annuel)$/);
  }

  /** All plan cards */
  get planCards(): Locator {
    return this.page.locator('[class*="rounded-2xl"][class*="border"]').filter({
      has: this.page.locator('h3'),
    });
  }

  /** "Most Popular" badge */
  get mostPopularBadge(): Locator {
    return this.page.getByText(/Most Popular|Le plus populaire/i);
  }

  /** Back button */
  get backButton(): Locator {
    return this.page.locator('button').filter({ hasText: /Back|Retour/ });
  }

  /** Organization creation form (shown when no org exists) */
  get orgCreationForm(): Locator {
    return this.page.locator('#orgName');
  }

  /** Loading indicator */
  get planLoadingSpinner(): Locator {
    return this.page.locator('.animate-spin').first();
  }

  // ── Plan-specific locators ────────────────────────────

  /** Get a plan card by tier name */
  getPlanCard(tierName: string): Locator {
    return this.planCards.filter({ hasText: new RegExp(tierName, 'i') });
  }

  /** Get the CTA button within a specific plan card */
  getPlanCTA(tierName: string): Locator {
    return this.getPlanCard(tierName).locator('button').filter({
      hasText: /Get Started|Subscribe|Contact|Commencer|S'abonner|Contacter/i,
    });
  }

  /** Get the price display within a plan card */
  getPlanPrice(tierName: string): Locator {
    return this.getPlanCard(tierName).locator('span.text-3xl');
  }

  /** Get the "See all features" / expand toggle within a plan card */
  getFeatureToggle(tierName: string): Locator {
    return this.getPlanCard(tierName).locator('button').filter({
      hasText: /See all features|Voir les fonctionnalités|Hide features|Masquer/i,
    });
  }

  /** Get all feature list items within a plan card (when expanded) */
  getFeatureItems(tierName: string): Locator {
    return this.getPlanCard(tierName).locator('li');
  }

  /** Get enabled features (checkmark icon) within a plan card */
  getEnabledFeatures(tierName: string): Locator {
    return this.getPlanCard(tierName).locator('li').filter({
      has: this.page.locator('[class*="text-momentum-orange"]'),
    });
  }

  /** Get disabled features (X icon) within a plan card */
  getDisabledFeatures(tierName: string): Locator {
    return this.getPlanCard(tierName).locator('li').filter({
      has: this.page.locator('.line-through'),
    });
  }

  // ── Actions ───────────────────────────────────────────

  /** Toggle billing cycle between monthly and yearly */
  async toggleBillingCycle(): Promise<void> {
    await this.billingToggle.click();
  }

  /** Expand features for a specific plan */
  async expandFeatures(tierName: string): Promise<void> {
    const toggle = this.getFeatureToggle(tierName);
    const text = await toggle.textContent();
    if (text && /(See all|Voir les)/.test(text)) {
      await toggle.click();
    }
  }

  /** Collapse features for a specific plan */
  async collapseFeatures(tierName: string): Promise<void> {
    const toggle = this.getFeatureToggle(tierName);
    const text = await toggle.textContent();
    if (text && /(Hide|Masquer)/.test(text)) {
      await toggle.click();
    }
  }

  /** Click the CTA button for a specific plan */
  async clickSubscribe(tierName: string): Promise<void> {
    await this.getPlanCTA(tierName).click();
  }

  /** Wait for plans to load */
  async waitForPlansLoaded(): Promise<void> {
    await this.page.waitForSelector('h3', { timeout: 15000 });
  }
}
