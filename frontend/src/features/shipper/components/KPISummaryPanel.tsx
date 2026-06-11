import React from 'react';
import { TrendingUp, Truck, DollarSign } from 'lucide-react';
import { useKPISummary } from '@/hooks/useKPISummary';
import { KPITile } from './KPITile';

export const KPISummaryPanel: React.FC = () => {
  const { data, isLoading, error } = useKPISummary();

  if (error) {
    return (
      <div
        className="rounded-md border border-red-200 bg-red-50 p-4"
        data-testid="kpi-summary-error"
      >
        <p className="text-sm text-red-700">Failed to load KPI metrics</p>
      </div>
    );
  }

  // Empty state: no delivered loads yet
  if (data?.isEmpty) {
    return (
      <div
        className="rounded-md border border-shipper-accent bg-shipper-surface p-8 text-center"
        data-testid="kpi-summary-empty"
        style={{
          borderColor: 'var(--color-brand-bronze)',
          backgroundColor: 'var(--color-surface-white)',
          padding: 'var(--space-xl)',
          borderRadius: 'var(--radius-widget)',
        }}
      >
        <Truck
          size={40}
          className="mx-auto mb-4 opacity-50"
          style={{ color: 'var(--color-text-tertiary)' }}
        />
        <h3
          style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-sm)',
          }}
        >
          No Delivered Loads Yet
        </h3>
        <p
          style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-lg)',
          }}
        >
          Post your first load and track its delivery to see business metrics.
        </p>
        <button
          data-testid="kpi-empty-cta-button"
          className="inline-block px-6 py-2 rounded-md font-semibold text-white"
          style={{
            background: 'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)',
            border: '1px solid #7A5F3A',
          }}
        >
          Post Your First Load
        </button>
      </div>
    );
  }

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
          value={data?.onTimePercentage?.toFixed(1)}
          unit="%"
          dataTestId="kpi-tile-ontime"
          loading={isLoading}
        />

        <KPITile
          icon={DollarSign}
          label="Cost per Mile"
          value={data?.costPerMile?.toFixed(2)}
          unit="$"
          dataTestId="kpi-tile-cost-per-mile"
          loading={isLoading}
        />
      </div>
    </div>
  );
};
