import { Page, expect } from '@playwright/test';

export interface VisualCompareOptions {
  name: string;
  maxDiffPixelRatio?: number;
  threshold?: number;
  mask?: string[];
  fullPage?: boolean;
}

/**
 * Visual regression testing helper
 * Provides utilities for comparing screenshots against baselines
 */
export class VisualHelper {
  constructor(private page: Page) {}

  /**
   * Compare current page state with baseline
   */
  async compareToBaseline(options: VisualCompareOptions): Promise<void> {
    const maskLocators = options.mask?.map(selector => this.page.locator(selector)) || [];

    await expect(this.page).toHaveScreenshot(`${options.name}.png`, {
      maxDiffPixelRatio: options.maxDiffPixelRatio ?? 0.02, // 2% tolerance for minor rendering differences
      threshold: options.threshold ?? 0.25, // Slightly higher threshold for anti-aliasing
      mask: maskLocators,
      fullPage: options.fullPage ?? true,
    });
  }

  /**
   * Compare specific element to baseline
   */
  async compareElementToBaseline(selector: string, options: VisualCompareOptions): Promise<void> {
    const element = this.page.locator(selector);

    await expect(element).toHaveScreenshot(`${options.name}.png`, {
      maxDiffPixelRatio: options.maxDiffPixelRatio ?? 0.01,
      threshold: options.threshold ?? 0.2,
    });
  }

  /**
   * Get common dynamic content selectors to mask during comparison
   * These elements change frequently and should be masked to avoid false positives
   */
  maskDynamicContent(): string[] {
    return [
      '[data-testid="timestamp"]',
      '[data-testid="user-avatar"]',
      '[data-testid="loading-spinner"]',
      '.date-time',
      '.loading-spinner',
      '.skeleton',
      'time',
      '[datetime]',
      // Mask user-specific data
      '[data-testid="user-name"]',
      '[data-testid="user-email"]',
      // Mask random/dynamic content
      '[data-testid="random-id"]',
      '[data-testid="session-id"]',
    ];
  }

  /**
   * Prepare page for visual comparison
   * Waits for animations and dynamic content to settle
   */
  async prepareForComparison(): Promise<void> {
    // Wait for network to be idle
    await this.page.waitForLoadState('networkidle');

    // Disable animations for consistent screenshots
    await this.page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    });

    // Wait for animations and lazy-loaded content to settle
    await this.page.waitForTimeout(1000);
  }

  /**
   * Take a comparison screenshot at multiple viewport sizes
   */
  async compareResponsive(
    name: string,
    viewports: { name: string; width: number; height: number }[]
  ): Promise<void> {
    const originalViewport = this.page.viewportSize();

    for (const viewport of viewports) {
      await this.page.setViewportSize({ width: viewport.width, height: viewport.height });
      await this.page.waitForTimeout(300); // Wait for resize to settle

      await this.compareToBaseline({
        name: `${name}-${viewport.name}`,
        fullPage: true,
      });
    }

    // Restore original viewport
    if (originalViewport) {
      await this.page.setViewportSize(originalViewport);
    }
  }

  /**
   * Compare page with theme variations (light/dark mode)
   */
  async compareWithThemes(name: string): Promise<void> {
    // Light mode
    await this.page.emulateMedia({ colorScheme: 'light' });
    await this.page.waitForTimeout(300);
    await this.compareToBaseline({ name: `${name}-light` });

    // Dark mode
    await this.page.emulateMedia({ colorScheme: 'dark' });
    await this.page.waitForTimeout(300);
    await this.compareToBaseline({ name: `${name}-dark` });

    // Reset to system preference
    await this.page.emulateMedia({ colorScheme: null });
  }
}

/**
 * Standard viewport configurations for responsive testing
 */
export const STANDARD_VIEWPORTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'desktop-hd', width: 1920, height: 1080 },
];

/**
 * Create a visual helper instance for a page
 */
export function createVisualHelper(page: Page): VisualHelper {
  return new VisualHelper(page);
}
