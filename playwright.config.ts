import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright configuration for Sqordia frontend E2E tests
 * @see https://playwright.dev/docs/test-configuration
 */

// Environment configuration
const env = process.env.TEST_ENV || 'local';
const envConfig = {
  local: {
    baseURL: 'http://localhost:5173',
    apiURL: 'http://localhost:5241',
  },
  staging: {
    baseURL: process.env.STAGING_URL || 'https://staging.sqordia.app',
    apiURL: process.env.STAGING_API_URL || 'https://api.staging.sqordia.app',
  },
  production: {
    baseURL: process.env.PROD_URL || 'https://sqordia.app',
    apiURL: process.env.PROD_API_URL || 'https://api.sqordia.app',
  },
};

const currentEnv = envConfig[env as keyof typeof envConfig] || envConfig.local;

// App version for screenshot organization
const APP_VERSION = process.env.APP_VERSION || 'dev';

export default defineConfig({
  // Test directory - specs are organized by feature
  testDir: './e2e/specs',

  // Global setup and teardown
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,

  // Timeout configuration
  timeout: 60000,
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },
  },

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ...(process.env.CI ? [['github'] as const] : []),
  ],

  // Shared settings
  use: {
    baseURL: currentEnv.baseURL,
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: process.env.CI ? 'on-first-retry' : 'off',

    // Custom metadata
    extraHTTPHeaders: {
      'X-Test-Environment': env,
    },

    // Viewport defaults
    viewport: { width: 1280, height: 720 },

    // Action settings
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  // Project configurations
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile browsers
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },

    // Visual regression project
    {
      name: 'visual-regression',
      testMatch: /visual\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        screenshot: 'on',
      },
    },

    // Smoke tests (quick CI validation)
    {
      name: 'smoke',
      testMatch: /.*\.spec\.ts/,
      grep: /@smoke/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Web server configuration (only for local environment)
  webServer: env === 'local' ? {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  } : undefined,

  // Output directories
  outputDir: 'test-results',
  snapshotDir: 'screenshots/visual-baselines',
});
