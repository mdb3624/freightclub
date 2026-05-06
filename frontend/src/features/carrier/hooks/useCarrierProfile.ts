import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  CarrierEquipmentDTO,
  CarrierLaneDTO,
  CarrierAvailabilityDTO,
  EquipmentFormData,
  LaneFormData,
  AvailabilityFormData,
  PublicCarrierProfileDTO,
} from '../schemas/carrier.schemas';

const API_BASE = '/api/v1/profile';

// Equipment Queries
export function useEquipment(truckerId: string) {
  return useQuery({
    queryKey: ['equipment', truckerId],
    queryFn: async () => {
      const response = await axios.get<CarrierEquipmentDTO[]>(`${API_BASE}/equipment`, {
        params: { truckerId },
      });
      return response.data;
    },
    enabled: !!truckerId,
  });
}

export function useAddEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: EquipmentFormData) => {
      const response = await axios.post<CarrierEquipmentDTO>(`${API_BASE}/equipment`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EquipmentFormData }) => {
      const response = await axios.put<CarrierEquipmentDTO>(
        `${API_BASE}/equipment/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (equipmentId: string) => {
      await axios.delete(`${API_BASE}/equipment/${equipmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}

// Lane Queries
export function useLanes(truckerId: string) {
  return useQuery({
    queryKey: ['lanes', truckerId],
    queryFn: async () => {
      const response = await axios.get<CarrierLaneDTO[]>(`${API_BASE}/lanes`, {
        params: { truckerId },
      });
      return response.data;
    },
    enabled: !!truckerId,
  });
}

export function useAddLane() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: LaneFormData) => {
      const response = await axios.post<CarrierLaneDTO>(`${API_BASE}/lanes`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lanes'] });
    },
  });
}

export function useUpdateLane() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: LaneFormData }) => {
      const response = await axios.put<CarrierLaneDTO>(`${API_BASE}/lanes/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lanes'] });
    },
  });
}

export function useDeleteLane() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (laneId: string) => {
      await axios.delete(`${API_BASE}/lanes/${laneId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lanes'] });
    },
  });
}

// Availability Queries
export function useAvailability(truckerId: string) {
  return useQuery({
    queryKey: ['availability', truckerId],
    queryFn: async () => {
      const response = await axios.get<CarrierAvailabilityDTO | null>(
        `${API_BASE}/availability`,
        {
          params: { truckerId },
        }
      );
      return response.data;
    },
    enabled: !!truckerId,
  });
}

export function useSetAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AvailabilityFormData) => {
      const response = await axios.put<CarrierAvailabilityDTO>(
        `${API_BASE}/availability`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

// Public Profile Query
export function usePublicCarrierProfile(truckerId: string) {
  return useQuery({
    queryKey: ['publicProfile', truckerId],
    queryFn: async () => {
      const response = await axios.get<PublicCarrierProfileDTO>(
        `/api/v1/trucker/${truckerId}/public-profile`
      );
      return response.data;
    },
    enabled: !!truckerId,
  });
}
