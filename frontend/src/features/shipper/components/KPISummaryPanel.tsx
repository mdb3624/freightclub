import React from 'react';
import { useKPISummary } from '@/features/shipper/hooks/useKPISummary';
import { KPITile } from './KPITile';

export const KPISummaryPanel: React.FC = () => {
  const { data, isLoading } = useKPISummary();

  const onTimePct = data?.onTimePercentage ?? null;

  return (
    <div
      data-testid="kpi-summary-panel"
      style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}
      data-testid-grid="kpi-tiles-grid"
    >
      {/* Tile 1: Active Shipments */}
      <KPITile
        label="Active Shipments"
        value={data?.activeLoadCount ?? 0}
        dataTestId="kpi-tile-active-loads"
        loading={isLoading}
      />

      {/* Tile 2: On-Time Delivery Rate */}
      <KPITile
        label="On-Time Delivery Rate"
        value={onTimePct != null ? onTimePct.toFixed(1) : null}
        unit="%"
        dataTestId="kpi-tile-ontime"
        loading={isLoading}
        valueColor="#27AE60"
      >
        {onTimePct != null && (
          <div>
            <div style={{ height: 6, background: '#E8E3D8', borderRadius: 9999, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ width: `${Math.min(onTimePct, 100)}%`, height: '100%', background: '#27AE60', borderRadius: 9999 }} />
            </div>
            <div style={{ fontSize: 12, color: '#636E72' }}>Last 30 days</div>
          </div>
        )}
      </KPITile>

      {/* Tile 3: Cost per Mile */}
      <KPITile
        label="Est. Cost / Mile"
        value={data?.costPerMile != null ? data.costPerMile.toFixed(2) : null}
        unit="$"
        dataTestId="kpi-tile-cost-per-mile"
        loading={isLoading}
      />
    </div>
  );
};
