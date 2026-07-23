import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { RegisterForm } from './RegisterForm'
import * as authHooks from '../hooks/useRegister'

vi.mock('../hooks/useRegister', () => ({
  useRegister: vi.fn(),
}))

function renderRegisterForm(props: { onSwitchToLogin?: () => void } = {}) {
  return render(
    <BrowserRouter>
      <RegisterForm {...props} />
    </BrowserRouter>
  )
}

describe('RegisterForm sign-in switch', () => {
  beforeEach(() => {
    vi.mocked(authHooks.useRegister).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    } as any)
  })

  it('renders a Sign in link by default', () => {
    renderRegisterForm()
    expect(screen.getByRole('link', { name: /Sign in/i })).toBeInTheDocument()
  })

  it('calls onSwitchToLogin instead of rendering a Sign in link when provided', () => {
    const onSwitchToLogin = vi.fn()
    renderRegisterForm({ onSwitchToLogin })

    expect(screen.queryByRole('link', { name: /Sign in/i })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))
    expect(onSwitchToLogin).toHaveBeenCalled()
  })
})
