# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shipper-profile-multi-tenant.spec.ts >> Shipper Profile - Multi-Tenancy Verification >> Multi-tenancy: Shipper1 profile is isolated from Shipper2
- Location: e2e\shipper-profile-multi-tenant.spec.ts:25:3

# Error details

```
TypeError: _context$browser.newContext is not a function
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { TestDataSeeder } from './fixtures/test-data-seeder';
  3   | 
  4   | /**
  5   |  * Multi-Tenancy Verification for Shipper Profile
  6   |  *
  7   |  * Refactored Features (Phase 5 Pattern Rollout):
  8   |  * 1. Uses data-testid selectors (mandatory per testing_standards.md)
  9   |  * 2. Web-first assertions instead of hard-coded waits
  10  |  * 3. API-driven test data setup (TestDataSeeder) instead of UI login
  11  |  * 4. Separate browser contexts for tenant isolation verification
  12  |  * 5. Traces generated on failure for debugging
  13  |  */
  14  | test.describe('Shipper Profile - Multi-Tenancy Verification', () => {
  15  |   test.beforeEach(async ({ page, context }) => {
  16  |     // Clear auth state
  17  |     await context.clearCookies();
  18  |     try {
  19  |       await page.evaluate(() => localStorage.clear());
  20  |     } catch {
  21  |       // localStorage may not be accessible
  22  |     }
  23  |   });
  24  | 
  25  |   test('Multi-tenancy: Shipper1 profile is isolated from Shipper2', async ({ request, context }) => {
  26  |     // Create two separate seeder instances for two different shippers
  27  |     const seeder1 = new TestDataSeeder(request);
  28  |     const seeder2 = new TestDataSeeder(request);
  29  | 
  30  |     const shipper1 = await seeder1.createTestUser({
  31  |       role: 'SHIPPER',
  32  |       email: `shipper1-${Date.now()}@test.com`,
  33  |       firstName: 'Shipper',
  34  |       lastName: 'One',
  35  |     });
  36  | 
  37  |     const shipper2 = await seeder2.createTestUser({
  38  |       role: 'SHIPPER',
  39  |       email: `shipper2-${Date.now()}@test.com`,
  40  |       firstName: 'Shipper',
  41  |       lastName: 'Two',
  42  |     });
  43  | 
  44  |     try {
  45  |       // Context 1: Shipper 1 navigates to their profile
> 46  |       const context1 = await context.browser?.newContext();
      |                                               ^ TypeError: _context$browser.newContext is not a function
  47  |       const page1 = await context1!.newPage();
  48  | 
  49  |       // Store shipper1's auth in localStorage
  50  |       await page1.evaluate((data) => {
  51  |         localStorage.setItem('freightclub_access_token', data.accessToken);
  52  |         localStorage.setItem('freightclub_user', JSON.stringify({
  53  |           id: data.id,
  54  |           email: data.email,
  55  |           role: 'SHIPPER',
  56  |           tenantId: data.tenantId,
  57  |         }));
  58  |       }, shipper1);
  59  | 
  60  |       await page1.goto('/profile', { waitUntil: 'networkidle' });
  61  | 
  62  |       // Shipper1 should see their profile page
  63  |       await expect(page1.locator('[data-testid="profile-page"]')).toBeVisible({ timeout: 5000 });
  64  | 
  65  |       // Verify shipper1's tenant context
  66  |       const shipper1TenantSpan = page1.locator('[data-testid="current-tenant-id"]');
  67  |       const shipper1Tenant = await shipper1TenantSpan.textContent({ timeout: 3000 });
  68  |       expect(shipper1Tenant).toContain(shipper1.tenantId);
  69  | 
  70  |       // Context 2: Shipper 2 navigates to their profile
  71  |       const context2 = await context.browser?.newContext();
  72  |       const page2 = await context2!.newPage();
  73  | 
  74  |       // Store shipper2's auth in localStorage
  75  |       await page2.evaluate((data) => {
  76  |         localStorage.setItem('freightclub_access_token', data.accessToken);
  77  |         localStorage.setItem('freightclub_user', JSON.stringify({
  78  |           id: data.id,
  79  |           email: data.email,
  80  |           role: 'SHIPPER',
  81  |           tenantId: data.tenantId,
  82  |         }));
  83  |       }, shipper2);
  84  | 
  85  |       await page2.goto('/profile', { waitUntil: 'networkidle' });
  86  | 
  87  |       // Shipper2 should see their profile page
  88  |       await expect(page2.locator('[data-testid="profile-page"]')).toBeVisible({ timeout: 5000 });
  89  | 
  90  |       // Verify shipper2's tenant context (different from shipper1)
  91  |       const shipper2TenantSpan = page2.locator('[data-testid="current-tenant-id"]');
  92  |       const shipper2Tenant = await shipper2TenantSpan.textContent({ timeout: 3000 });
  93  |       expect(shipper2Tenant).toContain(shipper2.tenantId);
  94  | 
  95  |       // Verify tenants are different
  96  |       expect(shipper1Tenant).not.toEqual(shipper2Tenant);
  97  | 
  98  |       // Cleanup contexts
  99  |       await page1.close();
  100 |       await context1!.close();
  101 |       await page2.close();
  102 |       await context2!.close();
  103 |     } finally {
  104 |       await seeder1.cleanup();
  105 |       await seeder2.cleanup();
  106 |     }
  107 |   });
  108 | 
  109 |   test('Multi-tenancy: Shipper loads are isolated by tenant', async ({ request, context }) => {
  110 |     const seeder1 = new TestDataSeeder(request);
  111 |     const seeder2 = new TestDataSeeder(request);
  112 | 
  113 |     const shipper1 = await seeder1.createTestUser({
  114 |       role: 'SHIPPER',
  115 |       email: `shipper1-${Date.now()}@test.com`,
  116 |       firstName: 'Shipper',
  117 |       lastName: 'One',
  118 |     });
  119 | 
  120 |     const shipper2 = await seeder2.createTestUser({
  121 |       role: 'SHIPPER',
  122 |       email: `shipper2-${Date.now()}@test.com`,
  123 |       firstName: 'Shipper',
  124 |       lastName: 'Two',
  125 |     });
  126 | 
  127 |     try {
  128 |       // Context 1: Shipper 1 navigates to load board
  129 |       const context1 = await context.browser?.newContext();
  130 |       const page1 = await context1!.newPage();
  131 | 
  132 |       await page1.evaluate((data) => {
  133 |         localStorage.setItem('freightclub_access_token', data.accessToken);
  134 |         localStorage.setItem('freightclub_user', JSON.stringify({
  135 |           id: data.id,
  136 |           email: data.email,
  137 |           role: 'SHIPPER',
  138 |           tenantId: data.tenantId,
  139 |         }));
  140 |       }, shipper1);
  141 | 
  142 |       await page1.goto('/dashboard', { waitUntil: 'networkidle' });
  143 | 
  144 |       // Verify shipper1 sees dashboard
  145 |       await expect(page1.locator('[data-testid="dashboard-container"]')).toBeVisible({ timeout: 5000 });
  146 | 
```