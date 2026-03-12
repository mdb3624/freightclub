import apiClient from '@/lib/apiClient'
import type { Load, LoadSummary, LoadFormValues, Page } from './types'

export const loadsApi = {
  create: (data: LoadFormValues) =>
    apiClient.post<Load>('/loads', data).then((r) => r.data),

  list: (page = 0, size = 20) =>
    apiClient.get<Page<LoadSummary>>('/loads', { params: { page, size } }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Load>(`/loads/${id}`).then((r) => r.data),

  update: (id: string, data: LoadFormValues) =>
    apiClient.put<Load>(`/loads/${id}`, data).then((r) => r.data),

  cancel: (id: string) =>
    apiClient.patch<Load>(`/loads/${id}/cancel`).then((r) => r.data),
}
