import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useProfile, __clearCache } from './useProfile'

// Mock profileApi
vi.mock('../api', () => ({
  profileApi: {
    get: vi.fn(),
  },
}))

import { profileApi } from '../api'

describe('useProfile Hook — US-757 Integration', () => {
  beforeEach(() => {
    __clearCache()
    vi.clearAllMocks()
  })

  afterEach(() => {
    __clearCache()
  })

  describe('AC8: Data persistence via useProfile API', () => {
    it('should return hook with expected shape', () => {
      expect(typeof useProfile).toBe('function')
    })

    it('should initialize with loading state and no data', () => {
      vi.mocked(profileApi.get).mockReturnValue(Promise.resolve({ id: 'user-1' }))
      const { result } = renderHook(() => useProfile())
      expect(result.current).toHaveProperty('data')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current.data).toBeUndefined()
    })

    it('should fetch and cache profile data successfully', async () => {
      const mockProfile = {
        id: 'trucker-1',
        truckPaymentLease: 1800,
        insurance: 900,
        iftaIrpPermits: 200,
        phoneEldMisc: 150,
        fuelCostPerGallon: 3.89,
        milesPerGallon: 6.5,
        maintenanceCostPerMile: 0.17,
        perDiemDailyRate: 50,
        perDiemDaysPerMonth: 20,
        monthlyMilesTarget: 8000,
        targetMarginPerMile: 0.6,
      }

      vi.mocked(profileApi.get).mockResolvedValueOnce(mockProfile)

      const { result } = renderHook(() => useProfile())

      // Initially loading
      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()
      expect(result.current.error).toBeNull()

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Verify profile data is cached and contains cost fields
      expect(result.current.data).toEqual(mockProfile)
      expect(result.current.error).toBeNull()
      expect(result.current.data.truckPaymentLease).toBe(1800)
      expect(result.current.data.monthlyMilesTarget).toBe(8000)
    })


    it('should cache profile data on subsequent calls', async () => {
      const mockProfile = { id: 'trucker-1', truckPaymentLease: 1800 }
      vi.mocked(profileApi.get).mockResolvedValueOnce(mockProfile)

      // First call
      const { result: result1 } = renderHook(() => useProfile())
      await waitFor(() => expect(result1.current.isLoading).toBe(false))

      // Second call should not trigger API again
      const { result: result2 } = renderHook(() => useProfile())

      // Should immediately have data (cached)
      expect(result2.current.data).toEqual(mockProfile)
      expect(result2.current.isLoading).toBe(false)

      // API should only be called once
      expect(vi.mocked(profileApi.get)).toHaveBeenCalledTimes(1)
    })
  })

  describe('Cost profile data fields', () => {
    it('should load all cost profile fields from API (AC3-4, AC9)', async () => {
      const mockProfile = {
        id: 'trucker-1',
        // Fixed Monthly Costs
        truckPaymentLease: 1800,
        insurance: 900,
        iftaIrpPermits: 200,
        phoneEldMisc: 150,
        // Variable Costs
        fuelCostPerGallon: 3.89,
        milesPerGallon: 6.5,
        maintenanceCostPerMile: 0.17,
        perDiemDailyRate: 50,
        perDiemDaysPerMonth: 20,
        // Operational
        monthlyMilesTarget: 8000,
        targetMarginPerMile: 0.6,
      }

      vi.mocked(profileApi.get).mockResolvedValueOnce(mockProfile)

      const { result } = renderHook(() => useProfile())

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      // Verify all cost profile fields are present
      const profile = result.current.data
      expect(profile.truckPaymentLease).toBe(1800)
      expect(profile.insurance).toBe(900)
      expect(profile.iftaIrpPermits).toBe(200)
      expect(profile.phoneEldMisc).toBe(150)
      expect(profile.fuelCostPerGallon).toBe(3.89)
      expect(profile.milesPerGallon).toBe(6.5)
      expect(profile.maintenanceCostPerMile).toBe(0.17)
      expect(profile.perDiemDailyRate).toBe(50)
      expect(profile.perDiemDaysPerMonth).toBe(20)
      expect(profile.monthlyMilesTarget).toBe(8000)
      expect(profile.targetMarginPerMile).toBe(0.6)
    })
  })
})
