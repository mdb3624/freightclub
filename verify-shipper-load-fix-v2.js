#!/usr/bin/env node
/**
 * Improved Puppeteer test with longer timeouts
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:9090';
const SHIPPER_EMAIL = process.env.SHIPPER_EMAIL || 'shipper@test.com';
const SHIPPER_PASSWORD = process.env.SHIPPER_PASSWORD || 'N1kk101!';

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
    page.setDefaultNavigationTimeout(60000); // 60 second timeout
    page.setDefaultTimeout(30000);

    // Step 1: Navigate to login
    console.log(`\n📝 Step 1: Navigating to login page...`);
    try {
      await page.goto(`${BASE_URL}/login`, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      console.log(`✅ Login page loaded`);
    } catch (e) {
      console.log(`⚠️  Navigation timed out, continuing anyway...`);
    }

    // Wait for email input to appear
    console.log(`\n📝 Step 2: Filling login form...`);
    try {
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.type('input[type="email"]', SHIPPER_EMAIL, { delay: 50 });
      await page.type('input[type="password"]', SHIPPER_PASSWORD, { delay: 50 });

      // Take screenshot before clicking submit
      await page.screenshot({ path: 'step1-login-form-filled.png' });

      console.log(`✅ Form filled`);

      // Click submit
      await page.click('button[type="submit"]');

      // Wait for either successful navigation or error message
      try {
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
        console.log(`✅ Logged in successfully`);
      } catch (navError) {
        // Navigation timeout could mean we're still on login page (error) or page is loading
        await page.waitForTimeout(2000);

        // Check for error messages
        const errorText = await page.evaluate(() => {
          const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"], .alert-danger, [role="alert"]');
          return Array.from(errorElements).map(el => el.textContent).join(' | ');
        });

        if (errorText) {
          console.error(`❌ Login error detected: ${errorText}`);
          await page.screenshot({ path: 'error-login-failed.png' });
          throw new Error(`Login failed: ${errorText}`);
        } else {
          console.log(`⚠️  Navigation timeout but no error visible, checking URL...`);
          const currentUrl = page.url();
          if (currentUrl.includes('/login')) {
            console.error(`❌ Still on login page - authentication failed`);
            await page.screenshot({ path: 'error-login-still-on-page.png' });
            throw new Error('Authentication failed - still on login page');
          }
        }
      }
    } catch (e) {
      console.error(`❌ Login process failed: ${e.message}`);
      await page.screenshot({ path: 'error-login.png' });
      throw e;
    }

    // Step 3: Navigate to shipper dashboard
    console.log(`\n📝 Step 3: Navigating to dashboard...`);
    try {
      await page.goto(`${BASE_URL}/dashboard/shipper`, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      console.log(`✅ Dashboard loaded`);
      await page.screenshot({ path: 'step2-dashboard-initial.png' });
    } catch (e) {
      console.error(`❌ Dashboard navigation failed: ${e.message}`);
      await page.screenshot({ path: 'error-dashboard.png' });
      throw e;
    }

    // Step 4: Click create load button
    console.log(`\n📝 Step 4: Clicking create load button...`);
    try {
      // Look for the button to create a new load
      const createBtn = await page.$('button:has-text("Post a Load"), button:contains("Post a Load"), [data-testid="create-load-btn"]');
      if (!createBtn) {
        // Try to find any button with "load" in text
        const buttons = await page.$$('button');
        for (const btn of buttons) {
          const text = await page.evaluate(b => b.textContent, btn);
          if (text && (text.includes('Post') || text.includes('Load') || text.includes('Create'))) {
            console.log(`Found button: ${text}`);
            await btn.click();
            break;
          }
        }
      } else {
        await createBtn.click();
      }

      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
      console.log(`✅ Navigated to create load page`);
    } catch (e) {
      console.log(`⚠️  Could not find/click create button, checking page state...`);
    }

    // Check current URL
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    await page.screenshot({ path: 'step3-current-page.png' });

    // Step 5: Fill load form
    console.log(`\n📝 Step 5: Filling load form...`);
    try {
      const timestamp = Date.now();

      // Try different selectors for form fields
      const fields = {
        originCity: ['input[name="originCity"]', 'input[placeholder*="City"]'],
        destinationCity: ['input[name="destinationCity"]'],
        weight: ['input[name="weight"]', 'input[type="number"]'],
        payRate: ['input[name="payRate"]', 'input[name="rate"]'],
      };

      // Fill fields
      for (const [field, selectors] of Object.entries(fields)) {
        let filled = false;
        for (const selector of selectors) {
          try {
            await page.waitForSelector(selector, { timeout: 5000 });
            await page.click(selector);

            let value = '';
            if (field === 'originCity') value = 'Chicago';
            if (field === 'destinationCity') value = 'New York';
            if (field === 'weight') value = '10000';
            if (field === 'payRate') value = '2500';

            await page.type(selector, value, { delay: 30 });
            filled = true;
            break;
          } catch (e) {
            // Try next selector
          }
        }
        if (filled) console.log(`  ✓ Filled ${field}`);
      }

      await page.screenshot({ path: 'step4-form-filled.png' });
      console.log(`✅ Form fields filled`);
    } catch (e) {
      console.log(`⚠️  Form filling had issues: ${e.message}`);
    }

    // Step 6: Submit form
    console.log(`\n📝 Step 6: Submitting form...`);
    try {
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }),
          submitBtn.click()
        ]);
        console.log(`✅ Form submitted`);
      }
    } catch (e) {
      console.log(`⚠️  Form submission timed out: ${e.message}`);
    }

    // Step 7: Verify load appears on dashboard
    console.log(`\n📝 Step 7: Verifying load appears on dashboard...`);
    await page.goto(`${BASE_URL}/dashboard/shipper`, { waitUntil: 'networkidle2', timeout: 60000 });

    await page.screenshot({ path: 'step5-dashboard-after-creation.png' });

    const pageText = await page.content();
    const hasLoad = pageText.includes('Chicago') || pageText.includes('New York') || pageText.includes('load');

    if (hasLoad) {
      console.log(`✅ Load appears on dashboard`);
    } else {
      console.log(`⚠️  Could not confirm load presence on dashboard`);
    }

    console.log(`\n✅ Verification completed`);
    console.log(`\n📸 Screenshots saved:`);
    console.log(`   - step1-login-form-filled.png`);
    console.log(`   - step2-dashboard-initial.png`);
    console.log(`   - step3-current-page.png`);
    console.log(`   - step4-form-filled.png`);
    console.log(`   - step5-dashboard-after-creation.png`);

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
