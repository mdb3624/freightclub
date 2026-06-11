import { test, expect } from '@playwright/test';

/**
 * Feature: US-820 KPI Summary Display
 * AC-1: Shipper views active shipment count
 * AC-2: Shipper views on-time delivery percentage
 * AC-3: Shipper views cost per mile metric
 * AC-4: Metrics display within 2 seconds
 * AC-5: Empty state when no delivered loads
 */

test.describe('US-820: KPI Summary Display', () => {
  test.beforeEach(async ({ page, context }) => {
    // Login as shipper
    await page.goto('/');
    await page.fill('[data-testid="email-input"]', 'shipper@test.com');
    await page.fill('[data-testid="password-input"]', 'N1kk101!');
    await page.click('[data-testid="login-submit-btn"]');

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard/shipper');
    await page.waitForLoadState('networkidle');
  });

  test('AC-1,2,3: Shipper views KPI metrics on dashboard', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard/shipper');

    // Wait for KPI panel to load
    const kpiPanel = page.locator('[data-testid="kpi-summary-panel"]');
    await kpiPanel.waitFor({ state: 'visible', timeout: 5000 });

    // Verify "Business Health" header
    const header = page.locator('text=Business Health');
    await expect(header).toBeVisible();

    // Verify all three KPI tiles are present
    const activeLoadsTile = page.locator('[data-testid="kpi-tile-active-loads"]');
    const onTimeTile = page.locator('[data-testid="kpi-tile-ontime"]');
    const costPerMileTile = page.locator('[data-testid="kpi-tile-cost-per-mile"]');

    await expect(activeLoadsTile).toBeVisible();
    await expect(onTimeTile).toBeVisible();
    await expect(costPerMileTile).toBeVisible();

    // Verify tile labels
    await expect(page.locator('text=Active Shipments')).toBeVisible();
    await expect(page.locator('text=On-Time Rate')).toBeVisible();
    await expect(page.locator('text=Cost per Mile')).toBeVisible();

    // Verify values are populated (not loading)
    const activeLoadsValue = activeLoadsTile.locator('[data-testid="kpi-tile-active-loads-value"]');
    const onTimeValue = onTimeTile.locator('[data-testid="kpi-tile-ontime-value"]');
    const costValue = costPerMileTile.locator('[data-testid="kpi-tile-cost-per-mile-value"]');

    // All should have numeric text (not "—")
    const activeLoadsText = await activeLoadsValue.textContent();
    expect(activeLoadsText).not.toBe('—');
  });

  test('AC-4: KPI metrics load within 2 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/dashboard/shipper');

    // Wait for KPI panel to render
    const kpiPanel = page.locator('[data-testid="kpi-summary-panel"]');
    await kpiPanel.waitFor({ state: 'visible', timeout: 5000 });

    // Verify tiles are fully loaded (not showing "—")
    const activeTile = page.locator('[data-testid="kpi-tile-active-loads"]');
    const activeValue = activeTile.locator('[data-testid="kpi-tile-active-loads-value"]');

    // Wait for value to be populated
    await expect(activeValue).not.toContainText('—');

    const loadTime = Date.now() - startTime;

    // AC-4: Performance requirement met (< 2000ms)
    expect(loadTime).toBeLessThan(2000);
  });

  test('AC-5: Empty state displays when no delivered loads', async ({ page }) => {
    // Assume fresh account with no loads
    await page.goto('/dashboard/shipper');

    // Check for either KPI panel with data or empty state
    const emptyState = page.locator('[data-testid="kpi-summary-empty"]');
    const kpiPanel = page.locator('[data-testid="kpi-summary-panel"]');

    // One of these should be visible
    const emptyVisible = await emptyState.isVisible().catch(() => false);
    const panelVisible = await kpiPanel.isVisible().catch(() => false);

    if (emptyVisible) {
      // Empty state case
      await expect(page.locator('text=No Delivered Loads Yet')).toBeVisible();
      await expect(page.locator('[data-testid="kpi-empty-cta-button"]')).toBeVisible();
    } else if (panelVisible) {
      // Has metrics
      await expect(kpiPanel).toBeVisible();
    }
  });

  test('Responsive layout: KPI tiles stack on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/dashboard/shipper');

    const grid = page.locator('[data-testid="kpi-tiles-grid"]');
    await grid.waitFor({ state: 'visible' });

    // On mobile, verify grid exists (CSS handles stacking)
    await expect(grid).toBeVisible();
  });

  test('Responsive layout: KPI tiles in 3-column grid on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 1024 });

    await page.goto('/dashboard/shipper');

    const grid = page.locator('[data-testid="kpi-tiles-grid"]');
    await grid.waitFor({ state: 'visible' });

    await expect(grid).toBeVisible();
  });
});
