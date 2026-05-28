import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';

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

const api = axios.create({
  baseURL: '/api/v1',
});

export const useAssignedLoads = (carrierId: string, page: number = 0) => {
  return useQuery({
    queryKey: ['assignedLoads', carrierId, page],
    queryFn: async () => {
      const { data } = await api.get(`/carriers/${carrierId}/assigned-loads`, {
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
      const { data } = await api.get(`/loads/${loadId}/assignment`);
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
      const { data } = await api.post(`/loads/${loadId}/assign-to-carrier`, null, {
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
      const { data } = await api.put(`/loads/${loadId}/assign-to-carrier`, null, {
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
      await api.delete(`/loads/${loadId}/assignment`);
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
      await api.post(`/loads/${loadId}/assignment/accept`, null, {
        params: { carrierId },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assignedLoads'] });
      queryClient.invalidateQueries({ queryKey: ['loadAssignment', variables.loadId] });
    },
  });
};
