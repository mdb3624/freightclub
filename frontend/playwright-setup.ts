import { chromium } from '@playwright/test'

async function setup() {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  // Navigate to login
  await page.goto('http://localhost:9090/login')

  // Register a test user
  const uniqueId = `${Date.now()}-setup`
  const testEmail = `shipper-${uniqueId}@test.com`
  const testPassword = 'TestPassword123!'

  // Register via backend API
  const registerResponse = await page.request.post('http://localhost:9091/api/v1/auth/register', {
    data: {
      email: testEmail,
      password: testPassword,
      firstName: 'Test',
      lastName: 'Shipper',
      role: 'SHIPPER',
      companyName: `TestCorp-${uniqueId}`,
    },
  })

  if (!registerResponse.ok()) {
    throw new Error(`Registration failed: ${registerResponse.status()}`)
  }

  // Log in via UI
  await page.fill('input[type="email"]', testEmail)
  await page.fill('input[type="password"]', testPassword)
  await page.click('button:has-text("Sign in")')

  // Wait for navigation to complete
  await page.waitForURL(/dashboard/)
  await page.waitForLoadState('networkidle')

  // Get cookies and fix the path so they're sent to all routes
  const cookies = await context.cookies()
  const fixedCookies = cookies.map(c => ({
    ...c,
    path: '/', // Browser only sends cookies if request path starts with cookie.path
  }))

  // Clear old cookies and add fixed ones
  await context.clearCookies()
  await context.addCookies(fixedCookies)

  // Save the corrected authentication state
  await context.storageState({ path: 'auth.json' })
  console.log('✓ Auth saved with corrected cookie paths')

  await browser.close()
}

setup().catch(console.error)
