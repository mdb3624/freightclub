import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
});

export const useLoadViewCount = (loadId: string) => {
  return useQuery({
    queryKey: ['loadViewCount', loadId],
    queryFn: async () => {
      const { data } = await api.get(`/loads/${loadId}/view-count`);
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
      const { data } = await api.get(`/loads/${loadId}/interest`);
      return data.interest;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!loadId,
  });
};

export const useRecordLoadView = () => {
  return useMutation({
    mutationFn: async ({ loadId, carrierId }: { loadId: string; carrierId: string }) => {
      await api.post(`/loads/${loadId}/record-view`, null, {
        params: { carrierId },
      });
    },
  });
};
