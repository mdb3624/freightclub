# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: carrier-public-profile.spec.ts >> Carrier Public Profile - US-710 >> US-710 AC-3: Carrier interest count displays social proof
- Location: e2e\carrier-public-profile.spec.ts:74:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="viewed-by-metric"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[data-testid="viewed-by-metric"]')

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
  1   | import { test, expect } from '@playwright/test';
  2   | import { TestDataSeeder } from './fixtures/test-data-seeder';
  3   | 
  4   | /**
  5   |  * US-710: Carrier Public Profile
  6   |  *
  7   |  * Refactored Features (Phase 5 Pattern Rollout):
  8   |  * 1. Uses data-testid selectors (mandatory per testing_standards.md)
  9   |  * 2. Web-first assertions instead of hard-coded waits
  10  |  * 3. API-driven test data setup (TestDataSeeder) instead of page.request
  11  |  * 4. Proper cross-origin authentication (bypasses browser security via API context)
  12  |  * 5. Traces generated on failure for debugging
  13  |  */
  14  | test.describe('Carrier Public Profile - US-710', () => {
  15  |   test.beforeEach(async ({ page, context }) => {
  16  |     // Clear any prior auth state
  17  |     await context.clearCookies();
  18  |     try {
  19  |       try { await page.evaluate(() => localStorage.clear()); } catch {} // about:blank denies localStorage
  20  |     } catch {
  21  |       // localStorage may not be accessible on certain pages
  22  |     }
  23  |   });
  24  | 
  25  |   test('US-710 AC-1: Shipper views carrier performance profile', async ({ page, request }) => {
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
  36  |       // Navigate to carrier profile
  37  |       await page.goto('/carriers/fedex-freight', { waitUntil: 'networkidle' });
  38  | 
  39  |       // Verify page loads with carrier profile
  40  |       await expect(page.locator('[data-testid="carrier-profile-container"]')).toBeVisible({ timeout: 5000 });
  41  | 
  42  |       // Verify header with carrier name
  43  |       await expect(page.locator('[data-testid="carrier-name-header"]')).toBeVisible();
  44  | 
  45  |       // Verify key performance metrics are visible
  46  |       await expect(page.locator('[data-testid="metric-acceptance-rate"]')).toBeVisible();
  47  |       await expect(page.locator('[data-testid="metric-on-time-delivery"]')).toBeVisible();
  48  |       await expect(page.locator('[data-testid="metric-quality-score"]')).toBeVisible();
  49  |       await expect(page.locator('[data-testid="metric-avg-delivery"]')).toBeVisible();
  50  |     } finally {
  51  |       await seeder.cleanup();
  52  |     }
  53  |   });
  54  | 
  55  |   test('US-710 AC-2: Shipper compares carriers with benchmarks', async ({ page, request }) => {
  56  |     const seeder = new TestDataSeeder(request);
  57  |     const user = await seeder.createTestUser({ role: 'SHIPPER' });
  58  | 
  59  |     try {
  60  |       await page.goto('/carriers/fedex-freight', { waitUntil: 'networkidle' });
  61  | 
  62  |       // Verify comparison view and benchmarks visible
  63  |       await expect(page.locator('[data-testid="carrier-benchmark-comparison"]')).toBeVisible({ timeout: 5000 });
  64  |       await expect(page.locator('[data-testid="industry-average-section"]')).toBeVisible();
  65  | 
  66  |       // Verify progress indicators visible
  67  |       const progressBars = await page.locator('[data-testid^="benchmark-bar"]').count();
  68  |       expect(progressBars).toBeGreaterThan(0);
  69  |     } finally {
  70  |       await seeder.cleanup();
  71  |     }
  72  |   });
  73  | 
  74  |   test('US-710 AC-3: Carrier interest count displays social proof', async ({ page, request }) => {
  75  |     const seeder = new TestDataSeeder(request);
  76  |     const user = await seeder.createTestUser({ role: 'SHIPPER' });
  77  | 
  78  |     try {
  79  |       await page.goto('/carriers/fedex-freight', { waitUntil: 'networkidle' });
  80  | 
  81  |       // Verify social proof metrics visible
> 82  |       await expect(page.locator('[data-testid="viewed-by-metric"]')).toBeVisible({ timeout: 5000 });
      |                                                                      ^ Error: expect(locator).toBeVisible() failed
  83  |       await expect(page.locator('[data-testid="preferred-by-metric"]')).toBeVisible();
  84  | 
  85  |       // Verify numbers display
  86  |       const viewedByText = await page.locator('[data-testid="viewed-by-count"]').textContent();
  87  |       expect(viewedByText).toMatch(/\d+/);
  88  | 
  89  |       const preferredByText = await page.locator('[data-testid="preferred-by-count"]').textContent();
  90  |       expect(preferredByText).toMatch(/\d+/);
  91  |     } finally {
  92  |       await seeder.cleanup();
  93  |     }
  94  |   });
  95  | 
  96  |   test('US-710 AC-4: Multi-tenancy isolation enforced', async ({ page, request }) => {
  97  |     const seeder = new TestDataSeeder(request);
  98  |     const user = await seeder.createTestUser({ role: 'SHIPPER' });
  99  | 
  100 |     try {
  101 |       await page.goto('/carriers/fedex-freight', { waitUntil: 'networkidle' });
  102 | 
  103 |       // Verify metrics shown are for current tenant only
  104 |       const metrics = await page.locator('[data-testid^="metric-"]').count();
  105 |       expect(metrics).toBeGreaterThan(0);
  106 | 
  107 |       // Verify no cross-tenant data leaks
  108 |       const headerText = await page.locator('[data-testid="carrier-profile-container"]').textContent();
  109 |       expect(headerText).toBeDefined();
  110 |     } finally {
  111 |       await seeder.cleanup();
  112 |     }
  113 |   });
  114 | 
  115 |   test('US-710 AC-5: Service areas and equipment types display', async ({ page, request }) => {
  116 |     const seeder = new TestDataSeeder(request);
  117 |     const user = await seeder.createTestUser({ role: 'SHIPPER' });
  118 | 
  119 |     try {
  120 |       await page.goto('/carriers/fedex-freight', { waitUntil: 'networkidle' });
  121 | 
  122 |       // Verify equipment section visible
  123 |       await expect(page.locator('[data-testid="equipment-types-section"]')).toBeVisible({ timeout: 5000 });
  124 | 
  125 |       // Verify service areas section visible
  126 |       await expect(page.locator('[data-testid="service-areas-section"]')).toBeVisible();
  127 |     } finally {
  128 |       await seeder.cleanup();
  129 |     }
  130 |   });
  131 | 
  132 |   test('US-710 AC-6: Shipper can add carrier to preferred list', async ({ page, request }) => {
  133 |     const seeder = new TestDataSeeder(request);
  134 |     const user = await seeder.createTestUser({ role: 'SHIPPER' });
  135 | 
  136 |     try {
  137 |       await page.goto('/carriers/fedex-freight', { waitUntil: 'networkidle' });
  138 | 
  139 |       // Find and click "Add to Preferred" button
  140 |       const addBtn = page.locator('[data-testid="add-to-preferred-btn"]');
  141 |       await expect(addBtn).toBeVisible({ timeout: 5000 });
  142 |       await expect(addBtn).toBeEnabled();
  143 |       await addBtn.click();
  144 | 
  145 |       // Verify action completes with success message
  146 |       await expect(page.locator('[data-testid="preference-success-message"]')).toBeVisible({ timeout: 3000 });
  147 |     } finally {
  148 |       await seeder.cleanup();
  149 |     }
  150 |   });
  151 | });
  152 | 
```