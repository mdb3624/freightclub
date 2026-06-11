import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { QuickActionsPanel } from './QuickActionsPanel';

describe('QuickActionsPanel', () => {
  it('renders four action buttons with correct labels', () => {
    const mockHandlers = {
      onPostLoad: vi.fn(),
      onGetQuote: vi.fn(),
      onTrackShipments: vi.fn(),
      onPreferredCarriers: vi.fn(),
    };

    render(<QuickActionsPanel {...mockHandlers} />);

    expect(screen.getByTestId('quick-actions-post-load')).toHaveTextContent('Post Load');
    expect(screen.getByTestId('quick-actions-quote')).toHaveTextContent('Get A Quote');
    expect(screen.getByTestId('quick-actions-track')).toHaveTextContent('Track Shipments');
    expect(screen.getByTestId('quick-actions-carriers')).toHaveTextContent('Preferred Carriers');
  });

  it('calls onPostLoad handler when Post Load button is clicked', async () => {
    const user = userEvent.setup();
    const mockHandlers = {
      onPostLoad: vi.fn(),
      onGetQuote: vi.fn(),
      onTrackShipments: vi.fn(),
      onPreferredCarriers: vi.fn(),
    };

    render(<QuickActionsPanel {...mockHandlers} />);

    await user.click(screen.getByTestId('quick-actions-post-load'));

    expect(mockHandlers.onPostLoad).toHaveBeenCalledTimes(1);
  });

  it('calls onGetQuote handler when Get A Quote button is clicked', async () => {
    const user = userEvent.setup();
    const mockHandlers = {
      onPostLoad: vi.fn(),
      onGetQuote: vi.fn(),
      onTrackShipments: vi.fn(),
      onPreferredCarriers: vi.fn(),
    };

    render(<QuickActionsPanel {...mockHandlers} />);

    await user.click(screen.getByTestId('quick-actions-quote'));

    expect(mockHandlers.onGetQuote).toHaveBeenCalledTimes(1);
  });

  it('calls onTrackShipments handler when Track Shipments button is clicked', async () => {
    const user = userEvent.setup();
    const mockHandlers = {
      onPostLoad: vi.fn(),
      onGetQuote: vi.fn(),
      onTrackShipments: vi.fn(),
      onPreferredCarriers: vi.fn(),
    };

    render(<QuickActionsPanel {...mockHandlers} />);

    await user.click(screen.getByTestId('quick-actions-track'));

    expect(mockHandlers.onTrackShipments).toHaveBeenCalledTimes(1);
  });

  it('calls onPreferredCarriers handler when Preferred Carriers button is clicked', async () => {
    const user = userEvent.setup();
    const mockHandlers = {
      onPostLoad: vi.fn(),
      onGetQuote: vi.fn(),
      onTrackShipments: vi.fn(),
      onPreferredCarriers: vi.fn(),
    };

    render(<QuickActionsPanel {...mockHandlers} />);

    await user.click(screen.getByTestId('quick-actions-carriers'));

    expect(mockHandlers.onPreferredCarriers).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when isLoading is true', () => {
    const mockHandlers = {
      onPostLoad: vi.fn(),
      onGetQuote: vi.fn(),
      onTrackShipments: vi.fn(),
      onPreferredCarriers: vi.fn(),
    };

    render(
      <QuickActionsPanel
        {...mockHandlers}
        isLoading={true}
        loadingButtonId="quick-actions-post-load"
      />
    );

    expect(screen.getByTestId('quick-actions-post-load')).toBeDisabled();
    expect(screen.getByTestId('quick-actions-quote')).not.toBeDisabled();
  });

  it('renders spinner inside button when loading', () => {
    const mockHandlers = {
      onPostLoad: vi.fn(),
      onGetQuote: vi.fn(),
      onTrackShipments: vi.fn(),
      onPreferredCarriers: vi.fn(),
    };

    render(
      <QuickActionsPanel
        {...mockHandlers}
        isLoading={true}
        loadingButtonId="quick-actions-post-load"
      />
    );

    const loadingButton = screen.getByTestId('quick-actions-post-load');
    expect(loadingButton.querySelector('.spinner')).toBeInTheDocument();
  });

  it('renders with correct panel container attributes', () => {
    const mockHandlers = {
      onPostLoad: vi.fn(),
      onGetQuote: vi.fn(),
      onTrackShipments: vi.fn(),
      onPreferredCarriers: vi.fn(),
    };

    render(<QuickActionsPanel {...mockHandlers} />);

    const panel = screen.getByTestId('dashboard-quick-actions-panel');
    expect(panel).toHaveAttribute('role', 'region');
    expect(panel).toHaveAttribute('aria-label', 'Quick Actions');
  });
});
