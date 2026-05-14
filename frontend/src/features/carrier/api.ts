import apiClient from '@/lib/apiClient'
import { apiGet, apiPost, apiPut } from '@/lib/apiClient'
import type {
  CarrierEquipmentDTO,
  CarrierLaneDTO,
  CarrierAvailabilityDTO,
  EquipmentFormData,
  LaneFormData,
  AvailabilityFormData,
  PublicCarrierProfileDTO,
} from './schemas/carrier.schemas'

export const carrierApi = {
  equipment: {
    list: (truckerId: string) =>
      apiGet<CarrierEquipmentDTO[]>('/profile/equipment', { params: { truckerId } }),
    add: (data: EquipmentFormData) =>
      apiPost<CarrierEquipmentDTO>('/profile/equipment', data),
    update: (id: string, data: EquipmentFormData) =>
      apiPut<CarrierEquipmentDTO>(`/profile/equipment/${id}`, data),
    remove: (id: string) =>
      apiClient.delete(`/profile/equipment/${id}`),
  },
  lanes: {
    list: (truckerId: string) =>
      apiGet<CarrierLaneDTO[]>('/profile/lanes', { params: { truckerId } }),
    add: (data: LaneFormData) =>
      apiPost<CarrierLaneDTO>('/profile/lanes', data),
    update: (id: string, data: LaneFormData) =>
      apiPut<CarrierLaneDTO>(`/profile/lanes/${id}`, data),
    remove: (id: string) =>
      apiClient.delete(`/profile/lanes/${id}`),
  },
  availability: {
    get: (truckerId: string) =>
      apiGet<CarrierAvailabilityDTO | null>('/profile/availability', { params: { truckerId } }),
    set: (data: AvailabilityFormData) =>
      apiPut<CarrierAvailabilityDTO>('/profile/availability', data),
  },
  publicProfile: (truckerId: string) =>
    apiGet<PublicCarrierProfileDTO>(`/trucker/${truckerId}/public-profile`),
}
