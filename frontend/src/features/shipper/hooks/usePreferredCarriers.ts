import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';

export interface PreferredCarrier {
  id: string;
  carrierId: string;
  notes?: string;
  createdAt: string;
}

export interface PreferredCarrierCountResponse {
  count: number;
}

export const usePreferredCarriers = (shipperId: string, page: number = 0) => {
  return useQuery({
    queryKey: ['preferredCarriers', shipperId, page],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/api/v1/shippers/${shipperId}/preferred-carriers`,
        { params: { page } }
      );
      return data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const usePreferredCarrierCount = (shipperId: string) => {
  return useQuery({
    queryKey: ['preferredCarrierCount', shipperId],
    queryFn: async () => {
      const { data } = await apiClient.get<PreferredCarrierCountResponse>(
        `/api/v1/shippers/${shipperId}/preferred-carriers/count`
      );
      return data.count;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useAddPreferredCarrier = (shipperId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: { carrierId: string; notes?: string }) => {
      const { data } = await apiClient.post(
        `/api/v1/shippers/${shipperId}/preferred-carriers`,
        null,
        { params: { carrierId: variables.carrierId, notes: variables.notes } }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['preferredCarriers', shipperId],
      });
      queryClient.invalidateQueries({
        queryKey: ['preferredCarrierCount', shipperId],
      });
    },
  });
};

export const useRemovePreferredCarrier = (shipperId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (carrierId: string) => {
      await apiClient.delete(
        `/api/v1/shippers/${shipperId}/preferred-carriers/${carrierId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['preferredCarriers', shipperId],
      });
      queryClient.invalidateQueries({
        queryKey: ['preferredCarrierCount', shipperId],
      });
    },
  });
};
