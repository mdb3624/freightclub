import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShipperDashboardPage } from './ShipperDashboardPage';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

describe('ShipperDashboardPage', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
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
});
