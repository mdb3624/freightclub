/**
 * Carrier type definitions for US-825 Carrier Search Panel
 */

export interface Carrier {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number; // 0-5 scale
  equipmentTypes: string[]; // ["Dry Van", "Flatbed", "Refrigerated"]
}

export interface CarrierSearchParams {
  origin: string; // City, State, or Zip
  destination: string; // City, State, or Zip
  equipment?: string; // Optional: equipment type filter
}

export interface CarrierSearchResult {
  carriers: Carrier[];
  count: number;
}

export interface CarrierSearchState {
  status: 'idle' | 'loading' | 'success' | 'error' | 'no-results';
  data: Carrier[];
  error: Error | null;
}
