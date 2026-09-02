/**
 * US-750/751/752 golden path: an ADMIN (Super User) logs in via the real login modal, lands
 * on /super-user (not a persona dashboard — there is no tenant for this role), and can switch
 * between Dashboard/Disputes/Health tabs, each backed by real API calls.
 */
import { test, expect } from '@playwright/test'

const BACKEND = process.env.TEST_BACKEND_URL || 'http://localhost:9091'
const FRONTEND = process.env.TEST_FRONTEND_URL || 'http://localhost:9090'

async function registerSuperUser() {
  const email = `super-user-${Date.now()}@freightclub.local`
  await fetch(`${BACKEND}/api/test/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email, password: 'E2ETestPassword123!', firstName: 'Sam', lastName: 'SuperUser',
      role: 'ADMIN', companyName: `n-a-${Date.now()}`,
    }),
  })
  return { email, password: 'E2ETestPassword123!' as const }
}

test('Super User logs in, lands on the platform-wide dashboard, and can view disputes and health', async ({ page }) => {
  // Static-asset failure guard (FREIG-114 pattern) — API 401s excluded, see
  // shipper-admin-team-settings.spec.ts for why.
  const failedRequests: string[] = []
  page.on('response', (res) => { if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`) })

  const superUser = await registerSuperUser()

  await page.goto(`${FRONTEND}/`, { waitUntil: 'networkidle' })
  await page.locator('[data-testid="header-login-btn"]').click()
  await expect(page.locator('[data-testid="login-modal"]')).toBeVisible()
  await page.fill('[data-testid="email-input"]', superUser.email)
  await page.fill('[data-testid="password-input"]', superUser.password)
  await page.click('[data-testid="login-submit-btn"]')

  // US-750: ADMIN has no tenant — lands on /super-user, never a persona dashboard.
  await page.waitForURL(/\/super-user/, { timeout: 30000 })
  await expect(page.locator('[data-testid="super-user-dashboard"]')).toBeVisible({ timeout: 10000 })

  await page.locator('[data-testid="super-user-tab-disputes"]').click()
  await expect(page.locator('[data-testid="super-user-disputes"]')).toBeVisible()

  await page.locator('[data-testid="super-user-tab-health"]').click()
  await expect(page.locator('[data-testid="super-user-health"]')).toBeVisible()

  const assetFailures = failedRequests.filter((url) => !url.includes('/api/'))
  expect(assetFailures, `Unexpected failed asset requests: ${assetFailures.join(', ')}`).toEqual([])
})

test('a plain Shipper cannot reach /super-user', async ({ page, request }) => {
  const email = `shipper-not-admin-${Date.now()}@freightclub.local`
  await request.post(`${BACKEND}/api/test/auth/register`, {
    data: {
      email, password: 'E2ETestPassword123!', firstName: 'Not', lastName: 'Admin',
      role: 'SHIPPER', companyName: `nope-${Date.now()}`,
    },
  })

  await page.goto(`${FRONTEND}/`, { waitUntil: 'networkidle' })
  await page.locator('[data-testid="header-login-btn"]').click()
  await page.fill('[data-testid="email-input"]', email)
  await page.fill('[data-testid="password-input"]', 'E2ETestPassword123!')
  await page.click('[data-testid="login-submit-btn"]')
  await page.waitForURL(/\/dashboard\/shipper/, { timeout: 30000 })

  // Direct navigation attempt — this is testing the route guard itself.
  await page.goto(`${FRONTEND}/super-user`, { waitUntil: 'networkidle' })
  await expect(page.locator('[data-testid="super-user-dashboard"]')).toHaveCount(0)
})
