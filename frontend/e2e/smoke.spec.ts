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

  test('Unauthenticated user visiting protected route is redirected to login', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/login/);
  });

  test('Login page renders with required elements', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });

    // Verify page URL
    await expect(page).toHaveURL(/\/login/);

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
      // Navigate to dashboard
      await page.goto('/dashboard', { waitUntil: 'networkidle' });

      // Verify dashboard loads
      await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible({ timeout: 5000 });

      // Verify key dashboard elements
      await expect(page.locator('[data-testid="shipper-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="load-board-section"]')).toBeVisible();
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
      // Navigate to dashboard
      await page.goto('/dashboard', { waitUntil: 'networkidle' });

      // Verify dashboard loads
      await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible({ timeout: 5000 });

      // Verify trucker-specific elements
      await expect(page.locator('[data-testid="trucker-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="available-loads-section"]')).toBeVisible();
    } finally {
      await seeder.cleanup();
    }
  });

  test('User can logout and is redirected to login', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request);
    const user = await seeder.createTestUser({
      role: 'SHIPPER',
      email: `logout-smoke-${Date.now()}@test.com`,
      firstName: 'Test',
      lastName: 'User',
    });

    try {
      // Navigate to dashboard (authenticated)
      await page.goto('/dashboard', { waitUntil: 'networkidle' });
      await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible({ timeout: 5000 });

      // Find and click logout button
      const logoutBtn = page.locator('[data-testid="logout-btn"]');
      await expect(logoutBtn).toBeVisible();
      await logoutBtn.click();

      // Verify redirected to login
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
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
      // Navigate to profile page
      await page.goto('/profile', { waitUntil: 'networkidle' });

      // Verify profile page loads
      await expect(page.locator('[data-testid="profile-page"]')).toBeVisible({ timeout: 5000 });

      // Verify profile form elements exist
      await expect(page.locator('[data-testid="save-profile-btn"]')).toBeVisible();
    } finally {
      await seeder.cleanup();
    }
  });
});
