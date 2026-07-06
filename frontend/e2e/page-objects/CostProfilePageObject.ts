import { Page, Locator, expect } from '@playwright/test'

export class CostProfilePageObject {
  readonly page: Page
  readonly root: Locator
  readonly mpgInput: Locator
  readonly additionalCostInput: Locator
  readonly nextBtn: Locator
  readonly truckPaymentInput: Locator
  readonly insuranceInput: Locator
  readonly permitsInput: Locator
  readonly annualMilesInput: Locator
  readonly weeklyGoalInput: Locator
  readonly seeRpmBtn: Locator
  readonly minRpmValue: Locator
  readonly targetValue: Locator
  readonly breakevenValue: Locator

  constructor(page: Page) {
    this.page = page
    this.root = page.locator('[data-testid="cost-profile-page"]')
    this.mpgInput = page.locator('[data-testid="mpg-input"]')
    this.additionalCostInput = page.locator('[data-testid="additional-cost-input"]')
    this.nextBtn = page.locator('[data-testid="wizard-next-btn"]')
    this.truckPaymentInput = page.locator('[data-testid="truck-payment-input"]')
    this.insuranceInput = page.locator('[data-testid="insurance-input"]')
    this.permitsInput = page.locator('[data-testid="permits-input"]')
    this.annualMilesInput = page.locator('[data-testid="annual-miles-input"]')
    this.weeklyGoalInput = page.locator('[data-testid="weekly-goal-input"]')
    this.seeRpmBtn = page.locator('[data-testid="wizard-see-rpm-btn"]')
    this.minRpmValue = page.locator('[data-testid="kpi-min-rpm-value"]')
    this.targetValue = page.locator('[data-testid="kpi-target-value"]')
    this.breakevenValue = page.locator('[data-testid="kpi-breakeven-value"]')
  }

  async goto() {
    await this.page.goto('/carrier/cost-profile', { waitUntil: 'domcontentloaded' })
  }

  async completeWizard() {
    await this.mpgInput.fill('6.5')
    await this.page.locator('[data-testid="region-chip-MIDWEST"]').click()
    await this.additionalCostInput.fill('0.08')
    await this.nextBtn.click()

    await this.truckPaymentInput.fill('1200')
    await this.insuranceInput.fill('600')
    await this.permitsInput.fill('150')
    await this.annualMilesInput.fill('120000')
    await this.nextBtn.click()

    await this.weeklyGoalInput.fill('2000')
    await this.page.locator('[data-testid="weeks-chip-48"]').click()
    await this.seeRpmBtn.click()
  }

  async assertAllButtonsAreGloveFriendly() {
    const buttons = await this.page.locator('button').all()
    for (const button of buttons) {
      const box = await button.boundingBox()
      expect(box, 'every button must report a bounding box').not.toBeNull()
      expect(box!.height, `button "${await button.textContent()}" must be >=48px tall`).toBeGreaterThanOrEqual(48)
    }
  }
}
