import axios, { type AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'

const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,  // send HTTP-only refresh token cookie automatically
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
apiClient.interceptors.request.use((config) => {
  const store = useAuthStore.getState()
  const token = store.accessToken
  console.log('[apiClient] Request to', config.url, '- token exists:', !!token, '- isAuthenticated:', store.isAuthenticated)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - just reject errors (refresh logic disabled for now)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
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
