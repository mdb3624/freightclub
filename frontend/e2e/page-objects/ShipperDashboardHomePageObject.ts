import { Page, Locator, expect } from '@playwright/test'

/**
 * Page Object for the Shipper Dashboard Home (US-760: KPI strip, carrier-search
 * lane panel). Encapsulates selectors/navigation only — assertions live in the
 * spec file per testing_standards.md POM rules.
 */
export class ShipperDashboardHomePageObject {
  readonly page: Page
  readonly grid: Locator
  readonly kpiActiveShipments: Locator
  readonly kpiEstimatedCostPerMile: Locator
  readonly kpiOnTimeCarrierPct: Locator
  readonly carrierSearchPanel: Locator
  readonly originInput: Locator
  readonly destinationInput: Locator
  readonly searchSubmitBtn: Locator
  readonly searchResults: Locator
  readonly searchEmptyState: Locator

  constructor(page: Page) {
    this.page = page
    this.grid = page.locator('[data-testid="dashboard-grid"]')
    this.kpiActiveShipments = page.locator('[data-testid="kpi-tile-activeShipments"]')
    this.kpiEstimatedCostPerMile = page.locator('[data-testid="kpi-tile-estimatedCostPerMile"]')
    this.kpiOnTimeCarrierPct = page.locator('[data-testid="kpi-tile-onTimeCarrierPct"]')
    this.carrierSearchPanel = page.locator('[data-testid="carrier-search-panel"]')
    this.originInput = page.locator('[data-testid="carrier-search-origin-input"]')
    this.destinationInput = page.locator('[data-testid="carrier-search-destination-input"]')
    this.searchSubmitBtn = page.locator('[data-testid="carrier-search-submit-btn"]')
    this.searchResults = page.locator('[data-testid="carrier-search-results"]')
    this.searchEmptyState = page.locator('[data-testid="carrier-search-empty"]')
  }

  async goto() {
    await this.page.goto('/dashboard/shipper', { waitUntil: 'domcontentloaded' })
  }

  async waitForGridReady() {
    await expect(this.grid).toBeVisible({ timeout: 10000 })
  }

  async searchLane(origin: string, destination: string) {
    await this.originInput.fill(origin)
    await this.destinationInput.fill(destination)
    await this.searchSubmitBtn.click()
  }

  resultRow(carrierId: string): Locator {
    return this.page.locator(`[data-testid="carrier-search-result-${carrierId}"]`)
  }
}
