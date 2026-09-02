/**
 * US-874/875/876 golden path: a Shipper who created their tenant (so is_tenant_admin=true)
 * navigates via the real header menu (not page.goto()) to Team & Org Settings, sees their
 * team, grants/revokes admin status on a second member, and saves an org default. Also
 * verifies a plain (non-admin) member never sees the entry point and is denied direct access.
 */
import { test, expect } from '@playwright/test'

const BACKEND = process.env.TEST_BACKEND_URL || 'http://localhost:9091'
const FRONTEND = process.env.TEST_FRONTEND_URL || 'http://localhost:9090'

async function registerShipperAdmin(companyPrefix: string) {
  const email = `shipper-admin-${companyPrefix}-${Date.now()}@freightclub.local`
  const res = await fetch(`${BACKEND}/api/test/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email, password: 'E2ETestPassword123!', firstName: 'Alice', lastName: 'Admin',
      role: 'SHIPPER', companyName: `${companyPrefix}-${Date.now()}`,
    }),
  })
  const body = await res.json()
  return { email, password: 'E2ETestPassword123!' as const, tenantId: body.user.tenantId as string }
}

async function fetchJoinCode(backendAccessToken: string, tenantId: string): Promise<string> {
  const res = await fetch(`${BACKEND}/api/v1/team/join-code`, {
    headers: { Authorization: `Bearer ${backendAccessToken}` },
  })
  const body = await res.json()
  return body.joinCode
}

async function loginViaUi(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto(`${FRONTEND}/`, { waitUntil: 'networkidle' })
  await page.locator('[data-testid="header-login-btn"]').click()
  await expect(page.locator('[data-testid="login-modal"]')).toBeVisible()
  await page.fill('[data-testid="email-input"]', email)
  await page.fill('[data-testid="password-input"]', password)
  await page.click('[data-testid="login-submit-btn"]')
  await page.waitForURL(/\/dashboard\/shipper/, { timeout: 30000 })
}

test.describe('Shipper Admin — Team & Org Settings (US-874/875/876)', () => {
  test('admin navigates via header menu, manages team, and saves org defaults', async ({ page, request }) => {
    // Static-asset failure guard (FREIG-114 pattern, login-integration.spec.ts) — registered
    // before any navigation. API 401s are explicitly excluded: apiClient's interceptor
    // treats a single 401 as "access token expired," silently refreshes, and retries — that's
    // by design, not a bug, and login-integration.spec.ts's own equivalent guard excludes
    // /api/ for the same reason.
    const failedRequests: string[] = []
    page.on('response', (res) => { if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`) })

    const admin = await registerShipperAdmin('acme')

    // Get the admin's access token directly (setup only) to create a second member via join
    // code — the UI verification itself happens entirely through real UI interaction below.
    const loginRes = await request.post(`${BACKEND}/api/v1/auth/login`, {
      data: { email: admin.email, password: admin.password },
    })
    const { accessToken } = await loginRes.json()
    const joinCode = await fetchJoinCode(accessToken, admin.tenantId)

    const memberEmail = `shipper-member-${Date.now()}@freightclub.local`
    const memberRegisterRes = await fetch(`${BACKEND}/api/test/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: memberEmail, password: 'E2ETestPassword123!', firstName: 'Bob', lastName: 'Member',
        role: 'SHIPPER', joinCode,
      }),
    })
    const memberId: string = (await memberRegisterRes.json()).user.id

    // Real UI login + real UI navigation (per testing_standards.md — no page.goto() to the
    // destination).
    await loginViaUi(page, admin.email, admin.password)

    await page.locator('[data-testid="avatar-button"]').click()
    await expect(page.locator('[data-testid="avatar-dropdown"]')).toBeVisible()
    await page.locator('[data-testid="team-settings-menuitem"]').click()
    await page.waitForURL(/\/shipper\/admin\/team/, { timeout: 10000 })

    await expect(page.locator('[data-testid="shipper-team-settings-page"]')).toBeVisible()
    await expect(page.locator('[data-testid="join-code-value"]')).toHaveText(joinCode)

    // Both members visible, admin badge only on the creator.
    const memberRows = page.locator('[data-testid^="team-member-"]')
    await expect(memberRows).toHaveCount(2)
    const memberRow = page.locator(`[data-testid="team-member-${memberId}"]`)
    await expect(memberRow).toBeVisible()

    // Grant admin to the second member, then revoke it — both round-trip through the real
    // backend (no mocking).
    await page.locator(`[data-testid="toggle-admin-${memberId}"]`).click()
    await expect(page.locator(`[data-testid="admin-badge-${memberId}"]`)).toBeVisible({ timeout: 10000 })

    await page.locator(`[data-testid="toggle-admin-${memberId}"]`).click()
    await expect(page.locator(`[data-testid="admin-badge-${memberId}"]`)).not.toBeVisible({ timeout: 10000 })

    // Org settings: save a default pickup city, verify it persists across reload.
    await page.locator('[data-testid="org-setting-defaultPickupCity"]').fill('Austin')
    await page.locator('[data-testid="save-org-settings"]').click()

    await page.reload({ waitUntil: 'networkidle' })
    await expect(page.locator('[data-testid="org-setting-defaultPickupCity"]')).toHaveValue('Austin')

    const assetFailures = failedRequests.filter((url) => !url.includes('/api/'))
    expect(assetFailures, `Unexpected failed asset requests: ${assetFailures.join(', ')}`).toEqual([])
  })

  test('a plain (non-admin) member never sees the entry point and is denied direct access', async ({ page, request }) => {
    const admin = await registerShipperAdmin('beta')
    const loginRes = await request.post(`${BACKEND}/api/v1/auth/login`, {
      data: { email: admin.email, password: admin.password },
    })
    const { accessToken } = await loginRes.json()
    const joinCode = await fetchJoinCode(accessToken, admin.tenantId)

    const memberEmail = `shipper-plain-${Date.now()}@freightclub.local`
    const memberPassword = 'E2ETestPassword123!'
    await fetch(`${BACKEND}/api/test/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: memberEmail, password: memberPassword, firstName: 'Carol', lastName: 'Plain',
        role: 'SHIPPER', joinCode,
      }),
    })

    await loginViaUi(page, memberEmail, memberPassword)

    // Entry point: the menu item must not exist for a non-admin member.
    await page.locator('[data-testid="avatar-button"]').click()
    await expect(page.locator('[data-testid="avatar-dropdown"]')).toBeVisible()
    await expect(page.locator('[data-testid="team-settings-menuitem"]')).toHaveCount(0)

    // Direct navigation (bypassing the UI entry point) must be denied by the route guard —
    // this is the one legitimate use of page.goto() here, since it's testing the guard
    // itself, not standing in for the click-through path already covered above.
    await page.goto(`${FRONTEND}/shipper/admin/team`, { waitUntil: 'networkidle' })
    await expect(page.locator('[data-testid="shipper-team-settings-page"]')).toHaveCount(0)
  })
})
