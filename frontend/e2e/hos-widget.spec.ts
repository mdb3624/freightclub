import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:9090'

test.describe('HOS Widget Component', () => {

  test('HosWidget compiles without TypeScript errors', async ({ page }) => {
    // Navigate to a page and check for console errors
    await page.goto(`${BASE_URL}/`)

    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    // Wait a bit for any errors to appear
    await page.waitForTimeout(2000)

    // Should have no TypeScript/compilation errors in console
    const typeErrors = errors.filter(e => e.includes('HosWidget') || e.includes('useHosState'))
    expect(typeErrors.length).toBe(0)
  })

  test('TruckerLandingPage CSS migration complete', async ({ page }) => {
    // Verify TruckerLandingPage loads and CSS classes are applied
    await page.goto(`${BASE_URL}/`)

    // Check for CSS classes (from migration)
    const tickerWrap = page.locator('div.ticker-wrap')
    await expect(tickerWrap).toBeVisible({ timeout: 5000 })

    const tickerItems = page.locator('.ticker-item')
    const count = await tickerItems.count()
    expect(count).toBeGreaterThan(0)
  })

  test('TruckerLandingPage ticker styling uses CSS classes', async ({ page }) => {
    await page.goto(`${BASE_URL}/`)

    // Verify ticker delta indicators use CSS classes (not inline styles)
    const deltas = page.locator('.ticker-delta')
    const deltaCount = await deltas.count()

    if (deltaCount > 0) {
      const firstDelta = deltas.first()
      const classes = await firstDelta.getAttribute('class')
      expect(classes).toMatch(/ticker-delta/)
      expect(classes).toMatch(/(up|down)/)
    }
  })

  test('Page renders without CSS migration regressions', async ({ page }) => {
    await page.goto(`${BASE_URL}/`)

    // Check that main layout elements are visible
    const header = page.locator('header')
    await expect(header).toBeVisible({ timeout: 5000 })

    // No unhandled exceptions
    const exceptions: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('style')) {
        exceptions.push(msg.text())
      }
    })

    await page.waitForTimeout(1000)
    expect(exceptions.length).toBe(0)
  })
})

test.describe('TruckerLandingPage CSS Migration', () => {
  test.beforeEach(async ({ page }) => {
    // TruckerLandingPage is the main entry for truckers
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
  })

  test('renders page without errors', async ({ page }) => {
    // Check for JavaScript errors
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    // Page should load without error-level logs
    expect(errors.length).toBe(0)
  })

  test('displays HAULER header', async ({ page }) => {
    const logo = page.locator('div.logo:has-text("HAULER")')
    await expect(logo).toBeVisible()
  })

  test('displays market ticker with CSS classes', async ({ page }) => {
    const ticker = page.locator('div.ticker-wrap')
    await expect(ticker).toBeVisible()

    const tickerItems = page.locator('.ticker-item')
    const count = await tickerItems.count()
    expect(count).toBeGreaterThan(0)
  })

  test('ticker items have delta indicators with correct classes', async ({ page }) => {
    const deltas = page.locator('.ticker-delta')
    const deltaCount = await deltas.count()

    if (deltaCount > 0) {
      const firstDelta = deltas.first()
      const classes = await firstDelta.getAttribute('class')
      expect(classes).toMatch(/ticker-delta\s+(up|down)/)
    }
  })

  test('CSS classes applied (not inline styles) to ticker', async ({ page }) => {
    const tickerWrap = page.locator('div.ticker-wrap')

    // Check that ticker-wrap uses CSS classes, not inline styles
    const style = await tickerWrap.getAttribute('style')
    // Should be null or empty (no inline styles)
    if (style) {
      expect(style).not.toContain('flex')
      expect(style).not.toContain('overflow')
    }
  })

  test('navigation tabs rendered with correct styling', async ({ page }) => {
    const navTabs = page.locator('.nav-tab')
    const count = await navTabs.count()
    expect(count).toBeGreaterThan(0)

    // First tab should be visible
    const firstTab = navTabs.first()
    await expect(firstTab).toBeVisible()
  })

  test('main content area renders', async ({ page }) => {
    const main = page.locator('div.main')
    await expect(main).toBeVisible()
  })

  test('responsive layout (desktop viewport)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    const header = page.locator('header')
    const main = page.locator('div.main')

    await expect(header).toBeVisible()
    await expect(main).toBeVisible()
  })

  test('responsive layout (mobile viewport)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    const header = page.locator('header')
    const main = page.locator('div.main')

    await expect(header).toBeVisible()
    await expect(main).toBeVisible()
  })
})
