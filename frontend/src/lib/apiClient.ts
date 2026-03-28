import axios, { type AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'
import type { RefreshResponse } from '@/types'

const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,  // send HTTP-only refresh token cookie automatically
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Silent refresh on 401
let isRefreshing = false
let pendingRequests: Array<(token: string) => void> = []

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status !== 401 || originalRequest._retried) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingRequests.push((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          resolve(apiClient(originalRequest))
        })
      })
    }

    originalRequest._retried = true
    isRefreshing = true

    try {
      const { data } = await axios.post<RefreshResponse>(
        '/api/v1/auth/refresh',
        {},
        { withCredentials: true }
      )

      useAuthStore.getState().setAuth(data.accessToken, useAuthStore.getState().user!)
      pendingRequests.forEach((cb) => cb(data.accessToken))
      pendingRequests = []

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
      return apiClient(originalRequest)
    } catch {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)

export default apiClient

// Typed helpers that auto-unwrap AxiosResponse.data
export const apiGet = <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  apiClient.get<T>(url, config).then((r) => r.data)

export const apiPost = <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
  apiClient.post<T>(url, data, config).then((r) => r.data)

export const apiPut = <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
  apiClient.put<T>(url, data, config).then((r) => r.data)

export const apiPatch = <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
  apiClient.patch<T>(url, data, config).then((r) => r.data)
