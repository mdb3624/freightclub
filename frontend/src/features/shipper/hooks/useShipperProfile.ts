import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shipperApi } from '../api';
import type { ShipperProfileFormData } from '../schemas/shipper.schemas';

export function useShipperProfile() {
  return useQuery({
    queryKey: ['shipperProfile'],
    queryFn: () => shipperApi.getProfile(),
  });
}

export function useSaveShipperProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ShipperProfileFormData) => shipperApi.saveProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipperProfile'] });
      queryClient.invalidateQueries({ queryKey: ['profileCompleteness'] });
    },
  });
}

export function useUpdateShipperProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ShipperProfileFormData) => shipperApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipperProfile'] });
      queryClient.invalidateQueries({ queryKey: ['profileCompleteness'] });
    },
  });
}

export function useProfileCompleteness() {
  return useQuery({
    queryKey: ['profileCompleteness'],
    queryFn: () => shipperApi.getCompleteness(),
  });
}
