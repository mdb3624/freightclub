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

  download: async (documentId: string, filename: string) => {
    const response = await apiClient.get(`/documents/file/${documentId}`, {
      responseType: 'blob',
    })
    const url = URL.createObjectURL(response.data as Blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },

  exportPdf: async (loadId: string) => {
    const response = await apiClient.get(`/documents/${loadId}/export`, {
      responseType: 'blob',
    })
    const url = URL.createObjectURL(response.data as Blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `load-export-${loadId.substring(0, 8)}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },
}
