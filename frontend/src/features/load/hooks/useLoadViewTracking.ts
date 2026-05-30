import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

export const useLoadViewCount = (loadId: string) => {
  return useQuery({
    queryKey: ['loadViewCount', loadId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/loads/${loadId}/view-count`);
      return data.viewCount;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!loadId,
  });
};

export const useLoadInterest = (loadId: string) => {
  return useQuery({
    queryKey: ['loadInterest', loadId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/loads/${loadId}/interest`);
      return data.interest;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!loadId,
  });
};

export const useRecordLoadView = () => {
  return useMutation({
    mutationFn: async ({ loadId, carrierId }: { loadId: string; carrierId: string }) => {
      await apiClient.post(`/loads/${loadId}/record-view`, null, {
        params: { carrierId },
      });
    },
  });
};
