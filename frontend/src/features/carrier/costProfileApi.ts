import { apiGet, apiPut } from '@/lib/apiClient'
import type { CostProfileResponseDTO, CostProfileWizardFormData } from './schemas/costProfile.schemas'

export const costProfileApi = {
  get: () => apiGet<CostProfileResponseDTO | null>('/carrier/cost-profile'),
  save: (data: CostProfileWizardFormData) =>
    apiPut<CostProfileResponseDTO>('/carrier/cost-profile', data),
}
