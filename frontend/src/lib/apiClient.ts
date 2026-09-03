import axios, { type AxiosRequestConfig, type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'
import { useImpersonationStore, isImpersonationExpired } from '@/store/impersonationStore'
import type { RefreshResponse } from '@/types'

const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,  // send HTTP-only refresh token cookie automatically
  headers: { 'Content-Type': 'application/json' },
})

// US-885: while an impersonation session is active (and not client-side-known-expired), every
// request authenticates AS the impersonated target — never the real Super User's own token —
// so the app genuinely renders that user's own dashboards/data. The real Super User's session
// in authStore is never touched; ending impersonation (or the token expiring) just falls back
// to it automatically.
apiClient.interceptors.request.use((config) => {
  const impersonation = useImpersonationStore.getState()
  const impersonationActive = impersonation.token && !isImpersonationExpired(impersonation.expiresAt)
  const token = impersonationActive ? impersonation.token : useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// These endpoints must never trigger a refresh-and-retry cycle — a 401 from
// any of them means the credentials themselves are bad (or IS the refresh
// call), not that a previously-valid access token merely expired.
const NO_REFRESH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh']

function isNoRefreshPath(url?: string): boolean {
  return !!url && NO_REFRESH_PATHS.some((p) => url.includes(p))
}

// Dedupe concurrent refreshes: if several requests 401 in the same window,
// only one POST /auth/refresh fires — the rest await this shared promise.
let refreshPromise: Promise<string> | null = null

// Exported so AuthInitializer can attempt a silent session restore on app
// mount, since the access token itself is never persisted (see authStore.ts).
export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post<RefreshResponse>('/auth/refresh', {})
      .then((res) => {
        useAuthStore.getState().setAccessToken(res.data.accessToken)
        return res.data.accessToken
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

// Access tokens expire after 15 minutes; on a 401 (and only once per
// request), silently refresh via the HTTP-only refresh cookie and retry.
// If the refresh itself fails, the refresh cookie is gone too — clear auth
// state and send the user back to login rather than surfacing a confusing
// generic error on whatever action they were mid-way through.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isNoRefreshPath(originalRequest.url)
    ) {
      return Promise.reject(error)
    }

    // US-885: a 401 while impersonating means that token (deliberately not tied to any
    // refresh-token row) is dead — end the session client-side rather than refreshing, which
    // would otherwise silently fall back to the real Super User's OWN credentials while the
    // banner still claimed to be impersonating someone else.
    const impersonation = useImpersonationStore.getState()
    if (impersonation.token && !isImpersonationExpired(impersonation.expiresAt)) {
      impersonation.clear()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      await refreshAccessToken()
      return apiClient(originalRequest)
    } catch (refreshError) {
      useAuthStore.getState().logout()
      window.location.href = '/'
      return Promise.reject(refreshError)
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

export const apiDelete = <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  apiClient.delete<T>(url, config).then((r) => r.data)
