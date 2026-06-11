import { Page } from '@playwright/test'

/**
 * TestDataSeeder: Helper for E2E test setup and authentication
 *
 * Provides methods to authenticate test users and configure test environment
 */
export class TestDataSeeder {
  private page: Page
  private testUserId: string

  constructor(page: Page) {
    this.page = page
    this.testUserId = `e2e-test-${Date.now()}`
  }

  /**
   * Authenticate a user for the test
   * @param role - User role: 'shipper', 'carrier', 'trucker', etc.
   */
  async setUserAuth(role: 'shipper' | 'carrier' | 'trucker' = 'shipper'): Promise<void> {
    // Navigate to frontend
    await this.page.goto('http://localhost:9090', { waitUntil: 'networkidle' })

    // Check if already authenticated via auth.json
    const authState = await this.page.evaluate(() => {
      const stored = localStorage.getItem('auth_state')
      return stored ? JSON.parse(stored) : null
    })

    if (authState?.user) {
      // Already authenticated
      return
    }

    // Authenticate via API
    const email = `${this.testUserId}@freightclub.local`
    const password = 'TestPassword123!'

    // Register user
    const registerRes = await this.page.request.post('http://localhost:9091/api/v1/auth/register', {
      data: {
        email,
        password,
        role: role.toUpperCase(),
        firstName: 'E2E',
        lastName: 'Test',
        businessName: `Test ${role}`,
      },
    })

    if (!registerRes.ok() && registerRes.status() !== 409) {
      throw new Error(`Registration failed: ${registerRes.status()}`)
    }

    // Login to get tokens
    const loginRes = await this.page.request.post('http://localhost:9091/api/v1/auth/login', {
      data: { email, password },
    })

    if (!loginRes.ok()) {
      throw new Error(`Login failed: ${loginRes.status()}`)
    }

    const loginData = await loginRes.json() as Record<string, unknown>

    // Store auth state in localStorage
    await this.page.evaluate(
      (authData) => {
        localStorage.setItem('auth_state', JSON.stringify(authData))
      },
      {
        user: {
          id: loginData.userId,
          email,
          role: role.toUpperCase(),
        },
        accessToken: loginData.accessToken,
      }
    )

    // Verify cookies are set
    const cookies = await this.page.context().cookies()
    const hasRefreshToken = cookies.some(c => c.name === 'refreshToken')
    if (!hasRefreshToken && loginData.refreshToken) {
      // Cookie should be set by browser automatically on response
      // If not, try to set it manually
      await this.page.context().addCookies([
        {
          name: 'refreshToken',
          value: loginData.refreshToken as string,
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax',
        },
      ])
    }
  }

  /**
   * Get the test user ID (for reference in tests)
   */
  getTestUserId(): string {
    return this.testUserId
  }

  /**
   * Clear authentication (logout)
   */
  async clearAuth(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.removeItem('auth_state')
    })

    await this.page.context().clearCookies({ name: 'refreshToken' })
  }
}
