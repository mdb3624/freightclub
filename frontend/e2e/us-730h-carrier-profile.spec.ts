/**
 * Feature: US-730h (Carrier Identity & Credentials Profile)
 * AC: Carrier can fill Identity/Equipment/Credentials/Lanes tabs and save
 * AC: All interactive elements meet the 48px+ touch target minimum, at every tab
 */
import { test, expect } from '@playwright/test'
import { CarrierProfilePageObject } from './page-objects/CarrierProfilePageObject'

const BACKEND = process.env.TEST_BACKEND_URL || 'http://localhost:9091'
const FRONTEND = process.env.TEST_FRONTEND_URL || 'http://localhost:9090'

async function assertAllButtonsAreGloveFriendly(page: import('@playwright/test').Page) {
  const buttons = await page.locator('button').all()
  for (const button of buttons) {
    if (!(await button.isVisible())) continue
    const box = await button.boundingBox()
    expect(box, 'every visible button must report a bounding box').not.toBeNull()
    expect(box!.height, `button "${await button.textContent()}" must be >= 48px tall`).toBeGreaterThanOrEqual(48)
    expect(box!.width, `button "${await button.textContent()}" must be >= 48px wide`).toBeGreaterThanOrEqual(48)
  }
}

test.describe('US-730h Carrier Identity & Credentials Profile', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('golden path: fill all 4 tabs, save, reload, data persists', async ({ page }) => {
    const email = `us-730h-${Date.now()}@freightclub.local`
    await fetch(`${BACKEND}/api/test/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'E2ETestPassword123!', firstName: 'Test', lastName: 'Trucker', role: 'TRUCKER', companyName: `TestTruck-${Date.now()}` }),
    })
    await page.goto(`${FRONTEND}/`)
    await page.click('[data-testid="header-login-btn"]:visible, [data-testid="header-get-started-btn-mobile"]:visible')
    await page.fill('[data-testid="email-input"]', email)
    await page.fill('[data-testid="password-input"]', 'E2ETestPassword123!')
    await page.click('[data-testid="login-submit-btn"]')
    await page.waitForURL(/\/dashboard/, { timeout: 30000 })

    const profile = new CarrierProfilePageObject(page)
    await profile.goto()

    await profile.fillIdentity('Jake', 'Morrison', '(512) 555-0182')
    await assertAllButtonsAreGloveFriendly(page)

    await profile.clickTab('equipment')
    await profile.fillEquipment('2019', 'Freightliner', 'Cascadia', 'TX-4821')
    await assertAllButtonsAreGloveFriendly(page)

    await profile.clickTab('credentials')
    await profile.fillCredentials('TX-4821', 'MC-772341', 'CLASS_A', '2027-08-15')
    await assertAllButtonsAreGloveFriendly(page)

    await profile.clickTab('lanes')
    await assertAllButtonsAreGloveFriendly(page)

    await profile.save()
    await page.waitForTimeout(1000)
    await expect(page.locator('[data-testid="header-save-btn"]')).toContainText('Saved')

    await page.reload({ waitUntil: 'networkidle' })
    await expect(page.locator('[data-testid="identity-first-name-input"]')).toHaveValue('Jake')

    await profile.clickTab('equipment')
    await expect(page.locator('[data-testid="equipment-make-input"]')).toHaveValue('Freightliner')

    await page.screenshot({ path: 'test-results/evidence/US-730h-carrier-profile-identity.png', fullPage: true })
  })

  test('equipment-change confirmation sheet buttons are glove-friendly', async ({ page }) => {
    const email = `us-730h-equip-${Date.now()}@freightclub.local`
    await fetch(`${BACKEND}/api/test/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'E2ETestPassword123!', firstName: 'Test', lastName: 'Trucker', role: 'TRUCKER', companyName: `TestTruck-${Date.now()}` }),
    })
    await page.goto(`${FRONTEND}/`)
    await page.click('[data-testid="header-login-btn"]:visible, [data-testid="header-get-started-btn-mobile"]:visible')
    await page.fill('[data-testid="email-input"]', email)
    await page.fill('[data-testid="password-input"]', 'E2ETestPassword123!')
    await page.click('[data-testid="login-submit-btn"]')
    await page.waitForURL(/\/dashboard/, { timeout: 30000 })

    const profile = new CarrierProfilePageObject(page)
    await profile.goto()
    await profile.clickTab('equipment')
    await page.locator('[data-testid="equipment-type-select"]').selectOption('FLATBED')
    await expect(page.locator('[data-testid="equip-confirm-yes-btn"]')).toBeVisible()
    await assertAllButtonsAreGloveFriendly(page)
    await page.locator('[data-testid="equip-confirm-yes-btn"]').click()
    await expect(page.locator('[data-testid="equipment-type-select"]')).toHaveValue('FLATBED')
  })

  test('credential warning banner is glove-friendly when an expiry is near-term', async ({ page }) => {
    const email = `us-730h-warn-${Date.now()}@freightclub.local`
    await fetch(`${BACKEND}/api/test/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'E2ETestPassword123!', firstName: 'Test', lastName: 'Trucker', role: 'TRUCKER', companyName: `TestTruck-${Date.now()}` }),
    })
    await page.goto(`${FRONTEND}/`)
    await page.click('[data-testid="header-login-btn"]:visible, [data-testid="header-get-started-btn-mobile"]:visible')
    await page.fill('[data-testid="email-input"]', email)
    await page.fill('[data-testid="password-input"]', 'E2ETestPassword123!')
    await page.click('[data-testid="login-submit-btn"]')
    await page.waitForURL(/\/dashboard/, { timeout: 30000 })

    const profile = new CarrierProfilePageObject(page)
    await profile.goto()

    // Seed a CDL expiry within the next 30 days so credWarnings is non-empty
    // and the credential warning banner (incl. cred-warning-review-btn) renders.
    const nearTermExpiry = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    await profile.clickTab('credentials')
    await profile.fillCredentials('TX-4821', 'MC-772341', 'CLASS_A', nearTermExpiry)

    await expect(page.locator('[data-testid="cred-warning-review-btn"]')).toBeVisible()
    await assertAllButtonsAreGloveFriendly(page)

    await page.locator('[data-testid="cred-warning-review-btn"]').click()
    await expect(page.locator('[data-testid="tab-credentials"]')).toBeVisible()
  })
})
