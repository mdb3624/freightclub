import { test, expect } from '@playwright/test';

test('Debug login flow for shipper@test.com', async ({ page, context }) => {
  const consoleLogs: string[] = [];
  const networkLogs: string[] = [];
  
  page.on('console', msg => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });
  
  page.on('response', response => {
    if (response.url().includes('/auth')) {
      networkLogs.push(`${response.status()} ${response.url()}`);
    }
  });

  console.log('\n🔍 Starting login test...\n');
  
  // Navigate to login
  await page.goto('http://localhost:9090/login');
  console.log('✅ Login page loaded');
  
  // Fill credentials
  await page.fill('input[type="email"]', 'shipper@test.com');
  await page.fill('input[type="password"]', 'N1kk101!');
  console.log('✅ Credentials entered');
  
  // Click login button
  await page.click('button:has-text("Sign in")');
  console.log('🔐 Login clicked, waiting for response...\n');
  
  // Wait for navigation or error
  await page.waitForTimeout(3000);
  
  // Check current URL
  const url = page.url();
  console.log(`📍 Current URL: ${url}`);
  
  // Check for error message
  const errorVisible = await page.locator('text=Login failed').isVisible().catch(() => false);
  
  console.log('\n📊 Network Requests:');
  networkLogs.forEach(log => console.log(`  ${log}`));
  
  console.log('\n📋 Console Logs:');
  consoleLogs.forEach(log => console.log(`  ${log}`));
  
  if (url.includes('dashboard')) {
    console.log('\n✅ SUCCESS: Login worked!');
  } else if (errorVisible) {
    console.log('\n❌ FAILED: Login error message visible');
  } else {
    console.log('\n⚠️  Still on login page - auth may have failed');
  }
});
