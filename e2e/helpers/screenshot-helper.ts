import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { getAppVersion } from '../config/environments';

export interface ScreenshotOptions {
  feature: string;
  name: string;
  fullPage?: boolean;
  mask?: string[];
  clip?: { x: number; y: number; width: number; height: number };
}

/**
 * Screenshot helper with versioned, feature-based organization
 * Screenshots are saved to: screenshots/{feature}/{version}/{name}-{timestamp}.png
 */
export class ScreenshotHelper {
  private readonly baseDir: string;
  private readonly version: string;

  constructor(
    private page: Page,
    baseDir: string = 'screenshots'
  ) {
    this.baseDir = path.resolve(process.cwd(), baseDir);
    this.version = getAppVersion();
  }

  /**
   * Generate timestamp string for screenshot naming
   */
  private generateTimestamp(): string {
    return new Date().toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '-')
      .slice(0, 19);
  }

  /**
   * Generate screenshot path with feature/version/timestamp structure
   * e.g., screenshots/auth/v1.2.3/login-success-2024-03-01-143022.png
   */
  private generatePath(feature: string, name: string): string {
    const timestamp = this.generateTimestamp();
    const dir = path.join(this.baseDir, feature, this.version);

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    return path.join(dir, `${name}-${timestamp}.png`);
  }

  /**
   * Take a screenshot with feature-based organization
   */
  async capture(options: ScreenshotOptions): Promise<string> {
    const screenshotPath = this.generatePath(options.feature, options.name);

    const maskLocators = options.mask?.map(selector => this.page.locator(selector)) || [];

    await this.page.screenshot({
      path: screenshotPath,
      fullPage: options.fullPage ?? false,
      mask: maskLocators,
      clip: options.clip,
    });

    console.log(`Screenshot saved: ${screenshotPath}`);
    return screenshotPath;
  }

  /**
   * Take a screenshot on failure with automatic naming
   */
  async captureOnFailure(testName: string, feature: string): Promise<string> {
    return this.capture({
      feature,
      name: `failure-${testName.replace(/\s+/g, '-').toLowerCase()}`,
      fullPage: true,
    });
  }

  /**
   * Take a full page screenshot
   */
  async captureFullPage(feature: string, name: string): Promise<string> {
    return this.capture({
      feature,
      name,
      fullPage: true,
    });
  }

  /**
   * Take a visual regression baseline screenshot
   * Saved to screenshots/visual-baselines/{feature}/{name}.png
   */
  async captureBaseline(feature: string, name: string): Promise<string> {
    const baselineDir = path.join(this.baseDir, 'visual-baselines', feature);

    if (!fs.existsSync(baselineDir)) {
      fs.mkdirSync(baselineDir, { recursive: true });
    }

    const baselinePath = path.join(baselineDir, `${name}.png`);

    await this.page.screenshot({
      path: baselinePath,
      fullPage: true,
    });

    console.log(`Baseline saved: ${baselinePath}`);
    return baselinePath;
  }

  /**
   * Take a screenshot of a specific element
   */
  async captureElement(selector: string, feature: string, name: string): Promise<string> {
    const screenshotPath = this.generatePath(feature, name);
    const element = this.page.locator(selector);

    await element.screenshot({
      path: screenshotPath,
    });

    console.log(`Element screenshot saved: ${screenshotPath}`);
    return screenshotPath;
  }

  /**
   * Create directory structure for a feature if it doesn't exist
   */
  ensureFeatureDir(feature: string): string {
    const dir = path.join(this.baseDir, feature, this.version);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }
}

/**
 * Create a screenshot helper instance for a page
 */
export function createScreenshotHelper(page: Page): ScreenshotHelper {
  return new ScreenshotHelper(page);
}
