/**
 * Feature: US-848 (Carrier Network Page)
 * AC-1: URL params pre-populate filters + trigger initial search
 * AC-2: Search / Clear filter actions
 * AC-3: Preferred Carriers strip
 * AC-4: Carrier card content + actions
 * AC-5: Slide-in detail panel open/close
 * AC-6: Add/Remove preferred toggle
 * AC-7: Empty state
 * AC-8: Breadcrumb + back navigation
 */
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CarrierNetworkPage } from './CarrierNetworkPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({ user: { id: 'shipper-1' } }),
}));

const mockSearchMutate = vi.fn();
let searchOnSuccessCarriers: unknown[] = [
  { id: 'c1', companyName: 'Acme Freight', email: 'acme@example.com', equipmentTypes: ['Dry Van'], onTimePct: 96 },
  { id: 'c2', companyName: 'Bronco Hauling', email: 'bronco@example.com', equipmentTypes: ['Flatbed'], onTimePct: 88 },
];

vi.mock('@/features/shipper/hooks/useCarrierSearch', () => ({
  useCarrierSearch: () => ({
    mutate: (_params: unknown, opts: { onSuccess?: (r: unknown[]) => void }) => {
      mockSearchMutate(_params);
      opts?.onSuccess?.(searchOnSuccessCarriers);
    },
    isPending: false,
  }),
}));

const preferredCarriersData = { content: [{ carrierId: 'c1' }] };

vi.mock('@/features/shipper/hooks/usePreferredCarriers', () => ({
  usePreferredCarriers: () => ({ data: preferredCarriersData }),
  useAddPreferredCarrier: () => ({ mutate: vi.fn() }),
  useRemovePreferredCarrier: () => ({ mutate: vi.fn() }),
}));

vi.mock('@/features/carriers/hooks/useCarrierProfile', () => ({
  useCarrierProfile: () => ({ data: undefined }),
}));

function renderPage(initialEntries: string[] = ['/carriers']) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <CarrierNetworkPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('CarrierNetworkPage (US-848)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchOnSuccessCarriers = [
      { id: 'c1', companyName: 'Acme Freight', email: 'acme@example.com', equipmentTypes: ['Dry Van'], onTimePct: 96 },
      { id: 'c2', companyName: 'Bronco Hauling', email: 'bronco@example.com', equipmentTypes: ['Flatbed'], onTimePct: 88 },
    ];
  });

  // Per Prototype/ui_kits/shipper/carrier-network.html (source of truth): URL params only
  // pre-populate the filter sidebar — the initial view always shows every carrier, unfiltered.
  // The shipper clicks "Search Carriers" to actually apply origin/destination/equipment.
  it('AC-1: wraps content in ShipperPageLayout, pre-populates filters, and shows all carriers unfiltered on mount', async () => {
    renderPage(['/carriers?origin=TX&dest=CA&equip=Flatbed']);

    // ShipperPageLayout renders with data-testid="carrier-network-page" (overrides the
    // default "shipper-page-layout" id — same prop slot, see ShipperPageLayout.tsx)
    const layoutRoot = screen.getByTestId('carrier-network-page');
    expect(layoutRoot).toBeInTheDocument();
    expect(layoutRoot).toHaveClass('fc-shell');
    expect(screen.getByTestId('shipper-page-header')).toBeInTheDocument();

    // Initial mount search browses all carriers — it does NOT apply the URL-param filters
    await waitFor(() => expect(mockSearchMutate).toHaveBeenCalledWith(
      expect.objectContaining({ origin: '', destination: '', equipmentType: undefined })
    ));
    await waitFor(() => expect(screen.getByTestId('carrier-card-c1')).toBeInTheDocument());
    expect(screen.getByTestId('carrier-card-c2')).toBeInTheDocument();

    // Filter dropdowns are still pre-populated from the URL, ready for the shipper to search
    expect((screen.getByTestId('filter-origin') as HTMLSelectElement).value).toBe('TX');
    expect((screen.getByTestId('filter-dest') as HTMLSelectElement).value).toBe('CA');
    expect((screen.getByTestId('filter-equip') as HTMLSelectElement).value).toBe('Flatbed');
  });

  it('AC-2: Search Carriers triggers search; Clear filters resets filters and re-searches', async () => {
    renderPage(['/carriers?origin=TX']);
    await waitFor(() => expect(mockSearchMutate).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByTestId('search-carriers-btn'));
    await waitFor(() => expect(mockSearchMutate).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getByTestId('clear-filters-btn'));
    await waitFor(() => expect(mockSearchMutate).toHaveBeenCalledTimes(3));
    expect((screen.getByTestId('filter-origin') as HTMLSelectElement).value).toBe('');
  });

  it('AC-3: renders Preferred Carriers strip when preferred carriers exist', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByTestId('preferred-strip-c1')).toBeInTheDocument());
  });

  it('AC-4: carrier card shows name, equipment tags, on-time stat, Get Quote and preferred toggle', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByTestId('carrier-card-c1')).toBeInTheDocument());

    expect(within(screen.getByTestId('carrier-card-c1')).getByText('Acme Freight')).toBeInTheDocument();
    expect(screen.getByTestId('stat-ontime-c1')).toHaveTextContent('96%');
    expect(screen.getByTestId('get-quote-btn-c1')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-preferred-btn-c1')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('get-quote-btn-c1'));
    expect(mockNavigate).toHaveBeenCalledWith('/shipper/quote?carrierId=c1');
  });

  it('AC-5: clicking a carrier card opens the detail panel; close button dismisses it', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByTestId('carrier-card-c2')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('carrier-card-c2'));
    expect(screen.getByTestId('carrier-detail-panel')).toHaveStyle({ transform: 'translateX(0)' });

    fireEvent.click(screen.getByTestId('close-detail-panel-btn'));
    expect(screen.getByTestId('carrier-detail-panel')).toHaveStyle({ transform: 'translateX(100%)' });
  });

  it('AC-6: toggle-preferred button flips preferred badge state optimistically', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByTestId('toggle-preferred-btn-c2')).toBeInTheDocument());

    expect(screen.getByTestId('toggle-preferred-btn-c2')).toHaveTextContent('☆ Add Preferred');
    fireEvent.click(screen.getByTestId('toggle-preferred-btn-c2'));
    expect(screen.getByTestId('toggle-preferred-btn-c2')).toHaveTextContent('★ Preferred');
  });

  it('AC-7: shows empty state message when search returns zero results', async () => {
    searchOnSuccessCarriers = [];
    renderPage();
    await waitFor(() => expect(screen.getByTestId('carriers-empty-state')).toBeInTheDocument());
    expect(screen.getByTestId('carriers-empty-state')).toHaveTextContent(
      'No carriers match your filters. Try widening your search.'
    );
  });

  it('AC-2/BR-3: min on-time filter excludes carriers below the client-side threshold', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByTestId('carrier-card-c2')).toBeInTheDocument());

    // c1 is 96%, c2 is 88% — filtering to 90%+ should drop c2
    fireEvent.click(screen.getByTestId('filter-ontime-90'));
    fireEvent.click(screen.getByTestId('search-carriers-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('carrier-card-c1')).toBeInTheDocument();
      expect(screen.queryByTestId('carrier-card-c2')).not.toBeInTheDocument();
    });
  });

  it('AC-8: breadcrumb link and back button navigate to /dashboard/shipper', async () => {
    renderPage();
    fireEvent.click(screen.getByTestId('breadcrumb-dashboard-link'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/shipper');

    fireEvent.click(screen.getByTestId('back-to-dashboard-btn'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/shipper');
  });
});
