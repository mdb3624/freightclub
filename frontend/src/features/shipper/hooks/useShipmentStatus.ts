/**
 * US-823: Mock hook for Shipment Status section
 * Returns loading state → simulates real API call
 * Enables testing of skeleton → content transition (jitter prevention)
 */

export interface ShipmentStatusData {
  id: string;
  loadId: string;
  status: 'pending' | 'in-transit' | 'delivered';
  pickupDate: string;
  deliveryDate: string;
}

export function useShipmentStatus(userId?: string) {
  // TODO: Replace with actual API call after US-824 implementation
  return {
    data: null as ShipmentStatusData[] | null,
    isLoading: true,
    error: null as Error | null,
  };
}
