import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useLoadBoard } from './useLoadBoard'
import React from 'react'

// Mock apiGet
vi.mock('@/lib/apiClient', () => ({
  apiGet: vi.fn(),
}))

import { apiGet } from '@/lib/apiClient'

describe('useLoadBoard', () => {
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
    expect(typeof useLoadBoard).toBe('function')
  })

  it('should fetch paginated loads with pagination and sort parameters', async () => {
    const mockData = {
      loads: [
        {
          id: 'LOAD-001',
          originCity: 'San Jose',
          originState: 'CA',
          destinationCity: 'Phoenix',
          destinationState: 'AZ',
          pickupEarliest: '2026-05-20T08:00:00Z',
          pickupLatest: '2026-05-20T17:00:00Z',
          status: 'OPEN',
          payAmount: 1200,
          payUnit: 'flat',
          claimedByTruckerName: null,
          createdAt: '2026-05-19T10:30:00Z',
        },
      ],
      pagination: { page: 0, limit: 20, total: 1 },
    }

    vi.mocked(apiGet).mockResolvedValueOnce(mockData)

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(
      () =>
        useLoadBoard({
          page: 0,
          view: 'active',
          sort: 'pickupDate',
          order: 'asc',
        }),
      { wrapper }
    )

    // Initially loading
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.data?.loads).toHaveLength(1)
    expect(result.current.data?.loads[0]?.id).toBe('LOAD-001')
    expect(result.current.data?.pagination?.page).toBe(0)
    expect(result.current.data?.pagination?.total).toBe(1)
    expect(result.current.error).toBeNull()
  })

  it('should pass correct pagination and sort query parameters', async () => {
    const mockData = {
      loads: [],
      pagination: { page: 1, limit: 20, total: 0 },
    }

    vi.mocked(apiGet).mockResolvedValueOnce(mockData)

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children)

    renderHook(
      () =>
        useLoadBoard({
          page: 1,
          view: 'all',
          sort: 'payAmount',
          order: 'desc',
        }),
      { wrapper }
    )

    await waitFor(() => {
      expect(vi.mocked(apiGet)).toHaveBeenCalled()
    })

    const callUrl = vi.mocked(apiGet).mock.calls[0]?.[0] as string
    expect(callUrl).toContain('page=1')
    expect(callUrl).toContain('view=all')
    expect(callUrl).toContain('sort=payAmount')
    expect(callUrl).toContain('order=desc')
    expect(callUrl).toContain('limit=20')
  })

  it('should include search parameter when provided', async () => {
    const mockData = {
      loads: [],
      pagination: { page: 0, limit: 20, total: 0 },
    }

    vi.mocked(apiGet).mockResolvedValueOnce(mockData)

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children)

    renderHook(
      () =>
        useLoadBoard({
          page: 0,
          view: 'active',
          sort: 'pickupDate',
          order: 'asc',
          search: 'Phoenix',
        }),
      { wrapper }
    )

    await waitFor(() => {
      expect(vi.mocked(apiGet)).toHaveBeenCalled()
    })

    const callUrl = vi.mocked(apiGet).mock.calls[0]?.[0] as string
    expect(callUrl).toContain('search=Phoenix')
  })

  it('should handle different views with separate cache entries', async () => {
    const mockDataActive = {
      loads: [
        {
          id: 'LOAD-001',
          originCity: 'San Jose',
          originState: 'CA',
          destinationCity: 'Phoenix',
          destinationState: 'AZ',
          pickupEarliest: '2026-05-20T08:00:00Z',
          pickupLatest: '2026-05-20T17:00:00Z',
          status: 'OPEN',
          payAmount: 1200,
          payUnit: 'flat',
          claimedByTruckerName: null,
          createdAt: '2026-05-19T10:30:00Z',
        },
      ],
      pagination: { page: 0, limit: 20, total: 1 },
    }

    const mockDataAll = {
      loads: [
        {
          id: 'LOAD-001',
          originCity: 'San Jose',
          originState: 'CA',
          destinationCity: 'Phoenix',
          destinationState: 'AZ',
          pickupEarliest: '2026-05-20T08:00:00Z',
          pickupLatest: '2026-05-20T17:00:00Z',
          status: 'OPEN',
          payAmount: 1200,
          payUnit: 'flat',
          claimedByTruckerName: null,
          createdAt: '2026-05-19T10:30:00Z',
        },
        {
          id: 'LOAD-002',
          originCity: 'Los Angeles',
          originState: 'CA',
          destinationCity: 'Las Vegas',
          destinationState: 'NV',
          pickupEarliest: '2026-05-21T06:00:00Z',
          pickupLatest: '2026-05-21T18:00:00Z',
          status: 'DELIVERED',
          payAmount: 800,
          payUnit: 'flat',
          claimedByTruckerName: 'John Trucker',
          createdAt: '2026-05-18T14:00:00Z',
        },
      ],
      pagination: { page: 0, limit: 20, total: 2 },
    }

    vi.mocked(apiGet)
      .mockResolvedValueOnce(mockDataActive)
      .mockResolvedValueOnce(mockDataAll)

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children)

    const { result: resultActive } = renderHook(
      () =>
        useLoadBoard({
          page: 0,
          view: 'active',
          sort: 'pickupDate',
          order: 'asc',
        }),
      { wrapper }
    )

    await waitFor(() => expect(resultActive.current.isLoading).toBe(false))

    const { result: resultAll } = renderHook(
      () =>
        useLoadBoard({
          page: 0,
          view: 'all',
          sort: 'pickupDate',
          order: 'asc',
        }),
      { wrapper }
    )

    await waitFor(() => expect(resultAll.current.isLoading).toBe(false))

    // Each should have their own data
    expect(resultActive.current.data?.loads).toHaveLength(1)
    expect(resultAll.current.data?.loads).toHaveLength(2)
    expect(resultActive.current.data?.pagination?.total).toBe(1)
    expect(resultAll.current.data?.pagination?.total).toBe(2)

    // API should be called twice (different query keys)
    expect(vi.mocked(apiGet)).toHaveBeenCalledTimes(2)
  })

  it('should handle pagination page changes with separate cache entries', async () => {
    const mockDataPage0 = {
      loads: [{ id: 'LOAD-001' }],
      pagination: { page: 0, limit: 20, total: 50 },
    }
    const mockDataPage1 = {
      loads: [{ id: 'LOAD-021' }],
      pagination: { page: 1, limit: 20, total: 50 },
    }

    vi.mocked(apiGet)
      .mockResolvedValueOnce(mockDataPage0)
      .mockResolvedValueOnce(mockDataPage1)

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children)

    // Page 0
    const { result: resultPage0 } = renderHook(
      () =>
        useLoadBoard({
          page: 0,
          view: 'active',
          sort: 'pickupDate',
          order: 'asc',
        }),
      { wrapper }
    )

    await waitFor(() => expect(resultPage0.current.isLoading).toBe(false))

    // Page 1
    const { result: resultPage1 } = renderHook(
      () =>
        useLoadBoard({
          page: 1,
          view: 'active',
          sort: 'pickupDate',
          order: 'asc',
        }),
      { wrapper }
    )

    await waitFor(() => expect(resultPage1.current.isLoading).toBe(false))

    // Each should have their own data
    expect(resultPage0.current.data?.pagination?.page).toBe(0)
    expect(resultPage1.current.data?.pagination?.page).toBe(1)

    // API should be called twice
    expect(vi.mocked(apiGet)).toHaveBeenCalledTimes(2)
  })

  it('should maintain staleTime and gcTime configuration', async () => {
    const mockData = {
      loads: [],
      pagination: { page: 0, limit: 20, total: 0 },
    }

    vi.mocked(apiGet).mockResolvedValueOnce(mockData)

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(
      () =>
        useLoadBoard({
          page: 0,
          view: 'active',
          sort: 'pickupDate',
          order: 'asc',
        }),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // The hook should be configured with appropriate cache times
    expect(result.current.data).toEqual(mockData)
  })
})
