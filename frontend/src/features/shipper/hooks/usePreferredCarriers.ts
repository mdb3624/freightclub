import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

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
      console.log('[usePreferredCarriers] Calling API for shipperId:', shipperId)
      const { data } = await apiClient.get(
        `/shippers/preferred-carriers`,
        { params: { page: page + 1, limit: 20 } }
      );
      return data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    enabled: !!shipperId,
  });
};

export const usePreferredCarrierCount = (shipperId: string) => {
  return useQuery({
    queryKey: ['preferredCarrierCount', shipperId],
    queryFn: async () => {
      const { data } = await apiClient.get<PreferredCarrierCountResponse>(
        `/shippers/preferred-carriers/count`
      );
      return data.count;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    enabled: !!shipperId,
  });
};

export const useAddPreferredCarrier = (shipperId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: { carrierId: string; notes?: string }) => {
      const { data } = await apiClient.post(
        `/shippers/preferred-carriers`,
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
        `/shippers/preferred-carriers/${carrierId}`
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
