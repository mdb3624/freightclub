import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useLogin } from './useLogin'
import { authApi } from '../api'

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}))

vi.mock('../api', () => ({
  authApi: {
    login: vi.fn(),
  },
}))

const mockSetAuth = vi.fn()

vi.mock('@/store/authStore', () => ({
  useAuthStore: (selector: (s: { setAuth: typeof mockSetAuth }) => unknown) =>
    selector({ setAuth: mockSetAuth }),
}))

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useLogin', () => {
  let mockNavigate: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockNavigate = vi.fn()
    ;(useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // US-730 CHG-849: TRUCKER must land on the real dashboard (TruckerDashboard.tsx
  // at /dashboard/trucker), not the orphaned mock (CarrierDashboard.tsx at
  // /dashboard/carrier) — this was a live production bug discovered while
  // verifying the carrier workflow.
  it('navigates TRUCKER role to /dashboard/trucker', async () => {
    ;(authApi.login as ReturnType<typeof vi.fn>).mockResolvedValue({
      accessToken: 'token-123',
      user: { id: 'u1', role: 'TRUCKER', firstName: 'T', lastName: 'Trucker', email: 't@test.com' },
    })

    const { result } = renderHook(() => useLogin(), { wrapper })
    result.current.mutate({ email: 't@test.com', password: 'pw' })

    await waitFor(() => expect(mockNavigate).toHaveBeenCalled())

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/trucker', { replace: true })
  })

  it('navigates SHIPPER role to /dashboard/shipper', async () => {
    ;(authApi.login as ReturnType<typeof vi.fn>).mockResolvedValue({
      accessToken: 'token-456',
      user: { id: 'u2', role: 'SHIPPER', firstName: 'S', lastName: 'Shipper', email: 's@test.com' },
    })

    const { result } = renderHook(() => useLogin(), { wrapper })
    result.current.mutate({ email: 's@test.com', password: 'pw' })

    await waitFor(() => expect(mockNavigate).toHaveBeenCalled())

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/shipper', { replace: true })
  })
})
