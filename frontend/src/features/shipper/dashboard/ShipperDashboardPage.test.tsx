import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ShipperDashboardPage } from './ShipperDashboardPage';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock('../../../notifications/hooks/useNotifications', () => ({
  useNotifications: vi.fn(() => ({
    data: { content: [] },
    isLoading: false,
    error: null,
  })),
  useMarkRead: vi.fn(() => ({
    mutate: vi.fn(),
  })),
}));

describe('ShipperDashboardPage', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{component}</BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('renders QuickActionsPanel in col-span-4 grid slot', () => {
    renderWithRouter(<ShipperDashboardPage />);

    const quickActionsPanel = screen.getByTestId('dashboard-quick-actions-panel');
    expect(quickActionsPanel).toBeInTheDocument();
    expect(quickActionsPanel).toHaveClass('col-span-4');
  });

  it('QuickActionsPanel buttons are in the DOM and clickable', () => {
    renderWithRouter(<ShipperDashboardPage />);

    const postLoadButton = screen.getByTestId('quick-actions-post-load');
    expect(postLoadButton).toBeInTheDocument();
    expect(postLoadButton.tagName).toBe('BUTTON');
  });

  it('renders Shipment Status panel placeholder', () => {
    renderWithRouter(<ShipperDashboardPage />);

    const statusPanel = screen.getByTestId('dashboard-shipment-status-panel');
    expect(statusPanel).toBeInTheDocument();
    expect(statusPanel).toHaveClass('col-span-8');
  });

  it('renders all four quick action buttons', () => {
    renderWithRouter(<ShipperDashboardPage />);

    expect(screen.getByTestId('quick-actions-post-load')).toBeInTheDocument();
    expect(screen.getByTestId('quick-actions-quote')).toBeInTheDocument();
    expect(screen.getByTestId('quick-actions-track')).toBeInTheDocument();
    expect(screen.getByTestId('quick-actions-carriers')).toBeInTheDocument();
  });

  it('renders MessagesAlertsPanel in col-span-7 grid slot', () => {
    renderWithRouter(<ShipperDashboardPage />);

    const messagesPanel = screen.getByTestId('dashboard-messages-alerts-panel');
    expect(messagesPanel).toBeInTheDocument();
    expect(messagesPanel).toHaveClass('col-span-7');
  });
});
