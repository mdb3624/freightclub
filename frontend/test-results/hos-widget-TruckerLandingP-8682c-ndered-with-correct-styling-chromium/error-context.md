# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: hos-widget.spec.ts >> TruckerLandingPage CSS Migration >> navigation tabs rendered with correct styling
- Location: e2e\hos-widget.spec.ts:127:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]: MARKET LIVE
    - generic [ref=e7]:
      - generic [ref=e8]: "DIESEL NATL AVG: $3.89/gal"
      - generic [ref=e9]: "DRY VAN SPOT: $2.14 RPM"
      - generic [ref=e10]: "REEFER SPOT: $2.76 RPM"
      - generic [ref=e11]: "FLATBED SPOT: $2.38 RPM"
      - generic [ref=e12]: "DIESEL EAST: --"
      - generic [ref=e13]: "DIESEL MIDWEST: --"
      - generic [ref=e14]: "DIESEL SOUTH: --"
      - generic [ref=e15]: "DIESEL ROCKY: --"
      - generic [ref=e16]: "DIESEL WEST: --"
      - generic [ref=e17]: "LOAD-TO-TRUCK RATIO: 3.2:1"
      - generic [ref=e18]: "CA→TX CORRIDOR: HIGH VOLUME"
      - generic [ref=e19]: "MIDWEST REEFER: SEASONAL +12%"
      - generic [ref=e20]: "FMCSA HOS: 11HR DRIVE / 14HR DUTY"
      - generic [ref=e21]: "DATA: U.S. EIA"
      - generic [ref=e22]: "DIESEL NATL AVG: $3.89/gal"
      - generic [ref=e23]: "DRY VAN SPOT: $2.14 RPM"
      - generic [ref=e24]: "REEFER SPOT: $2.76 RPM"
      - generic [ref=e25]: "FLATBED SPOT: $2.38 RPM"
      - generic [ref=e26]: "DIESEL EAST: --"
      - generic [ref=e27]: "DIESEL MIDWEST: --"
      - generic [ref=e28]: "DIESEL SOUTH: --"
      - generic [ref=e29]: "DIESEL ROCKY: --"
      - generic [ref=e30]: "DIESEL WEST: --"
      - generic [ref=e31]: "LOAD-TO-TRUCK RATIO: 3.2:1"
      - generic [ref=e32]: "CA→TX CORRIDOR: HIGH VOLUME"
      - generic [ref=e33]: "MIDWEST REEFER: SEASONAL +12%"
      - generic [ref=e34]: "FMCSA HOS: 11HR DRIVE / 14HR DUTY"
      - generic [ref=e35]: "DATA: U.S. EIA"
  - banner [ref=e36]:
    - generic [ref=e37]: HAULER.
    - generic [ref=e38]:
      - generic [ref=e39]: FMCSA Compliant · HOS Tracking
      - generic [ref=e41]: Tue, May 19, 12:59 PM
  - navigation [ref=e42]:
    - generic [ref=e43] [cursor=pointer]: 📦 Load Analyzer
    - generic [ref=e44] [cursor=pointer]: 💰 CPM Calculator
    - generic [ref=e45] [cursor=pointer]: 📋 Broker Comms
    - generic [ref=e46] [cursor=pointer]: 📊 Load Log
  - generic [ref=e48]:
    - generic [ref=e49]: Load Profitability Analyzer
    - generic [ref=e50]: Enter load details to get full RPM analysis, deadhead cost, and GO / NO-GO verdict
    - generic [ref=e51]:
      - generic [ref=e52]:
        - generic [ref=e53]: Load Details
        - generic [ref=e54]:
          - generic [ref=e55]:
            - generic [ref=e56]: Origin City, State
            - textbox "e.g. Chicago, IL" [ref=e57]
          - generic [ref=e58]:
            - generic [ref=e59]: Destination City, State
            - textbox "e.g. Dallas, TX" [ref=e60]
        - generic [ref=e61]:
          - generic [ref=e62]:
            - generic [ref=e63]: Loaded Miles
            - spinbutton [ref=e64]
          - generic [ref=e65]:
            - generic [ref=e66]: Deadhead (DH) Miles
            - spinbutton [ref=e67]
        - generic [ref=e68]:
          - generic [ref=e69]:
            - generic [ref=e70]: Broker Offered Rate ($)
            - spinbutton [ref=e71]
          - generic [ref=e72]:
            - generic [ref=e73]: Equipment Type
            - combobox [ref=e74]:
              - option "Dry Van" [selected]
              - option "Reefer"
              - option "Flatbed"
              - option "Step Deck"
        - generic [ref=e75]:
          - generic [ref=e76]:
            - generic [ref=e77]: Your CPM ($)
            - spinbutton [ref=e78]
          - generic [ref=e79]:
            - generic [ref=e80]: Fuel Surcharge ($)
            - spinbutton [ref=e81]: "0"
          - generic [ref=e82]:
            - generic [ref=e83]: Accessorials ($)
            - spinbutton [ref=e84]: "0"
        - generic [ref=e85]:
          - generic [ref=e86]:
            - generic [ref=e87]: Estimated Transit Days
            - spinbutton [ref=e88]: "1"
          - generic [ref=e89]:
            - generic [ref=e90]: Market RPM for Lane ($)
            - spinbutton [ref=e91]
        - button "ANALYZE LOAD →" [ref=e92] [cursor=pointer]
      - generic [ref=e93]:
        - generic [ref=e94]: 🚛
        - generic [ref=e95]: Enter load details to begin analysis
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | const BASE_URL = ''
  4   | 
  5   | test.describe('HOS Widget Component', () => {
  6   | 
  7   |   test('HosWidget compiles without TypeScript errors', async ({ page }) => {
  8   |     // Navigate to a page and check for console errors
  9   |     await page.goto(`${BASE_URL}/`)
  10  | 
  11  |     const errors: string[] = []
  12  |     page.on('console', (msg) => {
  13  |       if (msg.type() === 'error') errors.push(msg.text())
  14  |     })
  15  | 
  16  |     // Wait a bit for any errors to appear
  17  |     await page.waitForTimeout(2000)
  18  | 
  19  |     // Should have no TypeScript/compilation errors in console
  20  |     const typeErrors = errors.filter(e => e.includes('HosWidget') || e.includes('useHosState'))
  21  |     expect(typeErrors.length).toBe(0)
  22  |   })
  23  | 
  24  |   test('TruckerLandingPage CSS migration complete', async ({ page }) => {
  25  |     // Verify TruckerLandingPage loads and CSS classes are applied
  26  |     await page.goto(`${BASE_URL}/`)
  27  | 
  28  |     // Check for CSS classes (from migration)
  29  |     const tickerWrap = page.locator('div.ticker-wrap')
  30  |     await expect(tickerWrap).toBeVisible({ timeout: 5000 })
  31  | 
  32  |     const tickerItems = page.locator('.ticker-item')
  33  |     const count = await tickerItems.count()
  34  |     expect(count).toBeGreaterThan(0)
  35  |   })
  36  | 
  37  |   test('TruckerLandingPage ticker styling uses CSS classes', async ({ page }) => {
  38  |     await page.goto(`${BASE_URL}/`)
  39  | 
  40  |     // Verify ticker delta indicators use CSS classes (not inline styles)
  41  |     const deltas = page.locator('.ticker-delta')
  42  |     const deltaCount = await deltas.count()
  43  | 
  44  |     if (deltaCount > 0) {
  45  |       const firstDelta = deltas.first()
  46  |       const classes = await firstDelta.getAttribute('class')
  47  |       expect(classes).toMatch(/ticker-delta/)
  48  |       expect(classes).toMatch(/(up|down)/)
  49  |     }
  50  |   })
  51  | 
  52  |   test('Page renders without CSS migration regressions', async ({ page }) => {
  53  |     await page.goto(`${BASE_URL}/`)
  54  | 
  55  |     // Check that main layout elements are visible
  56  |     const header = page.locator('header')
  57  |     await expect(header).toBeVisible({ timeout: 5000 })
  58  | 
  59  |     // No unhandled exceptions
  60  |     const exceptions: string[] = []
  61  |     page.on('console', (msg) => {
  62  |       if (msg.type() === 'error' && msg.text().includes('style')) {
  63  |         exceptions.push(msg.text())
  64  |       }
  65  |     })
  66  | 
  67  |     await page.waitForTimeout(1000)
  68  |     expect(exceptions.length).toBe(0)
  69  |   })
  70  | })
  71  | 
  72  | test.describe('TruckerLandingPage CSS Migration', () => {
  73  |   test.beforeEach(async ({ page }) => {
  74  |     // TruckerLandingPage is the main entry for truckers
  75  |     await page.goto(BASE_URL)
> 76  |     await page.waitForLoadState('networkidle')
      |                ^ Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
  77  |   })
  78  | 
  79  |   test('renders page without errors', async ({ page }) => {
  80  |     // Check for JavaScript errors
  81  |     const errors: string[] = []
  82  |     page.on('console', (msg) => {
  83  |       if (msg.type() === 'error') errors.push(msg.text())
  84  |     })
  85  | 
  86  |     // Page should load without error-level logs
  87  |     expect(errors.length).toBe(0)
  88  |   })
  89  | 
  90  |   test('displays HAULER header', async ({ page }) => {
  91  |     const logo = page.locator('div.logo:has-text("HAULER")')
  92  |     await expect(logo).toBeVisible()
  93  |   })
  94  | 
  95  |   test('displays market ticker with CSS classes', async ({ page }) => {
  96  |     const ticker = page.locator('div.ticker-wrap')
  97  |     await expect(ticker).toBeVisible()
  98  | 
  99  |     const tickerItems = page.locator('.ticker-item')
  100 |     const count = await tickerItems.count()
  101 |     expect(count).toBeGreaterThan(0)
  102 |   })
  103 | 
  104 |   test('ticker items have delta indicators with correct classes', async ({ page }) => {
  105 |     const deltas = page.locator('.ticker-delta')
  106 |     const deltaCount = await deltas.count()
  107 | 
  108 |     if (deltaCount > 0) {
  109 |       const firstDelta = deltas.first()
  110 |       const classes = await firstDelta.getAttribute('class')
  111 |       expect(classes).toMatch(/ticker-delta\s+(up|down)/)
  112 |     }
  113 |   })
  114 | 
  115 |   test('CSS classes applied (not inline styles) to ticker', async ({ page }) => {
  116 |     const tickerWrap = page.locator('div.ticker-wrap')
  117 | 
  118 |     // Check that ticker-wrap uses CSS classes, not inline styles
  119 |     const style = await tickerWrap.getAttribute('style')
  120 |     // Should be null or empty (no inline styles)
  121 |     if (style) {
  122 |       expect(style).not.toContain('flex')
  123 |       expect(style).not.toContain('overflow')
  124 |     }
  125 |   })
  126 | 
  127 |   test('navigation tabs rendered with correct styling', async ({ page }) => {
  128 |     const navTabs = page.locator('.nav-tab')
  129 |     const count = await navTabs.count()
  130 |     expect(count).toBeGreaterThan(0)
  131 | 
  132 |     // First tab should be visible
  133 |     const firstTab = navTabs.first()
  134 |     await expect(firstTab).toBeVisible()
  135 |   })
  136 | 
  137 |   test('main content area renders', async ({ page }) => {
  138 |     const main = page.locator('div.main')
  139 |     await expect(main).toBeVisible()
  140 |   })
  141 | 
  142 |   test('responsive layout (desktop viewport)', async ({ page }) => {
  143 |     await page.setViewportSize({ width: 1920, height: 1080 })
  144 | 
  145 |     const header = page.locator('header')
  146 |     const main = page.locator('div.main')
  147 | 
  148 |     await expect(header).toBeVisible()
  149 |     await expect(main).toBeVisible()
  150 |   })
  151 | 
  152 |   test('responsive layout (mobile viewport)', async ({ page }) => {
  153 |     await page.setViewportSize({ width: 375, height: 667 })
  154 | 
  155 |     const header = page.locator('header')
  156 |     const main = page.locator('div.main')
  157 | 
  158 |     await expect(header).toBeVisible()
  159 |     await expect(main).toBeVisible()
  160 |   })
  161 | })
  162 | 
```