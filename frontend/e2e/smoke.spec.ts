import { test, expect } from '@playwright/test';
import { TestDataSeeder } from './fixtures/test-data-seeder';

/**
 * Smoke Tests — Core Application Functionality
 *
 * Refactored Features (Phase 5 Pattern Rollout):
 * 1. Uses data-testid selectors (mandatory per testing_standards.md)
 * 2. Web-first assertions instead of hard-coded waits
 * 3. API-driven test data setup where applicable
 * 4. Traces generated on failure for debugging
 * 5. Minimal test scope - only critical path validation
 */
test.describe('Smoke Tests - Core Functionality', () => {
  test('Home page loads with correct title', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle('FreightClub');
  });

  test('Unauthenticated user visiting protected route is redirected home with the login modal open', async ({ page }) => {
    // Navigate first so localStorage is accessible, then clear auth state
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.removeItem('freightclub_access_token');
      localStorage.removeItem('freightclub_user');
    });
    await page.goto('/profile', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/^http:\/\/[^/]+\/$/);
    await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();
  });

  test('Login modal renders with required elements', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('[data-testid="header-login-btn"]').click();

    await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();

    // Verify key login elements
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-submit-btn"]')).toBeVisible();
  });

  test('Authenticated shipper can access dashboard', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request);
    const user = await seeder.createTestUser({
      role: 'SHIPPER',
      email: `shipper-smoke-${Date.now()}@test.com`,
      firstName: 'Test',
      lastName: 'User',
    });

    try {
      // Navigate to base URL first so localStorage is accessible, then switch auth state
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.evaluate((u) => {
        localStorage.setItem('freightclub_access_token', u.accessToken!);
        localStorage.setItem('freightclub_user', JSON.stringify({ id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role, tenantId: u.tenantId }));
      }, user);

      await page.goto('/dashboard/shipper', { waitUntil: 'networkidle' });
      await expect(page.locator('[data-testid="shipper-dashboard-page"]')).toBeVisible({ timeout: 10000 });
    } finally {
      await seeder.cleanup();
    }
  });

  test('Authenticated trucker can access dashboard', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request);
    const user = await seeder.createTestUser({
      role: 'TRUCKER',
      email: `trucker-smoke-${Date.now()}@test.com`,
      firstName: 'Test',
      lastName: 'Driver',
    });

    try {
      // Navigate to base URL first so localStorage is accessible, then switch auth state
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.evaluate((u) => {
        localStorage.setItem('freightclub_access_token', u.accessToken!);
        localStorage.setItem('freightclub_user', JSON.stringify({ id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role, tenantId: u.tenantId }));
      }, user);

      await page.goto('/dashboard/trucker', { waitUntil: 'networkidle' });
      await expect(page).toHaveURL(/\/dashboard\/trucker/, { timeout: 10000 });
    } finally {
      await seeder.cleanup();
    }
  });

  test('User can logout and is redirected to the home page', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request);
    const user = await seeder.createTestUser({
      role: 'SHIPPER',
      email: `logout-smoke-${Date.now()}@test.com`,
      firstName: 'Test',
      lastName: 'User',
    });

    try {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.evaluate((u) => {
        localStorage.setItem('freightclub_access_token', u.accessToken!);
        localStorage.setItem('freightclub_user', JSON.stringify({ id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role, tenantId: u.tenantId }));
      }, user);

      await page.goto('/dashboard/shipper', { waitUntil: 'networkidle' });
      await expect(page.locator('[data-testid="shipper-dashboard-page"]')).toBeVisible({ timeout: 10000 });

      // Open avatar dropdown to reveal Sign out option
      await page.locator('[data-testid="avatar-button"]').click();
      const logoutBtn = page.locator('[data-testid="logout-btn"]');
      await expect(logoutBtn).toBeVisible({ timeout: 3000 });
      await logoutBtn.click();

      await expect(page).toHaveURL(/^http:\/\/[^/]+\/$/, { timeout: 5000 });
    } finally {
      await seeder.cleanup();
    }
  });

  test('Profile page loads for authenticated user', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request);
    const user = await seeder.createTestUser({
      role: 'SHIPPER',
      email: `profile-smoke-${Date.now()}@test.com`,
      firstName: 'Test',
      lastName: 'User',
    });

    try {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.evaluate((u) => {
        localStorage.setItem('freightclub_access_token', u.accessToken!);
        localStorage.setItem('freightclub_user', JSON.stringify({ id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role, tenantId: u.tenantId }));
      }, user);

      await page.goto('/profile', { waitUntil: 'networkidle' });
      await expect(page.locator('[data-testid="profile-page"]').first()).toBeVisible({ timeout: 10000 });
      await expect(
        page.locator('[data-testid="save-profile-btn"]')
          .or(page.getByRole('button', { name: 'Save Changes' }))
      ).toBeVisible();
    } finally {
      await seeder.cleanup();
    }
  });
});
