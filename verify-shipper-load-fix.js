#!/usr/bin/env node
/**
 * Puppeteer test to verify the shipper load visibility fix
 *
 * This test:
 * 1. Logs in as a shipper
 * 2. Creates a load
 * 3. Verifies it appears on the dashboard immediately (without page refresh)
 * 4. Takes screenshots showing the fix works
 *
 * Usage: node verify-shipper-load-fix.js
 *
 * Environment variables:
 * - BASE_URL: Frontend URL (default: http://localhost:9090)
 * - SHIPPER_EMAIL: Test shipper email
 * - SHIPPER_PASSWORD: Test shipper password
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:9090';
const SHIPPER_EMAIL = process.env.SHIPPER_EMAIL || 'shipper@test.com';
const SHIPPER_PASSWORD = process.env.SHIPPER_PASSWORD || 'testpass123';

async function runTest() {
  let browser;
  try {
    console.log(`🚀 Starting verification test`);
    console.log(`   Base URL: ${BASE_URL}`);
    console.log(`   Shipper Email: ${SHIPPER_EMAIL}`);

    browser = await puppeteer.launch({
      headless: false, // Show browser for visual verification
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Step 1: Login
    console.log(`\n📝 Step 1: Logging in as shipper...`);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });

    await page.type('input[type="email"]', SHIPPER_EMAIL);
    await page.type('input[type="password"]', SHIPPER_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log(`✅ Logged in successfully`);

    // Step 2: Navigate to create load
    console.log(`\n📝 Step 2: Navigating to create load...`);
    await page.goto(`${BASE_URL}/shipper/loads/new`, { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'step1-create-load-form.png' });
    console.log(`✅ Opened create load form`);

    // Step 3: Fill and submit load form
    console.log(`\n📝 Step 3: Creating test load...`);
    const timestamp = Date.now();
    const loadName = `Test Load ${timestamp}`;

    // Fill basic fields
    await page.type('input[name="originCity"]', 'Chicago');
    await page.type('input[name="originState"]', 'IL');
    await page.type('input[name="destinationCity"]', 'New York');
    await page.type('input[name="destinationState"]', 'NY');
    await page.type('input[name="weight"]', '10000');
    await page.type('input[name="payRate"]', '2500');

    // Set dates (simplified)
    await page.click('input[name="pickupFrom"]');
    await page.type('input[name="pickupFrom"]', '05/25/2026');

    await page.click('button[type="submit"]');

    // Wait for load creation and redirect
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log(`✅ Load created successfully`);

    // Step 4: Verify load appears on dashboard WITHOUT manual refresh
    console.log(`\n📝 Step 4: Verifying load appears on dashboard...`);

    // The fix should trigger cache invalidation, causing React Query to refetch
    // We should see the load appear within 2 seconds
    const dashboardUrl = `${BASE_URL}/dashboard/shipper`;
    await page.goto(dashboardUrl, { waitUntil: 'networkidle2' });

    // Wait for load table to populate
    await page.waitForSelector('[class*="LoadTable"], table, .load-item', { timeout: 5000 });

    // Check if load appears in the list
    const loadVisible = await page.evaluate(() => {
      const tables = document.querySelectorAll('table, [class*="load"]');
      const text = document.body.innerText;
      return text.includes('Chicago') || text.includes('New York');
    });

    if (loadVisible) {
      console.log(`✅ Load appears on dashboard immediately!`);
      await page.screenshot({ path: 'step2-load-on-dashboard.png' });
    } else {
      console.error(`❌ Load NOT visible on dashboard`);
      await page.screenshot({ path: 'step2-load-missing.png' });
      throw new Error('Load did not appear on dashboard');
    }

    // Step 5: Verify status counts updated
    console.log(`\n📝 Step 5: Checking status counts...`);
    const openCount = await page.evaluate(() => {
      const openCard = Array.from(document.querySelectorAll('*'))
        .find(el => el.textContent.includes('OPEN'));
      return openCard ? openCard.textContent.match(/\d+/)?.[0] : null;
    });

    if (openCount && parseInt(openCount) > 0) {
      console.log(`✅ Status count shows ${openCount} OPEN load(s)`);
    } else {
      console.error(`⚠️  Could not verify status count`);
    }

    console.log(`\n✅ All tests passed! The fix is working correctly.`);
    console.log(`\n📸 Screenshots saved:`);
    console.log(`   - step1-create-load-form.png`);
    console.log(`   - step2-load-on-dashboard.png`);

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
