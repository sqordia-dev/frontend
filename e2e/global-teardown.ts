import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Global teardown for Playwright E2E tests
 * Runs once after all tests complete
 */
async function globalTeardown(config: FullConfig) {
  console.log('\n🧹 Global teardown starting...');

  // Clean up auth state files (optional - keep for debugging by default)
  if (process.env.CLEANUP_AUTH_STATE === 'true') {
    const authDir = path.join(process.cwd(), '.auth');
    if (fs.existsSync(authDir)) {
      fs.rmSync(authDir, { recursive: true, force: true });
      console.log('🗑️  Auth state cleaned up');
    }
  }

  // Archive screenshots from this run (optional)
  if (process.env.ARCHIVE_SCREENSHOTS === 'true') {
    const screenshotsDir = path.join(process.cwd(), 'screenshots');
    const archiveDir = path.join(process.cwd(), 'screenshots-archive');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    if (fs.existsSync(screenshotsDir)) {
      const archivePath = path.join(archiveDir, timestamp);
      if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true });
      }

      // Copy screenshots to archive
      fs.cpSync(screenshotsDir, archivePath, { recursive: true });
      console.log(`📦 Screenshots archived to: ${archivePath}`);
    }
  }

  // Clean up test results older than 7 days (optional)
  if (process.env.CLEANUP_OLD_RESULTS === 'true') {
    const testResultsDir = path.join(process.cwd(), 'test-results');
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    if (fs.existsSync(testResultsDir)) {
      const now = Date.now();
      const files = fs.readdirSync(testResultsDir);

      for (const file of files) {
        const filePath = path.join(testResultsDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          fs.rmSync(filePath, { recursive: true, force: true });
          console.log(`🗑️  Cleaned old result: ${file}`);
        }
      }
    }
  }

  // Print summary
  const reportPath = path.join(process.cwd(), 'playwright-report', 'index.html');
  if (fs.existsSync(reportPath)) {
    console.log(`\n📊 Test report available at: ${reportPath}`);
    console.log('   Run: npm run test:e2e:report');
  }

  console.log('✅ Global teardown complete\n');
}

export default globalTeardown;
