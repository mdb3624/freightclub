import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carrierApi } from '../api';
import type {
  EquipmentFormData,
  LaneFormData,
  AvailabilityFormData,
} from '../schemas/carrier.schemas';

// Equipment Queries
export function useEquipment(truckerId: string) {
  return useQuery({
    queryKey: ['equipment', truckerId],
    queryFn: () => carrierApi.equipment.list(truckerId),
    enabled: !!truckerId,
  });
}

export function useAddEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EquipmentFormData) => carrierApi.equipment.add(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EquipmentFormData }) =>
      carrierApi.equipment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (equipmentId: string) => carrierApi.equipment.remove(equipmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}

// Lane Queries
export function useLanes(truckerId: string) {
  return useQuery({
    queryKey: ['lanes', truckerId],
    queryFn: () => carrierApi.lanes.list(truckerId),
    enabled: !!truckerId,
  });
}

export function useAddLane() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LaneFormData) => carrierApi.lanes.add(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lanes'] });
    },
  });
}

export function useUpdateLane() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LaneFormData }) =>
      carrierApi.lanes.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lanes'] });
    },
  });
}

export function useDeleteLane() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (laneId: string) => carrierApi.lanes.remove(laneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lanes'] });
    },
  });
}

// Availability Queries
export function useAvailability(truckerId: string) {
  return useQuery({
    queryKey: ['availability', truckerId],
    queryFn: () => carrierApi.availability.get(truckerId),
    enabled: !!truckerId,
  });
}

export function useSetAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AvailabilityFormData) => carrierApi.availability.set(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

// Public Profile Query
export function usePublicCarrierProfile(truckerId: string) {
  return useQuery({
    queryKey: ['publicProfile', truckerId],
    queryFn: () => carrierApi.publicProfile(truckerId),
    enabled: !!truckerId,
  });
}
