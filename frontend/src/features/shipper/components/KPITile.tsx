import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPIBreakdown {
  delayed: number;
  inTransit: number;
  claimed: number;
}

interface KPITrend {
  direction: 'up' | 'down';
  delta: string;
}

interface KPITileProps {
  icon: LucideIcon;
  label: string;
  value: string | number | null;
  unit?: string;
  loading?: boolean;
  dataTestId: string;
  breakdown?: KPIBreakdown | null;
  trend?: KPITrend | null;
  progressRate?: number | null;
  progressContext?: string | null;
}

function getOnTimeColor(rate: number): string {
  if (rate >= 90) return '#27AE60';
  if (rate >= 75) return '#F39C12';
  return '#E74C3C';
}

const BreakdownDot: React.FC<{ color: string; label: string; count: number }> = ({ color, label, count }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
    <span>{label}</span>
    <span style={{ marginLeft: 'auto', fontWeight: 600, color: '#1A1A1A' }}>{count}</span>
  </div>
);

export const KPITile: React.FC<KPITileProps> = ({
  icon: Icon,
  label,
  value,
  unit,
  loading,
  dataTestId,
  breakdown,
  trend,
  progressRate,
  progressContext,
}) => {
  const displayValue = loading ? '—' : (value ?? 'No data');
  const valueColor = progressRate != null ? getOnTimeColor(progressRate) : '#1A1A1A';

  return (
    <div
      data-testid={dataTestId}
      style={{
        background: '#FFFFFF',
        border: '1px solid #D0D0D0',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        padding: '24px',
      }}
    >
      {/* Icon row + optional trend badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Icon size={24} style={{ color: 'var(--color-brand-bronze)' }} data-testid={`${dataTestId}-icon`} />
        {trend && (
          <span
            data-testid={`${dataTestId}-trend`}
            style={{
              fontSize: '12px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '4px',
              background: '#FEF3C7',
              border: '1px solid #F39C12',
              color: '#B45309',
            }}
          >
            {trend.direction === 'up' ? '↑' : '↓'} {trend.delta}
          </span>
        )}
      </div>

      {/* Label */}
      <p
        style={{
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-secondary)',
          marginBottom: '4px',
        }}
      >
        {label}
      </p>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
        <span
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: valueColor,
          }}
          data-testid={`${dataTestId}-value`}
        >
          {displayValue}
        </span>
        {unit && (
          <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)' }}>
            {unit}
          </span>
        )}
      </div>

      {/* On-Time Rate: progress bar + context */}
      {progressRate != null && (
        <>
          <div
            data-testid={`${dataTestId}-progress-track`}
            style={{
              height: '7px',
              background: '#E8E3D8',
              borderRadius: '9999px',
              overflow: 'hidden',
              marginBottom: '6px',
            }}
          >
            <div
              data-testid={`${dataTestId}-progress-fill`}
              style={{
                height: '100%',
                width: `${Math.min(progressRate, 100)}%`,
                background: getOnTimeColor(progressRate),
                borderRadius: '9999px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          {progressContext && (
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
              {progressContext}
            </p>
          )}
        </>
      )}

      {/* Active Shipments: color-coded breakdown dots */}
      {breakdown && (
        <div
          data-testid={`${dataTestId}-breakdown`}
          style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}
        >
          <BreakdownDot color="#E74C3C" label="Delayed" count={breakdown.delayed} />
          <BreakdownDot color="#7C3AED" label="In Transit" count={breakdown.inTransit} />
          <BreakdownDot color="#F39C12" label="Claimed" count={breakdown.claimed} />
        </div>
      )}
    </div>
  );
};
