/**
 * Feature: US-506 — SETTLED Load Status & Workflow
 * AC-5: LoadDetailPage shows confirm/dispute block when load is DELIVERED
 * AC-1: Shipper can confirm delivery → load transitions to SETTLED
 * AC-2: Shipper can file dispute with reason → load transitions to DISPUTED
 * AC-6: Dispute form requires non-empty reason before submission
 */

import { test, expect, type Page } from '@playwright/test'
import { TestDataSeeder } from './fixtures/test-data-seeder'

const LOAD_ID = 'test-settle-load-001'

function makeLoad(shipperId: string, tenantId: string, overrides: object = {}) {
  return {
    id: LOAD_ID,
    tenantId,
    shipperId,
    truckerId: 'trucker-1',
    status: 'DELIVERED',
    originCity: 'Dallas', originState: 'TX', originZip: '75201',
    originAddress1: '100 Main St', originAddress2: null,
    destinationCity: 'Houston', destinationState: 'TX', destinationZip: '77001',
    destinationAddress1: '200 Commerce St', destinationAddress2: null,
    distanceMiles: 240,
    pickupFrom: '2026-06-01T09:00:00', pickupTo: '2026-06-01T12:00:00',
    deliveryFrom: '2026-06-02T09:00:00', deliveryTo: '2026-06-02T12:00:00',
    commodity: 'General Freight', weightLbs: 20000,
    lengthFt: null, widthFt: null, heightFt: null,
    equipmentType: 'DRY_VAN', payRate: 2.5, payRateType: 'PER_MILE',
    paymentTerms: 'QUICK_PAY', specialRequirements: null, cancelReason: null,
    settledAt: null, disputedAt: null, disputeReason: null,
    shipperContact: null,
    truckerContact: { name: 'Test Trucker', email: 'trucker@test.com', phone: '5551234567', businessName: 'Test Carrier LLC' },
    createdAt: '2026-06-01T08:00:00Z', updatedAt: '2026-06-02T12:00:00Z',
    ...overrides,
  }
}

async function setupRoutes(page: Page, load: object) {
  // Catch-all first — specific routes registered after take priority (Playwright LIFO)
  await page.route('**/api/v1/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  )
  await page.route('**/api/v1/notifications**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  )
  await page.route('**/api/v1/ratings**', (route) =>
    route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
  )
  await page.route('**/api/v1/documents/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  )
  await page.route(`**/api/v1/loads/${LOAD_ID}/events`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  )
  await page.route(`**/api/v1/loads/${LOAD_ID}/settle`, (route) =>
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ ...load, status: 'SETTLED', settledAt: new Date().toISOString() }),
    })
  )
  await page.route(`**/api/v1/loads/${LOAD_ID}/dispute`, (route) =>
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ ...load, status: 'DISPUTED', disputedAt: new Date().toISOString(), disputeReason: 'Cargo was damaged' }),
    })
  )
  // Load detail — registered LAST so it beats catch-all
  await page.route(`**/api/v1/loads/${LOAD_ID}`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(load) })
  )
}

async function setAuth(page: Page, user: any) {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.evaluate((u) => {
    try {
      localStorage.setItem('freightclub_access_token', u.accessToken)
      localStorage.setItem('freightclub_user', JSON.stringify({
        id: u.id, email: u.email, firstName: u.firstName,
        lastName: u.lastName, role: u.role, tenantId: u.tenantId,
      }))
    } catch (_) { /* ignore */ }
  }, user)
}

test.describe('US-506 — Shipper Settle/Dispute Delivery', () => {

  // US-506 AC-5: confirm/dispute block appears when DELIVERED
  test('shows Confirm Delivery block when load status is DELIVERED', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({ email: `settle-ac5-${Date.now()}@test.com`, role: 'SHIPPER' })
    try {
      await setupRoutes(page, makeLoad(user.id, user.tenantId))
      await setAuth(page, user)
      await page.goto(`/shipper/loads/${LOAD_ID}`)

      await expect(page.getByRole('heading', { name: 'Confirm Delivery' })).toBeVisible({ timeout: 10000 })
      await expect(page.locator('[data-testid="settle-load-btn"]')).toBeVisible()
      await expect(page.locator('[data-testid="dispute-load-btn"]')).toBeVisible()
    } finally { await seeder.cleanup() }
  })

  // US-506 AC-1: clicking Confirm Delivery calls settle endpoint
  test('clicking Confirm Delivery calls settle endpoint', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({ email: `settle-ac1-${Date.now()}@test.com`, role: 'SHIPPER' })
    try {
      const load = makeLoad(user.id, user.tenantId)
      await setupRoutes(page, load)
      await setAuth(page, user)
      await page.goto(`/shipper/loads/${LOAD_ID}`)

      let settleCallCount = 0
      page.on('request', (req) => {
        if (req.url().includes(`/loads/${LOAD_ID}/settle`) && req.method() === 'PATCH') settleCallCount++
      })

      await expect(page.locator('[data-testid="settle-load-btn"]')).toBeVisible({ timeout: 10000 })
      await page.click('[data-testid="settle-load-btn"]')
      await expect(async () => { expect(settleCallCount).toBe(1) }).toPass({ timeout: 5000 })
    } finally { await seeder.cleanup() }
  })

  // US-506 AC-2: File Dispute shows textarea and submits with reason
  test('filing a dispute shows textarea and calls dispute endpoint', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({ email: `settle-ac2-${Date.now()}@test.com`, role: 'SHIPPER' })
    try {
      const load = makeLoad(user.id, user.tenantId)
      await setupRoutes(page, load)
      await setAuth(page, user)
      await page.goto(`/shipper/loads/${LOAD_ID}`)

      let disputeBody = ''
      page.on('request', async (req) => {
        if (req.url().includes(`/loads/${LOAD_ID}/dispute`) && req.method() === 'PATCH') {
          disputeBody = req.postData() ?? ''
        }
      })

      await expect(page.locator('[data-testid="dispute-load-btn"]')).toBeVisible({ timeout: 10000 })
      await page.click('[data-testid="dispute-load-btn"]')
      await expect(page.locator('[data-testid="dispute-reason-input"]')).toBeVisible()
      await page.fill('[data-testid="dispute-reason-input"]', 'Cargo was damaged in transit')
      await page.click('[data-testid="dispute-submit-btn"]')
      await expect(async () => { expect(disputeBody).toContain('Cargo was damaged in transit') }).toPass({ timeout: 5000 })
    } finally { await seeder.cleanup() }
  })

  // US-506 AC-6: Submit button disabled when reason is blank
  test('dispute submit button is disabled when reason is empty', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({ email: `settle-ac6-${Date.now()}@test.com`, role: 'SHIPPER' })
    try {
      await setupRoutes(page, makeLoad(user.id, user.tenantId))
      await setAuth(page, user)
      await page.goto(`/shipper/loads/${LOAD_ID}`)

      await expect(page.locator('[data-testid="dispute-load-btn"]')).toBeVisible({ timeout: 10000 })
      await page.click('[data-testid="dispute-load-btn"]')
      await expect(page.locator('[data-testid="dispute-reason-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="dispute-submit-btn"]')).toBeDisabled()
    } finally { await seeder.cleanup() }
  })

  // Confirm/dispute block absent for non-DELIVERED statuses
  test('confirm/dispute block is absent when load is SETTLED', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({ email: `settle-absent-${Date.now()}@test.com`, role: 'SHIPPER' })
    try {
      const load = makeLoad(user.id, user.tenantId, { status: 'SETTLED', settledAt: new Date().toISOString() })
      await setupRoutes(page, load)
      await setAuth(page, user)
      await page.goto(`/shipper/loads/${LOAD_ID}`)

      await expect(page.getByText('Load Detail')).toBeVisible({ timeout: 10000 })
      await expect(page.locator('[data-testid="settle-load-btn"]')).not.toBeVisible()
    } finally { await seeder.cleanup() }
  })
})
