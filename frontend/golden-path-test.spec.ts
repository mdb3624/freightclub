import { test, expect } from '@playwright/test';

test.describe('US-103-v2 Golden Path: Create Load Flow', () => {
  test('should navigate from dashboard → create load → fill form → submit → see load in panel', async ({ page }) => {
    // 1. Navigate to login
    await page.goto('http://localhost:9090/login');

    // 2. Login as shipper
    await page.fill('[data-testid="email-input"]', 'shipper@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-submit-btn"]');

    // 3. Wait for dashboard to load
    await page.waitForURL('**/dashboard/shipper', { timeout: 10000 });
    expect(page.url()).toContain('/dashboard/shipper');

    // 4. Verify "Post Load" button exists in Quick Actions
    await expect(page.locator('[data-testid="post-load-button"]')).toBeVisible();

    // 5. Click "Post Load" button
    await page.click('[data-testid="post-load-button"]');

    // 6. Wait for redirect to load creation page
    await page.waitForURL('**/loads/new', { timeout: 10000 });
    expect(page.url()).toContain('/loads/new');

    // 7. Fill out form fields
    await page.fill('[data-testid="originAddress1-input"]', '123 Main St');
    await page.fill('[data-testid="originCity-input"]', 'New York');
    await page.selectOption('[data-testid="originState-select"]', 'NY');
    await page.fill('[data-testid="originZip-input"]', '10001');

    await page.fill('[data-testid="destinationAddress1-input"]', '456 Oak Ave');
    await page.fill('[data-testid="destinationCity-input"]', 'Los Angeles');
    await page.selectOption('[data-testid="destinationState-select"]', 'CA');
    await page.fill('[data-testid="destinationZip-input"]', '90001');

    await page.fill('[data-testid="pickupFrom-input"]', '06/20/2026, 10:00 AM');
    await page.fill('[data-testid="pickupTo-input"]', '06/20/2026, 06:00 PM');
    await page.fill('[data-testid="deliveryFrom-input"]', '06/21/2026, 10:00 AM');
    await page.fill('[data-testid="deliveryTo-input"]', '06/21/2026, 06:00 PM');

    await page.fill('[data-testid="commodity-input"]', 'Electronic Equipment');
    await page.fill('[data-testid="weightLbs-input"]', '5000');

    await page.selectOption('[data-testid="equipmentType-select"]', 'DRY_VAN');
    await page.fill('[data-testid="payRate-input"]', '2.50');
    await page.selectOption('[data-testid="payRateType-select"]', 'PER_MILE');
    await page.selectOption('[data-testid="paymentTerms-select"]', 'NET_7');

    // 8. Submit form
    await page.click('[data-testid="create-load-submit-btn"]');

    // 9. Wait for redirect back to dashboard
    await page.waitForURL('**/dashboard/shipper', { timeout: 15000 });
    expect(page.url()).toContain('/dashboard/shipper');

    // 10. Verify success message appears
    await expect(page.locator('text=Load created successfully')).toBeVisible({ timeout: 5000 });

    // 11. Verify load appears in Shipment Status Panel
    await page.waitForSelector('[data-testid="shipment-status-panel"]', { timeout: 5000 });

    // 12. Check that new load is visible in the panel with correct info
    const shipmentPanel = page.locator('[data-testid="shipment-status-panel"]');
    await expect(shipmentPanel).toContainText('Electronic Equipment');
    await expect(shipmentPanel).toContainText('New York, NY');
    await expect(shipmentPanel).toContainText('Los Angeles, CA');

    console.log('✅ Golden path test PASSED');
  });
});
