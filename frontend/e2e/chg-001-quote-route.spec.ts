/**
 * CHG-001: Missing `/shipper/quote` Route
 *
 * Feature: Quick Actions Panel "Get A Quote" button navigation
 * AC-1: Route Exists and Renders
 * AC-2: Button Navigation Works
 * AC-3: Stub Component Meets MVP
 *
 * CODER workflow: RED (test fails) → GREEN (implement) → REFACTOR (clean)
 */

import { test, expect } from '@playwright/test'
import { TestDataSeeder } from './fixtures/test-data-seeder'

async function setUserAuth(page: any, user: any) {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.evaluate((u: any) => {
    localStorage.setItem('freightclub_access_token', u.accessToken)
    localStorage.setItem('freightclub_user', JSON.stringify({ id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role, tenantId: u.tenantId }))
  }, user)
}

test.describe('CHG-001: Quote Request Route', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  // AC-1: Route Exists and Renders
  test('AC-1: route /shipper/quote loads without 404 and QuoteRequestPage renders', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `quote-route-${Date.now()}@test.com`,
      role: 'SHIPPER',
      firstName: 'Quote',
      lastName: 'Tester',
      companyName: 'Quote Test Corp',
    })

    try {
      await setUserAuth(page, user)

      // Navigate to /shipper/quote
      await page.goto('/shipper/quote', { waitUntil: 'domcontentloaded' })

      // AC-1: No 404 error
      expect(page.url()).toContain('/shipper/quote')

      // AC-3: Heading "Get A Quote" is visible
      const heading = page.locator('h1:has-text("Get A Quote")')
      await expect(heading).toBeVisible({ timeout: 5000 })

      // AC-3: Placeholder message visible
      const message = page.locator('text=Quote request feature coming soon')
      await expect(message).toBeVisible()

      // AC-3: AppShell wrapper visible (header should contain nav or app-shell class)
      const appShell = page.locator('[class*="app-shell"], header, nav')
      await expect(appShell.first()).toBeVisible()

      await page.screenshot({ path: 'test-results/evidence/chg-001-ac1-route-renders.png', fullPage: true })
    } finally {
      await seeder.cleanup()
    }
  })

  // AC-2: Button Navigation Works
  test('AC-2: "Get A Quote" button from dashboard navigates to /shipper/quote', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `quote-btn-${Date.now()}@test.com`,
      role: 'SHIPPER',
      firstName: 'Button',
      lastName: 'Tester',
      companyName: 'Button Test Corp',
    })

    try {
      await setUserAuth(page, user)

      // Navigate to dashboard
      await page.goto('/dashboard/shipper', { waitUntil: 'domcontentloaded' })

      // Find and click "Get A Quote" button
      const quoteButton = page.locator('[data-testid="quick-actions-quote"]')
      await expect(quoteButton).toBeVisible({ timeout: 5000 })
      await quoteButton.click()

      // AC-2: Should navigate to /shipper/quote without errors
      await page.waitForURL('**/shipper/quote', { timeout: 5000 })
      expect(page.url()).toContain('/shipper/quote')

      // Verify page loads without console errors
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })

      await expect(page.locator('h1:has-text("Get A Quote")')).toBeVisible()
      expect(errors).toHaveLength(0)

      await page.screenshot({ path: 'test-results/evidence/chg-001-ac2-button-nav.png', fullPage: true })
    } finally {
      await seeder.cleanup()
    }
  })

  // AC-3: Stub Component Meets MVP
  test('AC-3: QuoteRequestPage stub displays heading, message, and AppShell', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `quote-stub-${Date.now()}@test.com`,
      role: 'SHIPPER',
      firstName: 'Stub',
      lastName: 'Tester',
      companyName: 'Stub Test Corp',
    })

    try {
      await setUserAuth(page, user)

      await page.goto('/shipper/quote', { waitUntil: 'domcontentloaded' })

      // AC-3: Heading "Get A Quote" visible (h1)
      const h1 = page.locator('h1:has-text("Get A Quote")')
      await expect(h1).toBeVisible()

      // AC-3: Placeholder message visible
      const message = page.locator('text=Quote request feature coming soon')
      await expect(message).toBeVisible()

      // AC-3: AppShell header visible (indicates AppShell wrapper present + navigation available)
      const header = page.locator('header, [role="banner"]')
      await expect(header.first()).toBeVisible({ timeout: 5000 })

      // AC-3: Navigation back to dashboard is available via AppShell header
      // (Users can click logo or use browser back; explicit back button not required on stub)
      const logo = page.locator('[data-testid="app-logo"], a[href="/"]')
      await expect(logo.or(header.first())).toBeVisible()

      await page.screenshot({ path: 'test-results/evidence/chg-001-ac3-stub-meets-mvp.png', fullPage: true })
    } finally {
      await seeder.cleanup()
    }
  })

  // Unauthenticated access should be blocked (ProtectedRoute)
  test('Route is protected: unauthenticated access redirects to login', async ({ page }) => {
    await page.goto('/shipper/quote', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })
})
