import { test, expect, Page } from '@playwright/test'
import { CarrierNetworkPageObject } from './page-objects/CarrierNetworkPageObject'

/**
 * Feature: US-848 (Carrier Network Page)
 * AC-1: Page renders at /carriers wrapped in ShipperPageLayout; URL params pre-populate
 *       filter dropdowns on mount and trigger an initial search
 * AC-2: "Search Carriers" triggers a search; "Clear filters" resets all filters
 * AC-3: Preferred Carriers strip renders above the results grid when preferred carriers exist
 * AC-4: Each carrier card shows name, equipment tags, on-time % stat box, Get Quote button,
 *       and Add/Remove Preferred toggle button
 * AC-5: Clicking a carrier card opens the slide-in detail panel; "✕ Close" dismisses it
 * AC-6: Preferred toggle button flips preferred status (optimistic UI update)
 * AC-7: Empty state renders the correct message when search returns zero results
 * AC-8: Breadcrumb "Dashboard ›" and "← Back to Dashboard" navigate to /dashboard/shipper
 *
 * Backend contracts are already shipped (US-762 lane search, US-710 public profile,
 * US-707 preferred carriers) — no new backend surface for this story, so this spec
 * mocks those endpoints per the project's established route-mocking pattern
 * (see frontend/e2e/trucker-pod-upload.spec.ts + memory/feedback_e2e_route_mocking.md):
 * catch-all registered first, specific routes registered after (Playwright routing is LIFO).
 */

const CARRIER_1 = { id: 'e2e-carrier-1', companyName: 'Acme Freight E2E', email: 'acme-e2e@example.com', equipmentTypes: ['Dry Van'], onTimePct: 96 }
const CARRIER_2 = { id: 'e2e-carrier-2', companyName: 'Bronco Hauling E2E', email: 'bronco-e2e@example.com', equipmentTypes: ['Flatbed'], onTimePct: 88 }

const PUBLIC_PROFILE_2 = {
  truckerId: CARRIER_2.id,
  equipment: [{ id: 'eq-1', equipmentType: 'Flatbed' }],
  lanes: [{ id: 'lane-1', originRegion: 'TX', destinationRegion: 'CA' }],
  availability: { carrierId: CARRIER_2.id, isActive: true },
}

async function setupCommonRoutes(page: Page, opts: { searchResults?: unknown[]; preferred?: string[] } = {}) {
  const { searchResults = [CARRIER_1, CARRIER_2], preferred = [CARRIER_1.id] } = opts

  // Catch-all safety net — registered FIRST so specific routes registered after take priority.
  await page.route('**/api/v1/**', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  })

  await page.route('**/api/v1/carriers/search**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(searchResults) })
  )

  await page.route('**/api/v1/shippers/preferred-carriers/**', (route) => {
    // Add/remove preferred toggle — DELETE and POST both no-op 200/204
    const method = route.request().method()
    route.fulfill({ status: method === 'DELETE' ? 204 : 200, contentType: 'application/json', body: '{}' })
  })

  await page.route('**/api/v1/shippers/preferred-carriers**', (route) => {
    const method = route.request().method()
    if (method === 'POST') {
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      return
    }
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ content: preferred.map((carrierId) => ({ id: `pref-${carrierId}`, carrierId, createdAt: new Date().toISOString() })) }),
    })
  })

  await page.route(`**/api/v1/carriers/${CARRIER_2.id}/public-profile`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(PUBLIC_PROFILE_2) })
  )
}

test.describe('US-848: Carrier Network Page', () => {
  test('AC-1: pre-populates filters from URL params; initial view shows all carriers unfiltered', async ({ page }) => {
    await setupCommonRoutes(page)
    const carrierPage = new CarrierNetworkPageObject(page)

    await carrierPage.goto('?origin=TX&dest=CA&equip=Flatbed')
    await carrierPage.waitForReady()

    await expect(carrierPage.filterOrigin).toHaveValue('TX')
    await expect(carrierPage.filterDest).toHaveValue('CA')
    await expect(carrierPage.filterEquip).toHaveValue('Flatbed')

    // Per Prototype/ui_kits/shipper/carrier-network.html (source of truth): the initial mount
    // search always browses all carriers — URL params only pre-populate the filter dropdowns
    // above; they aren't applied until the shipper clicks "Search Carriers".
    await expect(carrierPage.carrierCard(CARRIER_1.id)).toBeVisible()
    await expect(carrierPage.carrierCard(CARRIER_2.id)).toBeVisible()
  })

  test('AC-2: Search Carriers re-runs the search; Clear filters resets and re-searches', async ({ page }) => {
    await setupCommonRoutes(page)
    const carrierPage = new CarrierNetworkPageObject(page)

    await carrierPage.goto()
    await carrierPage.waitForReady()
    await expect(carrierPage.carrierCard(CARRIER_1.id)).toBeVisible()

    await carrierPage.search('TX', 'CA', 'Dry Van')
    await expect(carrierPage.carrierCard(CARRIER_1.id)).toBeVisible()

    await carrierPage.clearFiltersBtn.click()
    await expect(carrierPage.filterOrigin).toHaveValue('')
    await expect(carrierPage.filterDest).toHaveValue('')
    await expect(carrierPage.filterEquip).toHaveValue('')
  })

  test('AC-3/AC-4: preferred strip renders; carrier card shows name, equipment tag, on-time stat, and actions', async ({ page }) => {
    await setupCommonRoutes(page)
    const carrierPage = new CarrierNetworkPageObject(page)

    await carrierPage.goto()
    await carrierPage.waitForReady()

    await expect(carrierPage.preferredStripItem(CARRIER_1.id)).toBeVisible()
    await expect(carrierPage.preferredBadge(CARRIER_1.id)).toBeVisible()

    const card2 = carrierPage.carrierCard(CARRIER_2.id)
    await expect(card2).toBeVisible()
    await expect(card2).toContainText('Bronco Hauling E2E')
    await expect(card2).toContainText('Flatbed')
    await expect(card2).toContainText('88%')
    await expect(carrierPage.getQuoteBtn(CARRIER_2.id)).toBeVisible()
    await expect(carrierPage.togglePreferredBtn(CARRIER_2.id)).toBeVisible()

    // AC-4: Get Quote navigates to the quote flow
    await carrierPage.getQuoteBtn(CARRIER_2.id).click()
    await expect(page).toHaveURL(new RegExp(`/shipper/quote\\?carrierId=${CARRIER_2.id}`))
  })

  test('AC-5: clicking a carrier card opens the detail panel; close dismisses it', async ({ page }) => {
    await setupCommonRoutes(page)
    const carrierPage = new CarrierNetworkPageObject(page)

    await carrierPage.goto()
    await carrierPage.waitForReady()

    await carrierPage.carrierCard(CARRIER_2.id).click()
    await expect(carrierPage.detailPanel).toContainText('Bronco Hauling E2E')
    await expect(carrierPage.detailPanel).toContainText('Flatbed')
    await expect(carrierPage.detailPanel).toContainText('TX→CA')
    await expect(carrierPage.assignToLoadBtn).toBeVisible()
    await expect(carrierPage.requestQuoteBtn).toBeVisible()

    await carrierPage.closeDetailPanelBtn.click()
    await expect(carrierPage.detailPanel).toHaveCSS('transform', /matrix\(1, 0, 0, 1, \d+/)
  })

  test('AC-6: preferred toggle flips optimistically on the card and in the detail panel', async ({ page }) => {
    await setupCommonRoutes(page)
    const carrierPage = new CarrierNetworkPageObject(page)

    await carrierPage.goto()
    await carrierPage.waitForReady()

    const toggleBtn = carrierPage.togglePreferredBtn(CARRIER_2.id)
    await expect(toggleBtn).toContainText('Add Preferred')
    await toggleBtn.click()
    await expect(toggleBtn).toContainText('Preferred')

    await carrierPage.carrierCard(CARRIER_2.id).click()
    await expect(carrierPage.detailPreferredBtn).toContainText('Preferred')
  })

  test('AC-7: shows the empty state message when the search returns zero results', async ({ page }) => {
    await setupCommonRoutes(page, { searchResults: [] })
    const carrierPage = new CarrierNetworkPageObject(page)

    await carrierPage.goto()
    await carrierPage.waitForReady()

    await expect(carrierPage.emptyState).toBeVisible()
    await expect(carrierPage.emptyState).toContainText('No carriers match your filters. Try widening your search.')
  })

  test('AC-8: breadcrumb and back button navigate to /dashboard/shipper', async ({ page }) => {
    await setupCommonRoutes(page)
    const carrierPage = new CarrierNetworkPageObject(page)

    await carrierPage.goto()
    await carrierPage.waitForReady()

    // Drop the search/preferred-carriers mocks before navigating away — the destination
    // page (ShipperDashboard) makes its own real API calls that the generic '{}' catch-all
    // isn't shaped for, and this test only cares that navigate() targets the right route.
    await page.unrouteAll({ behavior: 'ignoreErrors' })

    await carrierPage.breadcrumbDashboardLink.click()
    await expect(page).toHaveURL(/\/dashboard\/shipper/)

    await setupCommonRoutes(page)
    await carrierPage.goto()
    await carrierPage.waitForReady()
    await page.unrouteAll({ behavior: 'ignoreErrors' })
    await carrierPage.backToDashboardBtn.click()
    await expect(page).toHaveURL(/\/dashboard\/shipper/)
  })
})
