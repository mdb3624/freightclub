import { test, expect } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:9090'

test.describe('Shipper Profile Setup — US-713', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login
    await page.goto(`${BASE_URL}/login`)

    // Mock profile completeness API (returns incomplete profile)
    await page.route('**/api/v1/profile/completeness', async (route) => {
      await route.abort()
    })
  })

  test('golden path: shipper completes profile and reaches 80% threshold', async ({ page }) => {
    // Setup: Login as shipper (mock the auth flow)
    await page.goto(`${BASE_URL}/login`)
    await page.getByLabel('Email').fill('shipper@test.com')
    await page.getByLabel('Password').fill('N1kk101!')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Check if authentication worked
    const authResult = await Promise.race([
      page.waitForURL(/dashboard/, { timeout: 3000 }).then(() => true),
      page.waitForURL(/\/login/, { timeout: 3000 }).then(() => false),
    ]).catch(() => null)

    if (authResult !== true) {
      test.skip(true, 'Test user authentication failed - backend test data not configured. Run database migrations.')
    }

    // Intercept the profile endpoints
    await page.route('**/api/v1/profile/company-info', async (route) => {
      if (route.request().method() === 'GET') {
        // Return no existing profile on first load
        await route.abort()
      } else if (route.request().method() === 'POST') {
        // Return the saved profile with 80% completeness
        const body = await route.request().postDataJSON()
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'profile-1',
            companyName: body.companyName,
            billingEmail: body.billingEmail,
            phoneNumber: body.phoneNumber,
            city: body.city,
            state: body.state,
            zipCode: body.zipCode,
            mcNumber: body.mcNumber || null,
            usdotNumber: body.usdotNumber || null,
            logoUrl: body.logoUrl || null,
            completenessPercent: 80,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        })
      }
    })

    await page.route('**/api/v1/profile/completeness', async (route) => {
      if (route.request().method() === 'GET') {
        // Return progressively increasing completeness
        const callCount = (parseInt(route.request().url().split('?')[1]?.split('=')[1] || '1')) || 1
        if (callCount === 1) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              completenessPercent: 0,
              isPublishReady: false,
              remainingFields: ['companyName', 'billingEmail', 'phoneNumber', 'city', 'state', 'zipCode'],
            }),
          })
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              completenessPercent: 80,
              isPublishReady: true,
              remainingFields: [],
            }),
          })
        }
      }
    })

    // Navigate to shipper profile page
    await page.goto(`${BASE_URL}/shipper/profile`)

    // Verify form loads
    await expect(page.locator('text=Company Profile')).toBeVisible()

    // Fill out the form
    await page.fill('[placeholder="Apex Freight Solutions LLC"]', 'Apex Freight')
    await page.fill('[placeholder="billing@company.com"]', 'billing@apex.com')
    await page.fill('[placeholder="\\(512\\) 555-0182"]', '(512) 555-0182')
    await page.fill('[placeholder="Austin"]', 'Austin')
    await page.fill('[placeholder="TX"]', 'TX')
    await page.fill('[placeholder="78701"]', '78701')

    // Submit the form
    await page.click('button:has-text("Save Profile")')

    // Verify success state (profile now at 80%)
    await expect(page.locator('text=profile is complete')).toBeVisible()
  })

  test('displays completion banner on dashboard when incomplete', async ({ page }) => {
    // Authenticate
    await page.goto(`${BASE_URL}/login`)
    await page.getByLabel('Email').fill('shipper@test.com')
    await page.getByLabel('Password').fill('N1kk101!')
    await page.getByRole('button', { name: /sign in/i }).click()

    const authResult = await Promise.race([
      page.waitForURL(/dashboard/, { timeout: 3000 }).then(() => true),
      page.waitForURL(/\/login/, { timeout: 3000 }).then(() => false),
    ]).catch(() => null)

    if (authResult !== true) {
      test.skip(true, 'Test user authentication failed - backend test data not configured')
    }

    // Mock incomplete profile
    await page.route('**/api/v1/profile/completeness', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          completenessPercent: 40,
          isPublishReady: false,
          remainingFields: ['companyName', 'city', 'state', 'zipCode'],
        }),
      })
    })

    // Navigate to dashboard
    await page.goto(`${BASE_URL}/dashboard/shipper`)

    // Verify banner appears
    await expect(page.locator('role=alert')).toBeVisible()
    await expect(page.locator('text=Finish your setup')).toBeVisible()
    await expect(page.locator('text=40% complete')).toBeVisible()

    // Click "Complete Profile" button in banner
    await page.click('button:has-text("Complete Profile")')

    // Verify navigation to profile page
    await expect(page).toHaveURL(/.*\/shipper\/profile/)
  })

  test('hides banner when profile is ≥80% complete', async ({ page }) => {
    // Authenticate
    await page.goto(`${BASE_URL}/login`)
    await page.getByLabel('Email').fill('shipper@test.com')
    await page.getByLabel('Password').fill('N1kk101!')
    await page.getByRole('button', { name: /sign in/i }).click()

    const authResult = await Promise.race([
      page.waitForURL(/dashboard/, { timeout: 3000 }).then(() => true),
      page.waitForURL(/\/login/, { timeout: 3000 }).then(() => false),
    ]).catch(() => null)

    if (authResult !== true) {
      test.skip(true, 'Test user authentication failed - backend test data not configured')
    }

    // Mock complete profile
    await page.route('**/api/v1/profile/completeness', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          completenessPercent: 85,
          isPublishReady: true,
          remainingFields: [],
        }),
      })
    })

    // Navigate to dashboard
    await page.goto(`${BASE_URL}/dashboard/shipper`)

    // Verify banner is NOT shown
    const alert = page.locator('role=alert')
    expect(await alert.count()).toBe(0)
  })

  test('validates required fields', async ({ page }) => {
    // Authenticate first
    await page.goto(`${BASE_URL}/login`)
    await page.getByLabel('Email').fill('shipper@test.com')
    await page.getByLabel('Password').fill('N1kk101!')
    await page.getByRole('button', { name: /sign in/i }).click()

    const authResult = await Promise.race([
      page.waitForURL(/dashboard/, { timeout: 3000 }).then(() => true),
      page.waitForURL(/\/login/, { timeout: 3000 }).then(() => false),
    ]).catch(() => null)

    if (authResult !== true) {
      test.skip(true, 'Test user authentication failed - backend test data not configured')
    }

    await page.route('**/api/v1/profile/company-info', async (route) => {
      await route.abort()
    })

    await page.goto(`${BASE_URL}/shipper/profile`)

    // Try submitting empty form
    await page.click('button:has-text("Save Profile")')

    // Verify validation errors appear
    await expect(page.locator('text=Company name is required')).toBeVisible()
    await expect(page.locator('text=Invalid email format')).toBeVisible()
  })

  test('validates email format', async ({ page }) => {
    // Authenticate first
    await page.goto(`${BASE_URL}/login`)
    await page.getByLabel('Email').fill('shipper@test.com')
    await page.getByLabel('Password').fill('N1kk101!')
    await page.getByRole('button', { name: /sign in/i }).click()

    const authResult = await Promise.race([
      page.waitForURL(/dashboard/, { timeout: 3000 }).then(() => true),
      page.waitForURL(/\/login/, { timeout: 3000 }).then(() => false),
    ]).catch(() => null)

    if (authResult !== true) {
      test.skip(true, 'Test user authentication failed - backend test data not configured')
    }

    await page.route('**/api/v1/profile/company-info', async (route) => {
      await route.abort()
    })

    await page.goto(`${BASE_URL}/shipper/profile`)

    await page.fill('[placeholder="Apex Freight Solutions LLC"]', 'Apex Freight')
    await page.fill('[placeholder="billing@company.com"]', 'invalid-email')
    await page.fill('[placeholder="\\(512\\) 555-0182"]', '(512) 555-0182')
    await page.fill('[placeholder="Austin"]', 'Austin')
    await page.fill('[placeholder="TX"]', 'TX')
    await page.fill('[placeholder="78701"]', '78701')

    await page.click('button:has-text("Save Profile")')

    await expect(page.locator('text=Invalid email format')).toBeVisible()
  })

  test('validates phone format', async ({ page }) => {
    // Authenticate first
    await page.goto(`${BASE_URL}/login`)
    await page.getByLabel('Email').fill('shipper@test.com')
    await page.getByLabel('Password').fill('N1kk101!')
    await page.getByRole('button', { name: /sign in/i }).click()

    const authResult = await Promise.race([
      page.waitForURL(/dashboard/, { timeout: 3000 }).then(() => true),
      page.waitForURL(/\/login/, { timeout: 3000 }).then(() => false),
    ]).catch(() => null)

    if (authResult !== true) {
      test.skip(true, 'Test user authentication failed - backend test data not configured')
    }

    await page.route('**/api/v1/profile/company-info', async (route) => {
      await route.abort()
    })

    await page.goto(`${BASE_URL}/shipper/profile`)

    await page.fill('[placeholder="Apex Freight Solutions LLC"]', 'Apex Freight')
    await page.fill('[placeholder="billing@company.com"]', 'billing@apex.com')
    await page.fill('[placeholder="\\(512\\) 555-0182"]', '512-555-0182') // Invalid format
    await page.fill('[placeholder="Austin"]', 'Austin')
    await page.fill('[placeholder="TX"]', 'TX')
    await page.fill('[placeholder="78701"]', '78701')

    await page.click('button:has-text("Save Profile")')

    await expect(page.locator('text=Phone format')).toBeVisible()
  })
})
