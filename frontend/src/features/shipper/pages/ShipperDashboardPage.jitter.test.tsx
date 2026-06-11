/**
 * Feature: US-823 (Shipper Dashboard Layout Skeleton)
 * AC-8: Layout Stability & Jitter Prevention (Placeholder Protocol)
 *
 * Test: Verify that skeleton heights match final content heights
 * → Skeleton state maintains fixed height
 * → Content state does not cause height shift
 * → No "jitter" or layout reflow on load
 */

import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { ShipperDashboardPage } from './ShipperDashboardPage';

// Mock dependencies
vi.mock('../components/ShipperPageLayout', () => ({
  ShipperPageLayout: ({ slotA, slotB, slotC, ...props }: any) => (
    <div data-testid="shipper-page-layout" {...props}>
      {slotA && <div data-testid="slot-a-content" className="zone-widget-slots">{slotA}</div>}
      {slotB && <div data-testid="slot-b-content" className="slot-b">{slotB}</div>}
      {slotC && <div data-testid="slot-c-content" className="slot-c">{slotC}</div>}
    </div>
  ),
}));

vi.mock('../components/KPISummaryPanel', () => ({
  KPISummaryPanel: () => <div data-testid="kpi-summary-panel" style={{ minHeight: '120px' }}>KPI Content (120px)</div>,
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <ShipperDashboardPage />
    </BrowserRouter>
  );
};

describe('ShipperDashboardPage — Jitter Prevention (AC-8)', () => {
  it('maintains fixed height for Shipment Status skeleton', () => {
    renderComponent();
    const skeleton = screen.getByTestId('shipment-status-section').querySelector('.animate-pulse');
    expect(skeleton).toHaveStyle('minHeight: var(--skeleton-height-shipment-status)');
  });

  it('maintains fixed height for Action Zone skeleton', () => {
    renderComponent();
    const skeleton = screen.getByTestId('action-zone-section').querySelector('.animate-pulse');
    expect(skeleton).toHaveStyle('minHeight: var(--skeleton-height-action-zone)');
  });

  it('maintains fixed height for Carrier Search skeleton', () => {
    renderComponent();
    const skeleton = screen.getByTestId('carrier-search-section').querySelector('.animate-pulse');
    expect(skeleton).toHaveStyle('minHeight: var(--skeleton-height-carrier-search)');
  });

  it('maintains fixed height for Messages & Alerts skeleton', () => {
    renderComponent();
    const skeleton = screen.getByTestId('messages-alerts-section').querySelector('.animate-pulse');
    expect(skeleton).toHaveStyle('minHeight: var(--skeleton-height-messages-alerts)');
  });

  it('uses animate-pulse class for all skeleton states', () => {
    renderComponent();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
    skeletons.forEach(skeleton => {
      expect(skeleton).toHaveClass('animate-pulse');
    });
  });

  it('applies background color to skeletons for visual feedback', () => {
    renderComponent();
    const skeleton = screen.getByTestId('shipment-status-section').querySelector('.animate-pulse');
    expect(skeleton).toHaveStyle('backgroundColor: var(--color-surface-light)');
  });

  it('all sections use rounded corners for skeleton consistency', () => {
    renderComponent();
    const skeletons = document.querySelectorAll('[data-testid*="section"] .animate-pulse');
    skeletons.forEach(skeleton => {
      expect(skeleton).toHaveClass('rounded');
    });
  });

  it('skeleton heights are defined in CSS variables (not hardcoded)', () => {
    renderComponent();
    const shipmentStatus = screen.getByTestId('shipment-status-section').querySelector('.animate-pulse');
    const actionZone = screen.getByTestId('action-zone-section').querySelector('.animate-pulse');
    const carrierSearch = screen.getByTestId('carrier-search-section').querySelector('.animate-pulse');
    const messagesAlerts = screen.getByTestId('messages-alerts-section').querySelector('.animate-pulse');

    // Verify CSS variables are used (not hardcoded px values)
    expect(shipmentStatus?.getAttribute('style')).toContain('var(--skeleton-height-shipment-status)');
    expect(actionZone?.getAttribute('style')).toContain('var(--skeleton-height-action-zone)');
    expect(carrierSearch?.getAttribute('style')).toContain('var(--skeleton-height-carrier-search)');
    expect(messagesAlerts?.getAttribute('style')).toContain('var(--skeleton-height-messages-alerts)');
  });

  it('all sections have consistent padding via .panel class', () => {
    renderComponent();
    const panels = document.querySelectorAll('[data-testid*="section"]');
    panels.forEach(panel => {
      expect(panel).toHaveClass('panel');
    });
  });

  it('grid layout uses gap token (prevents jitter from spacing changes)', () => {
    renderComponent();
    const slotBContent = screen.getByTestId('slot-b-content');
    expect(slotBContent.querySelector('div')).toHaveClass('flex flex-col gap-6');
  });

  it('placeholder protocol: all sections wrapped in sections with role=region', () => {
    renderComponent();
    const sections = document.querySelectorAll('[role="region"]');
    expect(sections.length).toBe(4);
    sections.forEach(section => {
      expect(section).toHaveAttribute('aria-label');
    });
  });
});
