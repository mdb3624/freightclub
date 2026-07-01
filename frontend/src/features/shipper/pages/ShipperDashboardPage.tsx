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
import type { Shipment } from '../components/ShipmentStatusPanel';
import { MessagesAlertsPanel } from '../dashboard/components/MessagesAlertsPanel';
import { ActionZone } from '../dashboard/components/ActionZone';
import { useShipmentStatus } from '../hooks/useShipmentStatus';

export const ShipperDashboardPage: React.FC = () => {
  const { data: shipments, isLoading: isShipmentLoading } = useShipmentStatus();
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  // SLOT_A: KPI Summary (full-width, no outer panel wrapper — tiles are self-contained)
  const slotAContent = (
    <div data-testid="kpi-summary-section">
      <KPISummaryPanel />
    </div>
  );

  // SLOT_B (Row 2): Shipment Status with row selection wired to Action Zone
  const slotBContent = (
    <section
      role="region"
      aria-label="Shipment Status"
      data-testid="shipment-status-section"
    >
      <ShipmentStatusPanel
        shipments={shipments ?? []}
        isLoading={isShipmentLoading}
        selectedLoadId={selectedShipment?.loadId}
        onSelect={setSelectedShipment}
      />
    </section>
  );

  // SLOT_C: Action Zone — UI-kit ContextPanel (US-846)
  const slotCContent = (
    <section
      role="region"
      aria-label="Action Zone"
      data-testid="action-zone-section"
    >
      <ActionZone
        selectedShipment={selectedShipment}
        onClear={() => setSelectedShipment(null)}
      />
    </section>
  );

  // SLOT_B (Row 3): Messages & Alerts (8 columns)
  const slotBRow3Content = (
    <section
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
