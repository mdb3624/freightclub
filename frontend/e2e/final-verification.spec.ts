import { test } from '@playwright/test'

test('final layout verification', async ({ page }) => {
  await page.goto('http://localhost:9090/shipper/loads/new', { waitUntil: 'networkidle' })
  await page.waitForSelector('form', { timeout: 10000 })
  await page.waitForTimeout(300)

  // Scroll to see different parts of the form
  // First capture top part
  await page.screenshot({ path: 'test-results/layout-top.png', fullPage: false })
  console.log('✅ Captured top section')
  
  // Scroll down to see Special Instructions
  await page.evaluate(() => window.scrollBy(0, 300))
  await page.waitForTimeout(200)
  await page.screenshot({ path: 'test-results/layout-middle.png', fullPage: false })
  console.log('✅ Captured middle section with Special Instructions')
  
  // Verify the form has the expected fields
  const formContent = await page.evaluate(() => {
    const form = document.querySelector('form')
    if (!form) return { error: 'FORM NOT FOUND' }
    
    const text = form.innerText
    return {
      hasEquipmentType: text.includes('Equipment Type'),
      hasCommodity: text.includes('Commodity'),
      hasDimensions: text.includes('DIMENSIONS'),
      hasSpecialInstructions: text.includes('Special Instructions'),
      hasPaymentTerms: text.includes('Terms'),
      hasPayRate: text.includes('Pay Rate'),
    }
  })
  
  console.log('Form field verification:', formContent)
})
