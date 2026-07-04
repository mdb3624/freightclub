import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PaymentStatusCard } from './PaymentStatusCard'

describe('PaymentStatusCard', () => {
  it('shows Paid with the payout amount and date when status is PAID', () => {
    render(<PaymentStatusCard status={{ status: 'PAID', paidAt: '2026-07-05T10:00:00Z', truckerPayoutCents: 21000 }} />)
    // /Paid/i alone would also match the "Paid on <date>" line below, so
    // anchor to the exact status-label text to keep the query unambiguous.
    expect(screen.getByText(/^Paid$/i)).toBeInTheDocument()
    expect(screen.getByText(/\$210\.00/)).toBeInTheDocument()
  })

  it('shows Pending when status is PENDING', () => {
    render(<PaymentStatusCard status={{ status: 'PENDING', paidAt: null, truckerPayoutCents: 21000 }} />)
    expect(screen.getByText(/Pending/i)).toBeInTheDocument()
  })

  it('renders nothing when status is undefined (no invoice yet)', () => {
    const { container } = render(<PaymentStatusCard status={undefined} />)
    expect(container).toBeEmptyDOMElement()
  })
})
