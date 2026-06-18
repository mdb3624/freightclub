import { test } from '@playwright/test'

test('verify load form full-width layout', async ({ page }) => {
  // Navigate to load creation
  const response = await page.goto('http://localhost:9090/shipper/loads/new', { waitUntil: 'networkidle' })
  console.log('Navigation response:', response?.status(), 'Final URL:', page.url())

  // Check if we got redirected
  if (!page.url().includes('/shipper/loads/new')) {
    console.log('REDIRECTED TO:', page.url(), '— likely need SHIPPER role, not TRUCKER')
  }

  await page.waitForSelector('form', { timeout: 10000 })
  await page.waitForTimeout(500)

  const measurements = await page.evaluate(() => {
    const form = document.querySelector('form')
    if (!form) return 'FORM NOT FOUND'

    const formParent = form.parentElement
    const formGrandparent = formParent?.parentElement
    const formGreatGrandparent = formGrandparent?.parentElement
    const viewport = document.documentElement.clientWidth

    const getMeasure = (el: Element | null, label: string) => {
      if (!el) return `${label}: NOT FOUND`
      const rect = el.getBoundingClientRect()
      const style = window.getComputedStyle(el)
      const width = Math.round(rect.width)
      const display = style.display
      const flexValue = style.flex
      const classes = el.className
      return `${label}: width=${width}px, display=${display}, flex=${flexValue}, class="${classes}"`
    }

    return [
      `Viewport: ${viewport}px`,
      getMeasure(formGreatGrandparent, 'GREAT-GP'),
      getMeasure(formGrandparent, 'GRANDPARENT'),
      getMeasure(formParent, 'PARENT'),
      getMeasure(form, 'FORM'),
    ].join('\n  ')
  })

  console.log('=== FORM WIDTH MEASUREMENTS ===')
  console.log(measurements)

  // Take a screenshot to verify visual layout
  await page.screenshot({ path: 'test-results/load-form-layout.png', fullPage: true })
  console.log('📸 Screenshot saved to test-results/load-form-layout.png')
})
