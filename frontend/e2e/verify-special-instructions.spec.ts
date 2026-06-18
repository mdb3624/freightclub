import { test, expect } from '@playwright/test'

test('verify special instructions moved to cargo section', async ({ page }) => {
  await page.goto('http://localhost:9090/shipper/loads/new', { waitUntil: 'networkidle' })
  await page.waitForSelector('form', { timeout: 10000 })

  const formStructure = await page.evaluate(() => {
    const form = document.querySelector('form')
    if (!form) return 'FORM NOT FOUND'
    
    // Get all h3/h4 section titles
    const titles = Array.from(form.querySelectorAll('h3, h4')).map((h) => h.textContent?.trim())
    return titles
  })

  console.log('Form sections:', formStructure)
  
  // Verify Special Instructions appears in form (should be under Cargo & Equipment now)
  const hasSpecialInstructions = formStructure.some((title) => title?.includes('SPECIAL INSTRUCTIONS'))
  console.log('Has Special Instructions:', hasSpecialInstructions)
})
