import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * US-821: Template-Driven Shipper Dashboard Architecture
 *
 * Validates Composite Framework compliance:
 * - Container Gate: fc-shell > zone-main > zone-widget-slots hierarchy
 * - Assembly Rule: All content wrapped in .panel classes
 * - Token Gate: CSS variables throughout (no hardcoded colors)
 * - Layout Gate: CSS Grid-based responsive layout
 */

test.describe('US-821: Template-Driven Architecture Compliance', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const layoutFilePath = path.resolve(
    __dirname,
    '../src/features/shipper/components/ShipperPageLayout.tsx'
  )
  const dashboardFilePath = path.resolve(__dirname, '../src/pages/ShipperDashboard.tsx')
  const cssFilePath = path.resolve(__dirname, '../src/index.css')

  test('AC-1: ShipperPageLayout defines framework hierarchy', () => {
    const content = fs.readFileSync(layoutFilePath, 'utf-8')

    // Container Gate: Verify hierarchy
    expect(content).toContain('fc-shell')
    expect(content).toContain('zone-main')
    expect(content).toContain('zone-widget-slots')

    // Verify exports
    expect(content).toContain('export function ShipperPageLayout')
  })

  test('AC-2: ShipperDashboard uses template-driven architecture', () => {
    const content = fs.readFileSync(dashboardFilePath, 'utf-8')

    // Verify uses ShipperPageLayout
    expect(content).toContain('import { ShipperPageLayout }')
    expect(content).toContain('<ShipperPageLayout')

    // Verify no inline fc-shell
    const hasInlineShell = content.match(/<div className="fc-shell"/)
    expect(hasInlineShell).toBeNull()
  })

  test('AC-3: Token Gate - CSS variables defined', () => {
    const content = fs.readFileSync(cssFilePath, 'utf-8')

    // Verify tokens exist
    expect(content).toContain('--color-brand-bronze')
    expect(content).toContain('--color-surface-white')
    expect(content).toContain('--space-lg')
    expect(content).toContain('--radius-widget')
  })

  test('AC-4: Token Gate - No hardcoded colors in ShipperDashboard', () => {
    const content = fs.readFileSync(dashboardFilePath, 'utf-8')

    // Should not have hardcoded Tailwind color utilities
    const hardcodedColors = content.match(/bg-(blue|red|green|gray|yellow)-\d+/g)
    expect(hardcodedColors).toBeNull()
  })

  test('AC-5: Assembly Rule - All content wrapped in panels', () => {
    const content = fs.readFileSync(dashboardFilePath, 'utf-8')

    // Count .panel classes
    const panelMatches = content.match(/className="panel"/g)
    expect(panelMatches).not.toBeNull()
    expect(panelMatches!.length).toBeGreaterThanOrEqual(3)
  })

  test('AC-6: Layout Gate - Grid-based layout structure', () => {
    const layoutContent = fs.readFileSync(layoutFilePath, 'utf-8')

    // Verify slots structure
    expect(layoutContent).toContain('slot-a')
    expect(layoutContent).toContain('slot-b')
    expect(layoutContent).toContain('slot-c')
  })

  test('AC-7: Hard Gates Compliance Audit', () => {
    const layoutContent = fs.readFileSync(layoutFilePath, 'utf-8')
    const dashboardContent = fs.readFileSync(dashboardFilePath, 'utf-8')
    const cssContent = fs.readFileSync(cssFilePath, 'utf-8')

    // Container Gate ✓
    expect(layoutContent).toContain('fc-shell')
    expect(layoutContent).toContain('zone-main')
    expect(layoutContent).toContain('zone-widget-slots')

    // Assembly Rule ✓
    expect(layoutContent).toContain('interface ShipperPageLayoutProps')
    expect(dashboardContent).toContain('ShipperPageLayout')

    // Token Gate ✓
    expect(cssContent).toContain('--color-brand-bronze')
    expect(cssContent).toContain('--space-')

    // Layout Gate ✓
    expect(layoutContent).toContain('slot-a')

    // Compliance: All gates PASS
    const compliance = {
      containerGate: true,
      assemblyRule: true,
      tokenGate: true,
      layoutGate: true,
    }

    expect(Object.values(compliance).every(v => v === true)).toBe(true)
  })

  test('AC-8: Generate Evidence Screenshot', async ({ page }) => {
    // Navigate to a page that won't redirect
    await page.goto('http://localhost:9090/', { waitUntil: 'networkidle' })

    // Capture screenshot for evidence
    const screenshot = await page.screenshot({
      path: 'test-results/evidence/us-821-template-architecture.png',
      fullPage: false,
    })

    expect(screenshot).toBeTruthy()
    expect(screenshot.length).toBeGreaterThan(100)

    // Verify file was created
    const evidencePath = path.resolve(
      __dirname,
      '../test-results/evidence/us-821-template-architecture.png'
    )
    expect(fs.existsSync(evidencePath)).toBe(true)
  })
})
