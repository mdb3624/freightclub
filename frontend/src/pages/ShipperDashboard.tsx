import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLoadStats } from '@/features/shipper/hooks/useLoadStats'
import { useLoadBoard } from '@/features/shipper/hooks/useLoadBoard'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { ShipperPageLayout } from '@/features/shipper/components/ShipperPageLayout'
import { SummaryStrip } from '@/features/shipper/components/ShipperDashboard/SummaryStrip'
import { LoadTable } from '@/features/shipper/components/ShipperDashboard/LoadTable'
import { Pagination } from '@/features/shipper/components/ShipperDashboard/Pagination'
import { SearchBar } from '@/features/shipper/components/ShipperDashboard/SearchBar'
import { EmptyState } from '@/features/shipper/components/ShipperDashboard/EmptyState'
import { ProfileCompletionBanner } from '@/features/shipper/components/ProfileCompletionBanner'
import { KPISummaryPanel } from '@/features/shipper/components/KPISummaryPanel'

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

  // Profile completion check
  const p = profile as any
  const isComplete = p && p.phone && p.billingCity && (p.businessName || p.firstName)
  const completionPct = p ? (isComplete ? 85 : 20) : 0
  const showCompletionBanner = !p || !isComplete

  // SLOT_A: View toggle + action buttons + SummaryStrip
  const slotAContent = (
    <>
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

      {/* KPI Summary Panel (US-820) */}
      <div className="panel" data-testid="kpi-summary-section">
        <KPISummaryPanel />
      </div>
    </>
  )

  // SLOT_B: Search + LoadTable + Pagination
  const slotBContent = (
    <>
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
    </>
  )

  return (
    <ShipperPageLayout
      data-testid="dashboard-container"
      profileBanner={showCompletionBanner ? <ProfileCompletionBanner completeness={completionPct} /> : undefined}
      slotA={slotAContent}
      slotB={slotBContent}
    />
  )
}
