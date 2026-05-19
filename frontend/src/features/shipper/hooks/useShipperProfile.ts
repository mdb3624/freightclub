import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/apiClient'
import type { ShipperProfileResponse } from '@/types'

export const useShipperProfile = () => {
  return useQuery({
    queryKey: ['shipper-profile'],
    queryFn: async () => {
      try {
        const response = await apiGet<ShipperProfileResponse>('/profile')
        return response
      } catch (error: unknown) {
        // Handle 404 (new shipper with no profile yet) as null data
        const err = error as { response?: { status: number } }
        if (err.response?.status === 404) {
          return null
        }
        throw error
      }
    },
    retry: 1,
  })
}
