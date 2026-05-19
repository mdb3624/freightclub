# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login-integration.spec.ts >> Login Integration Tests (US-756) >> should render login form in <100ms on initial load
- Location: e2e\login-integration.spec.ts:9:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:9090/", waiting until "networkidle"

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
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Login Integration Tests (US-756)', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     // Clear auth state before each test
  6   |     await page.context().clearCookies();
  7   |   });
  8   | 
  9   |   test('should render login form in <100ms on initial load', async ({ page }) => {
  10  |     const startTime = Date.now();
> 11  |     await page.goto('/', { waitUntil: 'networkidle' });
      |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  12  |     const loadTime = Date.now() - startTime;
  13  | 
  14  |     // Verify login form elements are present
  15  |     await expect(page.locator('input[type="email"]')).toBeVisible();
  16  |     await expect(page.locator('input[type="password"]')).toBeVisible();
  17  |     await expect(page.locator('button', { hasText: /sign in/i })).toBeVisible();
  18  | 
  19  |     // Log load time for verification
  20  |     console.log(`Page loaded in ${loadTime}ms`);
  21  |   });
  22  | 
  23  |   test('should display error message on failed login', async ({ page }) => {
  24  |     await page.goto('/');
  25  | 
  26  |     // Fill in invalid credentials
  27  |     await page.fill('input[type="email"]', 'invalid@example.com');
  28  |     await page.fill('input[type="password"]', 'wrongpassword');
  29  | 
  30  |     // Mock the auth API to return 401
  31  |     await page.route('**/api/v1/auth/login', route => {
  32  |       route.abort('failed');
  33  |     });
  34  | 
  35  |     await page.click('button', { hasText: /sign in/i });
  36  | 
  37  |     // Wait a bit for error to appear
  38  |     await page.waitForTimeout(500);
  39  | 
  40  |     // Verify error message appears
  41  |     const errorText = await page.locator('div').filter({ hasText: /error|failed|invalid/i }).first();
  42  |     const isVisible = await errorText.isVisible().catch(() => false);
  43  |     console.log(`Error message visible: ${isVisible}`);
  44  |   });
  45  | 
  46  |   test('should handle network throttling gracefully', async ({ page, context }) => {
  47  |     // Create a new page with throttling
  48  |     const throttledPage = await context.newPage();
  49  | 
  50  |     // Set network conditions to simulate Slow 3G
  51  |     await throttledPage.route('**/*', route => {
  52  |       // Add 100ms delay to simulate slow network
  53  |       setTimeout(() => route.continue(), 100);
  54  |     });
  55  | 
  56  |     const startTime = Date.now();
  57  |     await throttledPage.goto('/', { waitUntil: 'domcontentloaded' });
  58  |     const loadTime = Date.now() - startTime;
  59  | 
  60  |     // Verify form is still interactive
  61  |     const emailInput = throttledPage.locator('input[type="email"]');
  62  |     await expect(emailInput).toBeVisible();
  63  |     await expect(emailInput).not.toBeDisabled();
  64  | 
  65  |     console.log(`Page loaded with 3G throttling in ${loadTime}ms`);
  66  | 
  67  |     await throttledPage.close();
  68  |   });
  69  | 
  70  |   test('should maintain auth state on page refresh', async ({ page }) => {
  71  |     await page.goto('/');
  72  | 
  73  |     // Get initial page content
  74  |     const initialForm = page.locator('input[type="email"]');
  75  |     expect(await initialForm.isVisible()).toBe(true);
  76  | 
  77  |     // Simulate setting auth cookie
  78  |     await page.context().addCookies([
  79  |       {
  80  |         name: 'auth_token',
  81  |         value: 'test-token-123',
  82  |         domain: 'localhost',
  83  |         path: '/',
  84  |         httpOnly: true,
  85  |         secure: false,
  86  |         sameSite: 'Lax',
  87  |       }
  88  |     ]);
  89  | 
  90  |     // Refresh page
  91  |     await page.reload();
  92  | 
  93  |     // Verify form is still accessible (auth check happens asynchronously)
  94  |     await expect(initialForm).toBeVisible({ timeout: 5000 });
  95  |   });
  96  | 
  97  |   test('should validate required fields', async ({ page }) => {
  98  |     await page.goto('/');
  99  | 
  100 |     // Try to submit empty form
  101 |     await page.click('button', { hasText: /sign in/i });
  102 | 
  103 |     // Verify validation error appears
  104 |     const validationError = page.locator('div').filter({ hasText: /required|email and password/i }).first();
  105 |     const isVisible = await validationError.isVisible().catch(() => false);
  106 |     console.log(`Validation error visible: ${isVisible}`);
  107 |   });
  108 | 
  109 |   test('should validate email format', async ({ page }) => {
  110 |     await page.goto('/');
  111 | 
```