import React from 'react';

/**
 * AC-1: Hero section (40% = 271px)
 * Shows active load or top available load with profitability badge
 * Design: Dark surface, bronze accent buttons
 */

export const HeroSection: React.FC = () => {
  // Mock data - would come from state/API
  const activeLoad = {
    id: 'load-001',
    origin: 'Houston',
    destination: 'Dallas',
    pallets: 50,
    rate: 310,
    distance: 265,
    rpm: 1.17,
    profitability: 'success' as const // GREEN: ≥120% min RPM (118%)
  };

  const minRpm = 1.17;

  return (
    <section
      data-testid="hero-section-content"
      style={{
        width: '100%',
        height: '100%',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#1A1A1A',
        boxSizing: 'border-box'
      }}
    >
      {/* Active Load Card */}
      <div
        data-testid="active-load-card"
        style={{
          padding: 16,
          backgroundColor: '#121212',
          border: '1px solid #333333',
          borderRadius: 8,
          position: 'relative'
        }}
      >
        {/* Profitability Badge (top-right) */}
        <div
          data-testid="profitability-badge"
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 60,
            height: 60,
            backgroundColor: '#27AE60',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: 11,
            fontWeight: 'bold',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: 18 }}>✓</div>
          <div>118%</div>
        </div>

        {/* Content */}
        <div style={{ paddingRight: 70 }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 600 }}>
            🚛 YOUR ACTIVE LOAD
          </h2>
          <p style={{ margin: '0 0 12px 0', fontSize: 14, color: '#B0B0B0' }}>
            {activeLoad.pallets} pallets: {activeLoad.origin} → {activeLoad.destination}
          </p>

          {/* Rate + RPM inline */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              fontSize: 12,
              color: '#B0B0B0',
              marginBottom: 12
            }}
          >
            <div>Rate: ${activeLoad.rate}</div>
            <div style={{ color: '#27AE60', fontWeight: 600 }}>
              ✓ {Math.round(activeLoad.profitability === 'success' ? 118 : 105)}% RPM
            </div>
          </div>

          {/* Min RPM summary */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 12,
              color: '#808080'
            }}
          >
            <div>Min RPM: ${minRpm}</div>
            <button
              data-testid="edit-cost-profile-btn"
              style={{
                background: 'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)',
                border: '1px solid #7A5F3A',
                color: '#FFFFFF',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                minHeight: 48,
                minWidth: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 12px',
                borderRadius: 6,
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)'
              }}
            >
              ⚙️ Setup
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons (48px touch targets) */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          paddingTop: 12
        }}
      >
        {/* Claim Button (Bronze Gradient) */}
        <button
          data-testid="claim-load-btn"
          style={{
            flex: 1,
            height: 48,
            padding: '12px 24px',
            background: 'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)',
            border: '1px solid #7A5F3A',
            borderRadius: 8,
            color: '#FFFFFF',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)'
          }}
        >
          CLAIM
        </button>

        {/* Details Button */}
        <button
          data-testid="load-details-btn"
          style={{
            flex: 1,
            height: 48,
            padding: '12px 24px',
            background: 'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)',
            border: '1px solid #7A5F3A',
            borderRadius: 8,
            color: '#FFFFFF',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)'
          }}
        >
          DETAILS
        </button>
      </div>
    </section>
  );
};
