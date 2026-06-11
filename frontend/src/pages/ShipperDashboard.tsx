/**
 * ShipperDashboard: Route wrapper for US-823 Shipper Dashboard Layout Skeleton
 *
 * Imports the new ShipperDashboardPage (Phase 10) which implements:
 * - 12-column responsive grid (zone-widget-slots)
 * - 8-4 column split (slot-b / slot-c)
 * - 4 main content sections with placeholder skeletons
 * - Composite Framework token compliance (CSS variables only)
 */

import { ShipperDashboardPage } from '@/features/shipper/pages/ShipperDashboardPage'

export function ShipperDashboard() {
  return <ShipperDashboardPage />
}
