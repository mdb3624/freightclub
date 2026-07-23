/**
 * Feature: US-730 epic verification (2026-07-04 CHG-849)
 * AC: Full carrier lifecycle — login, claim, BOL upload, pickup,
 *     POD upload, deliver, rate shipper — all exercised against the real
 *     (non-mock) TruckerDashboard.tsx / TruckerLoadDetailPage.tsx implementation.
 *
 * Selector/behavior corrections made vs. the original task-2 draft spec
 * (verified against actual source, not guessed):
 *  - `claim-load-btn`: did NOT exist in TruckerLoadDetailPage.tsx — added as a
 *    minimal additive `data-testid` prop (in scope per task brief).
 *  - `email-input` / `password-input` / `login-submit-btn`: CONFIRMED to exist
 *    exactly as named (LoginForm.tsx via Input `testId` prop + Button `data-testid`).
 *  - Login redirect: at the time this spec was first written, useLogin.ts sent
 *    TRUCKER role to `/dashboard/carrier` (CarrierDashboard) — the draft's
 *    implicit assumption of `/dashboard/trucker` was wrong at that point.
 *    This was fixed in a83f1cac (CHG-849): the redirect now correctly targets
 *    `/dashboard/trucker`, and this spec's login-flow assertion below reflects
 *    that fix.
 *  - `handleClaim()` in TruckerLoadDetailPage.tsx explicitly navigates to
 *    `/dashboard/trucker` (the OLDER TruckerDashboard, not CarrierDashboard)
 *    after a successful claim/pickup/deliver — confirmed by reading the
 *    onSuccess callbacks directly.
 *  - Route-mocking convention (catch-all registered first, specific routes
 *    after) and `setupCommonRoutes`-style scaffolding adapted from the
 *    proven-working `trucker-pod-upload.spec.ts`.
 */
import { test, expect, type Page } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'
import { TruckerLoadDetailPageObject } from './page-objects/TruckerLoadDetailPageObject'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOAD_ID = `e2e-load-${Date.now()}`

const mockAuthResponse = {
  accessToken: 'fake-jwt-token-for-testing',
  tokenType: 'Bearer',
  expiresIn: 900,
  user: {
    id: `trucker-${Date.now()}`,
    email: `trucker-${Date.now()}@test.com`,
    firstName: 'Test',
    lastName: 'Trucker',
    role: 'TRUCKER',
    tenantId: 'tenant-1',
  },
}

const mockProfile = {
  id: mockAuthResponse.user.id,
  email: mockAuthResponse.user.email,
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

function baseLoad(status: string) {
  return {
    id: LOAD_ID,
    tenantId: 'tenant-1',
    shipperId: 'shipper-1',
    truckerId: mockAuthResponse.user.id,
    status,
    originCity: 'Dallas', originState: 'TX', originZip: '75201',
    originAddress1: '100 Main St', originAddress2: null,
    destinationCity: 'Houston', destinationState: 'TX', destinationZip: '77001',
    destinationAddress1: '200 Commerce St', destinationAddress2: null,
    distanceMiles: 240,
    pickupFrom: '2026-07-05T09:00:00', pickupTo: '2026-07-05T12:00:00',
    deliveryFrom: '2026-07-05T15:00:00', deliveryTo: '2026-07-05T17:00:00',
    commodity: 'General Freight', weightLbs: 20000,
    lengthFt: null, widthFt: null, heightFt: null,
    equipmentType: 'DRY_VAN', payRate: 2.5, payRateType: 'PER_MILE',
    paymentTerms: 'QUICK_PAY', specialRequirements: null, cancelReason: null,
    shipperContact: { name: 'Jane Shipper', phone: '555-0100', businessName: 'Acme Shipping' },
    truckerContact: null,
    createdAt: '2026-07-04T08:00:00Z', updatedAt: '2026-07-05T09:00:00Z',
  }
}

function bolDocument() {
  return {
    id: 'doc-bol-001',
    loadId: LOAD_ID,
    documentType: 'BOL_PHOTO',
    originalFilename: 'bol-test-image.png',
    contentType: 'image/png',
    fileSizeBytes: 10240,
    note: null,
    uploadedBy: mockAuthResponse.user.email,
    createdAt: new Date().toISOString(),
  }
}

function podDocument() {
  return {
    id: 'doc-pod-001',
    loadId: LOAD_ID,
    documentType: 'POD_PHOTO',
    originalFilename: 'pod-test-image.png',
    contentType: 'image/png',
    fileSizeBytes: 10240,
    note: null,
    uploadedBy: mockAuthResponse.user.email,
    createdAt: new Date().toISOString(),
  }
}

test.describe('US-730 carrier full load lifecycle', () => {
  test('claim -> BOL -> pickup -> POD -> deliver -> rate shipper', async ({ page }: { page: Page }) => {
    let currentStatus = 'OPEN'
    let hasBolPhoto = false
    let hasPodPhoto = false
    let submittedRating: { stars: number; comment?: string; createdAt: string } | null = null
    const loadDetail = new TruckerLoadDetailPageObject(page)

    // Catch-all safety net — registered FIRST so specific routes below take priority
    // (proven pattern from trucker-pod-upload.spec.ts).
    await page.route('**/api/v1/**', (route) => {
      const url = route.request().url()
      console.warn('[e2e catch-all]', url)
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    })

    await page.route('**/api/v1/auth/login', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockAuthResponse) }))
    await page.route('**/api/v1/auth/refresh', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'fake-jwt-token', tokenType: 'Bearer', expiresIn: 900 }) }))
    await page.route('**/api/v1/auth/logout', (route) => route.fulfill({ status: 204 }))

    await page.route('**/api/v1/profile', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockProfile) }))

    await page.route('**/api/v1/notifications**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }))

    // Board list / active load / history — needed because a successful
    // claim/pickup/deliver navigates back to /dashboard/trucker.
    await page.route(
      (url) => new URL(url).pathname.endsWith('/api/v1/board'),
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(emptyPage) })
    )
    await page.route('**/api/v1/board/my-load', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(null) }))
    await page.route(
      (url) => new URL(url).pathname.endsWith('/api/v1/board/my-history'),
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(emptyPage) })
    )

    // Specific load — registered after the catch-all so it wins.
    await page.route(`**/api/v1/board/${LOAD_ID}`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(baseLoad(currentStatus)) }))
    await page.route(`**/api/v1/board/${LOAD_ID}/events`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }))
    await page.route(`**/api/v1/board/${LOAD_ID}/payment`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'PENDING', paidAt: null, truckerPayoutCents: 60000 }),
      }))

    await page.route(`**/api/v1/loads/${LOAD_ID}/claim`, (route) => {
      currentStatus = 'CLAIMED'
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(baseLoad(currentStatus)) })
    })
    await page.route(`**/api/v1/board/${LOAD_ID}/pickup`, (route) => {
      currentStatus = 'IN_TRANSIT'
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(baseLoad(currentStatus)) })
    })
    await page.route(`**/api/v1/board/${LOAD_ID}/deliver`, (route) => {
      currentStatus = 'DELIVERED'
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(baseLoad(currentStatus)) })
    })

    // Documents
    await page.route(`**/api/v1/documents/${LOAD_ID}`, (route) => {
      const docs = []
      if (hasBolPhoto) docs.push(bolDocument())
      if (hasPodPhoto) docs.push(podDocument())
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(docs) })
    })
    await page.route(`**/api/v1/documents/${LOAD_ID}/bol-photo`, (route) => {
      hasBolPhoto = true
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(bolDocument()) })
    })
    await page.route(`**/api/v1/documents/${LOAD_ID}/pod-photo`, (route) => {
      hasPodPhoto = true
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(podDocument()) })
    })

    // Ratings
    await page.route(`**/api/v1/ratings/${LOAD_ID}/mine`, (route) => {
      if (submittedRating) {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(submittedRating) })
      } else {
        route.fulfill({ status: 204, contentType: 'application/json', body: '' })
      }
    })
    await page.route(`**/api/v1/ratings/${LOAD_ID}/shipper`, (route) => {
      submittedRating = { stars: 5, comment: 'Great shipper, smooth load.', createdAt: new Date().toISOString() }
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(submittedRating) })
    })

    // --- Login ---
    await page.goto('/')
    await page.getByTestId('header-login-btn').click()
    await page.getByTestId('email-input').fill(mockAuthResponse.user.email)
    await page.getByTestId('password-input').fill('irrelevant')
    await page.getByTestId('login-submit-btn').click()
    // Login redirects TRUCKER to /dashboard/trucker (TruckerDashboard) —
    // fixed in a83f1cac (CHG-849); previously redirected to the now-deleted
    // orphaned mock at /dashboard/carrier.
    await page.waitForURL(/dashboard\/trucker/, { timeout: 10000 })

    // --- Claim ---
    await page.goto(`/trucker/loads/${LOAD_ID}`, { waitUntil: 'networkidle' })
    // The page fires a chain of async fetches (board load -> profile -> active
    // load) before this button renders; under a cold/first-run container this
    // can take longer than a tight default timeout even though the app itself
    // isn't broken (confirmed via captured DOM snapshot showing the button
    // present with correct data shortly after a prior 8s timeout).
    await expect(page.getByTestId('claim-load-btn')).toBeVisible({ timeout: 15000 })
    await page.getByTestId('claim-load-btn').click()
    // handleClaim() navigates to /dashboard/trucker on success (confirmed in source)
    await expect(page).toHaveURL(/dashboard\/trucker/, { timeout: 8000 })

    // --- BOL gate ---
    await page.goto(`/trucker/loads/${LOAD_ID}`)
    await loadDetail.expectBolRequired()
    await expect(page.getByRole('button', { name: /upload bol photo to continue/i })).toBeDisabled()

    const testImagePath = path.join(__dirname, 'fixtures', 'test-image.png')
    let fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: /^upload bol photo$/i }).click()
    let fileChooser = await fileChooserPromise
    await fileChooser.setFiles(testImagePath)

    // --- Pickup ---
    await expect(page.getByRole('button', { name: /^mark as picked up$/i })).toBeEnabled({ timeout: 8000 })
    await page.getByRole('button', { name: /^mark as picked up$/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: /yes, i have the load/i }).click()
    await expect(page).toHaveURL(/dashboard\/trucker/, { timeout: 8000 })

    // --- POD gate ---
    await page.goto(`/trucker/loads/${LOAD_ID}`)
    await loadDetail.expectPodRequired()
    await expect(page.getByRole('button', { name: /upload pod photo to continue/i })).toBeDisabled()

    fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: /^upload pod photo$/i }).click()
    fileChooser = await fileChooserPromise
    await fileChooser.setFiles(testImagePath)

    // --- Deliver ---
    await expect(page.getByRole('button', { name: /^mark as delivered$/i })).toBeEnabled({ timeout: 8000 })
    await page.getByRole('button', { name: /^mark as delivered$/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: /yes, delivered/i }).click()
    await expect(page).toHaveURL(/dashboard\/trucker/, { timeout: 8000 })

    // --- Rate shipper ---
    await page.goto(`/trucker/loads/${LOAD_ID}`)
    await loadDetail.expectRatingPrompt()
    await expect(page.getByTestId('payment-status-card')).toBeVisible({ timeout: 8000 })
    await page.getByRole('button', { name: '5 stars' }).click()
    await page.getByRole('button', { name: /submit rating/i }).click()
    await loadDetail.expectRatingConfirmation()
  })
})
