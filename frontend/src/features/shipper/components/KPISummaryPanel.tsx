import React from 'react';
import { TrendingUp, DollarSign, Truck } from 'lucide-react';
import { useKPISummary } from '@/features/shipper/hooks/useKPISummary';
import { KPITile } from './KPITile';

export const KPISummaryPanel: React.FC = () => {
  const { data, isLoading } = useKPISummary();

  return (
    <div data-testid="kpi-summary-panel">
      <h2
        className="mb-6 text-lg font-semibold"
        style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-lg)',
        }}
      >
        Business Health
      </h2>

      <div
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
        data-testid="kpi-tiles-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-md)',
        }}
      >
        <KPITile
          icon={Truck}
          label="Active Shipments"
          value={data?.activeLoadCount ?? 0}
          dataTestId="kpi-tile-active-loads"
          loading={isLoading}
        />

        <KPITile
          icon={TrendingUp}
          label="On-Time Rate"
          value={data?.onTimePercentage ? data.onTimePercentage.toFixed(1) : null}
          unit="%"
          dataTestId="kpi-tile-ontime"
          loading={isLoading}
        />

        <KPITile
          icon={DollarSign}
          label="Cost per Mile"
          value={data?.costPerMile ? data.costPerMile.toFixed(2) : null}
          unit="$"
          dataTestId="kpi-tile-cost-per-mile"
          loading={isLoading}
        />
      </div>
    </div>
  );
};
