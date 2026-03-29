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
        <Route path="/login" element={<div>Login Page</div>} />
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
  it('redirects unauthenticated user to /login', () => {
    renderInRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    expect(screen.getByText('Login Page')).toBeInTheDocument()
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
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Trucker Content')).not.toBeInTheDocument()
  })
})
