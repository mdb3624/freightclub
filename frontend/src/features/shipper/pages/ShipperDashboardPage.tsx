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
import { ShipmentStatusPanel } from '../components/ShipmentStatusPanel';
import { MessagesAlertsPanel } from '../dashboard/components/MessagesAlertsPanel';
import { useQuickActionNavigation } from '../dashboard/hooks/useQuickActionNavigation';
import { useShipmentStatus } from '../hooks/useShipmentStatus';

export const ShipperDashboardPage: React.FC = () => {
  const { onPostLoad, onGetQuote, onTrackShipments, onPreferredCarriers } = useQuickActionNavigation();
  const { data: shipments, isLoading: isShipmentLoading } = useShipmentStatus();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingButtonId, setLoadingButtonId] = useState<string | null>(null);

  const handleActionClick = (buttonId: string, handler: () => void) => {
    setIsLoading(true);
    setLoadingButtonId(buttonId);
    handler();
  };

  // SLOT_A: KPI Summary (full-width)
  const slotAContent = (
    <div className="panel" data-testid="kpi-summary-section">
      <KPISummaryPanel />
    </div>
  );

  // SLOT_B (Row 2): Shipment Status (8 columns) — US-822 Live Shipment Tracking
  const slotBContent = (
    <section
      className="panel"
      role="region"
      aria-label="Shipment Status"
      data-testid="shipment-status-section"
    >
      <ShipmentStatusPanel
        shipments={shipments ?? []}
        isLoading={isShipmentLoading}
        onTrackShipments={() => onTrackShipments()}
      />
    </section>
  );

  // SLOT_C: Action Zone (4 columns) - Quick Actions Panel only
  const slotCContent = (
    <section
      className="panel"
      role="region"
      aria-label="Action Zone"
      data-testid="action-zone-section"
    >
      <div
        role="region"
        aria-label="Quick Actions"
        data-testid="dashboard-quick-actions-panel"
      >
        <h3 className="text-sm font-semibold mb-4" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
          Quick Actions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} data-testid="quick-actions-buttons">
          <button
            onClick={() => handleActionClick('quick-actions-post-load', onPostLoad)}
            disabled={isLoading && loadingButtonId === 'quick-actions-post-load'}
            className="btn-bronze"
            data-testid="quick-actions-post-load"
          >
            📤 Post Load
          </button>
          <button
            onClick={() => handleActionClick('quick-actions-quote', onGetQuote)}
            disabled={isLoading && loadingButtonId === 'quick-actions-quote'}
            className="btn-bronze"
            data-testid="quick-actions-quote"
          >
            💬 Get A Quote
          </button>
          <button
            onClick={() => handleActionClick('quick-actions-track', onTrackShipments)}
            disabled={isLoading && loadingButtonId === 'quick-actions-track'}
            className="btn-bronze"
            data-testid="quick-actions-track"
          >
            📦 Track Shipments
          </button>
          <button
            onClick={() => handleActionClick('quick-actions-carriers', onPreferredCarriers)}
            disabled={isLoading && loadingButtonId === 'quick-actions-carriers'}
            className="btn-bronze"
            data-testid="quick-actions-carriers"
          >
            ⭐ Preferred Carriers
          </button>
        </div>
      </div>
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
      <MessagesAlertsPanel />
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
