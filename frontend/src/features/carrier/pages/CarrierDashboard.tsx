import React, { useState } from 'react';
import { CarrierHeader } from '../components/dashboard/CarrierHeader';
import { HeroSection } from '../components/dashboard/HeroSection';
import { TabBar } from '../components/dashboard/TabBar';
import { MyStatsTab } from '../components/dashboard/tabs/MyStatsTab';
import { AvailableLoadsTab } from '../components/dashboard/tabs/AvailableLoadsTab';
import { QuickActionsTab } from '../components/dashboard/tabs/QuickActionsTab';

/**
 * US-730-0: Carrier Dashboard MVP
 * Mobile-first, no-scroll tabbed layout for owner-operators
 *
 * Viewport Math (iPhone 12 - 375px width):
 * - Safe area: 812px - 44px (top) - 34px (bottom) = 734px usable
 * - Header: 56px (fixed)
 * - Hero: 271px (40% of usable)
 * - Tab bar: 48px (fixed)
 * - Content: 359px (60% of usable)
 * TOTAL: 56 + 271 + 48 + 359 = 734px ✓ (no vertical scroll)
 */

type TabType = 'my-stats' | 'available-loads' | 'quick-actions';

const CARRIER_DESIGN_TOKENS = {
  colors: {
    bg: {
      primary: '#121212',      // Deep charcoal (primary background)
      surface: '#1A1A1A',      // Elevated surfaces
      overlay: 'rgba(0,0,0,0.7)'
    },
    accent: {
      bronze: '#B08D57',       // Metallic bronze primary accent
      bronzeGradient: 'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)',
      light: '#C9A46A',
      dark: '#8C6D3F'
    },
    status: {
      success: '#27AE60',      // GREEN: ≥120% min RPM
      warning: '#F39C12',      // AMBER: 100-120% min RPM
      danger: '#E74C3C'        // RED: <100% min RPM
    },
    text: {
      primary: '#FFFFFF',      // 21:1 contrast on #121212
      secondary: '#B0B0B0',    // 7.1:1 contrast on #121212
      muted: '#808080'         // 4.5:1 contrast on #121212
    },
    border: {
      primary: '#333333',      // Panel borders
      secondary: '#2A2F37'     // Section dividers
    }
  },
  viewport: {
    headerHeight: 56,
    tabBarHeight: 48,
    heroHeight: 271,           // 40% of 734px usable
    contentHeight: 359,        // 60% of 734px usable
    totalHeight: 734           // iPhone 12 safe area (812 - 44 - 34)
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  touchTarget: {
    min: 48,                  // Glove-friendly minimum (48px)
    preferred: 56
  }
};

export const CarrierDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('my-stats');

  return (
    <div
      data-testid="carrier-dashboard"
      style={{
        width: '100%',
        height: '100vh',
        maxHeight: '100dvh', // Mobile viewport height accounting for safe areas
        backgroundColor: CARRIER_DESIGN_TOKENS.colors.bg.primary,
        color: CARRIER_DESIGN_TOKENS.colors.text.primary,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // NO VERTICAL SCROLL
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      {/* HEADER: 56px fixed */}
      <header style={{ height: CARRIER_DESIGN_TOKENS.viewport.headerHeight }}>
        <CarrierHeader />
      </header>

      {/* HERO SECTION: 40% (271px) - Always visible */}
      <section
        data-testid="hero-section"
        style={{
          height: CARRIER_DESIGN_TOKENS.viewport.heroHeight,
          backgroundColor: CARRIER_DESIGN_TOKENS.colors.bg.surface,
          borderBottom: `1px solid ${CARRIER_DESIGN_TOKENS.colors.border.secondary}`,
          overflowY: 'hidden',
          flex: '0 0 auto'
        }}
      >
        <HeroSection />
      </section>

      {/* TAB BAR: 48px fixed */}
      <nav
        data-testid="tab-bar"
        style={{
          height: CARRIER_DESIGN_TOKENS.viewport.tabBarHeight,
          backgroundColor: CARRIER_DESIGN_TOKENS.colors.bg.primary,
          borderBottom: `1px solid ${CARRIER_DESIGN_TOKENS.colors.border.secondary}`,
          display: 'flex',
          alignItems: 'center',
          flex: '0 0 auto'
        }}
      >
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </nav>

      {/* TABBED CONTENT AREA: 60% (359px) - Scrollable within tab only */}
      <section
        data-testid="tab-content-area"
        style={{
          flex: '1 1 auto',
          height: CARRIER_DESIGN_TOKENS.viewport.contentHeight,
          backgroundColor: CARRIER_DESIGN_TOKENS.colors.bg.primary,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollBehavior: 'smooth'
        }}
      >
        {activeTab === 'my-stats' && (
          <div data-testid="tab-content-my-stats">
            <MyStatsTab tokens={CARRIER_DESIGN_TOKENS} />
          </div>
        )}

        {activeTab === 'available-loads' && (
          <div data-testid="tab-content-available-loads">
            <AvailableLoadsTab tokens={CARRIER_DESIGN_TOKENS} />
          </div>
        )}

        {activeTab === 'quick-actions' && (
          <div data-testid="tab-content-quick-actions">
            <QuickActionsTab tokens={CARRIER_DESIGN_TOKENS} />
          </div>
        )}
      </section>
    </div>
  );
};

export { CARRIER_DESIGN_TOKENS };
export default CarrierDashboard;
