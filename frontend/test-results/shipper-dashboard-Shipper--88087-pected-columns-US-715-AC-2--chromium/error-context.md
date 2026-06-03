# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shipper-dashboard.spec.ts >> Shipper Dashboard Golden Path (US-715) >> should display load table with expected columns (US-715 AC-2)
- Location: e2e\shipper-dashboard.spec.ts:62:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="load-table"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[data-testid="load-table"]')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - heading "FreightClub" [level=1] [ref=e6]
    - paragraph [ref=e7]: Sign in to your account
  - generic [ref=e9]:
    - generic [ref=e10]:
      - generic [ref=e11]: Email
      - textbox "Email" [ref=e12]
    - generic [ref=e13]:
      - generic [ref=e14]: Password
      - textbox "Password" [ref=e15]
    - button "Sign in" [ref=e16] [cursor=pointer]
    - paragraph [ref=e17]:
      - text: Don't have an account?
      - link "Sign up" [ref=e18] [cursor=pointer]:
        - /url: /register
```

# Test source

```ts
  1   | /**
  2   |  * Shipper Dashboard Golden Path Tests (US-715)
  3   |  *
  4   |  * Refactored Features (Phase 5 Pattern Rollout):
  5   |  * 1. Uses data-testid selectors (mandatory per testing_standards.md)
  6   |  * 2. Web-first assertions with explicit timeouts (no hard-coded waits)
  7   |  * 3. API-driven test data setup (TestDataSeeder) instead of UI login
  8   |  * 4. Proper synchronization with backend API responses
  9   |  * 5. Trace generation on failure for debugging
  10  |  *
  11  |  * Trace files stored in: test-results/trace-{test-name}-{timestamp}.zip
  12  |  */
  13  | 
  14  | import { test, expect, APIRequestContext } from '@playwright/test'
  15  | import { TestDataSeeder } from './fixtures/test-data-seeder'
  16  | 
  17  | test.describe('Shipper Dashboard Golden Path (US-715)', () => {
  18  |   // ============================================================================
  19  |   // SETUP: Per-test state cleanup
  20  |   // ============================================================================
  21  |   test.beforeEach(async ({ context }) => {
  22  |     // Traces are managed by playwright.config.ts (trace: 'retain-on-failure')
  23  |     await context.clearCookies()
  24  |   })
  25  | 
  26  |   // ============================================================================
  27  |   // TEST 1: Dashboard displays summary cards
  28  |   // ============================================================================
  29  |   test('should display summary cards with load statistics (US-715 AC-1)', async ({ page, request }) => {
  30  |     const seeder = new TestDataSeeder(request)
  31  |     const user = await seeder.createTestUser({
  32  |       email: `shipper-${Date.now()}@test.com`,
  33  |       role: 'SHIPPER',
  34  |       firstName: 'Shipper',
  35  |       lastName: 'User',
  36  |       companyName: 'Test Shipper Corp'
  37  |     })
  38  | 
  39  |     try {
  40  |       await page.goto('/dashboard/shipper')
  41  |       await expect(page.locator('[data-testid="dashboard-container"]'))
  42  |         .toBeVisible({ timeout: 5000 })
  43  | 
  44  |       // Verify summary cards are visible
  45  |       await expect(page.locator('[data-testid="summary-open-card"]'))
  46  |         .toBeVisible({ timeout: 5000 })
  47  |       await expect(page.locator('[data-testid="summary-claimed-card"]'))
  48  |         .toBeVisible({ timeout: 5000 })
  49  |       await expect(page.locator('[data-testid="summary-in-transit-card"]'))
  50  |         .toBeVisible({ timeout: 5000 })
  51  |       await expect(page.locator('[data-testid="summary-delivered-card"]'))
  52  |         .toBeVisible({ timeout: 5000 })
  53  | 
  54  |     } finally {
  55  |       await seeder.cleanup()
  56  |     }
  57  |   })
  58  | 
  59  |   // ============================================================================
  60  |   // TEST 2: Load table displays with expected columns
  61  |   // ============================================================================
  62  |   test('should display load table with expected columns (US-715 AC-2)', async ({ page, request }) => {
  63  |     const seeder = new TestDataSeeder(request)
  64  |     const user = await seeder.createTestUser({
  65  |       email: `shipper-${Date.now()}@load-table.com`,
  66  |       role: 'SHIPPER',
  67  |       firstName: 'TableTest',
  68  |       lastName: 'User',
  69  |       companyName: 'Table Test Corp'
  70  |     })
  71  | 
  72  |     try {
  73  |       await page.goto('/dashboard/shipper')
  74  | 
  75  |       // Verify table is visible
  76  |       await expect(page.locator('[data-testid="load-table"]'))
> 77  |         .toBeVisible({ timeout: 5000 })
      |          ^ Error: expect(locator).toBeVisible() failed
  78  | 
  79  |       // Verify key column headers
  80  |       await expect(page.locator('[data-testid="table-header-origin"]'))
  81  |         .toBeVisible({ timeout: 5000 })
  82  |       await expect(page.locator('[data-testid="table-header-destination"]'))
  83  |         .toBeVisible({ timeout: 5000 })
  84  |       await expect(page.locator('[data-testid="table-header-status"]'))
  85  |         .toBeVisible({ timeout: 5000 })
  86  | 
  87  |     } finally {
  88  |       await seeder.cleanup()
  89  |     }
  90  |   })
  91  | 
  92  |   // ============================================================================
  93  |   // TEST 3: Can switch between load view tabs
  94  |   // ============================================================================
  95  |   test('should switch between Active and All Loads tabs (US-715 AC-3)', async ({ page, request }) => {
  96  |     const seeder = new TestDataSeeder(request)
  97  |     const user = await seeder.createTestUser({
  98  |       email: `shipper-${Date.now()}@tabs.com`,
  99  |       role: 'SHIPPER',
  100 |       firstName: 'TabSwitch',
  101 |       lastName: 'User',
  102 |       companyName: 'Tab Test Corp'
  103 |     })
  104 | 
  105 |     try {
  106 |       await page.goto('/dashboard/shipper')
  107 |       await expect(page.locator('[data-testid="dashboard-container"]'))
  108 |         .toBeVisible({ timeout: 5000 })
  109 | 
  110 |       // Click "All Loads" tab
  111 |       const allLoadsTab = page.locator('[data-testid="tab-all-loads"]')
  112 |       if (await allLoadsTab.count() > 0) {
  113 |         await allLoadsTab.click()
  114 | 
  115 |         // Verify tab is active
  116 |         await expect(allLoadsTab)
  117 |           .toHaveAttribute('aria-selected', 'true', { timeout: 5000 })
  118 |       }
  119 | 
  120 |     } finally {
  121 |       await seeder.cleanup()
  122 |     }
  123 |   })
  124 | 
  125 |   // ============================================================================
  126 |   // TEST 4: Search functionality filters loads
  127 |   // ============================================================================
  128 |   test('should filter loads using search input (US-715 AC-4)', async ({ page, request }) => {
  129 |     const seeder = new TestDataSeeder(request)
  130 |     const user = await seeder.createTestUser({
  131 |       email: `shipper-${Date.now()}@search.com`,
  132 |       role: 'SHIPPER',
  133 |       firstName: 'SearchTest',
  134 |       lastName: 'User',
  135 |       companyName: 'Search Test Corp'
  136 |     })
  137 | 
  138 |     try {
  139 |       await page.goto('/dashboard/shipper')
  140 | 
  141 |       // Find and interact with search input
  142 |       const searchInput = page.locator('[data-testid="load-search-input"]')
  143 |       if (await searchInput.count() > 0) {
  144 |         await searchInput.fill('test')
  145 | 
  146 |         // Wait for search debounce + API response
  147 |         const searchResponse = page.waitForResponse(
  148 |           response => response.url().includes('/api/v1/loads') && response.status() === 200
  149 |         )
  150 |         await searchResponse
  151 | 
  152 |         // Verify table updates or shows no results
  153 |         await expect(page.locator('[data-testid="load-table"]'))
  154 |           .toBeVisible({ timeout: 5000 })
  155 |       }
  156 | 
  157 |     } finally {
  158 |       await seeder.cleanup()
  159 |     }
  160 |   })
  161 | 
  162 |   // ============================================================================
  163 |   // TEST 5: Can navigate to Post Load form
  164 |   // ============================================================================
  165 |   test('should navigate to Post Load form (US-715 AC-5)', async ({ page, request }) => {
  166 |     const seeder = new TestDataSeeder(request)
  167 |     const user = await seeder.createTestUser({
  168 |       email: `shipper-${Date.now()}@post.com`,
  169 |       role: 'SHIPPER',
  170 |       firstName: 'PostTest',
  171 |       lastName: 'User',
  172 |       companyName: 'Post Test Corp'
  173 |     })
  174 | 
  175 |     try {
  176 |       await page.goto('/dashboard/shipper')
  177 | 
```