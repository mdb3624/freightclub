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
    <div className="fc-shell">
      <div className="zone-main">
        <div className="zone-widget-slots" data-testid="dashboard-grid">

            {/* SLOT_A: Navigation Header + KPI Summary */}
            <div className="slot-a">
              {/* Framework Header: Panel-Header with Branding */}
              <div className="panel-header" data-testid="dashboard-nav" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 'var(--space-lg)',
                marginBottom: 0,
              }}>
                {/* Left: Logo + Branding */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                }}>
                  <img src="/logo.png" alt="FreightClub" style={{ height: '40px' }} />
                  <div>
                    <h1 className="panel-title" style={{ marginBottom: 0, fontSize: 'var(--font-size-lg)' }}>
                      FreightClub
                    </h1>
                    <p style={{
                      margin: 0,
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-secondary)',
                      fontWeight: 'var(--font-weight-regular)',
                    }}>
                      Integrated Logistics
                    </p>
                  </div>
                </div>

                {/* Right: Navigation Elements */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-lg)',
                }}>
                  <div style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-secondary)',
                  }}>
                    Last Updated: 2026-06-10
                  </div>
                  <Link
                    to="/dashboard/shipper/loads"
                    data-testid="my-loads-nav-link"
                    className="btn-bronze"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-sm)',
                      padding: 'var(--space-sm) var(--space-lg)',
                      borderRadius: 'var(--radius-button)',
                      textDecoration: 'none',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                    }}
                  >
                    <List size={14} strokeWidth={1.5} />
                    My Loads
                  </Link>
                </div>
              </div>

              {/* KPI Panel with Widget Grid */}
              {summary && (
                <div className="panel">
                  <div className="panel-header">
                    <h2 className="panel-title">Business Health</h2>
                  </div>
                  <div className="panel-content">
                    <div className="widget-grid">
                      <div className="widget" data-testid="kpi-tile-activeShipments">
                        <div className="widget-number">{summary.activeShipments.value}</div>
                        <div className="widget-label">{summary.activeShipments.label}</div>
                      </div>
                      <div className="widget" data-testid="kpi-tile-onTimeCarrierPct">
                        <div className="widget-number success">{summary.onTimeCarrierPct.value}</div>
                        <div className="widget-label">{summary.onTimeCarrierPct.label}</div>
                      </div>
                      <div className="widget" data-testid="kpi-tile-estimatedCostPerMile">
                        <div className="widget-number">{summary.estimatedCostPerMile.value}</div>
                        <div className="widget-label">{summary.estimatedCostPerMile.label}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SLOT_B: Quick Actions (col-5) + Shipment Status (col-7) */}
            <div className="slot-b">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Quick Action Panel */}
                <div data-testid="quick-action-panel" className="panel">
                  <div className="panel-header">
                    <h2 className="panel-title" style={{ fontSize: 'var(--font-size-lg)' }}>Quick Actions</h2>
                  </div>
                  <div className="panel-content">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                      {QUICK_ACTIONS.map(({ testId, label, route, Icon }) => (
                        <button
                          key={testId}
                          data-testid={testId}
                          onClick={() => navigate(route)}
                          className="btn-bronze"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 'var(--space-xs)',
                            padding: 'var(--space-md)',
                            minHeight: '44px',
                            borderRadius: 'var(--radius-button)',
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 'var(--font-weight-semibold)',
                          }}
                        >
                          <Icon size={16} strokeWidth={1.5} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Shipment Status Feed Panel */}
                <div
                  data-testid="shipment-status-feed"
                  role="feed"
                  aria-label="Shipment status feed"
                  className="panel"
                >
                  <div className="panel-header">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h2 className="panel-title" style={{ fontSize: 'var(--font-size-lg)', margin: 0 }}>
                        Shipment Status
                      </h2>
                      <Link
                        to="/dashboard/shipper/loads"
                        style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-brand-bronze)',
                          textDecoration: 'none',
                          fontWeight: 'var(--font-weight-semibold)',
                        }}
                      >
                        View all
                      </Link>
                    </div>
                  </div>
                  <div className="panel-content">
                    <ul style={{
                      display: 'flex',
                      flexDirection: 'column',
                      maxHeight: '300px',
                      overflowY: 'auto',
                      margin: 0,
                      padding: 0,
                      listStyle: 'none',
                    }}>
                      {recentLoads.length === 0 && (
                        <li style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-sm)',
                          padding: 'var(--space-lg)',
                        }}>
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
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 'var(--space-xs)',
                              padding: 'var(--space-lg)',
                              fontSize: 'var(--font-size-xs)',
                              borderBottom: 'var(--border-divider)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{
                                fontWeight: 'var(--font-weight-semibold)',
                                color: 'var(--color-text-primary)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '70%',
                              }}>
                                {load.originCity}, {load.originState} &rarr; {load.destinationCity}, {load.destinationState}
                              </span>
                              <span className={`status-badge ${load.status.toLowerCase()}`}>
                                {load.status}
                              </span>
                            </div>
                            {/* Progress bar */}
                            <div style={{
                              height: '6px',
                              borderRadius: 'var(--radius-widget)',
                              overflow: 'hidden',
                              background: 'rgba(176,141,87,0.2)',
                              border: '1px solid rgba(176,141,87,0.3)',
                            }}>
                              <div
                                style={{
                                  height: '100%',
                                  width: `${pct}%`,
                                  background: 'linear-gradient(90deg, var(--color-brand-bronze-light), var(--color-brand-bronze))',
                                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.3)',
                                  transition: 'width 500ms ease',
                                }}
                              />
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* SLOT_C: Carrier Search (col-5) + Messages (col-7) */}
            <div className="slot-c" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
              {/* Carrier Search Panel */}
              <div data-testid="carrier-search-panel" className="panel">
                <div className="panel-header">
                  <h2 className="panel-title" style={{ fontSize: 'var(--font-size-lg)' }}>Find Carriers</h2>
                </div>
                <div className="panel-content">
                  <form onSubmit={handleSubmit(onCarrierSearchSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
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
                      className="btn-bronze"
                      style={{
                        width: '100%',
                        minHeight: '44px',
                        borderRadius: 'var(--radius-button)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        marginTop: 'var(--space-sm)',
                        opacity: isSearchingCarriers ? 0.6 : 1,
                      }}
                    >
                      {isSearchingCarriers ? 'Searching…' : 'Search Carriers'}
                    </button>
                  </form>
                  {carrierResults && (
                    <ul data-testid="carrier-search-results" style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-xs)',
                      marginTop: 'var(--space-lg)',
                      listStyle: 'none',
                      margin: 'var(--space-lg) 0 0 0',
                      padding: 0,
                    }}>
                      {carrierResults.length === 0 && (
                        <li data-testid="carrier-search-empty" style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-secondary)',
                        }}>
                          No carriers found for this lane.
                        </li>
                      )}
                      {carrierResults.map((carrier) => (
                        <li
                          key={carrier.id}
                          data-testid={`carrier-search-result-${carrier.id}`}
                          style={{
                            fontSize: 'var(--font-size-xs)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingBottom: 'var(--space-sm)',
                            borderBottom: 'var(--border-divider)',
                          }}
                        >
                          <span style={{
                            fontWeight: 'var(--font-weight-semibold)',
                            color: 'var(--color-text-primary)',
                          }}>
                            {carrier.companyName}
                          </span>
                          <span style={{ color: 'var(--color-text-secondary)' }}>
                            {carrier.equipmentTypes.join(', ')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Messages & Alerts Panel */}
              <div
                data-testid="messages-alerts-panel"
                role="log"
                aria-live="polite"
                className="panel"
              >
                <div className="panel-header">
                  <h2 className="panel-title" style={{ fontSize: 'var(--font-size-lg)' }}>Messages &amp; Alerts</h2>
                </div>
                <div className="panel-content">
                  <ul style={{
                    display: 'flex',
                    flexDirection: 'column',
                    margin: 0,
                    padding: 0,
                    listStyle: 'none',
                  }}>
                    {notificationItems.length === 0 && (
                      <li style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text-secondary)',
                        padding: 'var(--space-lg)',
                      }}>
                        No new messages.
                      </li>
                    )}
                    {notificationItems.map((item) => (
                      <li
                        key={item.id}
                        style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-primary)',
                          padding: 'var(--space-lg)',
                          borderBottom: 'var(--border-divider)',
                        }}
                      >
                        {item.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
  )
}
