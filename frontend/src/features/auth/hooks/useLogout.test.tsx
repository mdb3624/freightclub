import { renderHook } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useNavigate } from 'react-router-dom'
import { useLogout } from './useLogout'
import { authApi } from '../api'
import { queryClient } from '@/lib/queryClient'

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}))

vi.mock('../api', () => ({
  authApi: {
    logout: vi.fn().mockResolvedValue(undefined),
  },
}))

const mockLogout = vi.fn()

vi.mock('@/store/authStore', () => ({
  useAuthStore: (selector: (s: { logout: typeof mockLogout }) => unknown) =>
    selector({ logout: mockLogout }),
}))

describe('useLogout', () => {
  let mockNavigate: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockNavigate = vi.fn()
    ;(useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // Session cache must not survive a logout — otherwise a different user
  // logging in on the same device can briefly see the previous user's
  // cached React Query data before fresh requests resolve.
  it('clears the React Query cache, clears the auth store, and navigates home', () => {
    const clearSpy = vi.spyOn(queryClient, 'clear')

    const { result } = renderHook(() => useLogout())
    result.current()

    expect(mockLogout).toHaveBeenCalled()
    expect(clearSpy).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    expect(authApi.logout).toHaveBeenCalled()
  })

  it('clears the store and cache before navigating (order matters for stale-data prevention)', () => {
    const callOrder: string[] = []
    mockLogout.mockImplementation(() => callOrder.push('store-logout'))
    const clearSpy = vi.spyOn(queryClient, 'clear').mockImplementation(() => callOrder.push('cache-clear'))
    mockNavigate.mockImplementation(() => callOrder.push('navigate'))

    const { result } = renderHook(() => useLogout())
    result.current()

    expect(callOrder).toEqual(['store-logout', 'cache-clear', 'navigate'])
    clearSpy.mockRestore()
  })
})
