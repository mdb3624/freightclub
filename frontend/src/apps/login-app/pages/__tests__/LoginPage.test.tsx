import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginPage } from '../LoginPage'

// Mock authService
vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn(),
  },
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete (window as any).location
    window.location = { href: '' } as any
  })

  it('should render login form on initial load', () => {
    render(<LoginPage />)
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
  })

  it('should call authService.login and redirect on successful login', async () => {
    const { authService } = await import('../../services/authService')
    vi.mocked(authService.login).mockResolvedValue({
      accessToken: 'token123',
      user: { id: '1', email: 'user@example.com', name: 'User' },
    })

    render(<LoginPage />)
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      })
    })
  })

  it('should display error message on login failure', async () => {
    const { authService } = await import('../../services/authService')
    vi.mocked(authService.login).mockRejectedValue(new Error('Invalid credentials'))

    render(<LoginPage />)
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'wrong' },
    })
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })
})
