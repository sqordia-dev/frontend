/**
 * Playwright script to record dashboard page demo videos (light + dark).
 * Showcases: stat cards, CTA banner, plan cards with actions (Resume, 3-dot menu),
 * New Plan button, and sidebar navigation.
 * Recording starts AFTER login.
 * Usage: npx tsx scripts/capture-dashboard-video.ts
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

// ── Dashboard tour actions ──────────────────────────────────────────────────
async function performDashboardTour(page: Page) {
  await injectCursor(page);
  await page.mouse.move(700, 400);
  await page.waitForTimeout(1000);

  // ═══════════════════════════════════════════════════════════════════════════
  // PART 1: STAT CARDS
  // ═══════════════════════════════════════════════════════════════════════════

  // 1a. Move to the header area — "Welcome" heading
  await smoothMove(page, 500, 130, 25);
  await page.waitForTimeout(600);

  // 1b. Hover across the stat cards (left to right)
  // Stats are in a 4-column grid below the header
  try {
    const statsContainer = page.locator('.dashboard-stats');
    const statsBox = await statsContainer.boundingBox();
    if (statsBox) {
      const cardWidth = statsBox.width / 4;
      const cardCenterY = statsBox.y + statsBox.height / 2;

      // Hover each stat card
      for (let i = 0; i < 4; i++) {
        const cardCenterX = statsBox.x + cardWidth * i + cardWidth / 2;
        await smoothMove(page, cardCenterX, cardCenterY, 25);
        await page.waitForTimeout(600);
      }
      await page.waitForTimeout(400);
    }
  } catch {
    // Fallback: approximate positions
    await smoothMove(page, 380, 250, 25);
    await page.waitForTimeout(600);
    await smoothMove(page, 590, 250, 20);
    await page.waitForTimeout(600);
    await smoothMove(page, 830, 250, 20);
    await page.waitForTimeout(600);
    await smoothMove(page, 1100, 250, 20);
    await page.waitForTimeout(600);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PART 2: CTA BANNER — "Create Your Next Business Plan"
  // ═══════════════════════════════════════════════════════════════════════════

  // 2a. Move to the CTA banner card
  try {
    const ctaCard = page.locator('.dashboard-create-card');
    const ctaBox = await ctaCard.boundingBox();
    if (ctaBox) {
      // Pan across the CTA from left to right
      await smoothMove(page, ctaBox.x + 100, ctaBox.y + ctaBox.height / 2, 25);
      await page.waitForTimeout(500);
      await smoothMove(page, ctaBox.x + ctaBox.width / 2, ctaBox.y + ctaBox.height / 2, 20);
      await page.waitForTimeout(400);

      // Hover the arrow button on the right
      await smoothMove(page, ctaBox.x + ctaBox.width - 80, ctaBox.y + ctaBox.height / 2, 25);
      await page.waitForTimeout(800);
    }
  } catch {
    await smoothMove(page, 500, 420, 25);
    await page.waitForTimeout(500);
    await smoothMove(page, 1200, 420, 25);
    await page.waitForTimeout(800);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PART 3: PLAN CARDS — Resume button & 3-dot menu
  // ═══════════════════════════════════════════════════════════════════════════

  // 3a. Move to the plans section
  try {
    const plansSection = page.locator('.dashboard-plans');
    const plansBox = await plansSection.boundingBox();
    if (plansBox) {
      // Hover over the section header ("Your Plans")
      await smoothMove(page, plansBox.x + 200, plansBox.y + 30, 25);
      await page.waitForTimeout(600);
    }
  } catch { /* skip */ }

  // 3b. Find the first plan card and hover over it
  try {
    const planCards = page.locator('.dashboard-plans [class*="group"]');
    const planCount = await planCards.count();
    if (planCount > 0) {
      const firstPlan = planCards.first();
      const planBox = await firstPlan.boundingBox();
      if (planBox) {
        // Pan over the plan card info area
        await smoothMove(page, planBox.x + 100, planBox.y + planBox.height / 2, 25);
        await page.waitForTimeout(500);
        await smoothMove(page, planBox.x + planBox.width / 2, planBox.y + planBox.height / 2, 20);
        await page.waitForTimeout(600);

        // 3c. Hover the Resume/View button
        try {
          const resumeBtn = firstPlan.locator('a', { hasText: /Resume|View/ });
          const resumeVisible = await resumeBtn.isVisible({ timeout: 2000 });
          if (resumeVisible) {
            const resumeBox = await resumeBtn.boundingBox();
            if (resumeBox) {
              await smoothMove(page, resumeBox.x + resumeBox.width / 2, resumeBox.y + resumeBox.height / 2, 25);
              await page.waitForTimeout(800);
            }
          }
        } catch { /* resume button not found */ }

        // 3d. Click the 3-dot menu button to show Duplicate/Delete options
        try {
          const moreBtn = firstPlan.locator('button[class*="h-8"]').last();
          const moreVisible = await moreBtn.isVisible({ timeout: 2000 });
          if (moreVisible) {
            const moreBox = await moreBtn.boundingBox();
            if (moreBox) {
              await smoothMove(page, moreBox.x + moreBox.width / 2, moreBox.y + moreBox.height / 2, 25);
              await page.waitForTimeout(500);
              await smoothClick(page, moreBox.x + moreBox.width / 2, moreBox.y + moreBox.height / 2);
              await page.waitForTimeout(1000);

              // 3e. Hover over the dropdown menu items (Duplicate, Delete)
              try {
                const menuItems = page.locator('[role="menuitem"]');
                const menuCount = await menuItems.count();
                for (let i = 0; i < Math.min(menuCount, 3); i++) {
                  const item = menuItems.nth(i);
                  const itemBox = await item.boundingBox();
                  if (itemBox) {
                    await smoothMove(page, itemBox.x + itemBox.width / 2, itemBox.y + itemBox.height / 2, 20);
                    await page.waitForTimeout(500);
                  }
                }
                await page.waitForTimeout(400);
              } catch { /* menu items not found */ }

              // Close the dropdown by clicking elsewhere
              await page.keyboard.press('Escape');
              await page.waitForTimeout(600);
            }
          }
        } catch { /* 3-dot menu not found */ }
      }

      // 3f. If there's a second plan card, briefly hover it too
      if (planCount > 1) {
        try {
          const secondPlan = planCards.nth(1);
          const secondBox = await secondPlan.boundingBox();
          if (secondBox) {
            await smoothMove(page, secondBox.x + secondBox.width / 2, secondBox.y + secondBox.height / 2, 25);
            await page.waitForTimeout(700);
          }
        } catch { /* second plan not found */ }
      }
    }
  } catch {
    console.log('    Plan cards not found — skipping');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PART 4: NEW PLAN BUTTON & SIDEBAR
  // ═══════════════════════════════════════════════════════════════════════════

  // 4a. Move to the "New Plan" button in the header
  try {
    const newPlanBtn = page.locator('a', { hasText: /New Plan|Nouveau plan/i }).first();
    const newPlanVisible = await newPlanBtn.isVisible({ timeout: 2000 });
    if (newPlanVisible) {
      const newPlanBox = await newPlanBtn.boundingBox();
      if (newPlanBox) {
        await smoothMove(page, newPlanBox.x + newPlanBox.width / 2, newPlanBox.y + newPlanBox.height / 2, 30);
        await page.waitForTimeout(900);
      }
    }
  } catch { /* new plan button not found */ }

  // 4b. Glide down through sidebar navigation items
  try {
    const sidebarNav = page.locator('nav').first();
    const navLinks = sidebarNav.locator('a');
    const navCount = await navLinks.count();
    for (let i = 0; i < Math.min(navCount, 5); i++) {
      const link = navLinks.nth(i);
      const linkBox = await link.boundingBox();
      if (linkBox) {
        await smoothMove(page, linkBox.x + linkBox.width / 2, linkBox.y + linkBox.height / 2, 20);
        await page.waitForTimeout(400);
      }
    }
    await page.waitForTimeout(500);
  } catch { /* sidebar nav not found */ }

  // Final: Settle back to center
  await smoothMove(page, 700, 400, 30);
  await page.waitForTimeout(1000);
}

// ── Login without recording, then create recording context ─────────────────
async function loginAndNavigateToDashboard(
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

  // Mark tour as completed so it doesn't show in recording
  await loginPage.evaluate(() => localStorage.setItem('dashboardTourCompleted', 'true'));

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

  // Restore localStorage + navigate to dashboard
  await recordPage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
  await recordPage.evaluate((items) => {
    for (const [key, val] of Object.entries(items)) localStorage.setItem(key, val);
  }, storage);
  await recordPage.evaluate((t) => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(t);
  }, theme);

  // Reload to pick up auth + theme
  await recordPage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await recordPage.waitForTimeout(3000);

  // Dismiss tour again if it shows in the recording context
  try {
    const skipTour = recordPage.locator('text=Skip Tour');
    if (await skipTour.isVisible({ timeout: 2000 })) {
      await skipTour.click();
      await recordPage.waitForTimeout(500);
    }
  } catch { /* no tour */ }

  // Ensure theme
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
  fs.mkdirSync(TEMP_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  for (const theme of ['light', 'dark'] as const) {
    console.log(`\nRecording dashboard (${theme} mode)...`);

    const { context, page } = await loginAndNavigateToDashboard(browser, theme);
    await performDashboardTour(page);

    const videoPath = await page.video()?.path();
    await context.close();

    if (videoPath && fs.existsSync(videoPath)) {
      const dest = path.join(OUTPUT_DIR, `dashboard-${theme}.webm`);
      fs.renameSync(videoPath, dest);
      const size = (fs.statSync(dest).size / (1024 * 1024)).toFixed(1);
      console.log(`  Saved: ${dest} (${size} MB)`);
    }
  }

  try { fs.rmSync(TEMP_DIR, { recursive: true }); } catch { /* ignore */ }
  await browser.close();
  console.log('\nDone! Both dashboard videos saved.');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
