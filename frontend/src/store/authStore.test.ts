import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'
import type { User } from '@/types'

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'SHIPPER',
  tenantId: 'tenant-1',
}

beforeEach(() => {
  useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false })
  localStorage.clear()
})

describe('authStore', () => {
  it('initializes with unauthenticated state', () => {
    const { accessToken, user, isAuthenticated } = useAuthStore.getState()
    expect(accessToken).toBeNull()
    expect(user).toBeNull()
    expect(isAuthenticated).toBe(false)
  })

  it('setAuth stores token, user, and marks authenticated', () => {
    useAuthStore.getState().setAuth('my-token', mockUser)

    const { accessToken, user, isAuthenticated } = useAuthStore.getState()
    expect(accessToken).toBe('my-token')
    expect(user).toEqual(mockUser)
    expect(isAuthenticated).toBe(true)
  })

  it('logout clears all auth state', () => {
    useAuthStore.getState().setAuth('my-token', mockUser)
    useAuthStore.getState().logout()

    const { accessToken, user, isAuthenticated } = useAuthStore.getState()
    expect(accessToken).toBeNull()
    expect(user).toBeNull()
    expect(isAuthenticated).toBe(false)
  })

  // PROJECT_AUDIT_2026-07-23 item 4: the access token must never touch
  // localStorage (XSS-exposure risk for the API bearer credential) — only
  // the non-sensitive user profile persists, for UI continuity across reload.
  it('setAuth never writes the access token to localStorage', () => {
    useAuthStore.getState().setAuth('my-token', mockUser)

    expect(localStorage.getItem('freightclub_access_token')).toBeNull()
    expect(JSON.parse(localStorage.getItem('freightclub_user')!)).toEqual(mockUser)
  })

  it('setAccessToken never writes to localStorage', () => {
    useAuthStore.getState().setAuth('my-token', mockUser)
    useAuthStore.getState().setAccessToken('rotated-token')

    expect(localStorage.getItem('freightclub_access_token')).toBeNull()
    expect(useAuthStore.getState().accessToken).toBe('rotated-token')
  })

  it('logout removes the persisted user but there was never a persisted token', () => {
    useAuthStore.getState().setAuth('my-token', mockUser)
    useAuthStore.getState().logout()

    expect(localStorage.getItem('freightclub_user')).toBeNull()
    expect(localStorage.getItem('freightclub_access_token')).toBeNull()
  })

  it('hydrate restores only the user profile, not accessToken/isAuthenticated', () => {
    localStorage.setItem('freightclub_user', JSON.stringify(mockUser))

    useAuthStore.getState().hydrate()

    const { accessToken, user, isAuthenticated } = useAuthStore.getState()
    expect(user).toEqual(mockUser)
    expect(accessToken).toBeNull()
    expect(isAuthenticated).toBe(false)
  })

  it('hydrate is a no-op when nothing was persisted', () => {
    useAuthStore.getState().hydrate()

    const { user, isAuthenticated } = useAuthStore.getState()
    expect(user).toBeNull()
    expect(isAuthenticated).toBe(false)
  })

  it('setAccessToken flips isAuthenticated once a user is already known (silent-refresh-on-mount path)', () => {
    localStorage.setItem('freightclub_user', JSON.stringify(mockUser))
    useAuthStore.getState().hydrate()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)

    useAuthStore.getState().setAccessToken('fresh-token')

    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().accessToken).toBe('fresh-token')
  })
})
