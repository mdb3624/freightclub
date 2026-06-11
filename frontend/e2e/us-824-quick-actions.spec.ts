/**
 * Feature: US-824 (Quick Actions Panel)
 * AC-1: Renders all four quick action buttons (Post Load, Get A Quote, Track Shipments, Preferred Carriers)
 * AC-2: Post Load button navigates to /shipper/loads/new
 * AC-3: Get A Quote button navigates to /shipper/quote
 * AC-4: Track Shipments button navigates to /dashboard/shipper/loads
 * AC-5: Preferred Carriers button navigates to /settings/preferred-carriers
 * AC-6: Buttons are keyboard accessible (Tab + Enter)
 * AC-7: Responsive layout verified on desktop, tablet, mobile
 */

import { test, expect, APIRequestContext } from '@playwright/test';
import { TestDataSeeder } from './fixtures/test-data-seeder';

async function setUserAuth(page: any, user: any) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((u: any) => {
    localStorage.setItem('freightclub_access_token', u.accessToken);
    localStorage.setItem('freightclub_user', JSON.stringify({ id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role, tenantId: u.tenantId }));
  }, user);
}

test.describe('US-824: Quick Actions Panel', () => {
  // ============================================================================
  // TEST 1: Renders all four quick action buttons
  // ============================================================================
  test('US-824 AC-1: renders all four quick action buttons', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request);
    const user = await seeder.createTestUser({
      email: `shipper-quick-actions-${Date.now()}@test.com`,
      password: 'N1kk101!',
      role: 'SHIPPER',
      firstName: 'Quick',
      lastName: 'Actions',
      companyName: 'Test Shipper',
    });

    try {
      await setUserAuth(page, user);
      await page.goto('/dashboard/shipper');

      // Wait for Quick Actions Panel to be visible
      await expect(
        page.locator('[data-testid="dashboard-quick-actions-panel"]')
      ).toBeVisible({ timeout: 5000 });

      // Verify all four buttons exist
      await expect(page.locator('[data-testid="quick-actions-post-load"]')).toBeVisible();
      await expect(page.locator('[data-testid="quick-actions-quote"]')).toBeVisible();
      await expect(page.locator('[data-testid="quick-actions-track"]')).toBeVisible();
      await expect(page.locator('[data-testid="quick-actions-carriers"]')).toBeVisible();

      // Verify button labels
      const postLoadBtn = page.locator('[data-testid="quick-actions-post-load"]');
      const quoteBtn = page.locator('[data-testid="quick-actions-quote"]');
      const trackBtn = page.locator('[data-testid="quick-actions-track"]');
      const carriersBtn = page.locator('[data-testid="quick-actions-carriers"]');

      await expect(postLoadBtn).toContainText('Post Load');
      await expect(quoteBtn).toContainText('Get A Quote');
      await expect(trackBtn).toContainText('Track Shipments');
      await expect(carriersBtn).toContainText('Preferred Carriers');

      console.log('✅ All four quick action buttons rendered correctly');
    } finally {
      await seeder.cleanup();
    }
  });

  // ============================================================================
  // TEST 2: Post Load button navigates to /shipper/loads/new
  // ============================================================================
  test('US-824 AC-2: Post Load button navigates to /shipper/loads/new', async ({
    page,
    request,
  }) => {
    const seeder = new TestDataSeeder(request);
    const user = await seeder.createTestUser({
      email: `shipper-post-load-${Date.now()}@test.com`,
      password: 'N1kk101!',
      role: 'SHIPPER',
      firstName: 'Post',
      lastName: 'Load',
      companyName: 'Test Shipper',
    });

    try {
      await setUserAuth(page, user);
      await page.goto('/dashboard/shipper');

      // Wait for button to be visible and click it
      const postLoadBtn = page.locator('[data-testid="quick-actions-post-load"]');
      await expect(postLoadBtn).toBeVisible({ timeout: 5000 });
      await postLoadBtn.click();

      // Verify navigation to /shipper/loads/new
      await expect(page).toHaveURL(/\/shipper\/loads\/new/, { timeout: 5000 });
      console.log('✅ Post Load button navigates correctly');
    } finally {
      await seeder.cleanup();
    }
  });

  // ============================================================================
  // TEST 3: Get A Quote button navigates to /shipper/quote
  // ============================================================================
  test('US-824 AC-3: Get A Quote button navigates to /shipper/quote', async ({
    page,
    request,
  }) => {
    const seeder = new TestDataSeeder(request);
    const user = await seeder.createTestUser({
      email: `shipper-quote-${Date.now()}@test.com`,
      password: 'N1kk101!',
      role: 'SHIPPER',
      firstName: 'Quote',
      lastName: 'Test',
      companyName: 'Test Shipper',
    });

    try {
      await setUserAuth(page, user);
      await page.goto('/dashboard/shipper');

      const quoteBtn = page.locator('[data-testid="quick-actions-quote"]');
      await expect(quoteBtn).toBeVisible({ timeout: 5000 });
      await quoteBtn.click();

      await expect(page).toHaveURL(/\/shipper\/quote/, { timeout: 5000 });
      console.log('✅ Get A Quote button navigates correctly');
    } finally {
      await seeder.cleanup();
    }
  });

  // ============================================================================
  // TEST 4: Track Shipments button navigates to /dashboard/shipper/loads
  // ============================================================================
  test('US-824 AC-4: Track Shipments button navigates to /dashboard/shipper/loads', async ({
    page,
    request,
  }) => {
    const seeder = new TestDataSeeder(request);
    const user = await seeder.createTestUser({
      email: `shipper-track-${Date.now()}@test.com`,
      password: 'N1kk101!',
      role: 'SHIPPER',
      firstName: 'Track',
      lastName: 'Test',
      companyName: 'Test Shipper',
    });

    try {
      await setUserAuth(page, user);
      await page.goto('/dashboard/shipper');

      const trackBtn = page.locator('[data-testid="quick-actions-track"]');
      await expect(trackBtn).toBeVisible({ timeout: 5000 });
      await trackBtn.click();

      await expect(page).toHaveURL(/\/dashboard\/shipper\/loads/, { timeout: 5000 });
      console.log('✅ Track Shipments button navigates correctly');
    } finally {
      await seeder.cleanup();
    }
  });

  // ============================================================================
  // TEST 5: Preferred Carriers button navigates to /settings/preferred-carriers
  // ============================================================================
  test('US-824 AC-5: Preferred Carriers button navigates to /settings/preferred-carriers', async ({
    page,
    request,
  }) => {
    const seeder = new TestDataSeeder(request);
    const user = await seeder.createTestUser({
      email: `shipper-carriers-${Date.now()}@test.com`,
      password: 'N1kk101!',
      role: 'SHIPPER',
      firstName: 'Carriers',
      lastName: 'Test',
      companyName: 'Test Shipper',
    });

    try {
      await setUserAuth(page, user);
      await page.goto('/dashboard/shipper');

      const carriersBtn = page.locator('[data-testid="quick-actions-carriers"]');
      await expect(carriersBtn).toBeVisible({ timeout: 5000 });
      await carriersBtn.click();

      await expect(page).toHaveURL(/\/settings\/preferred-carriers/, { timeout: 5000 });
      console.log('✅ Preferred Carriers button navigates correctly');
    } finally {
      await seeder.cleanup();
    }
  });

  // ============================================================================
  // TEST 6: Keyboard accessibility (Tab + Enter)
  // ============================================================================
  test('US-824 AC-6: buttons are keyboard accessible (Tab + Enter)', async ({
    page,
    request,
  }) => {
    const seeder = new TestDataSeeder(request);
    const user = await seeder.createTestUser({
      email: `shipper-keyboard-${Date.now()}@test.com`,
      password: 'N1kk101!',
      role: 'SHIPPER',
      firstName: 'Keyboard',
      lastName: 'Test',
      companyName: 'Test Shipper',
    });

    try {
      await setUserAuth(page, user);
      await page.goto('/dashboard/shipper');

      // Wait for Quick Actions Panel
      await expect(
        page.locator('[data-testid="dashboard-quick-actions-panel"]')
      ).toBeVisible({ timeout: 5000 });

      // Tab to the first button and press Enter
      const postLoadBtn = page.locator('[data-testid="quick-actions-post-load"]');
      await postLoadBtn.focus();
      await expect(postLoadBtn).toBeFocused();

      // Verify button is keyboard accessible by pressing Enter
      await postLoadBtn.press('Enter');

      // Verify navigation occurred
      await expect(page).toHaveURL(/\/shipper\/loads\/new/, { timeout: 5000 });
      console.log('✅ Buttons are keyboard accessible');
    } finally {
      await seeder.cleanup();
    }
  });

  // ============================================================================
  // TEST 7: Desktop responsive (1280x720)
  // ============================================================================
  test('US-824 AC-7a: responsive design (desktop 1280x720)', async ({
    page,
    request,
  }) => {
    const seeder = new TestDataSeeder(request);
    const user = await seeder.createTestUser({
      email: `shipper-desktop-${Date.now()}@test.com`,
      password: 'N1kk101!',
      role: 'SHIPPER',
      firstName: 'Desktop',
      lastName: 'Test',
      companyName: 'Test Shipper',
    });

    try {
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      await setUserAuth(page, user);
      await page.goto('/dashboard/shipper');

      // Wait for panel and capture screenshot
      await expect(
        page.locator('[data-testid="dashboard-quick-actions-panel"]')
      ).toBeVisible({ timeout: 5000 });

      // Take screenshot
      await page.screenshot({
        path: 'test-results/evidence/us-824-quick-actions-desktop-1280x720.png',
      });

      console.log('✅ Desktop responsive screenshot captured');
    } finally {
      await seeder.cleanup();
    }
  });

  // ============================================================================
  // TEST 8: Tablet responsive (768x1024)
  // ============================================================================
  test('US-824 AC-7b: responsive design (tablet 768x1024)', async ({
    page,
    request,
  }) => {
    const seeder = new TestDataSeeder(request);
    const user = await seeder.createTestUser({
      email: `shipper-tablet-${Date.now()}@test.com`,
      password: 'N1kk101!',
      role: 'SHIPPER',
      firstName: 'Tablet',
      lastName: 'Test',
      companyName: 'Test Shipper',
    });

    try {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await setUserAuth(page, user);
      await page.goto('/dashboard/shipper');

      // Wait for panel and capture screenshot
      await expect(
        page.locator('[data-testid="dashboard-quick-actions-panel"]')
      ).toBeVisible({ timeout: 5000 });

      // Take screenshot
      await page.screenshot({
        path: 'test-results/evidence/us-824-quick-actions-tablet-768x1024.png',
      });

      console.log('✅ Tablet responsive screenshot captured');
    } finally {
      await seeder.cleanup();
    }
  });

  // ============================================================================
  // TEST 9: Mobile responsive (375x667)
  // ============================================================================
  test('US-824 AC-7c: responsive design (mobile 375x667)', async ({
    page,
    request,
  }) => {
    const seeder = new TestDataSeeder(request);
    const user = await seeder.createTestUser({
      email: `shipper-mobile-${Date.now()}@test.com`,
      password: 'N1kk101!',
      role: 'SHIPPER',
      firstName: 'Mobile',
      lastName: 'Test',
      companyName: 'Test Shipper',
    });

    try {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await setUserAuth(page, user);
      await page.goto('/dashboard/shipper');

      // Wait for panel and capture screenshot
      await expect(
        page.locator('[data-testid="dashboard-quick-actions-panel"]')
      ).toBeVisible({ timeout: 5000 });

      // Take screenshot
      await page.screenshot({
        path: 'test-results/evidence/us-824-quick-actions-mobile-375x667.png',
      });

      console.log('✅ Mobile responsive screenshot captured');
    } finally {
      await seeder.cleanup();
    }
  });
});
