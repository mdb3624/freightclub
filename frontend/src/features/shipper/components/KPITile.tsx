import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPITileProps {
  icon: LucideIcon;
  label: string;
  value: string | number | null;
  unit?: string;
  loading?: boolean;
  dataTestId: string;
}

export const KPITile: React.FC<KPITileProps> = ({
  icon: Icon,
  label,
  value,
  unit,
  loading,
  dataTestId,
}) => {
  const displayValue = loading ? '—' : value ?? '—';

  return (
    <div
      data-testid={dataTestId}
      className="rounded-md border border-shipper-accent bg-shipper-surface p-6"
      style={{
        borderColor: 'var(--color-brand-bronze)',
        backgroundColor: 'var(--color-surface-white)',
        padding: 'var(--space-lg)',
        borderRadius: 'var(--radius-widget)',
        boxShadow: 'var(--shadow-subtle)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <Icon
          size={24}
          style={{ color: 'var(--color-brand-bronze)' }}
          data-testid={`${dataTestId}-icon`}
        />
      </div>

      <div className="space-y-2">
        <p
          className="text-xs font-semibold text-gray-600"
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {label}
        </p>

        <div className="flex items-baseline gap-1">
          <span
            className="text-2xl font-bold"
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text-primary)',
            }}
            data-testid={`${dataTestId}-value`}
          >
            {displayValue}
          </span>
          {unit && (
            <span
              style={{
                fontSize: 'var(--font-size-base)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
