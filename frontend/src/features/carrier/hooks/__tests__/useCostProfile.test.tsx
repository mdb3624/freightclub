import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCostProfile } from '../useCostProfile'
import { costProfileApi } from '../../costProfileApi'

vi.mock('../../costProfileApi')

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useCostProfile', () => {
  beforeEach(() => vi.resetAllMocks())

  it('returns null data when no profile exists yet', async () => {
    vi.mocked(costProfileApi.get).mockResolvedValue(null)
    const { result } = renderHook(() => useCostProfile(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toBeNull()
  })

  it('returns profile data when a profile exists', async () => {
    vi.mocked(costProfileApi.get).mockResolvedValue({
      dieselRegion: 'MIDWEST', milesPerGallon: 6.5, additionalCostPerMile: 0.08,
      truckPaymentMonthly: 1200, insuranceMonthly: 600, permitsMonthly: 150,
      annualMiles: 120000, weeklyIncomeGoal: 2000, weeksWorkedPerYear: 48,
      fuelCpm: 0.6, variableCpm: 0.68, fixedCpm: 0.195, marginCpm: 0.8,
      breakevenRpm: 0.875, minRpm: 1.675, targetRpm: 2.01,
    })
    const { result } = renderHook(() => useCostProfile(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data?.minRpm).toBe(1.675)
  })
})
