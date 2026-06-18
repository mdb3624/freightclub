const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Navigate to home first
  await page.goto('http://localhost:9090/', { waitUntil: 'domcontentloaded' });
  
  // Register test user via API
  const userResp = await page.evaluate(async () => {
    const resp = await fetch('http://localhost:9091/api/test/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `audit-${Date.now()}@test.com`,
        password: 'AuditTest123!',
        firstName: 'Audit',
        lastName: 'Test',
        role: 'SHIPPER',
        tenantId: `tenant-audit-${Date.now()}`,
        companyName: 'Audit'
      })
    });
    return resp.json();
  });
  
  // Set auth in storage
  await page.evaluate((user, token) => {
    localStorage.setItem('freightclub_access_token', token);
    localStorage.setItem('freightclub_user', JSON.stringify(user));
  }, userResp.user, userResp.accessToken);
  
  // Navigate to dashboard
  await page.goto('http://localhost:9090/dashboard/shipper', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  // Take screenshot
  const buffer = await page.screenshot({ type: 'png' });
  require('fs').writeFileSync('dashboard.png', buffer);
  
  console.log('Screenshot saved to dashboard.png');
  await browser.close();
})();
