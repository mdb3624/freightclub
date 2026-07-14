import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Feature: US-854 — Per-Load Diesel Fuel Cost Resolution (FREIG-116)
 * AC-1: Load-specific fuel region is used in the profitability calculation
 *       (not simply the trucker's saved home region)
 * AC-2: Transparency — the region used and its as-of date are shown on the load board
 * AC-3: Fallback to the trucker's saved home region when the load's origin state
 *       can't be resolved to an EIA region, with a distinct fallback indicator
 *
 * Strategy: seeds real data through the actual backend API (register shipper +
 * trucker, create a load, set the trucker's wizard cost profile) rather than
 * mocking routes. This story's entire value is the real per-load EIA resolution
 * end-to-end -- a mocked test would not catch the exact class of bug this story
 * already exposed once (missing EIA_API_KEY/EIA_ENABLED wiring in
 * docker-compose.test.yml + application.yml, silently returning available:false
 * in every environment despite 100% green mocked tests).
 */

const BACKEND = process.env.TEST_BACKEND_URL || 'http://localhost:9091'
const FRONTEND = process.env.TEST_FRONTEND_URL || 'http://localhost:9090'
const EVIDENCE = path.resolve('test-results/evidence')

test.beforeAll(() => fs.mkdirSync(EVIDENCE, { recursive: true }))
test.setTimeout(90000)

function uniqueSuffix() {
  return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`
}

async function registerAndGetToken(role: 'SHIPPER' | 'TRUCKER', emailPrefix: string) {
  const suffix = uniqueSuffix()
  const email = `${emailPrefix}-${suffix}@freightclub.local`
  const res = await fetch(`${BACKEND}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'E2ETestPassword123!',
      firstName: 'Test',
      lastName: role === 'SHIPPER' ? 'Shipper' : 'Trucker',
      role,
      companyName: `${role}Co-${suffix}`,
      ...(role === 'TRUCKER' ? { equipmentType: 'DRY_VAN' } : {}),
    }),
  })
  const body = await res.json()
  return { email, token: body.accessToken as string }
}

async function createLoad(shipperToken: string, originState: string, originCity: string, destinationCity: string) {
  const res = await fetch(`${BACKEND}/api/v1/loads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${shipperToken}` },
    body: JSON.stringify({
      originCity,
      originState,
      originZip: '10001',
      originAddress1: '350 5th Ave',
      destinationCity,
      destinationState: 'FL',
      destinationZip: '33602',
      destinationAddress1: '100 N Tampa St',
      distanceMiles: 1050,
      pickupFrom: '2026-08-20T08:00:00',
      pickupTo: '2026-08-20T18:00:00',
      deliveryFrom: '2026-08-22T08:00:00',
      deliveryTo: '2026-08-22T18:00:00',
      commodity: 'General freight',
      weightLbs: 20000,
      equipmentType: 'DRY_VAN',
      payRate: 2.5,
      payRateType: 'PER_MILE',
    }),
  })
  return res.json()
}

async function setCostProfile(truckerToken: string, dieselRegion: string) {
  await fetch(`${BACKEND}/api/v1/carrier/cost-profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${truckerToken}` },
    body: JSON.stringify({
      dieselRegion,
      milesPerGallon: 6.5,
      additionalCostPerMile: 0.1,
      truckPaymentMonthly: 1500,
      insuranceMonthly: 800,
      permitsMonthly: 100,
      annualMiles: 100000,
      weeklyIncomeGoal: 1500,
      weeksWorkedPerYear: 48,
    }),
  })
}

async function loginAsTrucker(page: any, email: string) {
  await page.goto(`${FRONTEND}/login`)
  await page.fill('[data-testid="email-input"]', email)
  await page.fill('[data-testid="password-input"]', 'E2ETestPassword123!')
  await page.click('[data-testid="login-submit-btn"]')
  await page.waitForURL(/\/dashboard/, { timeout: 30000 })
  await page.goto(`${FRONTEND}/dashboard/trucker`)
  await page.waitForLoadState('networkidle')
}

test.describe('US-854: Per-load diesel fuel cost resolution', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('AC-1/AC-2: load board shows the load-origin region + as-of date, overriding the carrier saved home region', async ({ page }) => {
    const shipper = await registerAndGetToken('SHIPPER', 'us854-shipper')
    const trucker = await registerAndGetToken('TRUCKER', 'us854-trucker')

    // Trucker's saved home region is WEST; the load originates in NY (EAST region).
    // AC-1 requires the board to show EAST for this load, proving per-load
    // resolution overrides the carrier's saved Cost Profile region.
    await setCostProfile(trucker.token, 'WEST')

    const suffix = uniqueSuffix()
    const originCity = `US854OriginNY-${suffix}`
    const destinationCity = `US854DestFL-${suffix}`
    const load = await createLoad(shipper.token, 'NY', originCity, destinationCity)
    expect(load.status).toBe('OPEN')

    await loginAsTrucker(page, trucker.email)

    const card = page.locator(`[aria-label="Load: ${originCity}, NY to ${destinationCity}, FL"]`).first()
    await expect(card).toBeVisible({ timeout: 15000 })

    const cardText = await card.textContent()
    expect(cardText).toContain('Diesel: East Coast')
    expect(cardText).not.toContain('West Coast')
    // AC-2: as-of date is shown alongside the region, e.g. "(as of Jul 13)"
    expect(cardText).toMatch(/Diesel: East Coast \(as of [A-Za-z]{3} \d{1,2}\)/)

    await page.screenshot({ path: path.join(EVIDENCE, 'US-854-diesel-region-caption.png'), fullPage: true })
  })

  test('AC-3: falls back to the carrier saved home region when the origin state is unresolvable', async ({ page }) => {
    const shipper = await registerAndGetToken('SHIPPER', 'us854-shipper-fallback')
    const trucker = await registerAndGetToken('TRUCKER', 'us854-trucker-fallback')

    await setCostProfile(trucker.token, 'SOUTH')

    const suffix = uniqueSuffix()
    const originCity = `US854OriginPR-${suffix}`
    const destinationCity = `US854DestFL2-${suffix}`
    // "PR" (Puerto Rico) is a real USPS state code but is not one of the 5 EIA
    // PADD regions StateToEiaRegionResolver maps -- deliberately unresolvable,
    // exercising AC-3's fallback path.
    const load = await createLoad(shipper.token, 'PR', originCity, destinationCity)
    expect(load.status).toBe('OPEN')

    await loginAsTrucker(page, trucker.email)

    const card = page.locator(`[aria-label="Load: ${originCity}, PR to ${destinationCity}, FL"]`).first()
    await expect(card).toBeVisible({ timeout: 15000 })

    const cardText = await card.textContent()
    expect(cardText).toContain('Est. (home region)')
    expect(cardText).not.toContain('Diesel:')

    await page.screenshot({ path: path.join(EVIDENCE, 'US-854-fallback-indicator.png'), fullPage: true })
  })
})
