import { apiGet } from '@/lib/apiClient'
import type { DieselPrices } from './types'

export const marketApi = {
  getDieselPrices: () => apiGet<DieselPrices>('/market/diesel-prices'),
}
