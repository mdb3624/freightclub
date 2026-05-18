# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login-integration.spec.ts >> Login Integration Tests (US-756) >> should display error message on failed login
- Location: e2e\login-integration.spec.ts:23:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/
Call log:
  - navigating to "http://localhost:5173/", waiting until "load"

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
  11  |     await page.goto('http://localhost:9096', { waitUntil: 'networkidle' });
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
> 24  |     await page.goto('http://localhost:5173');
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/
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
  57  |     await throttledPage.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
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
  71  |     await page.goto('http://localhost:5173');
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
  98  |     await page.goto('http://localhost:5173');
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
  110 |     await page.goto('http://localhost:5173');
  111 | 
  112 |     // Enter invalid email
  113 |     await page.fill('input[type="email"]', 'notanemail');
  114 |     await page.fill('input[type="password"]', 'password123');
  115 | 
  116 |     await page.click('button', { hasText: /sign in/i });
  117 | 
  118 |     // Verify validation error appears
  119 |     const validationError = page.locator('div').filter({ hasText: /valid email|@/i }).first();
  120 |     const isVisible = await validationError.isVisible().catch(() => false);
  121 |     console.log(`Email validation error visible: ${isVisible}`);
  122 |   });
  123 | });
  124 | 
```