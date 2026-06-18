# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: us-821-shipper-dashboard-evidence.spec.ts >> US-821: Generate Shipper Dashboard Refactoring Evidence
- Location: e2e\us-821-shipper-dashboard-evidence.spec.ts:19:1

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
  7   |  * US-821: Shipper Dashboard Template Architecture Evidence
  8   |  *
  9   |  * Generates visual evidence that ShipperDashboard has been successfully
  10  |  * refactored to use the ShipperPageLayout template component.
  11  |  *
  12  |  * Evidence includes:
  13  |  * 1. Component file verification (ShipperPageLayout exists and exports correctly)
  14  |  * 2. Dashboard refactor verification (uses template, no inline shells)
  15  |  * 3. Architecture compliance audit (all hard gates verified)
  16  |  * 4. Visual evidence (code comparison before/after)
  17  |  */
  18  | 
  19  | test('US-821: Generate Shipper Dashboard Refactoring Evidence', () => {
  20  |   const __dirname = path.dirname(fileURLToPath(import.meta.url))
  21  | 
  22  |   const layoutPath = path.resolve(
  23  |     __dirname,
  24  |     '../src/features/shipper/components/ShipperPageLayout.tsx'
  25  |   )
  26  |   const dashboardPath = path.resolve(__dirname, '../src/pages/ShipperDashboard.tsx')
  27  | 
  28  |   const layoutContent = fs.readFileSync(layoutPath, 'utf-8')
  29  |   const dashboardContent = fs.readFileSync(dashboardPath, 'utf-8')
  30  | 
  31  |   // ============================================================
  32  |   // EVIDENCE 1: ShipperPageLayout Component Exists
  33  |   // ============================================================
  34  |   expect(fs.existsSync(layoutPath)).toBe(true)
  35  |   expect(layoutContent).toContain('export function ShipperPageLayout')
  36  |   expect(layoutContent).toContain('interface ShipperPageLayoutProps')
  37  | 
  38  |   // Verify component enforces framework structure
  39  |   expect(layoutContent).toContain('fc-shell')
  40  |   expect(layoutContent).toContain('zone-main')
  41  |   expect(layoutContent).toContain('zone-widget-slots')
  42  |   expect(layoutContent).toContain('slot-a')
  43  |   expect(layoutContent).toContain('slot-b')
  44  |   expect(layoutContent).toContain('slot-c')
  45  | 
  46  |   // ============================================================
  47  |   // EVIDENCE 2: ShipperDashboard Uses Template
  48  |   // ============================================================
  49  |   expect(fs.existsSync(dashboardPath)).toBe(true)
> 50  |   expect(dashboardContent).toContain('import { ShipperPageLayout }')
      |                            ^ Error: expect(received).toContain(expected) // indexOf
  51  |   expect(dashboardContent).toContain('<ShipperPageLayout')
  52  | 
  53  |   // Verify no inline fc-shell (refactored away)
  54  |   const inlineShellPattern = /return[\s\S]*?<div className="fc-shell"/
  55  |   const hasInlineShell = dashboardContent.match(inlineShellPattern)
  56  |   expect(hasInlineShell).toBeNull()
  57  | 
  58  |   // ============================================================
  59  |   // EVIDENCE 3: Architecture Compliance Verified
  60  |   // ============================================================
  61  |   const cssPath = path.resolve(__dirname, '../src/index.css')
  62  |   const cssContent = fs.readFileSync(cssPath, 'utf-8')
  63  | 
  64  |   // Token Gate: CSS variables defined
  65  |   expect(cssContent).toContain('--color-brand-bronze')
  66  |   expect(cssContent).toContain('--color-surface-white')
  67  |   expect(cssContent).toContain('--space-lg')
  68  | 
  69  |   // Token Gate: No hardcoded colors in dashboard
  70  |   const hardcodedColors = dashboardContent.match(/bg-(blue|red|green|gray|yellow)-\d+/g)
  71  |   expect(hardcodedColors).toBeNull()
  72  | 
  73  |   // Assembly Rule: Panel wrapping present
  74  |   const panelMatches = dashboardContent.match(/className="panel"/g)
  75  |   expect(panelMatches).not.toBeNull()
  76  |   expect(panelMatches!.length).toBeGreaterThanOrEqual(3)
  77  | 
  78  |   // ============================================================
  79  |   // EVIDENCE 4: Generate Documentation
  80  |   // ============================================================
  81  |   const evidenceMarkdown = `# US-821: Shipper Dashboard Template Architecture — Evidence
  82  | 
  83  | ## Summary
  84  | ShipperDashboard has been successfully refactored to use ShipperPageLayout template component.
  85  | 
  86  | ## Verification Results
  87  | 
  88  | ### ✅ Component Implementation
  89  | - **ShipperPageLayout Component:** ✓ Exists and exports correctly
  90  | - **Framework Hierarchy:** ✓ Enforces fc-shell > zone-main > zone-widget-slots
  91  | - **Slot System:** ✓ Supports slot-a, slot-b, slot-c for content injection
  92  | 
  93  | ### ✅ Dashboard Refactoring
  94  | - **Template Usage:** ✓ ShipperDashboard imports and uses ShipperPageLayout
  95  | - **Inline Shells Removed:** ✓ No inline \`<div className="fc-shell">\` found
  96  | - **Clean Composition:** ✓ Content extracted to slot functions (slotA, slotB)
  97  | 
  98  | ### ✅ Hard Gates Compliance
  99  | 
  100 | #### Container Gate ✅
  101 | - fc-shell hierarchy defined in ShipperPageLayout
  102 | - zone-main wraps all page content
  103 | - zone-widget-slots implements 12-column grid
  104 | - Slots (a/b/c) properly positioned
  105 | 
  106 | #### Assembly Rule ✅
  107 | - ≥3 \`.panel\` class wrappers found in ShipperDashboard
  108 | - SummaryStrip, SearchBar, LoadTable, Pagination all wrapped
  109 | - Standard styling enforced (background, border, shadow, padding, radius)
  110 | 
  111 | #### Token Gate ✅
  112 | - CSS variables defined in index.css
  113 | - Zero hardcoded hex colors (#FFFFFF, #1A1A1A, etc.)
  114 | - Zero hardcoded Tailwind utilities (bg-blue-600, text-gray-200, etc.)
  115 | - All styling uses \`var(--color-*)\`, \`var(--space-*)\`, \`var(--radius-*)\`
  116 | 
  117 | #### Layout Gate ✅
  118 | - CSS Grid-based layout (not flexbox for main structure)
  119 | - Grid system defined: 12-column template
  120 | - No absolute positioning in main layout
  121 | - Responsive gaps using CSS variables
  122 | 
  123 | ## File Changes
  124 | 
  125 | ### Created: ShipperPageLayout Component
  126 | \`\`\`
  127 | frontend/src/features/shipper/components/ShipperPageLayout.tsx
  128 | \`\`\`
  129 | - Encapsulates framework structure
  130 | - Supports prop-based slot content injection
  131 | - Enforces assembly rules at template level
  132 | 
  133 | ### Modified: ShipperDashboard Page
  134 | \`\`\`
  135 | frontend/src/pages/ShipperDashboard.tsx
  136 | \`\`\`
  137 | - Removed: Inline fc-shell structure
  138 | - Removed: Manual zone-widget-slots construction
  139 | - Added: ShipperPageLayout import
  140 | - Added: Slot content extraction functions
  141 | - Refactored: All Tailwind colors → CSS tokens
  142 | 
  143 | ## Test Results
  144 | 
  145 | ### Architecture Compliance Tests: 8/8 PASSED
  146 | - AC-1: Framework hierarchy verified ✓
  147 | - AC-2: Template-driven approach verified ✓
  148 | - AC-3: Token variables defined ✓
  149 | - AC-4: No hardcoded colors ✓
  150 | - AC-5: Panel wrapping verified ✓
```