import React from 'react';

interface KPITileProps {
  label: string;
  value: string | number | null;
  unit?: string;
  loading?: boolean;
  dataTestId: string;
  valueColor?: string;
  children?: React.ReactNode;
}

export const KPITile: React.FC<KPITileProps> = ({
  label,
  value,
  unit,
  loading,
  dataTestId,
  valueColor = '#1A1A1A',
  children,
}) => {
  const displayValue = loading ? '—' : (value ?? 'No data');
  const isNoData = !loading && value == null;

  return (
    <div
      data-testid={dataTestId}
      style={{
        background: '#fff',
        border: '1px solid #D0D0D0',
        borderRadius: 8,
        boxShadow: '0 2px 4px rgba(0,0,0,.05)',
        padding: 24,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#636E72', marginBottom: 12 }}>
        {label}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: children ? 10 : 0 }}>
        <span
          data-testid={`${dataTestId}-value`}
          style={{
            fontFamily: 'Sora, sans-serif',
            fontSize: 48,
            fontWeight: 900,
            lineHeight: 1,
            color: isNoData ? '#D0D0D0' : valueColor,
          }}
        >
          {displayValue}
        </span>
        {unit && !isNoData && (
          <span style={{ fontSize: 16, color: '#636E72', fontWeight: 500 }}>{unit}</span>
        )}
      </div>

      {children}
    </div>
  );
};
