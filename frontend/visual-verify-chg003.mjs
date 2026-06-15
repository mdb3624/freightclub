import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

try {
  // Navigate to dashboard
  await page.goto('http://localhost:9090', { waitUntil: 'domcontentloaded' });
  
  // Load auth state from E2E setup
  const authState = require('./auth.json');
  await context.addCookies(authState.cookies);
  await page.goto('http://localhost:9090/dashboard/shipper', { waitUntil: 'networkidle' });
  
  // Wait for Action Zone panel to render
  await page.waitForSelector('[data-testid="action-zone-section"]', { timeout: 5000 });
  
  // Take full page screenshot
  await page.screenshot({ path: 'test-results/chg-003-visual-verify.png', fullPage: true });
  console.log('✅ Screenshot captured: test-results/chg-003-visual-verify.png');
  
  // Also capture just the Action Zone section
  const actionZone = await page.locator('[data-testid="action-zone-section"]');
  await actionZone.screenshot({ path: 'test-results/chg-003-action-zone-closeup.png' });
  console.log('✅ Action Zone closeup: test-results/chg-003-action-zone-closeup.png');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} finally {
  await browser.close();
}
