import { useMutation, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '../api'
import type { UpdateProfileValues } from '../types'

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileValues) =>
      profileApi.update({
        ...data,
        equipmentType: data.equipmentType || undefined,
        monthlyFixedCosts:       data.monthlyFixedCosts       === '' ? null : data.monthlyFixedCosts,
        fuelCostPerGallon:       data.fuelCostPerGallon       === '' ? null : data.fuelCostPerGallon,
        milesPerGallon:          data.milesPerGallon          === '' ? null : data.milesPerGallon,
        maintenanceCostPerMile:  data.maintenanceCostPerMile  === '' ? null : data.maintenanceCostPerMile,
        monthlyMilesTarget:      data.monthlyMilesTarget      === '' ? null : data.monthlyMilesTarget,
        targetMarginPerMile:     data.targetMarginPerMile     === '' ? null : data.targetMarginPerMile,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
