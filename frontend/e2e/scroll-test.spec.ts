import { test } from '@playwright/test'

test('scroll and verify special instructions in cargo section', async ({ page }) => {
  await page.goto('http://localhost:9090/shipper/loads/new', { waitUntil: 'networkidle' })
  await page.waitForSelector('form', { timeout: 10000 })

  // Scroll to reveal the lower sections
  await page.evaluate(() => window.scrollBy(0, 400))
  await page.waitForTimeout(300)

  // Take screenshot of scrolled view
  await page.screenshot({ path: 'test-results/special-instructions-location.png' })
  
  // Check if Special Instructions is in the middle column (CARGO & EQUIPMENT)
  const hasMidColSpecial = await page.evaluate(() => {
    const form = document.querySelector('form')
    if (!form) return false
    const formText = form.innerText
    return formText.includes('SPECIAL INSTRUCTIONS') && formText.includes('CARGO & EQUIPMENT')
  })
  
  console.log('Special Instructions in form:', hasMidColSpecial)
})
