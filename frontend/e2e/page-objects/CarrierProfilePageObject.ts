import type { Page } from '@playwright/test'

export class CarrierProfilePageObject {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/carrier/profile', { waitUntil: 'networkidle' })
  }

  async clickTab(tab: 'identity' | 'equipment' | 'credentials' | 'lanes') {
    await this.page.locator(`[data-testid="tab-${tab}"]`).click()
  }

  async fillIdentity(firstName: string, lastName: string, phone: string) {
    await this.page.locator('[data-testid="identity-first-name-input"]').fill(firstName)
    await this.page.locator('[data-testid="identity-last-name-input"]').fill(lastName)
    await this.page.locator('[data-testid="identity-phone-input"]').fill(phone)
  }

  async fillEquipment(year: string, make: string, model: string, plate: string) {
    await this.page.locator('[data-testid="equipment-year-input"]').fill(year)
    await this.page.locator('[data-testid="equipment-make-input"]').fill(make)
    await this.page.locator('[data-testid="equipment-model-input"]').fill(model)
    await this.page.locator('[data-testid="equipment-plate-input"]').fill(plate)
  }

  async fillCredentials(dot: string, mc: string, cdlClass: string, cdlExpiry: string) {
    await this.page.locator('[data-testid="creds-dot-input"]').fill(dot)
    await this.page.locator('[data-testid="creds-mc-input"]').fill(mc)
    await this.page.locator('[data-testid="creds-cdl-class-select"]').selectOption(cdlClass)
    await this.page.locator('[data-testid="creds-cdl-expiry-input"]').fill(cdlExpiry)
  }

  async save() {
    await this.page.locator('[data-testid="save-profile-btn"]').click()
  }
}
