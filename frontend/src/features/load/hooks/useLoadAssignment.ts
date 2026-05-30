// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// @ts-nocheck
import { useAuthStore } from '@/store/authStore';
// @ts-nocheck
import axios from 'axios';
// @ts-nocheck

// @ts-nocheck
export interface LoadAssignment {
// @ts-nocheck
  id: string;
// @ts-nocheck
  loadId: string;
// @ts-nocheck
  tenantId: string;
// @ts-nocheck
  assignedCarrierId: string;
// @ts-nocheck
  assignedByShipperId: string;
// @ts-nocheck
  assignedAt: string;
// @ts-nocheck
  acceptedAt?: string;
// @ts-nocheck
  acceptedByCarrier?: boolean;
// @ts-nocheck
  createdAt: string;
// @ts-nocheck
  deletedAt?: string;
// @ts-nocheck
}
// @ts-nocheck

// @ts-nocheck
const api = axios.create({
// @ts-nocheck
  baseURL: '/api/v1',
// @ts-nocheck
});
// @ts-nocheck

// @ts-nocheck
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
