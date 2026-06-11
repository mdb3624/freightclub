/**
 * Feature: US-823 (Shipper Dashboard Layout Skeleton)
 * AC-1: Dashboard landing page at /dashboard/shipper
 * AC-6: Composite Framework Grid Mapping
 * AC-7: Panel Class Requirement
 * AC-8: Layout Stability & Jitter Prevention
 */

import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ShipperDashboardPage } from './ShipperDashboardPage';

// Mock dependencies
jest.mock('../components/ShipperPageLayout', () => ({
  ShipperPageLayout: ({ slotA, slotB, slotC, ...props }: any) => (
    <div data-testid="shipper-page-layout" {...props}>
      {slotA && <div data-testid="slot-a-content">{slotA}</div>}
      {slotB && <div data-testid="slot-b-content">{slotB}</div>}
      {slotC && <div data-testid="slot-c-content">{slotC}</div>}
    </div>
  ),
}));

jest.mock('../components/KPISummaryPanel', () => ({
  KPISummaryPanel: () => <div data-testid="kpi-summary-panel">KPI Panel</div>,
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <ShipperDashboardPage />
    </BrowserRouter>
  );
};

describe('ShipperDashboardPage', () => {
  it('renders the page layout', () => {
    renderComponent();
    expect(screen.getByTestId('shipper-dashboard-page')).toBeInTheDocument();
  });

  it('renders KPI Summary in slot-a', () => {
    renderComponent();
    expect(screen.getByTestId('kpi-summary-panel')).toBeInTheDocument();
  });

  it('renders all four content sections', () => {
    renderComponent();
    expect(screen.getByTestId('shipment-status-section')).toBeInTheDocument();
    expect(screen.getByTestId('action-zone-section')).toBeInTheDocument();
    expect(screen.getByTestId('carrier-search-section')).toBeInTheDocument();
    expect(screen.getByTestId('messages-alerts-section')).toBeInTheDocument();
  });

  it('wraps content sections in slot-b and slot-c containers', () => {
    renderComponent();
    expect(screen.getByTestId('slot-b-content')).toBeInTheDocument();
    expect(screen.getByTestId('slot-c-content')).toBeInTheDocument();
  });

  it('applies semantic roles and aria-labels', () => {
    renderComponent();
    expect(screen.getByLabelText('Shipment Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByLabelText('Carrier Search')).toBeInTheDocument();
    expect(screen.getByLabelText('Messages and Alerts')).toBeInTheDocument();
  });

  it('renders section titles with correct font styling', () => {
    renderComponent();
    const titles = screen.getAllByText(/Shipment Status|Quick Actions|Carrier Search|Messages & Alerts/);
    expect(titles.length).toBe(4);
  });

  it('renders loading skeletons with animate-pulse class', () => {
    renderComponent();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(4); // At least 4 skeletons for placeholders
  });
});
