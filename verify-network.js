#!/usr/bin/env node
const puppeteer = require('puppeteer');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

    // Capture all network requests
    const requests = [];
    page.on('response', response => {
      requests.push({
        url: response.url(),
        status: response.status(),
        ok: response.ok()
      });
    });

    // Login
    console.log('🔐 Logging in...');
    await page.goto(`http://localhost:9090/login`, { waitUntil: 'networkidle2' });
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

    // Print all requests
    console.log('\n📡 NETWORK REQUESTS:');
    const apiRequests = requests.filter(r => r.url.includes('/api'));

    console.log('\nAPI Requests:');
    for (const req of apiRequests) {
      const status = req.ok ? '✅' : '❌';
      console.log(`${status} ${req.status} ${req.url.substring(req.url.lastIndexOf('/') - 20)}`);
    }

    // Check for shipper/loads specifically
    const shipperLoadsReq = apiRequests.find(r => r.url.includes('/shipper/loads'));
    if (shipperLoadsReq) {
      console.log(`\n🎯 /shipper/loads request: ${shipperLoadsReq.status} ${shipperLoadsReq.ok ? '✅' : '❌'}`);
    } else {
      console.log('\n❌ /shipper/loads was NOT requested');
    }

  } catch (error) {
    console.error(`Error: ${error.message}`);
  } finally {
    if (browser) await browser.close();
  }
}

runTest();
