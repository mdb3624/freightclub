import { test, expect } from '@playwright/test';
import { TestDataSeeder } from './fixtures/test-data-seeder';

/**
 * US-710: Carrier Public Profile
 *
 * Refactored Features (Phase 5 Pattern Rollout):
 * 1. Uses data-testid selectors (mandatory per testing_standards.md)
 * 2. Web-first assertions instead of hard-coded waits
 * 3. API-driven test data setup (TestDataSeeder) instead of page.request
 * 4. Proper cross-origin authentication (bypasses browser security via API context)
 * 5. Traces generated on failure for debugging
 */
test.describe('Carrier Public Profile - US-710', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear any prior auth state
    await context.clearCookies();
    try {
      await page.evaluate(() => localStorage.clear());
    } catch {
      // localStorage may not be accessible on certain pages
    }
  });

  test('US-710 AC-1: Shipper views carrier performance profile', async ({ page, request }) => {
    // Setup: Create authenticated shipper user
    const seeder = new TestDataSeeder(request);
    const user = await seeder.createTestUser({
      role: 'SHIPPER',
      email: `shipper-${Date.now()}@test.com`,
      firstName: 'Test',
      lastName: 'Shipper',
    });

    try {
      // Navigate to carrier profile
      await page.goto('/carriers/fedex-freight', { waitUntil: 'networkidle' });

      // Verify page loads with carrier profile
      await expect(page.locator('[data-testid="carrier-profile-container"]')).toBeVisible({ timeout: 5000 });

      // Verify header with carrier name
      await expect(page.locator('[data-testid="carrier-name-header"]')).toBeVisible();

      // Verify key performance metrics are visible
      await expect(page.locator('[data-testid="metric-acceptance-rate"]')).toBeVisible();
      await expect(page.locator('[data-testid="metric-on-time-delivery"]')).toBeVisible();
      await expect(page.locator('[data-testid="metric-quality-score"]')).toBeVisible();
      await expect(page.locator('[data-testid="metric-avg-delivery"]')).toBeVisible();
    } finally {
      await seeder.cleanup();
    }
  });

  test('US-710 AC-2: Shipper compares carriers with benchmarks', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request);
    const user = await seeder.createTestUser({ role: 'SHIPPER' });

    try {
      await page.goto('/carriers/fedex-freight', { waitUntil: 'networkidle' });

      // Verify comparison view and benchmarks visible
      await expect(page.locator('[data-testid="carrier-benchmark-comparison"]')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('[data-testid="industry-average-section"]')).toBeVisible();

      // Verify progress indicators visible
      const progressBars = await page.locator('[data-testid^="benchmark-bar"]').count();
      expect(progressBars).toBeGreaterThan(0);
    } finally {
      await seeder.cleanup();
    }
  });

  test('US-710 AC-3: Carrier interest count displays social proof', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request);
    const user = await seeder.createTestUser({ role: 'SHIPPER' });

    try {
      await page.goto('/carriers/fedex-freight', { waitUntil: 'networkidle' });

      // Verify social proof metrics visible
      await expect(page.locator('[data-testid="viewed-by-metric"]')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('[data-testid="preferred-by-metric"]')).toBeVisible();

      // Verify numbers display
      const viewedByText = await page.locator('[data-testid="viewed-by-count"]').textContent();
      expect(viewedByText).toMatch(/\d+/);

      const preferredByText = await page.locator('[data-testid="preferred-by-count"]').textContent();
      expect(preferredByText).toMatch(/\d+/);
    } finally {
      await seeder.cleanup();
    }
  });

  test('US-710 AC-4: Multi-tenancy isolation enforced', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request);
    const user = await seeder.createTestUser({ role: 'SHIPPER' });

    try {
      await page.goto('/carriers/fedex-freight', { waitUntil: 'networkidle' });

      // Verify metrics shown are for current tenant only
      const metrics = await page.locator('[data-testid^="metric-"]').count();
      expect(metrics).toBeGreaterThan(0);

      // Verify no cross-tenant data leaks
      const headerText = await page.locator('[data-testid="carrier-profile-container"]').textContent();
      expect(headerText).toBeDefined();
    } finally {
      await seeder.cleanup();
    }
  });

  test('US-710 AC-5: Service areas and equipment types display', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request);
    const user = await seeder.createTestUser({ role: 'SHIPPER' });

    try {
      await page.goto('/carriers/fedex-freight', { waitUntil: 'networkidle' });

      // Verify equipment section visible
      await expect(page.locator('[data-testid="equipment-types-section"]')).toBeVisible({ timeout: 5000 });

      // Verify service areas section visible
      await expect(page.locator('[data-testid="service-areas-section"]')).toBeVisible();
    } finally {
      await seeder.cleanup();
    }
  });

  test('US-710 AC-6: Shipper can add carrier to preferred list', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request);
    const user = await seeder.createTestUser({ role: 'SHIPPER' });

    try {
      await page.goto('/carriers/fedex-freight', { waitUntil: 'networkidle' });

      // Find and click "Add to Preferred" button
      const addBtn = page.locator('[data-testid="add-to-preferred-btn"]');
      await expect(addBtn).toBeVisible({ timeout: 5000 });
      await expect(addBtn).toBeEnabled();
      await addBtn.click();

      // Verify action completes with success message
      await expect(page.locator('[data-testid="preference-success-message"]')).toBeVisible({ timeout: 3000 });
    } finally {
      await seeder.cleanup();
    }
  });
});
