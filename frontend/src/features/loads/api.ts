import apiClient from '@/lib/apiClient'
import { apiGet, apiPost, apiPut, apiPatch } from '@/lib/apiClient'
import type { BoardFilter, Load, LoadEvent, LoadSummary, LoadFormValues, Page } from './types'

function toDecimalFt(ft: number | '', inches: number | ''): number | null {
  if (ft === '' && inches === '') return null
  return (ft === '' ? 0 : ft) + (inches === '' ? 0 : inches) / 12
}

// datetime-local inputs produce "2026-05-08T09:00" (no seconds).
// Jackson's LocalDateTime deserializer requires seconds: "2026-05-08T09:00:00".
function normalizeDateTime(dt: string): string {
  return /T\d{2}:\d{2}$/.test(dt) ? dt + ':00' : dt
}

function sanitize(data: LoadFormValues) {
  const { lengthFt, lengthIn, widthFt, widthIn, heightFt, heightIn, ...rest } = data
  return {
    ...rest,
    paymentTerms: data.paymentTerms === '' ? undefined : data.paymentTerms,
    lengthFt: toDecimalFt(lengthFt, lengthIn),
    widthFt: toDecimalFt(widthFt, widthIn),
    heightFt: toDecimalFt(heightFt, heightIn),
    pickupFrom:   data.pickupFrom   ? normalizeDateTime(data.pickupFrom)   : data.pickupFrom,
    pickupTo:     data.pickupTo     ? normalizeDateTime(data.pickupTo)     : data.pickupTo,
    deliveryFrom: data.deliveryFrom ? normalizeDateTime(data.deliveryFrom) : data.deliveryFrom,
    deliveryTo:   data.deliveryTo   ? normalizeDateTime(data.deliveryTo)   : data.deliveryTo,
  }
}

export interface PaymentStatus {
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  paidAt: string | null
  truckerPayoutCents: number
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

  cancel: (id: string, reason: string) =>
    apiPatch<Load>(`/loads/${id}/cancel`, { reason }),

  settle: (id: string) =>
    apiPatch<Load>(`/loads/${id}/settle`),

  dispute: (id: string, reason: string) =>
    apiPatch<Load>(`/loads/${id}/dispute`, { reason }),

  getEvents: (id: string) =>
    apiGet<LoadEvent[]>(`/loads/${id}/events`),

  getBoardEvents: (id: string) =>
    apiGet<LoadEvent[]>(`/board/${id}/events`),

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

  pickup: (id: string, payload?: { exceptionNotes?: string; exceptionPhoto?: File }) => {
    const form = new FormData()
    if (payload?.exceptionNotes) form.append('exceptionNotes', payload.exceptionNotes)
    if (payload?.exceptionPhoto) form.append('exceptionPhoto', payload.exceptionPhoto)
    return apiPost<Load>(`/board/${id}/pickup`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },

  deliver: (id: string) =>
    apiPost<Load>(`/board/${id}/deliver`),

  // Backend returns 200 + body when an invoice exists, or 204 with no body
  // when it doesn't. apiGet's default validateStatus would treat a 204 as
  // success too, but its `.data` would be an empty string rather than
  // null/undefined — so we call apiClient directly and normalize.
  getPaymentStatus: (id: string) =>
    apiClient
      .get<PaymentStatus>(`/board/${id}/payment`, { validateStatus: (s) => s === 200 || s === 204 })
      .then((r) => (r.status === 204 ? null : r.data)),

}
