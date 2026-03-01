import { Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export interface UserCredentials {
  email: string;
  password: string;
  role?: 'admin' | 'user' | 'consultant';
}

/**
 * Test user configurations
 * Can be overridden via environment variables
 */
export const TEST_USERS: Record<string, UserCredentials> = {
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@sqordia.app',
    password: process.env.TEST_ADMIN_PASSWORD || 'Sqordia2025!',
    role: 'admin',
  },
  user: {
    email: process.env.TEST_USER_EMAIL || 'testuser@sqordia.app',
    password: process.env.TEST_USER_PASSWORD || 'TestUser2025!',
    role: 'user',
  },
  consultant: {
    email: process.env.TEST_CONSULTANT_EMAIL || 'consultant@sqordia.app',
    password: process.env.TEST_CONSULTANT_PASSWORD || 'Consultant2025!',
    role: 'consultant',
  },
};

const STORAGE_STATE_DIR = path.join(process.cwd(), '.auth');

/**
 * Authentication helper for E2E tests
 * Provides login, logout, and session management utilities
 */
export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Login with specified credentials
   */
  async login(credentials: UserCredentials): Promise<boolean> {
    try {
      await this.page.goto('/login');
      await this.page.waitForLoadState('networkidle');

      await this.page.locator('input[name="email"]').fill(credentials.email);
      await this.page.locator('input[name="password"]').fill(credentials.password);
      await this.page.locator('button[type="submit"]').click();

      await this.page.waitForURL(/\/(dashboard|onboarding|admin)/, { timeout: 15000 });
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  /**
   * Login as admin user
   */
  async loginAsAdmin(): Promise<boolean> {
    return this.login(TEST_USERS.admin);
  }

  /**
   * Login as regular user
   */
  async loginAsUser(): Promise<boolean> {
    return this.login(TEST_USERS.user);
  }

  /**
   * Login as consultant user
   */
  async loginAsConsultant(): Promise<boolean> {
    return this.login(TEST_USERS.consultant);
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      // Try profile menu logout
      const profileButton = this.page.locator('[data-testid="profile-menu"], [data-testid="user-menu"]');
      if (await profileButton.isVisible({ timeout: 2000 })) {
        await profileButton.click();
        const logoutButton = this.page.locator('button:has-text("Logout"), a:has-text("Logout")');
        if (await logoutButton.isVisible({ timeout: 2000 })) {
          await logoutButton.click();
          await this.page.waitForURL('/login', { timeout: 5000 }).catch(() => {});
        }
      }
    } catch {
      // Ignore logout errors
    }

    // Clear auth state
    await this.page.context().clearCookies();
  }

  /**
   * Check if user is currently logged in
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      const dashboardLink = this.page.locator('a[href="/dashboard"]');
      const profileLink = this.page.locator('a[href="/profile"]');
      const adminLink = this.page.locator('a[href="/admin"]');

      return (
        (await dashboardLink.isVisible({ timeout: 2000 })) ||
        (await profileLink.isVisible({ timeout: 2000 })) ||
        (await adminLink.isVisible({ timeout: 2000 }))
      );
    } catch {
      return false;
    }
  }

  /**
   * Wait for authentication to complete
   */
  async waitForAuth(): Promise<void> {
    await this.page.waitForURL(/\/(dashboard|onboarding|admin|profile)/, { timeout: 15000 });
  }

  /**
   * Save authentication state for reuse across tests
   */
  static async saveStorageState(context: BrowserContext, userType: string): Promise<void> {
    if (!fs.existsSync(STORAGE_STATE_DIR)) {
      fs.mkdirSync(STORAGE_STATE_DIR, { recursive: true });
    }

    const statePath = path.join(STORAGE_STATE_DIR, `${userType}.json`);
    await context.storageState({ path: statePath });
    console.log(`Storage state saved: ${statePath}`);
  }

  /**
   * Get storage state path for a user type
   */
  static getStorageStatePath(userType: string): string {
    return path.join(STORAGE_STATE_DIR, `${userType}.json`);
  }

  /**
   * Check if storage state exists for a user type
   */
  static hasStorageState(userType: string): boolean {
    const statePath = AuthHelper.getStorageStatePath(userType);
    return fs.existsSync(statePath);
  }

  /**
   * Clean up all saved storage states
   */
  static cleanupStorageStates(): void {
    if (fs.existsSync(STORAGE_STATE_DIR)) {
      fs.rmSync(STORAGE_STATE_DIR, { recursive: true, force: true });
      console.log('Storage states cleaned up');
    }
  }
}

/**
 * Create an auth helper instance for a page
 */
export function createAuthHelper(page: Page): AuthHelper {
  return new AuthHelper(page);
}

// Legacy exports for backward compatibility with existing tests
export const ADMIN_CREDENTIALS = TEST_USERS.admin;

export async function loginAsAdmin(page: Page): Promise<boolean> {
  const auth = new AuthHelper(page);
  return auth.loginAsAdmin();
}

export async function logout(page: Page): Promise<void> {
  const auth = new AuthHelper(page);
  return auth.logout();
}

export async function isLoggedIn(page: Page): Promise<boolean> {
  const auth = new AuthHelper(page);
  return auth.isLoggedIn();
}
