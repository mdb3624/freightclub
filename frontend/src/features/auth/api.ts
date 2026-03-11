import apiClient from '@/lib/apiClient'
import type { AuthResponse, RefreshResponse } from '@/types'
import type { LoginFormValues, RegisterFormValues } from './types'

export const authApi = {
  register: (data: Omit<RegisterFormValues, 'confirmPassword'>): Promise<AuthResponse> =>
    apiClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: LoginFormValues): Promise<AuthResponse> =>
    apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  logout: (): Promise<void> =>
    apiClient.post('/auth/logout').then(() => undefined),

  refresh: (): Promise<RefreshResponse> =>
    apiClient.post<RefreshResponse>('/auth/refresh').then((r) => r.data),
}
