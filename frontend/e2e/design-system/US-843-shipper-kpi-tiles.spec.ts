import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Feature: US-843 — Shipper Dashboard KPI Reskin (Phase 4)
 * AC-1: KPI tiles match UI kit: Sora 48px/900-weight value, grey #D0D0D0 border
 * AC-2: On-Time tile uses semantic color (green ≥90%, amber ≥75%, red <75%)
 * AC-3: Tiles render with "No data" when API returns null — no crash
 *
 * UI Kit reference: Prototype/ui_kits/shipper/index.html
 * - KPI panel: background #fff, border 1px solid #D0D0D0, border-radius 8px
 * - Value: fontFamily Sora, fontSize 48, fontWeight 900, color #1A1A1A
 * - Label: fontSize 11, fontWeight 700, uppercase, letterSpacing .08em, color #636E72
 */

const BACKEND  = process.env.TEST_BACKEND_URL  || 'http://localhost:9091'
const FRONTEND = process.env.TEST_FRONTEND_URL || 'http://localhost:9090'
const EVIDENCE = path.resolve('test-results/evidence')

test.beforeAll(() => fs.mkdirSync(EVIDENCE, { recursive: true }))
test.setTimeout(90000)

const MOCK_KPI = {
  activeLoadCount: 24,
  onTimePercentage: 96,
  costPerMile: 2.11,
  isEmpty: false,
}

const MOCK_KPI_EMPTY = {
  activeLoadCount: 0,
  onTimePercentage: null,
  costPerMile: null,
  isEmpty: true,
}

async function loginAsShipper(page: any, email: string) {
  await fetch(`${BACKEND}/api/test/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'E2ETestPassword123!',
      firstName: 'James',
      lastName: 'Porter',
      role: 'SHIPPER',
      companyName: `ShipCo-${Date.now()}`,
    }),
  })

  await page.goto(`${FRONTEND}/login`)
  await page.fill('[data-testid="email-input"]', email)
  await page.fill('[data-testid="password-input"]', 'E2ETestPassword123!')
  await page.click('[data-testid="login-submit-btn"]')
  await page.waitForURL(/\/dashboard/, { timeout: 30000 })
  await page.waitForLoadState('networkidle')
}

// ── AC-1: KPI tiles visual match UI kit ─────────────────────────────────────

test.describe('US-843 KPI tile styling', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  const ts = Date.now()

  test('AC-1: KPI value is 48px Sora Black, border is grey #D0D0D0', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })

    await page.route('**/api/v1/shipper/dashboard/kpi-summary', (route: any) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_KPI) })
    })

    await loginAsShipper(page, `us843-style-${ts}@freightclub.local`)

    const tile = page.locator('[data-testid="kpi-tile-active-loads"]')
    await expect(tile).toBeVisible({ timeout: 10000 })

    // Border must be grey, NOT bronze
    const borderColor = await tile.evaluate((el: HTMLElement) =>
      window.getComputedStyle(el).borderColor
    )
    // #D0D0D0 = rgb(208, 208, 208)
    expect(borderColor).toBe('rgb(208, 208, 208)')

    // Value must be 48px
    const valueEl = page.locator('[data-testid="kpi-tile-active-loads-value"]')
    await expect(valueEl).toBeVisible()
    const fontSize = await valueEl.evaluate((el: HTMLElement) =>
      window.getComputedStyle(el).fontSize
    )
    expect(fontSize).toBe('48px')

    // Value text should show the count
    const text = await valueEl.textContent()
    expect(text).toBe('24')

    await page.screenshot({ path: path.join(EVIDENCE, 'US-843-kpi-tiles.png'), fullPage: true })
  })

  test('AC-2: On-Time tile value is green (#27AE60) when ≥90%', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })

    await page.route('**/api/v1/shipper/dashboard/kpi-summary', (route: any) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_KPI) })
    })

    await loginAsShipper(page, `us843-ontime-${ts}@freightclub.local`)

    const onTimeValue = page.locator('[data-testid="kpi-tile-ontime-value"]')
    await expect(onTimeValue).toBeVisible({ timeout: 10000 })

    const text = await onTimeValue.textContent()
    expect(text).toBe('96.0')

    // Color must be green #27AE60 = rgb(39, 174, 96)
    const color = await onTimeValue.evaluate((el: HTMLElement) =>
      window.getComputedStyle(el).color
    )
    expect(color).toBe('rgb(39, 174, 96)')

    await page.screenshot({ path: path.join(EVIDENCE, 'US-843-ontime-tile.png') })
  })
})

// ── AC-3: Empty / null data ──────────────────────────────────────────────────

test.describe('US-843 adversarial', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  const ts = Date.now()

  test('AC-3: null KPI values render "No data", no crash', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })

    await page.route('**/api/v1/shipper/dashboard/kpi-summary', (route: any) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_KPI_EMPTY) })
    })

    await loginAsShipper(page, `us843-empty-${ts}@freightclub.local`)

    const panel = page.locator('[data-testid="kpi-summary-panel"]')
    await expect(panel).toBeVisible({ timeout: 10000 })

    // Should not crash — all tiles present
    await expect(page.locator('[data-testid="kpi-tile-active-loads"]')).toBeVisible()
    await expect(page.locator('[data-testid="kpi-tile-cost-per-mile"]')).toBeVisible()
    await expect(page.locator('[data-testid="kpi-tile-ontime"]')).toBeVisible()

    // Null values render gracefully
    const costValue = page.locator('[data-testid="kpi-tile-cost-per-mile-value"]')
    await expect(costValue).toBeVisible()
    const costText = await costValue.textContent()
    expect(costText).toBe('No data')

    await page.screenshot({ path: path.join(EVIDENCE, 'US-843-adversarial-empty-kpi.png'), fullPage: true })
  })
})
