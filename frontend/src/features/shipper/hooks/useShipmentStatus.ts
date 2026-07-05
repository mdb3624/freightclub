import { useQuery } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import apiClient from '../../../lib/apiClient';

// US-822: Shipment Status Panel data structure
export interface ShipmentStatusDTO {
  loadId: string;
  status: string;
  progress: number;
  equipment: string;
  carrier: string | null;
  rating: number | null;
  destination: string;
  origin: string | null;
  originState: string | null;
  destinationState: string | null;
}

export function useShipmentStatus() {
  return useQuery({
    queryKey: ['shipmentStatus'],
    queryFn: () =>
      apiClient
        .get<ShipmentStatusDTO[]>('/shipper/shipments/active')
        .then((response: AxiosResponse<ShipmentStatusDTO[]>) => response.data),
    refetchInterval: 60_000, // 1-minute refresh per NFR-504
  });
}
