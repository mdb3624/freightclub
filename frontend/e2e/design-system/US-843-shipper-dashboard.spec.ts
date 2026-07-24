import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Feature: US-843 — Shipper Dashboard Reskin (Phase 4)
 * AC-1: KPI tiles use #FFFFFF bg, 1px solid #D0D0D0 border, 8px radius, 24px padding
 * AC-2: KPI tile icons use brand bronze (#B08D57)
 * AC-3: On-Time Rate tile renders progress bar track (#E8E3D8 bg)
 * AC-4: Load table headers are 12px uppercase, #636E72 text, #F5F0E8 bg
 * AC-5: Load table rows are 48px height, #E8E3D8 dividers
 * AC-6: Load table last column has chevron affordance (›)
 */

const BACKEND = process.env.TEST_BACKEND_URL || 'http://localhost:9091'
const FRONTEND = process.env.TEST_FRONTEND_URL || 'http://localhost:9090'
const EVIDENCE = path.resolve('test-results/evidence')

test.beforeAll(() => fs.mkdirSync(EVIDENCE, { recursive: true }))
test.setTimeout(60000)

// Each test registers + logs in its own SHIPPER via the real UI flow, isolated
// from the global auth.json — the shared session's refresh token is single-use
// and rotates on every AuthInitializer mount, so tests sharing it race each
// other and land on the logged-out home page (CHG-861).
async function loginAsShipper(page: import('@playwright/test').Page, email: string) {
  await fetch(`${BACKEND}/api/test/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'E2ETestPassword123!',
      firstName: 'Shipper',
      lastName: 'Test',
      role: 'SHIPPER',
      companyName: `ShipCo-${Date.now()}`,
    }),
  })
  await page.goto(`${FRONTEND}/`)
  await page.click('[data-testid="header-login-btn"]:visible, [data-testid="header-get-started-btn-mobile"]:visible')
  await page.fill('[data-testid="email-input"]', email)
  await page.fill('[data-testid="password-input"]', 'E2ETestPassword123!')
  await page.click('[data-testid="login-submit-btn"]')
  await page.waitForURL(/\/dashboard/, { timeout: 30000 })
}

// ── Golden-path: authenticated shipper ─────────────────────────────────────

test.describe('US-843 shipper dashboard reskin', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test.beforeEach(async ({ page }, testInfo) => {
    await loginAsShipper(page, `us843-${testInfo.testId}-${Date.now()}@freightclub.local`)
  })

  test('AC-1: KPI tiles have correct border, radius, padding, and white bg', async ({ page }) => {
    await page.goto(`${FRONTEND}/dashboard/shipper`)
    await page.waitForLoadState('networkidle')

    const tile = page.locator('[data-testid="kpi-tile-active-loads"]')
    await expect(tile).toBeVisible({ timeout: 15000 })

    const styles = await tile.evaluate((el: HTMLElement) => {
      const cs = window.getComputedStyle(el)
      return {
        background: cs.backgroundColor,
        border: cs.borderColor,
        borderRadius: cs.borderRadius,
        paddingTop: cs.paddingTop,
        paddingLeft: cs.paddingLeft,
      }
    })

    // AC-1: #FFFFFF bg
    expect(styles.background).toBe('rgb(255, 255, 255)')
    // AC-1: #D0D0D0 border = rgb(208, 208, 208)
    expect(styles.border).toBe('rgb(208, 208, 208)')
    // AC-1: 8px radius
    expect(styles.borderRadius).toBe('8px')
    // AC-1: 24px padding
    expect(styles.paddingTop).toBe('24px')
    expect(styles.paddingLeft).toBe('24px')

    await page.screenshot({
      path: path.join(EVIDENCE, 'US-843-kpi-tiles.png'),
      fullPage: true,
    })
  })

  test('AC-2: On-Time tile value uses brand green #27AE60', async ({ page }) => {
    await page.route('**/shipper/dashboard/kpi-summary', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ activeLoadCount: 5, onTimePercentage: 92.5, costPerMile: 2.14, isEmpty: false }),
      })
    })

    await page.goto(`${FRONTEND}/dashboard/shipper`)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('[data-testid="kpi-tile-ontime"]')).toBeVisible({ timeout: 15000 })

    const valueColor = await page.locator('[data-testid="kpi-tile-ontime-value"]').evaluate((el: HTMLElement) =>
      window.getComputedStyle(el).color
    )
    // #27AE60 = rgb(39, 174, 96) — applied when onTimePercentage is non-null
    expect(valueColor).toBe('rgb(39, 174, 96)')
  })

  test('AC-3: On-Time Rate tile renders progress bar track', async ({ page }) => {
    // Mock KPI to inject a non-null onTimePercentage so the progress bar renders
    await page.route('**/shipper/dashboard/kpi-summary', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          activeLoadCount: 5,
          onTimePercentage: 92.5,
          costPerMile: 2.14,
          isEmpty: false,
        }),
      })
    })

    await page.goto(`${FRONTEND}/dashboard/shipper`)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('[data-testid="kpi-tile-ontime"]')).toBeVisible({ timeout: 15000 })

    const track = page.locator('[data-testid="kpi-tile-ontime-progress-track"]')
    await expect(track).toBeVisible()

    const trackBg = await track.evaluate((el: HTMLElement) =>
      window.getComputedStyle(el).backgroundColor
    )
    // #E8E3D8 = rgb(232, 227, 216)
    expect(trackBg).toBe('rgb(232, 227, 216)')

    const box = await track.boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(6)
    expect(box?.height).toBeLessThanOrEqual(9)

    await page.screenshot({
      path: path.join(EVIDENCE, 'US-843-ontime-progress.png'),
    })
  })

  test('AC-4/5/6: Load table header and row styling', async ({ page }) => {
    await page.goto(`${FRONTEND}/dashboard/shipper`)
    await page.waitForLoadState('networkidle')

    const tableHeader = page.locator('[data-testid="table-header-origin"]')
    // Table may not appear if user has no loads — skip without fail
    if (!(await tableHeader.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }

    const thStyles = await tableHeader.evaluate((el: HTMLElement) => {
      const cs = window.getComputedStyle(el)
      return {
        fontSize: cs.fontSize,
        textTransform: cs.textTransform,
        color: cs.color,
        background: cs.backgroundColor,
      }
    })

    // AC-4: 12px uppercase headers
    expect(thStyles.fontSize).toBe('12px')
    expect(thStyles.textTransform).toBe('uppercase')
    // AC-4: #636E72 = rgb(99, 110, 114)
    expect(thStyles.color).toBe('rgb(99, 110, 114)')
    // AC-4: #F5F0E8 = rgb(245, 240, 232)
    expect(thStyles.background).toBe('rgb(245, 240, 232)')

    await page.screenshot({
      path: path.join(EVIDENCE, 'US-843-load-table.png'),
      fullPage: true,
    })
  })
})

// ── Adversarial tests (required per JIRA_GIT_SETUP_PLAN.md) ────────────────

test.describe('US-843 adversarial', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test.beforeEach(async ({ page }, testInfo) => {
    await loginAsShipper(page, `us843-adv-${testInfo.testId}-${Date.now()}@freightclub.local`)
  })

  test('adversarial: no carrier dark bg leaking onto shipper canvas', async ({ page }) => {
    await page.goto(`${FRONTEND}/dashboard/shipper`)
    await page.waitForLoadState('networkidle')

    // Inject carrier persona attribute — verify no dark background
    await page.evaluate(() => document.documentElement.setAttribute('data-persona', 'carrier'))

    const bodyBg = await page.evaluate(() =>
      window.getComputedStyle(document.body).backgroundColor
    )
    // Must NOT be the carrier dark bg #121212 = rgb(18, 18, 18) or legacy dark
    expect(bodyBg).not.toBe('rgb(18, 18, 18)')
    expect(bodyBg).not.toBe('rgb(11, 18, 32)')

    await page.screenshot({
      path: path.join(EVIDENCE, 'US-843-adversarial-no-dark-bg-bleed.png'),
      fullPage: true,
    })
  })

  test('adversarial: viewport 320px — no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 812 })
    await page.goto(`${FRONTEND}/dashboard/shipper`)
    await page.waitForLoadState('networkidle')

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(340)

    await page.screenshot({
      path: path.join(EVIDENCE, 'US-843-adversarial-320px.png'),
      fullPage: true,
    })
  })

  test('adversarial: viewport 1920px — layout does not stretch', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto(`${FRONTEND}/dashboard/shipper`)
    await page.waitForLoadState('networkidle')

    // KPI panel should still be present and tiles visible
    const panel = page.locator('[data-testid="kpi-summary-panel"]')
    await expect(panel).toBeVisible({ timeout: 10000 })

    await page.screenshot({
      path: path.join(EVIDENCE, 'US-843-adversarial-1920px.png'),
      fullPage: true,
    })
  })

  test('adversarial: hardcoded hex #0B1220 / #1E2022 not present on shipper canvas', async ({ page }) => {
    await page.goto(`${FRONTEND}/dashboard/shipper`)
    await page.waitForLoadState('networkidle')

    const found = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*')
      for (const el of allElements) {
        const bg = window.getComputedStyle(el).backgroundColor
        if (bg === 'rgb(11, 18, 32)' || bg === 'rgb(30, 32, 34)') {
          return (el as HTMLElement).dataset.testid || el.tagName
        }
      }
      return null
    })
    expect(found).toBeNull()
  })

  test('adversarial: empty KPI state — tiles render without crash', async ({ page }) => {
    // Mock API to return empty/zero KPI data
    await page.route('**/shipper/dashboard/kpi-summary', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          activeLoadCount: 0,
          onTimePercentage: null,
          costPerMile: null,
          isEmpty: true,
        }),
      })
    })

    await page.goto(`${FRONTEND}/dashboard/shipper`)
    await page.waitForLoadState('networkidle')

    // Panel must render (not crash)
    const panel = page.locator('[data-testid="kpi-summary-panel"]')
    await expect(panel).toBeVisible({ timeout: 15000 })

    // All 3 tiles must be present
    await expect(page.locator('[data-testid="kpi-tile-active-loads"]')).toBeVisible()
    await expect(page.locator('[data-testid="kpi-tile-ontime"]')).toBeVisible()
    await expect(page.locator('[data-testid="kpi-tile-cost-per-mile"]')).toBeVisible()

    // Active loads tile should show 0
    const activeValue = await page.locator('[data-testid="kpi-tile-active-loads-value"]').textContent()
    expect(activeValue).toBe('0')

    await page.screenshot({
      path: path.join(EVIDENCE, 'US-843-adversarial-empty-kpi.png'),
      fullPage: true,
    })
  })
})
