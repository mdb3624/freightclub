import apiClient from '@/lib/apiClient'
import { apiGet, apiPost, apiPut, apiPatch } from '@/lib/apiClient'
import type { AvailableStates, BoardFilter, Load, LoadSummary, LoadFormValues, Page } from './types'

function toDecimalFt(ft: number | '', inches: number | ''): number | null {
  if (ft === '' && inches === '') return null
  return (ft === '' ? 0 : ft) + (inches === '' ? 0 : inches) / 12
}

function sanitize(data: LoadFormValues) {
  const { lengthFt, lengthIn, widthFt, widthIn, heightFt, heightIn, ...rest } = data
  return {
    ...rest,
    paymentTerms: data.paymentTerms === '' ? undefined : data.paymentTerms,
    lengthFt: toDecimalFt(lengthFt, lengthIn),
    widthFt: toDecimalFt(widthFt, widthIn),
    heightFt: toDecimalFt(heightFt, heightIn),
  }
}

export const loadsApi = {
  create: (data: LoadFormValues) =>
    apiPost<Load>('/loads', sanitize(data)),

  createDraft: (data: LoadFormValues) =>
    apiPost<Load>('/loads/draft', sanitize(data)),

  publish: (id: string) =>
    apiPost<Load>(`/loads/${id}/publish`),

  list: (page = 0, size = 20) =>
    apiGet<Page<LoadSummary>>('/loads', { params: { page, size } }),

  getById: (id: string) =>
    apiGet<Load>(`/loads/${id}`),

  update: (id: string, data: LoadFormValues) =>
    apiPut<Load>(`/loads/${id}`, sanitize(data)),

  cancel: (id: string) =>
    apiPatch<Load>(`/loads/${id}/cancel`),

  claim: (id: string) =>
    apiPost<Load>(`/loads/${id}/claim`),

  listOpen: (page = 0, size = 20, filter: BoardFilter = {}) => {
    const params: Record<string, unknown> = { page, size }
    if (filter.originState) params.originState = filter.originState
    if (filter.destinationState) params.destinationState = filter.destinationState
    if (filter.equipmentType) params.equipmentType = filter.equipmentType
    if (filter.pickupDate) params.pickupDate = filter.pickupDate
    if (filter.deliveryDate) params.deliveryDate = filter.deliveryDate
    if (filter.sortBy && filter.sortBy !== 'rpm') params.sortBy = filter.sortBy
    if (filter.sortDir) params.sortDir = filter.sortDir
    return apiGet<Page<LoadSummary>>('/board', { params })
  },

  getBoardLoad: (id: string) =>
    apiGet<Load>(`/board/${id}`),

  getMyActiveLoad: () =>
    apiClient.get<Load>('/board/my-load').then((r) => r.data || null),

  getMyLoadHistory: (page = 0, size = 20) =>
    apiGet<Page<LoadSummary>>('/board/my-history', { params: { page, size } }),

  pickup: (id: string) =>
    apiPost<Load>(`/board/${id}/pickup`),

  deliver: (id: string) =>
    apiPost<Load>(`/board/${id}/deliver`),

  getAvailableStates: () =>
    apiGet<AvailableStates>('/board/available-states'),
}
