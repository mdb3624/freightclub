import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { useLoadStats } from '@/features/shipper/hooks/useLoadStats'
import { useLoadBoard } from '@/features/shipper/hooks/useLoadBoard'
import { SummaryStrip } from '@/features/shipper/components/ShipperDashboard/SummaryStrip'
import { LoadTable } from '@/features/shipper/components/ShipperDashboard/LoadTable'
import { Pagination } from '@/features/shipper/components/ShipperDashboard/Pagination'
import { SearchBar } from '@/features/shipper/components/ShipperDashboard/SearchBar'
import { EmptyState } from '@/features/shipper/components/ShipperDashboard/EmptyState'

export function ShipperDashboard() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const view = (searchParams.get('view') || 'active') as 'active' | 'all'
  const page = parseInt(searchParams.get('page') || '0', 10)
  const sort = searchParams.get('sort') || 'pickupDate'
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
    <AppShell maxWidth="5xl">
      <div className="space-y-6">
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => handleViewToggle('active')}
            className={`px-4 py-2 text-sm font-medium ${
              view === 'active'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active Loads
          </button>
          <button
            onClick={() => handleViewToggle('all')}
            className={`px-4 py-2 text-sm font-medium ${
              view === 'all'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Loads
          </button>
        </div>

        {statsData && (
          <SummaryStrip
            open={statsData.active?.open || 0}
            claimed={statsData.active?.claimed || 0}
            inTransit={statsData.active?.inTransit || 0}
            delivered={statsData.active?.delivered || 0}
          />
        )}

        <SearchBar onSearch={handleSearch} />

        {isEmpty ? (
          <EmptyState onPostLoad={() => navigate('/shipper/loads/new')} />
        ) : (
          <>
            {loadsData && (
              <>
                <LoadTable
                  loads={loadsData.loads}
                  onViewDetails={(id) => navigate(`/shipper/loads/${id}`)}
                  onEdit={(id) => navigate(`/shipper/loads/${id}/edit`)}
                  onCancel={() => {}}
                />
                <Pagination
                  currentPage={page}
                  totalPages={Math.ceil((loadsData.pagination.total || 1) / 20)}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}
