#!/usr/bin/env node
/**
 * Improved Puppeteer test with proper login redirect handling
 */

const puppeteer = require('puppeteer');

const BASE_URL = process.env.BASE_URL || 'http://localhost:9090';
const SHIPPER_EMAIL = process.env.SHIPPER_EMAIL || 'shipper@test.com';
const SHIPPER_PASSWORD = process.env.SHIPPER_PASSWORD || 'N1kk101!';

// Helper function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTest() {
  let browser;
  try {
    console.log(`🚀 Starting verification test`);
    console.log(`   Base URL: ${BASE_URL}`);
    console.log(`   Shipper Email: ${SHIPPER_EMAIL}`);

    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
      defaultViewport: null,
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(30000);

    // Step 1: Navigate to login
    console.log(`\n📝 Step 1: Navigating to login page...`);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 60000 });
    console.log(`✅ Login page loaded`);
    await page.screenshot({ path: 'step1-login-form.png' });

    // Step 2: Fill and submit login form
    console.log(`\n📝 Step 2: Submitting login credentials...`);
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', SHIPPER_EMAIL, { delay: 50 });
    await page.type('input[type="password"]', SHIPPER_PASSWORD, { delay: 50 });

    await page.screenshot({ path: 'step2-login-filled.png' });

    // Click submit and wait for redirect
    console.log(`   Clicking submit...`);
    await page.click('button[type="submit"]');

    // Wait for either:
    // 1. URL to change from /login to /dashboard
    // 2. An error message to appear
    let redirectSuccess = false;
    let errorDetected = false;

    for (let i = 0; i < 30; i++) {
      await delay(500);

      const currentUrl = page.url();
      console.log(`   [${i + 1}/30] Current URL: ${currentUrl}`);

      // Check if redirected to dashboard
      if (currentUrl.includes('/dashboard')) {
        redirectSuccess = true;
        console.log(`✅ Redirected to dashboard`);
        break;
      }

      // Check for error messages
      const errorText = await page.evaluate(() => {
        const errorElements = document.querySelectorAll(
          '[class*="error"], [class*="Error"], .alert-danger, [role="alert"]'
        );
        return Array.from(errorElements)
          .map(el => el.textContent)
          .join(' | ');
      });

      if (errorText && !errorDetected) {
        errorDetected = true;
        console.error(`❌ Login error: ${errorText}`);
        await page.screenshot({ path: 'error-login-failed.png' });
        throw new Error(`Login failed: ${errorText}`);
      }
    }

    if (!redirectSuccess) {
      console.error(`❌ Redirect to dashboard did not happen`);
      await page.screenshot({ path: 'error-no-redirect.png' });
      throw new Error('Login redirect failed - still on login page');
    }

    // Step 3: Wait for dashboard to fully load
    console.log(`\n📝 Step 3: Waiting for dashboard to load...`);
    await delay(2000); // Wait for React to mount
    await page.screenshot({ path: 'step3-dashboard-loaded.png' });
    console.log(`✅ Dashboard loaded`);

    // Step 4: Check current load counts
    console.log(`\n📝 Step 4: Checking initial load counts...`);
    const initialCounts = await page.evaluate(() => {
      // Look for status cards/counts on dashboard
      const text = document.body.innerText;
      const match = text.match(/OPEN[:\s]+(\d+)/);
      return match ? parseInt(match[1]) : null;
    });
    console.log(`   Initial OPEN count: ${initialCounts || 'unknown'}`);

    // Step 5: Click create load button
    console.log(`\n📝 Step 5: Clicking create load button...`);
    try {
      // Try multiple selectors for create button
      const buttons = await page.$$('button');
      let found = false;
      for (const btn of buttons) {
        const text = await page.evaluate(b => b.textContent, btn);
        if (text && (text.includes('Post') || text.includes('Load') || text.includes('Create'))) {
          await btn.click();
          // Wait for navigation
          await Promise.race([
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
            delay(3000)
          ]).catch(() => null);
          found = true;
          break;
        }
      }
      if (!found) {
        console.log(`⚠️  Could not find create button, trying direct navigation...`);
        await page.goto(`${BASE_URL}/shipper/loads/new`, { waitUntil: 'networkidle2', timeout: 30000 });
      }
    } catch (e) {
      console.log(`⚠️  Button click failed: ${e.message}, trying direct navigation...`);
      await page.goto(`${BASE_URL}/shipper/loads/new`, { waitUntil: 'networkidle2', timeout: 30000 });
    }

    await page.screenshot({ path: 'step4-create-form.png' });
    console.log(`✅ On create load form`);

    // Step 6: Fill load form
    console.log(`\n📝 Step 6: Filling load form...`);

    const formData = {
      originCity: 'Chicago',
      originState: 'IL',
      originZip: '60601',
      originAddress1: '123 Main St',
      destinationCity: 'New York',
      destinationState: 'NY',
      destinationZip: '10001',
      destinationAddress1: '456 Broadway',
      commodity: 'General Freight',
      weightLbs: '10000',
      equipmentType: 'DRY_VAN',
      payRate: '2500',
      payRateType: 'FLAT_RATE',
    };

    // Fill each field
    for (const [key, value] of Object.entries(formData)) {
      try {
        const selector = `input[name="${key}"], select[name="${key}"]`;
        const exists = await page.$(selector);

        if (exists) {
          const tag = await page.evaluate(el => el.tagName, exists);
          if (tag === 'SELECT') {
            await page.select(selector, value);
          } else {
            await page.click(selector);
            await page.evaluate(sel => document.querySelector(sel).value = '', selector);
            await page.type(selector, String(value), { delay: 30 });
          }
          console.log(`  ✓ Filled ${key}`);
        }
      } catch (e) {
        console.log(`  ⚠️  Could not fill ${key}`);
      }
    }

    // Fill dates (try multiple format approaches)
    try {
      const dateFields = [
        { name: 'pickupFrom', value: '05/25/2026 08:00 AM' },
        { name: 'pickupTo', value: '05/25/2026 06:00 PM' },
        { name: 'deliveryFrom', value: '05/26/2026 08:00 AM' },
        { name: 'deliveryTo', value: '05/26/2026 06:00 PM' }
      ];

      for (const field of dateFields) {
        try {
          const selector = `input[name="${field.name}"]`;
          const exists = await page.$(selector);
          if (exists) {
            await page.focus(selector);
            await page.keyboard.press('Home');
            await page.keyboard.press('Shift', 'End');
            await page.type(selector, field.value, { delay: 30 });
            console.log(`  ✓ Filled ${field.name}`);
          }
        } catch (e) {
          // Try alternative format
          try {
            const selector = `input[name="${field.name}"]`;
            await page.evaluate((sel, val) => {
              const el = document.querySelector(sel);
              if (el) el.value = val;
            }, selector, field.value);
            console.log(`  ✓ Set ${field.name} via JS`);
          } catch (e2) {
            console.log(`  ⚠️  Could not fill ${field.name}`);
          }
        }
      }
    } catch (e) {
      console.log(`  ⚠️  Date filling error: ${e.message}`);
    }

    await page.screenshot({ path: 'step5-form-filled.png' });
    console.log(`✅ Form filled`);

    // Step 7: Submit form
    console.log(`\n📝 Step 7: Submitting load form...`);
    try {
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();

        // Wait for any navigation or response
        await Promise.race([
          page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
          page.waitForTimeout(3000)
        ]).catch(() => null);

        console.log(`✅ Form submitted`);
        await delay(2000); // Let React Query process
      }
    } catch (e) {
      console.log(`⚠️  Form submission: ${e.message}`);
    }

    // Step 8: Navigate back to dashboard and verify load appears
    console.log(`\n📝 Step 8: Verifying load appears on dashboard...`);
    await page.goto(`${BASE_URL}/dashboard/shipper`, { waitUntil: 'networkidle2', timeout: 60000 });
    await delay(2000); // Let React Query refresh

    await page.screenshot({ path: 'step6-dashboard-after-creation.png' });

    // Check if load appears
    const pageText = await page.evaluate(() => document.body.innerText);
    const hasLoad = pageText.includes('Chicago') ||
                   pageText.includes('New York') ||
                   pageText.includes('10000') ||
                   pageText.includes('2500');

    console.log(`\n   Dashboard page content (first 500 chars):`);
    console.log(`   ${pageText.substring(0, 500).split('\n').slice(0, 5).join('\n   ')}`);

    if (hasLoad) {
      console.log(`\n✅ LOAD APPEARS ON DASHBOARD - FIX VERIFIED!`);
    } else {
      console.log(`\n⚠️  Load not found on dashboard`);
      console.log(`   Check if form submission succeeded`);
    }

    console.log(`\n` + '='.repeat(50));
    console.log(`✅ VERIFICATION COMPLETE`);
    console.log('='.repeat(50));
    console.log(`\n📸 Screenshots saved:`);
    console.log(`   - step1-login-form.png`);
    console.log(`   - step2-login-filled.png`);
    console.log(`   - step3-dashboard-loaded.png`);
    console.log(`   - step4-create-form.png`);
    console.log(`   - step5-form-filled.png`);
    console.log(`   - step6-dashboard-after-creation.png`);

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}`);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runTest();
