import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';

interface AdminAnalyticsResponse {
  totalPosted: number;
  totalClaimed: number;
  claimPercentage: number;
  avgClaimTimeHours: number;
}

interface ShipperAnalyticsResponse {
  postedCount: number;
  claimedCount: number;
  claimPercentage: number;
  avgClaimTimeHours: number;
}

export const useAdminAnalytics = (range: number = 7) => {
  return useQuery<AdminAnalyticsResponse>({
    queryKey: ['adminAnalytics', range],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/v1/admin/analytics/load-board`, {
        params: { range },
      });
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useShipperAnalytics = (shipperId: string, range: number = 7) => {
  return useQuery<ShipperAnalyticsResponse>({
    queryKey: ['shipperAnalytics', shipperId, range],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/api/v1/shippers/analytics/performance`,
        {
          params: { range, shipperId },
        }
      );
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};
