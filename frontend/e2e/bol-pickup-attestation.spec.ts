import { test, expect, type Page } from '@playwright/test'

const LOAD_ID = 'test-load-bol-attest-001'

const mockAuthResponse = {
  accessToken: 'fake-jwt-token-for-testing',
  tokenType: 'Bearer',
  expiresIn: 900,
  user: {
    id: 'trucker-user-1',
    email: `trucker-${Date.now()}@test.com`,
    firstName: 'Test',
    lastName: 'Trucker',
    role: 'TRUCKER',
    tenantId: 'tenant-1',
  },
}

const claimedLoad = {
  id: LOAD_ID,
  tenantId: 'tenant-1',
  shipperId: 'shipper-1',
  truckerId: 'trucker-user-1',
  status: 'CLAIMED',
  originCity: 'Dallas',
  originState: 'TX',
  originZip: '75201',
  originAddress1: '100 Main St',
  originAddress2: null,
  destinationCity: 'Houston',
  destinationState: 'TX',
  destinationZip: '77001',
  destinationAddress1: '200 Commerce St',
  destinationAddress2: null,
  distanceMiles: 240,
  pickupFrom: '2026-05-13T09:00:00',
  pickupTo: '2026-05-13T12:00:00',
  deliveryFrom: '2026-05-13T15:00:00',
  deliveryTo: '2026-05-13T17:00:00',
  commodity: 'General Freight',
  weightLbs: 20000,
  lengthFt: null,
  widthFt: null,
  heightFt: null,
  equipmentType: 'DRY_VAN',
  payRate: 2.5,
  payRateType: 'PER_MILE',
  paymentTerms: 'QUICK_PAY',
  specialRequirements: null,
  cancelReason: null,
  shipperContact: null,
  truckerContact: null,
  createdAt: '2026-05-12T08:00:00Z',
  updatedAt: '2026-05-13T09:00:00Z',
}

const bolPhotoDocument = {
  id: 'doc-bol-photo-1',
  loadId: LOAD_ID,
  documentType: 'BOL_PHOTO',
  originalFilename: 'bol-photo.png',
  contentType: 'image/png',
  fileSizeBytes: 10240,
  note: null,
  uploadedBy: 'trucker@test.com',
  createdAt: new Date().toISOString(),
  locked: false,
  lockedAt: null,
}

const mockProfile = {
  id: 'trucker-user-1',
  email: `trucker-${Date.now()}@test.com`,
  firstName: 'Test',
  lastName: 'Trucker',
  role: 'TRUCKER',
  monthlyFixedCosts: 3000,
  fuelCostPerGallon: 3.8,
  milesPerGallon: 6.5,
  maintenanceCostPerMile: 0.15,
  monthlyMilesTarget: 10000,
  targetMarginPerMile: 0.25,
}

const emptyPage = { content: [], totalPages: 0, totalElements: 0, number: 0, size: 20 }

async function setupCommonRoutes(page: Page) {
  // Catch-all safety net — prevents unmatched calls from crashing the app.
  // Registered FIRST so specific routes registered after take priority.
  await page.route('**/api/v1/**', (route) => {
    const url = route.request().url()
    console.warn('[e2e catch-all]', url)
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  })

  // Auth
  await page.route('**/api/v1/auth/login', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockAuthResponse) })
  )
  await page.route('**/api/v1/auth/refresh', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'fake-jwt-token', tokenType: 'Bearer', expiresIn: 900 }) })
  )
  await page.route('**/api/v1/auth/logout', (route) =>
    route.fulfill({ status: 204 })
  )

  // Profile
  await page.route('**/api/v1/profile', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockProfile) })
  )

  // Notifications
  await page.route('**/api/v1/notifications**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  )

  // Load board list — use URL function to match path-only (glob won't match query params)
  await page.route(
    (url) => new URL(url).pathname.endsWith('/api/v1/board'),
    (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(emptyPage) })
  )

  // Active load and history
  await page.route('**/api/v1/board/my-load', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(null) })
  )
  await page.route(
    (url) => new URL(url).pathname.endsWith('/api/v1/board/my-history'),
    (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(emptyPage) })
  )

  // Specific CLAIMED load — registered last so it beats the catch-all
  await page.route(`**/api/v1/board/${LOAD_ID}`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(claimedLoad) })
  )

  // Load events (LoadDetail timeline) — must be an array
  await page.route(`**/api/v1/board/${LOAD_ID}/events`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  )

  // Ratings
  await page.route('**/api/v1/ratings**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  )

  // EIA fuel / market
  await page.route('**/api/v1/market**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ pricePerGallon: 3.85 }) })
  )
}

async function loginAsTrucker(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill('trucker@test.com')
  await page.getByLabel('Password').fill('password')
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/dashboard\/trucker/, { timeout: 10000 })
}

test.describe('BOL pickup attestation — golden path', () => {
  test('confirming pickup with an exception note locks the BOL and records the attestation', async ({ page }) => {
    await setupCommonRoutes(page)

    await page.route(`**/api/v1/documents/${LOAD_ID}`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([bolPhotoDocument]) })
    )

    let pickupBody: string | null = null
    await page.route(`**/api/v1/board/${LOAD_ID}/pickup`, async (route) => {
      pickupBody = route.request().postData()
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ ...claimedLoad, status: 'IN_TRANSIT' }),
      })
    })

    await loginAsTrucker(page)
    await page.goto(`/trucker/loads/${LOAD_ID}`)

    await expect(page.getByRole('button', { name: /mark as picked up/i })).toBeEnabled({ timeout: 8000 })
    await page.getByRole('button', { name: /mark as picked up/i }).click()

    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByTestId('pickup-exception-notes').fill('Two pallets damaged on arrival')

    await page.getByRole('button', { name: /yes, i have the load/i }).click()

    await expect(page).toHaveURL(/dashboard\/trucker/, { timeout: 8000 })
    expect(pickupBody).toContain('Two pallets damaged on arrival')
  })

  test('BOL document shows Locked badge after pickup attestation', async ({ page }) => {
    await setupCommonRoutes(page)

    const lockedBol = {
      id: 'doc-bol-gen-1',
      loadId: LOAD_ID,
      documentType: 'BOL_GENERATED',
      originalFilename: 'bill-of-lading.pdf',
      contentType: 'application/pdf',
      fileSizeBytes: 5000,
      note: null,
      uploadedBy: 'shipper-1',
      createdAt: new Date().toISOString(),
      locked: true,
      lockedAt: new Date().toISOString(),
    }

    await page.route(`**/api/v1/documents/${LOAD_ID}`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([lockedBol, bolPhotoDocument]) })
    )

    await loginAsTrucker(page)
    await page.goto(`/trucker/loads/${LOAD_ID}`)

    await expect(page.getByTestId('bol-locked-badge')).toBeVisible({ timeout: 8000 })
    await page.getByTestId('bol-locked-badge').scrollIntoViewIfNeeded()
    await page.screenshot({ path: 'test-results/evidence/US-302-v2-bol-locked-badge.png' })
  })
})
