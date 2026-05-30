import { chromium, FullConfig, request } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🔐 Playwright Global Setup: Creating test session...')

  const backendUrl = process.env.TEST_BACKEND_URL || 'http://localhost:9091'
  const frontendUrl = 'http://localhost:9090'

  const uniqueId = `${Date.now()}-setup`
  const testEmail = `e2e-test-${uniqueId}@freightclub.local`
  const testPassword = 'E2ETestPassword123!'

  try {
    // Step 1: Register test user and extract refreshToken from response
    const apiContext = await request.newContext()
    const registerResponse = await apiContext.post(`${backendUrl}/api/test/auth/register`, {
      data: {
        email: testEmail,
        password: testPassword,
        firstName: 'E2E',
        lastName: 'Test',
        role: 'SHIPPER',
        companyName: `E2ETest-${uniqueId}`,
      },
    })

    if (!registerResponse.ok()) {
      throw new Error(`Test auth failed: ${registerResponse.status()}`)
    }

    console.log('✅ Test user registered')

    // Extract refreshToken from Set-Cookie header
    const setCookieHeader = registerResponse.headers()['set-cookie']
    if (!setCookieHeader) {
      throw new Error('No Set-Cookie header in response')
    }

    const cookieParts = setCookieHeader.split(';')[0].split('=')
    const refreshToken = cookieParts[1]
    console.log('🍪 RefreshToken obtained')

    // Step 2: Create browser context with the refreshToken cookie
    const browser = await chromium.launch()
    const ctx = await browser.newContext()

    // Set the refreshToken cookie before navigating
    await ctx.addCookies([{
      name: 'refreshToken',
      value: refreshToken,
      url: frontendUrl,
      httpOnly: true,
      sameSite: 'Lax',
      secure: false  // Tests run on HTTP localhost
    }])

    const page = await ctx.newPage()

    // Navigate to frontend - AuthInitializer will use the refreshToken to get accessToken
    await page.goto(frontendUrl)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Check cookies after auth initialization
    const cookies = await ctx.cookies()
    console.log('📍 Cookies saved:', cookies.map(c => `${c.name}`).join(', '))

    // Save authenticated state
    await ctx.storageState({ path: 'auth.json' })

    await page.close()
    await ctx.close()
    await browser.close()
    await apiContext.dispose()

    console.log('💾 Auth state saved\n')
  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

export default globalSetup
