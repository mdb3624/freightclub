#!/usr/bin/env node
const puppeteer = require('puppeteer');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const BASE_URL = 'http://localhost:9090';

async function runTest() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox'],
      defaultViewport: { width: 1440, height: 900 }
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);

    // Capture console messages
    const logs = [];
    page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
    page.on('error', err => logs.push(`[ERROR] ${err.message}`));

    // Login
    console.log('🔐 Logging in...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', 'shipper@test.com');
    await page.type('input[type="password"]', 'N1kk101!');
    await page.click('button[type="submit"]');

    // Wait for redirect
    for (let i = 0; i < 20; i++) {
      await delay(500);
      if (page.url().includes('/dashboard')) {
        console.log('✅ On dashboard');
        break;
      }
    }

    await delay(3000);
    await page.screenshot({ path: 'debug-dashboard.png' });

    // Get page content
    const content = await page.evaluate(() => {
      return {
        pageText: document.body.innerText.substring(0, 2000),
        htmlContent: document.documentElement.innerHTML.substring(0, 3000),
        tables: document.querySelectorAll('table').length,
        divs: document.querySelectorAll('div').length,
        allText: document.body.innerText
      };
    });

    console.log('\n📄 PAGE CONTENT:');
    console.log('First 500 chars of page text:');
    console.log(content.pageText.substring(0, 500));
    console.log(`\nTables found: ${content.tables}`);
    console.log(`Looking for load-related text...`);

    const hasLoadData = content.allText.includes('McKinney') ||
                        content.allText.includes('Concord') ||
                        content.allText.includes('$');
    console.log(`Load data present: ${hasLoadData ? '✅' : '❌'}`);

    console.log('\n📋 BROWSER LOGS:');
    logs.forEach(log => console.log(`  ${log}`));

    console.log('\n✅ Screenshot: debug-dashboard.png');

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    if (browser) await browser.close();
  }
}

runTest();
