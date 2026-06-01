import { useMutation } from '@tanstack/react-query'
import { profileApi } from '../api'
import { __clearCache } from './useProfile'
import type { UpdateProfileValues } from '../types'

// Helper to convert empty strings to null, handle both string and number inputs
const normalizeNumber = (value: unknown): number | null => {
  if (value === '' || value === undefined || value === null) return null
  const num = Number(value)
  return isNaN(num) ? null : num
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: UpdateProfileValues) => {
      // Optimistic: store the new values in localStorage to show immediately
      localStorage.setItem('freightclub_profile_optimistic', JSON.stringify(data))

      return profileApi.update({
        ...data,
        equipmentType: data.equipmentType || undefined,
        // Convert all cost fields: empty string → null, string number → number, invalid → null
        truckPaymentLease:       normalizeNumber(data.truckPaymentLease),
        insurance:               normalizeNumber(data.insurance),
        iftaIrpPermits:          normalizeNumber(data.iftaIrpPermits),
        phoneEldMisc:            normalizeNumber(data.phoneEldMisc),
        perDiemDailyRate:        normalizeNumber(data.perDiemDailyRate),
        perDiemDaysPerMonth:     normalizeNumber(data.perDiemDaysPerMonth),
        fuelCostPerGallon:       normalizeNumber(data.fuelCostPerGallon),
        milesPerGallon:          normalizeNumber(data.milesPerGallon),
        maintenanceCostPerMile:  normalizeNumber(data.maintenanceCostPerMile),
        monthlyMilesTarget:      normalizeNumber(data.monthlyMilesTarget),
        targetMarginPerMile:     normalizeNumber(data.targetMarginPerMile),
      })
    },
    onSuccess: () => {
      // Clear cache on success so next fetch gets fresh server data
      __clearCache()
      localStorage.removeItem('freightclub_profile_optimistic')
    },
    onError: () => {
      // On error, clear the optimistic update
      localStorage.removeItem('freightclub_profile_optimistic')
    },
  })
}
