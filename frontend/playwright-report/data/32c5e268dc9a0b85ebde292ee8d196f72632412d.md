# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: hos-widget.spec.ts >> HOS Widget Component >> TruckerLandingPage CSS migration complete
- Location: e2e\hos-widget.spec.ts:24:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('div.ticker-wrap')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('div.ticker-wrap')

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
> 30  |     await expect(tickerWrap).toBeVisible({ timeout: 5000 })
      |                              ^ Error: expect(locator).toBeVisible() failed
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
  76  |     await page.waitForLoadState('networkidle')
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
```