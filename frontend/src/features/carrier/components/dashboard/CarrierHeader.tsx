import React from 'react';

/**
 * AC-1: Carrier Dashboard Header (56px fixed, mobile-first)
 * Spec: [🚛 FC] [HOS: 3h left 🟢] [🔔] [👤 JD]
 *
 * Layout (375px mobile):
 * - Logo (🚛 FC): 40px left
 * - HOS chip: center, auto-sized
 * - Bell + Avatar: 48px each, right side
 * - Total: Compact, no overflow
 */

export const CarrierHeader: React.FC = () => {
  return (
    <header
      data-testid="carrier-header"
      style={{
        width: '100%',
        height: 56,
        backgroundColor: '#1A1A1A',
        borderBottom: '1px solid #2A2F37',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 12,
        paddingRight: 12,
        gap: 8,
        boxSizing: 'border-box'
      }}
    >
      {/* Logo: Truck Icon + "FC" Text (mobile-first, compact) */}
      <div
        data-testid="carrier-logo"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          flexShrink: 0,
          minWidth: 'fit-content'
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: '#FFFFFF'
          }}
        >
          🚛
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#B08D57',
            letterSpacing: 1
          }}
        >
          FC
        </div>
      </div>

      {/* HOS Chip (Hours of Service indicator, center) */}
      <div
        data-testid="hos-chip"
        style={{
          padding: '4px 10px',
          backgroundColor: '#27AE60',
          borderRadius: 12,
          fontSize: 11,
          fontWeight: 600,
          color: '#FFFFFF',
          whiteSpace: 'nowrap',
          minWidth: 'fit-content'
        }}
      >
        HOS: 3h ✓
      </div>

      {/* Right Section: Bell + Avatar (48px each, mobile-friendly) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          flexShrink: 0
        }}
      >
        {/* Notification Bell */}
        <button
          data-testid="notification-bell"
          style={{
            width: 48,
            height: 48,
            backgroundColor: 'transparent',
            border: 'none',
            color: '#FFFFFF',
            fontSize: 18,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            padding: 0
          }}
          aria-label="Notifications"
        >
          🔔
          {/* Unread badge */}
          <div
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 8,
              height: 8,
              backgroundColor: '#E74C3C',
              borderRadius: '50%'
            }}
          />
        </button>

        {/* Avatar (48px circular, glove-friendly tap target) */}
        <button
          data-testid="carrier-avatar"
          style={{
            width: 48,
            height: 48,
            backgroundColor: '#B08D57',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            color: '#121212',
            cursor: 'pointer',
            border: 'none',
            padding: 0
          }}
          aria-label="Profile menu"
        >
          JD
        </button>
      </div>
    </header>
  );
};
