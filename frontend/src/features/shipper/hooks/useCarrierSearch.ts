import { useMutation } from '@tanstack/react-query'
import { apiGet } from '@/lib/apiClient'

export interface CarrierSearchParams {
  origin: string
  destination: string
  equipmentType?: string
}

export interface CarrierSearchResult {
  id: string
  companyName: string
  email: string
  equipmentTypes: string[]
  onTimePct?: number
}

export function useCarrierSearch() {
  return useMutation({
    mutationFn: (params: CarrierSearchParams) => {
      const query = new URLSearchParams({ origin: params.origin, destination: params.destination })
      if (params.equipmentType) query.append('equipmentType', params.equipmentType)
      return apiGet<CarrierSearchResult[]>(`/carriers/search?${query.toString()}`)
    },
  })
}
