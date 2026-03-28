import apiClient from '@/lib/apiClient'
import { apiGet, apiPost } from '@/lib/apiClient'
import type { Rating, RatingSummary, ShipperPublicProfile, Page } from './types'

export const ratingsApi = {
  rateTrucker: (loadId: string, stars: number, comment?: string) =>
    apiPost<Rating>(`/ratings/${loadId}/trucker`, { stars, comment }),

  rateShipper: (loadId: string, stars: number, comment?: string) =>
    apiPost<Rating>(`/ratings/${loadId}/shipper`, { stars, comment }),

  getMyRating: (loadId: string) =>
    apiClient
      .get<Rating>(`/ratings/${loadId}/mine`)
      .then((r) => (r.status === 204 ? null : r.data))
      .catch(() => null),

  getMyReceived: (page = 0, size = 20) =>
    apiGet<Page<Rating>>('/ratings/my-received', { params: { page, size } }),

  getMySummary: () => apiGet<RatingSummary>('/ratings/my-summary'),

  getTruckerSummary: (userId: string) =>
    apiGet<RatingSummary>(`/ratings/trucker/${userId}/summary`),

  getShipperProfile: (userId: string) =>
    apiGet<ShipperPublicProfile>(`/ratings/shipper/${userId}/profile`),
}
