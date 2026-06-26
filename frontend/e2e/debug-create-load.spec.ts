import { test, expect } from '@playwright/test';

test('Debug create load - use authenticated context', async ({ page, context }) => {
  // The page should already be authenticated via auth.json from global setup
  
  console.log('\n🔍 Testing create load...\n');
  console.log(`📍 Initial URL: ${page.url()}`);
  
  // Navigate to create load page
  console.log('🔄 Navigating to /loads/new...');
  await page.goto('http://localhost:9090/loads/new', { waitUntil: 'networkidle' });
  
  const finalUrl = page.url();
  console.log(`📍 Final URL after navigation: ${finalUrl}`);
  
  // Check if we were redirected
  if (!finalUrl.includes('loads/new') && !finalUrl.includes('loads')) {
    console.log('❌ REDIRECTED: Got different page than expected');
    const title = await page.locator('h1, h2').first().textContent();
    console.log(`   Page title: ${title}`);
    return;
  }
  
  console.log('✅ On create load page');
  
  // Try to find and fill a single input
  const inputs = page.locator('input[type="text"]');
  const inputCount = await inputs.count();
  console.log(`📊 Found ${inputCount} text inputs`);
  
  if (inputCount > 0) {
    await inputs.first().fill('Test');
    console.log('✅ Successfully filled input');
  } else {
    console.log('❌ No text inputs found on page');
  }
});
