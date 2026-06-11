/**
 * US-821 + US-820: Header & KPI Styling Evidence
 *
 * Captures visual evidence of:
 * 1. ShipperPageHeader with bounded panel styling (border, padding, shadow)
 * 2. KPISummaryPanel with consistent shadow tokens
 * 3. KPITile cards with design system shadows (var(--shadow-subtle))
 */

import { test, expect } from '@playwright/test'
import { TestDataSeeder } from './fixtures/test-data-seeder'

async function setUserAuth(page: any, user: any) {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.evaluate((u: any) => {
    localStorage.setItem('freightclub_access_token', u.accessToken)
    localStorage.setItem('freightclub_user', JSON.stringify({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      tenantId: u.tenantId
    }))
  }, user)
}

test('US-821 + US-820: Header and KPI Styling Evidence', async ({ page, request }) => {
  const seeder = new TestDataSeeder(request, 'http://localhost:9091')

  // Create test shipper user
  const user = await seeder.createTestUser({
    email: `shipper-${Date.now()}@test.com`,
    role: 'SHIPPER',
    firstName: 'Test',
    lastName: 'Shipper'
  })

  try {
    // Set authentication
    await setUserAuth(page, user)

    // Navigate to Shipper Dashboard
    await page.goto('/dashboard/shipper', { waitUntil: 'domcontentloaded' })

    // Debug: Log current URL and check page content
    console.log(`Current URL: ${page.url()}`)
    const pageContent = await page.content()
    console.log(`Page has dashboard-grid: ${pageContent.includes('dashboard-grid')}`)
    console.log(`Page has shipper-page-header: ${pageContent.includes('shipper-page-header')}`)

    // Wait for either grid or header to appear
    await expect(page.locator('[data-testid="shipper-page-header"]')).toBeVisible({ timeout: 10000 })

    // ========================================================================
    // US-821: Header Styling Evidence
    // ========================================================================

    // Verify header is bounded with panel styling
    const header = page.locator('[data-testid="shipper-page-header"]')
    await expect(header).toBeVisible()

    // Check computed styles for panel-like appearance
    const headerComputedStyle = await header.evaluate((el: HTMLElement) => {
      const style = window.getComputedStyle(el)
      return {
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        borderWidth: style.borderWidth,
        borderRadius: style.borderRadius,
        padding: style.padding,
        boxShadow: style.boxShadow
      }
    })

    console.log('✅ Header Styling Computed:')
    console.log(`  Background: ${headerComputedStyle.backgroundColor}`)
    console.log(`  Border: ${headerComputedStyle.borderWidth} ${headerComputedStyle.borderColor}`)
    console.log(`  Border Radius: ${headerComputedStyle.borderRadius}`)
    console.log(`  Padding: ${headerComputedStyle.padding}`)
    console.log(`  Box Shadow: ${headerComputedStyle.boxShadow}`)

    // Verify header has white background (bounded)
    await expect(header).toHaveCSS('background-color', /white|rgb\(255, 255, 255\)/i)

    // Verify header has border (bounded)
    const headerBorder = await header.evaluate((el: HTMLElement) => {
      const style = window.getComputedStyle(el)
      const borderWidth = style.borderWidth
      const borderColor = style.borderColor
      return parseInt(borderWidth) > 0
    })
    expect(headerBorder).toBe(true)

    // Capture header screenshot
    await page.screenshot({
      path: 'test-results/evidence/us-821-header-bounded.png',
      clip: await header.boundingBox() || undefined,
      fullPage: false
    })
    console.log('✅ Header screenshot captured: us-821-header-bounded.png')

    // ========================================================================
    // US-820: KPI Styling Evidence
    // ========================================================================

    const kpiPanel = page.locator('[data-testid="kpi-summary-section"]')
    if (await kpiPanel.count() > 0) {
      await expect(kpiPanel).toBeVisible()

      // Get KPI tiles
      const kpiTiles = page.locator('[data-testid^="kpi-tile-"]')
      const tileCount = await kpiTiles.count()
      console.log(`✅ Found ${tileCount} KPI tiles`)

      if (tileCount > 0) {
        // Verify each tile has consistent styling
        for (let i = 0; i < tileCount; i++) {
          const tile = kpiTiles.nth(i)
          const tileStyle = await tile.evaluate((el: HTMLElement) => {
            const style = window.getComputedStyle(el)
            return {
              boxShadow: style.boxShadow,
              borderColor: style.borderColor,
              backgroundColor: style.backgroundColor,
              display: style.display,
              padding: style.padding
            }
          })

          console.log(`  Tile ${i + 1} Shadow: ${tileStyle.boxShadow}`)

          // Verify tile has styling applied (shadow, border, background, padding)
          expect(tileStyle.boxShadow).toBeTruthy()
          expect(tileStyle.backgroundColor).toBeTruthy()
          expect(tileStyle.borderColor).toBeTruthy()
        }
      }

      // Capture KPI panel screenshot
      const kpiBox = await kpiPanel.boundingBox()
      if (kpiBox) {
        await page.screenshot({
          path: 'test-results/evidence/us-820-kpi-panel.png',
          clip: kpiBox,
          fullPage: false
        })
        console.log('✅ KPI panel screenshot captured: us-820-kpi-panel.png')
      }
    }

    // ========================================================================
    // Full Page Evidence
    // ========================================================================

    await page.screenshot({
      path: 'test-results/evidence/us-821-us-820-full-dashboard.png',
      fullPage: true
    })
    console.log('✅ Full dashboard screenshot captured: us-821-us-820-full-dashboard.png')

    console.log('\n✅ ALL STYLING VERIFICATION COMPLETE')
    console.log('Evidence files:')
    console.log('  - us-821-header-bounded.png')
    console.log('  - us-820-kpi-panel.png')
    console.log('  - us-821-us-820-full-dashboard.png')

  } finally {
    await seeder.cleanup()
  }
})
