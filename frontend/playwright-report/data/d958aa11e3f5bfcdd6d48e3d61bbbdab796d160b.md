# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shipper-profile-setup.spec.ts >> Shipper Profile Setup — US-713 >> validates phone format
- Location: e2e\shipper-profile-setup.spec.ts:257:3

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
> 260 |     await page.getByLabel('Email').fill('shipper@test.com')
      |                                    ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  261 |     await page.getByLabel('Password').fill('N1kk101!')
  262 |     await page.getByRole('button', { name: /sign in/i }).click()
  263 | 
  264 |     const authResult = await Promise.race([
  265 |       page.waitForURL(/dashboard/, { timeout: 3000 }).then(() => true),
  266 |       page.waitForURL(/\/login/, { timeout: 3000 }).then(() => false),
  267 |     ]).catch(() => null)
  268 | 
  269 |     if (authResult !== true) {
  270 |       test.skip(true, 'Test user authentication failed - backend test data not configured')
  271 |     }
  272 | 
  273 |     await page.route('**/api/v1/profile/company-info', async (route) => {
  274 |       await route.abort()
  275 |     })
  276 | 
  277 |     await page.goto(`${BASE_URL}/shipper/profile`)
  278 | 
  279 |     await page.fill('[placeholder="Apex Freight Solutions LLC"]', 'Apex Freight')
  280 |     await page.fill('[placeholder="billing@company.com"]', 'billing@apex.com')
  281 |     await page.fill('[placeholder="\\(512\\) 555-0182"]', '512-555-0182') // Invalid format
  282 |     await page.fill('[placeholder="Austin"]', 'Austin')
  283 |     await page.fill('[placeholder="TX"]', 'TX')
  284 |     await page.fill('[placeholder="78701"]', '78701')
  285 | 
  286 |     await page.click('button:has-text("Save Profile")')
  287 | 
  288 |     await expect(page.locator('text=Phone format')).toBeVisible()
  289 |   })
  290 | })
  291 | 
```