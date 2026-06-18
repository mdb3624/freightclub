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
  - link "Skip to main content" [ref=e5] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e6]:
    - generic [ref=e7]:
      - link "FreightClub" [ref=e9] [cursor=pointer]:
        - /url: /dashboard/shipper
        - img "FreightClub" [ref=e10]
      - generic [ref=e11]:
        - button "Notifications" [ref=e13] [cursor=pointer]:
          - img [ref=e14]
        - button "Profile menu for E2E Test" [ref=e17] [cursor=pointer]: ET
  - main [ref=e18]:
    - generic [ref=e20]:
      - heading "My Profile" [level=1] [ref=e22]
      - generic [ref=e23]:
        - heading "Theme Preferences" [level=3] [ref=e24]
        - radiogroup "Theme mode" [ref=e25]:
          - radio "Light" [ref=e26] [cursor=pointer]
          - radio "Dark" [ref=e27] [cursor=pointer]
          - radio "System" [checked] [ref=e28] [cursor=pointer]
      - generic [ref=e29]:
        - generic [ref=e30]:
          - heading "Company" [level=3] [ref=e31]
          - paragraph [ref=e32]: E2ETest-1781791417954-setup
          - generic [ref=e33]:
            - generic [ref=e34]:
              - paragraph [ref=e35]: Join code
              - paragraph [ref=e36]: WDA8GEGG
            - paragraph [ref=e37]: Share this code with colleagues to add them to your company.
        - generic [ref=e38]:
          - heading "Personal Information" [level=3] [ref=e39]
          - generic [ref=e40]:
            - generic [ref=e41]:
              - generic [ref=e42]: First Name
              - textbox "First Name" [ref=e43]: E2E
            - generic [ref=e44]:
              - generic [ref=e45]: Last Name
              - textbox "Last Name" [ref=e46]: Test
          - generic [ref=e47]:
            - generic [ref=e48]: Business Name
            - textbox "Business Name" [ref=e49]:
              - /placeholder: Optional
          - generic [ref=e50]:
            - generic [ref=e51]: Phone
            - textbox "Phone" [ref=e52]:
              - /placeholder: e.g. 555-123-4567
        - generic [ref=e53]:
          - heading "Billing Address" [level=3] [ref=e54]
          - generic [ref=e55]:
            - generic [ref=e56]:
              - generic [ref=e57]: City
              - textbox "City City" [ref=e58]
            - generic [ref=e59]:
              - generic [ref=e60]: State
              - textbox "State State" [ref=e61]
            - generic [ref=e62]:
              - generic [ref=e63]: Zip Code
              - textbox "Zip Code Zip Code" [ref=e64]
          - generic [ref=e65]:
            - generic [ref=e66]: Street Address
            - textbox "Street Address Street Address" [ref=e67]:
              - /placeholder: e.g. 123 Main St
          - generic [ref=e68]:
            - generic [ref=e69]: Suite / Unit
            - textbox "Suite / Unit Suite / Unit" [ref=e70]:
              - /placeholder: Suite, unit, building (optional)
        - generic [ref=e71]:
          - heading "Default Pickup Location" [level=3] [ref=e72]
          - paragraph [ref=e73]: Pre-fills the origin address when posting a new load.
          - generic [ref=e74]:
            - generic [ref=e75]:
              - generic [ref=e76]: City
              - textbox [ref=e77]
            - generic [ref=e78]:
              - generic [ref=e79]: State
              - textbox [ref=e80]
            - generic [ref=e81]:
              - generic [ref=e82]: Zip Code
              - textbox [ref=e83]
          - generic [ref=e84]:
            - generic [ref=e85]: Street Address
            - textbox "e.g. 456 Warehouse Dr" [ref=e86]
          - generic [ref=e87]:
            - generic [ref=e88]: Suite / Unit
            - textbox "Suite, unit, building (optional)" [ref=e89]
        - generic [ref=e90]:
          - heading "Notification Preferences" [level=3] [ref=e91]
          - generic [ref=e92]:
            - generic [ref=e93] [cursor=pointer]:
              - checkbox "Email notifications" [checked] [ref=e94]
              - generic [ref=e95]: Email notifications
            - generic [ref=e96] [cursor=pointer]:
              - checkbox "SMS notifications" [ref=e97]
              - generic [ref=e98]: SMS notifications
            - generic [ref=e99] [cursor=pointer]:
              - checkbox "In-app notifications" [checked] [ref=e100]
              - generic [ref=e101]: In-app notifications
        - button "Save Changes" [ref=e103] [cursor=pointer]
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
  80  |   test('cost profile fields should persist to backend', async ({ page }) => {
  81  |     try {
  82  |       // Navigate to profile page
  83  |       await page.goto('/profile', { waitUntil: 'networkidle' })
  84  |       await page.waitForLoadState('networkidle')
  85  |       await page.waitForTimeout(1000)
  86  |       await expect(page.locator('text=Cost Profile')).toBeVisible({ timeout: 10000 })
  87  | 
  88  |       // Fill multiple cost profile fields
  89  |       await page.fill('input[placeholder="e.g. 1800"]', '2500')
  90  |       await page.fill('input[placeholder="e.g. 900"]', '1200')
  91  | 
  92  |       // Intercept the PUT request to verify payload
  93  |       const savePromise = page.waitForResponse(
  94  |         response => response.url().includes('/api/v1/profile') && response.request().method() === 'PUT'
  95  |       )
  96  | 
  97  |       // Submit the form
  98  |       await page.click('button:has-text("Save Changes")')
  99  | 
  100 |       // Wait for the API response
  101 |       const response = await savePromise
  102 |       const payload = await response.request().postDataJSON()
  103 | 
  104 |       // Verify cost fields are in the API payload
  105 |       expect(payload.truckPaymentLease).toBe(2500)
  106 |       expect(payload.insurance).toBe(1200)
  107 | 
  108 |       console.log('✓ Cost fields persisted to backend')
  109 |     } catch (error) {
  110 |       console.error('Test failed:', error)
  111 |       throw error
  112 |     }
  113 |   })
  114 | 
  115 |   test('all cost profile fields should persist to backend', async ({ page }) => {
  116 |     try {
  117 |       // Navigate to profile page
  118 |       await page.goto('/profile', { waitUntil: 'networkidle' })
  119 |       await page.waitForLoadState('networkidle')
  120 |       await page.waitForTimeout(1000)
  121 |       await expect(page.locator('text=Cost Profile')).toBeVisible({ timeout: 10000 })
```