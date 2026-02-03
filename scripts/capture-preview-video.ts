/**
 * Playwright script to record business plan preview page demo videos (light + dark).
 * Showcases: cover page customization, table of contents style picker, and export feature.
 * Recording starts AFTER login.
 * Usage: npx tsx scripts/capture-preview-video.ts
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

// ── Preview page tour actions ───────────────────────────────────────────────
async function performPreviewTour(page: Page) {
  await injectCursor(page);
  await page.mouse.move(700, 400);
  await page.waitForTimeout(1000);

  // ═══════════════════════════════════════════════════════════════════════════
  // PART 1: COVER PAGE CUSTOMIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  // 1a. Pan over the cover page section at the top
  await smoothMove(page, 600, 300, 30);
  await page.waitForTimeout(600);
  await smoothMove(page, 700, 400, 20);
  await page.waitForTimeout(600);

  // 1b. Find and click the "Edit Cover" button (absolute top-4 right-4 of cover section)
  try {
    const editCoverBtn = page.locator('#cover-page-section button', { hasText: 'Edit Cover' });
    const editCoverVisible = await editCoverBtn.isVisible({ timeout: 3000 });
    if (editCoverVisible) {
      const box = await editCoverBtn.boundingBox();
      if (box) {
        await smoothMove(page, box.x + box.width / 2, box.y + box.height / 2, 30);
        await page.waitForTimeout(600);
        await smoothClick(page, box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(1500);

        // 1c. Inside the cover page editor modal — browse through options
        // Move over the layout style cards
        await smoothMove(page, 300, 350, 25);
        await page.waitForTimeout(500);
        await smoothMove(page, 450, 350, 20);
        await page.waitForTimeout(400);
        await smoothMove(page, 600, 350, 20);
        await page.waitForTimeout(600);

        // Click a different layout style card (second one)
        try {
          const styleCards = page.locator('[role="dialog"] button.rounded-xl, [role="dialog"] div.rounded-xl.border-2.cursor-pointer');
          const styleCount = await styleCards.count();
          if (styleCount > 1) {
            const card = styleCards.nth(1);
            const cardBox = await card.boundingBox();
            if (cardBox) {
              await smoothClick(page, cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
              await page.waitForTimeout(1000);
            }
          }
        } catch { /* layout click failed */ }

        // 1d. Move to the live preview panel on the right
        await smoothMove(page, 1050, 350, 25);
        await page.waitForTimeout(600);
        await smoothMove(page, 1050, 500, 20);
        await page.waitForTimeout(800);

        // 1e. Scroll down a bit in the editor to show more options
        try {
          const editorScrollable = page.locator('[role="dialog"] .overflow-y-auto').first();
          const editorBox = await editorScrollable.boundingBox();
          if (editorBox) {
            await smoothMove(page, editorBox.x + editorBox.width / 2, editorBox.y + editorBox.height / 2, 20);
            await page.waitForTimeout(300);
            for (let i = 0; i < 4; i++) {
              await page.mouse.wheel(0, 120);
              await page.waitForTimeout(150);
            }
            await page.waitForTimeout(600);
          }
        } catch { /* scroll failed */ }

        // 1f. Close the modal — click the close (X) button or press Escape
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }
    }
  } catch {
    console.log('    Cover page edit button not found — skipping');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PART 2: TABLE OF CONTENTS STYLE PICKER
  // ═══════════════════════════════════════════════════════════════════════════

  // 2a. Scroll down to the table of contents section
  try {
    const tocSection = page.locator('#table-of-contents-section');
    await tocSection.scrollIntoViewIfNeeded({ timeout: 3000 });
    await page.waitForTimeout(800);
  } catch {
    // Manual scroll if element not found
    for (let i = 0; i < 4; i++) {
      await page.mouse.wheel(0, 150);
      await page.waitForTimeout(150);
    }
    await page.waitForTimeout(500);
  }

  // 2b. Pan over the table of contents area
  await smoothMove(page, 600, 300, 25);
  await page.waitForTimeout(500);
  await smoothMove(page, 600, 450, 20);
  await page.waitForTimeout(600);

  // 2c. Find and click the "Change Style" button
  try {
    const changeStyleBtn = page.locator('#table-of-contents-section button', { hasText: 'Change Style' });
    const changeStyleVisible = await changeStyleBtn.isVisible({ timeout: 3000 });
    if (changeStyleVisible) {
      const box = await changeStyleBtn.boundingBox();
      if (box) {
        await smoothMove(page, box.x + box.width / 2, box.y + box.height / 2, 30);
        await page.waitForTimeout(600);
        await smoothClick(page, box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(1500);

        // 2d. Inside the style selector dialog — browse through style cards
        // The dialog has a grid of 5 style cards (Classic, Modern, Minimal, Magazine, Corporate)
        await smoothMove(page, 400, 350, 25);
        await page.waitForTimeout(500);
        await smoothMove(page, 600, 350, 20);
        await page.waitForTimeout(400);
        await smoothMove(page, 800, 350, 20);
        await page.waitForTimeout(400);

        // Move down to see more styles
        await smoothMove(page, 400, 500, 20);
        await page.waitForTimeout(400);
        await smoothMove(page, 600, 500, 20);
        await page.waitForTimeout(600);

        // Click a style card (try the second or third one)
        try {
          const styleOptions = page.locator('[role="dialog"] button.rounded-xl.border-2, [role="dialog"] div.rounded-xl.border-2');
          const optCount = await styleOptions.count();
          if (optCount > 1) {
            const targetIdx = Math.min(2, optCount - 1);
            const opt = styleOptions.nth(targetIdx);
            const optBox = await opt.boundingBox();
            if (optBox) {
              await smoothMove(page, optBox.x + optBox.width / 2, optBox.y + optBox.height / 2, 25);
              await page.waitForTimeout(500);
              await smoothClick(page, optBox.x + optBox.width / 2, optBox.y + optBox.height / 2);
              await page.waitForTimeout(1000);
            }
          }
        } catch { /* style selection failed */ }

        // 2e. Close the dialog
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }
    }
  } catch {
    console.log('    Change Style button not found — skipping');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PART 3: SECTION EDITOR WITH AI ASSIST
  // ═══════════════════════════════════════════════════════════════════════════

  // 3a. Scroll to a section card that has content (look for section cards with edit buttons)
  try {
    // Find an edit button on a section card (pencil icon button)
    const sectionCards = page.locator('section[id^="section-"]');
    const sectionCount = await sectionCards.count();

    if (sectionCount > 0) {
      // Use the first section card
      const firstSection = sectionCards.first();
      await firstSection.scrollIntoViewIfNeeded({ timeout: 3000 });
      await page.waitForTimeout(800);

      // Pan over the section content
      const sectionBox = await firstSection.boundingBox();
      if (sectionBox) {
        await smoothMove(page, sectionBox.x + sectionBox.width / 2, sectionBox.y + 50, 25);
        await page.waitForTimeout(500);

        // Find the edit button (pencil icon) in the section header area
        // The edit button is a button with text-gray-400 hover:text-blue-600 inside the section
        const editBtns = firstSection.locator('button').filter({ has: page.locator('svg') });
        const editCount = await editBtns.count();
        if (editCount > 0) {
          // The first button with an svg icon in the section is typically the edit button
          const editBtn = editBtns.first();
          const editBox = await editBtn.boundingBox();
          if (editBox) {
            await smoothMove(page, editBox.x + editBox.width / 2, editBox.y + editBox.height / 2, 25);
            await page.waitForTimeout(500);
            await smoothClick(page, editBox.x + editBox.width / 2, editBox.y + editBox.height / 2);
            await page.waitForTimeout(1500);

            // 3b. Inside the section editor modal
            // Look at the editor content area
            await smoothMove(page, 600, 400, 25);
            await page.waitForTimeout(600);

            // 3c. Find and click the "AI Assist" button
            try {
              const aiBtn = page.locator('[role="dialog"] button', { hasText: 'AI Assist' });
              const aiVisible = await aiBtn.isVisible({ timeout: 3000 });
              if (aiVisible) {
                const aiBox = await aiBtn.boundingBox();
                if (aiBox) {
                  await smoothMove(page, aiBox.x + aiBox.width / 2, aiBox.y + aiBox.height / 2, 25);
                  await page.waitForTimeout(500);
                  await smoothClick(page, aiBox.x + aiBox.width / 2, aiBox.y + aiBox.height / 2);
                  await page.waitForTimeout(1200);

                  // 3d. Browse the AI assist dropdown options (improve, expand, shorten)
                  // The dropdown appears below the button
                  try {
                    const aiOptions = page.locator('[role="dialog"] button').filter({
                      has: page.locator('svg'),
                    });
                    // Look for the dropdown items that appeared
                    const dropdownItems = page.locator('[role="dialog"] .shadow-lg button, [role="dialog"] .rounded-lg.shadow button');
                    const dropCount = await dropdownItems.count();

                    if (dropCount > 0) {
                      for (let i = 0; i < Math.min(dropCount, 3); i++) {
                        const item = dropdownItems.nth(i);
                        const itemBox = await item.boundingBox();
                        if (itemBox) {
                          await smoothMove(page, itemBox.x + itemBox.width / 2, itemBox.y + itemBox.height / 2, 20);
                          await page.waitForTimeout(500);
                        }
                      }
                    }
                    await page.waitForTimeout(600);
                  } catch { /* dropdown hover failed */ }

                  // Click away to close the AI dropdown
                  await smoothMove(page, 600, 500, 20);
                  await page.mouse.click(600, 500);
                  await page.waitForTimeout(600);
                }
              }
            } catch {
              console.log('    AI Assist button not found in editor');
            }

            // 3e. Close the section editor modal
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000);
          }
        }
      }
    }
  } catch {
    console.log('    Section editor tour failed — skipping');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PART 4: EXPORT FEATURE
  // ═══════════════════════════════════════════════════════════════════════════

  // 3a. Move to the left sidebar to find the Export button (bottom area)
  // The export button is in the sidebar with bg-[#FF6B00] and text "Export"
  try {
    const exportBtn = page.locator('button', { hasText: 'Export' }).filter({ hasText: /^Export$/ });
    const exportVisible = await exportBtn.first().isVisible({ timeout: 3000 });
    if (exportVisible) {
      const box = await exportBtn.first().boundingBox();
      if (box) {
        // 3b. Move cursor to the export button
        await smoothMove(page, box.x + box.width / 2, box.y + box.height / 2, 30);
        await page.waitForTimeout(700);

        // 3c. Click to open the export dropdown
        await smoothClick(page, box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(1200);

        // 3d. Hover over the dropdown options (PDF and Word)
        try {
          const menuItems = page.locator('[role="menu"] [role="menuitem"], [role="menu"] button');
          const menuCount = await menuItems.count();
          for (let i = 0; i < Math.min(menuCount, 3); i++) {
            const item = menuItems.nth(i);
            const itemBox = await item.boundingBox();
            if (itemBox) {
              await smoothMove(page, itemBox.x + itemBox.width / 2, itemBox.y + itemBox.height / 2, 20);
              await page.waitForTimeout(600);
            }
          }
          await page.waitForTimeout(800);
        } catch { /* menu hover failed */ }

        // 3e. Click away to close the dropdown (don't actually export)
        await smoothMove(page, 600, 400, 25);
        await page.mouse.click(600, 400);
        await page.waitForTimeout(800);
      }
    }
  } catch {
    console.log('    Export button not found — skipping');
  }

  // Final: Settle back to center
  await smoothMove(page, 600, 400, 30);
  await page.waitForTimeout(1000);
}

// ── Login without recording, then create recording context ─────────────────
async function loginAndNavigateToPreview(
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
    console.error('No plan found! Cannot record preview.');
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

  // Restore localStorage + navigate to preview
  const previewUrl = `${BASE_URL}/business-plan/${planId}/preview`;
  await recordPage.goto(previewUrl, { waitUntil: 'domcontentloaded' });
  await recordPage.evaluate((items) => {
    for (const [key, val] of Object.entries(items)) localStorage.setItem(key, val);
  }, storage);
  await recordPage.evaluate((t) => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(t);
  }, theme);

  // Reload to pick up auth + theme
  await recordPage.goto(previewUrl, { waitUntil: 'networkidle' });
  await recordPage.waitForTimeout(3000);

  // Ensure theme
  await recordPage.evaluate((t) => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(t);
  }, theme);
  await recordPage.waitForTimeout(500);

  console.log(`  [${theme}] Preview ready, recording...`);
  return { context: recordCtx, page: recordPage };
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  for (const theme of ['light', 'dark'] as const) {
    console.log(`\nRecording preview (${theme} mode)...`);

    const { context, page } = await loginAndNavigateToPreview(browser, theme);
    await performPreviewTour(page);

    const videoPath = await page.video()?.path();
    await context.close();

    if (videoPath && fs.existsSync(videoPath)) {
      const dest = path.join(OUTPUT_DIR, `preview-${theme}.webm`);
      fs.renameSync(videoPath, dest);
      const size = (fs.statSync(dest).size / (1024 * 1024)).toFixed(1);
      console.log(`  Saved: ${dest} (${size} MB)`);
    }
  }

  try { fs.rmSync(TEMP_DIR, { recursive: true }); } catch { /* ignore */ }
  await browser.close();
  console.log('\nDone! Both preview videos saved.');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
