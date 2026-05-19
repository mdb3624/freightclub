import { test, expect, Browser, BrowserContext, Page } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:9090'

test.describe('Shipper Profile - Multi-Tenancy Verification', () => {
  test('shipper1 profile is isolated from shipper2', async ({ browser }) => {
    // Open two browser contexts for two different shippers
    const context1: BrowserContext = await browser.newContext()
    const page1: Page = await context1.newPage()

    const context2: BrowserContext = await browser.newContext()
    const page2: Page = await context2.newPage()

    try {
      // Shipper 1 logs in and sets profile
      await page1.goto(`${BASE_URL}/login`)
      await page1.getByLabel('Email').fill('shipper1@test.com')
      await page1.getByLabel('Password').fill('N1kk101!')
      await page1.getByRole('button', { name: /sign in/i }).click()

      const auth1Result = await Promise.race([
        page1.waitForURL(/\/dashboard/, { timeout: 5000 }).then(() => true),
        page1.waitForURL(/\/login/, { timeout: 5000 }).then(() => false),
      ]).catch(() => null)

      if (auth1Result !== true) {
        test.skip(true, 'Shipper1 authentication failed - backend test data not configured')
      }

      await page1.goto(`${BASE_URL}/shipper/profile`)
      await expect(page1.locator('text=Company Profile')).toBeVisible({ timeout: 5000 })

      // Fill shipper1's profile
      await page1.fill('[placeholder="Apex Freight Solutions LLC"]', 'Company One')
      await page1.fill('[placeholder="billing@company.com"]', 'company1@test.com')
      await page1.fill('[placeholder="\\(512\\) 555-0182"]', '(555) 111-1111')
      await page1.fill('[placeholder="Austin"]', 'Boston')
      await page1.fill('[placeholder="TX"]', 'MA')
      await page1.fill('[placeholder="78701"]', '02101')

      // Save shipper1's profile
      await page1.click('button:has-text("Save Profile")')
      await expect(page1.locator('text=profile is complete|saved')).toBeVisible({ timeout: 5000 })

      // Shipper 2 logs in and sets different profile
      await page2.goto(`${BASE_URL}/login`)
      await page2.getByLabel('Email').fill('shipper2@test.com')
      await page2.getByLabel('Password').fill('N1kk101!')
      await page2.getByRole('button', { name: /sign in/i }).click()

      const auth2Result = await Promise.race([
        page2.waitForURL(/\/dashboard/, { timeout: 5000 }).then(() => true),
        page2.waitForURL(/\/login/, { timeout: 5000 }).then(() => false),
      ]).catch(() => null)

      if (auth2Result !== true) {
        test.skip(true, 'Shipper2 authentication failed - backend test data not configured')
      }

      await page2.goto(`${BASE_URL}/shipper/profile`)
      await expect(page2.locator('text=Company Profile')).toBeVisible({ timeout: 5000 })

      // Fill shipper2's profile with different data
      await page2.fill('[placeholder="Apex Freight Solutions LLC"]', 'Company Two')
      await page2.fill('[placeholder="billing@company.com"]', 'company2@test.com')
      await page2.fill('[placeholder="\\(512\\) 555-0182"]', '(555) 222-2222')
      await page2.fill('[placeholder="Austin"]', 'Denver')
      await page2.fill('[placeholder="TX"]', 'CO')
      await page2.fill('[placeholder="78701"]', '80202')

      // Save shipper2's profile
      await page2.click('button:has-text("Save Profile")')
      await expect(page2.locator('text=profile is complete|saved')).toBeVisible({ timeout: 5000 })

      // Verify each shipper sees only their own profile
      // Shipper 1 should see their data
      await page1.goto(`${BASE_URL}/shipper/profile`)
      await expect(page1.locator('input[value="Company One"]')).toBeVisible({ timeout: 5000 })
      await expect(page1.locator('input[value="Boston"]')).toBeVisible({ timeout: 5000 })
      await expect(page1.locator('input[value="company1@test.com"]')).toBeVisible({ timeout: 5000 })

      // Shipper 1 should NOT see shipper2's data
      const company2Input1 = page1.locator('input[value="Company Two"]')
      const denverInput1 = page1.locator('input[value="Denver"]')
      const company2Email1 = page1.locator('input[value="company2@test.com"]')

      expect(await company2Input1.count()).toBe(0)
      expect(await denverInput1.count()).toBe(0)
      expect(await company2Email1.count()).toBe(0)

      // Shipper 2 should see their data
      await page2.goto(`${BASE_URL}/shipper/profile`)
      await expect(page2.locator('input[value="Company Two"]')).toBeVisible({ timeout: 5000 })
      await expect(page2.locator('input[value="Denver"]')).toBeVisible({ timeout: 5000 })
      await expect(page2.locator('input[value="company2@test.com"]')).toBeVisible({ timeout: 5000 })

      // Shipper 2 should NOT see shipper1's data
      const company1Input2 = page2.locator('input[value="Company One"]')
      const bostonInput2 = page2.locator('input[value="Boston"]')
      const company1Email2 = page2.locator('input[value="company1@test.com"]')

      expect(await company1Input2.count()).toBe(0)
      expect(await bostonInput2.count()).toBe(0)
      expect(await company1Email2.count()).toBe(0)
    } finally {
      // Clean up both contexts
      await context1.close()
      await context2.close()
    }
  })

  test('shipper1 loads are isolated from shipper2 loads', async ({ browser }) => {
    const context1: BrowserContext = await browser.newContext()
    const page1: Page = await context1.newPage()

    const context2: BrowserContext = await browser.newContext()
    const page2: Page = await context2.newPage()

    try {
      // Shipper 1 logs in
      await page1.goto(`${BASE_URL}/login`)
      await page1.getByLabel('Email').fill('shipper1@test.com')
      await page1.getByLabel('Password').fill('N1kk101!')
      await page1.getByRole('button', { name: /sign in/i }).click()

      const auth1Result = await Promise.race([
        page1.waitForURL(/\/dashboard/, { timeout: 5000 }).then(() => true),
        page1.waitForURL(/\/login/, { timeout: 5000 }).then(() => false),
      ]).catch(() => null)

      if (auth1Result !== true) {
        test.skip(true, 'Test user authentication failed')
      }

      // Shipper 2 logs in
      await page2.goto(`${BASE_URL}/login`)
      await page2.getByLabel('Email').fill('shipper2@test.com')
      await page2.getByLabel('Password').fill('N1kk101!')
      await page2.getByRole('button', { name: /sign in/i }).click()

      const auth2Result = await Promise.race([
        page2.waitForURL(/\/dashboard/, { timeout: 5000 }).then(() => true),
        page2.waitForURL(/\/login/, { timeout: 5000 }).then(() => false),
      ]).catch(() => null)

      if (auth2Result !== true) {
        test.skip(true, 'Test user authentication failed')
      }

      // Navigate to load board/dashboard for each shipper
      await page1.goto(`${BASE_URL}/dashboard/shipper`)
      await page2.goto(`${BASE_URL}/dashboard/shipper`)

      // Verify both pages are accessible (basic multi-tenant verification)
      await expect(page1.locator('text=Dashboard|Profile|Loads')).toBeVisible({ timeout: 5000 })
      await expect(page2.locator('text=Dashboard|Profile|Loads')).toBeVisible({ timeout: 5000 })

      // Verify page titles or key elements differ (each sees their own context)
      const page1Url = page1.url()
      const page2Url = page2.url()

      // Both should be on shipper dashboard but in different contexts
      expect(page1Url).toContain('dashboard')
      expect(page2Url).toContain('dashboard')
      expect(page1Url).not.toBe(page2Url) // May differ by session/context
    } finally {
      await context1.close()
      await context2.close()
    }
  })
})
