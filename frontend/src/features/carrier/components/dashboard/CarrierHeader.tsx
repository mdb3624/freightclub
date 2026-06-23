import React from 'react';

/**
 * AC-1: Dashboard header (56px fixed)
 * Layout: Logo | HOS Chip | Notification Bell | Avatar
 * Design: #1A1A1A surface, bronze accents, white text
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
        paddingLeft: 16,
        paddingRight: 16,
        gap: 12,
        boxSizing: 'border-box'
      }}
    >
      {/* Logo */}
      <div
        data-testid="carrier-logo"
        style={{
          width: 40,
          height: 40,
          backgroundColor: '#B08D57',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 'bold',
          color: '#121212',
          flexShrink: 0
        }}
      >
        🚛
      </div>

      {/* Flex spacer */}
      <div style={{ flex: 1 }} />

      {/* HOS Chip (Hours of Service indicator) */}
      <div
        data-testid="hos-chip"
        style={{
          padding: '6px 12px',
          backgroundColor: '#27AE60',  // GREEN for good HOS
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 600,
          color: '#FFFFFF',
          whiteSpace: 'nowrap',
          minWidth: 100
        }}
      >
        HOS: 3h ✓
      </div>

      {/* Flex spacer */}
      <div style={{ flex: 1 }} />

      {/* Notification Bell */}
      <button
        data-testid="notification-bell"
        style={{
          width: 48,
          height: 48,
          backgroundColor: 'transparent',
          border: 'none',
          color: '#FFFFFF',
          fontSize: 20,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          flexShrink: 0
        }}
        aria-label="Notifications"
      >
        🔔
        {/* Unread badge */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 8,
            height: 8,
            backgroundColor: '#E74C3C',
            borderRadius: '50%'
          }}
        />
      </button>

      {/* Avatar */}
      <div
        data-testid="carrier-avatar"
        style={{
          width: 48,
          height: 48,
          backgroundColor: '#B08D57',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 700,
          color: '#FFFFFF',
          cursor: 'pointer',
          border: '2px solid #B08D57',
          flexShrink: 0
        }}
      >
        JD
      </div>
    </header>
  );
};
