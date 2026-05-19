import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ShipperDashboard } from './ShipperDashboard'

const mockUseLoadStats = vi.fn()
const mockUseLoadBoard = vi.fn()
const mockNavigate = vi.fn()

vi.mock('@/features/shipper/hooks/useLoadStats', () => ({
  useLoadStats: mockUseLoadStats,
}))

vi.mock('@/features/shipper/hooks/useLoadBoard', () => ({
  useLoadBoard: mockUseLoadBoard,
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
})

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>{children}</BrowserRouter>
  </QueryClientProvider>
)

describe('ShipperDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseLoadStats.mockReturnValue({
      data: {
        active: { open: 5, claimed: 2, inTransit: 1, delivered: 10 },
      },
    })
    mockUseLoadBoard.mockReturnValue({
      data: {
        loads: [
          { id: '1', loadId: 'LOAD-001', destination: 'Denver, CO', status: 'OPEN' },
          { id: '2', loadId: 'LOAD-002', destination: 'Phoenix, AZ', status: 'CLAIMED' },
        ],
        pagination: { total: 2 },
      },
    })
  })

  it('renders dashboard header', () => {
    render(<ShipperDashboard />, { wrapper: Wrapper })
    expect(screen.getByText('Shipper Dashboard')).toBeInTheDocument()
  })

  it('renders active and all loads tabs', () => {
    render(<ShipperDashboard />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /Active Loads/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /All Loads/i })).toBeInTheDocument()
  })

  it('renders post load button', () => {
    render(<ShipperDashboard />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /Post Load/i })).toBeInTheDocument()
  })

  it('renders load table when loads exist', () => {
    render(<ShipperDashboard />, { wrapper: Wrapper })
    expect(screen.getByText('LOAD-001')).toBeInTheDocument()
    expect(screen.getByText('LOAD-002')).toBeInTheDocument()
  })

  it('renders empty state when no loads', () => {
    mockUseLoadBoard.mockReturnValue({
      data: {
        loads: [],
        pagination: { total: 0 },
      },
    })
    render(<ShipperDashboard />, { wrapper: Wrapper })
    expect(screen.getByText('No loads yet.')).toBeInTheDocument()
  })

  it('renders pagination when loads exist', () => {
    render(<ShipperDashboard />, { wrapper: Wrapper })
    expect(screen.getByText(/Page 1 of/)).toBeInTheDocument()
  })

  it('renders search bar', () => {
    render(<ShipperDashboard />, { wrapper: Wrapper })
    expect(screen.getByPlaceholderText(/Search by Load ID/)).toBeInTheDocument()
  })

  it('calls navigate when post load button is clicked', async () => {
    const user = userEvent.setup()
    render(<ShipperDashboard />, { wrapper: Wrapper })
    const postButton = screen.getAllByRole('button', { name: /Post Load/i })[0]
    await user.click(postButton)
    expect(mockNavigate).toHaveBeenCalledWith('/shipper/loads/new')
  })
})
