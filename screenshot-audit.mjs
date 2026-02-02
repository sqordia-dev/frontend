import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:5174';
const SCREENSHOT_DIR = join(process.cwd(), 'screenshots-auth');

mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function run() {
  const browser = await chromium.launch({ headless: true });

  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  // === LOGIN ===
  console.log('=== Logging in ===');
  const loginPage = await desktopContext.newPage();
  await loginPage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 15000 });
  await loginPage.waitForTimeout(1000);

  await loginPage.fill('input[type="email"], input[name="email"]', 'admin@sqordia.com');
  await loginPage.fill('input[type="password"], input[name="password"]', 'Sqordia2025!');
  await loginPage.screenshot({ path: join(SCREENSHOT_DIR, '00-login-filled.png') });

  await loginPage.click('button[type="submit"]');
  await loginPage.waitForTimeout(5000);

  const afterLoginUrl = loginPage.url();
  console.log(`  Redirected to: ${afterLoginUrl}`);

  if (afterLoginUrl.includes('login')) {
    console.log('  LOGIN FAILED - check credentials or API');
    await loginPage.screenshot({ path: join(SCREENSHOT_DIR, '01-login-failed.png'), fullPage: true });
    await browser.close();
    return;
  }

  console.log('  Login successful!');

  // If redirected to onboarding, set persona to bypass it
  if (afterLoginUrl.includes('onboarding') || afterLoginUrl.includes('persona')) {
    console.log('  Bypassing onboarding - setting persona in localStorage');
    await loginPage.evaluate(() => {
      localStorage.setItem('userPersona', 'Entrepreneur');
    });
  }

  await loginPage.screenshot({ path: join(SCREENSHOT_DIR, '01-after-login.png'), fullPage: true });

  // Navigate to dashboard to verify we can reach it
  await loginPage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
  await loginPage.waitForTimeout(2000);
  console.log(`  Dashboard URL: ${loginPage.url()}\n`);
  await loginPage.close();

  // === AUTHENTICATED PAGES ===
  const authPages = [
    { path: '/dashboard', name: '02-dashboard' },
    { path: '/create-plan', name: '03-create-plan' },
    { path: '/profile', name: '04-profile' },
    { path: '/subscription', name: '05-subscription' },
    { path: '/subscription-plans', name: '06-subscription-plans' },
    { path: '/invoices', name: '07-invoices' },
    { path: '/admin', name: '08-admin-overview' },
    { path: '/admin/users', name: '09-admin-users' },
    { path: '/admin/organizations', name: '10-admin-organizations' },
    { path: '/admin/business-plans', name: '11-admin-business-plans' },
    { path: '/admin/templates', name: '12-admin-templates' },
    { path: '/admin/prompts-studio', name: '13-admin-prompts' },
    { path: '/admin/ai-config', name: '14-admin-ai-config' },
    { path: '/admin/activity-logs', name: '15-admin-activity-logs' },
    { path: '/admin/system-health', name: '16-admin-system-health' },
    { path: '/admin/settings', name: '17-admin-settings' },
  ];

  console.log('=== Taking authenticated page screenshots ===');
  for (const page of authPages) {
    try {
      const p = await desktopContext.newPage();
      await p.goto(`${BASE_URL}${page.path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await p.waitForTimeout(2000);
      await p.screenshot({ path: join(SCREENSHOT_DIR, `${page.name}-desktop.png`), fullPage: true });
      await p.close();
      console.log(`  OK: ${page.name}`);
    } catch (e) {
      console.log(`  FAIL: ${page.name} - ${e.message.substring(0, 100)}`);
    }
  }

  // === MOBILE AUTHENTICATED ===
  console.log('\n=== Mobile authenticated screenshots ===');
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
  });

  // Login on mobile context
  const mobileLogin = await mobileContext.newPage();
  await mobileLogin.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 15000 });
  await mobileLogin.waitForTimeout(1000);
  await mobileLogin.fill('input[type="email"], input[name="email"]', 'admin@sqordia.com');
  await mobileLogin.fill('input[type="password"], input[name="password"]', 'Sqordia2025!');
  await mobileLogin.click('button[type="submit"]');
  await mobileLogin.waitForTimeout(5000);
  console.log(`  Mobile redirected to: ${mobileLogin.url()}`);
  // Bypass onboarding on mobile too
  await mobileLogin.evaluate(() => {
    localStorage.setItem('userPersona', 'Entrepreneur');
  });
  await mobileLogin.close();

  const mobilePages = [
    { path: '/dashboard', name: '02-dashboard' },
    { path: '/create-plan', name: '03-create-plan' },
    { path: '/profile', name: '04-profile' },
    { path: '/admin', name: '08-admin-overview' },
  ];

  for (const page of mobilePages) {
    try {
      const p = await mobileContext.newPage();
      await p.goto(`${BASE_URL}${page.path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await p.waitForTimeout(2000);
      await p.screenshot({ path: join(SCREENSHOT_DIR, `${page.name}-mobile.png`), fullPage: true });
      await p.close();
      console.log(`  OK: ${page.name} (mobile)`);
    } catch (e) {
      console.log(`  FAIL: ${page.name} (mobile) - ${e.message.substring(0, 100)}`);
    }
  }

  await browser.close();
  console.log('\n=== Done! Screenshots saved to screenshots-auth/ ===');
}

run().catch(console.error);
