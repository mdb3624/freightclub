import { test, expect } from '@playwright/test';

test('Debug: Trace TRUCKER login routing', async ({ page }) => {
  console.log('\n🔍 Starting login flow...');

  // Navigate to login
  await page.goto('http://localhost:9090/login', { waitUntil: 'domcontentloaded' });
  console.log('📍 URL after goto /login:', page.url());

  // Create TRUCKER user
  const backendUrl = 'http://localhost:9091';
  const uniqueId = Date.now();
  const registerResp = await fetch(`${backendUrl}/api/test/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `debug-trucker-${uniqueId}@freightclub.local`,
      password: 'E2ETestPassword123!',
      firstName: 'Debug',
      lastName: 'Trucker',
      role: 'TRUCKER',
      companyName: `DebugTrucker-${uniqueId}`,
    }),
  });

  const registerBody = await registerResp.json();
  console.log('✅ TRUCKER user created');
  console.log('   Email:', registerBody.user.email);
  console.log('   Role:', registerBody.user.role);

  // Fill login form
  await page.fill('input[type="email"]', registerBody.user.email);
  await page.fill('input[type="password"]', 'E2ETestPassword123!');
  console.log('📝 Login form filled');

  // Set up listener for navigation
  page.on('framenavigated', (frame) => {
    console.log('🔄 Frame navigated:', frame.url());
  });

  // Click login button
  console.log('🔘 Clicking login button...');
  await page.click('button:has-text("Sign in")');

  // Wait for navigation
  console.log('⏳ Waiting for navigation...');
  await page.waitForTimeout(2000);

  console.log('📍 Final URL after login:', page.url());

  // Take screenshot
  await page.screenshot({ path: 'debug-routing-final.png', fullPage: true });
  console.log('📸 Screenshot saved: debug-routing-final.png');

  // Check what elements are visible
  const headerVisible = await page.locator('[data-testid="carrier-header"]').isVisible().catch(() => false);
  const truckerDashVisible = await page.locator('[data-testid="trucker-dashboard"]').isVisible().catch(() => false);

  console.log('\n📊 Element visibility:');
  console.log('   Carrier Dashboard header:', headerVisible);
  console.log('   Trucker Dashboard:', truckerDashVisible);

  // Get body classes
  const bodyClass = await page.evaluate(() => document.body.className);
  console.log('   Body classes:', bodyClass);

  // Check console logs
  const logs = await page.evaluate(() => {
    return (window as any).__consoleLogs || [];
  });
  console.log('\n📋 Console logs:', logs);

  expect(page.url()).toContain('/dashboard/carrier');
});
