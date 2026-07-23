import { Page, Locator } from '@playwright/test'

// Backs design-system/US-845-load-form.spec.ts — replaces the raw
// input[name="..."] CSS attribute locators that spec used to fill required
// fields (PROJECT_AUDIT_2026-07-23 item 6) with data-testid-based locators.
export class LoadFormPageObject {
  readonly page: Page
  readonly originAddress1: Locator
  readonly originCity: Locator
  readonly originState: Locator
  readonly originZip: Locator
  readonly destinationAddress1: Locator
  readonly destinationCity: Locator
  readonly destinationState: Locator
  readonly destinationZip: Locator
  readonly commodity: Locator
  readonly weightLbs: Locator
  readonly payRate: Locator

  constructor(page: Page) {
    this.page = page
    this.originAddress1 = page.getByTestId('originAddress1')
    this.originCity = page.getByTestId('originCity')
    this.originState = page.getByTestId('originState')
    this.originZip = page.getByTestId('originZip')
    this.destinationAddress1 = page.getByTestId('destinationAddress1')
    this.destinationCity = page.getByTestId('destinationCity')
    this.destinationState = page.getByTestId('destinationState')
    this.destinationZip = page.getByTestId('destinationZip')
    this.commodity = page.getByTestId('commodity')
    this.weightLbs = page.getByTestId('weightLbs')
    this.payRate = page.getByTestId('payRate')
  }

  async goto(frontendBaseUrl: string) {
    await this.page.goto(`${frontendBaseUrl}/shipper/loads/new`)
    await this.page.waitForLoadState('networkidle')
  }

  /** Fills every field required for Zod superRefine to run (mirrors the old fillRequiredFields helper). */
  async fillRequiredFields() {
    await this.originAddress1.fill('123 Main St')
    await this.originCity.fill('Chicago')
    await this.originState.selectOption('IL')
    await this.originZip.fill('60601')
    await this.destinationAddress1.fill('456 Industrial Blvd')
    await this.destinationCity.fill('Detroit')
    await this.destinationState.selectOption('MI')
    await this.destinationZip.fill('48201')
    await this.commodity.fill('Steel coils')
    await this.weightLbs.fill('45000')
    await this.payRate.fill('2500')
  }
}
