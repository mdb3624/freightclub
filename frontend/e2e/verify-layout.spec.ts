import { test } from '@playwright/test'

test('verify special instructions under dimensions', async ({ page }) => {
  const response = await page.goto('http://localhost:9090/shipper/loads/new', { waitUntil: 'networkidle' })
  console.log('Navigation response:', response?.status())

  await page.waitForSelector('form', { timeout: 10000 })
  await page.waitForTimeout(500)

  // Take full page screenshot to see Special Instructions section
  await page.screenshot({ path: 'test-results/full-form-layout.png', fullPage: true })
  console.log('📸 Full page screenshot saved')
})
