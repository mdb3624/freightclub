import { Page, Locator, expect } from '@playwright/test'

/**
 * Page Object for the Carrier Network Page (US-848). Encapsulates selectors/navigation
 * only — assertions live in the spec file per testing_standards.md POM rules.
 */
export class CarrierNetworkPageObject {
  readonly page: Page
  readonly layoutRoot: Locator
  readonly breadcrumbDashboardLink: Locator
  readonly backToDashboardBtn: Locator
  readonly filterOrigin: Locator
  readonly filterDest: Locator
  readonly filterEquip: Locator
  readonly filterPreferredOnly: Locator
  readonly searchBtn: Locator
  readonly clearFiltersBtn: Locator
  readonly emptyState: Locator
  readonly detailPanel: Locator
  readonly closeDetailPanelBtn: Locator
  readonly assignToLoadBtn: Locator
  readonly requestQuoteBtn: Locator
  readonly detailPreferredBtn: Locator

  constructor(page: Page) {
    this.page = page
    this.layoutRoot = page.locator('[data-testid="carrier-network-page"]')
    this.breadcrumbDashboardLink = page.locator('[data-testid="breadcrumb-dashboard-link"]')
    this.backToDashboardBtn = page.locator('[data-testid="back-to-dashboard-btn"]')
    this.filterOrigin = page.locator('[data-testid="filter-origin"]')
    this.filterDest = page.locator('[data-testid="filter-dest"]')
    this.filterEquip = page.locator('[data-testid="filter-equip"]')
    this.filterPreferredOnly = page.locator('[data-testid="filter-preferred-only"]')
    this.searchBtn = page.locator('[data-testid="search-carriers-btn"]')
    this.clearFiltersBtn = page.locator('[data-testid="clear-filters-btn"]')
    this.emptyState = page.locator('[data-testid="carriers-empty-state"]')
    this.detailPanel = page.locator('[data-testid="carrier-detail-panel"]')
    this.closeDetailPanelBtn = page.locator('[data-testid="close-detail-panel-btn"]')
    this.assignToLoadBtn = page.locator('[data-testid="assign-to-load-btn"]')
    this.requestQuoteBtn = page.locator('[data-testid="request-quote-btn"]')
    this.detailPreferredBtn = page.locator('[data-testid="detail-preferred-btn"]')
  }

  async goto(query: string = '') {
    await this.page.goto(`/carriers${query}`, { waitUntil: 'domcontentloaded' })
  }

  async waitForReady() {
    await expect(this.layoutRoot).toBeVisible({ timeout: 10000 })
  }

  async search(origin?: string, dest?: string, equip?: string) {
    if (origin) await this.filterOrigin.selectOption(origin)
    if (dest) await this.filterDest.selectOption(dest)
    if (equip) await this.filterEquip.selectOption(equip)
    await this.searchBtn.click()
  }

  carrierCard(carrierId: string): Locator {
    return this.page.locator(`[data-testid="carrier-card-${carrierId}"]`)
  }

  getQuoteBtn(carrierId: string): Locator {
    return this.page.locator(`[data-testid="get-quote-btn-${carrierId}"]`)
  }

  togglePreferredBtn(carrierId: string): Locator {
    return this.page.locator(`[data-testid="toggle-preferred-btn-${carrierId}"]`)
  }

  preferredBadge(carrierId: string): Locator {
    return this.page.locator(`[data-testid="preferred-badge-${carrierId}"]`)
  }

  preferredStripItem(carrierId: string): Locator {
    return this.page.locator(`[data-testid="preferred-strip-${carrierId}"]`)
  }
}
