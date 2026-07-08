import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CarrierProfilePage } from '../CarrierProfilePage'

vi.mock('@/features/profile/hooks/useProfile', () => ({
  useProfile: () => ({
    data: {
      firstName: 'Jake', lastName: 'Morrison', phone: '(512) 555-0182', email: 'jake@example.com',
      equipmentType: 'DRY_VAN', equipmentYear: '2019', equipmentMake: 'Freightliner', equipmentModel: 'Cascadia',
      licensePlate: 'TX-4821', vin: '', dotNumber: 'TX-4821', mcNumber: 'MC-772341',
      cdlClass: 'CLASS_A', cdlExpiry: '2027-08-15',
      insuranceCarrier: 'Progressive Commercial', insuranceExpiry: '2026-10-01', medCardExpiry: '2026-12-01',
    },
    isLoading: false,
    error: null,
  }),
}))
vi.mock('@/features/profile/hooks/useUpdateProfile', () => ({
  useUpdateProfile: () => ({ mutate: vi.fn(), isPending: false }),
}))
vi.mock('@/features/carrier/hooks/useCarrierProfile', () => ({
  useLanes: () => ({ data: [], isLoading: false }),
}))

describe('CarrierProfilePage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the Identity tab by default with the profile data pre-filled', async () => {
    render(<MemoryRouter><CarrierProfilePage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByTestId('identity-first-name-input')).toHaveValue('Jake'))
    expect(screen.getByTestId('identity-last-name-input')).toHaveValue('Morrison')
  })
})
