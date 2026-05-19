import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/apiClient'

interface StatusCounts {
  open: number
  claimed: number
  inTransit: number
  delivered: number
}

interface LoadStatsData {
  active: StatusCounts | null
  all: StatusCounts | null
}

export function useLoadStats(view: 'active' | 'all' = 'active') {
  return useQuery({
    queryKey: ['shipper-loads-stats', view],
    queryFn: async () => {
      const data = await apiGet<LoadStatsData>(`/shipper/loads/stats?view=${view}`)
      return data
    },
    staleTime: 120000, // 2 minutes
    gcTime: 300000, // 5 minutes (formerly cacheTime)
  })
}
