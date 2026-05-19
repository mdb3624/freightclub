import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useLoadStats } from './useLoadStats'
import React from 'react'

// Mock apiGet
vi.mock('@/lib/apiClient', () => ({
  apiGet: vi.fn(),
}))

import { apiGet } from '@/lib/apiClient'

describe('useLoadStats', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return hook with expected shape', () => {
    expect(typeof useLoadStats).toBe('function')
  })

  it('should initialize with loading state and no data', () => {
    vi.mocked(apiGet).mockResolvedValueOnce({
      active: { open: 0, claimed: 0, inTransit: 0, delivered: 0 },
      all: null,
    })
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useLoadStats('active'), { wrapper })
    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('error')
    expect(result.current.data).toBeUndefined()
  })

  it('should fetch load stats with active view', async () => {
    const mockStats = {
      active: { open: 5, claimed: 3, inTransit: 2, delivered: 10 },
      all: null,
    }

    vi.mocked(apiGet).mockResolvedValueOnce(mockStats)

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useLoadStats('active'), { wrapper })

    // Initially loading
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Verify stats data is loaded
    expect(result.current.data).toEqual(mockStats)
    expect(result.current.data?.active?.open).toBe(5)
    expect(result.current.data?.active?.claimed).toBe(3)
    expect(result.current.data?.active?.inTransit).toBe(2)
    expect(result.current.data?.active?.delivered).toBe(10)
    expect(result.current.error).toBeNull()
  })

  it('should fetch load stats with all view', async () => {
    const mockStats = {
      active: null,
      all: { open: 20, claimed: 15, inTransit: 8, delivered: 50 },
    }

    vi.mocked(apiGet).mockResolvedValueOnce(mockStats)

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useLoadStats('all'), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockStats)
    expect(result.current.data?.all?.open).toBe(20)
  })

  it('should cache stats data on subsequent calls', async () => {
    const mockStats = {
      active: { open: 5, claimed: 3, inTransit: 2, delivered: 10 },
      all: null,
    }

    vi.mocked(apiGet).mockResolvedValueOnce(mockStats)

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children)

    // First call
    const { result: result1 } = renderHook(() => useLoadStats('active'), { wrapper })
    await waitFor(() => expect(result1.current.isLoading).toBe(false))

    // Second call should not trigger API again (within staleTime)
    const { result: result2 } = renderHook(() => useLoadStats('active'), { wrapper })

    // Should immediately have data (cached)
    expect(result2.current.data).toEqual(mockStats)
    expect(result2.current.isLoading).toBe(false)

    // API should only be called once
    expect(vi.mocked(apiGet)).toHaveBeenCalledTimes(1)
  })

  it('should pass correct query parameters', async () => {
    const mockStats = {
      active: { open: 5, claimed: 3, inTransit: 2, delivered: 10 },
      all: null,
    }

    vi.mocked(apiGet).mockResolvedValueOnce(mockStats)

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children)

    renderHook(() => useLoadStats('active'), { wrapper })

    await waitFor(() => {
      expect(vi.mocked(apiGet)).toHaveBeenCalledWith('/shipper/loads/stats?view=active')
    })
  })

  it('should handle different views with separate cache entries', async () => {
    const mockStatsActive = {
      active: { open: 5, claimed: 3, inTransit: 2, delivered: 10 },
      all: null,
    }
    const mockStatsAll = {
      active: null,
      all: { open: 20, claimed: 15, inTransit: 8, delivered: 50 },
    }

    vi.mocked(apiGet)
      .mockResolvedValueOnce(mockStatsActive)
      .mockResolvedValueOnce(mockStatsAll)

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children)

    const { result: resultActive } = renderHook(() => useLoadStats('active'), { wrapper })
    await waitFor(() => expect(resultActive.current.isLoading).toBe(false))

    const { result: resultAll } = renderHook(() => useLoadStats('all'), { wrapper })
    await waitFor(() => expect(resultAll.current.isLoading).toBe(false))

    // Each should have their own data
    expect(resultActive.current.data?.active?.open).toBe(5)
    expect(resultAll.current.data?.all?.open).toBe(20)

    // API should be called twice (different query keys)
    expect(vi.mocked(apiGet)).toHaveBeenCalledTimes(2)
  })
})
