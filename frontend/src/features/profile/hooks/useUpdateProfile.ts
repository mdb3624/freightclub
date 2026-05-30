import { useMutation } from '@tanstack/react-query'
import { profileApi } from '../api'
import { __clearCache } from './useProfile'
import type { UpdateProfileValues } from '../types'

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: UpdateProfileValues) => {
      // Optimistic: store the new values in localStorage to show immediately
      localStorage.setItem('freightclub_profile_optimistic', JSON.stringify(data))

      return profileApi.update({
        ...data,
        equipmentType: data.equipmentType || undefined,
        truckPaymentLease:       (data.truckPaymentLease === '' || data.truckPaymentLease === undefined) ? null : data.truckPaymentLease,
        insurance:               (data.insurance === '' || data.insurance === undefined) ? null : data.insurance,
        iftaIrpPermits:          (data.iftaIrpPermits === '' || data.iftaIrpPermits === undefined) ? null : data.iftaIrpPermits,
        phoneEldMisc:            (data.phoneEldMisc === '' || data.phoneEldMisc === undefined) ? null : data.phoneEldMisc,
        perDiemDailyRate:        (data.perDiemDailyRate === '' || data.perDiemDailyRate === undefined) ? null : data.perDiemDailyRate,
        perDiemDaysPerMonth:     (data.perDiemDaysPerMonth === '' || data.perDiemDaysPerMonth === undefined) ? null : data.perDiemDaysPerMonth,
        fuelCostPerGallon:       (data.fuelCostPerGallon === '' || data.fuelCostPerGallon === undefined) ? null : data.fuelCostPerGallon,
        milesPerGallon:          (data.milesPerGallon === '' || data.milesPerGallon === undefined) ? null : data.milesPerGallon,
        maintenanceCostPerMile:  (data.maintenanceCostPerMile === '' || data.maintenanceCostPerMile === undefined) ? null : data.maintenanceCostPerMile,
        monthlyMilesTarget:      (data.monthlyMilesTarget === '' || data.monthlyMilesTarget === undefined) ? null : data.monthlyMilesTarget,
        targetMarginPerMile:     (data.targetMarginPerMile === '' || data.targetMarginPerMile === undefined) ? null : data.targetMarginPerMile,
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
