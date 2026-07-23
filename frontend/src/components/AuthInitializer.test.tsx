import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthInitializer } from './AuthInitializer'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types'

vi.mock('@/lib/apiClient', () => ({
  refreshAccessToken: vi.fn(),
}))

vi.mock('@/hooks/useLazyFonts', () => ({
  useLazyFonts: vi.fn(),
}))

import { refreshAccessToken } from '@/lib/apiClient'

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'SHIPPER',
  tenantId: 'tenant-1',
}

// PROJECT_AUDIT_2026-07-23 item 4: the access token is no longer persisted to
// localStorage, so AuthInitializer is the only mechanism that can restore a
// session on reload — via a silent /auth/refresh call against the HTTP-only
// cookie, never by reading a stored token.
describe('AuthInitializer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false })
  })

  it('renders children without attempting a refresh when no session was persisted', async () => {
    render(
      <AuthInitializer>
        <div>app content</div>
      </AuthInitializer>
    )

    await waitFor(() => expect(screen.getByText('app content')).toBeInTheDocument())
    expect(refreshAccessToken).not.toHaveBeenCalled()
  })

  it('silently refreshes and restores the session when a user was persisted', async () => {
    localStorage.setItem('freightclub_user', JSON.stringify(mockUser))
    vi.mocked(refreshAccessToken).mockImplementation(async () => {
      useAuthStore.getState().setAccessToken('fresh-token')
      return 'fresh-token'
    })

    render(
      <AuthInitializer>
        <div>app content</div>
      </AuthInitializer>
    )

    await waitFor(() => expect(screen.getByText('app content')).toBeInTheDocument())
    expect(refreshAccessToken).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().accessToken).toBe('fresh-token')
  })

  it('logs out and renders unauthenticated when the silent refresh fails (cookie expired/missing)', async () => {
    localStorage.setItem('freightclub_user', JSON.stringify(mockUser))
    vi.mocked(refreshAccessToken).mockRejectedValue(new Error('401'))

    render(
      <AuthInitializer>
        <div>app content</div>
      </AuthInitializer>
    )

    await waitFor(() => expect(screen.getByText('app content')).toBeInTheDocument())
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().user).toBeNull()
    expect(localStorage.getItem('freightclub_user')).toBeNull()
  })
})
