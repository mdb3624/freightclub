import apiClient, { apiPost } from '@/lib/apiClient'
import type { AuthResponse, RefreshResponse } from '@/types'
import type { LoginFormValues, RegisterFormValues } from './types'

export const authApi = {
  register: (data: Omit<RegisterFormValues, 'confirmPassword'>): Promise<AuthResponse> =>
    apiPost<AuthResponse>('/auth/register', data),

  login: (data: LoginFormValues): Promise<AuthResponse> =>
    apiPost<AuthResponse>('/auth/login', data),

  logout: (): Promise<void> =>
    apiClient.post('/auth/logout').then(() => undefined),

  refresh: (): Promise<RefreshResponse> =>
    apiPost<RefreshResponse>('/auth/refresh'),
}
