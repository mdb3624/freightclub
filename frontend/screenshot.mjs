import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Navigating to home...');
  await page.goto('http://localhost:9090/', { waitUntil: 'domcontentloaded' });
  
  console.log('Registering test user...');
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
  
  console.log('Setting auth...');
  await page.evaluate((user, token) => {
    localStorage.setItem('freightclub_access_token', token);
    localStorage.setItem('freightclub_user', JSON.stringify(user));
  }, userResp.user, userResp.accessToken);
  
  console.log('Navigating to dashboard...');
  await page.goto('http://localhost:9090/dashboard/shipper', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  console.log('Taking screenshot...');
  const buffer = await page.screenshot({ type: 'png' });
  fs.writeFileSync('dashboard.png', buffer);
  
  console.log('Screenshot saved to dashboard.png');
  await browser.close();
})();
