import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/apiClient';

export interface KPISummaryData {
  activeLoadCount: number;
  onTimePercentage: number | null;
  costPerMile: number | null;
  isEmpty: boolean;
}

export const useKPISummary = () => {
  return useQuery<KPISummaryData>({
    queryKey: ['kpiSummary'],
    queryFn: () => apiGet<KPISummaryData>('/shipper/dashboard/kpi-summary'),
    staleTime: 5 * 60 * 1000, // 5 minutes (AC-4: data freshness)
    retry: 1,
  });
};
