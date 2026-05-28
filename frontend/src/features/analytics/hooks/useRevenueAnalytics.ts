import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';

export interface RevenueSummary {
  totalRevenue: number;
  totalCommission: number;
  netRevenue: number;
  loadCount: number;
  avgRevenuePerLoad: number;
}

export interface LaneProfitability {
  origin: string;
  destination: string;
  loads: number;
  avgRate: number;
  avgRevenuePerLoad: number;
  commission: number;
  netMargin: number;
  marginPercentage: number;
  trend: number; // percentage change vs previous period
}

export interface CarrierProfitability {
  carrierId: string;
  carrierName: string;
  loadsAssigned: number;
  totalRevenue: number;
  avgRate: number;
  qualityRating: number;
  onTimeRate: number;
}

export const useRevenueSummary = (shipperId: string, days: number = 30) => {
  return useQuery<RevenueSummary>({
    queryKey: ['revenueSummary', shipperId, days],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/api/v1/shippers/${shipperId}/revenue-summary`,
        { params: { days } }
      );
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useLaneProfitability = (shipperId: string, days: number = 30) => {
  return useQuery<LaneProfitability[]>({
    queryKey: ['laneProfitability', shipperId, days],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/api/v1/shippers/${shipperId}/lane-profitability`,
        { params: { days } }
      );
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useCarrierProfitability = (shipperId: string, days: number = 30) => {
  return useQuery<CarrierProfitability[]>({
    queryKey: ['carrierProfitability', shipperId, days],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/api/v1/shippers/${shipperId}/carrier-profitability`,
        { params: { days } }
      );
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};
