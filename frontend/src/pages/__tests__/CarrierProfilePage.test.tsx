import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
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

  it('switches to the Equipment tab when clicked', async () => {
    render(<MemoryRouter><CarrierProfilePage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByTestId('identity-first-name-input')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('tab-equipment'))
    expect(screen.getByTestId('equipment-type-select')).toHaveValue('DRY_VAN')
  })

  it('shows a confirmation sheet before committing an equipment type change', async () => {
    render(<MemoryRouter><CarrierProfilePage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByTestId('identity-first-name-input')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('tab-equipment'))

    fireEvent.change(screen.getByTestId('equipment-type-select'), { target: { value: 'FLATBED' } })
    expect(screen.getByText(/Change equipment type/)).toBeInTheDocument()
    expect(screen.getByTestId('equipment-type-select')).toHaveValue('DRY_VAN') // unchanged until confirmed

    fireEvent.click(screen.getByTestId('equip-confirm-yes-btn'))
    expect(screen.getByTestId('equipment-type-select')).toHaveValue('FLATBED')
    expect(screen.queryByText(/Change equipment type/)).not.toBeInTheDocument()
  })

  it('cancelling the equipment-change sheet leaves the original type selected', async () => {
    render(<MemoryRouter><CarrierProfilePage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByTestId('identity-first-name-input')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('tab-equipment'))

    fireEvent.change(screen.getByTestId('equipment-type-select'), { target: { value: 'FLATBED' } })
    fireEvent.click(screen.getByTestId('equip-confirm-cancel-btn'))
    expect(screen.getByTestId('equipment-type-select')).toHaveValue('DRY_VAN')
  })
})
