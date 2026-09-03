import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ImpersonationBanner } from './ImpersonationBanner'
import { useImpersonationStore } from '@/store/impersonationStore'
import * as adminApi from '@/features/admin/api'

// US-885 BR-2: persistent, unmissable banner while impersonating, with a one-click end control.
describe('ImpersonationBanner', () => {
  const originalLocation = window.location

  beforeEach(() => {
    useImpersonationStore.getState().clear()
    // @ts-expect-error - test-only stub of window.location.href assignment
    delete window.location
    window.location = { ...originalLocation, href: '' } as Location
  })

  afterEach(() => {
    window.location = originalLocation
    vi.restoreAllMocks()
  })

  it('renders nothing when no impersonation session is active', () => {
    const { container } = render(<ImpersonationBanner />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the target and an end control when a session is active', () => {
    useImpersonationStore.getState().start({
      token: 'jwt-123',
      sessionId: 'session-1',
      expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
      target: { id: 'u1', email: 'target@example.com', firstName: 'Target', lastName: 'User', role: 'SHIPPER' },
    })

    render(<ImpersonationBanner />)

    expect(screen.getByTestId('impersonation-banner')).toBeInTheDocument()
    expect(screen.getByText(/Target User/)).toBeInTheDocument()
    expect(screen.getByText(/target@example.com/)).toBeInTheDocument()
    expect(screen.getByTestId('end-impersonation-btn')).toBeInTheDocument()
  })

  it('renders nothing once the session is client-side-known expired', () => {
    useImpersonationStore.getState().start({
      token: 'jwt-123',
      sessionId: 'session-1',
      expiresAt: new Date(Date.now() - 1000).toISOString(),
      target: { id: 'u1', email: 'target@example.com', firstName: 'Target', lastName: 'User', role: 'SHIPPER' },
    })

    const { container } = render(<ImpersonationBanner />)
    expect(container.firstChild).toBeNull()
  })

  it('calls endImpersonation and clears the store when ending', async () => {
    const endSpy = vi.spyOn(adminApi, 'endImpersonation').mockResolvedValue(undefined)
    useImpersonationStore.getState().start({
      token: 'jwt-123',
      sessionId: 'session-1',
      expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
      target: { id: 'u1', email: 'target@example.com', firstName: 'Target', lastName: 'User', role: 'SHIPPER' },
    })

    render(<ImpersonationBanner />)
    fireEvent.click(screen.getByTestId('end-impersonation-btn'))

    await waitFor(() => expect(endSpy).toHaveBeenCalledWith('session-1'))
    await waitFor(() => expect(useImpersonationStore.getState().token).toBeNull())
  })
})
