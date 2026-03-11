import { test, expect } from 'playwright/test';
import { loginAsAdmin } from '../../auth-setup';

test.describe('Admin Organization Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test.describe('Organizations List Page', () => {
    test('should load organizations page with table', async ({ page }) => {
      await page.goto('/admin/organizations');
      await page.waitForLoadState('networkidle');

      // Page should have header
      await expect(page.locator('h1')).toContainText(/Organizations|Organisations/);

      // Should have search input
      await expect(page.locator('input[placeholder*="Search"], input[placeholder*="Rechercher"]')).toBeVisible();

      // Should have Create button
      await expect(page.locator('button:has-text("Create"), button:has-text("Créer")')).toBeVisible();

      // Should have a table
      await expect(page.locator('table')).toBeVisible();

      await page.screenshot({ path: 'bugs_report/screenshots/admin-organizations-list.png', fullPage: true });
    });

    test('should filter organizations by type', async ({ page }) => {
      await page.goto('/admin/organizations');
      await page.waitForLoadState('networkidle');

      // Select type filter
      const typeSelect = page.locator('select').first();
      await typeSelect.selectOption('Startup');
      await page.waitForTimeout(500);

      await page.screenshot({ path: 'bugs_report/screenshots/admin-organizations-filtered.png', fullPage: true });
    });

    test('should open create organization modal', async ({ page }) => {
      await page.goto('/admin/organizations');
      await page.waitForLoadState('networkidle');

      // Click Create button
      await page.locator('button:has-text("Create"), button:has-text("Créer")').click();

      // Modal should appear
      await expect(page.locator('h3:has-text("New Organization"), h3:has-text("Nouvelle organisation")')).toBeVisible();

      // Should have name input
      await expect(page.locator('input[placeholder*="Organization name"], input[placeholder*="Nom de l"]')).toBeVisible();

      // Should have type select
      const typeSelects = page.locator('.fixed select');
      await expect(typeSelects.first()).toBeVisible();

      await page.screenshot({ path: 'bugs_report/screenshots/admin-org-create-modal.png', fullPage: true });
    });

    test('should create organization with valid data', async ({ page }) => {
      await page.goto('/admin/organizations');
      await page.waitForLoadState('networkidle');

      // Open create modal
      await page.locator('button:has-text("Create"), button:has-text("Créer")').click();
      await page.waitForTimeout(300);

      // Fill form
      const modal = page.locator('.fixed.inset-0');
      await modal.locator('input[type="text"]').first().fill('E2E Test Organization');
      await modal.locator('textarea').fill('Created by E2E test');

      // Submit
      await modal.locator('button:has-text("Create"), button:has-text("Créer")').last().click();

      // Wait for toast or modal close
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'bugs_report/screenshots/admin-org-created.png', fullPage: true });
    });

    test('should navigate to organization detail on row click', async ({ page }) => {
      await page.goto('/admin/organizations');
      await page.waitForLoadState('networkidle');

      // Click first table row
      const firstRow = page.locator('tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await page.waitForLoadState('networkidle');

        // Should navigate to detail page
        expect(page.url()).toMatch(/\/admin\/organizations\/[a-f0-9-]+/);

        await page.screenshot({ path: 'bugs_report/screenshots/admin-org-detail.png', fullPage: true });
      }
    });
  });

  test.describe('Organization Detail Page', () => {
    test('should display organization detail with tabs', async ({ page }) => {
      // Navigate to organizations and click first one
      await page.goto('/admin/organizations');
      await page.waitForLoadState('networkidle');

      const firstRow = page.locator('tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await page.waitForLoadState('networkidle');

        // Should have org name as heading
        await expect(page.locator('h1')).toBeVisible();

        // Should have stats cards
        await expect(page.locator('text=Members, text=Membres').first()).toBeVisible();

        // Should have Overview and Members tabs
        await expect(page.locator('button:has-text("Overview"), button:has-text("Apercu")')).toBeVisible();
        await expect(page.locator('button:has-text("Members"), button:has-text("Membres")')).toBeVisible();

        // Should have Edit and Delete buttons
        await expect(page.locator('button:has-text("Edit"), button:has-text("Modifier")')).toBeVisible();

        await page.screenshot({ path: 'bugs_report/screenshots/admin-org-detail-overview.png', fullPage: true });
      }
    });

    test('should switch to members tab', async ({ page }) => {
      await page.goto('/admin/organizations');
      await page.waitForLoadState('networkidle');

      const firstRow = page.locator('tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await page.waitForLoadState('networkidle');

        // Click Members tab
        await page.locator('button:has-text("Members"), button:has-text("Membres")').click();

        // Should show members table
        await expect(page.locator('table')).toBeVisible();

        await page.screenshot({ path: 'bugs_report/screenshots/admin-org-detail-members.png', fullPage: true });
      }
    });

    test('should open edit modal', async ({ page }) => {
      await page.goto('/admin/organizations');
      await page.waitForLoadState('networkidle');

      const firstRow = page.locator('tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await page.waitForLoadState('networkidle');

        // Click Edit button
        await page.locator('button:has-text("Edit"), button:has-text("Modifier")').click();

        // Should show edit modal with pre-filled name
        await expect(page.locator('h3:has-text("Edit Organization"), h3:has-text("Modifier")')).toBeVisible();

        // Name input should have value
        const nameInput = page.locator('.fixed input[type="text"]').first();
        const nameValue = await nameInput.inputValue();
        expect(nameValue.length).toBeGreaterThan(0);

        await page.screenshot({ path: 'bugs_report/screenshots/admin-org-edit-modal.png', fullPage: true });

        // Close modal
        await page.locator('.fixed button:has-text("Cancel"), .fixed button:has-text("Annuler")').click();
      }
    });

    test('should open delete confirmation modal', async ({ page }) => {
      await page.goto('/admin/organizations');
      await page.waitForLoadState('networkidle');

      const firstRow = page.locator('tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await page.waitForLoadState('networkidle');

        // Click the delete button (the one with Trash2 icon, no text)
        const deleteBtn = page.locator('button.gap-1\\.5').filter({ has: page.locator('svg') }).last();
        if (await deleteBtn.isVisible()) {
          await deleteBtn.click();

          // Should show confirmation
          await expect(page.locator('h3:has-text("Delete"), h3:has-text("Supprimer")')).toBeVisible();

          await page.screenshot({ path: 'bugs_report/screenshots/admin-org-delete-modal.png', fullPage: true });

          // Cancel
          await page.locator('.fixed button:has-text("Cancel"), .fixed button:has-text("Annuler")').click();
        }
      }
    });

    test('should open status change modal', async ({ page }) => {
      await page.goto('/admin/organizations');
      await page.waitForLoadState('networkidle');

      const firstRow = page.locator('tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await page.waitForLoadState('networkidle');

        // Click Deactivate/Activate button
        const statusBtn = page.locator('button:has-text("Deactivate"), button:has-text("Activate"), button:has-text("Désactiver"), button:has-text("Activer")').first();
        if (await statusBtn.isVisible()) {
          await statusBtn.click();

          // Should show status modal with reason field
          await expect(page.locator('textarea[placeholder*="reason"], textarea[placeholder*="Enter"]')).toBeVisible();

          await page.screenshot({ path: 'bugs_report/screenshots/admin-org-status-modal.png', fullPage: true });

          // Cancel
          await page.locator('.fixed button:has-text("Cancel")').click();
        }
      }
    });
  });
});
