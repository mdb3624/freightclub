import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { LoginForm } from './LoginForm'
import * as authHooks from '../hooks/useLogin'

// Mock useLogin hook
vi.mock('../hooks/useLogin', () => ({
  useLogin: vi.fn(),
}))

function renderLoginForm() {
  return render(
    <BrowserRouter>
      <LoginForm />
    </BrowserRouter>
  )
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.mocked(authHooks.useLogin).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    } as any)
  })

  it('renders email and password inputs', () => {
    renderLoginForm()
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
  })

  it('renders sign in button', () => {
    renderLoginForm()
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument()
  })

  it('renders sign up link', () => {
    renderLoginForm()
    expect(screen.getByRole('link', { name: /Sign up/i })).toBeInTheDocument()
  })

  it('shows email required error on submit with empty email', async () => {
    renderLoginForm()
    const submitButton = screen.getByRole('button', { name: /Sign in/i })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })
  })

  it('shows password required error on submit with empty password', async () => {
    renderLoginForm()
    const emailInput = screen.getByLabelText(/Email/i)
    const submitButton = screen.getByRole('button', { name: /Sign in/i })

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  it('shows invalid email error on input change', async () => {
    renderLoginForm()
    const emailInput = screen.getByLabelText(/Email/i)

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

    await waitFor(() => {
      expect(screen.getByText('Enter a valid email')).toBeInTheDocument()
    })
  })

  it('clears email error when valid email is entered', async () => {
    renderLoginForm()
    const emailInput = screen.getByLabelText(/Email/i)

    fireEvent.change(emailInput, { target: { value: 'invalid' } })
    await waitFor(() => {
      expect(screen.getByText('Enter a valid email')).toBeInTheDocument()
    })

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
    await waitFor(() => {
      expect(screen.queryByText('Enter a valid email')).not.toBeInTheDocument()
    })
  })

  it('calls mutate with valid credentials', async () => {
    const mockMutate = vi.fn()
    vi.mocked(authHooks.useLogin).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    } as any)

    renderLoginForm()
    const emailInput = screen.getByLabelText(/Email/i)
    const passwordInput = screen.getByLabelText(/Password/i)
    const submitButton = screen.getByRole('button', { name: /Sign in/i })

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      })
    })
  })

  it('does not call mutate with invalid email', async () => {
    const mockMutate = vi.fn()
    vi.mocked(authHooks.useLogin).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    } as any)

    renderLoginForm()
    const emailInput = screen.getByLabelText(/Email/i)
    const passwordInput = screen.getByLabelText(/Password/i)
    const submitButton = screen.getByRole('button', { name: /Sign in/i })

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockMutate).not.toHaveBeenCalled()
      expect(screen.getByText('Enter a valid email')).toBeInTheDocument()
    })
  })

  it('shows loading state on submit button', () => {
    vi.mocked(authHooks.useLogin).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
      error: null,
    } as any)

    renderLoginForm()
    const submitButton = screen.getByRole('button', { name: /Sign in/i })

    expect(submitButton).toHaveAttribute('disabled')
  })
})
