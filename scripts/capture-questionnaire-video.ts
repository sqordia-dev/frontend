/**
 * Playwright script to record questionnaire demo videos (light + dark).
 * Showcases: preview show/hide toggle, scrolling to Next button.
 * Recording starts AFTER login.
 * Usage: npx tsx scripts/capture-questionnaire-video.ts
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

// ── Smooth mouse movement ──────────────────────────────────────────────────
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

// ── Click with visual feedback ─────────────────────────────────────────────
async function smoothClick(page: Page, x: number, y: number) {
  await smoothMove(page, x, y);
  await page.waitForTimeout(200);
  await page.evaluate(() => {
    const c = document.getElementById('fake-cursor');
    if (c) {
      c.style.transform = 'translate(-2px, -2px) scale(0.8)';
      setTimeout(() => { c.style.transform = 'translate(-2px, -2px) scale(1)'; }, 150);
    }
  });
  await page.mouse.click(x, y);
  await page.waitForTimeout(300);
}

// ── Questionnaire tour actions ─────────────────────────────────────────────
async function performQuestionnaireTour(page: Page) {
  await injectCursor(page);
  await page.mouse.move(700, 400);
  await page.waitForTimeout(1000);

  // 1. Pan across the progress bar at the top
  await smoothMove(page, 400, 185, 30);
  await page.waitForTimeout(500);
  await smoothMove(page, 700, 185, 25);
  await page.waitForTimeout(400);
  await smoothMove(page, 1000, 185, 25);
  await page.waitForTimeout(400);
  await smoothMove(page, 1300, 185, 25);
  await page.waitForTimeout(600);

  // 2. Move to the section steps (Identity & Vision, The Offering, etc.)
  await smoothMove(page, 370, 275, 30);
  await page.waitForTimeout(500);
  await smoothMove(page, 570, 275, 20);
  await page.waitForTimeout(400);
  await smoothMove(page, 770, 275, 20);
  await page.waitForTimeout(400);
  await smoothMove(page, 1000, 275, 20);
  await page.waitForTimeout(400);
  await smoothMove(page, 1230, 275, 20);
  await page.waitForTimeout(600);

  // 3. Move to the question area (Identity & Vision section title)
  await smoothMove(page, 450, 370, 30);
  await page.waitForTimeout(600);

  // 4. Move to the Live Preview panel on the right
  await smoothMove(page, 1100, 370, 30);
  await page.waitForTimeout(500);
  await smoothMove(page, 1100, 500, 20);
  await page.waitForTimeout(600);

  // 5. Now showcase the preview HIDE feature
  // Find and click the eye toggle button (title="Hide Preview")
  const previewToggle = page.locator('button[title="Hide Preview"], button[title="Show Preview"]');
  const toggleBox = await previewToggle.boundingBox();
  if (toggleBox) {
    // Move cursor to the toggle button
    await smoothMove(page, toggleBox.x + toggleBox.width / 2, toggleBox.y + toggleBox.height / 2, 30);
    await page.waitForTimeout(600);

    // Click to HIDE the preview
    await smoothClick(page, toggleBox.x + toggleBox.width / 2, toggleBox.y + toggleBox.height / 2);
    await page.waitForTimeout(1200);

    // Let user see the expanded question area without preview
    await smoothMove(page, 700, 500, 25);
    await page.waitForTimeout(800);

    // Re-find the toggle (might have moved since layout changed)
    const toggleBtn2 = page.locator('button[title="Show Preview"], button[title="Hide Preview"]');
    const toggleBox2 = await toggleBtn2.boundingBox();
    if (toggleBox2) {
      // Move back to toggle and click to SHOW the preview again
      await smoothMove(page, toggleBox2.x + toggleBox2.width / 2, toggleBox2.y + toggleBox2.height / 2, 30);
      await page.waitForTimeout(600);
      await smoothClick(page, toggleBox2.x + toggleBox2.width / 2, toggleBox2.y + toggleBox2.height / 2);
      await page.waitForTimeout(1200);
    }
  }

  // 6. Scroll down in the left panel to reveal the Next button
  await smoothMove(page, 500, 600, 25);
  await page.waitForTimeout(400);

  // Find the scrollable question panel (the overflow-y-auto container)
  // Scroll aggressively to reach the bottom navigation
  const questionPanel = page.locator('div.overflow-y-auto').first();
  const panelBox = await questionPanel.boundingBox().catch(() => null);

  if (panelBox) {
    await smoothMove(page, panelBox.x + panelBox.width / 3, panelBox.y + panelBox.height * 0.6, 20);
    await page.waitForTimeout(300);

    // Smooth scroll down in multiple steps
    for (let i = 0; i < 12; i++) {
      await page.mouse.wheel(0, 150);
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(800);
  }

  // 7. Try to find and hover the Next button
  try {
    const nextBtn = page.locator('button[aria-label="Go to next question"]');
    const nextVisible = await nextBtn.isVisible({ timeout: 3000 });
    if (nextVisible) {
      const nextBox = await nextBtn.boundingBox();
      if (nextBox) {
        await smoothMove(page, nextBox.x + nextBox.width / 2, nextBox.y + nextBox.height / 2, 30);
        await page.waitForTimeout(1000);
      }
    }
  } catch {
    // Next button may not be visible at this scroll position — try scrolling to it
    try {
      await page.locator('button[aria-label="Go to next question"]').scrollIntoViewIfNeeded({ timeout: 3000 });
      await page.waitForTimeout(500);
      const nextBox = await page.locator('button[aria-label="Go to next question"]').boundingBox();
      if (nextBox) {
        await smoothMove(page, nextBox.x + nextBox.width / 2, nextBox.y + nextBox.height / 2, 30);
        await page.waitForTimeout(1000);
      }
    } catch { /* Next button not reachable — skip gracefully */ }
  }

  // 8. Settle back to center
  await smoothMove(page, 600, 400, 30);
  await page.waitForTimeout(1000);
}

// ── Login without recording, then create recording context ─────────────────
async function loginAndNavigateToQuestionnaire(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  theme: 'light' | 'dark',
): Promise<{ context: BrowserContext; page: Page }> {
  // 1. Non-recording context for login
  const loginCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const loginPage = await loginCtx.newPage();

  // Login via API
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

  // Find planId
  let planId: string | null = null;
  if (token) {
    try {
      const plansRes = await fetch(`${API_URL}/api/v1/business-plans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        const plans = plansData.value || plansData || [];
        if (Array.isArray(plans) && plans.length > 0) planId = plans[0].id;
      }
    } catch { /* ignore */ }
  }

  if (!planId) {
    console.error('No plan found! Cannot record questionnaire.');
    await loginCtx.close();
    process.exit(1);
  }
  console.log(`  [${theme}] Plan ID: ${planId}`);

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

  // Set theme
  console.log(`  [${theme}] Setting theme...`);
  await loginPage.evaluate((t) => {
    localStorage.setItem('theme', t);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(t);
  }, theme);
  await loginPage.waitForTimeout(500);

  // Grab cookies and storage
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

  // 2. Create RECORDING context
  fs.mkdirSync(TEMP_DIR, { recursive: true });
  const recordCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    recordVideo: { dir: TEMP_DIR, size: { width: 1440, height: 900 } },
  });

  await recordCtx.addCookies(cookies);
  const recordPage = await recordCtx.newPage();

  // Restore localStorage + navigate to questionnaire
  await recordPage.goto(`${BASE_URL}/questionnaire/${planId}`, { waitUntil: 'domcontentloaded' });
  await recordPage.evaluate((items) => {
    for (const [key, val] of Object.entries(items)) localStorage.setItem(key, val);
  }, storage);
  await recordPage.evaluate((t) => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(t);
  }, theme);

  // Reload to pick up auth + theme
  await recordPage.goto(`${BASE_URL}/questionnaire/${planId}`, { waitUntil: 'networkidle' });
  await recordPage.waitForTimeout(3000);

  // Ensure theme
  await recordPage.evaluate((t) => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(t);
  }, theme);
  await recordPage.waitForTimeout(500);

  console.log(`  [${theme}] Questionnaire ready, recording...`);
  return { context: recordCtx, page: recordPage };
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  for (const theme of ['light', 'dark'] as const) {
    console.log(`\nRecording questionnaire (${theme} mode)...`);

    const { context, page } = await loginAndNavigateToQuestionnaire(browser, theme);
    await performQuestionnaireTour(page);

    const videoPath = await page.video()?.path();
    await context.close();

    if (videoPath && fs.existsSync(videoPath)) {
      const dest = path.join(OUTPUT_DIR, `questionnaire-${theme}.webm`);
      fs.renameSync(videoPath, dest);
      const size = (fs.statSync(dest).size / (1024 * 1024)).toFixed(1);
      console.log(`  Saved: ${dest} (${size} MB)`);
    }
  }

  try { fs.rmSync(TEMP_DIR, { recursive: true }); } catch { /* ignore */ }
  await browser.close();
  console.log('\nDone! Both questionnaire videos saved.');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
