import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SuperUserDashboardPage } from './SuperUserDashboardPage'
import * as api from './api'
import { useImpersonationStore } from '@/store/impersonationStore'

vi.mock('./api')
const mockedApi = vi.mocked(api)

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SuperUserDashboardPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('SuperUserDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useImpersonationStore.getState().clear()
    mockedApi.getSuperUserDashboard.mockResolvedValue({
      tenantCount: 1,
      userCountByRole: { SHIPPER: 1 },
      loadCountByStatus: {},
      tenants: [{ id: 'tenant-1', name: 'Acme Freight', plan: 'FREE', memberCount: 2 }],
    })
  })

  // US-884: tenant suspend/reactivate directly from the existing dashboard tenant row.
  it('suspends a tenant with a reason from the dashboard tab', async () => {
    mockedApi.suspendTenant.mockResolvedValue(undefined)
    renderPage()

    await screen.findByText('Acme Freight')
    fireEvent.click(screen.getByTestId('tenant-suspend-tenant-1'))
    fireEvent.change(screen.getByTestId('tenant-reason-tenant-1'), { target: { value: 'Non-payment' } })
    fireEvent.click(screen.getByTestId('tenant-confirm-tenant-1'))

    await waitFor(() => expect(mockedApi.suspendTenant).toHaveBeenCalledWith('tenant-1', 'Non-payment'))
  })

  it('disables the tenant confirm button until a reason is entered', async () => {
    renderPage()

    await screen.findByText('Acme Freight')
    fireEvent.click(screen.getByTestId('tenant-suspend-tenant-1'))

    expect(screen.getByTestId('tenant-confirm-tenant-1')).toBeDisabled()
  })

  // US-881: suspend a user by ID with a mandatory reason.
  it('suspends a user by ID with a reason from the Users tab', async () => {
    mockedApi.suspendUser.mockResolvedValue(undefined)
    renderPage()

    fireEvent.click(screen.getByTestId('super-user-tab-users'))
    fireEvent.change(screen.getByTestId('user-id-input'), { target: { value: 'user-42' } })
    fireEvent.change(screen.getByTestId('user-reason-input'), { target: { value: 'Fraud report' } })
    fireEvent.click(screen.getByTestId('suspend-user-btn'))

    await waitFor(() => expect(mockedApi.suspendUser).toHaveBeenCalledWith('user-42', 'Fraud report'))
  })

  it('requires both a user ID and reason before suspend is enabled', () => {
    renderPage()

    fireEvent.click(screen.getByTestId('super-user-tab-users'))
    expect(screen.getByTestId('suspend-user-btn')).toBeDisabled()
  })

  it('shows the returned token after a force password reset', async () => {
    mockedApi.forcePasswordReset.mockResolvedValue({ resetToken: 'raw-token-abc' })
    renderPage()

    fireEvent.click(screen.getByTestId('super-user-tab-users'))
    fireEvent.change(screen.getByTestId('user-id-input'), { target: { value: 'user-42' } })
    fireEvent.change(screen.getByTestId('user-reason-input'), { target: { value: 'Suspected compromise' } })
    fireEvent.click(screen.getByTestId('force-reset-btn'))

    await screen.findByText('raw-token-abc')
  })

  // US-885: starting impersonation populates the impersonation store and requires re-auth.
  it('starts impersonation and populates the impersonation store', async () => {
    mockedApi.startImpersonation.mockResolvedValue({
      impersonationToken: 'impersonation-jwt',
      sessionId: 'session-1',
      expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
      target: { id: 'user-42', email: 'target@example.com', firstName: 'Target', lastName: 'User', role: 'SHIPPER' },
    })
    const originalHref = window.location.href
    // @ts-expect-error - test-only stub, restored below
    delete window.location
    window.location = { href: '' } as Location

    renderPage()

    fireEvent.click(screen.getByTestId('super-user-tab-users'))
    fireEvent.change(screen.getByTestId('user-id-input'), { target: { value: 'user-42' } })
    fireEvent.change(screen.getByTestId('user-reason-input'), { target: { value: 'Support ticket #42' } })
    fireEvent.change(screen.getByTestId('reauth-password-input'), { target: { value: 'MyOwnPassword1!' } })
    fireEvent.click(screen.getByTestId('start-impersonation-btn'))

    await waitFor(() => expect(mockedApi.startImpersonation).toHaveBeenCalledWith({
      targetUserId: 'user-42', reason: 'Support ticket #42', password: 'MyOwnPassword1!',
    }))
    await waitFor(() => expect(useImpersonationStore.getState().token).toBe('impersonation-jwt'))

    window.location.href = originalHref
  })

  it('disables start-impersonation until a re-auth password is entered', () => {
    renderPage()

    fireEvent.click(screen.getByTestId('super-user-tab-users'))
    fireEvent.change(screen.getByTestId('user-id-input'), { target: { value: 'user-42' } })
    fireEvent.change(screen.getByTestId('user-reason-input'), { target: { value: 'reason' } })

    expect(screen.getByTestId('start-impersonation-btn')).toBeDisabled()
  })

  // US-886: create a user in an existing tenant, returns a setup token (never a password).
  it('creates a user in an existing tenant and shows the setup token', async () => {
    mockedApi.createUserInTenant.mockResolvedValue({ setupToken: 'setup-token-xyz' })
    renderPage()

    fireEvent.click(screen.getByTestId('super-user-tab-create'))
    fireEvent.change(screen.getByTestId('create-tenant-id-input'), { target: { value: 'tenant-1' } })
    fireEvent.change(screen.getByTestId('create-email-input'), { target: { value: 'new@example.com' } })
    fireEvent.change(screen.getByTestId('create-first-name-input'), { target: { value: 'New' } })
    fireEvent.change(screen.getByTestId('create-last-name-input'), { target: { value: 'User' } })
    fireEvent.change(screen.getByTestId('create-reason-input'), { target: { value: 'Teammate request' } })
    fireEvent.click(screen.getByTestId('create-submit-btn'))

    await waitFor(() => expect(mockedApi.createUserInTenant).toHaveBeenCalledWith({
      tenantId: 'tenant-1', email: 'new@example.com', firstName: 'New', lastName: 'User',
      role: 'SHIPPER', reason: 'Teammate request',
    }))
    await screen.findByText('setup-token-xyz')
  })

  it('switches to the new-tenant form and calls createTenantWithFirstUser', async () => {
    mockedApi.createTenantWithFirstUser.mockResolvedValue({ setupToken: 'setup-token-new' })
    renderPage()

    fireEvent.click(screen.getByTestId('super-user-tab-create'))
    fireEvent.click(screen.getByTestId('create-mode-new'))
    fireEvent.change(screen.getByTestId('create-company-name-input'), { target: { value: 'Brand New Co' } })
    fireEvent.change(screen.getByTestId('create-email-input'), { target: { value: 'owner@example.com' } })
    fireEvent.change(screen.getByTestId('create-first-name-input'), { target: { value: 'Own' } })
    fireEvent.change(screen.getByTestId('create-last-name-input'), { target: { value: 'Er' } })
    fireEvent.change(screen.getByTestId('create-reason-input'), { target: { value: 'Phone signup' } })
    fireEvent.click(screen.getByTestId('create-submit-btn'))

    await waitFor(() => expect(mockedApi.createTenantWithFirstUser).toHaveBeenCalledWith({
      companyName: 'Brand New Co', email: 'owner@example.com', firstName: 'Own', lastName: 'Er',
      role: 'SHIPPER', reason: 'Phone signup',
    }))
    await screen.findByText('setup-token-new')
  })

  // US-880: read-only audit log view.
  it('renders audit log entries', async () => {
    mockedApi.getAuditLog.mockResolvedValue([
      { id: 'a1', actorUserId: 'admin-1', actionType: 'USER_SUSPENDED', targetId: 'user-42', reason: 'Fraud', createdAt: '2026-09-02T12:00:00Z' },
    ])
    renderPage()

    fireEvent.click(screen.getByTestId('super-user-tab-audit'))

    await screen.findByText('USER_SUSPENDED')
    expect(screen.getByText('Fraud')).toBeInTheDocument()
  })

  it('shows an empty state when there are no audit entries', async () => {
    mockedApi.getAuditLog.mockResolvedValue([])
    renderPage()

    fireEvent.click(screen.getByTestId('super-user-tab-audit'))

    await screen.findByText('No audit entries.')
  })
})
