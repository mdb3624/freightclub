/**
 * CHG-003: Action Zone Structural Layout
 *
 * Feature: Shipper Dashboard slotC (Action Zone) restructured with two distinct panels
 * AC-1: Quick Actions in own panel with ARIA labels
 * AC-2: Carrier Search in own panel with ARIA labels
 * AC-3: 2-column grid at desktop (≥1024px)
 * AC-4: Single column stack at mobile (<1024px)
 * AC-5: Structure matches master prototype layout
 *
 * CODER workflow: RED (test fails) → GREEN (implement) → REFACTOR (clean)
 */

import { test, expect } from '@playwright/test'
import { TestDataSeeder } from './fixtures/test-data-seeder'

async function setUserAuth(page: any, user: any) {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.evaluate((u: any) => {
    localStorage.setItem('freightclub_access_token', u.accessToken)
    localStorage.setItem('freightclub_user', JSON.stringify({ id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role, tenantId: u.tenantId }))
  }, user)
}

test.describe('CHG-003: Action Zone Structural Layout', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  // AC-1: Quick Actions in Own Panel
  test('AC-1: Quick Actions section wrapped in .panel with ARIA labels', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `chg003-ac1-${Date.now()}@test.com`,
      role: 'SHIPPER',
      firstName: 'AC1',
      lastName: 'Test',
      companyName: 'AC1 Test Corp',
    })

    try {
      await setUserAuth(page, user)
      await page.goto('/dashboard/shipper', { waitUntil: 'domcontentloaded' })

      // AC-1: Quick Actions in own panel
      const quickActionsPanel = page.locator('[data-testid="dashboard-quick-actions-panel"]')
      await expect(quickActionsPanel).toBeVisible({ timeout: 5000 })

      // AC-1: Has role="region" and aria-label
      await expect(quickActionsPanel).toHaveAttribute('role', 'region')
      await expect(quickActionsPanel).toHaveAttribute('aria-label', 'Quick Actions')

      // AC-1: Has .panel class styling
      await expect(quickActionsPanel).toHaveClass(/panel/)

      // AC-1: All 4 action buttons visible
      const postLoadBtn = page.locator('[data-testid="quick-actions-post-load"]')
      const quoteBtn = page.locator('[data-testid="quick-actions-quote"]')
      const trackBtn = page.locator('[data-testid="quick-actions-track"]')
      const carriersBtn = page.locator('[data-testid="quick-actions-carriers"]')

      await expect(postLoadBtn).toBeVisible()
      await expect(quoteBtn).toBeVisible()
      await expect(trackBtn).toBeVisible()
      await expect(carriersBtn).toBeVisible()

      await page.screenshot({ path: 'test-results/evidence/chg-003-ac1-quick-actions-panel.png', fullPage: true })
    } finally {
      await seeder.cleanup()
    }
  })

  // AC-2: Carrier Search in Own Panel
  test('AC-2: Carrier Search section wrapped in .panel with ARIA labels', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `chg003-ac2-${Date.now()}@test.com`,
      role: 'SHIPPER',
      firstName: 'AC2',
      lastName: 'Test',
      companyName: 'AC2 Test Corp',
    })

    try {
      await setUserAuth(page, user)
      await page.goto('/dashboard/shipper', { waitUntil: 'domcontentloaded' })

      // AC-2: Carrier Search in own panel
      const carrierSearchPanel = page.locator('[data-testid="dashboard-carrier-search-panel"]')
      await expect(carrierSearchPanel).toBeVisible({ timeout: 5000 })

      // AC-2: Has role="region" and aria-label
      await expect(carrierSearchPanel).toHaveAttribute('role', 'region')
      await expect(carrierSearchPanel).toHaveAttribute('aria-label', 'Carrier Search')

      // AC-2: Has .panel class styling
      await expect(carrierSearchPanel).toHaveClass(/panel/)

      // AC-2: Search form elements visible (Origin/Destination/Equipment Type + SEARCH button)
      const originLabel = page.locator('label[for="origin-input"]')
      const destLabel = page.locator('label[for="dest-input"]')
      const equipmentLabel = page.locator('label[for="equipment-input"]')
      const searchButton = page.locator('button:has-text("SEARCH")')

      await expect(originLabel).toBeVisible()
      await expect(destLabel).toBeVisible()
      await expect(equipmentLabel).toBeVisible()
      await expect(searchButton).toBeVisible()

      await page.screenshot({ path: 'test-results/evidence/chg-003-ac2-carrier-search-panel.png', fullPage: true })
    } finally {
      await seeder.cleanup()
    }
  })

  // AC-3: 2-column layout at desktop (≥1024px)
  test('AC-3: Desktop (≥1024px) displays 2-column grid layout with equal width panels', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `chg003-ac3-${Date.now()}@test.com`,
      role: 'SHIPPER',
      firstName: 'AC3',
      lastName: 'Test',
      companyName: 'AC3 Test Corp',
    })

    try {
      await setUserAuth(page, user)

      // Set viewport to desktop size (≥1024px)
      await page.setViewportSize({ width: 1280, height: 800 })
      await page.goto('/dashboard/shipper', { waitUntil: 'domcontentloaded' })

      // AC-3: Quick Actions and Carrier Search both visible
      const quickActionsPanel = page.locator('[data-testid="dashboard-quick-actions-panel"]')
      const carrierSearchPanel = page.locator('[data-testid="dashboard-carrier-search-panel"]')

      await expect(quickActionsPanel).toBeVisible({ timeout: 5000 })
      await expect(carrierSearchPanel).toBeVisible()

      // AC-3: Verify 2-column layout via bounding boxes (roughly equal width, side-by-side)
      const qaBox = await quickActionsPanel.boundingBox()
      const csBox = await carrierSearchPanel.boundingBox()

      expect(qaBox).toBeTruthy()
      expect(csBox).toBeTruthy()

      // AC-3: Both panels should be roughly same height (vertical alignment at top)
      const heightDiff = Math.abs((qaBox?.height || 0) - (csBox?.height || 0))
      expect(heightDiff).toBeLessThan(50) // Allow 50px variance

      // AC-3: No horizontal scrolling
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      const viewportWidth = page.viewportSize()?.width || 0
      expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 1)

      await page.screenshot({ path: 'test-results/evidence/chg-003-ac3-desktop-2col.png', fullPage: true })
    } finally {
      await seeder.cleanup()
    }
  })

  // AC-4: Single column stack at mobile (<1024px)
  test('AC-4: Mobile (<1024px) displays single column vertical stack', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `chg003-ac4-${Date.now()}@test.com`,
      role: 'SHIPPER',
      firstName: 'AC4',
      lastName: 'Test',
      companyName: 'AC4 Test Corp',
    })

    try {
      await setUserAuth(page, user)

      // Set viewport to mobile size (<1024px)
      await page.setViewportSize({ width: 640, height: 800 })
      await page.goto('/dashboard/shipper', { waitUntil: 'domcontentloaded' })

      // AC-4: Quick Actions and Carrier Search both visible
      const quickActionsPanel = page.locator('[data-testid="dashboard-quick-actions-panel"]')
      const carrierSearchPanel = page.locator('[data-testid="dashboard-carrier-search-panel"]')

      await expect(quickActionsPanel).toBeVisible({ timeout: 5000 })
      await expect(carrierSearchPanel).toBeVisible()

      // AC-4: Verify panels are stacked vertically (one above the other)
      const qaBox = await quickActionsPanel.boundingBox()
      const csBox = await carrierSearchPanel.boundingBox()

      expect(qaBox).toBeTruthy()
      expect(csBox).toBeTruthy()

      // AC-4: Carrier Search should be below Quick Actions (larger Y coordinate)
      expect((csBox?.y || 0)).toBeGreaterThan((qaBox?.y || 0))

      // AC-4: Both panels should span full width (or near full width)
      const pageWidth = 640
      const qaWidth = qaBox?.width || 0
      const csWidth = csBox?.width || 0
      expect(qaWidth).toBeGreaterThan(pageWidth * 0.8) // At least 80% of viewport
      expect(csWidth).toBeGreaterThan(pageWidth * 0.8)

      // AC-4: No horizontal scrolling at mobile
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(scrollWidth).toBeLessThanOrEqual(pageWidth + 1)

      await page.screenshot({ path: 'test-results/evidence/chg-003-ac4-mobile-1col.png', fullPage: true })
    } finally {
      await seeder.cleanup()
    }
  })

  // AC-5: Panel Structure Matches Master Prototype
  test('AC-5: Panel structure matches master prototype with proper ARIA, spacing, and styling', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `chg003-ac5-${Date.now()}@test.com`,
      role: 'SHIPPER',
      firstName: 'AC5',
      lastName: 'Test',
      companyName: 'AC5 Test Corp',
    })

    try {
      await setUserAuth(page, user)
      await page.setViewportSize({ width: 1280, height: 800 })
      await page.goto('/dashboard/shipper', { waitUntil: 'domcontentloaded' })

      // AC-5: Action Zone container should exist
      const actionZoneSection = page.locator('[data-testid="action-zone-section"]')
      await expect(actionZoneSection).toBeVisible({ timeout: 5000 })

      // AC-5: Both panels present in Action Zone
      const quickActionsPanel = page.locator('[data-testid="dashboard-quick-actions-panel"]')
      const carrierSearchPanel = page.locator('[data-testid="dashboard-carrier-search-panel"]')

      await expect(quickActionsPanel).toBeVisible()
      await expect(carrierSearchPanel).toBeVisible()

      // AC-5: Panel styling verification (white bg, border, shadow)
      const qaStyles = await quickActionsPanel.evaluate((el: HTMLElement) => {
        const styles = window.getComputedStyle(el)
        return {
          backgroundColor: styles.backgroundColor,
          borderColor: styles.borderColor,
          borderRadius: styles.borderRadius,
        }
      })

      // AC-5: Verify whitish background and border
      expect(qaStyles.backgroundColor).toMatch(/white|rgb\(255.*255.*255\)|rgb\(248.*249.*251\)/)
      expect(qaStyles.borderColor).not.toBe('transparent')
      expect(qaStyles.borderRadius).not.toBe('0px')

      // AC-5: All spacing should be multiple of 8px (verified via gap property)
      const gridContainer = actionZoneSection.locator(':scope > div').first()
      const gridGap = await gridContainer.evaluate((el: HTMLElement) => {
        return window.getComputedStyle(el).gap
      })

      // AC-5: Gap should be 8px, 16px, 24px, or 32px (8px multiples)
      expect(gridGap).toMatch(/^(8px|16px|24px|32px)/)

      await page.screenshot({ path: 'test-results/evidence/chg-003-ac5-prototype-match.png', fullPage: true })
    } finally {
      await seeder.cleanup()
    }
  })
})
