import { render, screen } from '@testing-library/react'
import { LoadTable } from './LoadTable'

describe('LoadTable', () => {
  const mockLoads = [
    {
      id: 'LOAD-001',
      originCity: 'San Jose',
      originState: 'CA',
      destinationCity: 'Phoenix',
      destinationState: 'AZ',
      pickupEarliest: '2026-05-20T08:00',
      pickupLatest: '2026-05-20T17:00',
      status: 'OPEN',
      payAmount: 1200,
      payUnit: 'flat',
      claimedByTruckerName: null,
      createdAt: '2026-05-19T10:30:00Z',
    },
  ]

  it('renders load table with correct columns', () => {
    render(
      <LoadTable
        loads={mockLoads}
        onSort={() => {}}
        onViewDetails={() => {}}
        onEdit={() => {}}
        onCancel={() => {}}
        currentSort="pickupDate"
        currentOrder="asc"
      />
    )

    expect(screen.getByText('LOAD-001')).toBeInTheDocument()
    expect(screen.getByText('San Jose, CA')).toBeInTheDocument()
    expect(screen.getByText('Phoenix, AZ')).toBeInTheDocument()
    expect(screen.getByText('OPEN')).toBeInTheDocument()
  })
})
