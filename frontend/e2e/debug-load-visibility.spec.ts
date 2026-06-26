import { test, expect } from '@playwright/test';

test('Debug: load not appearing in shipment panel after save', async ({ page }) => {
  const apiCalls: string[] = [];
  
  page.on('response', response => {
    if (response.url().includes('/api')) {
      console.log(`📡 ${response.status()} ${response.url().split('/').slice(-2).join('/')}`);
      if (response.url().includes('shipment') || response.url().includes('loads')) {
        response.json().then(data => {
          apiCalls.push(`${response.url()}: ${JSON.stringify(data).substring(0, 100)}`);
        }).catch(() => {});
      }
    }
  });

  console.log('\n🔍 Testing load visibility after save...\n');
  
  // Start on dashboard
  await page.goto('http://localhost:9090/dashboard/shipper');
  console.log('✅ Dashboard loaded');
  
  // Get initial shipment panel count
  const initialLoads = await page.locator('[data-testid="shipment-status-panel"] [data-testid*="load"], [class*="load"][class*="card"]').count();
  console.log(`📊 Initial loads in panel: ${initialLoads}`);
  
  // Click create load
  const postBtn = page.locator('button:has-text("Post"), button:has-text("Create")').first();
  if (await postBtn.isVisible()) {
    await postBtn.click();
    console.log('✅ Navigated to create form');
  }
  
  await page.waitForTimeout(2000);
  
  // Fill minimal form
  const inputs = page.locator('input');
  await inputs.nth(0).fill('123 Main').catch(() => {});
  await inputs.nth(1).fill('NY').catch(() => {});
  await inputs.nth(2).fill('10001').catch(() => {});
  await inputs.nth(3).fill('456 Oak').catch(() => {});
  await inputs.nth(4).fill('CA').catch(() => {});
  await inputs.nth(5).fill('90001').catch(() => {});
  console.log('✅ Form filled');
  
  // Submit
  const saveBtn = page.locator('button[type="submit"], button:has-text("Post"), button:has-text("Create")').first();
  if (await saveBtn.isVisible()) {
    console.log('📤 Clicking submit...');
    await saveBtn.click();
    await page.waitForTimeout(4000);
    console.log('✅ Submitted');
  }
  
  // Check if redirected to dashboard
  const currentUrl = page.url();
  console.log(`\n📍 After save, URL: ${currentUrl}`);
  
  if (!currentUrl.includes('dashboard')) {
    console.log('⚠️  Not on dashboard yet, waiting...');
    await page.waitForURL('**/dashboard**', { timeout: 5000 }).catch(() => {});
  }
  
  // Check shipment panel now
  await page.waitForTimeout(2000);
  const finalLoads = await page.locator('[data-testid="shipment-status-panel"] [data-testid*="load"], [class*="load"][class*="card"]').count();
  console.log(`\n📊 Loads after save: ${finalLoads}`);
  console.log(`📈 Difference: ${finalLoads - initialLoads} new load(s)`);
  
  if (finalLoads > initialLoads) {
    console.log('✅ SUCCESS: New load visible in panel!');
  } else {
    console.log('❌ PROBLEM: New load NOT visible in panel');
    console.log('   Checking: is data in API response?');
    apiCalls.slice(-3).forEach(call => console.log(`   ${call}`));
  }
});
