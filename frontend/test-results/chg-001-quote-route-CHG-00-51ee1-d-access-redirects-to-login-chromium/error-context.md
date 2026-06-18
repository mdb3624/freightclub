# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chg-001-quote-route.spec.ts >> CHG-001: Quote Request Route >> Route is protected: unauthenticated access redirects to login
- Location: e2e\chg-001-quote-route.spec.ts:149:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/login/
Received string:  "http://localhost:9090/shipper/quote"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    9 × unexpected value "http://localhost:9090/shipper/quote"

```

# Page snapshot

```yaml
- generic [ref=e5]:
  - heading "Get A Quote" [level=1] [ref=e6]
  - paragraph [ref=e7]: The quote request feature is coming soon. We're building an enhanced quote management system to help you streamline your shipping requests.
  - paragraph [ref=e9]:
    - strong [ref=e10]: "Expected availability:"
    - text: Next sprint. Check back soon!
  - button "← Back to Dashboard" [ref=e12] [cursor=pointer]
```

# Test source

```ts
  51  | 
  52  |       // AC-3: Placeholder message visible
  53  |       const message = page.locator('text=Quote request feature coming soon')
  54  |       await expect(message).toBeVisible()
  55  | 
  56  |       // AC-3: AppShell wrapper visible (header should contain nav or app-shell class)
  57  |       const appShell = page.locator('[class*="app-shell"], header, nav')
  58  |       await expect(appShell.first()).toBeVisible()
  59  | 
  60  |       await page.screenshot({ path: 'test-results/evidence/chg-001-ac1-route-renders.png', fullPage: true })
  61  |     } finally {
  62  |       await seeder.cleanup()
  63  |     }
  64  |   })
  65  | 
  66  |   // AC-2: Button Navigation Works
  67  |   test('AC-2: "Get A Quote" button from dashboard navigates to /shipper/quote', async ({ page, request }) => {
  68  |     const seeder = new TestDataSeeder(request)
  69  |     const user = await seeder.createTestUser({
  70  |       email: `quote-btn-${Date.now()}@test.com`,
  71  |       role: 'SHIPPER',
  72  |       firstName: 'Button',
  73  |       lastName: 'Tester',
  74  |       companyName: 'Button Test Corp',
  75  |     })
  76  | 
  77  |     try {
  78  |       await setUserAuth(page, user)
  79  | 
  80  |       // Navigate to dashboard
  81  |       await page.goto('/dashboard/shipper', { waitUntil: 'domcontentloaded' })
  82  | 
  83  |       // Find and click "Get A Quote" button
  84  |       const quoteButton = page.locator('[data-testid="quick-actions-quote"]')
  85  |       await expect(quoteButton).toBeVisible({ timeout: 5000 })
  86  |       await quoteButton.click()
  87  | 
  88  |       // AC-2: Should navigate to /shipper/quote without errors
  89  |       await page.waitForURL('**/shipper/quote', { timeout: 5000 })
  90  |       expect(page.url()).toContain('/shipper/quote')
  91  | 
  92  |       // Verify page loads without console errors
  93  |       const errors: string[] = []
  94  |       page.on('console', msg => {
  95  |         if (msg.type() === 'error') {
  96  |           errors.push(msg.text())
  97  |         }
  98  |       })
  99  | 
  100 |       await expect(page.locator('h1:has-text("Get A Quote")')).toBeVisible()
  101 |       expect(errors).toHaveLength(0)
  102 | 
  103 |       await page.screenshot({ path: 'test-results/evidence/chg-001-ac2-button-nav.png', fullPage: true })
  104 |     } finally {
  105 |       await seeder.cleanup()
  106 |     }
  107 |   })
  108 | 
  109 |   // AC-3: Stub Component Meets MVP
  110 |   test('AC-3: QuoteRequestPage stub displays heading, message, and AppShell', async ({ page, request }) => {
  111 |     const seeder = new TestDataSeeder(request)
  112 |     const user = await seeder.createTestUser({
  113 |       email: `quote-stub-${Date.now()}@test.com`,
  114 |       role: 'SHIPPER',
  115 |       firstName: 'Stub',
  116 |       lastName: 'Tester',
  117 |       companyName: 'Stub Test Corp',
  118 |     })
  119 | 
  120 |     try {
  121 |       await setUserAuth(page, user)
  122 | 
  123 |       await page.goto('/shipper/quote', { waitUntil: 'domcontentloaded' })
  124 | 
  125 |       // AC-3: Heading "Get A Quote" visible (h1)
  126 |       const h1 = page.locator('h1:has-text("Get A Quote")')
  127 |       await expect(h1).toBeVisible()
  128 | 
  129 |       // AC-3: Placeholder message visible
  130 |       const message = page.locator('text=Quote request feature coming soon')
  131 |       await expect(message).toBeVisible()
  132 | 
  133 |       // AC-3: AppShell header visible (indicates AppShell wrapper present + navigation available)
  134 |       const header = page.locator('header, [role="banner"]')
  135 |       await expect(header.first()).toBeVisible({ timeout: 5000 })
  136 | 
  137 |       // AC-3: Navigation back to dashboard is available via AppShell header
  138 |       // (Users can click logo or use browser back; explicit back button not required on stub)
  139 |       const logo = page.locator('[data-testid="app-logo"], a[href="/"]')
  140 |       await expect(logo.or(header.first())).toBeVisible()
  141 | 
  142 |       await page.screenshot({ path: 'test-results/evidence/chg-001-ac3-stub-meets-mvp.png', fullPage: true })
  143 |     } finally {
  144 |       await seeder.cleanup()
  145 |     }
  146 |   })
  147 | 
  148 |   // Unauthenticated access should be blocked (ProtectedRoute)
  149 |   test('Route is protected: unauthenticated access redirects to login', async ({ page }) => {
  150 |     await page.goto('/shipper/quote', { waitUntil: 'domcontentloaded' })
> 151 |     await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  152 |   })
  153 | })
  154 | 
```