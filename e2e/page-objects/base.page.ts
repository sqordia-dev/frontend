import { Page, Locator } from '@playwright/test';
import { ScreenshotHelper } from '../helpers/screenshot-helper';
import { VisualHelper } from '../helpers/visual-helper';

/**
 * Base page object class
 * All page objects should extend this class
 */
export abstract class BasePage {
  protected screenshot: ScreenshotHelper;
  protected visual: VisualHelper;

  /**
   * The URL path for this page (e.g., '/login', '/dashboard')
   */
  abstract readonly path: string;

  /**
   * The feature area for screenshot organization (e.g., 'auth', 'dashboard')
   */
  abstract readonly feature: string;

  constructor(protected page: Page) {
    this.screenshot = new ScreenshotHelper(page);
    this.visual = new VisualHelper(page);
  }

  /**
   * Navigate to this page
   */
  async goto(): Promise<void> {
    await this.page.goto(this.path);
    await this.waitForPageLoad();
  }

  /**
   * Navigate to this page with query parameters
   */
  async gotoWithParams(params: Record<string, string>): Promise<void> {
    const searchParams = new URLSearchParams(params).toString();
    await this.page.goto(`${this.path}?${searchParams}`);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to fully load
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for page to be ready (DOM content loaded)
   */
  async waitForDOMReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Get current URL
   */
  getUrl(): string {
    return this.page.url();
  }

  /**
   * Verify current URL matches expected path
   */
  isOnPage(): boolean {
    return this.page.url().includes(this.path);
  }

  /**
   * Take a screenshot of current state
   */
  async takeScreenshot(name: string, fullPage = false): Promise<string> {
    return this.screenshot.capture({
      feature: this.feature,
      name,
      fullPage,
    });
  }

  /**
   * Take a full page screenshot
   */
  async takeFullPageScreenshot(name: string): Promise<string> {
    return this.screenshot.captureFullPage(this.feature, name);
  }

  /**
   * Get the page header element
   */
  get header(): Locator {
    return this.page.locator('header').first();
  }

  /**
   * Get the page footer element
   */
  get footer(): Locator {
    return this.page.locator('footer').first();
  }

  /**
   * Get the main content area
   */
  get mainContent(): Locator {
    return this.page.locator('main, [role="main"], #main-content').first();
  }

  /**
   * Get the navigation element
   */
  get navigation(): Locator {
    return this.page.locator('nav, aside, [role="navigation"]').first();
  }

  /**
   * Get any loading indicators
   */
  get loadingIndicator(): Locator {
    return this.page.locator('[data-testid="loading"], .loading, .spinner, [role="progressbar"]').first();
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingComplete(): Promise<void> {
    await this.loadingIndicator.waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {
      // Loading indicator might not exist, that's okay
    });
  }

  /**
   * Get toast/notification messages
   */
  get toasts(): Locator {
    return this.page.locator('[data-testid="toast"], [role="alert"], .toast, .notification');
  }

  /**
   * Wait for a toast message with specific text
   */
  async waitForToast(text: string | RegExp): Promise<Locator> {
    const toast = this.page.locator('[data-testid="toast"], [role="alert"], .toast').filter({ hasText: text });
    await toast.waitFor({ state: 'visible', timeout: 10000 });
    return toast;
  }

  /**
   * Check if any error messages are visible
   */
  async hasError(): Promise<boolean> {
    const errorElement = this.page.locator('[role="alert"], .error, .text-red-600, .text-destructive').first();
    return errorElement.isVisible({ timeout: 2000 }).catch(() => false);
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string | null> {
    const errorElement = this.page.locator('[role="alert"], .error, .text-red-600').first();
    if (await errorElement.isVisible({ timeout: 2000 }).catch(() => false)) {
      return errorElement.textContent();
    }
    return null;
  }

  /**
   * Scroll to the bottom of the page
   */
  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  /**
   * Scroll to the top of the page
   */
  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(selector: string): Promise<void> {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }
}
