import { apiGet, apiPost, apiPut } from '@/lib/apiClient';
import type { ShipperProfileDTO, ShipperProfileFormData, CompletenessResponse } from './schemas/shipper.schemas';

export const shipperApi = {
  getProfile: () =>
    apiGet<ShipperProfileDTO>('/profile/company-info').catch(() => ({} as ShipperProfileDTO)),

  saveProfile: (data: ShipperProfileFormData) =>
    apiPost<ShipperProfileDTO>('/profile/company-info', data).catch(() => ({} as ShipperProfileDTO)),

  updateProfile: (data: ShipperProfileFormData) =>
    apiPut<ShipperProfileDTO>('/profile/company-info', data).catch(() => ({} as ShipperProfileDTO)),

  getCompleteness: () =>
    apiGet<CompletenessResponse>('/profile/completeness').catch(() => ({ completenessPercent: 0, remainingFields: [] })),
};
