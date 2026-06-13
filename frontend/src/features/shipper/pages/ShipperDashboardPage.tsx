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
import { MessagesAlertsPanel } from '../dashboard/components/MessagesAlertsPanel';
import { useQuickActionNavigation } from '../dashboard/hooks/useQuickActionNavigation';

export const ShipperDashboardPage: React.FC = () => {
  const { onPostLoad, onGetQuote, onTrackShipments, onPreferredCarriers } = useQuickActionNavigation();
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

  // SLOT_B (Row 2): Shipment Status (8 columns) — Placeholder until real data hook implemented
  const slotBContent = (
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm, 8px)' }} data-testid="quick-actions-buttons">
          <button
            onClick={() => handleActionClick('quick-actions-post-load', onPostLoad)}
            disabled={isLoading && loadingButtonId === 'quick-actions-post-load'}
            style={{
              width: '100%',
              padding: '8px 16px',
              borderRadius: '4px',
              background: isLoading && loadingButtonId === 'quick-actions-post-load'
                ? '#D3D3D3'
                : 'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)',
              color: isLoading && loadingButtonId === 'quick-actions-post-load' ? '#888888' : '#FFFFFF',
              border: isLoading && loadingButtonId === 'quick-actions-post-load'
                ? 'none'
                : '1px solid #7A5F3A',
              boxShadow: isLoading && loadingButtonId === 'quick-actions-post-load'
                ? '0 1px 2px rgba(0,0,0,0.1)'
                : 'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isLoading && loadingButtonId === 'quick-actions-post-load' ? 'not-allowed' : 'pointer',
              transition: 'all 150ms ease-in-out',
            }}
            data-testid="quick-actions-post-load"
          >
            📤 Post Load
          </button>
          <button
            onClick={() => handleActionClick('quick-actions-quote', onGetQuote)}
            disabled={isLoading && loadingButtonId === 'quick-actions-quote'}
            style={{
              width: '100%',
              padding: '8px 16px',
              borderRadius: '4px',
              background: isLoading && loadingButtonId === 'quick-actions-quote'
                ? '#D3D3D3'
                : 'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)',
              color: isLoading && loadingButtonId === 'quick-actions-quote' ? '#888888' : '#FFFFFF',
              border: isLoading && loadingButtonId === 'quick-actions-quote'
                ? 'none'
                : '1px solid #7A5F3A',
              boxShadow: isLoading && loadingButtonId === 'quick-actions-quote'
                ? '0 1px 2px rgba(0,0,0,0.1)'
                : 'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isLoading && loadingButtonId === 'quick-actions-quote' ? 'not-allowed' : 'pointer',
              transition: 'all 150ms ease-in-out',
            }}
            data-testid="quick-actions-quote"
          >
            💬 Get A Quote
          </button>
          <button
            onClick={() => handleActionClick('quick-actions-track', onTrackShipments)}
            disabled={isLoading && loadingButtonId === 'quick-actions-track'}
            style={{
              width: '100%',
              padding: '8px 16px',
              borderRadius: '4px',
              background: isLoading && loadingButtonId === 'quick-actions-track'
                ? '#D3D3D3'
                : 'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)',
              color: isLoading && loadingButtonId === 'quick-actions-track' ? '#888888' : '#FFFFFF',
              border: isLoading && loadingButtonId === 'quick-actions-track'
                ? 'none'
                : '1px solid #7A5F3A',
              boxShadow: isLoading && loadingButtonId === 'quick-actions-track'
                ? '0 1px 2px rgba(0,0,0,0.1)'
                : 'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isLoading && loadingButtonId === 'quick-actions-track' ? 'not-allowed' : 'pointer',
              transition: 'all 150ms ease-in-out',
            }}
            data-testid="quick-actions-track"
          >
            📦 Track Shipments
          </button>
          <button
            onClick={() => handleActionClick('quick-actions-carriers', onPreferredCarriers)}
            disabled={isLoading && loadingButtonId === 'quick-actions-carriers'}
            style={{
              width: '100%',
              padding: '8px 16px',
              borderRadius: '4px',
              background: isLoading && loadingButtonId === 'quick-actions-carriers'
                ? '#D3D3D3'
                : 'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)',
              color: isLoading && loadingButtonId === 'quick-actions-carriers' ? '#888888' : '#FFFFFF',
              border: isLoading && loadingButtonId === 'quick-actions-carriers'
                ? 'none'
                : '1px solid #7A5F3A',
              boxShadow: isLoading && loadingButtonId === 'quick-actions-carriers'
                ? '0 1px 2px rgba(0,0,0,0.1)'
                : 'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isLoading && loadingButtonId === 'quick-actions-carriers' ? 'not-allowed' : 'pointer',
              transition: 'all 150ms ease-in-out',
            }}
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
