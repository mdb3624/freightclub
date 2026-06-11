import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLoadStats } from '@/features/shipper/hooks/useLoadStats'
import { useLoadBoard } from '@/features/shipper/hooks/useLoadBoard'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { SummaryStrip } from '@/features/shipper/components/ShipperDashboard/SummaryStrip'
import { LoadTable } from '@/features/shipper/components/ShipperDashboard/LoadTable'
import { Pagination } from '@/features/shipper/components/ShipperDashboard/Pagination'
import { SearchBar } from '@/features/shipper/components/ShipperDashboard/SearchBar'
import { EmptyState } from '@/features/shipper/components/ShipperDashboard/EmptyState'
import { ProfileCompletionBanner } from '@/features/shipper/components/ProfileCompletionBanner'

export function ShipperDashboard() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: profile } = useProfile()

  const view = (searchParams.get('view') || 'active') as 'active' | 'all'
  const page = parseInt(searchParams.get('page') || '0', 10)
  const sort = searchParams.get('sort') || 'pickupFrom'
  const order = (searchParams.get('order') || 'asc') as 'asc' | 'desc'
  const search = searchParams.get('search') || ''

  const { data: statsData } = useLoadStats(view)
  const { data: loadsData } = useLoadBoard({
    page,
    view,
    sort,
    order,
    search,
  })

  const handleViewToggle = (newView: 'active' | 'all') => {
    setSearchParams({ view: newView, page: '0' })
  }

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      params.set('page', String(newPage))
      return params
    })
  }

  const handleSearch = (query: string) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      if (query) {
        params.set('search', query)
      } else {
        params.delete('search')
      }
      params.set('page', '0')
      return params
    })
  }

  const isEmpty = !loadsData?.loads.length

  return (
    <div className="fc-shell" data-testid="dashboard-container">
      <div className="zone-main">
        {(() => {
          const p = profile as any
          const isComplete = p && p.phone && p.billingCity && (p.businessName || p.firstName)
          const pct = p ? (isComplete ? 85 : 20) : 0
          return (!p || !isComplete) ? <ProfileCompletionBanner completeness={pct} /> : null
        })()}

        <div className="zone-widget-slots">
          {/* SLOT_A: Summary (BusinessHealth) - Full Width */}
          <div className="slot-a">
            {/* View Toggle + Action Buttons Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-lg)',
              paddingBottom: 'var(--space-md)',
              borderBottom: 'var(--border-divider)',
            }}>
              <div style={{
                display: 'flex',
                gap: 'var(--space-sm)',
              }}>
                <button
                  onClick={() => handleViewToggle('active')}
                  style={{
                    padding: 'var(--space-sm) var(--space-md)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: view === 'active' ? 'var(--color-brand-bronze)' : 'var(--color-text-secondary)',
                    borderBottom: view === 'active' ? `2px solid var(--color-brand-bronze)` : 'none',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Active Loads
                </button>
                <button
                  data-testid="tab-all-loads"
                  aria-selected={view === 'all'}
                  onClick={() => handleViewToggle('all')}
                  style={{
                    padding: 'var(--space-sm) var(--space-md)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: view === 'all' ? 'var(--color-brand-bronze)' : 'var(--color-text-secondary)',
                    borderBottom: view === 'all' ? `2px solid var(--color-brand-bronze)` : 'none',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  All Loads
                </button>
              </div>
              <div style={{
                display: 'flex',
                gap: 'var(--space-sm)',
              }}>
                <button
                  onClick={() => navigate('/settings/preferred-carriers')}
                  className="btn-bronze"
                  style={{
                    padding: 'var(--space-sm) var(--space-lg)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    borderRadius: 'var(--radius-button)',
                  }}
                >
                  Preferred Carriers
                </button>
                <button
                  data-testid="post-load-btn"
                  onClick={() => navigate('/shipper/loads/new')}
                  className="btn-bronze"
                  style={{
                    padding: 'var(--space-sm) var(--space-lg)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    borderRadius: 'var(--radius-button)',
                  }}
                >
                  + Post Load
                </button>
              </div>
            </div>

            {/* SummaryStrip Panel */}
            {statsData && (
              <div className="panel">
                <SummaryStrip
                  open={statsData.active?.open || 0}
                  claimed={statsData.active?.claimed || 0}
                  inTransit={statsData.active?.inTransit || 0}
                  delivered={statsData.active?.delivered || 0}
                />
              </div>
            )}
          </div>

          {/* SLOT_B: Search + LoadTable - 8 columns (main content) */}
          <div className="slot-b">
            {/* SearchBar Panel */}
            <div className="panel" data-testid="load-search-input">
              <SearchBar onSearch={handleSearch} />
            </div>

            {isEmpty ? (
              <EmptyState onPostLoad={() => navigate('/shipper/loads/new')} />
            ) : (
              <>
                {loadsData && (
                  <>
                    {/* LoadTable Panel */}
                    <div className="panel" data-testid="load-table">
                      <LoadTable
                        loads={loadsData.loads}
                        onViewDetails={(id) => navigate(`/shipper/loads/${id}`)}
                        onEdit={(id) => navigate(`/shipper/loads/${id}/edit`)}
                        onCancel={() => {}}
                      />
                    </div>

                    {/* Pagination Panel */}
                    <div className="panel">
                      <Pagination
                        currentPage={page}
                        totalPages={Math.ceil((loadsData.pagination.total || 1) / 20)}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
