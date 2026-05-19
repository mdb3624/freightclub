import { render, screen } from '@testing-library/react'
import { SummaryStrip } from './SummaryStrip'

describe('SummaryStrip', () => {
  it('displays load status counts with color coding', () => {
    render(
      <SummaryStrip
        open={12}
        claimed={8}
        inTransit={3}
        delivered={42}
      />
    )

    expect(screen.getByText('OPEN')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('CLAIMED')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('IN TRANSIT')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('DELIVERED')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })
})
