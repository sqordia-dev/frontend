/**
 * Playwright script to capture real app screenshots for the landing page.
 * Usage: npx tsx scripts/capture-screenshots.ts
 */
import { chromium } from 'playwright';
import path from 'path';
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

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // ── 1. Login via API to get token ─────────────────────────────────────────
  console.log('Logging in via API...');
  const loginRes = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: CREDENTIALS.email, password: CREDENTIALS.password }),
  });

  if (!loginRes.ok) {
    // Try alternate endpoints
    const loginRes2 = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: CREDENTIALS.email, password: CREDENTIALS.password }),
    });
    if (!loginRes2.ok) {
      console.error('Login failed:', loginRes.status, await loginRes.text());
      console.error('Alt login failed:', loginRes2.status, await loginRes2.text());
      // Fall back to UI login
    }
  }

  let token = '';
  if (loginRes.ok) {
    const loginData = await loginRes.json();
    token = loginData.token || loginData.accessToken || loginData.value?.token || loginData.value?.accessToken || '';
    console.log('Got token:', token ? 'yes' : 'no');
  }

  // ── 2. Set persona via API ────────────────────────────────────────────────
  if (token) {
    console.log('Setting persona via API...');
    const personaRes = await fetch(`${API_URL}/api/v1/user/persona`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ persona: 'Entrepreneur' }),
    });
    console.log('Persona set:', personaRes.status);
  }

  // ── 3. Login via UI and set localStorage ──────────────────────────────────
  console.log('Logging in via UI...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', CREDENTIALS.email);
  await page.fill('input[name="password"]', CREDENTIALS.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|onboarding|persona)/, { timeout: 15000 });
  console.log('Logged in, URL:', page.url());

  // Force set persona in localStorage so the app doesn't redirect
  await page.evaluate(() => {
    localStorage.setItem('userPersona', 'Entrepreneur');
  });

  // If still on onboarding/persona page, navigate to dashboard
  if (!page.url().includes('dashboard')) {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  }
  await page.waitForTimeout(2500);
  console.log('Current URL after setup:', page.url());

  // Check if we're actually on dashboard now
  const h1 = await page.locator('h1').first().textContent().catch(() => '');
  console.log('H1:', h1);

  // If still redirected, try one more time
  if (page.url().includes('persona') || page.url().includes('onboarding')) {
    console.log('Still on onboarding, trying harder...');
    await page.evaluate(() => {
      localStorage.setItem('userPersona', 'Entrepreneur');
    });
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    console.log('Final URL:', page.url());
  }

  // ── 4. Dismiss tour popup if present ──────────────────────────────────────
  try {
    const skipTour = page.locator('text=Skip Tour');
    if (await skipTour.isVisible({ timeout: 3000 })) {
      await skipTour.click();
      await page.waitForTimeout(500);
      console.log('Tour dismissed.');
    }
  } catch { /* no tour popup */ }

  // ── 5. Dashboard Screenshot ───────────────────────────────────────────────
  console.log('Capturing dashboard...');
  await page.screenshot({
    path: path.join(OUTPUT_DIR, 'dashboard.png'),
    clip: { x: 0, y: 0, width: 1440, height: 900 },
  });
  console.log('Dashboard screenshot saved.');

  // ── 5. Find plan IDs ─────────────────────────────────────────────────────
  let planId: string | null = null;

  // Try from page links
  const allLinks = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a')).map(a => a.href)
  );
  for (const link of allLinks) {
    const match = link.match(/\/(?:questionnaire(?:-new)?|business-plan)\/([0-9a-f-]{30,})/i);
    if (match) { planId = match[1]; break; }
  }
  console.log('Plan ID from links:', planId);

  // Try from API
  if (!planId && token) {
    try {
      const plansRes = await fetch(`${API_URL}/api/v1/business-plans`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        const plans = plansData.value || plansData || [];
        if (Array.isArray(plans) && plans.length > 0) {
          planId = plans[0].id;
          console.log('Plan ID from API:', planId);
        }
      }
    } catch (e) {
      console.log('API plans fetch failed:', e);
    }
  }

  // ── 6. If no plans, create one via API ────────────────────────────────────
  if (!planId && token) {
    console.log('Creating plan via API...');
    try {
      const createRes = await fetch(`${API_URL}/api/v1/business-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: 'Restaurant Le Gourmet',
          description: 'A modern French bistro in downtown Montreal',
          businessType: 'BusinessPlan',
          industry: 'Food & Beverage',
          persona: 'Entrepreneur',
        }),
      });
      if (createRes.ok) {
        const createData = await createRes.json();
        planId = createData.id || createData.value?.id || null;
        console.log('Created plan:', planId);
      } else {
        console.log('Create plan failed:', createRes.status, await createRes.text().catch(() => ''));
      }
    } catch (e) {
      console.log('Create plan error:', e);
    }
  }

  // Refresh dashboard to show the new plan
  if (planId) {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'dashboard.png'),
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    });
    console.log('Dashboard screenshot updated with plan.');
  }

  // ── 7. Questionnaire Screenshot ───────────────────────────────────────────
  if (planId) {
    console.log('Navigating to questionnaire...');
    await page.goto(`${BASE_URL}/questionnaire/${planId}`, {
      waitUntil: 'networkidle',
      timeout: 20000,
    });
    await page.waitForTimeout(3000);
    console.log('Questionnaire URL:', page.url());

    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'questionnaire.png'),
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    });
    console.log('Questionnaire screenshot saved.');

    // ── 8. Preview Screenshot ─────────────────────────────────────────────
    console.log('Navigating to preview...');
    await page.goto(`${BASE_URL}/business-plan/${planId}/preview`, {
      waitUntil: 'networkidle',
      timeout: 20000,
    });
    await page.waitForTimeout(3000);
    console.log('Preview URL:', page.url());

    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'preview.png'),
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    });
    console.log('Preview screenshot saved.');
  } else {
    console.warn('No planId available. Screenshots will be incomplete.');

    // Take create-plan as fallback for questionnaire
    await page.goto(`${BASE_URL}/create-plan`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'questionnaire.png'),
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    });
  }

  // ── 9. Full-page dashboard ────────────────────────────────────────────────
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, 'dashboard-full.png'),
    fullPage: true,
  });

  await browser.close();
  console.log('\nDone! Screenshots saved to:', OUTPUT_DIR);
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
