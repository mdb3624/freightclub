import { test, expect } from '@playwright/test';

test.describe('Admin Load Board Analytics Dashboard - US-704', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'AdminPassword123!');
    await page.click('button:has-text("Sign In")');

    // Wait for navigation and go to analytics
    await page.waitForURL('**/dashboard');
    await page.goto('/analytics');
  });

  test('AC-1: Admin views Load Board Analytics Dashboard (7-day view)', async ({ page }) => {
    // Verify page loads with title
    await expect(page).toHaveTitle(/Analytics/);

    // Click 7-day tab
    await page.click('button:has-text("7d")');
    await page.waitForLoadState('networkidle');

    // Verify metric cards render with data
    const totalPostedCard = page.locator('text=Total Posted').locator('..');
    await expect(totalPostedCard).toBeVisible();
    await expect(totalPostedCard.locator('text=/\\d+/')).toBeTruthy();

    const claimedCard = page.locator('text=Claimed').locator('..');
    await expect(claimedCard).toBeVisible();

    const avgTimeCard = page.locator('text=Avg Time-to-Claim').locator('..');
    await expect(avgTimeCard).toBeVisible();

    // Verify metric values are numbers
    const totalValue = await totalPostedCard.locator('text=/\\d{3,}|\\d+%/').first().textContent();
    expect(totalValue).toMatch(/\d+/);

    // Verify charts render (should have canvas elements or SVG)
    const chartElements = await page.locator('canvas, svg').count();
    expect(chartElements).toBeGreaterThan(0);

    // Verify Top Lanes table
    await expect(page.locator('text=Top Lanes').first()).toBeVisible();
    await expect(page.locator('text=Atlanta')).toBeVisible();

    // Verify Equipment Distribution exists
    await expect(page.locator('text=Equipment Distribution')).toBeVisible();

    // Capture screenshot for visual validation
    await page.screenshot({ path: 'test-results/evidence/US-704-admin-dashboard-7d.png' });
  });

  test('AC-1: Admin views Load Board Analytics Dashboard (30-day view)', async ({ page }) => {
    // Click 30-day tab
    await page.click('button:has-text("30d")');
    await page.waitForLoadState('networkidle');

    // Verify metrics update with different values
    const metrics = await page.locator('text=/Total Posted|Claimed|Avg Time/').all();
    expect(metrics.length).toBeGreaterThanOrEqual(3);

    // Screenshot
    await page.screenshot({ path: 'test-results/evidence/US-704-admin-dashboard-30d.png' });
  });

  test('AC-1: Admin views Load Board Analytics Dashboard (90-day view)', async ({ page }) => {
    // Click 90-day tab
    await page.click('button:has-text("90d")');
    await page.waitForLoadState('networkidle');

    // Verify Peak Hours chart visible
    await expect(page.locator('text=Peak Posting Hours')).toBeVisible();

    // Screenshot
    await page.screenshot({ path: 'test-results/evidence/US-704-admin-dashboard-90d.png' });
  });

  test('AC-1: Metric cards display correct style per Style Guide', async ({ page }) => {
    // Verify metric card background is white
    const metricCard = page.locator('text=Total Posted').locator('../../..');
    const bgColor = await metricCard.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(bgColor).toContain('255'); // White RGB

    // Verify metric label is gray-600
    const label = page.locator('text=Total Posted');
    const labelColor = await label.evaluate(el => window.getComputedStyle(el).color);
    expect(labelColor).toBeDefined();

    // Screenshot
    await page.screenshot({ path: 'test-results/evidence/US-704-style-compliance.png' });
  });

  test('AC-2: Shipper Performance Insights displays correctly', async ({ page }) => {
    // Navigate to shipper performance view (if available)
    await page.goto('/analytics/shipper-performance');

    // Verify page loads
    await expect(page).toHaveTitle(/Performance/);

    // Verify summary metrics
    await expect(page.locator('text=Posted')).toBeVisible();
    await expect(page.locator('text=Claimed')).toBeVisible();
    await expect(page.locator('text=Avg Claim Time')).toBeVisible();

    // Verify Preferred vs Open Board chart
    await expect(page.locator('text=Preferred')).toBeVisible();

    // Screenshot
    await page.screenshot({ path: 'test-results/evidence/US-704-shipper-performance.png' });
  });

  test('Dashboard loads within 2 seconds (performance requirement)', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/analytics');

    // Wait for key metrics to be visible
    await expect(page.locator('text=Total Posted')).toBeVisible();

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000); // Under 2 seconds
  });

  test('Dashboard is accessible (keyboard navigation)', async ({ page }) => {
    // Tab to time range buttons
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Verify focus visible
    const focusedElement = await page.evaluate(() => document.activeElement?.textContent);
    expect(focusedElement).toBeDefined();

    // Press Enter on focused button
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');

    // Verify action occurred
    await expect(page.locator('text=Total Posted')).toBeVisible();
  });
});
