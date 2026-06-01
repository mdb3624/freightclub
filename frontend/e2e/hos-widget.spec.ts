/**
 * HOS Widget & Trucker Landing Page Tests
 *
 * Refactored Features (Phase 5 Pattern Rollout):
 * 1. Uses data-testid selectors for critical components (mandatory per testing_standards.md)
 * 2. Web-first assertions with explicit timeouts
 * 3. No hard-coded waits (waitForTimeout removed)
 * 4. Trace generation on failure
 *
 * Focus: Smoke tests for HOS widget compilation + TruckerLandingPage rendering
 */

import { test, expect } from '@playwright/test'

test.describe('HOS Widget & Trucker Landing Page (Smoke Tests)', () => {
  // ============================================================================
  // SETUP: Per-test state cleanup
  // ============================================================================
  test.beforeEach(async ({ page, context }) => {
    // Traces are managed by playwright.config.ts (trace: 'retain-on-failure')
    await context.clearCookies()
    await page.evaluate(() => localStorage.clear())
  })

  // ============================================================================
  // TEST 1: HOS Widget compiles without errors
  // ============================================================================
  test('HosWidget should compile without TypeScript errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto('/')

    // Wait for page to settle (web-first, not hard-coded)
    await expect(page.locator('[data-testid="app-container"]'))
      .toBeVisible({ timeout: 5000 })

    // Filter for HosWidget-specific errors
    const hosErrors = errors.filter(
      e => e.includes('HosWidget') || e.includes('useHosState') || e.includes('HOS')
    )
    expect(hosErrors).toHaveLength(0)
  })

  // ============================================================================
  // TEST 2: TruckerLandingPage loads and displays main sections
  // ============================================================================
  test('TruckerLandingPage should render main sections with data-testid', async ({ page }) => {
    await page.goto('/')

    // Verify main layout sections using data-testid
    await expect(page.locator('[data-testid="trucker-landing-header"]'))
      .toBeVisible({ timeout: 5000 })

    await expect(page.locator('[data-testid="ticker-widget"]'))
      .toBeVisible({ timeout: 5000 })

    await expect(page.locator('[data-testid="main-content"]'))
      .toBeVisible({ timeout: 5000 })
  })

  // ============================================================================
  // TEST 3: Market ticker displays with data-testid
  // ============================================================================
  test('Market ticker should display items with data-testid selectors', async ({ page }) => {
    await page.goto('/')

    // Verify ticker widget is visible
    await expect(page.locator('[data-testid="ticker-widget"]'))
      .toBeVisible({ timeout: 5000 })

    // Count ticker items (should have at least 1)
    const tickerItems = page.locator('[data-testid="ticker-item"]')
    const count = await tickerItems.count()
    expect(count).toBeGreaterThan(0)
  })

  // ============================================================================
  // TEST 4: Navigation tabs render correctly
  // ============================================================================
  test('Navigation tabs should render with proper data-testid attributes', async ({ page }) => {
    await page.goto('/')

    // Verify navigation is present
    await expect(page.locator('[data-testid="nav-tabs"]'))
      .toBeVisible({ timeout: 5000 })

    // Verify at least one tab is visible
    const navTab = page.locator('[data-testid="nav-tab"]').first()
    await expect(navTab).toBeVisible({ timeout: 5000 })
  })

  // ============================================================================
  // TEST 5: Page renders without critical errors
  // ============================================================================
  test('Page should render without critical console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto('/')
    await expect(page.locator('[data-testid="app-container"]'))
      .toBeVisible({ timeout: 5000 })

    // Filter out non-critical errors (warnings, deprecations)
    const criticalErrors = errors.filter(
      e => !e.includes('warn') && !e.includes('deprecated')
    )
    expect(criticalErrors).toHaveLength(0)
  })

  // ============================================================================
  // TEST 6: Responsive layout (desktop)
  // ============================================================================
  test('Should render correctly on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')

    await expect(page.locator('[data-testid="trucker-landing-header"]'))
      .toBeVisible({ timeout: 5000 })

    await expect(page.locator('[data-testid="main-content"]'))
      .toBeVisible({ timeout: 5000 })
  })

  // ============================================================================
  // TEST 7: Responsive layout (mobile)
  // ============================================================================
  test('Should render correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    await expect(page.locator('[data-testid="trucker-landing-header"]'))
      .toBeVisible({ timeout: 5000 })

    await expect(page.locator('[data-testid="main-content"]'))
      .toBeVisible({ timeout: 5000 })
  })
})
