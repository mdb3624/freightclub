import { Page, Locator, expect } from '@playwright/test'

// Backs shipper-documents-routing.spec.ts — replaces the getByText(...)
// page-title/filename assertions those specs used to make
// (PROJECT_AUDIT_2026-07-23 item 6) with data-testid-based locators.
export class ShipperLoadDetailPageObject {
  readonly page: Page
  readonly pageTitle: Locator
  readonly documentFilenames: Locator

  constructor(page: Page) {
    this.page = page
    this.pageTitle = page.getByTestId('load-detail-page-title')
    this.documentFilenames = page.getByTestId('document-filename')
  }

  async goto(loadId: string) {
    await this.page.goto(`/shipper/loads/${loadId}`)
  }

  async expectLoaded() {
    await expect(this.pageTitle).toBeVisible({ timeout: 8000 })
  }

  async expectDocumentListed(filename: string) {
    await expect(this.documentFilenames.filter({ hasText: filename })).toBeVisible({ timeout: 8000 })
  }
}

// Backs the "My Documents" aggregate-view half of the same spec.
export class MyDocumentsPageObject {
  readonly page: Page
  readonly pageTitle: Locator
  readonly documentFilenames: Locator
  readonly viewLoadLink: Locator

  constructor(page: Page) {
    this.page = page
    this.pageTitle = page.getByTestId('my-documents-page-title')
    this.documentFilenames = page.getByTestId('document-filename')
    this.viewLoadLink = page.getByRole('link', { name: /view load/i })
  }

  async goto() {
    await this.page.goto('/shipper/documents')
  }

  async expectLoaded() {
    await expect(this.pageTitle).toBeVisible({ timeout: 8000 })
  }

  async expectDocumentListed(filename: string) {
    await expect(this.documentFilenames.filter({ hasText: filename })).toBeVisible({ timeout: 8000 })
  }
}
