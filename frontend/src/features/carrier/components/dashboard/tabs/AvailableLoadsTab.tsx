import React from 'react';

interface DesignTokens {
  colors: any;
  spacing: any;
  touchTarget: any;
  viewport: any;
}

interface AvailableLoadsTabProps {
  tokens: DesignTokens;
}

/**
 * AC-1: Available Loads tab
 * Shows 4 load cards (90px height each) with profitability badges
 * Tap-only: [Claim] and [Details] buttons
 */

export const AvailableLoadsTab: React.FC<AvailableLoadsTabProps> = ({ tokens }) => {
  const loads = [
    {
      id: 'load-001',
      origin: 'Houston',
      dest: 'Dallas',
      pallets: 50,
      rate: 310,
      rpm: 1.17,
      profitability: 'success'
    },
    {
      id: 'load-002',
      origin: 'Dallas',
      dest: 'Austin',
      pallets: 25,
      rate: 190,
      rpm: 0.95,
      profitability: 'warning'
    },
    {
      id: 'load-003',
      origin: 'Austin',
      dest: 'Houston',
      pallets: 100,
      rate: 420,
      rpm: 1.25,
      profitability: 'success'
    },
    {
      id: 'load-004',
      origin: 'San Antonio',
      dest: 'Dallas',
      pallets: 30,
      rate: 140,
      rpm: 0.88,
      profitability: 'danger'
    }
  ];

  const getProfitabilityColor = (profitability: string) => {
    switch (profitability) {
      case 'success':
        return tokens.colors.status.success;
      case 'warning':
        return tokens.colors.status.warning;
      case 'danger':
        return tokens.colors.status.danger;
      default:
        return tokens.colors.status.success;
    }
  };

  const getProfitabilityIcon = (profitability: string) => {
    switch (profitability) {
      case 'success':
        return '✓';
      case 'warning':
        return '–';
      case 'danger':
        return '✕';
      default:
        return '✓';
    }
  };

  return (
    <div
      data-testid="available-loads-tab-content"
      style={{
        width: '100%',
        padding: tokens.spacing.md
      }}
    >
      {/* Filter Info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing.sm,
          marginBottom: tokens.spacing.md,
          fontSize: 12,
          color: tokens.colors.text.secondary
        }}
      >
        <div style={{ padding: '4px 8px', backgroundColor: '#27AE60', color: '#FFFFFF', borderRadius: 4 }}>
          ✓ Profitable Filter ON
        </div>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: tokens.colors.accent.bronze,
            cursor: 'pointer',
            fontSize: 12,
            textDecoration: 'underline'
          }}
        >
          Show All
        </button>
      </div>

      {/* Load Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
        {loads.map((load) => (
          <div
            key={load.id}
            data-testid={`load-card-${load.id}`}
            style={{
              height: 90,
              padding: tokens.spacing.md,
              backgroundColor: tokens.colors.bg.surface,
              border: `1px solid ${tokens.colors.border.primary}`,
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative'
            }}
          >
            {/* Profitability Badge (top-right) */}
            <div
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 40,
                height: 40,
                backgroundColor: getProfitabilityColor(load.profitability),
                borderRadius: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: 10,
                fontWeight: 'bold'
              }}
            >
              <div style={{ fontSize: 14 }}>{getProfitabilityIcon(load.profitability)}</div>
              <div>{Math.round(load.rpm * 100)}%</div>
            </div>

            {/* Load Info */}
            <div style={{ paddingRight: 50 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                {load.pallets} pallets
              </div>
              <div style={{ fontSize: 12, color: tokens.colors.text.secondary }}>
                {load.origin} → {load.dest}
              </div>
            </div>

            {/* Rate + Buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingRight: 50
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600 }}>${load.rate}</div>
              <div
                style={{
                  display: 'flex',
                  gap: 4
                }}
              >
                <button
                  data-testid={`claim-load-btn-${load.id}`}
                  style={{
                    height: 36,
                    padding: '6px 12px',
                    background: tokens.colors.accent.bronzeGradient,
                    border: '1px solid #7A5F3A',
                    borderRadius: 4,
                    color: '#FFFFFF',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 11
                  }}
                >
                  CLAIM
                </button>
                <button
                  style={{
                    height: 36,
                    padding: '6px 12px',
                    background: 'transparent',
                    border: `1px solid ${tokens.colors.accent.bronze}`,
                    borderRadius: 4,
                    color: tokens.colors.text.primary,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 11
                  }}
                >
                  INFO
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <button
        style={{
          width: '100%',
          height: 44,
          marginTop: tokens.spacing.md,
          backgroundColor: 'transparent',
          border: `2px solid ${tokens.colors.accent.bronze}`,
          borderRadius: 8,
          color: tokens.colors.accent.bronze,
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: 14
        }}
      >
        LOAD MORE
      </button>
    </div>
  );
};
