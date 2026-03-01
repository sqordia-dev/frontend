import { chromium, FullConfig } from '@playwright/test';
import { AuthHelper, TEST_USERS } from './helpers/auth-helper';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Global setup for Playwright E2E tests
 * Runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  console.log('\n🚀 Global setup starting...');

  // Ensure required directories exist
  const directories = [
    path.join(process.cwd(), '.auth'),
    path.join(process.cwd(), 'screenshots'),
    path.join(process.cwd(), 'screenshots/visual-baselines'),
    path.join(process.cwd(), 'test-results'),
    path.join(process.cwd(), 'playwright-report'),
  ];

  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  }

  // Get base URL from config
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:5173';
  console.log(`🌐 Base URL: ${baseURL}`);

  // Check if we should skip auth pre-setup (for CI or specific environments)
  if (process.env.SKIP_AUTH_SETUP === 'true') {
    console.log('⏭️  Skipping auth pre-setup (SKIP_AUTH_SETUP=true)');
    console.log('✅ Global setup complete\n');
    return;
  }

  // Pre-authenticate users and save storage state for faster test execution
  const browser = await chromium.launch();

  try {
    // Authenticate admin user
    console.log('🔐 Pre-authenticating admin user...');
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    try {
      await adminPage.goto(baseURL, { timeout: 30000 });
      const adminAuth = new AuthHelper(adminPage);
      const adminSuccess = await adminAuth.loginAsAdmin();

      if (adminSuccess) {
        await AuthHelper.saveStorageState(adminContext, 'admin');
        console.log('✅ Admin authentication state saved');
      } else {
        console.warn('⚠️  Admin login failed - tests requiring admin may need to login manually');
      }
    } catch (error) {
      console.warn('⚠️  Error during admin pre-auth:', error);
    }

    await adminContext.close();

    // Authenticate regular user (if credentials are different)
    if (TEST_USERS.user.email !== TEST_USERS.admin.email) {
      console.log('🔐 Pre-authenticating regular user...');
      const userContext = await browser.newContext();
      const userPage = await userContext.newPage();

      try {
        await userPage.goto(baseURL, { timeout: 30000 });
        const userAuth = new AuthHelper(userPage);
        const userSuccess = await userAuth.loginAsUser();

        if (userSuccess) {
          await AuthHelper.saveStorageState(userContext, 'user');
          console.log('✅ User authentication state saved');
        } else {
          console.warn('⚠️  User login failed - using admin credentials as fallback');
        }
      } catch (error) {
        console.warn('⚠️  Error during user pre-auth:', error);
      }

      await userContext.close();
    }
  } finally {
    await browser.close();
  }

  console.log('✅ Global setup complete\n');
}

export default globalSetup;
