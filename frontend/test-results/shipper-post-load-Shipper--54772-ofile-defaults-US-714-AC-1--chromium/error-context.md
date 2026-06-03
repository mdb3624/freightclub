# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shipper-post-load.spec.ts >> Shipper Post Load — US-714 >> should pre-populate origin fields from shipper profile defaults (US-714 AC-1)
- Location: e2e\shipper-post-load.spec.ts:18:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[name="originCity"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('input[name="originCity"]')

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
  1  | /**
  2  |  * Shipper Post Load Tests (US-714)
  3  |  *
  4  |  * Refactored Features (Phase 5 Pattern Rollout):
  5  |  * 1. API-driven test data setup (TestDataSeeder) instead of UI login
  6  |  * 2. Web-first assertions with explicit timeouts
  7  |  * 3. Proper cleanup via seeder.cleanup()
  8  |  * 4. AC traceability in comments
  9  |  */
  10 | 
  11 | import { test, expect } from '@playwright/test'
  12 | import { TestDataSeeder } from './fixtures/test-data-seeder'
  13 | 
  14 | test.describe('Shipper Post Load — US-714', () => {
  15 |   // ============================================================================
  16 |   // TEST 1: Origin fields are pre-populated from profile defaults
  17 |   // ============================================================================
  18 |   test('should pre-populate origin fields from shipper profile defaults (US-714 AC-1)', async ({ page, request }) => {
  19 |     const seeder = new TestDataSeeder(request)
  20 |     const user = await seeder.createTestUser({
  21 |       email: `shipper-post-${Date.now()}@test.com`,
  22 |       role: 'SHIPPER',
  23 |       firstName: 'Shipper',
  24 |       lastName: 'Poster'
  25 |     })
  26 | 
  27 |     try {
  28 |       // Navigate to post load form (API-created user, authenticated)
  29 |       await page.goto('/shipper/loads/new')
  30 | 
  31 |       // Verify origin fields are pre-populated from profile defaults
  32 |       const originCity = page.locator('input[name="originCity"]')
> 33 |       await expect(originCity).toBeVisible({ timeout: 5000 })
     |                                ^ Error: expect(locator).toBeVisible() failed
  34 |       await expect(originCity).not.toHaveValue('')
  35 | 
  36 |       // Verify other origin fields are also populated
  37 |       await expect(page.locator('input[name="originAddress1"]')).not.toHaveValue('')
  38 |       await expect(page.locator('input[name="originZip"]')).not.toHaveValue('')
  39 | 
  40 |       console.log('✅ Origin fields pre-populated from profile defaults')
  41 |     } finally {
  42 |       await seeder.cleanup()
  43 |     }
  44 |   })
  45 | 
  46 |   // ============================================================================
  47 |   // TEST 2: Origin city matches saved profile default
  48 |   // ============================================================================
  49 |   test('should match origin city to saved profile default (US-714 AC-2)', async ({ page, request }) => {
  50 |     const seeder = new TestDataSeeder(request)
  51 |     const user = await seeder.createTestUser({
  52 |       email: `shipper-profile-${Date.now()}@test.com`,
  53 |       role: 'SHIPPER',
  54 |       firstName: 'Profile',
  55 |       lastName: 'Shipper'
  56 |     })
  57 | 
  58 |     try {
  59 |       // Navigate to post load form
  60 |       await page.goto('/shipper/loads/new')
  61 | 
  62 |       // Wait for form to load and profile data to be fetched
  63 |       const originCity = page.locator('input[name="originCity"]')
  64 |       await expect(originCity).toBeVisible({ timeout: 5000 })
  65 | 
  66 |       // Capture the profile data from the form's loaded value
  67 |       const cityCaptured = await originCity.inputValue()
  68 |       expect(cityCaptured).toBeTruthy()
  69 | 
  70 |       // Verify address fields match profile defaults
  71 |       const originAddress = page.locator('input[name="originAddress1"]')
  72 |       const originZip = page.locator('input[name="originZip"]')
  73 | 
  74 |       await expect(originAddress).toHaveValue(/.+/, { timeout: 3000 })
  75 |       await expect(originZip).toHaveValue(/.+/, { timeout: 3000 })
  76 | 
  77 |       console.log('✅ Origin fields match saved profile defaults')
  78 |     } finally {
  79 |       await seeder.cleanup()
  80 |     }
  81 |   })
  82 | })
  83 | 
```