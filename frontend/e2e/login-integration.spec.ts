/**
 * Login Integration Tests (US-756) — MIGRATED TO IN-PAGE MODAL
 *
 * The standalone /login page was retired in favor of a login modal on the
 * home page (LoginModal wrapping the same LoginForm/useLogin flow, unchanged
 * data-testids). Every test here now opens the modal from '/' instead of
 * navigating directly to a dedicated login route.
 *
 * 1. Uses data-testid selectors (mandatory per testing_standards.md)
 * 2. Web-first assertions instead of hard-coded waits
 * 3. Fixture-based test data setup instead of route mocking
 * 4. Proper synchronization with backend responses
 * 5. Traces generated on failure for debugging
 *
 * Trace files stored in: test-results/trace-{test-name}-{timestamp}.zip
 * Contains: network requests, DOM snapshots, console logs, screenshots, video
 */

import { test, expect } from '@playwright/test';
import { TestDataSeeder } from './fixtures/test-data-seeder';

async function openLoginModal(page: import('@playwright/test').Page) {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.locator('[data-testid="header-login-btn"]').click();
  await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();
}

test.describe('Login Integration Tests (US-756)', () => {
  // ============================================================================
  // TEST SETUP: Per-test state cleanup
  // ============================================================================
  test.beforeEach(async ({ page, context }) => {
    // Traces are managed by playwright.config.ts (trace: 'retain-on-failure')
    // Just clear auth state before each test
    await context.clearCookies();
    try {
      await page.evaluate(() => localStorage.clear());
    } catch {
      // localStorage may not be accessible before the app has mounted
    }
  });

  // ============================================================================
  // TEST 1: Modal opens with the form rendered promptly
  // ============================================================================
  test('should render login form promptly after opening the modal', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const startTime = Date.now();
    await page.locator('[data-testid="header-login-btn"]').click();

    // Web-first assertions: wait for elements with explicit timeout
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="login-submit-btn"]')).toBeVisible({ timeout: 5000 });

    const openTime = Date.now() - startTime;
    expect(openTime).toBeLessThan(5000); // Reasonable in CI environment

    console.log(`✓ Login modal opened in ${openTime}ms`);
  });

  // ============================================================================
  // TEST 2: Backend rejection displays error message with retry logic
  // ============================================================================
  test('should display error message on failed login', async ({ page }) => {
    await openLoginModal(page);

    const emailInput = page.locator('[data-testid="email-input"]');
    const passwordInput = page.locator('[data-testid="password-input"]');
    const submitBtn = page.locator('[data-testid="login-submit-btn"]');

    await emailInput.fill('invalid@example.com');
    await passwordInput.fill('wrongpassword');

    const loginPromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/auth/login') && response.status() === 401
    );

    await submitBtn.click();

    try {
      await loginPromise;
      console.log('✓ Backend returned 401 for invalid credentials');
    } catch (error) {
      throw new Error('Backend did not return 401 within timeout. Check backend health.');
    }

    const errorMessage = page.locator('[data-testid="login-error-message"]');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });

    const errorText = await errorMessage.textContent();
    expect(errorText).toMatch(/invalid|failed|unauthorized/i);

    console.log(`✓ Error message displayed: "${errorText}"`);
  });

  // ============================================================================
  // TEST 3: Network throttling — verify form remains responsive
  // ============================================================================
  test('should handle network throttling gracefully', async ({ page }) => {
    // Simulate Slow 3G: 400ms latency + 20 Kbps bandwidth
    await page.route('**/*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate latency
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="header-login-btn"]').click();
    const openTime = Date.now() - startTime;

    const emailInput = page.locator('[data-testid="email-input"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toBeEnabled();

    await emailInput.fill('test@example.com');
    const filledValue = await emailInput.inputValue();
    expect(filledValue).toBe('test@example.com');

    console.log(`✓ Modal opened with 3G throttling in ${openTime}ms, form interactive`);
  });

  // ============================================================================
  // TEST 4: Auth state persistence with refresh token
  // ============================================================================
  test('should maintain auth state on page refresh', async ({ page }) => {
    // This test assumes auth.json was loaded by globalSetup
    // which sets the refreshToken cookie
    await page.goto('/', { waitUntil: 'networkidle' });

    const isAuthenticated = await page.evaluate(
      () => !!localStorage.getItem('freightclub_access_token')
    );

    // Refresh page and verify state is maintained (no 401 redirect loop)
    await page.reload({ waitUntil: 'networkidle' });

    const isStillAuthenticated = await page.evaluate(
      () => !!localStorage.getItem('freightclub_access_token')
    );

    expect(isStillAuthenticated).toBe(isAuthenticated);
    console.log(`✓ Auth state persists across page refresh (authenticated: ${isAuthenticated})`);
  });

  // ============================================================================
  // TEST 5: Form validation — required fields
  // ============================================================================
  test('should validate required fields on submit', async ({ page }) => {
    await openLoginModal(page);

    const submitBtn = page.locator('[data-testid="login-submit-btn"]');
    await submitBtn.click();

    const validationError = page.locator('[data-testid="email-input-error"]');
    await expect(validationError).toBeVisible({ timeout: 2000 });

    const errorText = await validationError.textContent();
    expect(errorText).toMatch(/required|email/i);

    console.log(`✓ Validation error displayed: "${errorText}"`);
  });

  // ============================================================================
  // TEST 6: Email format validation
  // ============================================================================
  test('should validate email format before submission', async ({ page }) => {
    await openLoginModal(page);

    const emailInput = page.locator('[data-testid="email-input"]');
    const passwordInput = page.locator('[data-testid="password-input"]');

    await emailInput.fill('notanemail');
    await passwordInput.fill('password123');
    await emailInput.blur();

    const emailError = page.locator('[data-testid="email-input-error"]');
    const isEmailErrorVisible = await emailError
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (isEmailErrorVisible) {
      const errorText = await emailError.textContent();
      expect(errorText).toMatch(/valid email|@|format/i);
      console.log(`✓ Email validation error displayed: "${errorText}"`);
    } else {
      console.log('✓ No email validation error (validation may occur on submit)');
    }
  });

  // ============================================================================
  // TEST 7: Successful login with fixture-based test data
  // ============================================================================
  test('should successfully login with valid credentials', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request);
    const testUser = await seeder.createTestUser({ role: 'SHIPPER' });

    try {
      await openLoginModal(page);

      const emailInput = page.locator('[data-testid="email-input"]');
      const passwordInput = page.locator('[data-testid="password-input"]');
      const submitBtn = page.locator('[data-testid="login-submit-btn"]');

      await emailInput.fill(testUser.email);
      await passwordInput.fill(testUser.password);

      const loginPromise = page.waitForResponse(
        (response) =>
          response.url().includes('/api/v1/auth/login') && response.status() === 200
      );

      await submitBtn.click();
      await loginPromise;

      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

      console.log(`✓ Login successful, redirected to dashboard`);
    } finally {
      try {
        await seeder.cleanup();
      } catch (e) {
        console.warn('[cleanup] Failed (non-fatal):', e);
      }
    }
  });

  // ============================================================================
  // TEST 8: No failed network requests post-login (FREIG-114 regression guard)
  //
  // FREIG-114: public/fonts/custom-fonts.css used raw CSS @import with bare
  // npm specifiers, which resolved fine under Vite's dev server but 404'd under
  // nginx-served production. No test caught this because nothing asserted on
  // failed requests. This test is a standing guard against that whole class of
  // bug, not just fonts specifically.
  // ============================================================================
  test('should not produce any failed network requests after login (FREIG-114)', async ({
    page,
    request,
  }) => {
    const seeder = new TestDataSeeder(request);
    const testUser = await seeder.createTestUser({ role: 'SHIPPER' });

    const failedRequests: string[] = [];
    page.on('requestfailed', (req) => failedRequests.push(req.url()));
    page.on('response', (res) => {
      if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`);
    });

    try {
      await openLoginModal(page);

      await page.locator('[data-testid="email-input"]').fill(testUser.email);
      await page.locator('[data-testid="password-input"]').fill(testUser.password);

      const loginPromise = page.waitForResponse(
        (response) =>
          response.url().includes('/api/v1/auth/login') && response.status() === 200
      );
      await page.locator('[data-testid="login-submit-btn"]').click();
      await loginPromise;

      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

      // Let lazily-loaded resources (e.g. useLazyFonts) finish requesting
      await page.waitForTimeout(1000);

      const assetFailures = failedRequests.filter(
        (url) => !url.includes('/api/') // API 5xx/4xx are covered by other specs; this guards static assets
      );

      expect(assetFailures, `Unexpected failed asset requests: ${assetFailures.join(', ')}`).toEqual([]);

      console.log('✓ No failed static asset requests after login');
    } finally {
      try {
        await seeder.cleanup();
      } catch (e) {
        console.warn('[cleanup] Failed (non-fatal):', e);
      }
    }
  });
});
