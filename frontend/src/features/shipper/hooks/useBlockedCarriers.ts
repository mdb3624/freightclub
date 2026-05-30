import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

export interface BlockedCarrier {
  id: string;
  shipperId: string;
  carrierId: string;
  tenantId: string;
  reason?: string;
  createdAt: string;
  deletedAt?: string;
}

export const useBlockedCarriers = (shipperId: string, page: number = 0) => {
  return useQuery({
    queryKey: ['blockedCarriers', shipperId, page],
    queryFn: async () => {
      const { data } = await apiClient.get(`/shippers/${shipperId}/blocked-carriers`, {
        params: { page },
      });
      return data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!shipperId,
  });
};

export const useBlockedCarrierCount = (shipperId: string) => {
  return useQuery({
    queryKey: ['blockedCarrierCount', shipperId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/shippers/${shipperId}/blocked-carriers/count`);
      return data.count;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!shipperId,
  });
};

export const useIsCarrierBlocked = (shipperId: string, carrierId: string) => {
  return useQuery({
    queryKey: ['carrierBlocked', shipperId, carrierId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/shippers/${shipperId}/blocked-carriers/check`, {
        params: { carrierId },
      });
      return data.blocked;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!shipperId && !!carrierId,
  });
};

export const useBlockCarrier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      shipperId,
      carrierId,
      reason,
    }: {
      shipperId: string;
      carrierId: string;
      reason?: string;
    }) => {
      const { data } = await apiClient.post(
        `/shippers/${shipperId}/blocked-carriers`,
        null,
        {
          params: { carrierId, reason },
        }
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blockedCarriers', variables.shipperId] });
      queryClient.invalidateQueries({ queryKey: ['blockedCarrierCount', variables.shipperId] });
      queryClient.invalidateQueries({
        queryKey: ['carrierBlocked', variables.shipperId, variables.carrierId],
      });
    },
  });
};

export const useUnblockCarrier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ shipperId, carrierId }: { shipperId: string; carrierId: string }) => {
      await apiClient.delete(`/shippers/${shipperId}/blocked-carriers/${carrierId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blockedCarriers', variables.shipperId] });
      queryClient.invalidateQueries({ queryKey: ['blockedCarrierCount', variables.shipperId] });
      queryClient.invalidateQueries({
        queryKey: ['carrierBlocked', variables.shipperId, variables.carrierId],
      });
    },
  });
};
