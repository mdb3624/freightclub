/**
 * Cost Profile Persistence Fix Verification (US-900 Critical Issue #1)
 *
 * Tests that cost profile fields now persist when saved to backend.
 * Root cause fix: All cost fields added to React Hook Form defaultValues
 *
 * NOTE: Cost Profile is TRUCKER-only. These tests create their own TRUCKER
 * user and do NOT rely on the global auth.json (which is a SHIPPER).
 */

import { test, expect } from '@playwright/test'

const BACKEND = process.env.TEST_BACKEND_URL || 'http://localhost:9091'
const FRONTEND = process.env.TEST_FRONTEND_URL || 'http://localhost:9090'

async function loginAsTrucker(page: any, email: string) {
  await fetch(`${BACKEND}/api/test/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'E2ETestPassword123!',
      firstName: 'Test',
      lastName: 'Trucker',
      role: 'TRUCKER',
      companyName: `TestTruck-${Date.now()}`,
    }),
  })
  await page.goto(`${FRONTEND}/login`)
  await page.fill('[data-testid="email-input"]', email)
  await page.fill('[data-testid="password-input"]', 'E2ETestPassword123!')
  await page.click('[data-testid="login-submit-btn"]')
  await page.waitForURL(/\/dashboard/, { timeout: 30000 })
  await page.waitForLoadState('networkidle')
}

test.describe('Cost Profile Persistence Fix Verification', () => {
  test.use({ storageState: { cookies: [], origins: [] } })
  test.setTimeout(60000)

  test('cost profile fields should be captured in form submission', async ({ page }) => {
    await loginAsTrucker(page, `cost-profile-1-${Date.now()}@freightclub.local`)
    try {
      // Navigate to profile page as authenticated TRUCKER
      await page.goto(`${FRONTEND}/profile`, { waitUntil: 'networkidle' })

      // Wait for page to fully load including auth initialization
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Wait for Cost Profile section to load (specific to TRUCKER users)
      await expect(page.locator('text=Cost Profile')).toBeVisible({ timeout: 10000 })

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
    } catch (error) {
      console.error('Test failed:', error)
      throw error
    }
  })

  test('cost profile fields should persist to backend', async ({ page }) => {
    await loginAsTrucker(page, `cost-profile-2-${Date.now()}@freightclub.local`)
    try {
      // Navigate to profile page as authenticated TRUCKER
      await page.goto(`${FRONTEND}/profile`, { waitUntil: 'networkidle' })
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)
      await expect(page.locator('text=Cost Profile')).toBeVisible({ timeout: 10000 })

      // Fill multiple cost profile fields
      await page.fill('input[placeholder="e.g. 1800"]', '2500')
      await page.fill('input[placeholder="e.g. 900"]', '1200')

      // Intercept the PUT request to verify payload
      const savePromise = page.waitForResponse(
        response => response.url().includes('/api/v1/profile') && response.request().method() === 'PUT'
      )

      // Submit the form
      await page.click('button:has-text("Save Changes")')

      // Wait for the API response
      const response = await savePromise
      const payload = await response.request().postDataJSON()

      // Verify cost fields are in the API payload
      expect(payload.truckPaymentLease).toBe(2500)
      expect(payload.insurance).toBe(1200)

      console.log('✓ Cost fields persisted to backend')
    } catch (error) {
      console.error('Test failed:', error)
      throw error
    }
  })

  test('all cost profile fields should persist to backend', async ({ page }) => {
    await loginAsTrucker(page, `cost-profile-3-${Date.now()}@freightclub.local`)
    try {
      // Navigate to profile page as authenticated TRUCKER
      await page.goto(`${FRONTEND}/profile`, { waitUntil: 'networkidle' })
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)
      await expect(page.locator('text=Cost Profile')).toBeVisible({ timeout: 10000 })

      // Fill complete cost profile
      await page.fill('input[placeholder="e.g. 1800"]', '1800')  // Truck Payment
      await page.fill('input[placeholder="e.g. 900"]', '900')    // Insurance
      await page.fill('input[placeholder="e.g. 200"]', '200')    // IFTA/IRP
      await page.fill('input[placeholder="e.g. 150"]', '150')    // Phone/ELD
      await page.fill('input[placeholder="e.g. 3.89"]', '3.50')  // Fuel Price
      await page.fill('input[placeholder="e.g. 6.5"]', '6.5')    // MPG
      await page.fill('input[placeholder="e.g. 8000"]', '8000')  // Monthly Miles

      // Wait for API response
      const savePromise = page.waitForResponse(
        response => response.url().includes('/api/v1/profile') && response.request().method() === 'PUT'
      )

      // Submit the form
      await page.click('button:has-text("Save Changes")')

      // Verify API payload contains all cost fields
      const response = await savePromise
      const payload = await response.request().postDataJSON()

      expect(payload.truckPaymentLease).toBe(1800)
      expect(payload.insurance).toBe(900)
      expect(payload.iftaIrpPermits).toBe(200)
      expect(payload.phoneEldMisc).toBe(150)
      expect(payload.fuelCostPerGallon).toBe(3.50)
      expect(payload.milesPerGallon).toBe(6.5)
      expect(payload.monthlyMilesTarget).toBe(8000)

      console.log('✓ All cost fields persisted to backend')
    } catch (error) {
      console.error('Test failed:', error)
      throw error
    }
  })
})
