import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusBadge } from './StatusBadge'
import type { LoadStatus } from '../types'

describe('StatusBadge', () => {
  const statuses: LoadStatus[] = [
    'DRAFT', 'OPEN', 'CLAIMED', 'IN_TRANSIT', 'DELIVERED', 'SETTLED', 'CANCELLED',
  ]

  it.each(statuses)('renders label for status %s', (status) => {
    render(<StatusBadge status={status} />)
    const expectedText = status.replace('_', ' ')
    expect(screen.getByText(expectedText)).toBeInTheDocument()
  })

  it('applies blue color class for OPEN status', () => {
    const { container } = render(<StatusBadge status="OPEN" />)
    expect(container.firstChild).toHaveClass('bg-blue-100')
  })

  it('applies red color class for CANCELLED status', () => {
    const { container } = render(<StatusBadge status="CANCELLED" />)
    expect(container.firstChild).toHaveClass('bg-red-100')
  })

  it('applies green color class for DELIVERED status', () => {
    const { container } = render(<StatusBadge status="DELIVERED" />)
    expect(container.firstChild).toHaveClass('bg-green-100')
  })
})
