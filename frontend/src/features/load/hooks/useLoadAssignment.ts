import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

export interface LoadAssignment {
  id: string;
  loadId: string;
  tenantId: string;
  assignedCarrierId: string;
  assignedByShipperId: string;
  assignedAt: string;
  acceptedAt?: string;
  acceptedByCarrier?: boolean;
  createdAt: string;
  deletedAt?: string;
}

export const useAssignedLoads = (carrierId: string, page: number = 0) => {
  return useQuery({
    queryKey: ['assignedLoads', carrierId, page],
    queryFn: async () => {
      const { data } = await apiClient.get(`/carriers/${carrierId}/assigned-loads`, {
        params: { page },
      });
      return data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!carrierId,
  });
};

export const useLoadAssignmentByLoadId = (loadId: string) => {
  return useQuery({
    queryKey: ['loadAssignment', loadId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/loads/${loadId}/assignment`);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!loadId,
  });
};

export const useAssignLoadToCarrier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      loadId,
      carrierId,
      shipperId,
    }: {
      loadId: string;
      carrierId: string;
      shipperId: string;
    }) => {
      const { data } = await apiClient.post(`/loads/${loadId}/assign-to-carrier`, null, {
        params: { carrierId, shipperId },
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assignedLoads'] });
      queryClient.invalidateQueries({ queryKey: ['loadAssignment', variables.loadId] });
    },
  });
};

export const useReassignLoadToCarrier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      loadId,
      newCarrierId,
      shipperId,
    }: {
      loadId: string;
      newCarrierId: string;
      shipperId: string;
    }) => {
      const { data } = await apiClient.put(`/loads/${loadId}/assign-to-carrier`, null, {
        params: { newCarrierId, shipperId },
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assignedLoads'] });
      queryClient.invalidateQueries({ queryKey: ['loadAssignment', variables.loadId] });
    },
  });
};

export const useRevokeAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loadId: string) => {
      await apiClient.delete(`/loads/${loadId}/assignment`);
    },
    onSuccess: (_, loadId) => {
      queryClient.invalidateQueries({ queryKey: ['assignedLoads'] });
      queryClient.invalidateQueries({ queryKey: ['loadAssignment', loadId] });
    },
  });
};

export const useAcceptAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loadId, carrierId }: { loadId: string; carrierId: string }) => {
      await apiClient.post(`/loads/${loadId}/assignment/accept`, null, {
        params: { carrierId },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assignedLoads'] });
      queryClient.invalidateQueries({ queryKey: ['loadAssignment', variables.loadId] });
    },
  });
};
