import { ReactNode } from 'react'

interface ShipperPageLayoutProps {
  children?: ReactNode
  slotA?: ReactNode
  slotB?: ReactNode
  slotC?: ReactNode
  header?: ReactNode
  className?: string
  'data-testid'?: string
}

/**
 * ShipperPageLayout: Template-driven Composite Framework shell.
 *
 * Enforces:
 * - Container Gate: fc-shell > zone-main > zone-widget-slots hierarchy
 * - Assembly Rule: All content wrapped in .panel classes
 * - Token Gate: CSS variables only (no hardcoded colors)
 * - Layout Gate: CSS Grid-based responsive layout
 *
 * Usage:
 * <ShipperPageLayout
 *   header={<HeaderComponent />}
 *   slotA={<SlotAContent />}
 *   slotB={<SlotBContent />}
 *   slotC={<SlotCContent />}
 * />
 */
export function ShipperPageLayout({
  children,
  slotA,
  slotB,
  slotC,
  header,
  className = '',
  'data-testid': testId = 'shipper-page-layout',
}: ShipperPageLayoutProps) {
  return (
    <div className={`fc-shell ${className}`} data-testid={testId}>
      <div className="zone-main">
        {header}
        <div className="zone-widget-slots" data-testid="zone-widget-slots">
          {/* SLOT_A: Full-width row (header/summary content) */}
          {slotA && <div className="slot-a">{slotA}</div>}

          {/* SLOT_B: Main content (typically 8 columns on grid) */}
          {slotB && <div className="slot-b">{slotB}</div>}

          {/* SLOT_C: Right sidebar (typically 4 columns on grid) */}
          {slotC && <div className="slot-c">{slotC}</div>}

          {/* Fallback for children prop */}
          {!slotA && !slotB && !slotC && children}
        </div>
      </div>
    </div>
  )
}
