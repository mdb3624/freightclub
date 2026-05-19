const { test, expect } = require('@playwright/test');

test('Diagnostic: Check frontend connectivity', async ({ page }) => {
  console.log('\n=== Frontend Diagnostic ===');
  
  // Step 1: Load login page
  console.log('1. Loading login page...');
  await page.goto(process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:9096/login', { timeout: 10000 });
  console.log('   ✓ Page loaded');
  
  // Step 2: Check for login form
  console.log('2. Checking for login form...');
  const emailInput = await page.locator('input[type="email"], input[placeholder*="mail"], input[placeholder*="Email"]').first();
  const exists = await emailInput.isVisible({ timeout: 5000 }).catch(() => false);
  console.log(`   ${exists ? '✓' : '✗'} Login form ${exists ? 'found' : 'NOT found'}`);
  
  // Step 3: Check page source for backend proxy
  console.log('3. Checking network requests...');
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log(`   ${response.status()} ${response.url()}`);
    }
  });
  
  // Step 4: Try to find error messages
  console.log('4. Checking for errors...');
  const errorMsg = await page.locator('[role="alert"], .error, .alert').first().textContent({ timeout: 2000 }).catch(() => null);
  if (errorMsg) console.log(`   Error found: ${errorMsg}`);
  
  console.log('\n=== End Diagnostic ===\n');
});
