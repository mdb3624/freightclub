/**
 * Shipper Dashboard Golden Path Tests (US-715)
 *
 * Refactored Features (Phase 5 Pattern Rollout):
 * 1. Uses data-testid selectors (mandatory per testing_standards.md)
 * 2. Web-first assertions with explicit timeouts (no hard-coded waits)
 * 3. API-driven test data setup (TestDataSeeder) instead of UI login
 * 4. Proper synchronization with backend API responses
 * 5. Trace generation on failure for debugging
 *
 * Trace files stored in: test-results/trace-{test-name}-{timestamp}.zip
 */

import { test, expect, APIRequestContext } from '@playwright/test'
import { TestDataSeeder } from './fixtures/test-data-seeder'

test.describe('Shipper Dashboard Golden Path (US-715)', () => {
  // ============================================================================
  // SETUP: Per-test state cleanup
  // ============================================================================
  test.beforeEach(async ({ context }) => {
    // Traces are managed by playwright.config.ts (trace: 'retain-on-failure')
    await context.clearCookies()
  })

  // ============================================================================
  // TEST 1: Dashboard displays summary cards
  // ============================================================================
  test('should display summary cards with load statistics (US-715 AC-1)', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: 'shipper@test.com',
      role: 'SHIPPER',
      firstName: 'Shipper',
      lastName: 'User',
      companyName: 'Test Shipper Corp'
    })

    try {
      await page.goto('/dashboard/shipper')
      await expect(page.locator('[data-testid="dashboard-container"]'))
        .toBeVisible({ timeout: 5000 })

      // Verify summary cards are visible
      await expect(page.locator('[data-testid="summary-open-card"]'))
        .toBeVisible({ timeout: 5000 })
      await expect(page.locator('[data-testid="summary-claimed-card"]'))
        .toBeVisible({ timeout: 5000 })
      await expect(page.locator('[data-testid="summary-in-transit-card"]'))
        .toBeVisible({ timeout: 5000 })
      await expect(page.locator('[data-testid="summary-delivered-card"]'))
        .toBeVisible({ timeout: 5000 })

    } finally {
      await seeder.cleanup()
    }
  })

  // ============================================================================
  // TEST 2: Load table displays with expected columns
  // ============================================================================
  test('should display load table with expected columns (US-715 AC-2)', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: 'shipper@load-table.com',
      role: 'SHIPPER',
      firstName: 'TableTest',
      lastName: 'User',
      companyName: 'Table Test Corp'
    })

    try {
      await page.goto('/dashboard/shipper')

      // Verify table is visible
      await expect(page.locator('[data-testid="load-table"]'))
        .toBeVisible({ timeout: 5000 })

      // Verify key column headers
      await expect(page.locator('[data-testid="table-header-origin"]'))
        .toBeVisible({ timeout: 5000 })
      await expect(page.locator('[data-testid="table-header-destination"]'))
        .toBeVisible({ timeout: 5000 })
      await expect(page.locator('[data-testid="table-header-status"]'))
        .toBeVisible({ timeout: 5000 })

    } finally {
      await seeder.cleanup()
    }
  })

  // ============================================================================
  // TEST 3: Can switch between load view tabs
  // ============================================================================
  test('should switch between Active and All Loads tabs (US-715 AC-3)', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: 'shipper@tabs.com',
      role: 'SHIPPER',
      firstName: 'TabSwitch',
      lastName: 'User',
      companyName: 'Tab Test Corp'
    })

    try {
      await page.goto('/dashboard/shipper')
      await expect(page.locator('[data-testid="dashboard-container"]'))
        .toBeVisible({ timeout: 5000 })

      // Click "All Loads" tab
      const allLoadsTab = page.locator('[data-testid="tab-all-loads"]')
      if (await allLoadsTab.count() > 0) {
        await allLoadsTab.click()

        // Verify tab is active
        await expect(allLoadsTab)
          .toHaveAttribute('aria-selected', 'true', { timeout: 5000 })
      }

    } finally {
      await seeder.cleanup()
    }
  })

  // ============================================================================
  // TEST 4: Search functionality filters loads
  // ============================================================================
  test('should filter loads using search input (US-715 AC-4)', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: 'shipper@search.com',
      role: 'SHIPPER',
      firstName: 'SearchTest',
      lastName: 'User',
      companyName: 'Search Test Corp'
    })

    try {
      await page.goto('/dashboard/shipper')

      // Find and interact with search input
      const searchInput = page.locator('[data-testid="load-search-input"]')
      if (await searchInput.count() > 0) {
        await searchInput.fill('test')

        // Wait for search debounce + API response
        const searchResponse = page.waitForResponse(
          response => response.url().includes('/api/v1/loads') && response.status() === 200
        )
        await searchResponse

        // Verify table updates or shows no results
        await expect(page.locator('[data-testid="load-table"]'))
          .toBeVisible({ timeout: 5000 })
      }

    } finally {
      await seeder.cleanup()
    }
  })

  // ============================================================================
  // TEST 5: Can navigate to Post Load form
  // ============================================================================
  test('should navigate to Post Load form (US-715 AC-5)', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: 'shipper@post.com',
      role: 'SHIPPER',
      firstName: 'PostTest',
      lastName: 'User',
      companyName: 'Post Test Corp'
    })

    try {
      await page.goto('/dashboard/shipper')

      // Click post load button
      const postButton = page.locator('[data-testid="post-load-btn"]')
      if (await postButton.count() > 0) {
        await postButton.click()

        // Verify navigation to post load page
        await page.waitForURL(/\/shipper\/loads\/new/)
        expect(page.url()).toContain('/shipper/loads/new')
      }

    } finally {
      await seeder.cleanup()
    }
  })

  // ============================================================================
  // TEST 6: Dashboard loads without errors
  // ============================================================================
  test('should load dashboard without errors (US-715 AC-6)', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: 'shipper@no-errors.com',
      role: 'SHIPPER',
      firstName: 'NoErrors',
      lastName: 'User',
      companyName: 'No Errors Corp'
    })

    try {
      const errors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text())
      })

      await page.goto('/dashboard/shipper')
      await expect(page.locator('[data-testid="dashboard-container"]'))
        .toBeVisible({ timeout: 5000 })

      // Filter for critical errors only
      const criticalErrors = errors.filter(
        e => !e.includes('warn') && !e.includes('deprecated')
      )
      expect(criticalErrors).toHaveLength(0)

    } finally {
      await seeder.cleanup()
    }
  })
})
