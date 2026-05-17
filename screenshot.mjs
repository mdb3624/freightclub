import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.join(__dirname, 'temporary screenshots');

// Create directory if it doesn't exist
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

// Get URL and optional label from command line args
const url = process.argv[2];
const label = process.argv[3];

if (!url) {
  console.error('Usage: node screenshot.mjs <url> [label]');
  console.error('Example: node screenshot.mjs http://localhost:3000 homepage');
  process.exit(1);
}

// Find next available screenshot number
function getNextScreenshotName() {
  const files = fs.readdirSync(screenshotDir);
  const numbers = files
    .map(f => {
      const match = f.match(/screenshot-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => n > 0);
  const nextNum = (numbers.length > 0 ? Math.max(...numbers) : 0) + 1;
  return label ? `screenshot-${nextNum}-${label}.png` : `screenshot-${nextNum}.png`;
}

async function takeScreenshot() {
  let browser;
  try {
    // Launch browser with system Chrome
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }).catch(async () => {
      // Fallback: try with default executable path (may use Chromium from system)
      return await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log(`📸 Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle0' });

    const filename = getNextScreenshotName();
    const filepath = path.join(screenshotDir, filename);

    console.log(`📷 Taking screenshot...`);
    await page.screenshot({ path: filepath, fullPage: true });

    console.log(`✅ Screenshot saved: ${filepath}`);
    await browser.close();
  } catch (error) {
    console.error('❌ Error taking screenshot:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

takeScreenshot();
