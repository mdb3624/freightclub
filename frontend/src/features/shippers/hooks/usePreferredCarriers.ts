import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export interface ShipperPreferredCarrier {
  id: string
  carrierId: string
  carrierName: string
  carrierEmail?: string
  notes?: string
  createdAt: string
}

export interface PreferredCarriersListResponse {
  data: ShipperPreferredCarrier[]
  pagination: {
    page: number
    limit: number
    total: number
  }
}

// AC-707-2: Shipper can view preferred carriers list
export function usePreferredCarriers(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['preferredCarriers', page, limit],
    queryFn: async () => {
      const response = await axios.get<PreferredCarriersListResponse>(
        `/api/v1/shippers/preferred-carriers?page=${page}&limit=${limit}`
      )
      return response.data
    },
  })
}

// Get count only for dashboard badge
// AC-707-7: Preferred carrier count visible on dashboard
export function usePreferredCarriersCount() {
  return useQuery({
    queryKey: ['preferredCarriersCount'],
    queryFn: async () => {
      const response = await axios.get<{ count: number }>(
        '/api/v1/shippers/preferred-carriers/count'
      )
      return response.data.count
    },
  })
}

// AC-707-1: Shipper can add carrier to preferred list
export function useAddPreferredCarrier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { carrierId: string; notes?: string }) => {
      const response = await axios.post<ShipperPreferredCarrier>(
        '/api/v1/shippers/preferred-carriers',
        data
      )
      return response.data
    },
    onSuccess: () => {
      // AC-707-5: Invalidate cache on add
      queryClient.invalidateQueries({ queryKey: ['preferredCarriers'] })
      queryClient.invalidateQueries({ queryKey: ['preferredCarriersCount'] })
    },
  })
}

// AC-707-3: Shipper can remove carrier from preferred list
export function useRemovePreferredCarrier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (carrierId: string) => {
      await axios.delete(`/api/v1/shippers/preferred-carriers/${carrierId}`)
    },
    onSuccess: () => {
      // AC-707-5: Invalidate cache on remove
      queryClient.invalidateQueries({ queryKey: ['preferredCarriers'] })
      queryClient.invalidateQueries({ queryKey: ['preferredCarriersCount'] })
    },
  })
}
