# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shipper-profile-setup.spec.ts >> Shipper Profile Setup — US-713 >> golden path: shipper completes profile and reaches 80% threshold
- Location: e2e\shipper-profile-setup.spec.ts:16:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/login
Call log:
  - navigating to "http://localhost:5173/login", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5173'
  4   | 
  5   | test.describe('Shipper Profile Setup — US-713', () => {
  6   |   test.beforeEach(async ({ page }) => {
  7   |     // Navigate to login
> 8   |     await page.goto(`${BASE_URL}/login`)
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/login
  9   | 
  10  |     // Mock profile completeness API (returns incomplete profile)
  11  |     await page.route('**/api/v1/profile/completeness', async (route) => {
  12  |       await route.abort()
  13  |     })
  14  |   })
  15  | 
  16  |   test('golden path: shipper completes profile and reaches 80% threshold', async ({ page }) => {
  17  |     // Setup: Login as shipper (mock the auth flow)
  18  |     await page.goto(`${BASE_URL}/login`)
  19  | 
  20  |     // Intercept the profile endpoints
  21  |     await page.route('**/api/v1/profile/company-info', async (route) => {
  22  |       if (route.request().method() === 'GET') {
  23  |         // Return no existing profile on first load
  24  |         await route.abort()
  25  |       } else if (route.request().method() === 'POST') {
  26  |         // Return the saved profile with 80% completeness
  27  |         const body = await route.request().postDataJSON()
  28  |         await route.fulfill({
  29  |           status: 201,
  30  |           contentType: 'application/json',
  31  |           body: JSON.stringify({
  32  |             id: 'profile-1',
  33  |             companyName: body.companyName,
  34  |             billingEmail: body.billingEmail,
  35  |             phoneNumber: body.phoneNumber,
  36  |             city: body.city,
  37  |             state: body.state,
  38  |             zipCode: body.zipCode,
  39  |             mcNumber: body.mcNumber || null,
  40  |             usdotNumber: body.usdotNumber || null,
  41  |             logoUrl: body.logoUrl || null,
  42  |             completenessPercent: 80,
  43  |             createdAt: new Date().toISOString(),
  44  |             updatedAt: new Date().toISOString(),
  45  |           }),
  46  |         })
  47  |       }
  48  |     })
  49  | 
  50  |     await page.route('**/api/v1/profile/completeness', async (route) => {
  51  |       if (route.request().method() === 'GET') {
  52  |         // Return progressively increasing completeness
  53  |         const callCount = (parseInt(route.request().url().split('?')[1]?.split('=')[1] || '1')) || 1
  54  |         if (callCount === 1) {
  55  |           await route.fulfill({
  56  |             status: 200,
  57  |             contentType: 'application/json',
  58  |             body: JSON.stringify({
  59  |               completenessPercent: 0,
  60  |               isPublishReady: false,
  61  |               remainingFields: ['companyName', 'billingEmail', 'phoneNumber', 'city', 'state', 'zipCode'],
  62  |             }),
  63  |           })
  64  |         } else {
  65  |           await route.fulfill({
  66  |             status: 200,
  67  |             contentType: 'application/json',
  68  |             body: JSON.stringify({
  69  |               completenessPercent: 80,
  70  |               isPublishReady: true,
  71  |               remainingFields: [],
  72  |             }),
  73  |           })
  74  |         }
  75  |       }
  76  |     })
  77  | 
  78  |     // Navigate to shipper profile page
  79  |     await page.goto(`${BASE_URL}/shipper/profile`)
  80  | 
  81  |     // Verify form loads
  82  |     await expect(page.locator('text=Company Profile')).toBeVisible()
  83  | 
  84  |     // Fill out the form
  85  |     await page.fill('[placeholder="Apex Freight Solutions LLC"]', 'Apex Freight')
  86  |     await page.fill('[placeholder="billing@company.com"]', 'billing@apex.com')
  87  |     await page.fill('[placeholder="\\(512\\) 555-0182"]', '(512) 555-0182')
  88  |     await page.fill('[placeholder="Austin"]', 'Austin')
  89  |     await page.fill('[placeholder="TX"]', 'TX')
  90  |     await page.fill('[placeholder="78701"]', '78701')
  91  | 
  92  |     // Submit the form
  93  |     await page.click('button:has-text("Save Profile")')
  94  | 
  95  |     // Verify success state (profile now at 80%)
  96  |     await expect(page.locator('text=profile is complete')).toBeVisible()
  97  |   })
  98  | 
  99  |   test('displays completion banner on dashboard when incomplete', async ({ page }) => {
  100 |     // Mock incomplete profile
  101 |     await page.route('**/api/v1/profile/completeness', async (route) => {
  102 |       await route.fulfill({
  103 |         status: 200,
  104 |         contentType: 'application/json',
  105 |         body: JSON.stringify({
  106 |           completenessPercent: 40,
  107 |           isPublishReady: false,
  108 |           remainingFields: ['companyName', 'city', 'state', 'zipCode'],
```