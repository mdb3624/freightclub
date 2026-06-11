import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/apiClient'

interface SummaryMetric {
  value: number
  unit?: string
  label: string
}

export interface DashboardSummaryData {
  activeShipments: SummaryMetric
  estimatedCostPerMile: SummaryMetric
  onTimeCarrierPct: SummaryMetric
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['shipper-dashboard-summary'],
    queryFn: async () => apiGet<DashboardSummaryData>('/shipper/dashboard-summary'),
    staleTime: 120000,
    gcTime: 300000,
  })
}
