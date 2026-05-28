import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
});

export const useCarrierProfileViewCount = (carrierId: string) => {
  return useQuery({
    queryKey: ['carrierProfileViewCount', carrierId],
    queryFn: async () => {
      const { data } = await api.get(`/carriers/${carrierId}/profile-view-count`);
      return data.viewCount;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!carrierId,
  });
};

export const useCarrierInterestCount = (carrierId: string) => {
  return useQuery({
    queryKey: ['carrierInterest', carrierId],
    queryFn: async () => {
      const { data } = await api.get(`/carriers/${carrierId}/interest`);
      return data.interest;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!carrierId,
  });
};

export const useRecordProfileView = () => {
  return useMutation({
    mutationFn: async ({ carrierId, shipperId }: { carrierId: string; shipperId: string }) => {
      await api.post(`/carriers/${carrierId}/record-profile-view`, null, {
        params: { shipperId },
      });
    },
  });
};
