# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shipper-profile.spec.ts >> Shipper Profile Setup - Golden Path (US-713) >> should persist profile data after page reload (US-713 AC-2)
- Location: e2e\shipper-profile.spec.ts:93:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="profile-page-title"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[data-testid="profile-page-title"]')

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
      - generic [ref=e41]: Tue, Jun 2, 09:24 PM
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
  8   |  * 4. Proper synchronization with backend responses
  9   |  * 5. Traces generated on failure for debugging
  10  |  *
  11  |  * Trace files stored in: test-results/trace-{test-name}-{timestamp}.zip
  12  |  */
  13  | 
  14  | import { test, expect, APIRequestContext } from '@playwright/test'
  15  | import { TestDataSeeder } from './fixtures/test-data-seeder'
  16  | 
  17  | test.describe('Shipper Profile Setup - Golden Path (US-713)', () => {
  18  |   // ============================================================================
  19  |   // TEST SETUP: Per-test state cleanup
  20  |   // ============================================================================
  21  |   test.beforeEach(async ({ page, context }) => {
  22  |     // Traces are managed by playwright.config.ts (trace: 'retain-on-failure')
  23  |     await context.clearCookies()
  24  |     try {
  25  |       await page.evaluate(() => localStorage.clear())
  26  |     } catch {
  27  |       // localStorage may not be accessible on certain pages
  28  |     }
  29  |   })
  30  | 
  31  |   // ============================================================================
  32  |   // TEST 1: Shipper completes profile and becomes ready to publish
  33  |   // ============================================================================
  34  |   test('should complete shipper profile and allow load publication (US-713 AC-1)', async ({ page, request }) => {
  35  |     // Step 1: API-driven setup (replaces UI-driven login)
  36  |     const seeder = new TestDataSeeder(request)
  37  |     const user = await seeder.createTestUser({
  38  |       email: `shipper-${Date.now()}@test.com`,
  39  |       password: 'N1kk101!',
  40  |       role: 'SHIPPER',
  41  |       firstName: 'Test',
  42  |       lastName: 'Shipper',
  43  |       companyName: 'Test Company'
  44  |     })
  45  | 
  46  |     try {
  47  |       // Step 2: Navigate to dashboard + verify incomplete profile banner
  48  |       await page.goto('/')
  49  |       await expect(page.locator('[data-testid="profile-incomplete-alert"]'))
  50  |         .toBeVisible({ timeout: 5000 })
  51  | 
  52  |       // Step 3: Navigate to profile page
  53  |       await page.goto('/shipper/profile')
  54  |       await expect(page.locator('[data-testid="profile-page-title"]'))
  55  |         .toBeVisible({ timeout: 5000 })
  56  | 
  57  |       // Step 4: Fill profile form using data-testid selectors
  58  |       await page.fill('[data-testid="company-name-input"]', 'TrueShip Logistics LLC')
  59  |       await page.fill('[data-testid="billing-email-input"]', 'shipper@trueship.com')
  60  |       await page.fill('[data-testid="phone-input"]', '(555) 123-4567')
  61  |       await page.fill('[data-testid="city-input"]', 'Atlanta')
  62  |       await page.fill('[data-testid="state-input"]', 'GA')
  63  |       await page.fill('[data-testid="zip-input"]', '30303')
  64  | 
  65  |       // Step 5: Submit form + wait for backend response
  66  |       const savePromise = page.waitForResponse(
  67  |         response => response.url().includes('/api/v1/shipper/profile') && response.status() === 200
  68  |       )
  69  |       await page.click('[data-testid="save-profile-btn"]')
  70  |       await savePromise
  71  | 
  72  |       // Step 6: Verify success message
  73  |       await expect(page.locator('[data-testid="profile-success-message"]'))
  74  |         .toBeVisible({ timeout: 5000 })
  75  | 
  76  |       // Step 7: Navigate back to dashboard
  77  |       await page.goto('/dashboard/shipper')
  78  |       await expect(page.locator('[data-testid="dashboard-container"]'))
  79  |         .toBeVisible({ timeout: 5000 })
  80  | 
  81  |       // Step 8: Verify profile complete indicator
  82  |       await expect(page.locator('[data-testid="profile-complete-badge"]'))
  83  |         .toBeVisible({ timeout: 5000 })
  84  | 
  85  |     } finally {
  86  |       await seeder.cleanup()
  87  |     }
  88  |   })
  89  | 
  90  |   // ============================================================================
  91  |   // TEST 2: Profile data persists after page reload
  92  |   // ============================================================================
  93  |   test('should persist profile data after page reload (US-713 AC-2)', async ({ page, request }) => {
  94  |     const seeder = new TestDataSeeder(request)
  95  |     const user = await seeder.createTestUser({
  96  |       email: `shipper-${Date.now()}@persist.com`,
  97  |       password: 'N1kk101!',
  98  |       role: 'SHIPPER',
  99  |       firstName: 'Persist',
  100 |       lastName: 'User',
  101 |       companyName: 'Persistent Corp'
  102 |     })
  103 | 
  104 |     try {
  105 |       // Navigate to profile
  106 |       await page.goto('/shipper/profile')
  107 |       await expect(page.locator('[data-testid="profile-page-title"]'))
> 108 |         .toBeVisible({ timeout: 5000 })
      |          ^ Error: expect(locator).toBeVisible() failed
  109 | 
  110 |       // Fill and save profile
  111 |       const companyNameField = page.locator('[data-testid="company-name-input"]')
  112 |       await companyNameField.clear()
  113 |       await companyNameField.fill('Persistent Freight LLC')
  114 | 
  115 |       const emailField = page.locator('[data-testid="billing-email-input"]')
  116 |       await emailField.clear()
  117 |       await emailField.fill('persistent@freight.com')
  118 | 
  119 |       // Wait for save
  120 |       const savePromise = page.waitForResponse(
  121 |         response => response.url().includes('/api/v1/shipper/profile') && response.status() === 200
  122 |       )
  123 |       await page.click('[data-testid="save-profile-btn"]')
  124 |       await savePromise
  125 | 
  126 |       // Reload page
  127 |       await page.reload()
  128 |       await expect(page.locator('[data-testid="profile-page-title"]'))
  129 |         .toBeVisible({ timeout: 5000 })
  130 | 
  131 |       // Verify data persisted
  132 |       const savedCompanyName = await page.inputValue('[data-testid="company-name-input"]')
  133 |       const savedEmail = await page.inputValue('[data-testid="billing-email-input"]')
  134 | 
  135 |       expect(savedCompanyName).toBe('Persistent Freight LLC')
  136 |       expect(savedEmail).toBe('persistent@freight.com')
  137 | 
  138 |     } finally {
  139 |       await seeder.cleanup()
  140 |     }
  141 |   })
  142 | })
  143 | 
```