#!/usr/bin/env node
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Create screenshots directory with timestamp versioning
const projectRoot = path.resolve(__dirname, '.', '..');
const screenshotDir = path.join(projectRoot, 'docs', 'projects', 'puppeteer');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const versionedDir = path.join(screenshotDir, timestamp + '-PROD');

console.log(`📁 Screenshots directory: ${versionedDir}`);

if (!fs.existsSync(versionedDir)) {
  fs.mkdirSync(versionedDir, { recursive: true });
  console.log(`✓ Created directory`);
}

async function test() {
  let browser;
  try {
    console.log('🚀 Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      executablePath: 'C:\\Users\\Owner\\.cache\\puppeteer\\chrome\\win64-146.0.7680.153\\chrome-win64\\chrome.exe',
      args: ['--no-sandbox'],
      defaultViewport: { width: 1440, height: 900 }
    });

    const page = await browser.newPage();

    const productionUrl = 'https://freightclub-frontend-5gecbdg27a-uc.a.run.app/login';
    console.log(`🔐 Navigating to production: ${productionUrl}`);
    await page.goto(productionUrl, { waitUntil: 'networkidle0' });
    console.log('✅ Page loaded');

    // Debug: Print page structure
    const pageTitle = await page.title();
    console.log(`📄 Page title: ${pageTitle}`);

    // Wait for and find input fields with better handling
    await page.waitForFunction(() => document.querySelectorAll('input').length >= 2, { timeout: 10000 }).catch(() => null);

    console.log('📝 Filling email...');
    const emailInput = await page.$('input[type="email"]') || await page.$('input[name="email"]') || await page.$('input[placeholder*="email" i]');
    if (emailInput) {
      await emailInput.click();
      await page.keyboard.type('shipper@test.com');
    } else {
      const firstInput = await page.$('input');
      if (firstInput) {
        await firstInput.click();
        await page.keyboard.type('shipper@test.com');
      }
    }

    console.log('🔑 Filling password...');
    const passwordInput = await page.$('input[type="password"]') || await page.$('input[name="password"]');
    if (passwordInput) {
      await passwordInput.click();
      await page.keyboard.type('N1kk101!');
    } else {
      const inputs = await page.$$('input');
      if (inputs.length > 1) {
        await inputs[1].click();
        await page.keyboard.type('N1kk101!');
      }
    }
    console.log('✅ Credentials entered');

    console.log('🔘 Clicking submit...');
    await page.click('button[type="submit"]');
    console.log('✅ Submit clicked');

    console.log('⏳ Waiting for redirect to dashboard...');
    for (let i = 0; i < 20; i++) {
      await delay(1000);
      const url = page.url();

      if (url.includes('/dashboard/shipper')) {
        console.log(`\n✅ Logged in to production dashboard (${i+1}s)`);

        await delay(2000);
        const content = await page.evaluate(() => document.body.innerText);
        console.log('\n📊 DASHBOARD CONTENT:');
        console.log(content);

        // Check if loads are displaying
        const hasLoadsList = await page.evaluate(() => {
          return document.body.innerText.includes('Load Details') ||
                 document.body.innerText.includes('Origin') ||
                 document.body.innerText.includes('Destination');
        });

        if (hasLoadsList) {
          console.log('\n✅✅✅ SUCCESS! LOADS ARE DISPLAYING IN PRODUCTION ✅✅✅');
        } else {
          console.log('\n❌ ERROR: Loads are NOT displaying (count shows but list is empty)');
        }

        const screenshotPath = path.join(versionedDir, 'dashboard-production.png');
        await page.screenshot({ path: screenshotPath });
        console.log(`\n✅ Screenshot saved: ${screenshotPath}`);
        break;
      }

      if (i % 5 === 0) process.stdout.write('.');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (browser) await browser.close();
  }
}

test();
