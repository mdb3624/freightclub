#!/usr/bin/env node
const puppeteer = require('puppeteer');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function test() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox'],
      defaultViewport: { width: 1440, height: 900 }
    });

    const page = await browser.newPage();

    // Capture all network responses
    page.on('response', response => {
      if (response.url().includes('/auth/login')) {
        console.log(`[Network] POST /auth/login: ${response.status()}`);
      }
    });

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`[Console Error] ${msg.text()}`);
      }
    });

    console.log('🔐 Navigating to login...');
    await page.goto('http://localhost:9090/login', { waitUntil: 'networkidle2' });

    console.log('📝 Filling form...');
    await page.type('input[type="email"]', 'shipper@test.com', { delay: 50 });
    await page.type('input[type="password"]', 'N1kk101!', { delay: 50 });

    await page.screenshot({ path: 'before-submit.png' });

    console.log('🔘 Clicking submit...');
    await page.click('button[type="submit"]');

    // Wait and check what happens
    for (let i = 0; i < 15; i++) {
      await delay(1000);

      const url = page.url();
      const html = await page.content();

      // Check for error messages
      const errorMsg = await page.evaluate(() => {
        const errorEl = document.querySelector('[class*="error"], .alert-danger, [role="alert"]');
        return errorEl ? errorEl.textContent : null;
      });

      console.log(`[${i+1}s] URL: ${url}`);
      if (errorMsg) {
        console.log(`      ERROR: ${errorMsg}`);
      }

      if (url.includes('/dashboard')) {
        console.log('✅ Redirected to dashboard!');
        break;
      }
    }

    await page.screenshot({ path: 'after-submit.png' });

    const finalContent = await page.evaluate(() => {
      return document.body.innerText.substring(0, 500);
    });

    console.log('\n📄 Final page content:');
    console.log(finalContent);

  } catch (error) {
    console.error(`Error: ${error.message}`);
  } finally {
    if (browser) await browser.close();
  }
}

test();
