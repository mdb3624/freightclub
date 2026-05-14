import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { ProfileCompletionBanner } from '../components/ProfileCompletionBanner'
import * as shipperHooks from '../hooks/useShipperProfile'

vi.mock('../hooks/useShipperProfile')

const mockedHooks = shipperHooks as unknown as Record<string, ReturnType<typeof vi.fn>>

const renderWithRouter = (component: React.ReactNode) =>
  render(<BrowserRouter>{component}</BrowserRouter>)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ProfileCompletionBanner', () => {
  it('does not render when profile is 80% or more complete', () => {
    mockedHooks.useProfileCompleteness.mockReturnValue({
      data: {
        completenessPercent: 85,
        isPublishReady: true,
        remainingFields: [],
      },
      isLoading: false,
    })

    const { container } = renderWithRouter(<ProfileCompletionBanner />)
    expect(container.firstChild).toBeNull()
  })

  it('renders banner when profile is incomplete', () => {
    mockedHooks.useProfileCompleteness.mockReturnValue({
      data: {
        completenessPercent: 40,
        isPublishReady: false,
        remainingFields: ['companyName', 'city', 'state', 'zipCode'],
      },
      isLoading: false,
    })

    renderWithRouter(<ProfileCompletionBanner />)
    expect(screen.getByText(/Finish your setup/i)).toBeInTheDocument()
    expect(screen.getByText(/40% complete/i)).toBeInTheDocument()
  })

  it('shows remaining field count', () => {
    mockedHooks.useProfileCompleteness.mockReturnValue({
      data: {
        completenessPercent: 40,
        isPublishReady: false,
        remainingFields: ['companyName', 'city', 'state', 'zipCode'],
      },
      isLoading: false,
    })

    renderWithRouter(<ProfileCompletionBanner />)
    expect(screen.getByText(/4 fields remaining/i)).toBeInTheDocument()
  })

  it('displays first 3 remaining fields with "and X more" if more than 3', () => {
    mockedHooks.useProfileCompleteness.mockReturnValue({
      data: {
        completenessPercent: 40,
        isPublishReady: false,
        remainingFields: ['companyName', 'city', 'state', 'zipCode', 'mcNumber'],
      },
      isLoading: false,
    })

    renderWithRouter(<ProfileCompletionBanner />)
    expect(screen.getByText('companyName')).toBeInTheDocument()
    expect(screen.getByText('city')).toBeInTheDocument()
    expect(screen.getByText('state')).toBeInTheDocument()
    expect(screen.getByText('and 2 more...')).toBeInTheDocument()
  })

  it('links to profile completion page', () => {
    mockedHooks.useProfileCompleteness.mockReturnValue({
      data: {
        completenessPercent: 40,
        isPublishReady: false,
        remainingFields: ['companyName'],
      },
      isLoading: false,
    })

    renderWithRouter(<ProfileCompletionBanner />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/shipper/profile')
  })

  it('has accessible progress bar', () => {
    mockedHooks.useProfileCompleteness.mockReturnValue({
      data: {
        completenessPercent: 60,
        isPublishReady: false,
        remainingFields: ['city'],
      },
      isLoading: false,
    })

    renderWithRouter(<ProfileCompletionBanner />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '60')
    expect(progressBar).toHaveAttribute('aria-valuemin', '0')
    expect(progressBar).toHaveAttribute('aria-valuemax', '100')
  })

  it('is marked as alert for screen readers', () => {
    mockedHooks.useProfileCompleteness.mockReturnValue({
      data: {
        completenessPercent: 40,
        isPublishReady: false,
        remainingFields: ['companyName'],
      },
      isLoading: false,
    })

    renderWithRouter(<ProfileCompletionBanner />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('aria-live', 'polite')
  })
})
