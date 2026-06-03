# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shipper-dashboard.spec.ts >> Shipper Dashboard Golden Path (US-715) >> should load dashboard without errors (US-715 AC-6)
- Location: e2e\shipper-dashboard.spec.ts:196:3

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
  114 | 
  115 |         // Verify tab is active
  116 |         await expect(allLoadsTab)
  117 |           .toHaveAttribute('aria-selected', 'true', { timeout: 5000 })
  118 |       }
  119 | 
  120 |     } finally {
  121 |       await seeder.cleanup()
  122 |     }
  123 |   })
  124 | 
  125 |   // ============================================================================
  126 |   // TEST 4: Search functionality filters loads
  127 |   // ============================================================================
  128 |   test('should filter loads using search input (US-715 AC-4)', async ({ page, request }) => {
  129 |     const seeder = new TestDataSeeder(request)
  130 |     const user = await seeder.createTestUser({
  131 |       email: `shipper-${Date.now()}@search.com`,
  132 |       role: 'SHIPPER',
  133 |       firstName: 'SearchTest',
  134 |       lastName: 'User',
  135 |       companyName: 'Search Test Corp'
  136 |     })
  137 | 
  138 |     try {
  139 |       await page.goto('/dashboard/shipper')
  140 | 
  141 |       // Find and interact with search input
  142 |       const searchInput = page.locator('[data-testid="load-search-input"]')
  143 |       if (await searchInput.count() > 0) {
  144 |         await searchInput.fill('test')
  145 | 
  146 |         // Wait for search debounce + API response
  147 |         const searchResponse = page.waitForResponse(
  148 |           response => response.url().includes('/api/v1/loads') && response.status() === 200
  149 |         )
  150 |         await searchResponse
  151 | 
  152 |         // Verify table updates or shows no results
  153 |         await expect(page.locator('[data-testid="load-table"]'))
  154 |           .toBeVisible({ timeout: 5000 })
  155 |       }
  156 | 
  157 |     } finally {
  158 |       await seeder.cleanup()
  159 |     }
  160 |   })
  161 | 
  162 |   // ============================================================================
  163 |   // TEST 5: Can navigate to Post Load form
  164 |   // ============================================================================
  165 |   test('should navigate to Post Load form (US-715 AC-5)', async ({ page, request }) => {
  166 |     const seeder = new TestDataSeeder(request)
  167 |     const user = await seeder.createTestUser({
  168 |       email: `shipper-${Date.now()}@post.com`,
  169 |       role: 'SHIPPER',
  170 |       firstName: 'PostTest',
  171 |       lastName: 'User',
  172 |       companyName: 'Post Test Corp'
  173 |     })
  174 | 
  175 |     try {
  176 |       await page.goto('/dashboard/shipper')
  177 | 
  178 |       // Click post load button
  179 |       const postButton = page.locator('[data-testid="post-load-btn"]')
  180 |       if (await postButton.count() > 0) {
  181 |         await postButton.click()
  182 | 
  183 |         // Verify navigation to post load page
  184 |         await page.waitForURL(/\/shipper\/loads\/new/)
  185 |         expect(page.url()).toContain('/shipper/loads/new')
  186 |       }
  187 | 
  188 |     } finally {
  189 |       await seeder.cleanup()
  190 |     }
  191 |   })
  192 | 
  193 |   // ============================================================================
  194 |   // TEST 6: Dashboard loads without errors
  195 |   // ============================================================================
  196 |   test('should load dashboard without errors (US-715 AC-6)', async ({ page, request }) => {
  197 |     const seeder = new TestDataSeeder(request)
  198 |     const user = await seeder.createTestUser({
  199 |       email: `shipper-${Date.now()}@no-errors.com`,
  200 |       role: 'SHIPPER',
  201 |       firstName: 'NoErrors',
  202 |       lastName: 'User',
  203 |       companyName: 'No Errors Corp'
  204 |     })
  205 | 
  206 |     try {
  207 |       const errors: string[] = []
  208 |       page.on('console', (msg) => {
  209 |         if (msg.type() === 'error') errors.push(msg.text())
  210 |       })
  211 | 
  212 |       await page.goto('/dashboard/shipper')
  213 |       await expect(page.locator('[data-testid="dashboard-container"]'))
> 214 |         .toBeVisible({ timeout: 5000 })
      |          ^ Error: expect(locator).toBeVisible() failed
  215 | 
  216 |       // Filter for critical errors only
  217 |       const criticalErrors = errors.filter(
  218 |         e => !e.includes('warn') && !e.includes('deprecated')
  219 |       )
  220 |       expect(criticalErrors).toHaveLength(0)
  221 | 
  222 |     } finally {
  223 |       await seeder.cleanup()
  224 |     }
  225 |   })
  226 | })
  227 | 
```