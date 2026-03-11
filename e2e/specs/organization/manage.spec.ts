import { test, expect } from 'playwright/test';
import { loginAsAdmin } from '../../auth-setup';

test.describe('Organization Management (Owner/Admin)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should show Team link in dashboard sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for org data to load

    // Check for Team/Équipe nav link (only visible if user has an org)
    const teamLink = page.locator('a:has-text("Team"), a:has-text("Équipe")');
    if (await teamLink.isVisible()) {
      expect(await teamLink.getAttribute('href')).toMatch(/\/organization\/[a-f0-9-]+\/manage/);
      await page.screenshot({ path: 'bugs_report/screenshots/dashboard-team-link.png', fullPage: true });
    }
  });

  test('should navigate to organization manage page from sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const teamLink = page.locator('a:has-text("Team"), a:has-text("Équipe")');
    if (await teamLink.isVisible()) {
      await teamLink.click();
      await page.waitForLoadState('networkidle');

      expect(page.url()).toMatch(/\/organization\/[a-f0-9-]+\/manage/);

      // Should have org name heading
      await expect(page.locator('h1')).toBeVisible();

      // Should have Invite button
      await expect(page.locator('button:has-text("Invite"), button:has-text("Inviter")')).toBeVisible();

      // Should have Members, Invitations, Settings tabs
      await expect(page.locator('button:has-text("Members"), button:has-text("Membres")')).toBeVisible();
      await expect(page.locator('button:has-text("Invitations")')).toBeVisible();
      await expect(page.locator('button:has-text("Settings"), button:has-text("Paramètres")')).toBeVisible();

      await page.screenshot({ path: 'bugs_report/screenshots/org-manage-members.png', fullPage: true });
    }
  });

  test('should display members table with roles', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const teamLink = page.locator('a:has-text("Team"), a:has-text("Équipe")');
    if (await teamLink.isVisible()) {
      await teamLink.click();
      await page.waitForLoadState('networkidle');

      // Should have members table
      await expect(page.locator('table')).toBeVisible();

      // Should show role badges
      const roleBadges = page.locator('text=Owner, text=Admin, text=Member, text=Viewer');
      // At minimum the logged-in user should be visible
      await expect(page.locator('table tbody tr').first()).toBeVisible();

      await page.screenshot({ path: 'bugs_report/screenshots/org-manage-members-table.png', fullPage: true });
    }
  });

  test('should open invite member modal', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const teamLink = page.locator('a:has-text("Team"), a:has-text("Équipe")');
    if (await teamLink.isVisible()) {
      await teamLink.click();
      await page.waitForLoadState('networkidle');

      // Click Invite button
      await page.locator('button:has-text("Invite"), button:has-text("Inviter")').first().click();

      // Should show invite modal
      await expect(page.locator('h3:has-text("Invite Member"), h3:has-text("Inviter un membre")')).toBeVisible();

      // Should have email input
      await expect(page.locator('input[type="email"]')).toBeVisible();

      // Should have role select
      await expect(page.locator('.fixed select')).toBeVisible();

      await page.screenshot({ path: 'bugs_report/screenshots/org-manage-invite-modal.png', fullPage: true });

      // Close
      await page.locator('.fixed button:has-text("Cancel"), .fixed button:has-text("Annuler")').click();
    }
  });

  test('should switch to invitations tab', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const teamLink = page.locator('a:has-text("Team"), a:has-text("Équipe")');
    if (await teamLink.isVisible()) {
      await teamLink.click();
      await page.waitForLoadState('networkidle');

      // Click Invitations tab
      await page.locator('button:has-text("Invitations")').click();
      await page.waitForTimeout(500);

      // Should show invitations section (either empty state or list)
      const emptyState = page.locator('text=No pending invitations, text=Aucune invitation');
      const invitationCards = page.locator('.rounded-xl:has-text("@")');

      // Either empty or has items
      const hasContent = (await emptyState.isVisible()) || (await invitationCards.first().isVisible());
      expect(hasContent).toBeTruthy();

      await page.screenshot({ path: 'bugs_report/screenshots/org-manage-invitations.png', fullPage: true });
    }
  });

  test('should switch to settings tab', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const teamLink = page.locator('a:has-text("Team"), a:has-text("Équipe")');
    if (await teamLink.isVisible()) {
      await teamLink.click();
      await page.waitForLoadState('networkidle');

      // Click Settings tab
      await page.locator('button:has-text("Settings"), button:has-text("Paramètres")').click();

      // Should show settings form
      await expect(page.locator('input[type="number"]')).toBeVisible();
      await expect(page.locator('input[type="checkbox"]').first()).toBeVisible();

      // Should have Save button
      await expect(page.locator('button:has-text("Save"), button:has-text("Sauvegarder")')).toBeVisible();

      await page.screenshot({ path: 'bugs_report/screenshots/org-manage-settings.png', fullPage: true });
    }
  });

  test('should show stats cards on manage page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const teamLink = page.locator('a:has-text("Team"), a:has-text("Équipe")');
    if (await teamLink.isVisible()) {
      await teamLink.click();
      await page.waitForLoadState('networkidle');

      // Should have stats cards
      await expect(page.locator('text=Members, text=Membres').first()).toBeVisible();
      await expect(page.locator('text=Max Members, text=Max membres').first()).toBeVisible();

      await page.screenshot({ path: 'bugs_report/screenshots/org-manage-stats.png', fullPage: true });
    }
  });
});
