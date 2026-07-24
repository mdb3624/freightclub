/**
 * HOS Widget & Trucker Tools Page Tests
 *
 * Refactored Features (Phase 5 Pattern Rollout):
 * 1. Uses data-testid selectors for critical components (mandatory per testing_standards.md)
 * 2. Web-first assertions with explicit timeouts
 * 3. No hard-coded waits (waitForTimeout removed)
 * 4. Trace generation on failure
 *
 * Focus: Smoke tests for HOS widget compilation + the trucker tools page
 * (CPM Calculator / Load Analyzer / Broker Comms), relocated from '/' to the
 * protected '/carrier/tools' route by US-855 (marketing home page).
 */

import { test, expect } from '@playwright/test'
import { TestDataSeeder } from './fixtures/test-data-seeder'

// AuthInitializer unconditionally calls refreshAccessToken() on every mount
// (the access token is deliberately memory-only, never persisted — see
// authStore.ts) using the HTTP-only refreshToken cookie. TestDataSeeder
// captures that cookie value on `user.refreshToken` but it was never actually
// applied to the browser context here — only the (unread, dead) localStorage
// access-token key was set — so the refresh always 401'd with no cookie to
// back it, and the app fell back to logged-out on every navigation (CHG-861).
async function loginAndGoToTools(page: import('@playwright/test').Page, request: import('@playwright/test').APIRequestContext) {
  const seeder = new TestDataSeeder(request)
  const user = await seeder.createTestUser({ role: 'TRUCKER' })
  const frontendUrl = process.env.TEST_FRONTEND_URL || 'http://localhost:9090'
  await page.context().addCookies([{
    name: 'refreshToken',
    value: user.refreshToken!,
    url: frontendUrl,
    httpOnly: true,
    sameSite: 'Lax',
    secure: false,
  }])
  // addInitScript (not page.evaluate after a first goto) so localStorage is
  // seeded before the ONE real navigation below — an earlier goto('/') just
  // to seed localStorage would itself mount AuthInitializer and consume the
  // single-use refresh token, leaving nothing valid for the real navigation.
  await page.addInitScript((u) => {
    localStorage.setItem('freightclub_user', JSON.stringify({
      id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role, tenantId: u.tenantId,
    }))
  }, user)
  await page.goto('/carrier/tools', { waitUntil: 'networkidle' })
  return seeder
}

test.describe('HOS Widget & Trucker Tools Page (Smoke Tests)', () => {
  // ============================================================================
  // SETUP: Per-test state cleanup
  // ============================================================================
  test.beforeEach(async ({ context }) => {
    // Traces are managed by playwright.config.ts (trace: 'retain-on-failure')
    await context.clearCookies()
  })

  // ============================================================================
  // TEST 1: HOS Widget compiles without errors
  // ============================================================================
  test('HosWidget should compile without TypeScript errors', async ({ page, request }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    const seeder = await loginAndGoToTools(page, request)
    try {
      await expect(page.locator('[data-testid="app-container"]')).toBeVisible({ timeout: 5000 })

      const hosErrors = errors.filter(
        e => e.includes('HosWidget') || e.includes('useHosState') || e.includes('HOS')
      )
      expect(hosErrors).toHaveLength(0)
    } finally {
      await seeder.cleanup().catch(() => {})
    }
  })

  // ============================================================================
  // TEST 2: Tools page loads and displays main sections
  // ============================================================================
  test('Tools page should render main sections with data-testid', async ({ page, request }) => {
    const seeder = await loginAndGoToTools(page, request)
    try {
      await expect(page.locator('[data-testid="trucker-landing-header"]')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('[data-testid="ticker-widget"]')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('[data-testid="main-content"]')).toBeVisible({ timeout: 5000 })
    } finally {
      await seeder.cleanup().catch(() => {})
    }
  })

  // ============================================================================
  // TEST 3: Market ticker displays with data-testid
  // ============================================================================
  test('Market ticker should display items with data-testid selectors', async ({ page, request }) => {
    const seeder = await loginAndGoToTools(page, request)
    try {
      await expect(page.locator('[data-testid="ticker-widget"]')).toBeVisible({ timeout: 5000 })

      const tickerItems = page.locator('[data-testid="ticker-item"]')
      const count = await tickerItems.count()
      expect(count).toBeGreaterThan(0)
    } finally {
      await seeder.cleanup().catch(() => {})
    }
  })

  // ============================================================================
  // TEST 4: Navigation tabs render correctly
  // ============================================================================
  test('Navigation tabs should render with proper data-testid attributes', async ({ page, request }) => {
    const seeder = await loginAndGoToTools(page, request)
    try {
      await expect(page.locator('[data-testid="nav-tabs"]')).toBeVisible({ timeout: 5000 })

      const navTab = page.locator('[data-testid="nav-tab"]').first()
      await expect(navTab).toBeVisible({ timeout: 5000 })
    } finally {
      await seeder.cleanup().catch(() => {})
    }
  })

  // ============================================================================
  // TEST 5: Page renders without critical errors
  // ============================================================================
  test('Page should render without critical console errors', async ({ page, request }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    const seeder = await loginAndGoToTools(page, request)
    try {
      await expect(page.locator('[data-testid="app-container"]')).toBeVisible({ timeout: 5000 })

      const criticalErrors = errors.filter(
        e => !e.includes('warn') && !e.includes('deprecated')
      )
      expect(criticalErrors).toHaveLength(0)
    } finally {
      await seeder.cleanup().catch(() => {})
    }
  })

  // ============================================================================
  // TEST 6: Responsive layout (desktop)
  // ============================================================================
  test('Should render correctly on desktop viewport', async ({ page, request }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    const seeder = await loginAndGoToTools(page, request)
    try {
      await expect(page.locator('[data-testid="trucker-landing-header"]')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('[data-testid="main-content"]')).toBeVisible({ timeout: 5000 })
    } finally {
      await seeder.cleanup().catch(() => {})
    }
  })

  // ============================================================================
  // TEST 7: Responsive layout (mobile)
  // ============================================================================
  test('Should render correctly on mobile viewport', async ({ page, request }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    const seeder = await loginAndGoToTools(page, request)
    try {
      await expect(page.locator('[data-testid="trucker-landing-header"]')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('[data-testid="main-content"]')).toBeVisible({ timeout: 5000 })
    } finally {
      await seeder.cleanup().catch(() => {})
    }
  })
})
