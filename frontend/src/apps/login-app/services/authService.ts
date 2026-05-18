import type { LoginRequest, LoginResponse, AuthError } from '../../../shared/types/auth'

const API_BASE = '/api/v1'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: AuthError = await response.json()
    throw new Error(error.message || `HTTP ${response.status}`)
  }
  return response.json()
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      })

      return handleResponse<LoginResponse>(response)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message)
      }
      throw error
    }
  },

  async checkAuth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/auth/status`, {
        method: 'GET',
        credentials: 'include',
      })

      return response.ok
    } catch {
      return false
    }
  },

  logout(): void {
    window.location.href = '/'
  },
}
