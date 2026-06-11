import { test, expect } from '@playwright/test'

/**
 * US-821: Shipper Dashboard Header E2E Test
 *
 * Properly tests the complete flow:
 * 1. Seed test shipper user into database
 * 2. Login through Playwright (normal login screen)
 * 3. Navigate to Shipper Dashboard
 * 4. Capture evidence of header with avatar dropdown
 *
 * No bypassing login - uses real authentication flow
 */

test('US-821: Shipper Dashboard with Header and Avatar Dropdown', async ({
  page,
  context,
}) => {
  const testEmail = `shipper-${Date.now()}@freightclub.local`
  const testPassword = 'TestPassword123!'

  // Step 1: Register shipper user via backend API
  const registerRes = await page.request.post('http://localhost:9091/api/v1/auth/register', {
    data: {
      email: testEmail,
      password: testPassword,
      role: 'SHIPPER',
      firstName: 'Test',
      lastName: 'Shipper',
      businessName: 'Test Shipping Company',
      phone: '+1-555-0123',
      billingCity: 'San Francisco',
    },
  })

  console.log(`Registration: ${registerRes.status()} - ${testEmail}`)
  expect(registerRes.ok() || registerRes.status() === 409).toBe(true)

  // Step 2: Navigate to login page (normal flow)
  await page.goto('http://localhost:9090/login')
  await page.waitForLoadState('networkidle')

  // Step 3: Fill login form and submit
  await page.fill('input[type="email"]', testEmail)
  await page.fill('input[type="password"]', testPassword)

  const loginBtn = await page.locator('button').filter({ hasText: /login|sign in/i }).first()
  await loginBtn.click()

  // Step 4: Wait for redirect to dashboard
  await page.waitForURL(/dashboard|home/i, { timeout: 10000 })
  await page.waitForLoadState('networkidle')

  // Step 5: Navigate to shipper dashboard
  await page.goto('http://localhost:9090/dashboard/shipper')
  await page.waitForLoadState('networkidle')

  // Step 6: Verify header is present
  const header = await page.locator('[data-testid="shipper-page-header"]')
  await expect(header).toBeVisible()

  console.log('✅ ShipperPageHeader visible')

  // Step 7: Verify header components
  const logo = await page.locator('img[alt="FreightClub"]').isVisible()
  const lastUpdated = await page.locator('text=/Last updated/i').isVisible()
  const avatar = await page.locator('[data-testid="avatar-button"]').isVisible()

  expect(logo).toBe(true)
  expect(lastUpdated).toBe(true)
  expect(avatar).toBe(true)

  console.log('✅ Header elements verified:')
  console.log(`  - Logo: ${logo ? '✓' : '✗'}`)
  console.log(`  - Timestamp: ${lastUpdated ? '✓' : '✗'}`)
  console.log(`  - Avatar: ${avatar ? '✓' : '✗'}`)

  // Step 8: Capture full page screenshot
  await page.screenshot({
    path: 'test-results/evidence/us-821-shipper-dashboard-header.png',
    fullPage: true,
  })
  console.log('✅ Screenshot captured: us-821-shipper-dashboard-header.png')

  // Step 9: Click avatar to open dropdown
  const avatarButton = await page.locator('[data-testid="avatar-button"]')
  await avatarButton.click()

  // Wait for dropdown to appear
  const dropdown = await page.locator('[data-testid="avatar-dropdown"]')
  await expect(dropdown).toBeVisible({ timeout: 2000 })

  console.log('✅ Avatar dropdown opened')

  // Step 10: Verify dropdown menu items
  const profileLink = await page.locator('text=/Profile/i').isVisible()
  const settingsLink = await page.locator('text=/Settings/i').isVisible()
  const signoutLink = await page.locator('text=/Sign out/i').isVisible()

  expect(profileLink).toBe(true)
  expect(settingsLink).toBe(true)
  expect(signoutLink).toBe(true)

  console.log('✅ Dropdown menu items verified:')
  console.log(`  - Profile: ${profileLink ? '✓' : '✗'}`)
  console.log(`  - Settings: ${settingsLink ? '✓' : '✗'}`)
  console.log(`  - Sign out: ${signoutLink ? '✓' : '✗'}`)

  // Step 11: Capture dropdown screenshot
  await page.screenshot({
    path: 'test-results/evidence/us-821-avatar-dropdown-menu.png',
    fullPage: false,
  })
  console.log('✅ Screenshot captured: us-821-avatar-dropdown-menu.png')

  // Step 12: Verify user info in dropdown
  const userEmail = await page.locator('text=' + testEmail).isVisible()
  const userName = await page.locator('text=/Test Shipper/i').isVisible()

  expect(userEmail).toBe(true)
  expect(userName).toBe(true)

  console.log('✅ User info in dropdown verified:')
  console.log(`  - Email: ${userEmail ? '✓' : '✗'}`)
  console.log(`  - Name: ${userName ? '✓' : '✗'}`)

  // Step 13: Verify avatar shows correct initials (TS for Test Shipper)
  const avatarText = await avatarButton.textContent()
  expect(avatarText?.trim()).toBe('TS')

  console.log(`✅ Avatar initials verified: ${avatarText?.trim()}`)

  // Step 14: Click profile to verify navigation
  const profileMenuItem = await page.locator('button').filter({ hasText: 'Profile' }).first()
  await profileMenuItem.click()

  // Wait for navigation to profile page
  await page.waitForURL(/profile/i, { timeout: 5000 })
  console.log('✅ Profile navigation verified')

  // Return to dashboard for final screenshot
  await page.goto('http://localhost:9090/dashboard/shipper')
  await page.waitForLoadState('networkidle')

  // Step 15: Final verification screenshot
  await page.screenshot({
    path: 'test-results/evidence/us-821-shipper-dashboard-final.png',
    fullPage: true,
  })
  console.log('✅ Screenshot captured: us-821-shipper-dashboard-final.png')

  console.log('\n✅ US-821 E2E Test Complete!')
  console.log('Evidence captured:')
  console.log('  1. us-821-shipper-dashboard-header.png')
  console.log('  2. us-821-avatar-dropdown-menu.png')
  console.log('  3. us-821-shipper-dashboard-final.png')
})
