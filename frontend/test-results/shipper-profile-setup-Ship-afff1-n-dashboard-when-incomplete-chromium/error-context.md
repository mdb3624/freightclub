# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shipper-profile-setup.spec.ts >> Shipper Profile Setup — US-713 >> US-713 AC-2: Displays completion banner on dashboard when incomplete
- Location: e2e\shipper-profile-setup.spec.ts:73:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="dashboard-container"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[data-testid="dashboard-container"]')

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
      - generic [ref=e41]: Tue, Jun 2, 09:23 PM
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
  1   | import { test, expect } from '@playwright/test';
  2   | import { TestDataSeeder } from './fixtures/test-data-seeder';
  3   | 
  4   | /**
  5   |  * US-713: Shipper Profile Setup
  6   |  *
  7   |  * Refactored Features (Phase 5 Pattern Rollout):
  8   |  * 1. Uses data-testid selectors (mandatory per testing_standards.md)
  9   |  * 2. Web-first assertions instead of hard-coded waits
  10  |  * 3. API-driven test data setup (TestDataSeeder) instead of UI login
  11  |  * 4. Proper synchronization with backend responses
  12  |  * 5. Traces generated on failure for debugging
  13  |  */
  14  | test.describe('Shipper Profile Setup — US-713', () => {
  15  |   test.beforeEach(async ({ page, context }) => {
  16  |     // Clear auth state
  17  |     await context.clearCookies();
  18  |     try {
  19  |       try { await page.evaluate(() => localStorage.clear()); } catch {} // about:blank denies localStorage
  20  |     } catch {
  21  |       // localStorage may not be accessible
  22  |     }
  23  |   });
  24  | 
  25  |   test('US-713 AC-1: Shipper completes profile and reaches 80% threshold', async ({ page, request }) => {
  26  |     // Setup: Create authenticated shipper user
  27  |     const seeder = new TestDataSeeder(request);
  28  |     const user = await seeder.createTestUser({
  29  |       role: 'SHIPPER',
  30  |       email: `shipper-${Date.now()}@test.com`,
  31  |       firstName: 'Test',
  32  |       lastName: 'Shipper',
  33  |     });
  34  | 
  35  |     try {
  36  |       // Navigate to profile page
  37  |       await page.goto('/profile', { waitUntil: 'networkidle' });
  38  | 
  39  |       // Verify profile page loads
  40  |       await expect(page.locator('[data-testid="shipper-profile-page"]')).toBeVisible({ timeout: 5000 });
  41  | 
  42  |       // Fill out the form
  43  |       await page.fill('[data-testid="company-name-input"]', 'Apex Freight Solutions');
  44  |       await page.fill('[data-testid="billing-email-input"]', 'billing@apex.com');
  45  |       await page.fill('[data-testid="phone-number-input"]', '(512) 555-0182');
  46  |       await page.fill('[data-testid="city-input"]', 'Austin');
  47  |       await page.fill('[data-testid="state-input"]', 'TX');
  48  |       await page.fill('[data-testid="zip-code-input"]', '78701');
  49  | 
  50  |       // Intercept PUT request to verify payload
  51  |       const savePromise = page.waitForResponse(
  52  |         response => response.url().includes('/api/v1/profile') && response.request().method() === 'PUT'
  53  |       );
  54  | 
  55  |       // Submit the form
  56  |       await page.click('[data-testid="save-profile-btn"]');
  57  | 
  58  |       // Wait for API response
  59  |       const response = await savePromise;
  60  |       expect(response.ok()).toBeTruthy();
  61  | 
  62  |       // Verify success state and profile completeness message
  63  |       await expect(page.locator('[data-testid="profile-success-message"]')).toBeVisible({ timeout: 5000 });
  64  | 
  65  |       // Verify completion percentage displays
  66  |       const completenessText = await page.locator('[data-testid="completion-percentage"]').textContent();
  67  |       expect(completenessText).toMatch(/\d+%/);
  68  |     } finally {
  69  |       await seeder.cleanup();
  70  |     }
  71  |   });
  72  | 
  73  |   test('US-713 AC-2: Displays completion banner on dashboard when incomplete', async ({ page, request }) => {
  74  |     const seeder = new TestDataSeeder(request);
  75  |     const user = await seeder.createTestUser({
  76  |       role: 'SHIPPER',
  77  |       email: `shipper-${Date.now()}@test.com`,
  78  |       firstName: 'Test',
  79  |       lastName: 'Shipper',
  80  |     });
  81  | 
  82  |     try {
  83  |       // Navigate to dashboard
  84  |       await page.goto('/dashboard', { waitUntil: 'networkidle' });
  85  | 
  86  |       // Verify page loads
> 87  |       await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible({ timeout: 5000 });
      |                                                                         ^ Error: expect(locator).toBeVisible() failed
  88  | 
  89  |       // Verify incomplete profile banner appears
  90  |       await expect(page.locator('[data-testid="profile-incomplete-banner"]')).toBeVisible({ timeout: 5000 });
  91  |       await expect(page.locator('[data-testid="profile-incomplete-message"]')).toBeVisible();
  92  | 
  93  |       // Verify completion percentage displays in banner
  94  |       const completenessText = await page.locator('[data-testid="completion-banner-percent"]').textContent();
  95  |       expect(completenessText).toMatch(/\d+%/);
  96  | 
  97  |       // Click "Complete Profile" button in banner
  98  |       const completeBtn = page.locator('[data-testid="complete-profile-btn"]');
  99  |       await expect(completeBtn).toBeVisible();
  100 |       await completeBtn.click();
  101 | 
  102 |       // Verify navigation to profile page
  103 |       await expect(page).toHaveURL(/.*\/profile/);
  104 |     } finally {
  105 |       await seeder.cleanup();
  106 |     }
  107 |   });
  108 | 
  109 |   test('US-713 AC-3: Hides banner when profile is ≥80% complete', async ({ page, request }) => {
  110 |     const seeder = new TestDataSeeder(request);
  111 |     const user = await seeder.createTestUser({
  112 |       role: 'SHIPPER',
  113 |       email: `shipper-${Date.now()}@test.com`,
  114 |       firstName: 'Test',
  115 |       lastName: 'Shipper',
  116 |     });
  117 | 
  118 |     try {
  119 |       // First, complete the profile to reach 80%
  120 |       await page.goto('/profile', { waitUntil: 'networkidle' });
  121 | 
  122 |       // Fill required fields
  123 |       await page.fill('[data-testid="company-name-input"]', 'Complete Company');
  124 |       await page.fill('[data-testid="billing-email-input"]', 'billing@complete.com');
  125 |       await page.fill('[data-testid="phone-number-input"]', '(512) 555-0000');
  126 |       await page.fill('[data-testid="city-input"]', 'Austin');
  127 |       await page.fill('[data-testid="state-input"]', 'TX');
  128 |       await page.fill('[data-testid="zip-code-input"]', '78701');
  129 | 
  130 |       // Save profile
  131 |       await page.click('[data-testid="save-profile-btn"]');
  132 |       await expect(page.locator('[data-testid="profile-success-message"]')).toBeVisible({ timeout: 5000 });
  133 | 
  134 |       // Navigate to dashboard
  135 |       await page.goto('/dashboard', { waitUntil: 'networkidle' });
  136 | 
  137 |       // Verify incomplete profile banner is NOT visible
  138 |       const incompleteBanner = page.locator('[data-testid="profile-incomplete-banner"]');
  139 |       expect(await incompleteBanner.count()).toBe(0);
  140 |     } finally {
  141 |       await seeder.cleanup();
  142 |     }
  143 |   });
  144 | 
  145 |   test('US-713 AC-4: Profile displays all required and optional fields', async ({ page, request }) => {
  146 |     const seeder = new TestDataSeeder(request);
  147 |     const user = await seeder.createTestUser({
  148 |       role: 'SHIPPER',
  149 |     });
  150 | 
  151 |     try {
  152 |       // Navigate to profile page
  153 |       await page.goto('/profile', { waitUntil: 'networkidle' });
  154 | 
  155 |       // Verify required fields are visible
  156 |       await expect(page.locator('[data-testid="company-name-input"]')).toBeVisible({ timeout: 5000 });
  157 |       await expect(page.locator('[data-testid="billing-email-input"]')).toBeVisible();
  158 |       await expect(page.locator('[data-testid="phone-number-input"]')).toBeVisible();
  159 |       await expect(page.locator('[data-testid="city-input"]')).toBeVisible();
  160 |       await expect(page.locator('[data-testid="state-input"]')).toBeVisible();
  161 |       await expect(page.locator('[data-testid="zip-code-input"]')).toBeVisible();
  162 | 
  163 |       // Verify optional fields are visible
  164 |       const mcNumberField = page.locator('[data-testid="mc-number-input"]');
  165 |       if (await mcNumberField.isVisible({ timeout: 2000 })) {
  166 |         await expect(mcNumberField).toBeVisible();
  167 |       }
  168 | 
  169 |       const usdotField = page.locator('[data-testid="usdot-number-input"]');
  170 |       if (await usdotField.isVisible({ timeout: 2000 })) {
  171 |         await expect(usdotField).toBeVisible();
  172 |       }
  173 | 
  174 |       // Verify form submission button
  175 |       await expect(page.locator('[data-testid="save-profile-btn"]')).toBeVisible();
  176 |     } finally {
  177 |       await seeder.cleanup();
  178 |     }
  179 |   });
  180 | });
  181 | 
```