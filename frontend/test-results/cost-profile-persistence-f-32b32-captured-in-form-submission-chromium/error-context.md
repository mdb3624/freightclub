# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cost-profile-persistence-fix.spec.ts >> Cost Profile Persistence Fix Verification >> cost profile fields should be captured in form submission
- Location: e2e\cost-profile-persistence-fix.spec.ts:11:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Cost Profile')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('text=Cost Profile')

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
  1   | /**
  2   |  * Cost Profile Persistence Fix Verification (US-900 Critical Issue #1)
  3   |  *
  4   |  * Tests that cost profile fields now persist when saved to backend.
  5   |  * Root cause fix: All cost fields added to React Hook Form defaultValues
  6   |  */
  7   | 
  8   | import { test, expect } from '@playwright/test'
  9   | 
  10  | test.describe('Cost Profile Persistence Fix Verification', () => {
  11  |   test('cost profile fields should be captured in form submission', async ({ page }) => {
  12  |     try {
  13  |       // Navigate to profile page (already authenticated via auth.json from global setup)
  14  |       await page.goto('/profile', { waitUntil: 'networkidle' })
  15  | 
  16  |       // Wait for page to fully load including auth initialization
  17  |       await page.waitForLoadState('networkidle')
  18  |       await page.waitForTimeout(1000)
  19  | 
  20  |       // Wait for Cost Profile section to load (specific to TRUCKER users)
> 21  |       await expect(page.locator('text=Cost Profile')).toBeVisible({ timeout: 10000 })
      |                                                       ^ Error: expect(locator).toBeVisible() failed
  22  | 
  23  |       // Fill multiple cost profile fields
  24  |       await page.fill('input[placeholder="e.g. 1800"]', '1800')  // Truck Payment
  25  |       await page.fill('input[placeholder="e.g. 900"]', '900')    // Insurance
  26  |       await page.fill('input[placeholder="e.g. 3.89"]', '3.50')  // Fuel Price
  27  |       await page.fill('input[placeholder="e.g. 6.5"]', '6.5')    // MPG
  28  | 
  29  |       // Verify fields are captured in form data (watch() hook)
  30  |       const truckPaymentValue = await page.inputValue('input[placeholder="e.g. 1800"]')
  31  |       const insuranceValue = await page.inputValue('input[placeholder="e.g. 900"]')
  32  |       const fuelValue = await page.inputValue('input[placeholder="e.g. 3.89"]')
  33  |       const mpgValue = await page.inputValue('input[placeholder="e.g. 6.5"]')
  34  | 
  35  |       expect(truckPaymentValue).toBe('1800')
  36  |       expect(insuranceValue).toBe('900')
  37  |       expect(fuelValue).toBe('3.50')
  38  |       expect(mpgValue).toBe('6.5')
  39  | 
  40  |       console.log('✓ Cost fields captured in form')
  41  | 
  42  |       // Intercept the PUT request to verify payload
  43  |       const apiPromise = page.waitForResponse(
  44  |         response => response.url().includes('/api/v1/profile') && response.request().method() === 'PUT'
  45  |       )
  46  | 
  47  |       // Submit the form
  48  |       await page.click('button:has-text("Save Changes")')
  49  | 
  50  |       // Wait for the API response
  51  |       const response = await apiPromise
  52  |       const payload = await response.request().postDataJSON()
  53  | 
  54  |       console.log('✓ API request intercepted')
  55  |       console.log('  Payload:', JSON.stringify(payload, null, 2))
  56  | 
  57  |       // Verify cost fields are in the API payload
  58  |       expect(payload).toHaveProperty('truckPaymentLease')
  59  |       expect(payload.truckPaymentLease).toBe(1800)
  60  |       expect(payload).toHaveProperty('insurance')
  61  |       expect(payload.insurance).toBe(900)
  62  |       expect(payload).toHaveProperty('fuelCostPerGallon')
  63  |       expect(payload.fuelCostPerGallon).toBe(3.50)
  64  |       expect(payload).toHaveProperty('milesPerGallon')
  65  |       expect(payload.milesPerGallon).toBe(6.5)
  66  | 
  67  |       console.log('✓ Cost fields present in API payload')
  68  | 
  69  |       // Wait for success message
  70  |       await expect(page.locator('text=Profile saved successfully').or(page.locator('text=saved')))
  71  |         .toBeVisible({ timeout: 5000 })
  72  | 
  73  |       console.log('✓ Profile save successful')
  74  |     } catch (error) {
  75  |       console.error('Test failed:', error)
  76  |       throw error
  77  |     }
  78  |   })
  79  | 
  80  |   test('cost profile fields should persist after page navigation', async ({ page }) => {
  81  |     try {
  82  |       // Navigate to profile and fill cost fields (already authenticated via auth.json)
  83  |       await page.goto('/profile', { waitUntil: 'networkidle' })
  84  |       await page.waitForLoadState('networkidle')
  85  |       await page.waitForTimeout(1000)
  86  |       await expect(page.locator('text=Cost Profile')).toBeVisible({ timeout: 10000 })
  87  | 
  88  |       // Fill fields
  89  |       await page.fill('input[placeholder="e.g. 1800"]', '2500')
  90  |       await page.fill('input[placeholder="e.g. 900"]', '1200')
  91  | 
  92  |       // Save
  93  |       const savePromise = page.waitForResponse(
  94  |         response => response.url().includes('/api/v1/profile') && response.status() === 200
  95  |       )
  96  |       await page.click('button:has-text("Save Changes")')
  97  |       await savePromise
  98  | 
  99  |       // Wait for success
  100 |       await expect(page.locator('text=Profile saved successfully').or(page.locator('text=saved')))
  101 |         .toBeVisible({ timeout: 5000 })
  102 | 
  103 |       console.log('✓ Cost fields saved')
  104 | 
  105 |       // Navigate away (go to home)
  106 |       await page.goto('/')
  107 |       await expect(page.locator('text=Dashboard').or(page.locator('text=Profile')))
  108 |         .toBeVisible({ timeout: 5000 })
  109 | 
  110 |       // Navigate back to profile
  111 |       await page.goto('/profile')
  112 |       await expect(page.locator('text=Cost Profile')).toBeVisible({ timeout: 5000 })
  113 | 
  114 |       // Verify fields persisted
  115 |       const truckPaymentAfter = await page.inputValue('input[placeholder="e.g. 1800"]')
  116 |       const insuranceAfter = await page.inputValue('input[placeholder="e.g. 900"]')
  117 | 
  118 |       expect(truckPaymentAfter).toBe('2500')
  119 |       expect(insuranceAfter).toBe('1200')
  120 | 
  121 |       console.log('✓ Cost fields persisted after navigation')
```