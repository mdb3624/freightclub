/**
 * Feature: US-823 (Shipper Dashboard Layout Skeleton)
 * AC-1: Dashboard landing page at /dashboard/shipper
 * AC-4: Four main content sections (Shipment Status, Action Zone, Carrier Search, Messages)
 * AC-6: Composite Framework Grid Mapping (Architectural Constraint)
 * AC-7: Panel Class Requirement (Assembly Mandate)
 * AC-8: Layout Stability & Jitter Prevention (Placeholder Protocol)
 * AC-9: Visual Integrity & Grid Alignment (HFD Artifact Requirement)
 */

import React, { useState } from 'react';
import { ShipperPageLayout } from '../components/ShipperPageLayout';
import { KPISummaryPanel } from '../components/KPISummaryPanel';
import { EmptyStateCard } from '../components/EmptyStateCard';
import { Package, Zap, MessageSquare } from 'lucide-react';

export const ShipperDashboardPage: React.FC = () => {
  // State for toggling between skeleton (loading) and empty states
  // TODO: Replace with actual data loading state after US-824/US-825/US-826 implementation
  const [showEmptyStates] = useState(false);

  // SLOT_A: KPI Summary (full-width)
  const slotAContent = (
    <div className="panel" data-testid="kpi-summary-section">
      <KPISummaryPanel />
    </div>
  );

  // SLOT_B (Row 2): Shipment Status (8 columns)
  const slotBContent = (
    <section
      className="panel"
      role="region"
      aria-label="Shipment Status"
      data-testid="shipment-status-section"
    >
      {!showEmptyStates ? (
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
      ) : (
        <EmptyStateCard
          icon={<Package size={40} />}
          title="No Active Shipments"
          description="Start by posting a new load to track your shipments here."
          action={{
            label: 'Post a Load',
            onClick: () => window.location.href = '/shipper/loads/new',
          }}
          testId="shipment-status-empty"
        />
      )}
    </section>
  );

  // SLOT_C: Action Zone (4 columns) with Carrier Search button
  const slotCContent = (
    <section
      className="panel"
      role="region"
      aria-label="Quick Actions"
      data-testid="action-zone-section"
    >
      {!showEmptyStates ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
            Quick Actions
          </h2>
          <div
            className="grid grid-cols-2 gap-3"
            data-testid="action-buttons-grid"
          >
            {/* Placeholder buttons */}
            <div
              className="h-12 bg-gray-100 rounded animate-pulse"
              style={{ backgroundColor: 'var(--color-surface-light)' }}
            />
            <div
              className="h-12 bg-gray-100 rounded animate-pulse"
              style={{ backgroundColor: 'var(--color-surface-light)' }}
            />
            <div
              className="h-12 bg-gray-100 rounded animate-pulse"
              style={{ backgroundColor: 'var(--color-surface-light)' }}
            />
            <div
              className="h-12 bg-gray-100 rounded animate-pulse"
              style={{ backgroundColor: 'var(--color-surface-light)' }}
            />
          </div>
          <div
            style={{
              minHeight: 'var(--skeleton-height-action-zone)',
              backgroundColor: 'var(--color-surface-light)',
            }}
          />
        </div>
      ) : (
        <EmptyStateCard
          icon={<Zap size={40} />}
          title="Quick Actions Ready"
          description="Common tasks and shortcuts will appear here for faster operations."
          testId="action-zone-empty"
        />
      )}
    </section>
  );

  // SLOT_B (Row 3): Messages & Alerts (8 columns)
  const slotBRow3Content = (
    <section
      className="panel"
      role="region"
      aria-label="Messages and Alerts"
      data-testid="messages-alerts-section"
    >
      {!showEmptyStates ? (
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
      ) : (
        <EmptyStateCard
          icon={<MessageSquare size={40} />}
          title="No Notifications Yet"
          description="You'll receive alerts here when carriers respond to your loads."
          testId="messages-alerts-empty"
        />
      )}
    </section>
  );

  return (
    <ShipperPageLayout
      data-testid="shipper-dashboard-page"
      slotA={slotAContent}
      slotB={
        <div className="flex flex-col gap-6" data-testid="slot-b-content">
          {slotBContent}
          {slotBRow3Content}
        </div>
      }
      slotC={slotCContent}
    />
  );
};

export default ShipperDashboardPage;
