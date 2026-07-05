import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActionZone } from './ActionZone';
import type { Shipment } from '@/features/shipper/components/ShipmentStatusPanel';

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

vi.mock('@/features/shipper/hooks/usePreferredCarriers', () => ({
  usePreferredCarriers: () => ({ data: { content: [] } }),
  useRemovePreferredCarrier: () => ({ mutate: vi.fn() }),
}));

function renderActionZone(shipment: Shipment) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ActionZone selectedShipment={shipment} onClear={vi.fn()} />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

describe('ActionZone — Find Carriers deep link (bug fix)', () => {
  // Bug (1): "Find Carriers for This Load" always returned zero carriers because it built the
  // /carriers URL from shipment.origin/destination (city display names, e.g. "Detroit") — the
  // backend's lane search matches on 2-letter STATE CODES and origin was never populated at
  // all. Fix: use shipment.originState instead.
  //
  // Bug (2)/refinement: even with state codes, requiring an exact destination-lane match was
  // too strict (a carrier may have no lane registered to that exact destination). Coming from
  // Shipment Status is a "which carriers could reposition for this pickup" search, not a strict
  // lane match — so only origin + equipment are passed, never destination.
  const shipment: Shipment = {
    loadId: 'load-123',
    status: 'OPEN',
    progress: 0,
    equipment: 'DRY_VAN',
    carrier: null,
    rating: null,
    destination: 'Detroit',
    origin: 'Chicago',
    originState: 'IL',
    destinationState: 'MI',
  };

  it('builds the /carriers query from originState + equipment only — never destination', () => {
    renderActionZone(shipment);

    fireEvent.click(screen.getByTestId('action-zone-find-carriers'));

    expect(mockNavigate).toHaveBeenCalledWith('/carriers?origin=IL&equip=DRY_VAN');
  });

  it('omits the origin param when originState is missing (no blank-string params)', () => {
    renderActionZone({ ...shipment, originState: null as unknown as string });

    fireEvent.click(screen.getByTestId('action-zone-find-carriers'));

    expect(mockNavigate).toHaveBeenCalledWith('/carriers?equip=DRY_VAN');
  });
});
