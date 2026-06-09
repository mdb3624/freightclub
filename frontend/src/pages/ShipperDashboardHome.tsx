import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Package, Calculator, MapPin, Star, Truck, List } from 'lucide-react'
import { usePersonaTheme } from '@/contexts/PersonaThemeContext'
import { AppShell } from '@/components/AppShell'
import { useDashboardSummary } from '@/features/shipper/hooks/useDashboardSummary'
import { useLoadBoard } from '@/features/shipper/hooks/useLoadBoard'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { useCarrierSearch } from '@/features/shipper/hooks/useCarrierSearch'
import { KpiTile } from '@/features/shipper/components/ShipperDashboard/KpiTile'
import { STATUS_BADGE_MAP } from '@/features/shipper/components/ShipperDashboard/statusBadge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const carrierSearchSchema = z.object({
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
})

type CarrierSearchFormData = z.infer<typeof carrierSearchSchema>

const QUICK_ACTIONS = [
  { testId: 'qap-post-load-btn', label: 'Post a Load', route: '/shipper/loads/new', Icon: Package },
  { testId: 'qap-get-quote-btn', label: 'Get a Quote', route: '/shipper/quote', Icon: Calculator },
  { testId: 'qap-track-shipments-btn', label: 'Track Shipments', route: '/dashboard/shipper/loads?view=active', Icon: MapPin },
  { testId: 'qap-preferred-carriers-btn', label: 'Preferred Carriers', route: '/settings/preferred-carriers', Icon: Star },
] as const

const STATUS_PROGRESS: Record<string, number> = {
  DRAFT: 5,
  OPEN: 20,
  CLAIMED: 45,
  IN_TRANSIT: 70,
  DELIVERED: 100,
  CANCELLED: 0,
}

// Bronze gradient + bevel shared across all CTA buttons
const bronzeButtonStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)',
  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)',
  border: '1px solid #7A5F3A',
}

// Bronze-accented panel style (replaces default surfaceClassName border-grey)
const PANEL = 'rounded-md border border-shipper-accent bg-shipper-surface shadow-md'

export function ShipperDashboardHome() {
  const navigate = useNavigate()
  usePersonaTheme() // keep hook call for persona context side-effects

  const { data: summary } = useDashboardSummary()
  const { data: loadBoard } = useLoadBoard({ page: 0, view: 'active', sort: 'updatedAt', order: 'desc' })
  const { data: notifications } = useNotifications()
  const { mutate: searchCarriers, data: carrierResults, isPending: isSearchingCarriers } = useCarrierSearch()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CarrierSearchFormData>({ resolver: zodResolver(carrierSearchSchema) })

  const onCarrierSearchSubmit = (data: CarrierSearchFormData) => {
    searchCarriers(data)
  }

  const recentLoads = (loadBoard?.loads ?? []).slice(0, 8)
  const notificationItems = notifications?.content ?? []

  return (
    <AppShell maxWidth="6xl">
      <div data-testid="dashboard-grid" className="grid grid-cols-12 gap-6 p-8">

        {/* My Loads — navigation row in dashboard body */}
        <div className="col-span-12 flex items-center justify-between">
          <h1 className="text-sm font-bold uppercase tracking-widest text-shipper-text-muted">Shipper Command Center</h1>
          <Link
            to="/dashboard/shipper/loads"
            data-testid="my-loads-nav-link"
            className="flex items-center gap-2 px-4 py-2 rounded-md text-shipper-text text-sm font-semibold transition-opacity hover:opacity-80"
            style={bronzeButtonStyle}
          >
            <List size={14} strokeWidth={1.5} />
            My Loads
          </Link>
        </div>

        {/* Row 1: KPI Strip — 3 × col-span-4 */}
        {summary && (
          <>
            <div className="col-span-12 md:col-span-4">
              <KpiTile
                testId="kpi-tile-activeShipments"
                label={summary.activeShipments.label}
                value={summary.activeShipments.value}
                unit={summary.activeShipments.unit}
              />
            </div>
            <div className="col-span-12 md:col-span-4">
              <KpiTile
                testId="kpi-tile-estimatedCostPerMile"
                label={summary.estimatedCostPerMile.label}
                value={summary.estimatedCostPerMile.value}
                unit={summary.estimatedCostPerMile.unit}
              />
            </div>
            <div className="col-span-12 md:col-span-4">
              <KpiTile
                testId="kpi-tile-onTimeCarrierPct"
                label={summary.onTimeCarrierPct.label}
                value={summary.onTimeCarrierPct.value}
                unit={summary.onTimeCarrierPct.unit}
              />
            </div>
          </>
        )}

        {/* Row 2: Quick Action Panel (col-4) + Shipment Status Feed (col-8) */}

        {/* §3.2 Quick Action Panel */}
        <div data-testid="quick-action-panel" className={`col-span-12 md:col-span-4 p-6 ${PANEL}`}>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4 text-shipper-text-muted">Quick Action Panel</h2>
          <div className="grid grid-cols-2 gap-4">
            {QUICK_ACTIONS.map(({ testId, label, route, Icon }) => (
              <button
                key={testId}
                data-testid={testId}
                onClick={() => navigate(route)}
                className="flex flex-col items-center justify-center gap-1 py-3 px-2 min-h-[44px] rounded-md text-shipper-text text-xs font-semibold hover:opacity-85 active:opacity-70 transition-opacity"
                style={bronzeButtonStyle}
              >
                <Icon size={16} strokeWidth={1.5} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* §3.3 Shipment Status Feed */}
        <div
          data-testid="shipment-status-feed"
          role="feed"
          aria-label="Shipment status feed"
          className={`col-span-12 md:col-span-8 p-6 ${PANEL}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-shipper-text-muted">Shipment Status</h2>
            <Link to="/dashboard/shipper/loads" className="text-xs text-shipper-accent hover:underline font-medium">
              View all
            </Link>
          </div>
          <ul className="flex flex-col max-h-96 overflow-y-auto divide-y divide-shipper-accent/30">
            {recentLoads.length === 0 && (
              <li className="text-xs text-shipper-text-muted flex items-center gap-2 p-4">
                <Truck size={14} strokeWidth={1.5} />
                No active shipments
              </li>
            )}
            {recentLoads.map((load) => {
              const pct = STATUS_PROGRESS[load.status] ?? 0
              return (
                <li
                  key={load.id}
                  role="article"
                  aria-label={`${load.id} ${load.originCity} to ${load.destinationCity} ${load.status}`}
                  className="flex flex-col gap-1 text-xs p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-shipper-text truncate max-w-[60%]">
                      {load.originCity}, {load.originState} &rarr; {load.destinationCity}, {load.destinationState}
                    </span>
                    <span className={`text-xs rounded-full px-2 py-0.5 ${STATUS_BADGE_MAP[load.status] ?? STATUS_BADGE_MAP.DRAFT}`}>
                      {load.status}
                    </span>
                  </div>
                  {/* Segmented metallic bronze progress bar */}
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(176,141,87,0.2)', border: '1px solid rgba(176,141,87,0.3)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, #C9A46A, #B08D57)',
                        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.3)',
                      }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Row 3: Carrier Search (col-5) + Messages & Alerts (col-7) */}

        {/* §3.4 Carrier Search Panel */}
        <div data-testid="carrier-search-panel" className={`col-span-12 md:col-span-5 p-6 ${PANEL}`}>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4 text-shipper-text-muted">Search for Available Carriers</h2>
          <form onSubmit={handleSubmit(onCarrierSearchSubmit)} className="flex flex-col gap-2">
            <Input
              label="Origin"
              testId="carrier-search-origin-input"
              error={errors.origin?.message}
              {...register('origin')}
            />
            <Input
              label="Destination"
              testId="carrier-search-destination-input"
              error={errors.destination?.message}
              {...register('destination')}
            />
            <button
              type="submit"
              data-testid="carrier-search-submit-btn"
              disabled={isSearchingCarriers}
              className="w-full min-h-[44px] rounded-md text-shipper-text text-sm font-semibold mt-1 disabled:opacity-60 transition-opacity hover:opacity-85"
              style={bronzeButtonStyle}
            >
              {isSearchingCarriers ? 'Searching…' : 'Search Carriers'}
            </button>
          </form>
          {carrierResults && (
            <ul data-testid="carrier-search-results" className="flex flex-col gap-1 mt-3">
              {carrierResults.length === 0 && (
                <li data-testid="carrier-search-empty" className="text-xs text-shipper-text-muted">
                  No carriers found for this lane.
                </li>
              )}
              {carrierResults.map((carrier) => (
                <li key={carrier.id} data-testid={`carrier-search-result-${carrier.id}`} className="text-xs flex items-center justify-between py-1 border-b border-shipper-accent/30 last:border-0">
                  <span className="font-medium text-shipper-text">{carrier.companyName}</span>
                  <span className="text-shipper-text-muted">{carrier.equipmentTypes.join(', ')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* §3.5 Messages & Alerts */}
        <div
          data-testid="messages-alerts-panel"
          role="log"
          aria-live="polite"
          className={`col-span-12 md:col-span-7 p-6 ${PANEL}`}
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4 text-shipper-text-muted">Messages &amp; Alerts</h2>
          <ul className="flex flex-col divide-y divide-shipper-accent/30">
            {notificationItems.length === 0 && (
              <li className="text-xs text-shipper-text-muted p-4">No new messages.</li>
            )}
            {notificationItems.map((item) => (
              <li key={item.id} className="text-xs text-shipper-text p-4">
                {item.message}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </AppShell>
  )
}
