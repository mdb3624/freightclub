import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';

export interface KPISummaryData {
  activeLoadCount: number;
  onTimePercentage: number | null;
  costPerMile: number | null;
  isEmpty: boolean;
}

export const useKPISummary = () => {
  return useQuery<KPISummaryData>({
    queryKey: ['kpiSummary'],
    queryFn: async () => {
      const response = await apiClient.get<KPISummaryData>(
        '/shipper/dashboard/kpi-summary'
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (AC-4: data freshness)
    retry: 1,
  });
};
