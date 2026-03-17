import apiClient from '@/lib/apiClient'
import type { Load, LoadSummary, LoadFormValues, Page } from './types'

function sanitize(data: LoadFormValues) {
  return {
    ...data,
    paymentTerms: data.paymentTerms === '' ? undefined : data.paymentTerms,
  }
}

export const loadsApi = {
  create: (data: LoadFormValues) =>
    apiClient.post<Load>('/loads', sanitize(data)).then((r) => r.data),

  list: (page = 0, size = 20) =>
    apiClient.get<Page<LoadSummary>>('/loads', { params: { page, size } }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Load>(`/loads/${id}`).then((r) => r.data),

  update: (id: string, data: LoadFormValues) =>
    apiClient.put<Load>(`/loads/${id}`, sanitize(data)).then((r) => r.data),

  cancel: (id: string) =>
    apiClient.patch<Load>(`/loads/${id}/cancel`).then((r) => r.data),

  claim: (id: string) =>
    apiClient.post<Load>(`/loads/${id}/claim`).then((r) => r.data),

  listOpen: (page = 0, size = 20) =>
    apiClient.get<Page<LoadSummary>>('/board', { params: { page, size } }).then((r) => r.data),

  getBoardLoad: (id: string) =>
    apiClient.get<Load>(`/board/${id}`).then((r) => r.data),

  getMyActiveLoad: () =>
    apiClient.get<Load>('/board/my-load').then((r) => r.data || null),

  getMyLoadHistory: (page = 0, size = 20) =>
    apiClient.get<Page<LoadSummary>>('/board/my-history', { params: { page, size } }).then((r) => r.data),

  pickup: (id: string) =>
    apiClient.post<Load>(`/board/${id}/pickup`).then((r) => r.data),

  deliver: (id: string) =>
    apiClient.post<Load>(`/board/${id}/deliver`).then((r) => r.data),
}
