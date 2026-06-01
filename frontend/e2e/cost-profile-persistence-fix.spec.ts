/**
 * Cost Profile Persistence Fix Verification (US-900 Critical Issue #1)
 *
 * Tests that cost profile fields now persist when saved to backend.
 * Root cause fix: All cost fields added to React Hook Form defaultValues
 */

import { test, expect } from '@playwright/test'
import { TestDataSeeder } from './fixtures/test-data-seeder'

test.describe('Cost Profile Persistence Fix Verification', () => {
  test('cost profile fields should be captured in form submission (TestDataSeeder)', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: 'cost-profile-test@test.com',
      role: 'CARRIER',
      firstName: 'Cost',
      lastName: 'Tester'
    })

    try {
      // Navigate to profile page (authenticated)
      await page.goto('/profile')

      // Wait for Cost Profile section to load
      await expect(page.locator('text=Cost Profile')).toBeVisible({ timeout: 5000 })

      // Fill multiple cost profile fields
      await page.fill('input[placeholder="e.g. 1800"]', '1800')  // Truck Payment
      await page.fill('input[placeholder="e.g. 900"]', '900')    // Insurance
      await page.fill('input[placeholder="e.g. 3.89"]', '3.50')  // Fuel Price
      await page.fill('input[placeholder="e.g. 6.5"]', '6.5')    // MPG

      // Verify fields are captured in form data (watch() hook)
      const truckPaymentValue = await page.inputValue('input[placeholder="e.g. 1800"]')
      const insuranceValue = await page.inputValue('input[placeholder="e.g. 900"]')
      const fuelValue = await page.inputValue('input[placeholder="e.g. 3.89"]')
      const mpgValue = await page.inputValue('input[placeholder="e.g. 6.5"]')

      expect(truckPaymentValue).toBe('1800')
      expect(insuranceValue).toBe('900')
      expect(fuelValue).toBe('3.50')
      expect(mpgValue).toBe('6.5')

      console.log('✓ Cost fields captured in form')

      // Intercept the PUT request to verify payload
      const apiPromise = page.waitForResponse(
        response => response.url().includes('/api/v1/profile') && response.request().method() === 'PUT'
      )

      // Submit the form
      await page.click('button:has-text("Save Changes")')

      // Wait for the API response
      const response = await apiPromise
      const payload = await response.request().postDataJSON()

      console.log('✓ API request intercepted')
      console.log('  Payload:', JSON.stringify(payload, null, 2))

      // Verify cost fields are in the API payload
      expect(payload).toHaveProperty('truckPaymentLease')
      expect(payload.truckPaymentLease).toBe(1800)
      expect(payload).toHaveProperty('insurance')
      expect(payload.insurance).toBe(900)
      expect(payload).toHaveProperty('fuelCostPerGallon')
      expect(payload.fuelCostPerGallon).toBe(3.50)
      expect(payload).toHaveProperty('milesPerGallon')
      expect(payload.milesPerGallon).toBe(6.5)

      console.log('✓ Cost fields present in API payload')

      // Wait for success message
      await expect(page.locator('text=Profile saved successfully').or(page.locator('text=saved')))
        .toBeVisible({ timeout: 5000 })

      console.log('✓ Profile save successful')

    } finally {
      await seeder.cleanup()
    }
  })

  test('cost profile fields should persist after page navigation', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: 'cost-persist-test@test.com',
      role: 'CARRIER',
      firstName: 'Persist',
      lastName: 'Tester'
    })

    try {
      // Navigate to profile and fill cost fields
      await page.goto('/profile')
      await expect(page.locator('text=Cost Profile')).toBeVisible({ timeout: 5000 })

      // Fill fields
      await page.fill('input[placeholder="e.g. 1800"]', '2500')
      await page.fill('input[placeholder="e.g. 900"]', '1200')

      // Save
      const savePromise = page.waitForResponse(
        response => response.url().includes('/api/v1/profile') && response.status() === 200
      )
      await page.click('button:has-text("Save Changes")')
      await savePromise

      // Wait for success
      await expect(page.locator('text=Profile saved successfully').or(page.locator('text=saved')))
        .toBeVisible({ timeout: 5000 })

      console.log('✓ Cost fields saved')

      // Navigate away (go to home)
      await page.goto('/')
      await expect(page.locator('text=Dashboard').or(page.locator('text=Profile')))
        .toBeVisible({ timeout: 5000 })

      // Navigate back to profile
      await page.goto('/profile')
      await expect(page.locator('text=Cost Profile')).toBeVisible({ timeout: 5000 })

      // Verify fields persisted
      const truckPaymentAfter = await page.inputValue('input[placeholder="e.g. 1800"]')
      const insuranceAfter = await page.inputValue('input[placeholder="e.g. 900"]')

      expect(truckPaymentAfter).toBe('2500')
      expect(insuranceAfter).toBe('1200')

      console.log('✓ Cost fields persisted after navigation')

    } finally {
      await seeder.cleanup()
    }
  })

  test('cost profile CPM calculations should work with persisted values', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: 'cpm-calc-test@test.com',
      role: 'CARRIER'
    })

    try {
      await page.goto('/profile')
      await expect(page.locator('text=Cost Profile')).toBeVisible({ timeout: 5000 })

      // Fill complete cost profile for CPM calculation
      await page.fill('input[placeholder="e.g. 1800"]', '1800')  // Truck Payment
      await page.fill('input[placeholder="e.g. 900"]', '900')    // Insurance
      await page.fill('input[placeholder="e.g. 200"]', '200')    // IFTA/IRP
      await page.fill('input[placeholder="e.g. 150"]', '150')    // Phone/ELD
      await page.fill('input[placeholder="e.g. 3.89"]', '3.50')  // Fuel Price
      await page.fill('input[placeholder="e.g. 6.5"]', '6.5')    // MPG
      await page.fill('input[placeholder="e.g. 8000"]', '8000')  // Monthly Miles

      // Wait for CPM calculations to appear (CostProfileSummary should update)
      await expect(page.locator('text=Fixed CPM')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('text=Variable CPM')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('text=Total CPM')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('text=Minimum RPM')).toBeVisible({ timeout: 5000 })

      console.log('✓ CPM calculations displayed')

      // Save and verify
      const savePromise = page.waitForResponse(
        response => response.url().includes('/api/v1/profile') && response.status() === 200
      )
      await page.click('button:has-text("Save Changes")')
      const response = await savePromise
      const payload = await response.request().postDataJSON()

      // Verify all cost fields in payload
      expect(payload.truckPaymentLease).toBe(1800)
      expect(payload.insurance).toBe(900)
      expect(payload.iftaIrpPermits).toBe(200)
      expect(payload.phoneEldMisc).toBe(150)
      expect(payload.fuelCostPerGallon).toBe(3.50)
      expect(payload.milesPerGallon).toBe(6.5)
      expect(payload.monthlyMilesTarget).toBe(8000)

      console.log('✓ All cost fields in API payload for CPM calculations')

    } finally {
      await seeder.cleanup()
    }
  })
})
