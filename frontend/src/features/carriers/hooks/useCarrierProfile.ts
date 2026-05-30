import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export interface CarrierEquipmentDTO {
  id: string
  equipmentType: string
}

export interface CarrierLaneDTO {
  id: string
  originRegion: string
  destinationRegion: string
}

export interface CarrierAvailabilityDTO {
  carrierId: string
  isActive: boolean
}

export interface PublicCarrierProfileDTO {
  truckerId: string
  equipment: CarrierEquipmentDTO[]
  lanes: CarrierLaneDTO[]
  availability: CarrierAvailabilityDTO
}

export function useCarrierProfile(carrierId: string) {
  return useQuery({
    queryKey: ['carrierProfile', carrierId],
    queryFn: async () => {
      const response = await axios.get<PublicCarrierProfileDTO>(
        `/api/v1/carriers/${carrierId}/public-profile`
      )
      return response.data
    },
    enabled: !!carrierId,
  })
}
