import { chromium, request, FullConfig } from '@playwright/test';

/**
 * Global Setup — Backend health checks + auth state initialization
 *
 * Runs once before all tests:
 * 1. Verify backend is healthy (/actuator/health)
 * 2. Verify database is connected
 * 3. Register test user + extract refresh token
 * 4. Save authenticated state to auth.json
 */

async function globalSetup(config: FullConfig) {
  console.log('\n📋 [Global Setup] Initializing test environment...\n');

  const backendUrl = process.env.TEST_BACKEND_URL || 'http://localhost:9091';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:9090';
  const maxRetries = 30; // 30 * 1s = 30s total wait
  const retryDelayMs = 1000;

  try {
    // ============================================================================
    // STEP 1: Backend Health Check (with retry)
    // ============================================================================
    console.log(`🏥 [Health Check] Verifying backend at ${backendUrl}...`);

    const healthOk = await waitForBackendHealth(backendUrl, maxRetries, retryDelayMs);
    if (!healthOk) {
      throw new Error(
        `Backend health check failed. Verify Spring Boot is running on ${backendUrl}`
      );
    }

    console.log('✅ [Health Check] Backend is healthy\n');

    // ============================================================================
    // STEP 2: Test User Registration
    // ============================================================================
    console.log('👤 [Auth] Registering test user...');

    const uniqueId = `${Date.now()}-setup`;
    const testEmail = `e2e-test-${uniqueId}@freightclub.local`;
    const testPassword = 'E2ETestPassword123!';

    const apiContext = await request.newContext();

    const registerResponse = await apiContext.post(`${backendUrl}/api/test/auth/register`, {
      data: {
        email: testEmail,
        password: testPassword,
        firstName: 'E2E',
        lastName: 'Test',
        role: 'SHIPPER',
        companyName: `E2ETest-${uniqueId}`,
      },
    });

    if (!registerResponse.ok()) {
      const errorText = await registerResponse.text();
      throw new Error(`Test auth registration failed: ${registerResponse.status()} ${errorText}`);
    }

    console.log(`✅ [Auth] Test user registered: ${testEmail}`);

    // ============================================================================
    // STEP 3: Extract Refresh Token from Set-Cookie Header
    // ============================================================================
    console.log('🍪 [Auth] Extracting refresh token...');

    const setCookieHeader = registerResponse.headers()['set-cookie'];
    if (!setCookieHeader) {
      throw new Error('No Set-Cookie header in registration response');
    }

    // Parse: "refreshToken=<value>; Path=/; HttpOnly; SameSite=Lax"
    const refreshToken = setCookieHeader.split(';')[0].split('=')[1];
    if (!refreshToken) {
      throw new Error('Failed to parse refreshToken from Set-Cookie header');
    }

    console.log('✅ [Auth] Refresh token extracted\n');

    // ============================================================================
    // STEP 4: Create Authenticated Browser Context
    // ============================================================================
    console.log('🔓 [Auth] Initializing authenticated session...');

    const browser = await chromium.launch();
    const browserContext = await browser.newContext();

    // Set refresh token cookie BEFORE navigation
    await browserContext.addCookies([
      {
        name: 'refreshToken',
        value: refreshToken,
        url: frontendUrl,
        httpOnly: true,
        sameSite: 'Lax',
        secure: false, // HTTP on localhost
      },
    ]);

    const page = await browserContext.newPage();

    // Navigate to frontend — AuthInitializer hook will use refreshToken to obtain accessToken
    console.log(`  Navigating to ${frontendUrl}...`);
    await page.goto(frontendUrl, { waitUntil: 'networkidle' });

    // Wait for auth initialization to complete (access token fetched and stored in memory)
    await page.waitForTimeout(1000);

    // Verify we got redirected past login (if redirect happens, we're authenticated)
    const currentUrl = page.url();
    console.log(`  After auth init: ${currentUrl}`);

    const cookies = await browserContext.cookies();
    console.log(`  Active cookies: ${cookies.map((c) => c.name).join(', ')}`);

    // ============================================================================
    // STEP 4.5: Store Auth State in localStorage (for E2E tests)
    // ============================================================================
    // Extract user profile and access token from registration response
    const registerBody = await registerResponse.json();
    const userProfile = registerBody.user;
    const accessToken = registerBody.accessToken;

    console.log('📦 [Auth] Storing auth state in localStorage...');

    // Set localStorage with BOTH access token and user profile
    // AuthStore.hydrate() needs both to properly initialize
    await page.evaluate((data) => {
      localStorage.setItem('freightclub_access_token', data.accessToken);
      localStorage.setItem('freightclub_user', JSON.stringify(data.userProfile));
      console.log('[GlobalSetup] Auth state stored - access token + user profile');
    }, { accessToken, userProfile });

    console.log(`✅ [Auth] Auth state stored (user: ${userProfile.email}, role: ${userProfile.role})\n`);

    // ============================================================================
    // STEP 5: Save Authenticated State
    // ============================================================================
    console.log('💾 [Setup] Saving authenticated state to auth.json...');

    await browserContext.storageState({ path: 'auth.json' });

    console.log('✅ [Setup] Auth state saved\n');

    // ============================================================================
    // Cleanup
    // ============================================================================
    await page.close();
    await browserContext.close();
    await browser.close();
    await apiContext.dispose();

    console.log('━'.repeat(80));
    console.log('✅ Global Setup Complete — All tests may now proceed');
    console.log('━'.repeat(80) + '\n');
  } catch (error) {
    console.error('\n❌ [Setup Error]', error);
    process.exit(1);
  }
}

/**
 * Wait for backend to be healthy (with retry logic)
 *
 * Polls /actuator/health every retryDelayMs until:
 * - HTTP 200 is returned, OR
 * - maxRetries is exhausted
 */
async function waitForBackendHealth(
  backendUrl: string,
  maxRetries: number,
  retryDelayMs: number
): Promise<boolean> {
  const apiContext = await request.newContext();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await apiContext.get(`${backendUrl}/actuator/health`);

      if (response.ok()) {
        console.log(`  ✓ Backend healthy on attempt ${attempt}`);
        await apiContext.dispose();
        return true;
      }

      console.log(`  ⏳ Attempt ${attempt}/${maxRetries}: HTTP ${response.status()}, retrying...`);
    } catch (error) {
      console.log(`  ⏳ Attempt ${attempt}/${maxRetries}: Connection failed, retrying...`);
    }

    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }

  await apiContext.dispose();
  return false;
}

export default globalSetup;
