import { Page, Locator, expect } from '@playwright/test'

/**
 * Page Object for the Theme Preferences section (US-UI-MIGRATION).
 * Encapsulates selectors/navigation only — assertions live in the spec file
 * per testing_standards.md POM rules.
 */
export class ThemePreferencesPageObject {
  readonly page: Page
  readonly section: Locator
  readonly toggle: Locator

  constructor(page: Page) {
    this.page = page
    this.section = page.locator('[data-testid="theme-preferences-section"]')
    this.toggle = page.locator('[data-testid="theme-mode-toggle"]')
  }

  async goto() {
    await this.page.goto('/profile', { waitUntil: 'domcontentloaded' })
  }

  option(mode: 'light' | 'dark' | 'system'): Locator {
    return this.page.locator(`[data-testid="theme-mode-option-${mode}"]`)
  }

  async selectMode(mode: 'light' | 'dark' | 'system') {
    await this.option(mode).click()
  }

  async waitForToggleReady() {
    await expect(this.toggle).toBeVisible({ timeout: 10000 })
  }
}
