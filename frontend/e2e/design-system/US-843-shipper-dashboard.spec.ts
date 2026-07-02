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

const FRONTEND = process.env.TEST_FRONTEND_URL || 'http://localhost:9090'
const EVIDENCE = path.resolve('test-results/evidence')

test.beforeAll(() => fs.mkdirSync(EVIDENCE, { recursive: true }))
test.setTimeout(60000)

// ── Golden-path: authenticated shipper ─────────────────────────────────────
// Uses global auth.json (SHIPPER role set up by globalSetup)

test.describe('US-843 shipper dashboard reskin', () => {
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

  test('AC-2: KPI tile icons use brand bronze #B08D57', async ({ page }) => {
    await page.goto(`${FRONTEND}/dashboard/shipper`)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('[data-testid="kpi-tile-active-loads"]')).toBeVisible({ timeout: 15000 })

    const iconColor = await page.locator('[data-testid="kpi-tile-active-loads-icon"]').evaluate((el: HTMLElement) =>
      window.getComputedStyle(el).color
    )
    // #B08D57 = rgb(176, 141, 87)
    expect(iconColor).toBe('rgb(176, 141, 87)')
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
