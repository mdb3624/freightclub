#!/usr/bin/env node
const puppeteer = require('puppeteer');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function test() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
      defaultViewport: { width: 1440, height: 900 }
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(30000);

    console.log('🔐 Navigating to login...');
    await page.goto('http://localhost:9090/login', { waitUntil: 'networkidle2' });

    console.log('📝 Filling login form...');
    await page.type('input[type="email"]', 'shipper@test.com', { delay: 50 });
    await page.type('input[type="password"]', 'N1kk101!', { delay: 50 });
    
    await page.screenshot({ path: 'step1-login-form-filled.png' });

    console.log('🔘 Clicking submit...');
    await page.click('button[type="submit"]');

    console.log('⏳ Waiting for redirect...');
    for (let i = 0; i < 20; i++) {
      await delay(1000);
      const url = page.url();
      const pageText = await page.evaluate(() => document.body.innerText.substring(0, 500));
      
      console.log(`[${i+1}s] URL: ${url}`);
      
      if (url.includes('/dashboard/shipper')) {
        console.log('✅ Successfully redirected to dashboard!');
        
        await page.screenshot({ path: 'step2-dashboard-loaded.png' });
        
        // Check for load data
        await delay(2000);
        const loads = await page.evaluate(() => {
          const loadCards = document.querySelectorAll('[class*="load"], [class*="card"]');
          return {
            cardCount: loadCards.length,
            pageText: document.body.innerText.substring(0, 1000)
          };
        });
        
        console.log(`\n📊 Dashboard content:`);
        console.log(`  - Elements found: ${loads.cardCount}`);
        console.log(`  - Has load data: ${loads.pageText.includes('McKinney') || loads.pageText.includes('Concord') || loads.pageText.includes('OPEN') ? '✅ YES' : '⚠️ CHECKING'}`);
        console.log(`\n📄 Page content preview:`);
        console.log(loads.pageText);
        
        await page.screenshot({ path: 'step3-dashboard-final.png' });
        
        break;
      }
    }
    
    const finalUrl = page.url();
    if (!finalUrl.includes('/dashboard')) {
      console.log('\n❌ Did not redirect to dashboard');
      console.log(`Final URL: ${finalUrl}`);
      const content = await page.evaluate(() => document.body.innerText);
      console.log(`Content: ${content.substring(0, 500)}`);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    if (browser) await browser.close();
    console.log('\n✅ Test complete - screenshots saved');
  }
}

test();
