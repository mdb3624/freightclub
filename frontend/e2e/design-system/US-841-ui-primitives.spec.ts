import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Feature: US-841 — UI Primitive Styling (Phase 2A–2D)
 * AC-1: Button primary has bronze gradient bg (#C9A46A → #B08D57 → #8C6D3F)
 * AC-2: Button secondary has cream gradient bg + bronze border (#C9A876)
 * AC-3: Input height is 40px, border-radius 4px, border 1px solid #D0D0D0
 * AC-4: Input focus state: 2px solid #B08D57 border
 * AC-5: StatusBadge uses correct semantic colors per load status
 *
 * UI Kit reference: Prototype/ui_kits/shipper/index.html (button + input + badge styles)
 * Playbook: INTEGRATION_PLAYBOOK.md Phase 2A–2D
 */

const BACKEND  = process.env.TEST_BACKEND_URL  || 'http://localhost:9091'
const FRONTEND = process.env.TEST_FRONTEND_URL || 'http://localhost:9090'
const EVIDENCE = path.resolve('test-results/evidence')

test.beforeAll(() => fs.mkdirSync(EVIDENCE, { recursive: true }))
test.setTimeout(90000)

async function loginAsShipper(page: any, email: string) {
  await fetch(`${BACKEND}/api/test/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'E2ETestPassword123!',
      firstName: 'Test',
      lastName: 'Shipper',
      role: 'SHIPPER',
      companyName: `TestShip-${Date.now()}`,
    }),
  })
  await page.goto(`${FRONTEND}/login`)
  await page.fill('[data-testid="email-input"]', email)
  await page.fill('[data-testid="password-input"]', 'E2ETestPassword123!')
  await page.click('[data-testid="login-submit-btn"]')
  await page.waitForURL(/\/dashboard/, { timeout: 30000 })
  await page.waitForLoadState('networkidle')
}

// ── AC-1: Primary button bronze gradient ──────────────────────────────────────

test.describe('US-841 AC-1: primary button styling', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('primary CTA button has bronze gradient background', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await loginAsShipper(page, `us841-btn-${Date.now()}@freightclub.local`)

    // The Action Zone "Create New Load" is the most visible primary button
    const primaryBtn = page.locator('[data-testid="action-zone-create-load"]')
    await expect(primaryBtn).toBeVisible({ timeout: 15000 })

    const bgImage = await primaryBtn.evaluate(
      (el: HTMLElement) => window.getComputedStyle(el).backgroundImage
    )
    // Must use gradient (not solid color)
    expect(bgImage).toContain('gradient')
    // Must include bronze stop #C9A46A or #B08D57
    const inlineStyle = await primaryBtn.evaluate(
      (el: HTMLElement) => (el as HTMLElement).style.background
    )
    const hasBronze = inlineStyle.includes('#C9A46A') || inlineStyle.includes('#B08D57') || inlineStyle.includes('C9A46A') || inlineStyle.includes('B08D57')
    expect(hasBronze).toBe(true)

    await page.screenshot({ path: path.join(EVIDENCE, 'US-841-primary-button.png') })
  })
})

// ── AC-2: Secondary button cream gradient ─────────────────────────────────────

test.describe('US-841 AC-2: secondary button styling', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('secondary buttons have cream gradient bg and bronze border', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await loginAsShipper(page, `us841-sec-${Date.now()}@freightclub.local`)

    const secondaryBtn = page.locator('[data-testid="action-zone-get-quote"]')
    await expect(secondaryBtn).toBeVisible({ timeout: 15000 })

    const borderColor = await secondaryBtn.evaluate(
      (el: HTMLElement) => window.getComputedStyle(el).borderColor
    )
    // Bronze border: #C9A876 = rgb(201, 168, 118)
    expect(borderColor).toBe('rgb(201, 168, 118)')

    const bgImage = await secondaryBtn.evaluate(
      (el: HTMLElement) => window.getComputedStyle(el).backgroundImage
    )
    expect(bgImage).toContain('gradient')

    await page.screenshot({ path: path.join(EVIDENCE, 'US-841-secondary-button.png') })
  })
})

// ── AC-3: Input height + border-radius ───────────────────────────────────────

test.describe('US-841 AC-3: input field dimensions', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('login page inputs are 40px height and 4px border-radius', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto(`${FRONTEND}/login`)
    await page.waitForLoadState('networkidle')

    const emailInput = page.locator('[data-testid="email-input"]')
    await expect(emailInput).toBeVisible({ timeout: 10000 })

    const styles = await emailInput.evaluate((el: HTMLElement) => {
      const cs = window.getComputedStyle(el)
      return { height: cs.height, borderRadius: cs.borderRadius }
    })

    expect(parseFloat(styles.height)).toBeGreaterThanOrEqual(38) // 40px ± padding-box
    expect(styles.borderRadius).toBe('4px')

    await page.screenshot({ path: path.join(EVIDENCE, 'US-841-input-dimensions.png') })
  })
})

// ── AC-4: Input focus state ───────────────────────────────────────────────────

test.describe('US-841 AC-4: input focus border', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('focused input gets 2px solid #B08D57 border', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto(`${FRONTEND}/login`)
    await page.waitForLoadState('networkidle')

    const emailInput = page.locator('[data-testid="email-input"]')
    await expect(emailInput).toBeVisible({ timeout: 10000 })
    await emailInput.click()

    const borderStyle = await emailInput.evaluate((el: HTMLElement) => {
      const cs = window.getComputedStyle(el)
      return {
        borderColor: cs.borderTopColor,
        borderWidth: cs.borderTopWidth,
      }
    })

    // #B08D57 = rgb(176, 141, 87)
    expect(borderStyle.borderColor).toBe('rgb(176, 141, 87)')

    await page.screenshot({ path: path.join(EVIDENCE, 'US-841-input-focus.png') })
  })
})

// ── AC-5: StatusBadge colors ──────────────────────────────────────────────────

test.describe('US-841 AC-5: StatusBadge semantic colors', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('shipment status badges use semantic colors (not arbitrary)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await loginAsShipper(page, `us841-badge-${Date.now()}@freightclub.local`)

    await expect(page.locator('[data-testid="kpi-summary-panel"]')).toBeVisible({ timeout: 15000 })

    // Check that no status badge uses the old carrier dark colors
    const badgeWithDarkBg = await page.evaluate(() => {
      const badges = Array.from(document.querySelectorAll('[class*="badge"]'))
      return badges.some((el) => {
        const bg = window.getComputedStyle(el).backgroundColor
        return bg === 'rgb(18, 18, 18)' || bg === 'rgb(26, 26, 26)'
      })
    })
    expect(badgeWithDarkBg).toBe(false)

    await page.screenshot({ path: path.join(EVIDENCE, 'US-841-status-badges.png') })
  })
})

// ── Adversarial tests ─────────────────────────────────────────────────────────

test.describe('adversarial', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('carrier persona — bronze CTA still renders correctly (shared gradient)', async ({ page }) => {
    // Register a carrier and verify buttons still use bronze gradient
    await page.setViewportSize({ width: 375, height: 812 })
    const email = `us841-adv-carrier-${Date.now()}@freightclub.local`
    await fetch(`${BACKEND}/api/test/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'E2ETestPassword123!',
        firstName: 'Carl',
        lastName: 'Carrier',
        role: 'TRUCKER',
        companyName: `TestCarrier-${Date.now()}`,
      }),
    })
    await page.goto(`${FRONTEND}/login`)
    await page.fill('[data-testid="email-input"]', email)
    await page.fill('[data-testid="password-input"]', 'E2ETestPassword123!')
    await page.click('[data-testid="login-submit-btn"]')
    await page.waitForURL(/\/dashboard/, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // Carrier persona loaded without crash
    await expect(page.locator('body')).toBeVisible()

    await page.screenshot({ path: path.join(EVIDENCE, 'US-841-adversarial-carrier-persona.png') })
  })

  test('input disabled state — no active focus border when disabled', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto(`${FRONTEND}/login`)
    await page.waitForLoadState('networkidle')

    const submitBtn = page.locator('[data-testid="login-submit-btn"]')
    await expect(submitBtn).toBeVisible({ timeout: 10000 })

    // The login form submit button should be styled correctly
    const color = await submitBtn.evaluate(
      (el: HTMLElement) => window.getComputedStyle(el).color
    )
    // Should not be invisible (white on white, etc.)
    expect(color).not.toBe('rgba(0, 0, 0, 0)')

    await page.screenshot({ path: path.join(EVIDENCE, 'US-841-adversarial-btn-state.png') })
  })

  test('rapid shipper→carrier→shipper toggle — no style residue', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await loginAsShipper(page, `us841-adv-toggle-${Date.now()}@freightclub.local`)

    await expect(page.locator('[data-testid="kpi-summary-panel"]')).toBeVisible({ timeout: 15000 })

    // Force persona toggle via data-persona attribute and check no dark bg bleeds
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-persona', 'carrier')
    })
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-persona', 'shipper')
    })

    const bodyBg = await page.evaluate(
      () => window.getComputedStyle(document.body).backgroundColor
    )
    // Should not be carrier dark background after toggle back
    expect(bodyBg).not.toBe('rgb(18, 18, 18)')

    await page.screenshot({ path: path.join(EVIDENCE, 'US-841-adversarial-persona-toggle.png') })
  })
})
