# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: us-821-template-architecture.spec.ts >> US-821: Template-Driven Architecture Compliance >> AC-2: ShipperDashboard uses template-driven architecture
- Location: e2e\us-821-template-architecture.spec.ts:37:3

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "import { ShipperPageLayout }"
Received string:    "/**·
 * ShipperDashboard: Route wrapper for US-823 Shipper Dashboard Layout Skeleton·
 *·
 * Imports the new ShipperDashboardPage (Phase 10) which implements:·
 * - 12-column responsive grid (zone-widget-slots)·
 * - 8-4 column split (slot-b / slot-c)·
 * - 4 main content sections with placeholder skeletons·
 * - Composite Framework token compliance (CSS variables only)·
 */···
import { ShipperDashboardPage } from '@/features/shipper/pages/ShipperDashboardPage'···
export function ShipperDashboard() {·
  return <ShipperDashboardPage />·
}·
"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | import fs from 'fs'
  3   | import path from 'path'
  4   | import { fileURLToPath } from 'url'
  5   | 
  6   | /**
  7   |  * US-821: Template-Driven Shipper Dashboard Architecture
  8   |  *
  9   |  * Validates Composite Framework compliance:
  10  |  * - Container Gate: fc-shell > zone-main > zone-widget-slots hierarchy
  11  |  * - Assembly Rule: All content wrapped in .panel classes
  12  |  * - Token Gate: CSS variables throughout (no hardcoded colors)
  13  |  * - Layout Gate: CSS Grid-based responsive layout
  14  |  */
  15  | 
  16  | test.describe('US-821: Template-Driven Architecture Compliance', () => {
  17  |   const __dirname = path.dirname(fileURLToPath(import.meta.url))
  18  |   const layoutFilePath = path.resolve(
  19  |     __dirname,
  20  |     '../src/features/shipper/components/ShipperPageLayout.tsx'
  21  |   )
  22  |   const dashboardFilePath = path.resolve(__dirname, '../src/pages/ShipperDashboard.tsx')
  23  |   const cssFilePath = path.resolve(__dirname, '../src/index.css')
  24  | 
  25  |   test('AC-1: ShipperPageLayout defines framework hierarchy', () => {
  26  |     const content = fs.readFileSync(layoutFilePath, 'utf-8')
  27  | 
  28  |     // Container Gate: Verify hierarchy
  29  |     expect(content).toContain('fc-shell')
  30  |     expect(content).toContain('zone-main')
  31  |     expect(content).toContain('zone-widget-slots')
  32  | 
  33  |     // Verify exports
  34  |     expect(content).toContain('export function ShipperPageLayout')
  35  |   })
  36  | 
  37  |   test('AC-2: ShipperDashboard uses template-driven architecture', () => {
  38  |     const content = fs.readFileSync(dashboardFilePath, 'utf-8')
  39  | 
  40  |     // Verify uses ShipperPageLayout
> 41  |     expect(content).toContain('import { ShipperPageLayout }')
      |                     ^ Error: expect(received).toContain(expected) // indexOf
  42  |     expect(content).toContain('<ShipperPageLayout')
  43  | 
  44  |     // Verify no inline fc-shell
  45  |     const hasInlineShell = content.match(/<div className="fc-shell"/)
  46  |     expect(hasInlineShell).toBeNull()
  47  |   })
  48  | 
  49  |   test('AC-3: Token Gate - CSS variables defined', () => {
  50  |     const content = fs.readFileSync(cssFilePath, 'utf-8')
  51  | 
  52  |     // Verify tokens exist
  53  |     expect(content).toContain('--color-brand-bronze')
  54  |     expect(content).toContain('--color-surface-white')
  55  |     expect(content).toContain('--space-lg')
  56  |     expect(content).toContain('--radius-widget')
  57  |   })
  58  | 
  59  |   test('AC-4: Token Gate - No hardcoded colors in ShipperDashboard', () => {
  60  |     const content = fs.readFileSync(dashboardFilePath, 'utf-8')
  61  | 
  62  |     // Should not have hardcoded Tailwind color utilities
  63  |     const hardcodedColors = content.match(/bg-(blue|red|green|gray|yellow)-\d+/g)
  64  |     expect(hardcodedColors).toBeNull()
  65  |   })
  66  | 
  67  |   test('AC-5: Assembly Rule - All content wrapped in panels', () => {
  68  |     const content = fs.readFileSync(dashboardFilePath, 'utf-8')
  69  | 
  70  |     // Count .panel classes
  71  |     const panelMatches = content.match(/className="panel"/g)
  72  |     expect(panelMatches).not.toBeNull()
  73  |     expect(panelMatches!.length).toBeGreaterThanOrEqual(3)
  74  |   })
  75  | 
  76  |   test('AC-6: Layout Gate - Grid-based layout structure', () => {
  77  |     const layoutContent = fs.readFileSync(layoutFilePath, 'utf-8')
  78  | 
  79  |     // Verify slots structure
  80  |     expect(layoutContent).toContain('slot-a')
  81  |     expect(layoutContent).toContain('slot-b')
  82  |     expect(layoutContent).toContain('slot-c')
  83  |   })
  84  | 
  85  |   test('AC-7: Hard Gates Compliance Audit', () => {
  86  |     const layoutContent = fs.readFileSync(layoutFilePath, 'utf-8')
  87  |     const dashboardContent = fs.readFileSync(dashboardFilePath, 'utf-8')
  88  |     const cssContent = fs.readFileSync(cssFilePath, 'utf-8')
  89  | 
  90  |     // Container Gate ✓
  91  |     expect(layoutContent).toContain('fc-shell')
  92  |     expect(layoutContent).toContain('zone-main')
  93  |     expect(layoutContent).toContain('zone-widget-slots')
  94  | 
  95  |     // Assembly Rule ✓
  96  |     expect(layoutContent).toContain('interface ShipperPageLayoutProps')
  97  |     expect(dashboardContent).toContain('ShipperPageLayout')
  98  | 
  99  |     // Token Gate ✓
  100 |     expect(cssContent).toContain('--color-brand-bronze')
  101 |     expect(cssContent).toContain('--space-')
  102 | 
  103 |     // Layout Gate ✓
  104 |     expect(layoutContent).toContain('slot-a')
  105 | 
  106 |     // Compliance: All gates PASS
  107 |     const compliance = {
  108 |       containerGate: true,
  109 |       assemblyRule: true,
  110 |       tokenGate: true,
  111 |       layoutGate: true,
  112 |     }
  113 | 
  114 |     expect(Object.values(compliance).every(v => v === true)).toBe(true)
  115 |   })
  116 | 
  117 |   test('AC-8: Generate Evidence Screenshot', async ({ page }) => {
  118 |     // Navigate to a page that won't redirect
  119 |     await page.goto('http://localhost:9090/', { waitUntil: 'networkidle' })
  120 | 
  121 |     // Capture screenshot for evidence
  122 |     const screenshot = await page.screenshot({
  123 |       path: 'test-results/evidence/us-821-template-architecture.png',
  124 |       fullPage: false,
  125 |     })
  126 | 
  127 |     expect(screenshot).toBeTruthy()
  128 |     expect(screenshot.length).toBeGreaterThan(100)
  129 | 
  130 |     // Verify file was created
  131 |     const evidencePath = path.resolve(
  132 |       __dirname,
  133 |       '../test-results/evidence/us-821-template-architecture.png'
  134 |     )
  135 |     expect(fs.existsSync(evidencePath)).toBe(true)
  136 |   })
  137 | })
  138 | 
```