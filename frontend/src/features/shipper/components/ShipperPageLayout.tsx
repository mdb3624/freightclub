import { ReactNode } from 'react'
import { ShipperPageHeader } from './ShipperPageHeader'

interface ShipperPageLayoutProps {
  children?: ReactNode
  slotA?: ReactNode
  slotB?: ReactNode
  slotC?: ReactNode
  profileBanner?: ReactNode
  className?: string
  'data-testid'?: string
}

/**
 * ShipperPageLayout: Mandatory template for all Shipper pages.
 *
 * Structure:
 * - ShipperPageHeader: Logo, branding, last updated (MANDATORY)
 * - ProfileCompletionBanner: Optional notification (if needed)
 * - fc-shell > zone-main > zone-widget-slots (Composite Framework)
 *
 * Enforces:
 * - Container Gate: fc-shell > zone-main > zone-widget-slots hierarchy
 * - Assembly Rule: All content wrapped in .panel classes
 * - Token Gate: CSS variables only (no hardcoded colors)
 * - Layout Gate: CSS Grid-based responsive layout
 *
 * Usage (REQUIRED for all Shipper pages):
 * <ShipperPageLayout
 *   profileBanner={<ProfileCompletionBanner />}  // Optional
 *   slotA={<SlotAContent />}
 *   slotB={<SlotBContent />}
 * />
 */
export function ShipperPageLayout({
  children,
  slotA,
  slotB,
  slotC,
  profileBanner,
  className = '',
  'data-testid': testId = 'shipper-page-layout',
}: ShipperPageLayoutProps) {
  return (
    <div className={`fc-shell ${className}`} data-testid={testId} style={{ background: 'var(--color-canvas)' }}>
      <div className="zone-main">
        {/* MANDATORY: ShipperPageHeader (logo, branding, timestamp) */}
        <ShipperPageHeader />

        {/* OPTIONAL: Profile completion banner or alerts */}
        {profileBanner}

        <div className="zone-widget-slots" data-testid="zone-widget-slots">
          {/* SLOT_A: Full-width row (header/summary content) */}
          {slotA && <div className="slot-a">{slotA}</div>}

          {/* SLOT_B: Main content (full width when no sidebar) */}
          {slotB && <div className={`slot-b ${!slotC ? '!w-full' : ''}`}>{slotB}</div>}

          {/* SLOT_C: Right sidebar (typically 4 columns on grid) */}
          {slotC && <div className="slot-c">{slotC}</div>}

          {/* Fallback for children prop */}
          {!slotA && !slotB && !slotC && children}
        </div>
      </div>
    </div>
  )
}
