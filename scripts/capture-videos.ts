/**
 * Playwright script to record animated demo videos for the landing page.
 * Injects a visible cursor that follows mouse movements.
 * Usage: npx tsx scripts/capture-videos.ts
 */
import { chromium, Page } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5241';
const OUTPUT_DIR = path.resolve(__dirname, '../public/images/screenshots');

const CREDENTIALS = {
  email: 'admin@sqordia.com',
  password: 'Sqordia2025!',
};

// ── Inject a visible cursor element into the page ──────────────────────────
async function injectCursor(page: Page) {
  await page.evaluate(() => {
    if (document.getElementById('fake-cursor')) return;
    const cursor = document.createElement('div');
    cursor.id = 'fake-cursor';
    cursor.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="#222" stroke-width="1.5" stroke-linejoin="round"/>
      </svg>
    `;
    cursor.style.cssText = `
      position: fixed; top: 0; left: 0; z-index: 999999;
      pointer-events: none; transform: translate(-2px, -2px);
      transition: top 0.08s ease-out, left 0.08s ease-out;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    `;
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
  });
}

// ── Smooth mouse movement helper ───────────────────────────────────────────
async function smoothMove(page: Page, x: number, y: number, steps = 25) {
  const from = await page.evaluate(() => {
    const c = document.getElementById('fake-cursor');
    return {
      x: parseFloat(c?.style.left || '0'),
      y: parseFloat(c?.style.top || '0'),
    };
  });
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    // Ease-in-out cubic
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const cx = from.x + (x - from.x) * ease;
    const cy = from.y + (y - from.y) * ease;
    await page.mouse.move(cx, cy);
    await page.waitForTimeout(16); // ~60fps
  }
}

// ── Simulate a click with visual feedback ──────────────────────────────────
async function smoothClick(page: Page, x: number, y: number) {
  await smoothMove(page, x, y);
  await page.waitForTimeout(200);
  // Brief scale pulse on cursor
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

// ── Login and setup (reuse from capture-screenshots) ───────────────────────
async function loginAndSetup(page: Page): Promise<{ token: string; planId: string | null }> {
  // Login via API
  console.log('Logging in via API...');
  const loginRes = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: CREDENTIALS.email, password: CREDENTIALS.password }),
  });

  let token = '';
  if (loginRes.ok) {
    const loginData = await loginRes.json();
    token = loginData.token || loginData.accessToken || loginData.value?.token || loginData.value?.accessToken || '';
  }

  // Set persona
  if (token) {
    await fetch(`${API_URL}/api/v1/user/persona`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ persona: 'Entrepreneur' }),
    });
  }

  // Login via UI
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', CREDENTIALS.email);
  await page.fill('input[name="password"]', CREDENTIALS.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|onboarding|persona)/, { timeout: 15000 });

  await page.evaluate(() => localStorage.setItem('userPersona', 'Entrepreneur'));
  if (!page.url().includes('dashboard')) {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  }
  await page.waitForTimeout(2000);

  // Dismiss tour
  try {
    const skipTour = page.locator('text=Skip Tour');
    if (await skipTour.isVisible({ timeout: 3000 })) {
      await skipTour.click();
      await page.waitForTimeout(500);
    }
  } catch { /* no tour */ }

  // Find plan ID
  let planId: string | null = null;
  if (token) {
    try {
      const plansRes = await fetch(`${API_URL}/api/v1/business-plans`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        const plans = plansData.value || plansData || [];
        if (Array.isArray(plans) && plans.length > 0) planId = plans[0].id;
      }
    } catch { /* ignore */ }
  }

  console.log('Setup complete. Plan ID:', planId);
  return { token, planId };
}

// ── Record a single page demo ──────────────────────────────────────────────
async function recordPage(
  browser: ReturnType<typeof chromium.launch> extends Promise<infer T> ? T : never,
  name: string,
  url: string,
  actions: (page: Page) => Promise<void>,
) {
  console.log(`\nRecording ${name}...`);

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();

  // Login for this context
  const { planId } = await loginAndSetup(page);

  // Navigate to target
  const resolvedUrl = url.replace('{planId}', planId || '');
  await page.goto(resolvedUrl, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);

  // Dismiss tour if it appears again
  try {
    const skipTour = page.locator('text=Skip Tour');
    if (await skipTour.isVisible({ timeout: 2000 })) {
      await skipTour.click();
      await page.waitForTimeout(500);
    }
  } catch { /* no tour */ }

  // Inject visible cursor
  await injectCursor(page);
  // Position cursor at center initially
  await page.mouse.move(720, 450);
  await page.waitForTimeout(500);

  // Run the page-specific actions
  await actions(page);

  // Wait a moment at the end
  await page.waitForTimeout(800);

  await context.close();

  // Rename the video file
  const videos = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.webm'));
  // Get the most recently created webm
  const latest = videos
    .map(f => ({ name: f, time: fs.statSync(path.join(OUTPUT_DIR, f)).mtimeMs }))
    .sort((a, b) => b.time - a.time)[0];

  if (latest) {
    const dest = path.join(OUTPUT_DIR, `${name}.webm`);
    fs.renameSync(path.join(OUTPUT_DIR, latest.name), dest);
    console.log(`Saved: ${dest}`);
  }
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const browser = await chromium.launch({ headless: true });

  // ── Dashboard demo ─────────────────────────────────────────────────────
  await recordPage(browser, 'dashboard', `${BASE_URL}/dashboard`, async (page) => {
    // Hover over stats cards
    await smoothMove(page, 400, 250, 30);
    await page.waitForTimeout(600);
    await smoothMove(page, 620, 250, 25);
    await page.waitForTimeout(600);
    await smoothMove(page, 850, 250, 25);
    await page.waitForTimeout(600);
    await smoothMove(page, 1100, 250, 25);
    await page.waitForTimeout(600);

    // Move to "Create Your Next Business Plan" CTA
    await smoothMove(page, 800, 420, 30);
    await page.waitForTimeout(800);

    // Move to plan card
    await smoothMove(page, 700, 700, 30);
    await page.waitForTimeout(600);

    // Hover over Resume button
    await smoothMove(page, 1200, 710, 25);
    await page.waitForTimeout(800);

    // Move to sidebar nav items
    await smoothMove(page, 100, 230, 30);
    await page.waitForTimeout(400);
    await smoothMove(page, 100, 265, 20);
    await page.waitForTimeout(400);
    await smoothMove(page, 100, 300, 20);
    await page.waitForTimeout(400);

    // Back to center
    await smoothMove(page, 700, 450, 30);
    await page.waitForTimeout(500);
  });

  // ── Questionnaire demo ─────────────────────────────────────────────────
  await recordPage(browser, 'questionnaire', `${BASE_URL}/questionnaire/{planId}`, async (page) => {
    // Look at progress bar
    await smoothMove(page, 500, 185, 30);
    await page.waitForTimeout(600);
    await smoothMove(page, 900, 185, 25);
    await page.waitForTimeout(600);

    // Move to section steps
    await smoothMove(page, 400, 270, 25);
    await page.waitForTimeout(500);
    await smoothMove(page, 600, 270, 20);
    await page.waitForTimeout(500);

    // Move to question area
    await smoothMove(page, 500, 470, 30);
    await page.waitForTimeout(600);

    // Click into the text area
    const textarea = page.locator('textarea').first();
    const textareaBox = await textarea.boundingBox();
    if (textareaBox) {
      await smoothMove(page, textareaBox.x + 200, textareaBox.y + 40, 25);
      await page.waitForTimeout(400);
      await smoothClick(page, textareaBox.x + 200, textareaBox.y + 40);
      await page.waitForTimeout(500);
    }

    // Move to live preview panel on the right
    await smoothMove(page, 1100, 400, 30);
    await page.waitForTimeout(600);
    await smoothMove(page, 1100, 550, 25);
    await page.waitForTimeout(600);

    // Scroll down in the preview area
    await smoothMove(page, 1100, 650, 20);
    await page.waitForTimeout(500);

    // Back to center
    await smoothMove(page, 700, 450, 30);
    await page.waitForTimeout(500);
  });

  // ── Preview demo ───────────────────────────────────────────────────────
  await recordPage(browser, 'preview', `${BASE_URL}/business-plan/{planId}/preview`, async (page) => {
    // Look at the plan title
    await smoothMove(page, 700, 180, 30);
    await page.waitForTimeout(800);

    // Move through the table of contents on the right
    await smoothMove(page, 1200, 115, 30);
    await page.waitForTimeout(500);
    await smoothMove(page, 1200, 155, 20);
    await page.waitForTimeout(400);
    await smoothMove(page, 1200, 200, 20);
    await page.waitForTimeout(400);
    await smoothMove(page, 1200, 240, 20);
    await page.waitForTimeout(400);
    await smoothMove(page, 1200, 280, 20);
    await page.waitForTimeout(400);
    await smoothMove(page, 1200, 320, 20);
    await page.waitForTimeout(400);
    await smoothMove(page, 1200, 360, 20);
    await page.waitForTimeout(500);

    // Click on a section in the TOC (e.g., "Executive Summary")
    await smoothClick(page, 1200, 200);
    await page.waitForTimeout(1200);

    // Move to the main content area
    await smoothMove(page, 700, 400, 30);
    await page.waitForTimeout(600);

    // Scroll down a bit
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(800);
    await smoothMove(page, 700, 350, 20);
    await page.waitForTimeout(600);

    // Back to top
    await smoothMove(page, 700, 200, 30);
    await page.waitForTimeout(500);
  });

  await browser.close();
  console.log('\nAll videos saved to:', OUTPUT_DIR);
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
