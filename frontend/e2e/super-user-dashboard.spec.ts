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

async function loginAsSuperUser(page: import('@playwright/test').Page) {
  const superUser = await registerSuperUser()
  await page.goto(`${FRONTEND}/`, { waitUntil: 'networkidle' })
  await page.locator('[data-testid="header-login-btn"]').click()
  await page.fill('[data-testid="email-input"]', superUser.email)
  await page.fill('[data-testid="password-input"]', superUser.password)
  await page.click('[data-testid="login-submit-btn"]')
  await page.waitForURL(/\/super-user/, { timeout: 30000 })
  return superUser
}

async function registerShipperAndGetId(request: import('@playwright/test').APIRequestContext) {
  const email = `shipper-target-${Date.now()}@freightclub.local`
  const password = 'E2ETestPassword123!'
  const res = await request.post(`${BACKEND}/api/test/auth/register`, {
    data: { email, password, firstName: 'Target', lastName: 'Shipper', role: 'SHIPPER', companyName: `co-${Date.now()}` },
  })
  const body = await res.json()
  return { email, password, userId: body.user.id }
}

// US-880/881/886: the frontend build-out for the Super User management endpoints — real
// backend calls, not mocked, since these are governed/audited write actions.
test('Super User suspends a user from the Users tab and it blocks their login', async ({ page, request }) => {
  const superUser = await loginAsSuperUser(page)
  const target = await registerShipperAndGetId(request)
  void superUser

  await page.locator('[data-testid="super-user-tab-users"]').click()
  await page.fill('[data-testid="user-id-input"]', target.userId)
  await page.fill('[data-testid="user-reason-input"]', 'E2E fraud report')
  await page.click('[data-testid="suspend-user-btn"]')
  await expect(page.getByText('Action completed.')).toBeVisible({ timeout: 10000 })

  // The suspended user really cannot log in — full round trip through the real API.
  const loginRes = await request.post(`${BACKEND}/api/v1/auth/login`, {
    data: { email: target.email, password: target.password },
  })
  expect(loginRes.status()).toBe(403)
})

// US-886: create a user in an existing tenant, then redeem the returned setup token for real.
test('Super User creates a user in an existing tenant and the setup token is redeemable', async ({ page, request }) => {
  await loginAsSuperUser(page)
  const email = `created-by-super-user-${Date.now()}@example.com`
  const companyRes = await request.post(`${BACKEND}/api/test/auth/register`, {
    data: {
      email: `owner-${Date.now()}@example.com`, password: 'E2ETestPassword123!',
      firstName: 'Owner', lastName: 'Co', role: 'SHIPPER', companyName: `existing-co-${Date.now()}`,
    },
  })
  const tenantId = (await companyRes.json()).user.tenantId

  await page.locator('[data-testid="super-user-tab-create"]').click()
  await page.fill('[data-testid="create-tenant-id-input"]', tenantId)
  await page.fill('[data-testid="create-email-input"]', email)
  await page.fill('[data-testid="create-first-name-input"]', 'New')
  await page.fill('[data-testid="create-last-name-input"]', 'Teammate')
  await page.fill('[data-testid="create-reason-input"]', 'E2E teammate request')
  await page.click('[data-testid="create-submit-btn"]')

  const tokenEl = page.locator('[data-testid="issued-token"]')
  await expect(tokenEl).toBeVisible({ timeout: 10000 })
  const setupToken = await tokenEl.textContent()

  const redeemRes = await request.post(`${BACKEND}/api/v1/auth/reset-password`, {
    data: { token: setupToken, newPassword: 'BrandNewPassword1!' },
  })
  expect(redeemRes.status()).toBe(204)

  const loginRes = await request.post(`${BACKEND}/api/v1/auth/login`, {
    data: { email, password: 'BrandNewPassword1!' },
  })
  expect(loginRes.status()).toBe(200)
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
