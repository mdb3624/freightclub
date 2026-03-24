import apiClient from '@/lib/apiClient'
import type { Rating, RatingSummary, ShipperPublicProfile, Page } from './types'

export const ratingsApi = {
  rateTrucker: (loadId: string, stars: number, comment?: string) =>
    apiClient
      .post<Rating>(`/ratings/${loadId}/trucker`, { stars, comment })
      .then((r) => r.data),

  rateShipper: (loadId: string, stars: number, comment?: string) =>
    apiClient
      .post<Rating>(`/ratings/${loadId}/shipper`, { stars, comment })
      .then((r) => r.data),

  getMyRating: (loadId: string) =>
    apiClient
      .get<Rating>(`/ratings/${loadId}/mine`)
      .then((r) => (r.status === 204 ? null : r.data))
      .catch(() => null),

  getMyReceived: (page = 0, size = 20) =>
    apiClient
      .get<Page<Rating>>('/ratings/my-received', { params: { page, size } })
      .then((r) => r.data),

  getMySummary: () =>
    apiClient.get<RatingSummary>('/ratings/my-summary').then((r) => r.data),

  getTruckerSummary: (userId: string) =>
    apiClient.get<RatingSummary>(`/ratings/trucker/${userId}/summary`).then((r) => r.data),

  getShipperProfile: (userId: string) =>
    apiClient.get<ShipperPublicProfile>(`/ratings/shipper/${userId}/profile`).then((r) => r.data),
}
