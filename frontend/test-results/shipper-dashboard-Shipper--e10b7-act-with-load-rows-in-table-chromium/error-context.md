# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shipper-dashboard.spec.ts >> Shipper Dashboard Golden Path (US-715) >> can interact with load rows in table
- Location: e2e\shipper-dashboard.spec.ts:141:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "https://freightclub-frontend-404925591110.us-central1.run.app/login", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:9090'
  4   | 
  5   | test.describe('Shipper Dashboard Golden Path (US-715)', () => {
  6   |   test.beforeEach(async ({ page }) => {
  7   |     // Navigate to login
> 8   |     await page.goto(`${BASE_URL}/login`)
      |                ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  9   | 
  10  |     // Fill login form
  11  |     await page.getByLabel('Email').fill('shipper@test.com')
  12  |     await page.getByLabel('Password').fill('N1kk101!')
  13  | 
  14  |     // Submit login
  15  |     await page.getByRole('button', { name: /sign in/i }).click()
  16  | 
  17  |     // Wait for dashboard navigation after login
  18  |     const authResult = await Promise.race([
  19  |       page.waitForURL(/\/dashboard\/shipper/, { timeout: 5000 }).then(() => true),
  20  |       page.waitForURL(/\/login/, { timeout: 5000 }).then(() => false),
  21  |     ]).catch(() => null)
  22  | 
  23  |     if (authResult !== true) {
  24  |       test.skip(true, 'Test user authentication failed - backend test data not configured. Run database migrations.')
  25  |     }
  26  |   })
  27  | 
  28  |   test('displays shipper dashboard with summary cards', async ({ page }) => {
  29  |     // Verify we're on the dashboard
  30  |     expect(page.url()).toContain('/dashboard/shipper')
  31  | 
  32  |     // Verify summary cards are visible
  33  |     const summaryCards = page.locator('[role="region"]').filter({ hasText: /OPEN|CLAIMED|IN TRANSIT|DELIVERED/i })
  34  |     await expect(summaryCards).toHaveCount(4)
  35  | 
  36  |     // Verify each card has at least a number
  37  |     const cardNumbers = page.locator('div').filter({ hasText: /^[0-9]+$/ })
  38  |     const numberCount = await cardNumbers.count()
  39  |     expect(numberCount).toBeGreaterThanOrEqual(4)
  40  |   })
  41  | 
  42  |   test('displays load table with expected columns', async ({ page }) => {
  43  |     // Verify table headers exist
  44  |     const tableHeaders = page.locator('thead th, thead [role="columnheader"]')
  45  |     const headerCount = await tableHeaders.count()
  46  | 
  47  |     // Should have at least ID, Origin, Destination, Pickup, Status, Pay columns
  48  |     expect(headerCount).toBeGreaterThanOrEqual(6)
  49  |   })
  50  | 
  51  |   test('can switch between load view tabs', async ({ page }) => {
  52  |     // Get initial URL (should show active loads)
  53  |     const initialUrl = page.url()
  54  | 
  55  |     // Find and click "All Loads" or similar tab if it exists
  56  |     const allLoadsButton = page.locator('button', { hasText: /all loads|show all/i })
  57  |     const allLoadsExists = await allLoadsButton.count()
  58  | 
  59  |     if (allLoadsExists > 0) {
  60  |       await allLoadsButton.click()
  61  | 
  62  |       // Verify URL or content changed
  63  |       await page.waitForTimeout(300)
  64  |       const newUrl = page.url()
  65  | 
  66  |       // URL should reflect the view change or content should update
  67  |       expect(newUrl !== initialUrl || await page.locator('tbody tr').count() > 0).toBeTruthy()
  68  |     }
  69  |   })
  70  | 
  71  |   test('search functionality filters loads by Load ID', async ({ page }) => {
  72  |     // Find search input
  73  |     const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="Load ID"], input[type="text"]').first()
  74  |     const searchExists = await searchInput.count()
  75  | 
  76  |     if (searchExists > 0) {
  77  |       await searchInput.fill('LOAD-001')
  78  | 
  79  |       // Wait for debounce (typical 300-500ms)
  80  |       await page.waitForTimeout(400)
  81  | 
  82  |       // Verify table has been filtered (rows should exist or empty state shown)
  83  |       const tableRows = page.locator('tbody tr')
  84  |       const rowCount = await tableRows.count()
  85  |       expect(rowCount).toBeGreaterThanOrEqual(0)
  86  | 
  87  |       // Clear search
  88  |       await searchInput.clear()
  89  |       await page.waitForTimeout(400)
  90  |     }
  91  |   })
  92  | 
  93  |   test('can navigate to Post Load form from dashboard', async ({ page }) => {
  94  |     // Find post load button
  95  |     const postButton = page.locator('button', { hasText: /post a load|post load|create load/i }).first()
  96  |     const postButtonExists = await postButton.count()
  97  | 
  98  |     if (postButtonExists > 0) {
  99  |       await postButton.click()
  100 | 
  101 |       // Verify navigation to post load form
  102 |       await page.waitForURL(/shipper\/loads\/new/, { timeout: 5000 })
  103 |       expect(page.url()).toContain('/shipper/loads/new')
  104 |     }
  105 |   })
  106 | 
  107 |   test('navigation menu is accessible and functional', async ({ page }) => {
  108 |     // Check for navigation elements
```