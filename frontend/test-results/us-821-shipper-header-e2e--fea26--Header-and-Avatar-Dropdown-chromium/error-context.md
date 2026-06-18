# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: us-821-shipper-header-e2e.spec.ts >> US-821: Shipper Dashboard with Header and Avatar Dropdown
- Location: e2e\us-821-shipper-header-e2e.spec.ts:15:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | /**
  4   |  * US-821: Shipper Dashboard Header E2E Test
  5   |  *
  6   |  * Properly tests the complete flow:
  7   |  * 1. Seed test shipper user into database
  8   |  * 2. Login through Playwright (normal login screen)
  9   |  * 3. Navigate to Shipper Dashboard
  10  |  * 4. Capture evidence of header with avatar dropdown
  11  |  *
  12  |  * No bypassing login - uses real authentication flow
  13  |  */
  14  | 
  15  | test('US-821: Shipper Dashboard with Header and Avatar Dropdown', async ({
  16  |   page,
  17  |   context,
  18  | }) => {
  19  |   const testEmail = `shipper-${Date.now()}@freightclub.local`
  20  |   const testPassword = 'TestPassword123!'
  21  | 
  22  |   // Step 1: Register shipper user via backend API
  23  |   const registerRes = await page.request.post('http://localhost:9091/api/v1/auth/register', {
  24  |     data: {
  25  |       email: testEmail,
  26  |       password: testPassword,
  27  |       role: 'SHIPPER',
  28  |       firstName: 'Test',
  29  |       lastName: 'Shipper',
  30  |       businessName: 'Test Shipping Company',
  31  |       phone: '+1-555-0123',
  32  |       billingCity: 'San Francisco',
  33  |     },
  34  |   })
  35  | 
  36  |   console.log(`Registration: ${registerRes.status()} - ${testEmail}`)
> 37  |   expect(registerRes.ok() || registerRes.status() === 409).toBe(true)
      |                                                            ^ Error: expect(received).toBe(expected) // Object.is equality
  38  | 
  39  |   // Step 2: Navigate to login page (normal flow)
  40  |   await page.goto('http://localhost:9090/login')
  41  |   await page.waitForLoadState('networkidle')
  42  | 
  43  |   // Step 3: Fill login form and submit
  44  |   await page.fill('input[type="email"]', testEmail)
  45  |   await page.fill('input[type="password"]', testPassword)
  46  | 
  47  |   const loginBtn = await page.locator('button').filter({ hasText: /login|sign in/i }).first()
  48  |   await loginBtn.click()
  49  | 
  50  |   // Step 4: Wait for redirect to dashboard
  51  |   await page.waitForURL(/dashboard|home/i, { timeout: 10000 })
  52  |   await page.waitForLoadState('networkidle')
  53  | 
  54  |   // Step 5: Navigate to shipper dashboard
  55  |   await page.goto('http://localhost:9090/dashboard/shipper')
  56  |   await page.waitForLoadState('networkidle')
  57  | 
  58  |   // Step 6: Verify header is present
  59  |   const header = await page.locator('[data-testid="shipper-page-header"]')
  60  |   await expect(header).toBeVisible()
  61  | 
  62  |   console.log('✅ ShipperPageHeader visible')
  63  | 
  64  |   // Step 7: Verify header components
  65  |   const logo = await page.locator('img[alt="FreightClub"]').isVisible()
  66  |   const lastUpdated = await page.locator('text=/Last updated/i').isVisible()
  67  |   const avatar = await page.locator('[data-testid="avatar-button"]').isVisible()
  68  | 
  69  |   expect(logo).toBe(true)
  70  |   expect(lastUpdated).toBe(true)
  71  |   expect(avatar).toBe(true)
  72  | 
  73  |   console.log('✅ Header elements verified:')
  74  |   console.log(`  - Logo: ${logo ? '✓' : '✗'}`)
  75  |   console.log(`  - Timestamp: ${lastUpdated ? '✓' : '✗'}`)
  76  |   console.log(`  - Avatar: ${avatar ? '✓' : '✗'}`)
  77  | 
  78  |   // Step 8: Capture full page screenshot
  79  |   await page.screenshot({
  80  |     path: 'test-results/evidence/us-821-shipper-dashboard-header.png',
  81  |     fullPage: true,
  82  |   })
  83  |   console.log('✅ Screenshot captured: us-821-shipper-dashboard-header.png')
  84  | 
  85  |   // Step 9: Click avatar to open dropdown
  86  |   const avatarButton = await page.locator('[data-testid="avatar-button"]')
  87  |   await avatarButton.click()
  88  | 
  89  |   // Wait for dropdown to appear
  90  |   const dropdown = await page.locator('[data-testid="avatar-dropdown"]')
  91  |   await expect(dropdown).toBeVisible({ timeout: 2000 })
  92  | 
  93  |   console.log('✅ Avatar dropdown opened')
  94  | 
  95  |   // Step 10: Verify dropdown menu items
  96  |   const profileLink = await page.locator('text=/Profile/i').isVisible()
  97  |   const settingsLink = await page.locator('text=/Settings/i').isVisible()
  98  |   const signoutLink = await page.locator('text=/Sign out/i').isVisible()
  99  | 
  100 |   expect(profileLink).toBe(true)
  101 |   expect(settingsLink).toBe(true)
  102 |   expect(signoutLink).toBe(true)
  103 | 
  104 |   console.log('✅ Dropdown menu items verified:')
  105 |   console.log(`  - Profile: ${profileLink ? '✓' : '✗'}`)
  106 |   console.log(`  - Settings: ${settingsLink ? '✓' : '✗'}`)
  107 |   console.log(`  - Sign out: ${signoutLink ? '✓' : '✗'}`)
  108 | 
  109 |   // Step 11: Capture dropdown screenshot
  110 |   await page.screenshot({
  111 |     path: 'test-results/evidence/us-821-avatar-dropdown-menu.png',
  112 |     fullPage: false,
  113 |   })
  114 |   console.log('✅ Screenshot captured: us-821-avatar-dropdown-menu.png')
  115 | 
  116 |   // Step 12: Verify user info in dropdown
  117 |   const userEmail = await page.locator('text=' + testEmail).isVisible()
  118 |   const userName = await page.locator('text=/Test Shipper/i').isVisible()
  119 | 
  120 |   expect(userEmail).toBe(true)
  121 |   expect(userName).toBe(true)
  122 | 
  123 |   console.log('✅ User info in dropdown verified:')
  124 |   console.log(`  - Email: ${userEmail ? '✓' : '✗'}`)
  125 |   console.log(`  - Name: ${userName ? '✓' : '✗'}`)
  126 | 
  127 |   // Step 13: Verify avatar shows correct initials (TS for Test Shipper)
  128 |   const avatarText = await avatarButton.textContent()
  129 |   expect(avatarText?.trim()).toBe('TS')
  130 | 
  131 |   console.log(`✅ Avatar initials verified: ${avatarText?.trim()}`)
  132 | 
  133 |   // Step 14: Click profile to verify navigation
  134 |   const profileMenuItem = await page.locator('button').filter({ hasText: 'Profile' }).first()
  135 |   await profileMenuItem.click()
  136 | 
  137 |   // Wait for navigation to profile page
```