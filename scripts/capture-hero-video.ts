/**
 * Playwright script to record polished dashboard demo videos for the Hero section.
 * Records BOTH light-mode and dark-mode versions.
 * Recording starts AFTER login (only the dashboard is captured).
 * Usage: npx tsx scripts/capture-hero-video.ts
 */
import { chromium, Page, BrowserContext } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5241';
const OUTPUT_DIR = path.resolve(__dirname, '../public/images/screenshots');
const TEMP_DIR = path.resolve(OUTPUT_DIR, '_temp_video');

const CREDENTIALS = {
  email: 'admin@sqordia.com',
  password: 'Sqordia2025!',
};

// ── Inject a visible cursor ────────────────────────────────────────────────
async function injectCursor(page: Page) {
  await page.evaluate(() => {
    if (document.getElementById('fake-cursor')) return;
    const cursor = document.createElement('div');
    cursor.id = 'fake-cursor';
    cursor.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="#333" stroke-width="1.5" stroke-linejoin="round"/>
      </svg>
    `;
    cursor.style.cssText = `
      position: fixed; top: 0; left: 0; z-index: 999999;
      pointer-events: none; transform: translate(-2px, -2px);
      transition: top 0.06s ease-out, left 0.06s ease-out;
      filter: drop-shadow(0 1px 3px rgba(0,0,0,0.25));
    `;
    document.body.appendChild(cursor);
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
  });
}

// ── Smooth mouse movement with easing ──────────────────────────────────────
async function smoothMove(page: Page, x: number, y: number, steps = 30) {
  const from = await page.evaluate(() => {
    const c = document.getElementById('fake-cursor');
    return { x: parseFloat(c?.style.left || '0'), y: parseFloat(c?.style.top || '0') };
  });
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    await page.mouse.move(from.x + (x - from.x) * ease, from.y + (y - from.y) * ease);
    await page.waitForTimeout(16);
  }
}

// ── Dashboard tour actions ─────────────────────────────────────────────────
async function performDashboardTour(page: Page) {
  await injectCursor(page);
  await page.mouse.move(720, 450);
  await page.waitForTimeout(800);

  // 1. Let user see the full dashboard
  await page.waitForTimeout(800);

  // 2. Tour the stat cards (left to right)
  await smoothMove(page, 380, 250, 35);
  await page.waitForTimeout(700);
  await smoothMove(page, 590, 250, 25);
  await page.waitForTimeout(600);
  await smoothMove(page, 830, 250, 25);
  await page.waitForTimeout(600);
  await smoothMove(page, 1160, 250, 25);
  await page.waitForTimeout(700);

  // 3. Hover the CTA banner area
  await smoothMove(page, 620, 415, 30);
  await page.waitForTimeout(500);
  await smoothMove(page, 1240, 415, 30);
  await page.waitForTimeout(800);

  // 4. Move to plan card — hover the Resume button
  await smoothMove(page, 430, 700, 30);
  await page.waitForTimeout(500);
  await smoothMove(page, 1200, 715, 30);
  await page.waitForTimeout(900);

  // 5. Glide back up through sidebar items
  await smoothMove(page, 80, 500, 30);
  await page.waitForTimeout(300);
  await smoothMove(page, 80, 300, 25);
  await page.waitForTimeout(300);
  await smoothMove(page, 80, 230, 20);
  await page.waitForTimeout(300);
  await smoothMove(page, 80, 195, 20);
  await page.waitForTimeout(500);

  // 6. Move to New Plan button
  await smoothMove(page, 1290, 120, 35);
  await page.waitForTimeout(1000);

  // 7. Settle back toward center
  await smoothMove(page, 700, 400, 35);
  await page.waitForTimeout(1200);
}

// ── Login without recording, then record the dashboard ─────────────────────
async function loginAndNavigateToDashboard(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  theme: 'light' | 'dark',
): Promise<{ context: BrowserContext; page: Page }> {
  // 1. Create a NON-recording context just for login
  const loginCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const loginPage = await loginCtx.newPage();

  // Login via API for persona setup
  console.log(`  [${theme}] Logging in via API...`);
  const loginRes = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: CREDENTIALS.email, password: CREDENTIALS.password }),
  });
  let token = '';
  if (loginRes.ok) {
    const data = await loginRes.json();
    token = data.token || data.accessToken || data.value?.token || data.value?.accessToken || '';
  }
  if (token) {
    await fetch(`${API_URL}/api/v1/user/persona`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ persona: 'Entrepreneur' }),
    });
  }

  // Login via UI
  console.log(`  [${theme}] Logging in via UI...`);
  await loginPage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await loginPage.fill('input[name="email"]', CREDENTIALS.email);
  await loginPage.fill('input[name="password"]', CREDENTIALS.password);
  await loginPage.click('button[type="submit"]');
  await loginPage.waitForURL(/\/(dashboard|onboarding|persona)/, { timeout: 15000 });
  await loginPage.evaluate(() => localStorage.setItem('userPersona', 'Entrepreneur'));
  if (!loginPage.url().includes('dashboard')) {
    await loginPage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  }
  await loginPage.waitForTimeout(2000);

  // Dismiss tour
  try {
    const skipTour = loginPage.locator('text=Skip Tour');
    if (await skipTour.isVisible({ timeout: 3000 })) {
      await skipTour.click();
      await loginPage.waitForTimeout(500);
    }
  } catch { /* no tour */ }

  // Set the desired theme
  console.log(`  [${theme}] Setting theme to ${theme}...`);
  await loginPage.evaluate((t) => {
    localStorage.setItem('theme', t);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(t);
  }, theme);
  await loginPage.waitForTimeout(500);

  // Grab cookies and storage to transfer to the recording context
  const cookies = await loginCtx.cookies();
  const storage = await loginPage.evaluate(() => {
    const items: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      items[key] = localStorage.getItem(key)!;
    }
    return items;
  });

  await loginCtx.close();

  // 2. Create the RECORDING context
  fs.mkdirSync(TEMP_DIR, { recursive: true });
  const recordCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    recordVideo: { dir: TEMP_DIR, size: { width: 1440, height: 900 } },
  });

  // Transfer auth state
  await recordCtx.addCookies(cookies);
  const recordPage = await recordCtx.newPage();

  // Restore localStorage (including theme + auth tokens)
  await recordPage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
  await recordPage.evaluate((items) => {
    for (const [key, val] of Object.entries(items)) {
      localStorage.setItem(key, val);
    }
  }, storage);

  // Apply theme class immediately
  await recordPage.evaluate((t) => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(t);
  }, theme);

  // Reload to pick up localStorage auth + theme cleanly
  await recordPage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await recordPage.waitForTimeout(2000);

  // Dismiss tour again if it shows
  try {
    const skipTour = recordPage.locator('text=Skip Tour');
    if (await skipTour.isVisible({ timeout: 2000 })) {
      await skipTour.click();
      await recordPage.waitForTimeout(500);
    }
  } catch { /* no tour */ }

  // Ensure theme class is correct on the recording
  await recordPage.evaluate((t) => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(t);
  }, theme);
  await recordPage.waitForTimeout(500);

  console.log(`  [${theme}] Dashboard ready, recording...`);
  return { context: recordCtx, page: recordPage };
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  // Clean temp dir
  fs.mkdirSync(TEMP_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  for (const theme of ['light', 'dark'] as const) {
    console.log(`\nRecording ${theme} mode...`);

    const { context, page } = await loginAndNavigateToDashboard(browser, theme);

    // Perform the dashboard tour (this is the only thing recorded)
    await performDashboardTour(page);

    // Close context to finalize the video
    const videoPath = await page.video()?.path();
    await context.close();

    // Move the video to the final location
    if (videoPath && fs.existsSync(videoPath)) {
      const dest = path.join(OUTPUT_DIR, `hero-dashboard-${theme}.webm`);
      fs.renameSync(videoPath, dest);
      const size = (fs.statSync(dest).size / (1024 * 1024)).toFixed(1);
      console.log(`  Saved: ${dest} (${size} MB)`);
    }
  }

  // Clean up temp dir
  try { fs.rmSync(TEMP_DIR, { recursive: true }); } catch { /* ignore */ }

  // Remove old single-mode video if it exists
  const oldVideo = path.join(OUTPUT_DIR, 'hero-dashboard.webm');
  if (fs.existsSync(oldVideo)) fs.unlinkSync(oldVideo);

  await browser.close();
  console.log('\nDone! Both videos saved.');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
