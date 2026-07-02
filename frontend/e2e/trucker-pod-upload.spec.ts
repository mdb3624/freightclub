import { test, expect, type Page } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const LOAD_ID = 'test-load-pod-001'

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

const inTransitLoad = {
  id: LOAD_ID,
  tenantId: 'tenant-1',
  shipperId: 'shipper-1',
  truckerId: 'trucker-user-1',
  status: 'IN_TRANSIT',
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

const podDocument = {
  id: 'doc-pod-001',
  loadId: LOAD_ID,
  documentType: 'POD_PHOTO',
  originalFilename: 'test-image.png',
  contentType: 'image/png',
  fileSizeBytes: 10240,
  note: null,
  uploadedBy: 'trucker@test.com',
  createdAt: new Date().toISOString(),
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

  // Specific IN_TRANSIT load — registered last so it beats the catch-all
  await page.route(`**/api/v1/board/${LOAD_ID}`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(inTransitLoad) })
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
  await expect(page).toHaveURL(/dashboard\/carrier/, { timeout: 10000 })
}

test.describe('Trucker POD upload — golden path', () => {
  test('POD upload gates Mark as Delivered and refreshes document list', async ({ page }) => {
    await setupCommonRoutes(page)

    let podUploaded = false

    await page.route(`**/api/v1/documents/${LOAD_ID}`, (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(podUploaded ? [podDocument] : []) })
    })

    await page.route(`**/api/v1/documents/${LOAD_ID}/pod-photo`, (route) => {
      podUploaded = true
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(podDocument) })
    })

    await loginAsTrucker(page)
    await page.goto(`/trucker/loads/${LOAD_ID}`)

    await expect(page.getByText(/POD Photo required/i)).toBeVisible({ timeout: 8000 })
    await expect(page.getByRole('button', { name: /upload pod photo to continue/i })).toBeDisabled()

    const testImagePath = path.join(__dirname, 'fixtures', 'test-image.png')
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: /^upload pod photo$/i }).click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(testImagePath)

    await expect(page.getByRole('button', { name: /mark as delivered/i })).toBeEnabled({ timeout: 8000 })
    await expect(page.getByText('test-image.png')).toBeVisible({ timeout: 5000 })
  })

  test('Export PDF button is not visible for TRUCKER role', async ({ page }) => {
    await setupCommonRoutes(page)

    await page.route(`**/api/v1/documents/${LOAD_ID}`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    )

    await loginAsTrucker(page)
    await page.goto(`/trucker/loads/${LOAD_ID}`)

    await expect(page.getByText(/POD Photo required/i)).toBeVisible({ timeout: 8000 })
    await expect(page.getByRole('button', { name: /export pdf/i })).not.toBeVisible()
  })
})
