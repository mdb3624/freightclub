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
  useLanes: () => ({
    data: [{ id: 'lane-1', originRegion: 'TX', destinationRegion: 'FL', frequencyPreference: 'ANY', status: 'ACTIVE', createdAt: '2026-01-01' }],
    isLoading: false,
  }),
}))
vi.mock('@/features/carrier/api', () => ({
  carrierApi: {
    lanes: {
      add: vi.fn().mockResolvedValue({ id: 'lane-2', originRegion: 'CA', destinationRegion: 'NY', frequencyPreference: 'ANY', status: 'ACTIVE', createdAt: '2026-01-02' }),
      update: vi.fn().mockResolvedValue({ id: 'lane-1', originRegion: 'TX', destinationRegion: 'FL', frequencyPreference: 'ANY', status: 'ACTIVE', createdAt: '2026-01-01' }),
    },
  },
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

  it('renders the Creds tab with DOT/MC/CDL/insurance fields pre-filled', async () => {
    render(<MemoryRouter><CarrierProfilePage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByTestId('identity-first-name-input')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('tab-credentials'))
    expect(screen.getByTestId('creds-dot-input')).toHaveValue('TX-4821')
    expect(screen.getByTestId('creds-mc-input')).toHaveValue('MC-772341')
    expect(screen.getByTestId('creds-cdl-class-select')).toHaveValue('CLASS_A')
    expect(screen.getByTestId('creds-cdl-expiry-input')).toHaveValue('2027-08-15')
    expect(screen.getByTestId('creds-insurance-carrier-input')).toHaveValue('Progressive Commercial')
  })

  it('shows a credential warning banner when a credential is expiring soon', async () => {
    vi.doMock('@/features/profile/hooks/useProfile', () => ({
      useProfile: () => ({
        data: {
          firstName: 'Jake', lastName: 'Morrison', phone: '', email: 'jake@example.com',
          equipmentType: 'DRY_VAN', dotNumber: '', mcNumber: '',
          cdlClass: 'CLASS_A', cdlExpiry: new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10),
          insuranceCarrier: '', insuranceExpiry: '', medCardExpiry: '',
        },
        isLoading: false, error: null,
      }),
    }))
    const { CarrierProfilePage: FreshPage } = await import('../CarrierProfilePage')
    render(<MemoryRouter><FreshPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText(/expire.*soon/)).toBeInTheDocument())
  })

  it('renders the Lanes tab with up to 3 rows, pre-filled from existing lanes', async () => {
    render(<MemoryRouter><CarrierProfilePage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByTestId('identity-first-name-input')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('tab-lanes'))
    await waitFor(() => expect(screen.getByTestId('lane-1-origin-select')).toHaveValue('TX'))
    expect(screen.getByTestId('lane-1-destination-select')).toHaveValue('FL')
    expect(screen.getByTestId('lane-2-origin-select')).toHaveValue('')
    expect(screen.getByTestId('lane-3-origin-select')).toHaveValue('')
    // exactly 3 rows, never a 4th "add lane" row
    expect(screen.queryByTestId('lane-4-origin-select')).not.toBeInTheDocument()
  })
})
