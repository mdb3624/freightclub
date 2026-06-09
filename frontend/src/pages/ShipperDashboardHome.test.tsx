/**
 * US-760 RED phase — failing tests written against the locked spec
 * (docs/hfd/US-760_SHIPPER_DASHBOARD_OVERHAUL_DESIGN_SPEC.md) before
 * ShipperDashboardHome exists. Drives §1 grid/spacing, §2 persona tokens,
 * and §3 component-breakdown requirements per the §7 CODER hand-off checklist.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ShipperDashboardHome } from './ShipperDashboardHome'

const {
  mockNavigate,
  mockUseDashboardSummary,
  mockUseLoadBoard,
  mockUseNotifications,
  mockUseCarrierSearch,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockUseDashboardSummary: vi.fn(),
  mockUseLoadBoard: vi.fn(),
  mockUseNotifications: vi.fn(),
  mockUseCarrierSearch: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/features/shipper/hooks/useDashboardSummary', () => ({
  useDashboardSummary: mockUseDashboardSummary,
}))

vi.mock('@/features/shipper/hooks/useLoadBoard', () => ({
  useLoadBoard: mockUseLoadBoard,
}))

vi.mock('@/features/notifications/hooks/useNotifications', () => ({
  useNotifications: mockUseNotifications,
  useUnreadCount: vi.fn().mockReturnValue({ data: undefined }),
  useMarkRead: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
  useMarkAllRead: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
}))

vi.mock('@/features/shipper/hooks/useCarrierSearch', () => ({
  useCarrierSearch: mockUseCarrierSearch,
}))

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>{children}</BrowserRouter>
  </QueryClientProvider>
)

describe('ShipperDashboardHome (US-760 command center)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseDashboardSummary.mockReturnValue({
      data: {
        activeShipments: { value: 24, label: 'Active Shipments' },
        estimatedCostPerMile: { value: 2, unit: '$', label: 'Est. Cost/Mile' },
        onTimeCarrierPct: { value: 96, unit: '%', label: 'On-Time Carriers' },
      },
    })
    mockUseLoadBoard.mockReturnValue({
      data: {
        loads: [
          { id: 'l1', originCity: 'Chicago', originState: 'IL', destinationCity: 'Dallas', destinationState: 'TX', status: 'IN_TRANSIT', createdAt: '2026-06-08T10:00:00Z' },
          { id: 'l2', originCity: 'Atlanta', originState: 'GA', destinationCity: 'Miami', destinationState: 'FL', status: 'OPEN', createdAt: '2026-06-08T09:00:00Z' },
        ],
        pagination: { page: 0, limit: 8, total: 2 },
      },
    })
    mockUseNotifications.mockReturnValue({
      data: {
        content: [
          { id: 'n1', loadId: 'l1', type: 'LOAD_CLAIMED', message: 'Load 8847 - Carrier Confirmed', read: false, createdAt: '2026-06-08T10:00:00Z' },
          { id: 'n2', loadId: 'l2', type: 'LOAD_CANCELLED', message: 'Load 9011 - Delays - Check Status', read: false, createdAt: '2026-06-08T09:30:00Z' },
        ],
      },
    })
    mockUseCarrierSearch.mockReturnValue({ mutate: vi.fn(), isPending: false, data: undefined })
  })

  // §1 — 12-column grid + spacing tokens
  describe('Grid & spacing (§1)', () => {
    it('renders the dashboard grid container with 12-column grid and density tokens', () => {
      render(<ShipperDashboardHome />, { wrapper: Wrapper })
      const grid = screen.getByTestId('dashboard-grid')
      expect(grid.className).toMatch(/grid-cols-12/)
      expect(grid.className).toMatch(/gap-6/)
      expect(grid.className).toMatch(/p-8/)
    })
  })

  // §2 — persona token mapping (no raw bg-white/text-gray-* on new surfaces)
  describe('Persona tokens (§2)', () => {
    it('applies framed surface persona tokens to every panel — no raw bg-white/text-gray-*', () => {
      render(<ShipperDashboardHome />, { wrapper: Wrapper })
      const panels = [
        screen.getByTestId('kpi-tile-activeShipments'),
        screen.getByTestId('quick-action-panel'),
        screen.getByTestId('shipment-status-feed'),
        screen.getByTestId('carrier-search-panel'),
        screen.getByTestId('messages-alerts-panel'),
      ]
      for (const panel of panels) {
        expect(panel.className).toMatch(/bg-shipper-surface/)
        expect(panel.className).toMatch(/border-shipper-accent/)
        expect(panel.className).not.toMatch(/bg-white\b/)
        expect(panel.className).not.toMatch(/text-gray-/)
      }
    })
  })

  // §3.1 — KPI Tiles
  describe('KPI Tiles (§3.1)', () => {
    it('renders three KPI tiles with accessible group semantics and formatted values', () => {
      render(<ShipperDashboardHome />, { wrapper: Wrapper })

      const active = screen.getByTestId('kpi-tile-activeShipments')
      expect(active).toHaveAttribute('role', 'group')
      expect(active).toHaveAttribute('aria-label', expect.stringContaining('Active Shipments: 24'))
      expect(screen.getByText('24')).toBeInTheDocument()

      const costPerMile = screen.getByTestId('kpi-tile-estimatedCostPerMile')
      expect(costPerMile).toHaveAttribute('aria-label', expect.stringContaining('Est. Cost/Mile: $2'))

      const onTime = screen.getByTestId('kpi-tile-onTimeCarrierPct')
      expect(onTime).toHaveAttribute('aria-label', expect.stringContaining('On-Time Carriers: 96%'))
    })
  })

  // §3.2 — Quick Action Panel
  describe('Quick Action Panel (§3.2)', () => {
    it('renders all four actions with unique testids and navigates to the correct routes', async () => {
      const user = userEvent.setup()
      render(<ShipperDashboardHome />, { wrapper: Wrapper })

      await user.click(screen.getByTestId('qap-post-load-btn'))
      expect(mockNavigate).toHaveBeenCalledWith('/shipper/loads/new')

      await user.click(screen.getByTestId('qap-get-quote-btn'))
      expect(mockNavigate).toHaveBeenCalledWith('/shipper/quote')

      await user.click(screen.getByTestId('qap-track-shipments-btn'))
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/shipper/loads?view=active')

      await user.click(screen.getByTestId('qap-preferred-carriers-btn'))
      expect(mockNavigate).toHaveBeenCalledWith('/settings/preferred-carriers')
    })

    it('renders action buttons with bronze fill and dark-on-bronze text per the ARCH contrast ruling (§8 Item 5)', () => {
      render(<ShipperDashboardHome />, { wrapper: Wrapper })
      const postLoadBtn = screen.getByTestId('qap-post-load-btn')
      // Bronze fill applied via inline gradient style; verify dark-on-bronze text (ARCH §8 Item 5)
      expect(postLoadBtn.className).toMatch(/text-shipper-text\b/)
      expect(postLoadBtn.className).not.toMatch(/text-white/)
      expect(postLoadBtn).toHaveStyle('border: 1px solid #7A5F3A')
    })
  })

  // §3.3 — Shipment Status Feed
  describe('Shipment Status Feed (§3.3)', () => {
    it('renders a live region feed of recent loads with route, status, and a link to the full load board', () => {
      render(<ShipperDashboardHome />, { wrapper: Wrapper })
      const feed = screen.getByTestId('shipment-status-feed')
      expect(feed).toHaveAttribute('role', 'feed')
      expect(feed).toHaveAttribute('aria-label', 'Shipment status feed')

      expect(screen.getByText(/Chicago, IL/)).toBeInTheDocument()
      expect(screen.getByText(/Dallas, TX/)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /view all/i })).toHaveAttribute('href', '/dashboard/shipper/loads')
    })
  })

  // §3.4 — Carrier Search Panel
  describe('Carrier Search Panel (§3.4)', () => {
    it('requires origin and destination before submit (Zod validation) and submits via useCarrierSearch', async () => {
      const user = userEvent.setup()
      const mutate = vi.fn()
      mockUseCarrierSearch.mockReturnValue({ mutate, isPending: false, data: undefined })
      render(<ShipperDashboardHome />, { wrapper: Wrapper })

      await user.click(screen.getByTestId('carrier-search-submit-btn'))
      expect(await screen.findByText(/origin is required/i)).toBeInTheDocument()
      expect(mutate).not.toHaveBeenCalled()

      await user.type(screen.getByTestId('carrier-search-origin-input'), 'Chicago, IL')
      await user.type(screen.getByTestId('carrier-search-destination-input'), 'Dallas, TX')
      await user.click(screen.getByTestId('carrier-search-submit-btn'))

      expect(mutate).toHaveBeenCalledWith(
        expect.objectContaining({ origin: 'Chicago, IL', destination: 'Dallas, TX' })
      )
    })
  })

  // §3.5 — Messages & Alerts
  describe('Messages & Alerts (§3.5)', () => {
    it('renders an aria-live log of notifications reusing the notifications feature verbatim', () => {
      render(<ShipperDashboardHome />, { wrapper: Wrapper })
      const log = screen.getByTestId('messages-alerts-panel')
      expect(log).toHaveAttribute('role', 'log')
      expect(log).toHaveAttribute('aria-live', 'polite')

      expect(screen.getByText('Load 8847 - Carrier Confirmed')).toBeInTheDocument()
      expect(screen.getByText('Load 9011 - Delays - Check Status')).toBeInTheDocument()
    })
  })
})
