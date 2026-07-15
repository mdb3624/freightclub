/**
 * Bug: shipper "View Documents" (per-load) and "My Documents" (dashboard quick
 * action) both navigated to routes that were never registered in App.tsx
 * (`/shipper/loads/:id/documents` and `/shipper/documents`), so the app's
 * catch-all route (`<Route path="*" element={<Navigate to="/" replace />} />`)
 * silently redirected the shipper to the home page instead of showing their
 * documents.
 *
 * Fix: "View Documents" now points at the existing `/shipper/loads/:id` route
 * (which already renders the Documents section); a new `/shipper/documents`
 * route + MyDocumentsPage was added, backed by a new
 * `GET /api/v1/documents/mine` endpoint that lists documents across all of a
 * shipper's loads.
 *
 * This spec proves both flows land on the correct page with the expected
 * content, not on the home page — the exact failure mode reported.
 */
import { test, expect, type Page } from '@playwright/test'

const LOAD_ID = `e2e-shipper-doc-${Date.now()}`

const mockAuthResponse = {
  accessToken: 'fake-jwt-token-for-testing',
  tokenType: 'Bearer',
  expiresIn: 900,
  user: {
    id: `shipper-${Date.now()}`,
    email: `shipper-${Date.now()}@test.com`,
    firstName: 'Test',
    lastName: 'Shipper',
    role: 'SHIPPER',
    tenantId: 'tenant-1',
  },
}

const emptyPage = { content: [], totalPages: 0, totalElements: 0, number: 0, size: 20 }

const openLoad = {
  id: LOAD_ID,
  tenantId: 'tenant-1',
  shipperId: mockAuthResponse.user.id,
  truckerId: null,
  status: 'OPEN',
  originCity: 'San Francisco',
  originState: 'CA',
  originZip: '94102',
  originAddress1: '123 Main St',
  originAddress2: null,
  destinationCity: 'Detroit',
  destinationState: 'MI',
  destinationZip: '48201',
  destinationAddress1: '456 Industrial Blvd',
  destinationAddress2: null,
  distanceMiles: null,
  pickupFrom: '2026-08-01T09:00:00',
  pickupTo: '2026-08-01T12:00:00',
  deliveryFrom: '2026-08-03T15:00:00',
  deliveryTo: '2026-08-03T17:00:00',
  commodity: 'General Freight',
  weightLbs: 20000,
  lengthFt: null,
  widthFt: null,
  heightFt: null,
  equipmentType: 'DRY_VAN',
  payRate: 1500,
  payRateType: 'FLAT_RATE',
  paymentTerms: null,
  specialRequirements: null,
  cancelReason: null,
  shipperContact: null,
  truckerContact: null,
  createdAt: '2026-07-15T09:00:00Z',
  updatedAt: '2026-07-15T09:00:00Z',
}

const bolDocument = {
  id: 'doc-bol-1',
  loadId: LOAD_ID,
  documentType: 'BOL_GENERATED',
  originalFilename: 'bill-of-lading.pdf',
  contentType: 'application/pdf',
  fileSizeBytes: 1398,
  note: null,
  uploadedBy: mockAuthResponse.user.id,
  createdAt: '2026-07-15T09:00:05Z',
}

async function setupCommonRoutes(page: Page) {
  // Catch-all safety net — prevents unmatched calls from crashing the app.
  // Registered FIRST so specific routes registered after take priority.
  await page.route('**/api/v1/**', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  })

  await page.route('**/api/v1/auth/login', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockAuthResponse) })
  )
  await page.route('**/api/v1/auth/refresh', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'fake-jwt-token', tokenType: 'Bearer', expiresIn: 900 }) })
  )
  await page.route('**/api/v1/auth/logout', (route) => route.fulfill({ status: 204 }))
  await page.route('**/api/v1/notifications**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  )
  await page.route('**/api/v1/loads/stats**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
  )
  await page.route('**/api/v1/shipper/dashboard/kpi-summary', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
  )
  await page.route('**/api/v1/shippers/preferred-carriers**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(emptyPage) })
  )
  await page.route('**/api/v1/shipper/shipments/active', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  )
  await page.route(`**/api/v1/loads/${LOAD_ID}/events`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  )
  await page.route(
    (url) => new URL(url).pathname.endsWith('/api/v1/loads') && new URL(url).search === '',
    (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(emptyPage) })
  )
  await page.route('**/api/v1/loads?**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(emptyPage) })
  )
  await page.route(`**/api/v1/loads/${LOAD_ID}`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(openLoad) })
  )
  await page.route(`**/api/v1/documents/${LOAD_ID}`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([bolDocument]) })
  )
  await page.route('**/api/v1/documents/mine', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([bolDocument]) })
  )
}

async function loginAsShipper(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill('shipper@test.com')
  await page.getByLabel('Password').fill('password')
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/dashboard\/shipper/, { timeout: 10000 })
}

test.describe('Shipper documents routing — golden path', () => {
  test('per-load View Documents opens the load detail page, not the home page', async ({ page }) => {
    await setupCommonRoutes(page)
    await loginAsShipper(page)

    await page.goto(`/shipper/loads/${LOAD_ID}`)

    // The bug redirected to "/" — confirm we land on, and stay on, the load detail page.
    await expect(page).toHaveURL(new RegExp(`/shipper/loads/${LOAD_ID}$`))
    await expect(page.getByText('Load Detail')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('bill-of-lading.pdf')).toBeVisible({ timeout: 8000 })
  })

  test('My Documents opens the aggregate documents page, not the home page', async ({ page }) => {
    await setupCommonRoutes(page)
    await loginAsShipper(page)

    await page.goto('/shipper/documents')

    // The bug redirected to "/" — confirm we land on, and stay on, /shipper/documents.
    await expect(page).toHaveURL(/\/shipper\/documents$/)
    await expect(page.getByText('My Documents')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('bill-of-lading.pdf')).toBeVisible({ timeout: 8000 })
    await expect(page.getByRole('link', { name: /view load/i })).toHaveAttribute('href', `/shipper/loads/${LOAD_ID}`)
  })
})
