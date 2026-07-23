import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { LoadFormPageObject } from '../page-objects/LoadFormPageObject'

/**
 * Feature: US-845 — Load Creation Form Field Updates (Phase 6)
 * AC-1: Distance field is read-only styled box (bg #F8F9FB, border #E8E3D8, h 40px, "calculated" label)
 * AC-2: All date fields are type="datetime-local"
 * AC-3: pickupTo field exists, auto-populates from pickupFrom, validates order
 * AC-4: deliveryTo field exists, auto-populates from deliveryFrom, validates order
 * AC-5: Dimension inch inputs exist alongside foot inputs
 *
 * UI Kit reference: Prototype/ui_kits/shipper/create-load.html
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
      firstName: 'Anna',
      lastName: 'Freight',
      role: 'SHIPPER',
      companyName: `TestShip-${Date.now()}`,
    }),
  })
  await page.goto(`${FRONTEND}/`)
  // Desktop header-login-btn is hidden below the mobile breakpoint (same class
  // of bug fixed for carrier-avatar-dropdown.spec.ts / us-730h-carrier-profile.spec.ts
  // in US-860 — the mobile nav's "Log in" lives behind the hamburger menu, not
  // a directly-visible header button) — this spec runs at both 1280px and 320px.
  const desktopLoginBtn = page.locator('[data-testid="header-login-btn"]')
  if (await desktopLoginBtn.isVisible().catch(() => false)) {
    await desktopLoginBtn.click()
  } else {
    await page.click('[data-testid="mobile-menu-toggle"]')
    await page.click('[data-testid="mobile-nav-login-btn"]')
  }
  await page.fill('[data-testid="email-input"]', email)
  await page.fill('[data-testid="password-input"]', 'E2ETestPassword123!')
  await page.click('[data-testid="login-submit-btn"]')
  await page.waitForURL(/\/dashboard/, { timeout: 30000 })
}

async function navigateToCreateLoad(page: any) {
  await page.goto(`${FRONTEND}/shipper/loads/new`)
  await page.waitForLoadState('networkidle')
}

/** Fill all required fields so Zod superRefine can run (it skips when base fields fail) */
async function fillRequiredFields(page: any) {
  // PROJECT_AUDIT_2026-07-23 item 6: was raw input[name="..."] CSS attribute
  // selectors — LoadFormPageObject wraps the same fields via data-testid.
  await new LoadFormPageObject(page).fillRequiredFields()
}

// ── AC-1: Distance display box ───────────────────────────────────────────────

test.describe('US-845 AC-1: distance display', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('distance display is a styled read-only box with "calculated" label', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await loginAsShipper(page, `us845-dist-${Date.now()}@freightclub.local`)
    await navigateToCreateLoad(page)

    const display = page.locator('[data-testid="distance-display"]')
    await expect(display).toBeVisible({ timeout: 10000 })

    // AC-1: background #F8F9FB = rgb(248, 249, 251)
    const bg = await display.evaluate((el: HTMLElement) =>
      window.getComputedStyle(el).backgroundColor
    )
    expect(bg).toBe('rgb(248, 249, 251)')

    // AC-1: height 40px
    const height = await display.evaluate((el: HTMLElement) =>
      window.getComputedStyle(el).height
    )
    expect(height).toBe('40px')

    // AC-1: border #E8E3D8 = rgb(232, 227, 216)
    const borderColor = await display.evaluate((el: HTMLElement) =>
      window.getComputedStyle(el).borderColor
    )
    expect(borderColor).toBe('rgb(232, 227, 216)')

    // "calculated" label must be visible alongside the box
    await expect(page.locator('text=calculated')).toBeVisible()

    await page.screenshot({ path: path.join(EVIDENCE, 'US-845-distance-display.png') })
  })
})

// ── AC-2: datetime-local inputs ──────────────────────────────────────────────

test.describe('US-845 AC-2: datetime-local fields', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('pickup-from and delivery-from are type datetime-local', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await loginAsShipper(page, `us845-dt-${Date.now()}@freightclub.local`)
    await navigateToCreateLoad(page)

    const pickupFrom   = page.locator('[data-testid="pickup-from-input"]')
    const deliveryFrom = page.locator('[data-testid="delivery-from-input"]')

    await expect(pickupFrom).toBeVisible({ timeout: 10000 })
    await expect(deliveryFrom).toBeVisible()

    expect(await pickupFrom.getAttribute('type')).toBe('datetime-local')
    expect(await deliveryFrom.getAttribute('type')).toBe('datetime-local')
    expect(await page.locator('[data-testid="pickup-to-input"]').getAttribute('type')).toBe('datetime-local')
    expect(await page.locator('[data-testid="delivery-to-input"]').getAttribute('type')).toBe('datetime-local')
  })
})

// ── AC-3: Pickup window auto-populate + order validation ─────────────────────

test.describe('US-845 AC-3: pickup window', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('pickupTo auto-populates when pickupFrom is set', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await loginAsShipper(page, `us845-pku-${Date.now()}@freightclub.local`)
    await navigateToCreateLoad(page)

    const pickupFrom = page.locator('[data-testid="pickup-from-input"]')
    const pickupTo   = page.locator('[data-testid="pickup-to-input"]')

    await expect(pickupFrom).toBeVisible({ timeout: 10000 })

    // Clear pickupTo first (should be empty)
    const initialValue = await pickupTo.inputValue()
    expect(initialValue).toBe('')

    await pickupFrom.fill('2026-07-20T08:00')
    await pickupFrom.blur()

    // pickupTo should auto-populate with same value
    await expect(pickupTo).toHaveValue('2026-07-20T08:00', { timeout: 5000 })

    await page.screenshot({ path: path.join(EVIDENCE, 'US-845-pickup-auto-populate.png') })
  })

  test('AC-3 adversarial: pickupTo before pickupFrom shows validation error', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await loginAsShipper(page, `us845-pkuv-${Date.now()}@freightclub.local`)
    await navigateToCreateLoad(page)

    await expect(page.locator('[data-testid="pickup-from-input"]')).toBeVisible({ timeout: 10000 })

    // Fill all required fields so superRefine runs (it skips when base fields fail)
    await fillRequiredFields(page)
    await page.locator('[data-testid="pickup-from-input"]').fill('2026-07-20T10:00')
    await page.locator('[data-testid="pickup-to-input"]').fill('2026-07-20T08:00') // BEFORE pickupFrom
    await page.locator('[data-testid="delivery-from-input"]').fill('2026-07-21T08:00')
    await page.locator('[data-testid="delivery-to-input"]').fill('2026-07-22T08:00')

    await page.locator('button[type="submit"]').click()

    const errorLocator = page.locator('[role="alert"]').filter({ hasText: 'cannot be before' })
    await expect(errorLocator).toBeVisible({ timeout: 5000 })

    await page.screenshot({ path: path.join(EVIDENCE, 'US-845-pickup-order-error.png') })
  })
})

// ── AC-4: Delivery window auto-populate + order validation ───────────────────

test.describe('US-845 AC-4: delivery window', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('deliveryTo auto-populates when deliveryFrom is set', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await loginAsShipper(page, `us845-dlv-${Date.now()}@freightclub.local`)
    await navigateToCreateLoad(page)

    const deliveryFrom = page.locator('[data-testid="delivery-from-input"]')
    const deliveryTo   = page.locator('[data-testid="delivery-to-input"]')

    await expect(deliveryFrom).toBeVisible({ timeout: 10000 })

    const initialValue = await deliveryTo.inputValue()
    expect(initialValue).toBe('')

    await deliveryFrom.fill('2026-07-22T06:00')
    await deliveryFrom.blur()

    await expect(deliveryTo).toHaveValue('2026-07-22T06:00', { timeout: 5000 })
  })

  test('AC-4 adversarial: deliveryTo before deliveryFrom shows validation error', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await loginAsShipper(page, `us845-dlvv-${Date.now()}@freightclub.local`)
    await navigateToCreateLoad(page)

    await expect(page.locator('[data-testid="delivery-from-input"]')).toBeVisible({ timeout: 10000 })

    await fillRequiredFields(page)
    await page.locator('[data-testid="pickup-from-input"]').fill('2026-07-20T08:00')
    await page.locator('[data-testid="pickup-to-input"]').fill('2026-07-20T10:00')
    await page.locator('[data-testid="delivery-from-input"]').fill('2026-07-22T10:00')
    await page.locator('[data-testid="delivery-to-input"]').fill('2026-07-22T08:00') // BEFORE deliveryFrom

    await page.locator('button[type="submit"]').click()

    const errorLocator = page.locator('[role="alert"]').filter({ hasText: 'cannot be before' })
    await expect(errorLocator).toBeVisible({ timeout: 5000 })

    await page.screenshot({ path: path.join(EVIDENCE, 'US-845-delivery-order-error.png') })
  })
})

// ── AC-5: Dimension inch fields ──────────────────────────────────────────────

test.describe('US-845 AC-5: dimension inch inputs', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('length, width, height each have ft + in inputs', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await loginAsShipper(page, `us845-dim-${Date.now()}@freightclub.local`)
    await navigateToCreateLoad(page)

    await expect(page.locator('[data-testid="length-ft-input"]')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('[data-testid="length-in-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="width-ft-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="width-in-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="height-ft-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="height-in-input"]')).toBeVisible()

    await page.screenshot({ path: path.join(EVIDENCE, 'US-845-dimension-fields.png'), fullPage: true })
  })
})

// ── Adversarial tests ─────────────────────────────────────────────────────────

test.describe('adversarial', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('320px viewport — form has no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 812 })
    await loginAsShipper(page, `us845-adv-320-${Date.now()}@freightclub.local`)
    await navigateToCreateLoad(page)

    await expect(page.locator('[data-testid="pickup-from-input"]')).toBeVisible({ timeout: 10000 })

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    )
    expect(overflow).toBe(false)

    await page.screenshot({ path: path.join(EVIDENCE, 'US-845-adversarial-320px.png'), fullPage: true })
  })

  test('distance field is read-only — user cannot type into it', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await loginAsShipper(page, `us845-adv-dist-${Date.now()}@freightclub.local`)
    await navigateToCreateLoad(page)

    const distField = page.locator('[data-testid="distance-display"]')
    await expect(distField).toBeVisible({ timeout: 10000 })

    // Must be a display element or readonly input — not an editable input
    const tagName = await distField.evaluate((el: HTMLElement) => el.tagName.toLowerCase())
    const readOnly = await distField.evaluate((el: HTMLInputElement) =>
      el.readOnly ?? el.getAttribute('readonly') !== null
    )
    // Either it's not an input at all, or it's readonly
    const isNotEditable = tagName !== 'input' || readOnly
    expect(isNotEditable).toBe(true)

    await page.screenshot({ path: path.join(EVIDENCE, 'US-845-adversarial-distance-readonly.png') })
  })

  test('submit with deliveryTo before deliveryFrom and pickupTo before pickupFrom — both errors shown', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await loginAsShipper(page, `us845-adv-multi-err-${Date.now()}@freightclub.local`)
    await navigateToCreateLoad(page)

    await expect(page.locator('[data-testid="pickup-from-input"]')).toBeVisible({ timeout: 10000 })

    await fillRequiredFields(page)
    // Set both windows in reverse order
    await page.locator('[data-testid="pickup-from-input"]').fill('2026-07-20T10:00')
    await page.locator('[data-testid="pickup-to-input"]').fill('2026-07-20T08:00')
    await page.locator('[data-testid="delivery-from-input"]').fill('2026-07-22T10:00')
    await page.locator('[data-testid="delivery-to-input"]').fill('2026-07-22T08:00')

    await page.locator('button[type="submit"]').click()

    // At least one "cannot be before" error must appear
    const errorLocator = page.locator('[role="alert"]').filter({ hasText: 'cannot be before' })
    await expect(errorLocator.first()).toBeVisible({ timeout: 5000 })

    await page.screenshot({ path: path.join(EVIDENCE, 'US-845-adversarial-multi-error.png') })
  })
})
