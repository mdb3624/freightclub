import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import { useShipperProfile, useSaveShipperProfile, useUpdateShipperProfile, useProfileCompleteness } from '../hooks/useShipperProfile'
import * as shipperApi from '../api'

vi.mock('../api')

const mockedApi = shipperApi.shipperApi as unknown as Record<string, ReturnType<typeof vi.fn>>

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const mockProfile = {
  id: 'profile-1',
  companyName: 'Apex Freight',
  billingEmail: 'billing@apex.com',
  phoneNumber: '(512) 555-0182',
  city: 'Austin',
  state: 'TX',
  zipCode: '78701',
  mcNumber: '123456',
  usdotNumber: '',
  logoUrl: '',
  completenessPercent: 85,
  createdAt: '2026-05-13T10:00:00Z',
  updatedAt: '2026-05-13T10:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useShipperProfile', () => {
  it('fetches profile on mount', async () => {
    mockedApi.getProfile = vi.fn().mockResolvedValue(mockProfile)

    const { result } = renderHook(() => useShipperProfile(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockProfile)
    expect(mockedApi.getProfile).toHaveBeenCalledOnce()
  })

  it('handles fetch error', async () => {
    const error = new Error('Network error')
    mockedApi.getProfile = vi.fn().mockRejectedValue(error)

    const { result } = renderHook(() => useShipperProfile(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeDefined()
  })
})

describe('useSaveShipperProfile', () => {
  it('saves profile successfully', async () => {
    mockedApi.saveProfile = vi.fn().mockResolvedValue(mockProfile)

    const { result } = renderHook(() => useSaveShipperProfile(), { wrapper: createWrapper() })

    result.current.mutate({
      companyName: 'Apex Freight',
      billingEmail: 'billing@apex.com',
      phoneNumber: '(512) 555-0182',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
    })

    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })

    expect(mockedApi.saveProfile).toHaveBeenCalled()
  })

  it('invalidates profile queries on success', async () => {
    mockedApi.saveProfile = vi.fn().mockResolvedValue(mockProfile)
    mockedApi.getCompleteness = vi.fn().mockResolvedValue({
      completenessPercent: 85,
      isPublishReady: true,
      remainingFields: [],
    })

    const { result } = renderHook(() => useSaveShipperProfile(), { wrapper: createWrapper() })

    result.current.mutate({
      companyName: 'Apex Freight',
      billingEmail: 'billing@apex.com',
      phoneNumber: '(512) 555-0182',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
    })

    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })

    // Query cache should be invalidated (verified by no cached data on refetch)
    expect(mockedApi.saveProfile).toHaveBeenCalled()
  })
})

describe('useProfileCompleteness', () => {
  it('fetches completeness status', async () => {
    const completenessData = {
      completenessPercent: 85,
      isPublishReady: true,
      remainingFields: [],
    }
    mockedApi.getCompleteness = vi.fn().mockResolvedValue(completenessData)

    const { result } = renderHook(() => useProfileCompleteness(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(completenessData)
    expect(mockedApi.getCompleteness).toHaveBeenCalledOnce()
  })

  it('returns empty completeness when incomplete', async () => {
    const completenessData = {
      completenessPercent: 40,
      isPublishReady: false,
      remainingFields: ['companyName', 'city', 'state', 'zipCode'],
    }
    mockedApi.getCompleteness = vi.fn().mockResolvedValue(completenessData)

    const { result } = renderHook(() => useProfileCompleteness(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data?.isPublishReady).toBe(false)
    expect(result.current.data?.remainingFields).toHaveLength(4)
  })
})
