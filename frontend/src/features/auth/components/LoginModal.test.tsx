import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginModal } from './LoginModal'

function renderModal(onClose = vi.fn()) {
  const queryClient = new QueryClient()
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LoginModal isOpen onClose={onClose} />
      </MemoryRouter>
    </QueryClientProvider>
  )
  return { onClose }
}

describe('LoginModal accessibility', () => {
  it('exposes dialog semantics for assistive tech', () => {
    renderModal()
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby')
    const labelId = dialog.getAttribute('aria-labelledby')
    expect(document.getElementById(labelId!)).toHaveTextContent('Log in to FreightClub')
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
})
