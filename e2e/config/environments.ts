/**
 * Environment configuration for E2E tests
 * Supports local, staging, and production environments
 */

export interface EnvironmentConfig {
  name: string;
  baseURL: string;
  apiURL: string;
  timeout: number;
  retries: number;
}

export const environments: Record<string, EnvironmentConfig> = {
  local: {
    name: 'Local Development',
    baseURL: 'http://localhost:5173',
    apiURL: 'http://localhost:5241',
    timeout: 30000,
    retries: 0,
  },
  staging: {
    name: 'Staging',
    baseURL: process.env.STAGING_URL || 'https://staging.sqordia.app',
    apiURL: process.env.STAGING_API_URL || 'https://api.staging.sqordia.app',
    timeout: 60000,
    retries: 2,
  },
  production: {
    name: 'Production',
    baseURL: process.env.PROD_URL || 'https://sqordia.app',
    apiURL: process.env.PROD_API_URL || 'https://api.sqordia.app',
    timeout: 60000,
    retries: 2,
  },
};

/**
 * Get the current environment configuration
 */
export function getEnvironment(): EnvironmentConfig {
  const envName = process.env.TEST_ENV || 'local';
  return environments[envName] || environments.local;
}

/**
 * Get the current environment name
 */
export function getEnvironmentName(): string {
  return process.env.TEST_ENV || 'local';
}

/**
 * Check if running in CI environment
 */
export function isCI(): boolean {
  return !!process.env.CI;
}

/**
 * Get the app version for screenshot organization
 */
export function getAppVersion(): string {
  return process.env.APP_VERSION || 'dev';
}
