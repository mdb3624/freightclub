import apiClient from '@/lib/apiClient'
import type { LoadDocument } from './types'

export const documentsApi = {
  list: (loadId: string) =>
    apiClient.get<LoadDocument[]>(`/documents/${loadId}`).then((r) => r.data),

  uploadBolPhoto: (loadId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient
      .post<LoadDocument>(`/documents/${loadId}/bol-photo`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  uploadPodPhoto: (loadId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient
      .post<LoadDocument>(`/documents/${loadId}/pod-photo`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  reportIssue: (loadId: string, description: string, photo?: File) => {
    const form = new FormData()
    form.append('description', description)
    if (photo) form.append('photo', photo)
    return apiClient
      .post<void>(`/documents/${loadId}/issue`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
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
