import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Feature: US-844 — Carrier Load Board UX (Phase 5)
 * AC-1: Equipment type filter removed; read-only badge + "X LOADS MATCHING YOUR RIG" label
 * AC-2: Board lock banner (bronze #C9A876 border, 🔒 message) when active load exists
 * AC-3: Post-mutation nav to /dashboard/trucker — already implemented in TruckerLoadDetailPage
 *
 * Strategy:
 *   - equipmentType comes from profile API (GET /api/v1/profile), mocked to inject DRY_VAN
 *   - TruckerDashboard uses profile?.equipmentType as fallback when user.equipmentType is null
 *   - Active load: mocked at GET /api/v1/board/my-load
 *   - Route to test: /dashboard/trucker (not legacy /dashboard/carrier)
 */

const BACKEND = process.env.TEST_BACKEND_URL || 'http://localhost:9091'
const FRONTEND = process.env.TEST_FRONTEND_URL || 'http://localhost:9090'
const EVIDENCE = path.resolve('test-results/evidence')

test.beforeAll(() => fs.mkdirSync(EVIDENCE, { recursive: true }))
test.setTimeout(90000)

const MOCK_PROFILE_DRY_VAN = {
  id: 'mock-profile-1',
  userId: 'mock-user-1',
  equipmentType: 'DRY_VAN',
  monthlyFixedCosts: null,
  fuelCostPerGallon: null,
  milesPerGallon: null,
  maintenanceCostPerMile: null,
  onTimePercentage: null,
}

/**
 * Register a TRUCKER user and log in, navigating to /dashboard/trucker.
 * No response interceptors — login uses real backend flow.
 */
async function loginAsCarrier(page: any, email: string) {
  await fetch(`${BACKEND}/api/test/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'E2ETestPassword123!',
      firstName: 'Carrier',
      lastName: 'Test',
      role: 'TRUCKER',
      companyName: `CarrierCo-${Date.now()}`,
    }),
  })

  await page.goto(`${FRONTEND}/`)
  // header-login-btn is desktop-only (hidden below Tailwind's md breakpoint);
  // at narrow viewports login is reachable only via the hamburger menu (CHG-862).
  const desktopLogin = page.locator('[data-testid="header-login-btn"]')
  if (await desktopLogin.isVisible().catch(() => false)) {
    await desktopLogin.click()
  } else {
    await page.click('[data-testid="mobile-menu-toggle"]')
    await page.click('[data-testid="mobile-nav-login-btn"]')
  }
  await page.fill('[data-testid="email-input"]', email)
  await page.fill('[data-testid="password-input"]', 'E2ETestPassword123!')
  await page.click('[data-testid="login-submit-btn"]')
  await page.waitForURL(/\/dashboard/, { timeout: 30000 })

  // Navigate to new TruckerDashboard (not legacy /dashboard/carrier)
  await page.goto(`${FRONTEND}/dashboard/trucker`)
  // TruckerDashboard.tsx polls live data (diesel prices, load board), so
  // 'networkidle' never resolves — wait for a concrete rendered element
  // instead (same fix already applied in US-841-ui-primitives.spec.ts).
  await expect(page.getByTestId('trucker-dashboard')).toBeVisible({ timeout: 15000 })
}

// ── AC-1: Equipment badge and load count label ──────────────────────────────

test.describe('US-844 equipment badge', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  const ts = Date.now()

  test('AC-1: read-only equipment badge shown, no equipment <select>', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })

    // Mock profile to inject equipmentType: DRY_VAN
    await page.route('**/api/v1/profile', (route: any) => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PROFILE_DRY_VAN) })
      } else {
        route.continue()
      }
    })

    await loginAsCarrier(page, `us844-badge-${ts}@freightclub.local`)

    // Must NOT have any <select> filter controls (board is profile-driven)
    const selects = page.locator('[data-testid="trucker-dashboard"] select')
    await expect(selects).toHaveCount(0)

    // AppShell header must NOT be rendered — carrier uses full-viewport fixed shell
    await expect(page.locator('[data-testid="app-shell"]')).not.toBeVisible()

    // Equipment badge must be visible
    const badge = page.locator('[data-testid="equipment-badge"]')
    await expect(badge).toBeVisible({ timeout: 10000 })

    const badgeText = await badge.textContent()
    expect(badgeText).toContain('YOUR EQUIPMENT')
    expect(badgeText).toContain('DRY VAN')
    expect(badgeText).toContain('Loads matched to your rig')

    await page.screenshot({
      path: path.join(EVIDENCE, 'US-844-equipment-badge.png'),
      fullPage: true,
    })
  })

  test('AC-1: load count label is 10px uppercase #636E72', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })

    // Mock profile with no active load scenario
    await page.route('**/api/v1/profile', (route: any) => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PROFILE_DRY_VAN) })
      } else {
        route.continue()
      }
    })

    await loginAsCarrier(page, `us844-count-${ts}@freightclub.local`)

    const countLabel = page.locator('[data-testid="load-count-label"]')
    await expect(countLabel).toBeVisible({ timeout: 10000 })

    const styles = await countLabel.evaluate((el: HTMLElement) => {
      const cs = window.getComputedStyle(el)
      return { fontSize: cs.fontSize, textTransform: cs.textTransform, color: cs.color }
    })
    expect(styles.fontSize).toBe('10px')
    expect(styles.textTransform).toBe('uppercase')
    // #636E72 = rgb(99, 110, 114)
    expect(styles.color).toBe('rgb(99, 110, 114)')

    const text = await countLabel.textContent()
    expect(text?.toUpperCase()).toContain('LOADS MATCHING YOUR RIG')

    await page.screenshot({
      path: path.join(EVIDENCE, 'US-844-count-label.png'),
      fullPage: true,
    })
  })
})

// ── AC-2: Board lock banner ──────────────────────────────────────────────────

test.describe('US-844 board lock banner', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  const ts = Date.now()

  test('AC-2: lock banner shown with bronze #C9A876 border when active load exists', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })

    // Mock active load endpoint (GET /api/v1/board/my-load)
    await page.route('**/board/my-load', (route: any) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock-active-001',
          status: 'CLAIMED',
          originCity: 'Chicago', originState: 'IL',
          destinationCity: 'Dallas', destinationState: 'TX',
          payRate: 2.50, payRateType: 'PER_MILE', distanceMiles: 1000,
          pickupFrom: new Date(Date.now() + 86400000).toISOString(),
          deliveryTo: new Date(Date.now() + 172800000).toISOString(),
        }),
      })
    })

    await loginAsCarrier(page, `us844-lock-${ts}@freightclub.local`)

    const banner = page.locator('[data-testid="board-lock-banner"]')
    await expect(banner).toBeVisible({ timeout: 15000 })

    const bannerText = await banner.textContent()
    expect(bannerText).toContain('Load board locked')
    expect(bannerText).toContain('Complete your current load to claim another')

    // Bronze border: #C9A876 = rgb(201, 168, 118)
    const borderColor = await banner.evaluate((el: HTMLElement) =>
      window.getComputedStyle(el).borderColor
    )
    expect(borderColor).toBe('rgb(201, 168, 118)')

    await page.screenshot({
      path: path.join(EVIDENCE, 'US-844-board-lock-banner.png'),
      fullPage: true,
    })
  })

  test('AC-2: lock banner absent, board tab shows when no active load', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })

    // Return 404 for active load — no active load
    await page.route('**/board/my-load', (route: any) => {
      route.fulfill({ status: 404, contentType: 'application/json', body: 'null' })
    })

    await loginAsCarrier(page, `us844-nolock-${ts}@freightclub.local`)

    // No lock banner
    const banner = page.locator('[data-testid="board-lock-banner"]')
    await expect(banner).not.toBeVisible()

    // Count label should appear (LoadBoardTab rendered)
    const countLabel = page.locator('[data-testid="load-count-label"]')
    await expect(countLabel).toBeVisible({ timeout: 10000 })

    await page.screenshot({
      path: path.join(EVIDENCE, 'US-844-no-lock-board.png'),
      fullPage: true,
    })
  })
})

// ── Adversarial tests ────────────────────────────────────────────────────────

test.describe('US-844 adversarial', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  const ts = Date.now()

  test('adversarial: 320px — no horizontal overflow, lock banner readable', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 812 })

    await page.route('**/board/my-load', (route: any) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock-320', status: 'CLAIMED',
          originCity: 'Chicago', originState: 'IL',
          destinationCity: 'Dallas', destinationState: 'TX',
          payRate: 2.50, payRateType: 'PER_MILE', distanceMiles: 1000,
          pickupFrom: new Date().toISOString(), deliveryTo: new Date().toISOString(),
        }),
      })
    })

    await loginAsCarrier(page, `us844-320-${ts}@freightclub.local`)

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(340)

    const banner = page.locator('[data-testid="board-lock-banner"]')
    await expect(banner).toBeVisible({ timeout: 10000 })

    await page.screenshot({
      path: path.join(EVIDENCE, 'US-844-adversarial-320px-lock.png'),
      fullPage: true,
    })
  })

  test('adversarial: null equipmentType — badge hidden, no crash', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })

    // Mock profile WITHOUT equipment type
    await page.route('**/api/v1/profile', (route: any) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...MOCK_PROFILE_DRY_VAN, equipmentType: null }),
        })
      } else {
        route.continue()
      }
    })

    await loginAsCarrier(page, `us844-nulleq-${ts}@freightclub.local`)

    // Badge must NOT show
    const badge = page.locator('[data-testid="equipment-badge"]')
    await expect(badge).not.toBeVisible()

    // Count label still shows (LoadBoardTab renders without badge)
    const countLabel = page.locator('[data-testid="load-count-label"]')
    await expect(countLabel).toBeVisible({ timeout: 10000 })

    await page.screenshot({
      path: path.join(EVIDENCE, 'US-844-adversarial-null-equipment.png'),
      fullPage: true,
    })
  })
})
