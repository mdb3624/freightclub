import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ShipperProfileForm } from '../components/ShipperProfileForm'
import * as shipperHooks from '../hooks/useShipperProfile'

vi.mock('../hooks/useShipperProfile')

const mockedHooks = shipperHooks as unknown as Record<string, ReturnType<typeof vi.fn>>

const mockShipperProfile = {
  id: 'profile-1',
  companyName: 'Apex Freight',
  billingEmail: 'billing@apex.com',
  phoneNumber: '(512) 555-0182',
  city: 'Austin',
  state: 'TX',
  zipCode: '78701',
  mcNumber: '123456',
  usdotNumber: '',
  logoUrl: '',
  completenessPercent: 85,
  createdAt: '2026-05-13T10:00:00Z',
  updatedAt: '2026-05-13T10:00:00Z',
}

const mockMutate = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  mockedHooks.useShipperProfile.mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
  })
  mockedHooks.useSaveShipperProfile.mockReturnValue({
    mutate: mockMutate,
    isPending: false,
    error: null,
  })
  mockedHooks.useUpdateShipperProfile.mockReturnValue({
    mutate: mockMutate,
    isPending: false,
    error: null,
  })
})

describe('ShipperProfileForm — new profile', () => {
  it('renders all form fields', () => {
    render(<ShipperProfileForm />)
    expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Billing Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/City/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/State/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ZIP Code/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/MC Number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/USDOT Number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Logo URL/i)).toBeInTheDocument()
  })

  it('calls useSaveShipperProfile on submit with valid data', async () => {
    const user = userEvent.setup()
    render(<ShipperProfileForm />)

    await user.type(screen.getByLabelText(/Company Name/i), 'Apex Freight')
    await user.type(screen.getByLabelText(/Billing Email/i), 'billing@apex.com')
    await user.type(screen.getByLabelText(/Phone Number/i), '(512) 555-0182')
    await user.type(screen.getByLabelText(/City/i), 'Austin')
    await user.type(screen.getByLabelText(/State/i), 'TX')
    await user.type(screen.getByLabelText(/ZIP Code/i), '78701')

    await user.click(screen.getByRole('button', { name: /Save Profile/i }))

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        companyName: 'Apex Freight',
        billingEmail: 'billing@apex.com',
        phoneNumber: '(512) 555-0182',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        mcNumber: '',
        usdotNumber: '',
        logoUrl: '',
      })
    })
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<ShipperProfileForm />)

    await user.type(screen.getByLabelText(/Company Name/i), 'Apex Freight')
    await user.type(screen.getByLabelText(/Billing Email/i), 'invalid-email')
    await user.type(screen.getByLabelText(/Phone Number/i), '(512) 555-0182')
    await user.type(screen.getByLabelText(/City/i), 'Austin')
    await user.type(screen.getByLabelText(/State/i), 'TX')
    await user.type(screen.getByLabelText(/ZIP Code/i), '78701')

    await user.click(screen.getByRole('button', { name: /Save Profile/i }))

    await waitFor(() => {
      expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid phone format', async () => {
    const user = userEvent.setup()
    render(<ShipperProfileForm />)

    await user.type(screen.getByLabelText(/Company Name/i), 'Apex Freight')
    await user.type(screen.getByLabelText(/Billing Email/i), 'billing@apex.com')
    await user.type(screen.getByLabelText(/Phone Number/i), '512-555-0182')
    await user.type(screen.getByLabelText(/City/i), 'Austin')
    await user.type(screen.getByLabelText(/State/i), 'TX')
    await user.type(screen.getByLabelText(/ZIP Code/i), '78701')

    await user.click(screen.getByRole('button', { name: /Save Profile/i }))

    await waitFor(() => {
      expect(screen.getByText(/Phone format/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid state code', async () => {
    const user = userEvent.setup()
    render(<ShipperProfileForm />)

    await user.type(screen.getByLabelText(/Company Name/i), 'Apex Freight')
    await user.type(screen.getByLabelText(/Billing Email/i), 'billing@apex.com')
    await user.type(screen.getByLabelText(/Phone Number/i), '(512) 555-0182')
    await user.type(screen.getByLabelText(/City/i), 'Austin')
    await user.type(screen.getByLabelText(/State/i), 'Texas')
    await user.type(screen.getByLabelText(/ZIP Code/i), '78701')

    await user.click(screen.getByRole('button', { name: /Save Profile/i }))

    await waitFor(() => {
      expect(screen.getByText(/valid 2-letter code/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid ZIP code', async () => {
    const user = userEvent.setup()
    render(<ShipperProfileForm />)

    await user.type(screen.getByLabelText(/Company Name/i), 'Apex Freight')
    await user.type(screen.getByLabelText(/Billing Email/i), 'billing@apex.com')
    await user.type(screen.getByLabelText(/Phone Number/i), '(512) 555-0182')
    await user.type(screen.getByLabelText(/City/i), 'Austin')
    await user.type(screen.getByLabelText(/State/i), 'TX')
    await user.type(screen.getByLabelText(/ZIP Code/i), '7870')

    await user.click(screen.getByRole('button', { name: /Save Profile/i }))

    await waitFor(() => {
      expect(screen.getByText(/5 digits/i)).toBeInTheDocument()
    })
  })
})

describe('ShipperProfileForm — existing profile', () => {
  it('loads existing profile data on mount', async () => {
    mockedHooks.useShipperProfile.mockReturnValue({
      data: mockShipperProfile,
      isLoading: false,
      error: null,
    })

    render(<ShipperProfileForm />)

    await waitFor(() => {
      expect((screen.getByLabelText(/Company Name/i) as HTMLInputElement).value).toBe('Apex Freight')
      expect((screen.getByLabelText(/Billing Email/i) as HTMLInputElement).value).toBe('billing@apex.com')
      expect((screen.getByLabelText(/Phone Number/i) as HTMLInputElement).value).toBe('(512) 555-0182')
    })
  })

  it('calls useUpdateShipperProfile on submit for existing profile', async () => {
    mockedHooks.useShipperProfile.mockReturnValue({
      data: mockShipperProfile,
      isLoading: false,
      error: null,
    })
    const mockUpdateMutate = vi.fn()
    mockedHooks.useUpdateShipperProfile.mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
      error: null,
    })

    const user = userEvent.setup()
    render(<ShipperProfileForm />)

    // Clear and update company name
    const companyInput = screen.getByLabelText(/Company Name/i) as HTMLInputElement
    await user.clear(companyInput)
    await user.type(companyInput, 'New Company Name')

    await user.click(screen.getByRole('button', { name: /Save Profile/i }))

    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalled()
    })
  })

  it('disables fields while saving', () => {
    mockedHooks.useSaveShipperProfile.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      error: null,
    })

    render(<ShipperProfileForm />)

    expect((screen.getByLabelText(/Company Name/i) as HTMLInputElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: /Saving/i }) as HTMLButtonElement).disabled).toBe(true)
  })
})
