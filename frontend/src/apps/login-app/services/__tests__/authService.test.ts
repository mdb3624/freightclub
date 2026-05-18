import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authService } from '../authService'
import type { LoginRequest } from '../../../../shared/types/auth'

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should send credentials to /api/v1/auth/login', async () => {
    const credentials: LoginRequest = {
      email: 'test@example.com',
      password: 'password123',
    }

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            accessToken: 'token123',
            user: {
              id: 'user123',
              email: 'test@example.com',
              name: 'Test User',
            },
          }),
      } as Response)
    )

    const response = await authService.login(credentials)

    expect(global.fetch).toHaveBeenCalledWith('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    })

    expect(response.accessToken).toBe('token123')
    expect(response.user.email).toBe('test@example.com')
  })

  it('should throw AuthError on 401 response', async () => {
    const credentials: LoginRequest = {
      email: 'test@example.com',
      password: 'wrongpassword',
    }

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () =>
          Promise.resolve({
            code: 'UNAUTHORIZED',
            message: 'Invalid credentials',
          }),
      } as Response)
    )

    await expect(authService.login(credentials)).rejects.toThrow()
  })

  it('should throw AuthError on network error', async () => {
    const credentials: LoginRequest = {
      email: 'test@example.com',
      password: 'password123',
    }

    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Network error'))
    )

    await expect(authService.login(credentials)).rejects.toThrow()
  })
})
