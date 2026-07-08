/**
 * Feature: US-849 (Access Token Refresh Interceptor)
 * AC-1: automatic refresh-and-retry on 401
 * AC-2: refresh failure clears auth + redirects to /login
 * AC-3: concurrent 401s dedupe into a single refresh call
 * AC-4: non-401 errors and auth endpoints themselves are unaffected
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import apiClient from './apiClient'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types'

const mockUser: User = {
  id: 'user-1', email: 'test@example.com', firstName: 'Test', lastName: 'User',
  role: 'SHIPPER', tenantId: 'tenant-1',
}

function unauthorizedError(config: InternalAxiosRequestConfig) {
  const err: any = new Error('Request failed with status code 401')
  err.isAxiosError = true
  err.config = config
  err.response = {
    status: 401,
    // Matches Spring Security's default filter-chain 401 body — no `message` field.
    data: { timestamp: '2026-07-07T00:00:00Z', status: 401, error: 'Unauthorized', path: config.url },
    statusText: 'Unauthorized',
    headers: {},
    config,
  }
  return err
}

function okResponse<T>(config: InternalAxiosRequestConfig, data: T): AxiosResponse<T> {
  return { data, status: 200, statusText: 'OK', headers: {}, config }
}

// jsdom's window.location.href is a real (non-configurable) accessor tied
// to navigation, so it can't be spied on directly. Replace window.location
// itself with a plain object for just this suite (restored after each test)
// to capture the redirect target without triggering jsdom's "Not
// implemented: navigation" error.
const realLocation = window.location

beforeEach(() => {
  useAuthStore.setState({ accessToken: 'stale-token', user: mockUser, isAuthenticated: true })
  localStorage.clear()
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { href: '' },
  })
})

afterEach(() => {
  Object.defineProperty(window, 'location', { configurable: true, value: realLocation })
  apiClient.defaults.adapter = undefined
})

describe('apiClient refresh-on-401 interceptor', () => {
  it('AC-1: refreshes the token and retries the original request once', async () => {
    let loadsCallCount = 0
    const adapter: AxiosAdapter = async (config) => {
      if (config.url === '/loads') {
        loadsCallCount++
        if (loadsCallCount === 1) throw unauthorizedError(config)
        expect(config.headers.Authorization).toBe('Bearer fresh-token')
        return okResponse(config, { id: 'load-1' })
      }
      if (config.url === '/auth/refresh') {
        return okResponse<{ accessToken: string; tokenType: string; expiresIn: number }>(config, {
          accessToken: 'fresh-token', tokenType: 'Bearer', expiresIn: 900,
        })
      }
      throw new Error(`unexpected request to ${config.url}`)
    }
    apiClient.defaults.adapter = adapter

    const result = await apiClient.post('/loads', {})

    expect(result.data).toEqual({ id: 'load-1' })
    expect(loadsCallCount).toBe(2)
    expect(useAuthStore.getState().accessToken).toBe('fresh-token')
  })

  it('AC-2: clears auth state and redirects to /login when refresh itself fails', async () => {
    const adapter: AxiosAdapter = async (config) => {
      if (config.url === '/loads') throw unauthorizedError(config)
      if (config.url === '/auth/refresh') throw unauthorizedError(config)
      throw new Error(`unexpected request to ${config.url}`)
    }
    apiClient.defaults.adapter = adapter

    await expect(apiClient.post('/loads', {})).rejects.toBeTruthy()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.accessToken).toBeNull()
    expect(window.location.href).toBe('/login')
  })

  it('AC-3: two concurrent 401s share a single refresh call', async () => {
    let refreshCallCount = 0
    const adapter: AxiosAdapter = async (config) => {
      if (config.url === '/loads' || config.url === '/board') {
        if (!(config.headers as any)._retried) {
          (config.headers as any)._retried = true
          throw unauthorizedError(config)
        }
        return okResponse(config, { ok: true })
      }
      if (config.url === '/auth/refresh') {
        refreshCallCount++
        return okResponse<{ accessToken: string; tokenType: string; expiresIn: number }>(config, {
          accessToken: 'fresh-token', tokenType: 'Bearer', expiresIn: 900,
        })
      }
      throw new Error(`unexpected request to ${config.url}`)
    }
    apiClient.defaults.adapter = adapter

    const [a, b] = await Promise.all([apiClient.get('/loads'), apiClient.get('/board')])

    expect(a.data).toEqual({ ok: true })
    expect(b.data).toEqual({ ok: true })
    expect(refreshCallCount).toBe(1)
  })

  it('AC-4: a 401 on /auth/login itself is rejected without attempting a refresh', async () => {
    let refreshCallCount = 0
    const adapter: AxiosAdapter = async (config) => {
      if (config.url === '/auth/login') throw unauthorizedError(config)
      if (config.url === '/auth/refresh') {
        refreshCallCount++
        return okResponse(config, {})
      }
      throw new Error(`unexpected request to ${config.url}`)
    }
    apiClient.defaults.adapter = adapter

    await expect(apiClient.post('/auth/login', {})).rejects.toBeTruthy()
    expect(refreshCallCount).toBe(0)
  })

  it('AC-4: a non-401 error is rejected without attempting a refresh', async () => {
    let refreshCallCount = 0
    const adapter: AxiosAdapter = async (config) => {
      if (config.url === '/loads') {
        const err: any = new Error('Request failed with status code 500')
        err.isAxiosError = true
        err.config = config
        err.response = { status: 500, data: { message: 'boom' }, statusText: 'Internal Server Error', headers: {}, config }
        throw err
      }
      if (config.url === '/auth/refresh') {
        refreshCallCount++
        return okResponse(config, {})
      }
      throw new Error(`unexpected request to ${config.url}`)
    }
    apiClient.defaults.adapter = adapter

    await expect(apiClient.post('/loads', {})).rejects.toMatchObject({ response: { status: 500 } })
    expect(refreshCallCount).toBe(0)
  })
})
