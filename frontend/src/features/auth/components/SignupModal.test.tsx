import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SignupModal } from './SignupModal'

function renderModal(props: { onClose?: () => void; onSwitchToLogin?: () => void } = {}) {
  const queryClient = new QueryClient()
  const onClose = props.onClose ?? vi.fn()
  const onSwitchToLogin = props.onSwitchToLogin ?? vi.fn()
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SignupModal isOpen onClose={onClose} onSwitchToLogin={onSwitchToLogin} />
      </MemoryRouter>
    </QueryClientProvider>
  )
  return { onClose, onSwitchToLogin }
}

describe('SignupModal', () => {
  it('renders the RegisterForm', () => {
    renderModal()
    expect(screen.getByRole('button', { name: /Create account/i })).toBeInTheDocument()
  })

  it('exposes dialog semantics for assistive tech', () => {
    renderModal()
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby')
    const labelId = dialog.getAttribute('aria-labelledby')
    expect(document.getElementById(labelId!)).toHaveTextContent('Create your FreightClub account')
  })

  it('closes when Escape is pressed', () => {
    const { onClose } = renderModal()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('moves focus into the dialog on open', () => {
    renderModal()
    const dialog = screen.getByRole('dialog')
    expect(dialog).toContainElement(document.activeElement as HTMLElement)
  })

  it('calls onSwitchToLogin when the Sign in link is clicked', () => {
    const { onSwitchToLogin } = renderModal()
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))
    expect(onSwitchToLogin).toHaveBeenCalled()
  })
})
