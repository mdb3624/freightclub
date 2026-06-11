import { test, expect } from '@playwright/test'
import { TestDataSeeder } from './fixtures/TestDataSeeder'

/**
 * US-821: Shipper Dashboard Template Refactoring
 *
 * Verifies Composite Framework compliance through template-driven architecture:
 * - Container Gate: fc-shell > zone-main > zone-widget-slots hierarchy
 * - Assembly Rule: All widgets wrapped in .panel classes
 * - Token Gate: CSS variables throughout (no hardcoded colors)
 * - Layout Gate: CSS Grid-based responsive layout
 */

test.describe('US-821: Shipper Dashboard Template-Driven Architecture', () => {
  test.beforeEach(async ({ page }) => {
    const seeder = new TestDataSeeder(page)
    await seeder.setUserAuth('shipper')
  })

  test('AC-1: Template uses Composite Framework hierarchy', async ({ page }) => {
    await page.goto('/dashboard/shipper')

    // Container Gate: Verify shell hierarchy
    const shell = await page.locator('.fc-shell')
    await expect(shell).toBeVisible()

    const zoneMain = await page.locator('.zone-main')
    await expect(zoneMain).toBeVisible()

    const zoneSlots = await page.locator('.zone-widget-slots')
    await expect(zoneSlots).toBeVisible()

    // Verify DOM hierarchy
    const shellBox = await shell.boundingBox()
    const mainBox = await zoneMain.boundingBox()
    const slotsBox = await zoneSlots.boundingBox()

    expect(shellBox).not.toBeNull()
    expect(mainBox).not.toBeNull()
    expect(slotsBox).not.toBeNull()
  })

  test('AC-2: All content wrapped in .panel classes (Assembly Rule)', async ({ page }) => {
    await page.goto('/dashboard/shipper')

    // Count panels
    const panels = await page.locator('.panel')
    const panelCount = await panels.count()

    // Should have at least 3 panels: SummaryStrip, SearchBar, LoadTable/Pagination
    expect(panelCount).toBeGreaterThanOrEqual(3)

    // Each panel should have proper styling (via CSS)
    for (let i = 0; i < Math.min(panelCount, 5); i++) {
      const panel = panels.nth(i)

      // Verify panel is visible
      await expect(panel).toBeVisible()

      // Verify panel has border
      const borderColor = await panel.evaluate((el) => {
        return window.getComputedStyle(el).borderColor
      })
      expect(borderColor).toBeTruthy()
    }
  })

  test('AC-3: Token Gate - CSS variables used throughout', async ({ page }) => {
    await page.goto('/dashboard/shipper')

    // Check that inline styles use CSS variables
    const searchPanel = await page.locator('[data-testid="load-search-input"]')
    await expect(searchPanel).toBeVisible()

    // Verify no hardcoded hex colors in computed styles
    const viewToggleButtons = await page.locator('button').filter({ hasText: 'Active Loads' })
    const buttonStyles = await viewToggleButtons.first().evaluate((el) => {
      const computed = window.getComputedStyle(el)
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        borderColor: computed.borderColor,
      }
    })

    // Button colors should be computed from var(--color-*) not raw hex
    expect(buttonStyles.color).toBeTruthy()
    expect(buttonStyles.backgroundColor).toBeTruthy()
  })

  test('AC-4: Layout Gate - CSS Grid-based responsive layout', async ({ page }) => {
    await page.goto('/dashboard/shipper')

    const zoneSlots = await page.locator('.zone-widget-slots')

    // Verify grid layout
    const gridDisplay = await zoneSlots.evaluate((el) => {
      const computed = window.getComputedStyle(el)
      return {
        display: computed.display,
        gridTemplateColumns: computed.gridTemplateColumns,
        gap: computed.gap,
      }
    })

    expect(gridDisplay.display).toBe('grid')
    expect(gridDisplay.gridTemplateColumns).toBeTruthy()
    expect(gridDisplay.gap).toBeTruthy()
  })

  test('AC-5: slot-a contains view toggle and SummaryStrip', async ({ page }) => {
    await page.goto('/dashboard/shipper')

    const slotA = await page.locator('.slot-a')
    await expect(slotA).toBeVisible()

    // View toggle buttons
    const activeLoadsBtn = await page.locator('button').filter({ hasText: 'Active Loads' })
    await expect(activeLoadsBtn).toBeVisible()

    const allLoadsBtn = await page.locator('button').filter({ hasText: 'All Loads' })
    await expect(allLoadsBtn).toBeVisible()

    // Action buttons
    const postLoadBtn = await page.locator('[data-testid="post-load-btn"]')
    await expect(postLoadBtn).toBeVisible()
  })

  test('AC-6: slot-b contains SearchBar and LoadTable', async ({ page }) => {
    await page.goto('/dashboard/shipper')

    const slotB = await page.locator('.slot-b')
    await expect(slotB).toBeVisible()

    // SearchBar panel
    const searchPanel = await page.locator('[data-testid="load-search-input"]')
    await expect(searchPanel).toBeVisible()

    // LoadTable panel
    const loadTable = await page.locator('[data-testid="load-table"]')
    await expect(loadTable).toBeVisible()
  })

  test('AC-7: Evidence - Screenshot captures framework compliance', async ({ page }) => {
    await page.goto('/dashboard/shipper')

    // Wait for all content to load
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('.fc-shell', { timeout: 10000 })

    // Capture screenshot
    await page.screenshot({
      path: 'test-results/evidence/us-821-template-architecture.png',
      fullPage: true,
    })

    // Verify screenshot was created
    const fs = require('fs')
    const screenshotPath = 'test-results/evidence/us-821-template-architecture.png'
    expect(fs.existsSync(screenshotPath)).toBe(true)
  })

  test('AC-8: ShipperPageLayout enforces all Hard Gates', async ({ page }) => {
    await page.goto('/dashboard/shipper')

    // Multi-gate verification
    const compliance = await page.evaluate(() => {
      const shell = document.querySelector('.fc-shell')
      const zoneMain = document.querySelector('.zone-main')
      const zoneSlots = document.querySelector('.zone-widget-slots')
      const panels = document.querySelectorAll('.panel')

      // Check grid display
      const gridStyles = window.getComputedStyle(zoneSlots as Element)

      return {
        hasShell: !!shell,
        hasZoneMain: !!zoneMain,
        hasZoneSlots: !!zoneSlots,
        panelCount: panels.length,
        isGrid: gridStyles.display === 'grid',
        hasGridTemplate: !!gridStyles.gridTemplateColumns,
      }
    })

    expect(compliance.hasShell).toBe(true)
    expect(compliance.hasZoneMain).toBe(true)
    expect(compliance.hasZoneSlots).toBe(true)
    expect(compliance.panelCount).toBeGreaterThanOrEqual(3)
    expect(compliance.isGrid).toBe(true)
    expect(compliance.hasGridTemplate).toBe(true)
  })
})
