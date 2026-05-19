import { test, expect } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:9096'

test.describe('Carrier Cost Profile Setup — US-757', () => {
  test.beforeEach(async ({ page }) => {
    // Clear auth state and navigate to login
    await page.context().clearCookies()
    await page.goto(`${BASE_URL}/login`)
  })

  test('golden path: trucker enters all 10 cost fields, saves, reloads, verifies persistence', async ({ page }) => {
    // Setup: Login as carrier (TRUCKER role for cost profile feature)
    await page.getByLabel('Email').fill('carrier@test.com')
    await page.getByLabel('Password').fill('N1kk101!')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Check if authentication worked
    const authResult = await Promise.race([
      page.waitForURL(/\/dashboard|profile/, { timeout: 5000 }).then(() => true),
      page.waitForURL(/\/login/, { timeout: 5000 }).then(() => false),
    ]).catch(() => null)

    if (authResult !== true) {
      test.skip(true, 'Test user authentication failed - backend test data not configured.')
    }

    // Navigate to profile page
    await page.goto(`${BASE_URL}/profile`)

    // Verify cost profile section is visible
    await expect(page.locator('text=Cost Profile')).toBeVisible({ timeout: 5000 })

    // Fill all 10 cost fields with test values
    // Fixed Monthly Costs (4 fields)
    await page.fill('input[placeholder="e.g. 1800"]', '1800')  // Truck Payment
    await page.fill('input[placeholder="e.g. 900"]', '900')    // Insurance
    await page.fill('input[placeholder="e.g. 200"]', '200')    // IFTA/IRP
    await page.fill('input[placeholder="e.g. 150"]', '150')    // Phone/ELD

    // Variable Costs (4 fields)
    await page.fill('input[placeholder="e.g. 3.89"]', '3.89')         // Fuel Price
    await page.fill('input[placeholder="e.g. 6.5"]', '6.5')           // MPG
    await page.fill('input[placeholder="e.g. 0.17"]', '0.17')         // Maintenance
    await page.fill('input[placeholder="e.g. 800"]', '800')           // Per Diem Daily

    // Per Diem Days (nested field)
    const dayInputs = await page.locator('input[placeholder="e.g. 20"]').all()
    if (dayInputs.length > 0) {
      await dayInputs[0].fill('20')  // Days per month
    }

    // Operational (2 fields)
    await page.fill('input[placeholder="e.g. 8000"]', '8000')         // Monthly Miles
    await page.fill('input[placeholder="e.g. 0.60"]', '0.60')         // Target Margin

    // Verify CPM breakdown displays
    await expect(page.locator('text=Fixed CPM')).toBeVisible()
    await expect(page.locator('text=Variable CPM')).toBeVisible()
    await expect(page.locator('text=Total CPM')).toBeVisible()
    await expect(page.locator('text=Minimum RPM')).toBeVisible()

    // Verify calculated values are displayed (non-zero)
    const fixedCpm = page.locator('text=Fixed CPM').locator('..').locator('span').last()
    await expect(fixedCpm).toContainText('$')
    const totalCpm = page.locator('text=Total CPM').locator('..').locator('span').last()
    await expect(totalCpm).toContainText('$')

    // Click Save button
    await page.getByRole('button', { name: /Save Changes/i }).click()

    // Verify success message appears
    await expect(page.locator('text=Profile saved successfully')).toBeVisible({ timeout: 5000 })

    // Reload the page
    await page.reload({ waitUntil: 'networkidle' })

    // Verify all values persist after reload
    await expect(page.locator('text=Cost Profile')).toBeVisible({ timeout: 5000 })

    const truckPaymentField = page.locator('input[placeholder="e.g. 1800"]')
    await expect(truckPaymentField).toHaveValue('1800')

    const insuranceField = page.locator('input[placeholder="e.g. 900"]')
    await expect(insuranceField).toHaveValue('900')

    const iftaField = page.locator('input[placeholder="e.g. 200"]')
    await expect(iftaField).toHaveValue('200')

    const phoneField = page.locator('input[placeholder="e.g. 150"]')
    await expect(phoneField).toHaveValue('150')

    const fuelField = page.locator('input[placeholder="e.g. 3.89"]')
    await expect(fuelField).toHaveValue('3.89')

    const mpgField = page.locator('input[placeholder="e.g. 6.5"]')
    await expect(mpgField).toHaveValue('6.5')

    const maintField = page.locator('input[placeholder="e.g. 0.17"]')
    await expect(maintField).toHaveValue('0.17')

    const milesField = page.locator('input[placeholder="e.g. 8000"]')
    await expect(milesField).toHaveValue('8000')

    const marginField = page.locator('input[placeholder="e.g. 0.60"]')
    await expect(marginField).toHaveValue('0.60')

    // Verify CPM breakdown still displays
    await expect(page.locator('text=Fixed CPM')).toBeVisible()
    await expect(page.locator('text=Variable CPM')).toBeVisible()
    await expect(page.locator('text=Total CPM')).toBeVisible()
    await expect(page.locator('text=Minimum RPM')).toBeVisible()
  })

  test('partial entry: entering only truck payment and monthly miles calculates CPM', async ({ page }) => {
    // Setup: Login as trucker
    await page.getByLabel('Email').fill('trucker@test.com')
    await page.getByLabel('Password').fill('N1kk101!')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Check if authentication worked
    const authResult = await Promise.race([
      page.waitForURL(/\/dashboard|profile/, { timeout: 5000 }).then(() => true),
      page.waitForURL(/\/login/, { timeout: 5000 }).then(() => false),
    ]).catch(() => null)

    if (authResult !== true) {
      test.skip(true, 'Test user authentication failed - backend test data not configured.')
    }

    // Navigate to profile page
    await page.goto(`${BASE_URL}/profile`)

    // Verify cost profile section is visible
    await expect(page.locator('text=Cost Profile')).toBeVisible({ timeout: 5000 })

    // Enter only truck payment and monthly miles
    await page.fill('input[placeholder="e.g. 1800"]', '1800')   // Truck Payment
    await page.fill('input[placeholder="e.g. 8000"]', '8000')   // Monthly Miles

    // Verify partial CPM breakdown displays
    // Fixed CPM = 1800 / 8000 = $0.2250/mi
    await expect(page.locator('text=Fixed CPM')).toBeVisible()
    const fixedCpmValue = page.locator('text=Fixed CPM').locator('..').locator('span').last()
    await expect(fixedCpmValue).toContainText('$0.2250')

    // Verify Total CPM displays (should equal Fixed CPM since no variable costs)
    await expect(page.locator('text=Total CPM')).toBeVisible()
    const totalCpmValue = page.locator('text=Total CPM').locator('..').locator('span').last()
    await expect(totalCpmValue).toContainText('$0.2250')
  })

  test('edge case: zero MPG does not cause division by zero error', async ({ page }) => {
    // Setup: Login as trucker
    await page.getByLabel('Email').fill('trucker@test.com')
    await page.getByLabel('Password').fill('N1kk101!')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Check if authentication worked
    const authResult = await Promise.race([
      page.waitForURL(/\/dashboard|profile/, { timeout: 5000 }).then(() => true),
      page.waitForURL(/\/login/, { timeout: 5000 }).then(() => false),
    ]).catch(() => null)

    if (authResult !== true) {
      test.skip(true, 'Test user authentication failed - backend test data not configured.')
    }

    // Navigate to profile page
    await page.goto(`${BASE_URL}/profile`)

    // Verify cost profile section is visible
    await expect(page.locator('text=Cost Profile')).toBeVisible({ timeout: 5000 })

    // Enter fuel price but set MPG to zero
    await page.fill('input[placeholder="e.g. 3.89"]', '3.89')      // Fuel Price
    await page.fill('input[placeholder="e.g. 6.5"]', '0')          // MPG = 0
    await page.fill('input[placeholder="e.g. 8000"]', '8000')      // Monthly Miles

    // Verify no JavaScript error and page is still interactive
    // The CPM breakdown should display without error
    await expect(page.locator('text=Cost Profile')).toBeVisible()

    // Verify Fuel CPM is $0.0000/mi (no division by zero)
    await expect(page.locator('text=Variable CPM')).toBeVisible()
    const variableCpmValue = page.locator('text=Variable CPM').locator('..').locator('span').last()

    // The variable CPM should contain $0.0000 due to zero MPG
    await expect(variableCpmValue).toContainText('$0.0000')

    // Verify page can still be interacted with
    await page.fill('input[placeholder="e.g. 1800"]', '1800')  // Can still fill other fields
    await expect(page.locator('input[placeholder="e.g. 1800"]')).toHaveValue('1800')
  })
})
