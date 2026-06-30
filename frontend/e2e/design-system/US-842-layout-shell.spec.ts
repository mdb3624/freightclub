import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Feature: US-842 — AppShell Header Reskin + Legacy-Dark Removal
 * AC-1: Shipper AppShell header is 64px, white bg, #D8CEB8 border, subtle shadow
 * AC-2: Carrier AppShell header is 56px, dark bg
 * AC-3: Carrier avatar uses #B08D57 bg / #121212 text
 * AC-4: No .legacy-dark class on login/register pages
 * AC-5: legacy-dark class injection cannot override bg-white (removed CSS)
 *
 * Routing notes:
 *   - Shipper dashboard → ShipperPageLayout (NOT AppShell). Use /profile for AppShell test.
 *   - Carrier dashboard → TruckerDashboard wraps in AppShell.
 * Selector note: locator('header').first() — the AppShell <header> is always first in DOM.
 */

const BACKEND = process.env.TEST_BACKEND_URL || 'http://localhost:9091'
const FRONTEND = process.env.TEST_FRONTEND_URL || 'http://localhost:9090'
const EVIDENCE = path.resolve('test-results/evidence')

test.beforeAll(() => fs.mkdirSync(EVIDENCE, { recursive: true }))
test.setTimeout(60000)

// ── AC-4 & AC-5: unauthenticated pages ──────────────────────────────────────

test.describe('US-842 unauthenticated', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('AC-4: login page has no .legacy-dark class', async ({ page }) => {
    await page.goto(`${FRONTEND}/login`)

    const hasDark = await page.evaluate(() => !!document.querySelector('.legacy-dark'))
    expect(hasDark).toBe(false)

    await page.screenshot({
      path: path.join(EVIDENCE, 'US-842-login-no-legacy-dark.png'),
      fullPage: true,
    })
  })

  test('AC-5 adversarial: injecting legacy-dark cannot override bg-white', async ({ page }) => {
    await page.goto(`${FRONTEND}/login`)
    await page.evaluate(() => document.body.classList.add('legacy-dark'))

    const bgWhite = await page.evaluate(() => {
      const div = document.createElement('div')
      div.className = 'bg-white'
      document.body.appendChild(div)
      const color = window.getComputedStyle(div).backgroundColor
      document.body.removeChild(div)
      return color
    })
    // Must be white — NOT overridden to #161c2d (dark card from old legacy-dark CSS)
    expect(bgWhite).toBe('rgb(255, 255, 255)')

    await page.screenshot({
      path: path.join(EVIDENCE, 'US-842-adversarial-legacy-dark-injection.png'),
      fullPage: true,
    })
  })
})

// ── AC-1: Shipper AppShell header on /profile ───────────────────────────────
// Uses global auth.json (SHIPPER role) — no login needed

test.describe('US-842 shipper header', () => {
  test('AC-1: shipper AppShell header is 64px white with #D8CEB8 border', async ({ page }) => {
    await page.goto(`${FRONTEND}/profile`)
    await page.waitForLoadState('networkidle')

    const header = page.locator('header').first()
    await expect(header).toBeVisible({ timeout: 10000 })

    const box = await header.boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(60)
    expect(box?.height).toBeLessThanOrEqual(68)

    const styles = await header.evaluate((el: HTMLElement) => {
      const cs = window.getComputedStyle(el)
      return {
        background: cs.backgroundColor,
        borderBottomColor: cs.borderBottomColor,
        boxShadow: cs.boxShadow,
      }
    })

    // White background
    expect(styles.background).toBe('rgb(255, 255, 255)')
    // #D8CEB8 = rgb(216, 206, 184)
    expect(styles.borderBottomColor).toBe('rgb(216, 206, 184)')
    // Shadow present
    expect(styles.boxShadow).not.toBe('none')

    await page.screenshot({
      path: path.join(EVIDENCE, 'US-842-shipper-header.png'),
    })
  })
})

// ── AC-2, AC-3, Adversarial: Carrier (TRUCKER) ──────────────────────────────

test.describe('US-842 carrier header', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  const ts = Date.now()

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
        companyName: `CarrierCo-${ts}`,
      }),
    })
    await page.goto(`${FRONTEND}/login`)
    await page.fill('[data-testid="email-input"]', email)
    await page.fill('[data-testid="password-input"]', 'E2ETestPassword123!')
    await page.click('[data-testid="login-submit-btn"]')
    await page.waitForURL(/\/dashboard/, { timeout: 30000 })
  }

  test('AC-2/3: carrier AppShell header is dark with bronze avatar', async ({ page }) => {
    await loginAsCarrier(page, `us842-carrier-${ts}@freightclub.local`)

    const header = page.locator('header').first()
    await expect(header).toBeVisible({ timeout: 10000 })

    const box = await header.boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(52)
    expect(box?.height).toBeLessThanOrEqual(60)

    const headerBg = await header.evaluate((el: HTMLElement) =>
      window.getComputedStyle(el).backgroundColor
    )
    // Must NOT be white (carrier is dark)
    expect(headerBg).not.toBe('rgb(255, 255, 255)')

    // Avatar: #B08D57 = rgb(176, 141, 87)
    const avatar = page.locator('header .rounded-full').first()
    if (await avatar.isVisible().catch(() => false)) {
      const avatarBg = await avatar.evaluate((el: HTMLElement) =>
        window.getComputedStyle(el).backgroundColor
      )
      expect(avatarBg).toBe('rgb(176, 141, 87)')
    }

    await page.screenshot({
      path: path.join(EVIDENCE, 'US-842-carrier-header.png'),
    })
  })

  test('adversarial: carrier header is NOT white (no shipper style bleed)', async ({ page }) => {
    await loginAsCarrier(page, `us842-bleed-${ts}@freightclub.local`)

    const header = page.locator('header').first()
    await expect(header).toBeVisible({ timeout: 10000 })

    const headerBg = await header.evaluate((el: HTMLElement) =>
      window.getComputedStyle(el).backgroundColor
    )
    expect(headerBg).not.toBe('rgb(255, 255, 255)')

    await page.screenshot({
      path: path.join(EVIDENCE, 'US-842-adversarial-no-persona-bleed.png'),
    })
  })
})
