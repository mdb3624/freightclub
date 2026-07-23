import { Page, Locator, expect } from '@playwright/test'

// Backs trucker-full-load-lifecycle.spec.ts and trucker-pod-upload.spec.ts —
// replaces the getByText(...) banner/confirmation assertions those specs used
// to make (PROJECT_AUDIT_2026-07-23 item 6) with data-testid-based locators.
export class TruckerLoadDetailPageObject {
  readonly page: Page
  readonly bolRequiredNotice: Locator
  readonly podRequiredNotice: Locator
  readonly ratingPrompt: Locator
  readonly ratingConfirmation: Locator
  readonly documentFilenames: Locator

  constructor(page: Page) {
    this.page = page
    this.bolRequiredNotice = page.getByTestId('bol-required-notice')
    this.podRequiredNotice = page.getByTestId('pod-required-notice')
    this.ratingPrompt = page.getByTestId('rating-prompt')
    this.ratingConfirmation = page.getByTestId('rating-confirmation')
    this.documentFilenames = page.getByTestId('document-filename')
  }

  async goto(loadId: string) {
    await this.page.goto(`/trucker/loads/${loadId}`)
  }

  async expectBolRequired() {
    await expect(this.bolRequiredNotice).toBeVisible({ timeout: 8000 })
  }

  async expectPodRequired() {
    await expect(this.podRequiredNotice).toBeVisible({ timeout: 8000 })
  }

  async expectRatingPrompt() {
    await expect(this.ratingPrompt).toBeVisible({ timeout: 8000 })
  }

  async expectRatingConfirmation() {
    await expect(this.ratingConfirmation).toBeVisible({ timeout: 8000 })
  }

  async expectDocumentUploaded(filename: string) {
    await expect(this.documentFilenames.filter({ hasText: filename })).toBeVisible({ timeout: 8000 })
  }
}
