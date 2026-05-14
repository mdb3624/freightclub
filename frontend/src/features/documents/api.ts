import apiClient from '@/lib/apiClient'
import { apiGet, apiPost } from '@/lib/apiClient'
import type { LoadDocument } from './types'

const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } }

export const documentsApi = {
  list: (loadId: string) =>
    apiGet<LoadDocument[]>(`/documents/${loadId}`),

  uploadBolPhoto: (loadId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiPost<LoadDocument>(`/documents/${loadId}/bol-photo`, form, MULTIPART)
  },

  uploadPodPhoto: (loadId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiPost<LoadDocument>(`/documents/${loadId}/pod-photo`, form, MULTIPART)
  },

  reportIssue: (loadId: string, description: string, photo?: File) => {
    const form = new FormData()
    form.append('description', description)
    if (photo) form.append('photo', photo)
    return apiPost<void>(`/documents/${loadId}/issue`, form, MULTIPART)
  },

  download: (documentId: string): Promise<Blob> =>
    apiClient.get(`/documents/file/${documentId}`, { responseType: 'blob' }).then((r) => r.data as Blob),

  exportPdf: (loadId: string): Promise<Blob> =>
    apiClient.get(`/documents/${loadId}/export`, { responseType: 'blob' }).then((r) => r.data as Blob),
}
