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
})
