# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-analytics-dashboard.spec.ts >> Admin Load Board Analytics Dashboard - US-704 >> AC-1: Admin views Load Board Analytics Dashboard (90-day view)
- Location: e2e\admin-analytics-dashboard.spec.ts:67:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/dashboard" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - heading "FreightClub" [level=1] [ref=e6]
    - paragraph [ref=e7]: Sign in to your account
  - generic [ref=e9]:
    - alert [ref=e10]: Invalid email or password
    - generic [ref=e11]:
      - generic [ref=e12]: Email
      - textbox "Email" [ref=e13]: admin@test.com
    - generic [ref=e14]:
      - generic [ref=e15]: Password
      - textbox "Password" [ref=e16]: AdminPassword123!
    - button "Sign in" [ref=e17] [cursor=pointer]
    - paragraph [ref=e18]:
      - text: Don't have an account?
      - link "Sign up" [ref=e19] [cursor=pointer]:
        - /url: /register
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Admin Load Board Analytics Dashboard - US-704', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     // Login as admin
  6   |     await page.goto('/login');
  7   |     await page.fill('input[type="email"]', 'admin@test.com');
  8   |     await page.fill('input[type="password"]', 'AdminPassword123!');
  9   |     await page.click('button:has-text("Sign In")');
  10  | 
  11  |     // Wait for navigation and go to analytics
> 12  |     await page.waitForURL('**/dashboard');
      |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  13  |     await page.goto('/analytics');
  14  |   });
  15  | 
  16  |   test('AC-1: Admin views Load Board Analytics Dashboard (7-day view)', async ({ page }) => {
  17  |     // Verify page loads with title
  18  |     await expect(page).toHaveTitle(/Analytics/);
  19  | 
  20  |     // Click 7-day tab
  21  |     await page.click('button:has-text("7d")');
  22  |     await page.waitForLoadState('networkidle');
  23  | 
  24  |     // Verify metric cards render with data
  25  |     const totalPostedCard = page.locator('text=Total Posted').locator('..');
  26  |     await expect(totalPostedCard).toBeVisible();
  27  |     await expect(totalPostedCard.locator('text=/\\d+/')).toBeTruthy();
  28  | 
  29  |     const claimedCard = page.locator('text=Claimed').locator('..');
  30  |     await expect(claimedCard).toBeVisible();
  31  | 
  32  |     const avgTimeCard = page.locator('text=Avg Time-to-Claim').locator('..');
  33  |     await expect(avgTimeCard).toBeVisible();
  34  | 
  35  |     // Verify metric values are numbers
  36  |     const totalValue = await totalPostedCard.locator('text=/\\d{3,}|\\d+%/').first().textContent();
  37  |     expect(totalValue).toMatch(/\d+/);
  38  | 
  39  |     // Verify charts render (should have canvas elements or SVG)
  40  |     const chartElements = await page.locator('canvas, svg').count();
  41  |     expect(chartElements).toBeGreaterThan(0);
  42  | 
  43  |     // Verify Top Lanes table
  44  |     await expect(page.locator('text=Top Lanes').first()).toBeVisible();
  45  |     await expect(page.locator('text=Atlanta')).toBeVisible();
  46  | 
  47  |     // Verify Equipment Distribution exists
  48  |     await expect(page.locator('text=Equipment Distribution')).toBeVisible();
  49  | 
  50  |     // Capture screenshot for visual validation
  51  |     await page.screenshot({ path: 'test-results/evidence/US-704-admin-dashboard-7d.png' });
  52  |   });
  53  | 
  54  |   test('AC-1: Admin views Load Board Analytics Dashboard (30-day view)', async ({ page }) => {
  55  |     // Click 30-day tab
  56  |     await page.click('button:has-text("30d")');
  57  |     await page.waitForLoadState('networkidle');
  58  | 
  59  |     // Verify metrics update with different values
  60  |     const metrics = await page.locator('text=/Total Posted|Claimed|Avg Time/').all();
  61  |     expect(metrics.length).toBeGreaterThanOrEqual(3);
  62  | 
  63  |     // Screenshot
  64  |     await page.screenshot({ path: 'test-results/evidence/US-704-admin-dashboard-30d.png' });
  65  |   });
  66  | 
  67  |   test('AC-1: Admin views Load Board Analytics Dashboard (90-day view)', async ({ page }) => {
  68  |     // Click 90-day tab
  69  |     await page.click('button:has-text("90d")');
  70  |     await page.waitForLoadState('networkidle');
  71  | 
  72  |     // Verify Peak Hours chart visible
  73  |     await expect(page.locator('text=Peak Posting Hours')).toBeVisible();
  74  | 
  75  |     // Screenshot
  76  |     await page.screenshot({ path: 'test-results/evidence/US-704-admin-dashboard-90d.png' });
  77  |   });
  78  | 
  79  |   test('AC-1: Metric cards display correct style per Style Guide', async ({ page }) => {
  80  |     // Verify metric card background is white
  81  |     const metricCard = page.locator('text=Total Posted').locator('../../..');
  82  |     const bgColor = await metricCard.evaluate(el => window.getComputedStyle(el).backgroundColor);
  83  |     expect(bgColor).toContain('255'); // White RGB
  84  | 
  85  |     // Verify metric label is gray-600
  86  |     const label = page.locator('text=Total Posted');
  87  |     const labelColor = await label.evaluate(el => window.getComputedStyle(el).color);
  88  |     expect(labelColor).toBeDefined();
  89  | 
  90  |     // Screenshot
  91  |     await page.screenshot({ path: 'test-results/evidence/US-704-style-compliance.png' });
  92  |   });
  93  | 
  94  |   test('AC-2: Shipper Performance Insights displays correctly', async ({ page }) => {
  95  |     // Navigate to shipper performance view (if available)
  96  |     await page.goto('/analytics/shipper-performance');
  97  | 
  98  |     // Verify page loads
  99  |     await expect(page).toHaveTitle(/Performance/);
  100 | 
  101 |     // Verify summary metrics
  102 |     await expect(page.locator('text=Posted')).toBeVisible();
  103 |     await expect(page.locator('text=Claimed')).toBeVisible();
  104 |     await expect(page.locator('text=Avg Claim Time')).toBeVisible();
  105 | 
  106 |     // Verify Preferred vs Open Board chart
  107 |     await expect(page.locator('text=Preferred')).toBeVisible();
  108 | 
  109 |     // Screenshot
  110 |     await page.screenshot({ path: 'test-results/evidence/US-704-shipper-performance.png' });
  111 |   });
  112 | 
```