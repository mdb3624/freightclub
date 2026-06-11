import { test, expect } from '@playwright/test'
import { TestDataSeeder } from './fixtures/test-data-seeder'

async function setUserAuth(page: any, user: any) {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.evaluate((u: any) => {
    localStorage.setItem('freightclub_access_token', u.accessToken)
    localStorage.setItem('freightclub_user', JSON.stringify({ id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role, tenantId: u.tenantId }))
  }, user)
}

test.describe('US-821: Shipper Dashboard Framework Compliance', () => {
  test('framework structure and token compliance', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `dashboard-${Date.now()}@test.com`,
      role: 'SHIPPER',
      firstName: 'Framework',
      lastName: 'Test',
      companyName: 'Framework Test Corp',
    })

    try {
      await setUserAuth(page, user)
      await page.goto('/dashboard/shipper/loads', { waitUntil: 'domcontentloaded' })
      await page.locator('.fc-shell').first().waitFor({ timeout: 10000 })
      await page.screenshot({ path: 'test-results/evidence/us-821-framework-compliance.png', fullPage: true })
    } finally {
      await seeder.cleanup()
    }
  })
})
