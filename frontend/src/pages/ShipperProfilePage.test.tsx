import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { ShipperProfilePage } from './ShipperProfilePage'
import * as shipperHooks from '@/features/shipper/hooks/useShipperProfile'

vi.mock('@/features/shipper/hooks/useShipperProfile')
vi.mock('@/features/shipper/components/ShipperProfileForm', () => ({
  ShipperProfileForm: () => <div data-testid="shipper-form">Form Component</div>,
}))
vi.mock('@/components/AppShell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const mockedHooks = shipperHooks as unknown as Record<string, ReturnType<typeof vi.fn>>

const renderWithRouter = (component: React.ReactNode) =>
  render(<BrowserRouter>{component}</BrowserRouter>)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ShipperProfilePage', () => {
  it('renders header and form', () => {
    mockedHooks.useProfileCompleteness.mockReturnValue({
      data: {
        completenessPercent: 40,
        isPublishReady: false,
        remainingFields: ['companyName'],
      },
      isLoading: false,
    })

    renderWithRouter(<ShipperProfilePage />)
    expect(screen.getByText('Company Profile')).toBeInTheDocument()
    expect(screen.getByTestId('shipper-form')).toBeInTheDocument()
  })

  it('shows completeness percentage', () => {
    mockedHooks.useProfileCompleteness.mockReturnValue({
      data: {
        completenessPercent: 60,
        isPublishReady: false,
        remainingFields: ['city', 'state'],
      },
      isLoading: false,
    })

    renderWithRouter(<ShipperProfilePage />)
    expect(screen.getByText('60%')).toBeInTheDocument()
  })

  it('shows success message when profile is complete', () => {
    mockedHooks.useProfileCompleteness.mockReturnValue({
      data: {
        completenessPercent: 100,
        isPublishReady: true,
        remainingFields: [],
      },
      isLoading: false,
    })

    renderWithRouter(<ShipperProfilePage />)
    expect(screen.getByText(/profile is complete/i)).toBeInTheDocument()
  })

  it('shows remaining fields when incomplete', () => {
    mockedHooks.useProfileCompleteness.mockReturnValue({
      data: {
        completenessPercent: 40,
        isPublishReady: false,
        remainingFields: ['companyName', 'city'],
      },
      isLoading: false,
    })

    renderWithRouter(<ShipperProfilePage />)
    expect(screen.getByText(/Complete the following fields/i)).toBeInTheDocument()
    expect(screen.getByText('companyName')).toBeInTheDocument()
    expect(screen.getByText('city')).toBeInTheDocument()
  })


  it('has back button', () => {
    mockedHooks.useProfileCompleteness.mockReturnValue({
      data: {
        completenessPercent: 40,
        isPublishReady: false,
        remainingFields: [],
      },
      isLoading: false,
    })

    renderWithRouter(<ShipperProfilePage />)
    const backButton = screen.getByText(/Back/)
    expect(backButton).toBeInTheDocument()
  })
})
