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

  it('applies blue background style for OPEN status', () => {
    const { container } = render(<StatusBadge status="OPEN" />)
    expect((container.firstChild as HTMLElement).style.background).toBe('#DBEAFE')
  })

  it('applies red background style for CANCELLED status', () => {
    const { container } = render(<StatusBadge status="CANCELLED" />)
    expect((container.firstChild as HTMLElement).style.background).toBe('#FEE2E2')
  })

  it('applies green background style for DELIVERED status', () => {
    const { container } = render(<StatusBadge status="DELIVERED" />)
    expect((container.firstChild as HTMLElement).style.background).toBe('#DCFCE7')
  })
})
