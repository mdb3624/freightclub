import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/apiClient'

export interface LoadItem {
  id: string
  originCity: string
  originState: string
  destinationCity: string
  destinationState: string
  pickupEarliest: string
  pickupLatest: string
  status: string
  payAmount: number
  payUnit: string
  claimedByTruckerName: string | null
  createdAt: string
}

export interface LoadBoardData {
  loads: LoadItem[]
  pagination: {
    page: number
    limit: number
    total: number
  }
}

export interface UseLoadBoardParams {
  page: number
  view: 'active' | 'all'
  sort: string
  order: 'asc' | 'desc'
  search?: string
}

export function useLoadBoard(params: UseLoadBoardParams) {
  return useQuery({
    queryKey: ['shipper-loads', params.page, params.view, params.sort, params.order, params.search],
    queryFn: async () => {
      const query = new URLSearchParams({
        page: String(params.page),
        limit: '20',
        view: params.view,
        sort: params.sort,
        order: params.order,
      })
      if (params.search) query.append('search', params.search)

      const data = await apiGet<LoadBoardData>(`/shipper/loads?${query.toString()}`)
      return data
    },
    staleTime: 120000, // 2 minutes
    gcTime: 300000, // 5 minutes (formerly cacheTime)
  })
}
