import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';

export interface CarrierPerformanceData {
  carrierId: string;
  acceptanceRate: number;
  onTimeRate: number;
  avgDeliveryTimeHours: number;
  loadsCompleted: number;
  qualityScore: number;
  ratingCount: number;
  preferredByCount: number;
}

export interface CarrierBenchmarks {
  avgAcceptanceRate: number;
  avgOnTimeRate: number;
  avgQualityScore: number;
}

export const useCarrierPerformance = (carrierId: string) => {
  return useQuery<CarrierPerformanceData>({
    queryKey: ['carrierPerformance', carrierId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/api/v1/carriers/${carrierId}/performance`
      );
      return data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useCarrierBenchmarks = () => {
  return useQuery<CarrierBenchmarks>({
    queryKey: ['carrierBenchmarks'],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/api/v1/analytics/carrier-benchmarks`
      );
      return data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useTopCarriers = () => {
  return useQuery<CarrierPerformanceData[]>({
    queryKey: ['topCarriers'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/v1/analytics/top-carriers`);
      return data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};
