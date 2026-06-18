import { test } from '@playwright/test'

test('check DOM for special instructions', async ({ page }) => {
  await page.goto('http://localhost:9090/shipper/loads/new', { waitUntil: 'networkidle' })
  await page.waitForSelector('form', { timeout: 10000 })

  const specialInstructionsExists = await page.locator('textarea#specialRequirements').count()
  console.log('Special Instructions textarea exists:', specialInstructionsExists > 0)

  const allTextareas = await page.locator('textarea').count()
  console.log('Total textareas in form:', allTextareas)

  // Get all h4 elements
  const h4s = await page.locator('h4').count()
  console.log('Total h4 elements:', h4s)

  // Get the actual text content of the textarea parent
  const textareaParentText = await page.locator('textarea#specialRequirements').evaluate((el) => el.parentElement?.parentElement?.textContent || 'NOT FOUND')
  console.log('Textarea parent text:', textareaParentText.substring(0, 100))
})
