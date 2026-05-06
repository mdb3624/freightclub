import axios from 'axios'
import type { AuthResponse, RefreshResponse } from '@/types'
import type { LoginFormValues, RegisterFormValues } from './types'

const AUTH_BASE = '/api/v1/auth'

export const authApi = {
  register: (data: Omit<RegisterFormValues, 'confirmPassword'>): Promise<AuthResponse> =>
    axios.post<AuthResponse>(`${AUTH_BASE}/register`, data, { withCredentials: true }).then(r => r.data),

  login: (data: LoginFormValues): Promise<AuthResponse> =>
    axios.post<AuthResponse>(`${AUTH_BASE}/login`, data, { withCredentials: true }).then(r => r.data),

  logout: (): Promise<void> =>
    axios.post(`${AUTH_BASE}/logout`, {}, { withCredentials: true }).then(() => undefined),

  refresh: (): Promise<RefreshResponse> =>
    axios.post<RefreshResponse>(`${AUTH_BASE}/refresh`, {}, { withCredentials: true }).then(r => r.data),
}
