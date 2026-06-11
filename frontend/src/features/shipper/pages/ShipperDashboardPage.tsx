/**
 * Feature: US-823 (Shipper Dashboard Layout Skeleton)
 * AC-1: Dashboard landing page at /dashboard/shipper
 * AC-4: Four main content sections (Shipment Status, Action Zone, Carrier Search, Messages)
 * AC-6: Composite Framework Grid Mapping (Architectural Constraint)
 * AC-7: Panel Class Requirement (Assembly Mandate)
 * AC-8: Layout Stability & Jitter Prevention (Placeholder Protocol)
 * AC-9: Visual Integrity & Grid Alignment (HFD Artifact Requirement)
 */

import React from 'react';
import { ShipperPageLayout } from '../components/ShipperPageLayout';
import { KPISummaryPanel } from '../components/KPISummaryPanel';

export const ShipperDashboardPage: React.FC = () => {
  // SLOT_A: KPI Summary (full-width)
  const slotAContent = (
    <div className="panel" data-testid="kpi-summary-section">
      <KPISummaryPanel />
    </div>
  );

  // SLOT_B: Shipment Status + Carrier Search (8 columns, stacked rows)
  const slotBContent = (
    <div className="flex flex-col gap-6" data-testid="slot-b-content">
      {/* Row 2: Shipment Status */}
      <section
        className="panel"
        role="region"
        aria-label="Shipment Status"
        data-testid="shipment-status-section"
      >
        <div className="space-y-4">
          <h2 className="text-lg font-semibold" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
            Shipment Status
          </h2>
          <div
            className="rounded animate-pulse"
            style={{
              minHeight: 'var(--skeleton-height-shipment-status)',
              backgroundColor: 'var(--color-surface-light)',
            }}
          />
        </div>
      </section>

      {/* Row 3: Carrier Search */}
      <section
        className="panel"
        role="region"
        aria-label="Carrier Search"
        data-testid="carrier-search-section"
      >
        <div className="space-y-4">
          <h2 className="text-lg font-semibold" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
            Carrier Search
          </h2>
          <div
            className="rounded animate-pulse"
            style={{
              minHeight: 'var(--skeleton-height-carrier-search)',
              backgroundColor: 'var(--color-surface-light)',
            }}
          />
        </div>
      </section>
    </div>
  );

  // SLOT_C: Action Zone + Messages & Alerts (4 columns, stacked rows)
  const slotCContent = (
    <div className="flex flex-col gap-6" data-testid="slot-c-content">
      {/* Row 2: Action Zone */}
      <section
        className="panel"
        role="region"
        aria-label="Quick Actions"
        data-testid="action-zone-section"
      >
        <div className="space-y-4">
          <h2 className="text-lg font-semibold" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
            Quick Actions
          </h2>
          <div
            className="rounded animate-pulse"
            style={{
              minHeight: 'var(--skeleton-height-action-zone)',
              backgroundColor: 'var(--color-surface-light)',
            }}
          />
        </div>
      </section>

      {/* Row 3: Messages & Alerts */}
      <section
        className="panel"
        role="region"
        aria-label="Messages and Alerts"
        data-testid="messages-alerts-section"
      >
        <div className="space-y-4">
          <h2 className="text-lg font-semibold" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
            Messages & Alerts
          </h2>
          <div
            className="rounded animate-pulse"
            style={{
              minHeight: 'var(--skeleton-height-messages-alerts)',
              backgroundColor: 'var(--color-surface-light)',
            }}
          />
        </div>
      </section>
    </div>
  );

  return (
    <ShipperPageLayout
      data-testid="shipper-dashboard-page"
      slotA={slotAContent}
      slotB={slotBContent}
      slotC={slotCContent}
    />
  );
};

export default ShipperDashboardPage;
