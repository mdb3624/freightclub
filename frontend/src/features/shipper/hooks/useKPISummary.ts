import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/apiClient';

export interface KPISummaryData {
  activeLoadCount: number;
  onTimePercentage: number | null;
  costPerMile: number | null;
  isEmpty: boolean;
  // Optional breakdown fields — populated by backend when available
  delayedCount?: number | null;
  inTransitCount?: number | null;
  claimedCount?: number | null;
  costTrend?: number | null; // positive = rising $/mile delta vs prior period
  deliveryCount?: number | null;
}

export const useKPISummary = () => {
  return useQuery<KPISummaryData>({
    queryKey: ['kpiSummary'],
    queryFn: () => apiGet<KPISummaryData>('/shipper/dashboard/kpi-summary'),
    staleTime: 5 * 60 * 1000, // 5 minutes (AC-4: data freshness)
    retry: 1,
  });
};
