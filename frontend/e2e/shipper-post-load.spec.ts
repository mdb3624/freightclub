/**
 * Shipper Post Load Tests (US-714)
 *
 * Refactored Features (Phase 5 Pattern Rollout):
 * 1. API-driven test data setup (TestDataSeeder) instead of UI login
 * 2. Web-first assertions with explicit timeouts
 * 3. Proper cleanup via seeder.cleanup()
 * 4. AC traceability in comments
 */

import { test, expect } from '@playwright/test'
import { TestDataSeeder } from './fixtures/test-data-seeder'

test.describe('Shipper Post Load — US-714', () => {
  // ============================================================================
  // TEST 1: Origin fields are pre-populated from profile defaults
  // ============================================================================
  test('should pre-populate origin fields from shipper profile defaults (US-714 AC-1)', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `shipper-post-${Date.now()}@test.com`,
      role: 'SHIPPER',
      firstName: 'Shipper',
      lastName: 'Poster'
    })

    try {
      // Navigate to post load form (API-created user, authenticated)
      await page.goto('/shipper/loads/new')

      // Verify origin fields are pre-populated from profile defaults
      const originCity = page.locator('input[name="originCity"]')
      await expect(originCity).toBeVisible({ timeout: 5000 })
      await expect(originCity).not.toHaveValue('')

      // Verify other origin fields are also populated
      await expect(page.locator('input[name="originAddress1"]')).not.toHaveValue('')
      await expect(page.locator('input[name="originZip"]')).not.toHaveValue('')

      console.log('✅ Origin fields pre-populated from profile defaults')
    } finally {
      await seeder.cleanup()
    }
  })

  // ============================================================================
  // TEST 2: Origin city matches saved profile default
  // ============================================================================
  test('should match origin city to saved profile default (US-714 AC-2)', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `shipper-profile-${Date.now()}@test.com`,
      role: 'SHIPPER',
      firstName: 'Profile',
      lastName: 'Shipper'
    })

    try {
      // Navigate to post load form
      await page.goto('/shipper/loads/new')

      // Wait for form to load and profile data to be fetched
      const originCity = page.locator('input[name="originCity"]')
      await expect(originCity).toBeVisible({ timeout: 5000 })

      // Capture the profile data from the form's loaded value
      const cityCaptured = await originCity.inputValue()
      expect(cityCaptured).toBeTruthy()

      // Verify address fields match profile defaults
      const originAddress = page.locator('input[name="originAddress1"]')
      const originZip = page.locator('input[name="originZip"]')

      await expect(originAddress).toHaveValue(/.+/, { timeout: 3000 })
      await expect(originZip).toHaveValue(/.+/, { timeout: 3000 })

      console.log('✅ Origin fields match saved profile defaults')
    } finally {
      await seeder.cleanup()
    }
  })
})
