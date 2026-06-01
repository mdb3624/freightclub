/**
 * Shipper Profile Setup Tests (US-713)
 *
 * Refactored Features (Phase 5 Pattern Rollout):
 * 1. Uses data-testid selectors (mandatory per testing_standards.md)
 * 2. Web-first assertions instead of hard-coded waits
 * 3. API-driven test data setup (TestDataSeeder) instead of UI-driven login
 * 4. Proper synchronization with backend responses
 * 5. Traces generated on failure for debugging
 *
 * Trace files stored in: test-results/trace-{test-name}-{timestamp}.zip
 */

import { test, expect, APIRequestContext } from '@playwright/test'
import { TestDataSeeder } from './fixtures/test-data-seeder'

test.describe('Shipper Profile Setup - Golden Path (US-713)', () => {
  // ============================================================================
  // TEST SETUP: Per-test state cleanup
  // ============================================================================
  test.beforeEach(async ({ page, context }) => {
    // Traces are managed by playwright.config.ts (trace: 'retain-on-failure')
    await context.clearCookies()
    try {
      await page.evaluate(() => localStorage.clear())
    } catch {
      // localStorage may not be accessible on certain pages
    }
  })

  // ============================================================================
  // TEST 1: Shipper completes profile and becomes ready to publish
  // ============================================================================
  test('should complete shipper profile and allow load publication (US-713 AC-1)', async ({ page, request }) => {
    // Step 1: API-driven setup (replaces UI-driven login)
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: 'shipper@test.com',
      password: 'N1kk101!',
      role: 'SHIPPER',
      firstName: 'Test',
      lastName: 'Shipper',
      companyName: 'Test Company'
    })

    try {
      // Step 2: Navigate to dashboard + verify incomplete profile banner
      await page.goto('/')
      await expect(page.locator('[data-testid="profile-incomplete-alert"]'))
        .toBeVisible({ timeout: 5000 })

      // Step 3: Navigate to profile page
      await page.goto('/shipper/profile')
      await expect(page.locator('[data-testid="profile-page-title"]'))
        .toBeVisible({ timeout: 5000 })

      // Step 4: Fill profile form using data-testid selectors
      await page.fill('[data-testid="company-name-input"]', 'TrueShip Logistics LLC')
      await page.fill('[data-testid="billing-email-input"]', 'shipper@trueship.com')
      await page.fill('[data-testid="phone-input"]', '(555) 123-4567')
      await page.fill('[data-testid="city-input"]', 'Atlanta')
      await page.fill('[data-testid="state-input"]', 'GA')
      await page.fill('[data-testid="zip-input"]', '30303')

      // Step 5: Submit form + wait for backend response
      const savePromise = page.waitForResponse(
        response => response.url().includes('/api/v1/shipper/profile') && response.status() === 200
      )
      await page.click('[data-testid="save-profile-btn"]')
      await savePromise

      // Step 6: Verify success message
      await expect(page.locator('[data-testid="profile-success-message"]'))
        .toBeVisible({ timeout: 5000 })

      // Step 7: Navigate back to dashboard
      await page.goto('/dashboard/shipper')
      await expect(page.locator('[data-testid="dashboard-container"]'))
        .toBeVisible({ timeout: 5000 })

      // Step 8: Verify profile complete indicator
      await expect(page.locator('[data-testid="profile-complete-badge"]'))
        .toBeVisible({ timeout: 5000 })

    } finally {
      await seeder.cleanup()
    }
  })

  // ============================================================================
  // TEST 2: Profile data persists after page reload
  // ============================================================================
  test('should persist profile data after page reload (US-713 AC-2)', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: 'shipper@persist.com',
      password: 'N1kk101!',
      role: 'SHIPPER',
      firstName: 'Persist',
      lastName: 'User',
      companyName: 'Persistent Corp'
    })

    try {
      // Navigate to profile
      await page.goto('/shipper/profile')
      await expect(page.locator('[data-testid="profile-page-title"]'))
        .toBeVisible({ timeout: 5000 })

      // Fill and save profile
      const companyNameField = page.locator('[data-testid="company-name-input"]')
      await companyNameField.clear()
      await companyNameField.fill('Persistent Freight LLC')

      const emailField = page.locator('[data-testid="billing-email-input"]')
      await emailField.clear()
      await emailField.fill('persistent@freight.com')

      // Wait for save
      const savePromise = page.waitForResponse(
        response => response.url().includes('/api/v1/shipper/profile') && response.status() === 200
      )
      await page.click('[data-testid="save-profile-btn"]')
      await savePromise

      // Reload page
      await page.reload()
      await expect(page.locator('[data-testid="profile-page-title"]'))
        .toBeVisible({ timeout: 5000 })

      // Verify data persisted
      const savedCompanyName = await page.inputValue('[data-testid="company-name-input"]')
      const savedEmail = await page.inputValue('[data-testid="billing-email-input"]')

      expect(savedCompanyName).toBe('Persistent Freight LLC')
      expect(savedEmail).toBe('persistent@freight.com')

    } finally {
      await seeder.cleanup()
    }
  })
})
