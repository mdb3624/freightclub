/**
 * Test: Cache Invalidation on Load Creation
 * Verifies that newly created loads appear in the Shipment Status panel
 * by testing the backend cache eviction + frontend query invalidation flow.
 */

import { test, expect } from '@playwright/test';

test.describe('Cache Invalidation: Load Creation', () => {
  test('US-103-v2: Newly created load appears in Shipment Status panel', async ({ page }) => {
    // 1. Navigate to login
    await page.goto('http://localhost:9090/login');
    await expect(page).toHaveTitle(/FreightClub|Login/i);

    // 2. Login as shipper
    const emailInput = page.locator('[data-testid="email-input"]');
    const passwordInput = page.locator('[data-testid="password-input"]');
    const loginBtn = page.locator('[data-testid="login-submit-btn"]');

    await emailInput.fill('shipper@test.com');
    await passwordInput.fill('N1kk101!');
    await loginBtn.click();

    // 3. Wait for redirect to dashboard
    await page.waitForURL('**/dashboard/shipper', { timeout: 10000 });
    await page.waitForTimeout(1000); // Let dashboard load

    // 4. Record initial shipment count
    const shipmentPanel = page.locator('[data-testid="shipment-status-section"]');
    await expect(shipmentPanel).toBeVisible();

    let initialLoadCount = 0;
    const shipmentRows = page.locator('[data-testid^="shipment-row-"]');
    initialLoadCount = await shipmentRows.count();
    console.log(`Initial load count: ${initialLoadCount}`);

    // 5. Click "Create Load" button
    const createLoadBtn = page.locator('[data-testid="quick-actions-post-load"]');
    await expect(createLoadBtn).toBeVisible();
    await createLoadBtn.click();

    // 6. Wait for navigation to load creation form
    await page.waitForURL('**/loads/new', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // 7. Fill form with test data
    const originStreetInput = page.locator('input[placeholder*="Street"]').first();
    const originCityInput = page.locator('input[placeholder*="City"]').first();
    const destinationCityInput = page.locator('input[placeholder*="City"]').nth(1);

    await originStreetInput.fill('123 Main St');
    await originCityInput.fill('New York');
    await destinationCityInput.fill('Los Angeles');

    // Fill Pickup date
    const pickupInputs = page.locator('input[type="datetime-local"]');
    await pickupInputs.first().fill('2026-06-25T10:00');

    // Fill Delivery date
    await pickupInputs.nth(1).fill('2026-06-27T14:00');

    // Fill Cargo weight
    const weightInput = page.locator('input[type="number"]');
    await weightInput.fill('5000');

    // 8. Submit form
    const submitBtn = page.locator('button:has-text("Create & Post Load")');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // 9. Wait for form submission and success state
    await page.waitForURL('**/dashboard/shipper', { timeout: 15000 });
    console.log('Form submitted, back at dashboard');

    // 10. Verify new load appears in shipment panel
    await page.waitForTimeout(2000); // Wait for cache invalidation + refetch

    const newLoadCount = await shipmentRows.count();
    console.log(`New load count after creation: ${newLoadCount}`);

    // Assert that at least one new load was added
    expect(newLoadCount).toBeGreaterThan(initialLoadCount);

    // Verify shipment panel is not showing "No active shipments"
    const emptyState = page.locator('text=No active shipments');
    const isVisible = await emptyState.isVisible().catch(() => false);
    expect(isVisible).toBe(false);

    console.log('✅ SUCCESS: Newly created load appears in Shipment Status panel!');
  });
});
