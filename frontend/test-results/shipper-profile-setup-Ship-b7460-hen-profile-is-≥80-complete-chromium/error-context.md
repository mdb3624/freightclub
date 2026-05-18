# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shipper-profile-setup.spec.ts >> Shipper Profile Setup — US-713 >> hides banner when profile is ≥80% complete
- Location: e2e\shipper-profile-setup.spec.ts:156:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByLabel('Email')

```

# Test source

```ts
  59  |         })
  60  |       }
  61  |     })
  62  | 
  63  |     await page.route('**/api/v1/profile/completeness', async (route) => {
  64  |       if (route.request().method() === 'GET') {
  65  |         // Return progressively increasing completeness
  66  |         const callCount = (parseInt(route.request().url().split('?')[1]?.split('=')[1] || '1')) || 1
  67  |         if (callCount === 1) {
  68  |           await route.fulfill({
  69  |             status: 200,
  70  |             contentType: 'application/json',
  71  |             body: JSON.stringify({
  72  |               completenessPercent: 0,
  73  |               isPublishReady: false,
  74  |               remainingFields: ['companyName', 'billingEmail', 'phoneNumber', 'city', 'state', 'zipCode'],
  75  |             }),
  76  |           })
  77  |         } else {
  78  |           await route.fulfill({
  79  |             status: 200,
  80  |             contentType: 'application/json',
  81  |             body: JSON.stringify({
  82  |               completenessPercent: 80,
  83  |               isPublishReady: true,
  84  |               remainingFields: [],
  85  |             }),
  86  |           })
  87  |         }
  88  |       }
  89  |     })
  90  | 
  91  |     // Navigate to shipper profile page
  92  |     await page.goto(`${BASE_URL}/shipper/profile`)
  93  | 
  94  |     // Verify form loads
  95  |     await expect(page.locator('text=Company Profile')).toBeVisible()
  96  | 
  97  |     // Fill out the form
  98  |     await page.fill('[placeholder="Apex Freight Solutions LLC"]', 'Apex Freight')
  99  |     await page.fill('[placeholder="billing@company.com"]', 'billing@apex.com')
  100 |     await page.fill('[placeholder="\\(512\\) 555-0182"]', '(512) 555-0182')
  101 |     await page.fill('[placeholder="Austin"]', 'Austin')
  102 |     await page.fill('[placeholder="TX"]', 'TX')
  103 |     await page.fill('[placeholder="78701"]', '78701')
  104 | 
  105 |     // Submit the form
  106 |     await page.click('button:has-text("Save Profile")')
  107 | 
  108 |     // Verify success state (profile now at 80%)
  109 |     await expect(page.locator('text=profile is complete')).toBeVisible()
  110 |   })
  111 | 
  112 |   test('displays completion banner on dashboard when incomplete', async ({ page }) => {
  113 |     // Authenticate
  114 |     await page.goto(`${BASE_URL}/login`)
  115 |     await page.getByLabel('Email').fill('shipper@test.com')
  116 |     await page.getByLabel('Password').fill('N1kk101!')
  117 |     await page.getByRole('button', { name: /sign in/i }).click()
  118 | 
  119 |     const authResult = await Promise.race([
  120 |       page.waitForURL(/dashboard/, { timeout: 3000 }).then(() => true),
  121 |       page.waitForURL(/\/login/, { timeout: 3000 }).then(() => false),
  122 |     ]).catch(() => null)
  123 | 
  124 |     if (authResult !== true) {
  125 |       test.skip(true, 'Test user authentication failed - backend test data not configured')
  126 |     }
  127 | 
  128 |     // Mock incomplete profile
  129 |     await page.route('**/api/v1/profile/completeness', async (route) => {
  130 |       await route.fulfill({
  131 |         status: 200,
  132 |         contentType: 'application/json',
  133 |         body: JSON.stringify({
  134 |           completenessPercent: 40,
  135 |           isPublishReady: false,
  136 |           remainingFields: ['companyName', 'city', 'state', 'zipCode'],
  137 |         }),
  138 |       })
  139 |     })
  140 | 
  141 |     // Navigate to dashboard
  142 |     await page.goto(`${BASE_URL}/dashboard/shipper`)
  143 | 
  144 |     // Verify banner appears
  145 |     await expect(page.locator('role=alert')).toBeVisible()
  146 |     await expect(page.locator('text=Finish your setup')).toBeVisible()
  147 |     await expect(page.locator('text=40% complete')).toBeVisible()
  148 | 
  149 |     // Click "Complete Profile" button in banner
  150 |     await page.click('button:has-text("Complete Profile")')
  151 | 
  152 |     // Verify navigation to profile page
  153 |     await expect(page).toHaveURL(/.*\/shipper\/profile/)
  154 |   })
  155 | 
  156 |   test('hides banner when profile is ≥80% complete', async ({ page }) => {
  157 |     // Authenticate
  158 |     await page.goto(`${BASE_URL}/login`)
> 159 |     await page.getByLabel('Email').fill('shipper@test.com')
      |                                    ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  160 |     await page.getByLabel('Password').fill('N1kk101!')
  161 |     await page.getByRole('button', { name: /sign in/i }).click()
  162 | 
  163 |     const authResult = await Promise.race([
  164 |       page.waitForURL(/dashboard/, { timeout: 3000 }).then(() => true),
  165 |       page.waitForURL(/\/login/, { timeout: 3000 }).then(() => false),
  166 |     ]).catch(() => null)
  167 | 
  168 |     if (authResult !== true) {
  169 |       test.skip(true, 'Test user authentication failed - backend test data not configured')
  170 |     }
  171 | 
  172 |     // Mock complete profile
  173 |     await page.route('**/api/v1/profile/completeness', async (route) => {
  174 |       await route.fulfill({
  175 |         status: 200,
  176 |         contentType: 'application/json',
  177 |         body: JSON.stringify({
  178 |           completenessPercent: 85,
  179 |           isPublishReady: true,
  180 |           remainingFields: [],
  181 |         }),
  182 |       })
  183 |     })
  184 | 
  185 |     // Navigate to dashboard
  186 |     await page.goto(`${BASE_URL}/dashboard/shipper`)
  187 | 
  188 |     // Verify banner is NOT shown
  189 |     const alert = page.locator('role=alert')
  190 |     expect(await alert.count()).toBe(0)
  191 |   })
  192 | 
  193 |   test('validates required fields', async ({ page }) => {
  194 |     // Authenticate first
  195 |     await page.goto(`${BASE_URL}/login`)
  196 |     await page.getByLabel('Email').fill('shipper@test.com')
  197 |     await page.getByLabel('Password').fill('N1kk101!')
  198 |     await page.getByRole('button', { name: /sign in/i }).click()
  199 | 
  200 |     const authResult = await Promise.race([
  201 |       page.waitForURL(/dashboard/, { timeout: 3000 }).then(() => true),
  202 |       page.waitForURL(/\/login/, { timeout: 3000 }).then(() => false),
  203 |     ]).catch(() => null)
  204 | 
  205 |     if (authResult !== true) {
  206 |       test.skip(true, 'Test user authentication failed - backend test data not configured')
  207 |     }
  208 | 
  209 |     await page.route('**/api/v1/profile/company-info', async (route) => {
  210 |       await route.abort()
  211 |     })
  212 | 
  213 |     await page.goto(`${BASE_URL}/shipper/profile`)
  214 | 
  215 |     // Try submitting empty form
  216 |     await page.click('button:has-text("Save Profile")')
  217 | 
  218 |     // Verify validation errors appear
  219 |     await expect(page.locator('text=Company name is required')).toBeVisible()
  220 |     await expect(page.locator('text=Invalid email format')).toBeVisible()
  221 |   })
  222 | 
  223 |   test('validates email format', async ({ page }) => {
  224 |     // Authenticate first
  225 |     await page.goto(`${BASE_URL}/login`)
  226 |     await page.getByLabel('Email').fill('shipper@test.com')
  227 |     await page.getByLabel('Password').fill('N1kk101!')
  228 |     await page.getByRole('button', { name: /sign in/i }).click()
  229 | 
  230 |     const authResult = await Promise.race([
  231 |       page.waitForURL(/dashboard/, { timeout: 3000 }).then(() => true),
  232 |       page.waitForURL(/\/login/, { timeout: 3000 }).then(() => false),
  233 |     ]).catch(() => null)
  234 | 
  235 |     if (authResult !== true) {
  236 |       test.skip(true, 'Test user authentication failed - backend test data not configured')
  237 |     }
  238 | 
  239 |     await page.route('**/api/v1/profile/company-info', async (route) => {
  240 |       await route.abort()
  241 |     })
  242 | 
  243 |     await page.goto(`${BASE_URL}/shipper/profile`)
  244 | 
  245 |     await page.fill('[placeholder="Apex Freight Solutions LLC"]', 'Apex Freight')
  246 |     await page.fill('[placeholder="billing@company.com"]', 'invalid-email')
  247 |     await page.fill('[placeholder="\\(512\\) 555-0182"]', '(512) 555-0182')
  248 |     await page.fill('[placeholder="Austin"]', 'Austin')
  249 |     await page.fill('[placeholder="TX"]', 'TX')
  250 |     await page.fill('[placeholder="78701"]', '78701')
  251 | 
  252 |     await page.click('button:has-text("Save Profile")')
  253 | 
  254 |     await expect(page.locator('text=Invalid email format')).toBeVisible()
  255 |   })
  256 | 
  257 |   test('validates phone format', async ({ page }) => {
  258 |     // Authenticate first
  259 |     await page.goto(`${BASE_URL}/login`)
```