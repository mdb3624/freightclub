import { chromium } from 'playwright';
import fs from 'fs';
import { execSync } from 'child_process';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Registering test user...');
  const userJson = execSync('curl -s -X POST http://backend-test:9091/api/test/auth/register -H "Content-Type: application/json" -d \'{"email":"visual-'+(Date.now())+'@test.com","password":"Visual123!","firstName":"Visual","lastName":"Test","role":"SHIPPER","tenantId":"tenant-'+(Date.now())+'","companyName":"Visual"}\'').toString();
  const userData = JSON.parse(userJson);
  
  console.log('Navigating to home...');
  await page.goto('http://localhost:9090/', { waitUntil: 'domcontentloaded' });
  
  console.log('Setting auth...');
  await page.evaluate(({user, token}) => {
    localStorage.setItem('freightclub_access_token', token);
    localStorage.setItem('freightclub_user', JSON.stringify(user));
  }, {user: userData.user, token: userData.accessToken});
  
  console.log('Navigating to dashboard...');
  await page.goto('http://localhost:9090/dashboard/shipper', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  
  console.log('Taking screenshot...');
  const buffer = await page.screenshot({ type: 'png', fullPage: false });
  fs.writeFileSync('dashboard.png', buffer);
  
  console.log('Screenshot saved to dashboard.png');
  await browser.close();
})();
