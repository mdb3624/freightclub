import React from 'react';

interface DesignTokens {
  colors: any;
  spacing: any;
  touchTarget: any;
  viewport: any;
}

interface MyStatsTabProps {
  tokens: DesignTokens;
}

/**
 * AC-1: My Stats tab - 2x2 metric grid + cost profile summary
 * Metrics: Acceptance %, On-Time %, Completion, Payments
 * Design: Icon-only labels, compact 80x80px cells
 */

export const MyStatsTab: React.FC<MyStatsTabProps> = ({ tokens }) => {
  const metrics = [
    { id: 'acceptance', icon: '📊', label: 'Accept', value: '92%', unit: 'Rate' },
    { id: 'on-time', icon: '⏰', label: 'On-Time', value: '96%', unit: 'Delivery' },
    { id: 'completion', icon: '✓', label: 'Complete', value: '18/18', unit: 'Loads' },
    { id: 'payments', icon: '💰', label: 'Paid', value: '15/18', unit: 'Loads' }
  ];

  return (
    <div
      data-testid="my-stats-tab-content"
      style={{
        width: '100%',
        padding: tokens.spacing.md,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing.md
      }}
    >
      {/* 2x2 Metric Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: tokens.spacing.md,
          marginBottom: tokens.spacing.lg
        }}
      >
        {metrics.map((metric) => (
          <div
            key={metric.id}
            data-testid={`metric-badge-${metric.id}`}
            style={{
              width: 80,
              height: 80,
              padding: tokens.spacing.sm,
              backgroundColor: tokens.colors.bg.primary,
              border: `1px solid ${tokens.colors.border.primary}`,
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: 24 }}>{metric.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 'bold', color: tokens.colors.text.primary }}>
              {metric.value}
            </div>
            <div
              data-testid={`metric-label-${metric.id}`}
              style={{
                fontSize: 10,
                color: tokens.colors.text.secondary,
                lineHeight: 1.2
              }}
            >
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      {/* Cost Profile Summary */}
      <div
        data-testid="cost-profile-summary"
        style={{
          padding: tokens.spacing.md,
          backgroundColor: tokens.colors.bg.surface,
          border: `1px solid ${tokens.colors.border.primary}`,
          borderRadius: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: tokens.colors.text.secondary, marginBottom: 4 }}>
            Min RPM
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: tokens.colors.text.primary }}>
            $1.17
          </div>
        </div>
        <button
          data-testid="edit-cost-profile-secondary"
          style={{
            height: 48,
            padding: '8px 16px',
            background: tokens.colors.accent.bronzeGradient,
            border: '1px solid #7A5F3A',
            borderRadius: 6,
            color: '#FFFFFF',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 12,
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)'
          }}
        >
          ⚙️ Edit
        </button>
      </div>

      {/* Secondary Action Buttons */}
      <div
        style={{
          display: 'flex',
          gap: tokens.spacing.sm,
          paddingTop: tokens.spacing.md
        }}
      >
        <button
          data-testid="view-full-stats-btn"
          style={{
            flex: 1,
            height: 48,
            padding: '8px 12px',
            background: tokens.colors.accent.bronzeGradient,
            border: '1px solid #7A5F3A',
            borderRadius: 20,
            color: '#FFFFFF',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 12,
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)'
          }}
        >
          View Full Stats
        </button>
        <button
          data-testid="ratings-btn"
          style={{
            flex: 1,
            height: 48,
            padding: '8px 12px',
            background: tokens.colors.accent.bronzeGradient,
            border: '1px solid #7A5F3A',
            borderRadius: 20,
            color: '#FFFFFF',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 12,
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)'
          }}
        >
          Ratings
        </button>
      </div>
    </div>
  );
};
