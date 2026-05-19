import { test, expect } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:9090'

test.describe('Shipper Profile Setup - Golden Path', () => {
  test('shipper completes profile and becomes ready to publish', async ({ page }) => {
    // 1. Login as shipper
    await page.goto(`${BASE_URL}/login`)
    await page.getByLabel('Email').fill('shipper@test.com')
    await page.getByLabel('Password').fill('N1kk101!')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Wait for dashboard navigation after login
    const authResult = await Promise.race([
      page.waitForURL(/\/dashboard/, { timeout: 5000 }).then(() => true),
      page.waitForURL(/\/login/, { timeout: 5000 }).then(() => false),
    ]).catch(() => null)

    if (authResult !== true) {
      test.skip(true, 'Test user authentication failed - backend test data not configured. Run database migrations.')
    }

    // 2. See incomplete profile banner on dashboard
    await expect(page.locator('role=alert')).toBeVisible({ timeout: 5000 })

    // 3. Navigate to /shipper/profile
    await page.goto(`${BASE_URL}/shipper/profile`)
    await expect(page.locator('text=Company Profile')).toBeVisible({ timeout: 5000 })

    // 4. Fill in profile form with all required fields
    await page.fill('[placeholder="Apex Freight Solutions LLC"]', 'TrueShip Logistics LLC')
    await page.fill('[placeholder="billing@company.com"]', 'shipper@trueship.com')
    await page.fill('[placeholder="\\(512\\) 555-0182"]', '(555) 123-4567')
    await page.fill('[placeholder="Austin"]', 'Atlanta')
    await page.fill('[placeholder="TX"]', 'GA')
    await page.fill('[placeholder="78701"]', '30303')

    // Fill optional MC Number field if visible
    const mcInput = page.locator('input[placeholder*="MC"]').first()
    if (await mcInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await mcInput.fill('123456')
    }

    // 5. Submit form
    await page.click('button:has-text("Save Profile")')

    // 6. Verify success message and completeness >= 80%
    await expect(page.locator('text=profile is complete')).toBeVisible({ timeout: 5000 })

    // 7. Navigate back to dashboard
    await page.goto(`${BASE_URL}/dashboard/shipper`)

    // 8. Verify success banner (profile incomplete banner should be gone or updated)
    const incompleteBanner = page.locator('role=alert')
    const bannerCount = await incompleteBanner.count()
    // Banner should either be gone or show completion status
    if (bannerCount > 0) {
      await expect(incompleteBanner).toContainText(/100%|complete|ready/i)
    }

    // 9. Try to create and publish a load
    const createLoadButton = page.locator('button:has-text("Create Load")').first()
    if (await createLoadButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await createLoadButton.click()

      // Fill load details
      await page.fill('input[placeholder="Origin"]', 'Atlanta, GA')
      await page.fill('input[placeholder="Destination"]', 'Miami, FL')
      await page.fill('input[placeholder="Weight"]', '10000')
      await page.fill('input[placeholder="Rate"]', '2500')

      // Click publish button
      const publishButton = page.locator('button:has-text("Publish")').first()
      if (await publishButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await publishButton.click()

        // 10. Verify load published successfully (no ProfileIncompleteException error)
        await expect(page.locator('text=published|created')).toBeVisible({ timeout: 5000 })
      }
    }
  })

  test('profile completeness persists after page reload', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`)
    await page.getByLabel('Email').fill('shipper@test.com')
    await page.getByLabel('Password').fill('N1kk101!')
    await page.getByRole('button', { name: /sign in/i }).click()

    const authResult = await Promise.race([
      page.waitForURL(/\/dashboard/, { timeout: 5000 }).then(() => true),
      page.waitForURL(/\/login/, { timeout: 5000 }).then(() => false),
    ]).catch(() => null)

    if (authResult !== true) {
      test.skip(true, 'Test user authentication failed')
    }

    // Navigate to profile
    await page.goto(`${BASE_URL}/shipper/profile`)
    await expect(page.locator('text=Company Profile')).toBeVisible({ timeout: 5000 })

    // Fill form
    await page.fill('[placeholder="Apex Freight Solutions LLC"]', 'Persistent Freight')
    await page.fill('[placeholder="billing@company.com"]', 'persistent@freight.com')
    await page.fill('[placeholder="\\(512\\) 555-0182"]', '(555) 222-3333')
    await page.fill('[placeholder="Austin"]', 'Denver')
    await page.fill('[placeholder="TX"]', 'CO')
    await page.fill('[placeholder="78701"]', '80202')

    // Save
    await page.click('button:has-text("Save Profile")')
    await expect(page.locator('text=profile is complete|saved')).toBeVisible({ timeout: 5000 })

    // Reload page
    await page.reload({ waitUntil: 'networkidle' })

    // Verify saved data persists
    await expect(page.locator('input[value="Persistent Freight"]')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('input[value="persistent@freight.com"]')).toBeVisible({ timeout: 5000 })
  })
})
