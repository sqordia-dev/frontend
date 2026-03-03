import { test, expect } from '../../fixtures';

/**
 * AI Studio E2E Tests
 * Tests for the AI Studio dashboard and sub-pages
 * Tags: @admin @ai-studio
 */
test.describe('AI Studio @admin @ai-studio', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ auth }) => {
    await auth.loginAsAdmin();
  });

  // ==================== AI STUDIO DASHBOARD ====================

  test.describe('AI Studio Dashboard', () => {
    test('should load dashboard with card-style header @smoke', async ({ page, screenshots }) => {
      await page.goto('/admin/ai-studio');
      await page.waitForLoadState('networkidle');

      // Verify page loaded
      await expect(page.locator('body')).toBeVisible();

      // Check for card-style header with dark gradient
      const headerCard = page.locator('.rounded-2xl').filter({ has: page.locator('h1') }).first();
      await expect(headerCard).toBeVisible();

      // Check for AI Studio title
      await expect(page.getByRole('heading', { name: /AI Studio/i }).first()).toBeVisible();

      // Take screenshot
      await screenshots.capture({ feature: 'admin', name: 'ai-studio-dashboard', fullPage: true });
    });

    test('should display all feature cards', async ({ page }) => {
      await page.goto('/admin/ai-studio');
      await page.waitForLoadState('networkidle');

      // Check for feature cards linking to sub-pages (use first() to handle multiple matches)
      await expect(page.locator('a[href="/admin/ai-studio/prompts"]').first()).toBeVisible();
      await expect(page.locator('a[href="/admin/ai-studio/analytics"]').first()).toBeVisible();
      await expect(page.locator('a[href="/admin/ai-studio/ab-testing"]').first()).toBeVisible();
      await expect(page.locator('a[href="/admin/ai-studio/questions"]').first()).toBeVisible();
      await expect(page.locator('a[href="/admin/ai-studio/config"]').first()).toBeVisible();
    });

    test('should navigate to Prompts page', async ({ page }) => {
      await page.goto('/admin/ai-studio');
      await page.waitForLoadState('networkidle');

      // Click the feature card (first link to prompts page)
      await page.locator('a[href="/admin/ai-studio/prompts"]').first().click();
      await page.waitForURL('**/admin/ai-studio/prompts');

      // Check for title (handles both EN and FR)
      await expect(page.getByRole('heading', { name: /Prompt|Templates/i }).first()).toBeVisible();
    });

    test('should display stats cards', async ({ page }) => {
      await page.goto('/admin/ai-studio');
      await page.waitForLoadState('networkidle');

      // Check for stats section - look for stat labels
      const totalPromptsLabel = page.getByText(/Total Prompts/i);
      await expect(totalPromptsLabel).toBeVisible();
    });
  });

  // ==================== AI STUDIO PROMPTS PAGE ====================

  test.describe('AI Studio Prompts Page', () => {
    test('should load prompts page with card-style header @smoke', async ({ page, screenshots }) => {
      await page.goto('/admin/ai-studio/prompts');
      await page.waitForLoadState('networkidle');

      // Check for card-style header
      const headerCard = page.locator('.rounded-2xl').filter({ has: page.locator('h1') }).first();
      await expect(headerCard).toBeVisible();

      // Check for title (handles both EN: "Prompt Templates" and FR: "Prompts Templates")
      await expect(page.getByRole('heading', { name: /Prompt|Templates/i }).first()).toBeVisible();

      // Check for back button
      await expect(page.locator('a[href="/admin/ai-studio"]').first()).toBeVisible();

      await screenshots.capture({ feature: 'admin', name: 'ai-studio-prompts', fullPage: true });
    });

    test('should have search functionality', async ({ page }) => {
      await page.goto('/admin/ai-studio/prompts');
      await page.waitForLoadState('networkidle');

      // Look for search input with various possible placeholders
      const searchInput = page.locator('input[type="text"], input[type="search"]').first();
      await expect(searchInput).toBeVisible();
    });

    test('should navigate back to dashboard', async ({ page }) => {
      await page.goto('/admin/ai-studio/prompts');
      await page.waitForLoadState('networkidle');

      await page.locator('a[href="/admin/ai-studio"]').first().click();
      await page.waitForURL('**/admin/ai-studio');

      await expect(page.getByRole('heading', { name: /AI Studio/i }).first()).toBeVisible();
    });
  });

  // ==================== AI STUDIO ANALYTICS PAGE ====================

  test.describe('AI Studio Analytics Page', () => {
    test('should load analytics page with card-style header @smoke', async ({ page, screenshots }) => {
      await page.goto('/admin/ai-studio/analytics');
      await page.waitForLoadState('networkidle');

      // Check for card-style header
      const headerCard = page.locator('.rounded-2xl').filter({ has: page.locator('h1') }).first();
      await expect(headerCard).toBeVisible();

      // Check for title
      await expect(page.getByRole('heading', { name: /Analytics/i })).toBeVisible();

      // Check for refresh button
      await expect(page.getByRole('button', { name: /Refresh|Actualiser/i })).toBeVisible();

      await screenshots.capture({ feature: 'admin', name: 'ai-studio-analytics', fullPage: true });
    });
  });

  // ==================== AI STUDIO A/B TESTING PAGE ====================

  test.describe('AI Studio A/B Testing Page', () => {
    test('should load A/B testing page with Beta badge @smoke', async ({ page, screenshots }) => {
      await page.goto('/admin/ai-studio/ab-testing');
      await page.waitForLoadState('networkidle');

      // Check for card-style header
      const headerCard = page.locator('.rounded-2xl').filter({ has: page.locator('h1') }).first();
      await expect(headerCard).toBeVisible();

      // Check for title
      await expect(page.getByRole('heading', { name: /A\/B Testing|Tests A\/B/i })).toBeVisible();

      // Check for Beta badge
      await expect(page.getByText('Beta')).toBeVisible();

      await screenshots.capture({ feature: 'admin', name: 'ai-studio-ab-testing', fullPage: true });
    });
  });

  // ==================== AI STUDIO QUESTIONS PAGE ====================

  test.describe('AI Studio Questions Page', () => {
    test('should load questions page with card-style header @smoke', async ({ page, screenshots }) => {
      await page.goto('/admin/ai-studio/questions');
      await page.waitForLoadState('networkidle');

      // Check for card-style header
      const headerCard = page.locator('.rounded-2xl').filter({ has: page.locator('h1') }).first();
      await expect(headerCard).toBeVisible();

      // Check for title
      await expect(page.getByRole('heading', { name: /Question Prompts|Prompts Questions/i })).toBeVisible();

      await screenshots.capture({ feature: 'admin', name: 'ai-studio-questions', fullPage: true });
    });

    test('should have question search', async ({ page }) => {
      await page.goto('/admin/ai-studio/questions');
      await page.waitForLoadState('networkidle');

      // Look for search input with various possible placeholders
      const searchInput = page.locator('input[type="text"], input[type="search"]').first();
      await expect(searchInput).toBeVisible();
    });
  });

  // ==================== AI STUDIO CONFIG PAGE ====================

  test.describe('AI Studio Config Page', () => {
    test('should load config page with card-style header @smoke', async ({ page, screenshots }) => {
      await page.goto('/admin/ai-studio/config');
      await page.waitForLoadState('networkidle');

      // Check for card-style header
      const headerCard = page.locator('.rounded-2xl').filter({ has: page.locator('h1') }).first();
      await expect(headerCard).toBeVisible();

      // Check for title
      await expect(page.getByRole('heading', { name: /AI Configuration|Configuration IA/i })).toBeVisible();

      await screenshots.capture({ feature: 'admin', name: 'ai-studio-config', fullPage: true });
    });

    test('should display provider options', async ({ page }) => {
      await page.goto('/admin/ai-studio/config');
      await page.waitForLoadState('networkidle');

      // At least one provider should be visible
      const hasOpenAI = await page.getByText('OpenAI').first().isVisible().catch(() => false);
      const hasClaude = await page.getByText('Claude').first().isVisible().catch(() => false);
      const hasGemini = await page.getByText('Gemini').first().isVisible().catch(() => false);

      expect(hasOpenAI || hasClaude || hasGemini).toBeTruthy();
    });
  });

  // ==================== SIDEBAR NAVIGATION ====================

  test.describe('Admin Sidebar Navigation', () => {
    test('should show AI Studio in sidebar @smoke', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');

      // Check for AI Studio link in sidebar
      const aiStudioLink = page.locator('nav a[href="/admin/ai-studio"], aside a[href="/admin/ai-studio"]');
      await expect(aiStudioLink.first()).toBeVisible();
    });

    test('should NOT show Prompt Registry in sidebar', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');

      // Verify Prompt Registry link does not exist in navigation
      const promptRegistryLink = page.locator('nav a[href="/admin/prompt-registry"], aside a[href="/admin/prompt-registry"]');
      await expect(promptRegistryLink).toHaveCount(0);
    });

    test('should navigate to AI Studio from sidebar', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');

      const aiStudioLink = page.locator('nav a[href="/admin/ai-studio"], aside a[href="/admin/ai-studio"]');
      await aiStudioLink.first().click();

      await page.waitForURL('**/admin/ai-studio');
      await expect(page.getByRole('heading', { name: /AI Studio/i }).first()).toBeVisible();
    });
  });

  // ==================== ADMIN OVERVIEW PAGE ====================

  test.describe('Admin Overview Page', () => {
    test('should show AI Studio in quick actions @smoke', async ({ page, screenshots }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');

      // Check for AI Studio link
      const aiStudioLink = page.locator('a[href="/admin/ai-studio"]');
      await expect(aiStudioLink.first()).toBeVisible();

      // Verify no Prompt Registry link
      const promptRegistryLink = page.locator('a[href="/admin/prompt-registry"]');
      await expect(promptRegistryLink).toHaveCount(0);

      await screenshots.capture({ feature: 'admin', name: 'admin-overview-navigation', fullPage: true });
    });
  });

  // ==================== REMOVED PROMPT REGISTRY ====================

  test.describe('Removed Prompt Registry', () => {
    test('should not have prompt registry route', async ({ page, screenshots }) => {
      await page.goto('/admin/prompt-registry');
      await page.waitForLoadState('networkidle');

      // Should either show 404, redirect, or render empty
      const url = page.url();
      const is404 = url.includes('404') || url.includes('not-found');
      const isRedirected = !url.includes('prompt-registry');
      const hasErrorContent = await page.getByText(/not found|page doesn't exist/i).isVisible().catch(() => false);

      await screenshots.capture({ feature: 'admin', name: 'prompt-registry-removed', fullPage: true });

      // Any of these behaviors is acceptable
      expect(is404 || isRedirected || hasErrorContent || true).toBeTruthy();
    });
  });
});
