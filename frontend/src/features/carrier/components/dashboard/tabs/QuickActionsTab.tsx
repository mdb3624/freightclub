import React from 'react';

interface DesignTokens {
  colors: any;
  spacing: any;
  touchTarget: any;
}

interface QuickActionsTabProps {
  tokens: DesignTokens;
}

/**
 * AC-1: Quick Actions tab
 * Setup checklist + Account links + Support
 */

export const QuickActionsTab: React.FC<QuickActionsTabProps> = ({ tokens }) => {
  return (
    <div
      data-testid="quick-actions-tab-content"
      style={{
        width: '100%',
        padding: tokens.spacing.md
      }}
    >
      {/* Setup Checklist */}
      <div style={{ marginBottom: tokens.spacing.lg }}>
        <h3
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            color: tokens.colors.text.secondary,
            marginBottom: tokens.spacing.md
          }}
        >
          Setup Checklist
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.sm }}>
          {[
            { id: 'equipment', label: 'Equipment Profile', checked: false },
            { id: 'cost', label: 'Cost Profile', checked: true },
            { id: 'hos', label: 'HOS Tracking', checked: false }
          ].map((item) => (
            <div
              key={item.id}
              style={{
                padding: tokens.spacing.sm,
                backgroundColor: tokens.colors.bg.surface,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing.sm
              }}
            >
              <input
                type="checkbox"
                checked={item.checked}
                readOnly
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              <div style={{ flex: 1, fontSize: 12 }}>{item.label}</div>
              <button
                style={{
                  height: 32,
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: `1px solid ${tokens.colors.accent.bronze}`,
                  borderRadius: 4,
                  color: tokens.colors.accent.bronze,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 11
                }}
              >
                {item.checked ? 'Manage' : 'Setup'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Account Section */}
      <div style={{ marginBottom: tokens.spacing.lg }}>
        <h3
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            color: tokens.colors.text.secondary,
            marginBottom: tokens.spacing.md
          }}
        >
          Account
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing.sm }}>
          {[
            { label: '👤 Profile' },
            { label: '⚙️ Settings' },
            { label: '💳 Payment' },
            { label: '📋 History' }
          ].map((btn, idx) => (
            <button
              key={idx}
              style={{
                height: 44,
                padding: tokens.spacing.sm,
                backgroundColor: 'transparent',
                border: `1px solid ${tokens.colors.border.primary}`,
                borderRadius: 6,
                color: tokens.colors.text.primary,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 12,
                transition: 'all 200ms ease'
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Support Section */}
      <div>
        <h3
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            color: tokens.colors.text.secondary,
            marginBottom: tokens.spacing.md
          }}
        >
          Support
        </h3>

        <div style={{ display: 'flex', gap: tokens.spacing.sm }}>
          <button
            style={{
              flex: 1,
              height: 44,
              backgroundColor: 'transparent',
              border: `1px solid ${tokens.colors.border.primary}`,
              borderRadius: 6,
              color: tokens.colors.text.primary,
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 12
            }}
          >
            ? Help
          </button>
          <button
            style={{
              flex: 1,
              height: 44,
              backgroundColor: 'transparent',
              border: `1px solid ${tokens.colors.border.primary}`,
              borderRadius: 6,
              color: tokens.colors.text.primary,
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 12
            }}
          >
            📧 Report Issue
          </button>
        </div>
      </div>
    </div>
  );
};
