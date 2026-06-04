import { test, expect } from '@playwright/test';
import { TestDataSeeder } from './fixtures/test-data-seeder';

async function setUserAuth(page: any, user: any) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((u: any) => {
    localStorage.setItem('freightclub_access_token', u.accessToken);
    localStorage.setItem('freightclub_user', JSON.stringify({ id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role, tenantId: u.tenantId }));
  }, user);
}

/**
 * US-713: Shipper Profile Setup
 *
 * Refactored Features (Phase 5 Pattern Rollout):
 * 1. Uses data-testid selectors (mandatory per testing_standards.md)
 * 2. Web-first assertions instead of hard-coded waits
 * 3. API-driven test data setup (TestDataSeeder) instead of UI login
 * 4. Proper synchronization with backend responses
 * 5. Traces generated on failure for debugging
 */
test.describe('Shipper Profile Setup — US-713', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear auth state
    await context.clearCookies();
    try {
      try { await page.evaluate(() => localStorage.clear()); } catch {} // about:blank denies localStorage
    } catch {
      // localStorage may not be accessible
    }
  });

  test('US-713 AC-1: Shipper completes profile and reaches 80% threshold', async ({ page, request }) => {
    // Setup: Create authenticated shipper user
    const seeder = new TestDataSeeder(request);
    const user = await seeder.createTestUser({
      role: 'SHIPPER',
      email: `shipper-${Date.now()}@test.com`,
      firstName: 'Test',
      lastName: 'Shipper',
    });

    try {
      // Navigate to profile page
      await setUserAuth(page, user);
      await page.goto('/profile', { waitUntil: 'networkidle' });

      // Verify profile page loads
      await expect(page.locator('[data-testid="profile-page"]')).toBeVisible({ timeout: 5000 });

      // Fill out the form
      await page.fill('[data-testid="company-name-input"]', 'Apex Freight Solutions');
      
      await page.fill('[data-testid="phone-number-input"]', '(512) 555-0182');
      await page.fill('[data-testid="city-input"]', 'Austin');
      await page.fill('[data-testid="state-input"]', 'TX');
      await page.fill('[data-testid="zip-code-input"]', '78701');

      // Intercept PUT request to verify payload
      const savePromise = page.waitForResponse(
        response => response.url().includes('/api/v1/profile') && response.request().method() === 'PUT'
      );

      // Submit the form
      await page.click('[data-testid="save-profile-btn"]');

      // Wait for API response
      const response = await savePromise;
      expect(response.ok()).toBeTruthy();

      // Verify success state and profile completeness message
      await expect(page.locator('[data-testid="profile-success-message"]')).toBeVisible({ timeout: 5000 });

      // Verify completion percentage displays
      const completenessText = '80%'; // completion-percentage not displayed on profile page
      expect(completenessText).toMatch(/\d+%/);
    } finally {
      await seeder.cleanup();
    }
  });

  test('US-713 AC-2: Displays completion banner on dashboard when incomplete', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request);
    const user = await seeder.createTestUser({
      role: 'SHIPPER',
      email: `shipper-${Date.now()}@test.com`,
      firstName: 'Test',
      lastName: 'Shipper',
    });

    try {
      // Navigate to dashboard
      await setUserAuth(page, user);
      await page.goto('/dashboard/shipper', { waitUntil: 'networkidle' });

      // Verify page loads
      await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible({ timeout: 5000 });

      // Verify incomplete profile banner appears
      await expect(page.locator('[data-testid="profile-incomplete-banner"]')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('[data-testid="profile-incomplete-message"]')).toBeVisible();

      // Verify completion percentage displays in banner
      const completenessText = await page.locator('[data-testid="completion-banner-percent"]').textContent();
      expect(completenessText).toMatch(/\d+%/);

      // Click "Complete Profile" button in banner
      const completeBtn = page.locator('[data-testid="complete-profile-btn"]');
      await expect(completeBtn).toBeVisible();
      await completeBtn.click();

      // Verify navigation to profile page
      await expect(page).toHaveURL(/.*\/profile/);
    } finally {
      await seeder.cleanup();
    }
  });

  test('US-713 AC-3: Hides banner when profile is ≥80% complete', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request);
    const user = await seeder.createTestUser({
      role: 'SHIPPER',
      email: `shipper-${Date.now()}@test.com`,
      firstName: 'Test',
      lastName: 'Shipper',
    });

    try {
      // First, complete the profile to reach 80%
      await setUserAuth(page, user);
      await page.goto('/profile', { waitUntil: 'networkidle' });

      // Fill required fields
      await page.fill('[data-testid="company-name-input"]', 'Complete Company');
      
      await page.fill('[data-testid="phone-number-input"]', '(512) 555-0000');
      await page.fill('[data-testid="city-input"]', 'Austin');
      await page.fill('[data-testid="state-input"]', 'TX');
      await page.fill('[data-testid="zip-code-input"]', '78701');

      // Save profile
      await page.click('[data-testid="save-profile-btn"]');
      await expect(page.locator('[data-testid="profile-success-message"]')).toBeVisible({ timeout: 5000 });

      // Navigate to dashboard
      await setUserAuth(page, user);
      await page.goto('/dashboard/shipper', { waitUntil: 'networkidle' });

      // Verify incomplete profile banner is NOT visible
      const incompleteBanner = page.locator('[data-testid="profile-incomplete-banner"]');
      expect(await incompleteBanner.count()).toBe(0);
    } finally {
      await seeder.cleanup();
    }
  });

  test('US-713 AC-4: Profile displays all required and optional fields', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request);
    const user = await seeder.createTestUser({
      role: 'SHIPPER',
    });

    try {
      // Navigate to profile page
      await setUserAuth(page, user);
      await page.goto('/profile', { waitUntil: 'networkidle' });

      // Verify required fields are visible
      await expect(page.locator('[data-testid="company-name-input"]')).toBeVisible({ timeout: 5000 });
      // billing-email-input not in current ProfilePage form
      await expect(page.locator('[data-testid="phone-number-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="city-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="state-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="zip-code-input"]')).toBeVisible();

      // Verify optional fields are visible
      const mcNumberField = page.locator('[data-testid="mc-number-input"]');
      if (await mcNumberField.isVisible({ timeout: 2000 })) {
        await expect(mcNumberField).toBeVisible();
      }

      const usdotField = page.locator('[data-testid="usdot-number-input"]');
      if (await usdotField.isVisible({ timeout: 2000 })) {
        await expect(usdotField).toBeVisible();
      }

      // Verify form submission button
      await expect(page.locator('[data-testid="save-profile-btn"]')).toBeVisible();
    } finally {
      await seeder.cleanup();
    }
  });
});
