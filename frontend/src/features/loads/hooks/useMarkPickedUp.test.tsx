import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMarkPickedUp } from './useMarkPickedUp'
import { loadsApi } from '../api'

vi.mock('../api', () => ({ loadsApi: { pickup: vi.fn() } }))

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useMarkPickedUp', () => {
  beforeEach(() => vi.clearAllMocks())

  it('passes exceptionNotes and exceptionPhoto through to loadsApi.pickup', async () => {
    vi.mocked(loadsApi.pickup).mockResolvedValue({ id: 'load-1', status: 'IN_TRANSIT' } as any)
    const { result } = renderHook(() => useMarkPickedUp(), { wrapper })

    const photo = new File(['x'], 'damage.jpg', { type: 'image/jpeg' })
    result.current.mutate({ id: 'load-1', exceptionNotes: 'Damaged pallet', exceptionPhoto: photo })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(loadsApi.pickup).toHaveBeenCalledWith('load-1', { exceptionNotes: 'Damaged pallet', exceptionPhoto: photo })
  })
})
