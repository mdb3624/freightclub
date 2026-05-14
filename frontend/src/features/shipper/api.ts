import { apiGet, apiPost, apiPut } from '@/lib/apiClient';
import type { ShipperProfileDTO, ShipperProfileFormData, CompletenessResponse } from './schemas/shipper.schemas';

export const shipperApi = {
  getProfile: () =>
    apiGet<ShipperProfileDTO>('/profile/company-info'),

  saveProfile: (data: ShipperProfileFormData) =>
    apiPost<ShipperProfileDTO>('/profile/company-info', data),

  updateProfile: (data: ShipperProfileFormData) =>
    apiPut<ShipperProfileDTO>('/profile/company-info', data),

  getCompleteness: () =>
    apiGet<CompletenessResponse>('/profile/completeness'),
};
