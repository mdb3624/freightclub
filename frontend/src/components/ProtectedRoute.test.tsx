import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import { ProtectedRoute } from './ProtectedRoute'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types'

// Reset auth store before each test
beforeEach(() => {
  useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false })
})

function renderInRouter(element: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/protected" element={element} />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

const mockShipper: User = {
  id: 'user-1',
  email: 'shipper@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'SHIPPER',
  tenantId: 'tenant-1',
}

describe('ProtectedRoute', () => {
  it('redirects unauthenticated user to /', () => {
    renderInRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    expect(screen.getByText('Home Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders children for authenticated user with no role requirement', () => {
    useAuthStore.setState({ accessToken: 'token', user: mockShipper, isAuthenticated: true })

    renderInRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('renders children when authenticated user has the required role', () => {
    useAuthStore.setState({ accessToken: 'token', user: mockShipper, isAuthenticated: true })

    renderInRouter(
      <ProtectedRoute role="SHIPPER">
        <div>Shipper Content</div>
      </ProtectedRoute>
    )
    expect(screen.getByText('Shipper Content')).toBeInTheDocument()
  })

  it('redirects when authenticated user has wrong role', () => {
    useAuthStore.setState({ accessToken: 'token', user: mockShipper, isAuthenticated: true })

    renderInRouter(
      <ProtectedRoute role="TRUCKER">
        <div>Trucker Content</div>
      </ProtectedRoute>
    )
    expect(screen.getByText('Home Page')).toBeInTheDocument()
    expect(screen.queryByText('Trucker Content')).not.toBeInTheDocument()
  })

  // US-874/875: requireTenantAdmin gates independently of role — a plain SHIPPER member
  // (correct role, no admin flag) must not reach an admin-only route.
  describe('requireTenantAdmin', () => {
    it('redirects a plain (non-admin) member even with the correct role', () => {
      useAuthStore.setState({
        accessToken: 'token',
        user: { ...mockShipper, isTenantAdmin: false },
        isAuthenticated: true,
      })

      renderInRouter(
        <ProtectedRoute role="SHIPPER" requireTenantAdmin>
          <div>Team Settings</div>
        </ProtectedRoute>
      )
      expect(screen.getByText('Home Page')).toBeInTheDocument()
      expect(screen.queryByText('Team Settings')).not.toBeInTheDocument()
    })

    it('redirects when isTenantAdmin is absent (older cached auth state)', () => {
      useAuthStore.setState({ accessToken: 'token', user: mockShipper, isAuthenticated: true })

      renderInRouter(
        <ProtectedRoute role="SHIPPER" requireTenantAdmin>
          <div>Team Settings</div>
        </ProtectedRoute>
      )
      expect(screen.getByText('Home Page')).toBeInTheDocument()
    })

    it('renders children for a tenant admin with the correct role', () => {
      useAuthStore.setState({
        accessToken: 'token',
        user: { ...mockShipper, isTenantAdmin: true },
        isAuthenticated: true,
      })

      renderInRouter(
        <ProtectedRoute role="SHIPPER" requireTenantAdmin>
          <div>Team Settings</div>
        </ProtectedRoute>
      )
      expect(screen.getByText('Team Settings')).toBeInTheDocument()
    })
  })
})
