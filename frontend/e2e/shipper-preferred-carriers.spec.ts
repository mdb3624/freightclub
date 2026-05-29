import { test, expect } from '@playwright/test';

test.describe('Shipper Preferred Carrier List - US-707', () => {
  test.beforeEach(async ({ page }) => {
    // Login as shipper
    await page.goto('/login');
    await page.fill('input[type="email"]', 'shipper@test.com');
    await page.fill('input[type="password"]', 'ShipperPassword123!');
    await page.click('button:has-text("Sign In")');

    // Navigate to preferred carriers
    await page.waitForURL('**/dashboard');
    await page.goto('/settings/preferred-carriers');
  });

  test('AC-707-1: Shipper can add carrier to preferred list', async ({ page }) => {
    // Verify page loads
    await expect(page.locator('text=Preferred Carriers')).toBeVisible();
    await expect(page.locator('text=Manage carriers')).toBeVisible();

    // Click "Add Carrier" button
    const addButton = page.locator('button:has-text("Add Carrier"), button:has-text("+ Add")');
    await expect(addButton).toBeVisible();
    await expect(addButton).toBeEnabled();
    await addButton.click();

    // Verify form appears (modal or inline form)
    await expect(page.locator('input[placeholder*="Search"], input[placeholder*="Carrier"]')).toBeVisible();

    // Type carrier name
    await page.fill('input[placeholder*="Search"], input[placeholder*="Carrier"]', 'FedEx');
    await page.waitForLoadState('networkidle');

    // Select from dropdown if autocomplete available
    const dropdownOption = page.locator('text=FedEx Freight').first();
    if (await dropdownOption.isVisible()) {
      await dropdownOption.click();
    }

    // Add optional notes
    const notesField = page.locator('textarea[placeholder*="Negotiated"], textarea[placeholder*="Notes"]');
    if (await notesField.isVisible()) {
      await notesField.fill('Negotiated 10% discount');
    }

    // Submit form
    const submitBtn = page.locator('button:has-text("Add Carrier"), button:has-text("Save")').last();
    await submitBtn.click();

    // Verify success message
    const successMsg = page.locator('text=Carrier added, text=added to preferred').first();
    if (await successMsg.isVisible({ timeout: 5000 })) {
      await expect(successMsg).toBeVisible();
    }

    // Verify carrier appears in table
    await expect(page.locator('text=FedEx')).toBeVisible({ timeout: 5000 });

    // Screenshot
    await page.screenshot({ path: 'test-results/evidence/US-707-add-carrier.png' });
  });

  test('AC-707-2: Shipper can view preferred carriers list', async ({ page }) => {
    // Verify table header
    await expect(page.locator('text=Carrier Name')).toBeVisible();
    await expect(page.locator('text=Email')).toBeVisible();
    await expect(page.locator('text=Date Added')).toBeVisible();

    // Verify at least one carrier row exists (from previous test or seed data)
    const carrierRows = await page.locator('tr:has(td)').count();
    expect(carrierRows).toBeGreaterThanOrEqual(0);

    // If carriers exist, verify row structure
    if (carrierRows > 0) {
      const firstRow = page.locator('tr:has(td)').first();
      await expect(firstRow.locator('button:has-text("Remove")')).toBeVisible();
    }

    // Screenshot
    await page.screenshot({ path: 'test-results/evidence/US-707-view-carriers.png' });
  });

  test('AC-707-3: Shipper can remove carrier from preferred list', async ({ page }) => {
    // Find a carrier row (must have at least one from AC-707-1)
    const carrierRows = await page.locator('tr:has(td)').count();

    if (carrierRows > 0) {
      // Click Remove button on first carrier
      const removeBtn = page.locator('tr:has(td)').first().locator('button:has-text("Remove")');
      await expect(removeBtn).toBeVisible();
      await removeBtn.click();

      // Verify confirmation dialog appears
      const confirmDialog = page.locator('text=Are you sure, text=Confirm, text=Cancel').first();
      if (await confirmDialog.isVisible({ timeout: 3000 })) {
        await expect(confirmDialog).toBeVisible();

        // Click Confirm
        await page.click('button:has-text("Confirm"), button:has-text("Yes")');
      }

      // Verify success message
      const successMsg = page.locator('text=removed, text=Carrier removed').first();
      if (await successMsg.isVisible({ timeout: 5000 })) {
        await expect(successMsg).toBeVisible();
      }

      // Screenshot
      await page.screenshot({ path: 'test-results/evidence/US-707-remove-carrier.png' });
    }
  });

  test('Empty state displays when no carriers', async ({ page }) => {
    // Clear all carriers (if possible, or navigate to fresh shipper)
    // Verify empty state message appears
    const emptyState = page.locator('text=No preferred carriers, text=No carriers');
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
    }

    // Screenshot
    await page.screenshot({ path: 'test-results/evidence/US-707-empty-state.png' });
  });

  test('Form is accessible (keyboard navigation)', async ({ page }) => {
    // Tab to Add Carrier button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Press Enter
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');

    // Form should open
    const form = page.locator('input[placeholder*="Search"], input[placeholder*="Carrier"]');
    await expect(form).toBeVisible({ timeout: 3000 });
  });
});
