import { describe, it, expect, beforeEach } from 'vitest'
import { useImpersonationStore, isImpersonationExpired } from './impersonationStore'

describe('impersonationStore', () => {
  beforeEach(() => {
    useImpersonationStore.getState().clear()
  })

  it('starts empty', () => {
    const state = useImpersonationStore.getState()
    expect(state.token).toBeNull()
    expect(state.target).toBeNull()
  })

  it('start() populates the session', () => {
    useImpersonationStore.getState().start({
      token: 'jwt-123',
      sessionId: 'session-1',
      expiresAt: '2026-01-01T00:15:00Z',
      target: { id: 'u1', email: 't@example.com', firstName: 'T', lastName: 'User', role: 'SHIPPER' },
    })

    const state = useImpersonationStore.getState()
    expect(state.token).toBe('jwt-123')
    expect(state.sessionId).toBe('session-1')
    expect(state.target?.email).toBe('t@example.com')
  })

  it('clear() resets everything', () => {
    useImpersonationStore.getState().start({
      token: 'jwt-123', sessionId: 's1', expiresAt: '2026-01-01T00:15:00Z',
      target: { id: 'u1', email: 't@example.com', firstName: 'T', lastName: 'User', role: 'SHIPPER' },
    })

    useImpersonationStore.getState().clear()

    const state = useImpersonationStore.getState()
    expect(state.token).toBeNull()
    expect(state.sessionId).toBeNull()
    expect(state.target).toBeNull()
  })
})

describe('isImpersonationExpired', () => {
  it('treats null as expired', () => {
    expect(isImpersonationExpired(null)).toBe(true)
  })

  it('treats a past timestamp as expired', () => {
    expect(isImpersonationExpired(new Date(Date.now() - 1000).toISOString())).toBe(true)
  })

  it('treats a future timestamp as not expired', () => {
    expect(isImpersonationExpired(new Date(Date.now() + 60_000).toISOString())).toBe(false)
  })
})
