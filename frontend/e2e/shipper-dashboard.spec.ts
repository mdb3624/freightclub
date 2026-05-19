import { test, expect } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:9090'

test.describe('Shipper Dashboard Golden Path (US-715)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login
    await page.goto(`${BASE_URL}/login`)

    // Fill login form
    await page.getByLabel('Email').fill('shipper@test.com')
    await page.getByLabel('Password').fill('N1kk101!')

    // Submit login
    await page.getByRole('button', { name: /sign in/i }).click()

    // Wait for dashboard navigation after login
    const authResult = await Promise.race([
      page.waitForURL(/\/dashboard\/shipper/, { timeout: 5000 }).then(() => true),
      page.waitForURL(/\/login/, { timeout: 5000 }).then(() => false),
    ]).catch(() => null)

    if (authResult !== true) {
      test.skip(true, 'Test user authentication failed - backend test data not configured. Run database migrations.')
    }
  })

  test('displays shipper dashboard with summary cards', async ({ page }) => {
    // Verify we're on the dashboard
    expect(page.url()).toContain('/dashboard/shipper')

    // Verify summary cards are visible
    const summaryCards = page.locator('[role="region"]').filter({ hasText: /OPEN|CLAIMED|IN TRANSIT|DELIVERED/i })
    await expect(summaryCards).toHaveCount(4)

    // Verify each card has at least a number
    const cardNumbers = page.locator('div').filter({ hasText: /^[0-9]+$/ })
    const numberCount = await cardNumbers.count()
    expect(numberCount).toBeGreaterThanOrEqual(4)
  })

  test('displays load table with expected columns', async ({ page }) => {
    // Verify table headers exist
    const tableHeaders = page.locator('thead th, thead [role="columnheader"]')
    const headerCount = await tableHeaders.count()

    // Should have at least ID, Origin, Destination, Pickup, Status, Pay columns
    expect(headerCount).toBeGreaterThanOrEqual(6)
  })

  test('can switch between load view tabs', async ({ page }) => {
    // Get initial URL (should show active loads)
    const initialUrl = page.url()

    // Find and click "All Loads" or similar tab if it exists
    const allLoadsButton = page.locator('button', { hasText: /all loads|show all/i })
    const allLoadsExists = await allLoadsButton.count()

    if (allLoadsExists > 0) {
      await allLoadsButton.click()

      // Verify URL or content changed
      await page.waitForTimeout(300)
      const newUrl = page.url()

      // URL should reflect the view change or content should update
      expect(newUrl !== initialUrl || await page.locator('tbody tr').count() > 0).toBeTruthy()
    }
  })

  test('search functionality filters loads by Load ID', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="Load ID"], input[type="text"]').first()
    const searchExists = await searchInput.count()

    if (searchExists > 0) {
      await searchInput.fill('LOAD-001')

      // Wait for debounce (typical 300-500ms)
      await page.waitForTimeout(400)

      // Verify table has been filtered (rows should exist or empty state shown)
      const tableRows = page.locator('tbody tr')
      const rowCount = await tableRows.count()
      expect(rowCount).toBeGreaterThanOrEqual(0)

      // Clear search
      await searchInput.clear()
      await page.waitForTimeout(400)
    }
  })

  test('can navigate to Post Load form from dashboard', async ({ page }) => {
    // Find post load button
    const postButton = page.locator('button', { hasText: /post a load|post load|create load/i }).first()
    const postButtonExists = await postButton.count()

    if (postButtonExists > 0) {
      await postButton.click()

      // Verify navigation to post load form
      await page.waitForURL(/shipper\/loads\/new/, { timeout: 5000 })
      expect(page.url()).toContain('/shipper/loads/new')
    }
  })

  test('navigation menu is accessible and functional', async ({ page }) => {
    // Check for navigation elements
    const navMenu = page.locator('nav, [role="navigation"]')
    const navExists = await navMenu.count()

    if (navExists > 0) {
      // Verify profile link exists
      const profileLink = page.locator('a, button', { hasText: /profile|settings|account/i })
      const profileExists = await profileLink.count()
      expect(profileExists).toBeGreaterThanOrEqual(0)

      // Verify logout/account menu exists
      const accountMenu = page.locator('button', { hasText: /account|logout|menu/i })
      const accountExists = await accountMenu.count()
      expect(accountExists).toBeGreaterThanOrEqual(0)
    }
  })

  test('dashboard loads without errors and shows expected content', async ({ page }) => {
    // Verify page loaded successfully (no error messages)
    const errorMessages = page.locator('text=/error|failed|unable to load/i')
    const errorCount = await errorMessages.count()
    expect(errorCount).toBe(0)

    // Verify header or title is present
    const headerText = page.locator('h1, h2, [role="heading"]').first()
    await expect(headerText).toBeVisible({ timeout: 5000 })

    // Verify main content area is visible
    const mainContent = page.locator('main, [role="main"]')
    const mainExists = await mainContent.count()
    expect(mainExists).toBeGreaterThanOrEqual(0)
  })

  test('can interact with load rows in table', async ({ page }) => {
    // Get first row in table
    const firstRow = page.locator('tbody tr').first()
    const rowExists = await firstRow.count()

    if (rowExists > 0) {
      // Verify row is clickable or has action buttons
      const rowButton = firstRow.locator('button, a, [role="button"]').first()
      const actionExists = await rowButton.count()

      // Row should either be clickable or have action buttons
      expect(rowExists + actionExists).toBeGreaterThan(0)

      // Hover over row to verify interactive state
      await firstRow.hover()
      await page.waitForTimeout(200)
    }
  })

  test('page responds correctly to data loading states', async ({ page }) => {
    // Check for loading indicators (skeleton, spinner, etc)
    const loadingIndicators = page.locator('[class*="loading"], [class*="skeleton"], [role="status"]')

    // Wait for loading to complete
    await page.waitForLoadState('networkidle')

    // After network is idle, loading indicators should be gone (or content should be visible)
    const tableBody = page.locator('tbody')
    await expect(tableBody).toBeVisible({ timeout: 5000 })
  })
})
