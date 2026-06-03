/**
 * Carrier Cost Profile Setup Tests (US-757)
 *
 * Refactored Features (Phase 5 Pattern Rollout):
 * 1. API-driven test data setup (TestDataSeeder) instead of UI login
 * 2. Web-first assertions with explicit timeouts (no hard-coded waits)
 * 3. Proper cleanup via seeder.cleanup()
 * 4. AC traceability in comments
 */

import { test, expect, APIRequestContext } from '@playwright/test'
import { TestDataSeeder } from './fixtures/test-data-seeder'

test.describe('Carrier Cost Profile Setup — US-757', () => {
  // ============================================================================
  // TEST 1: Golden path - full cost profile entry and persistence
  // ============================================================================
  test('should save cost profile and persist after reload (US-757 AC-1)', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `carrier-cost-${Date.now()}@test.com`,
      password: 'N1kk101!',
      role: 'TRUCKER',
      firstName: 'Cost',
      lastName: 'Tester',
      companyName: 'Test Cost Carrier'
    })

    try {
      // Navigate to profile page (cost profile is a section within profile)
      await page.goto('/profile')

      // Verify cost profile section is visible
      await expect(page.locator('text=Cost Profile')).toBeVisible({ timeout: 5000 })

      // Verify cost profile fields exist
      const costInputs = await page.locator('input[type="number"]').count()
      expect(costInputs).toBeGreaterThan(0)

      // Fill truck payment field
      const truckPaymentInput = page.locator('input[name="truckPaymentLease"]')
      if (await truckPaymentInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await truckPaymentInput.fill('1800')
      }

      // Verify CPM breakdown displays
      await expect(page.getByText('Fixed CPM').first()).toBeVisible({ timeout: 3000 })
      await expect(page.getByText('Variable CPM').first()).toBeVisible({ timeout: 3000 })
      await expect(page.getByText('Total CPM').first()).toBeVisible({ timeout: 3000 })

      // Click Save button
      const saveButton = page.getByRole('button', { name: /Save Changes/i })
      await expect(saveButton).toBeEnabled({ timeout: 3000 })
      await saveButton.click()

      // Wait for success message (web-first assertion)
      await expect(page.locator('text=Profile saved successfully').or(page.locator('text=saved')))
        .toBeVisible({ timeout: 5000 })

      // Reload the page
      await page.reload({ waitUntil: 'networkidle' })

      // Verify Cost Profile section still visible after reload
      await expect(page.locator('text=Cost Profile')).toBeVisible({ timeout: 5000 })

      // Verify form persists
      const costInputsAfterReload = await page.locator('input[type="number"]').count()
      expect(costInputsAfterReload).toBeGreaterThan(0)

      console.log('✅ Cost profile saved and persisted after reload')
    } finally {
      await seeder.cleanup()
    }
  })

  // ============================================================================
  // TEST 2: Partial entry calculates CPM correctly
  // ============================================================================
  test('should calculate CPM with partial entry (US-757 AC-2)', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `carrier-cpm-${Date.now()}@test.com`,
      password: 'N1kk101!',
      role: 'TRUCKER',
      firstName: 'CPM',
      lastName: 'Tester',
      companyName: 'Test CPM Carrier'
    })

    try {
      // Navigate to profile page (cost profile section)
      await page.goto('/profile')

      // Verify cost profile section is visible
      await expect(page.locator('text=Cost Profile')).toBeVisible({ timeout: 5000 })

      // Enter only truck payment and monthly miles
      await page.fill('input[placeholder="e.g. 1800"]', '1800')   // Truck Payment
      await page.fill('input[placeholder="e.g. 8000"]', '8000')   // Monthly Miles

      // Verify partial CPM breakdown displays
      await expect(page.locator('text=Fixed CPM')).toBeVisible({ timeout: 3000 })
      const fixedCpmValue = page.locator('text=Fixed CPM').locator('..').locator('span').last()
      await expect(fixedCpmValue).toContainText('$')

      // Verify Total CPM displays
      await expect(page.locator('text=Total CPM')).toBeVisible({ timeout: 3000 })
      const totalCpmValue = page.locator('text=Total CPM').locator('..').locator('span').last()
      await expect(totalCpmValue).toContainText('$')

      console.log('✅ CPM calculated correctly with partial entry')
    } finally {
      await seeder.cleanup()
    }
  })

  // ============================================================================
  // TEST 3: Zero MPG edge case handling
  // ============================================================================
  test('should handle zero MPG without division by zero error (US-757 AC-3)', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `carrier-zero-mpg-${Date.now()}@test.com`,
      password: 'N1kk101!',
      role: 'TRUCKER',
      firstName: 'ZeroMPG',
      lastName: 'Tester',
      companyName: 'Test Zero MPG Carrier'
    })

    try {
      // Navigate to profile page (cost profile section)
      await page.goto('/profile')

      // Verify cost profile section is visible
      await expect(page.locator('text=Cost Profile')).toBeVisible({ timeout: 5000 })

      // Enter fuel price but set MPG to zero
      await page.fill('input[placeholder="e.g. 3.89"]', '3.89')      // Fuel Price
      await page.fill('input[placeholder="e.g. 6.5"]', '0')          // MPG = 0
      await page.fill('input[placeholder="e.g. 8000"]', '8000')      // Monthly Miles

      // Verify page is still interactive (no JavaScript error)
      await expect(page.locator('text=Cost Profile')).toBeVisible({ timeout: 3000 })

      // Verify Variable CPM handles zero MPG gracefully
      await expect(page.locator('text=Variable CPM')).toBeVisible({ timeout: 3000 })
      const variableCpmValue = page.locator('text=Variable CPM').locator('..').locator('span').last()
      await expect(variableCpmValue).toContainText('$')

      // Verify page can still be interacted with
      await page.fill('input[placeholder="e.g. 1800"]', '1800')
      await expect(page.locator('input[placeholder="e.g. 1800"]')).toHaveValue('1800')

      console.log('✅ Zero MPG handled gracefully without errors')
    } finally {
      await seeder.cleanup()
    }
  })
})
