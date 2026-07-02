import React from 'react';
import { TrendingUp, DollarSign, Truck } from 'lucide-react';
import { useKPISummary } from '@/features/shipper/hooks/useKPISummary';
import { KPITile } from './KPITile';

export const KPISummaryPanel: React.FC = () => {
  const { data, isLoading } = useKPISummary();

  const breakdown =
    data?.delayedCount != null
      ? {
          delayed: data.delayedCount ?? 0,
          inTransit: data.inTransitCount ?? 0,
          claimed: data.claimedCount ?? 0,
        }
      : null;

  const trend =
    data?.costTrend != null
      ? {
          direction: (data.costTrend >= 0 ? 'up' : 'down') as 'up' | 'down',
          delta: `${data.costTrend >= 0 ? '+' : ''}$${Math.abs(data.costTrend).toFixed(2)}`,
        }
      : null;

  const progressContext = data?.deliveryCount != null
    ? `Based on ${data.deliveryCount} deliveries · last 30 days`
    : 'Based on your deliveries · last 30 days';

  return (
    <div data-testid="kpi-summary-panel">
      <h2
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
          breakdown={breakdown}
        />

        <KPITile
          icon={TrendingUp}
          label="On-Time Rate"
          value={data?.onTimePercentage != null ? data.onTimePercentage.toFixed(1) : null}
          unit="%"
          dataTestId="kpi-tile-ontime"
          loading={isLoading}
          progressRate={data?.onTimePercentage ?? null}
          progressContext={progressContext}
        />

        <KPITile
          icon={DollarSign}
          label="Cost per Mile"
          value={data?.costPerMile != null ? data.costPerMile.toFixed(2) : null}
          unit="$"
          dataTestId="kpi-tile-cost-per-mile"
          loading={isLoading}
          trend={trend}
        />
      </div>
    </div>
  );
};
