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
    const bg = (container.firstChild as HTMLElement).style.background
    expect(bg === '#DBEAFE' || bg === 'rgb(219, 234, 254)').toBe(true)
  })

  it('applies red background style for CANCELLED status', () => {
    const { container } = render(<StatusBadge status="CANCELLED" />)
    const bg = (container.firstChild as HTMLElement).style.background
    expect(bg === '#FEE2E2' || bg === 'rgb(254, 226, 226)').toBe(true)
  })

  it('applies green background style for DELIVERED status', () => {
    const { container } = render(<StatusBadge status="DELIVERED" />)
    const bg = (container.firstChild as HTMLElement).style.background
    expect(bg === '#DCFCE7' || bg === 'rgb(220, 252, 231)').toBe(true)
  })
})
