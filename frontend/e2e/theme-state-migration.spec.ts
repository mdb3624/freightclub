/**
 * Feature: US-UI-MIGRATION (Theme State UI Component Migration)
 * AC-4/AC-5/AC-6: ThemeModeToggle persists user_preferences.theme_mode and
 * renders track-aware geometry (Carrier mobile/dark vs Shipper desktop/light).
 *
 * Per HFD hand-off (docs/hfd/UI_ThemeStateSeparation_US-UI-MIGRATION.md §8):
 * golden-path Playwright run with page.screenshot() evidence at:
 *   - test-results/evidence/carrier_mobile_final.png
 *   - test-results/evidence/shipper_desktop_final.png
 *
 * CHG-704: Evidence previously deferred (components not yet routed). Resolved by
 * wiring ThemeModeToggle into /profile (frontend/src/pages/ProfilePage.tsx).
 */

import { test, expect } from '@playwright/test'
import { TestDataSeeder } from './fixtures/test-data-seeder'
import { ThemePreferencesPageObject } from './page-objects/ThemePreferencesPageObject'

async function setUserAuth(page: any, user: any) {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.evaluate((u: any) => {
    localStorage.setItem('freightclub_access_token', u.accessToken)
    localStorage.setItem('freightclub_user', JSON.stringify({
      id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role, tenantId: u.tenantId,
    }))
  }, user)
}

test.describe('Theme State Migration — Golden Path (US-UI-MIGRATION)', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  // ==========================================================================
  // TEST 1 — Carrier track (mobile, dark): AC-4/AC-6
  // ==========================================================================
  test('US-UI-MIGRATION AC-4/AC-6: carrier toggles theme mode on mobile track @US-UI-MIGRATION', async ({ page, request }) => {
    await page.setViewportSize({ width: 390, height: 844 })

    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `carrier-theme-${Date.now()}@test.com`,
      password: 'N1kk101!',
      role: 'TRUCKER',
      firstName: 'Theme',
      lastName: 'Carrier',
    })

    try {
      await setUserAuth(page, user)

      const themePrefs = new ThemePreferencesPageObject(page)
      await themePrefs.goto()
      await themePrefs.waitForToggleReady()

      await expect(themePrefs.section).toHaveAttribute('data-track', 'carrier')

      await themePrefs.selectMode('dark')
      await expect(themePrefs.option('dark')).toHaveAttribute('aria-checked', 'true')

      await page.screenshot({ path: 'test-results/evidence/carrier_mobile_final.png', fullPage: true })
    } finally {
      await seeder.cleanup()
    }
  })

  // ==========================================================================
  // TEST 2 — Shipper track (desktop, light): AC-4/AC-5
  // ==========================================================================
  test('US-UI-MIGRATION AC-4/AC-5: shipper toggles theme mode on desktop track @US-UI-MIGRATION', async ({ page, request }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `shipper-theme-${Date.now()}@test.com`,
      password: 'N1kk101!',
      role: 'SHIPPER',
      firstName: 'Theme',
      lastName: 'Shipper',
      companyName: 'Theme Test Shipping Co',
    })

    try {
      await setUserAuth(page, user)

      const themePrefs = new ThemePreferencesPageObject(page)
      await themePrefs.goto()
      await themePrefs.waitForToggleReady()

      await expect(themePrefs.section).toHaveAttribute('data-track', 'shipper')

      await themePrefs.selectMode('light')
      await expect(themePrefs.option('light')).toHaveAttribute('aria-checked', 'true')

      await page.screenshot({ path: 'test-results/evidence/shipper_desktop_final.png', fullPage: true })
    } finally {
      await seeder.cleanup()
    }
  })
})
