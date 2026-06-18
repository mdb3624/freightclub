import { test } from '@playwright/test'

test('full page screenshot', async ({ page }) => {
  await page.goto('http://localhost:9090/shipper/loads/new', { waitUntil: 'networkidle' })
  await page.waitForSelector('form', { timeout: 10000 })
  await page.screenshot({ path: 'test-results/form-full.png', fullPage: true })
  console.log('✅ Full page screenshot saved')
})
