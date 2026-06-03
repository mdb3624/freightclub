# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shipper-profile-multi-tenant.spec.ts >> Shipper Profile - Multi-Tenancy Verification >> Multi-tenancy: Shipper loads are isolated by tenant
- Location: e2e\shipper-profile-multi-tenant.spec.ts:109:3

# Error details

```
TypeError: _context$browser3.newContext is not a function
```

# Test source

```ts
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
  46  |       const context1 = await context.browser?.newContext();
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
> 129 |       const context1 = await context.browser?.newContext();
      |                                               ^ TypeError: _context$browser3.newContext is not a function
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
  147 |       // Context 2: Shipper 2 navigates to load board
  148 |       const context2 = await context.browser?.newContext();
  149 |       const page2 = await context2!.newPage();
  150 | 
  151 |       await page2.evaluate((data) => {
  152 |         localStorage.setItem('freightclub_access_token', data.accessToken);
  153 |         localStorage.setItem('freightclub_user', JSON.stringify({
  154 |           id: data.id,
  155 |           email: data.email,
  156 |           role: 'SHIPPER',
  157 |           tenantId: data.tenantId,
  158 |         }));
  159 |       }, shipper2);
  160 | 
  161 |       await page2.goto('/dashboard', { waitUntil: 'networkidle' });
  162 | 
  163 |       // Verify shipper2 sees dashboard
  164 |       await expect(page2.locator('[data-testid="dashboard-container"]')).toBeVisible({ timeout: 5000 });
  165 | 
  166 |       // Both should see their respective tenant's data (isolation verified at API level)
  167 |       // This is implicitly tested since each seeder is isolated by tenant context
  168 | 
  169 |       // Cleanup
  170 |       await page1.close();
  171 |       await context1!.close();
  172 |       await page2.close();
  173 |       await context2!.close();
  174 |     } finally {
  175 |       await seeder1.cleanup();
  176 |       await seeder2.cleanup();
  177 |     }
  178 |   });
  179 | });
  180 | 
```