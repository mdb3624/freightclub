import { LoadBoardTable } from './LoadBoardTable'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { TableSkeleton } from '@/components/ui/Skeleton'
import type { AvailableStates, BoardFilter, BoardSortBy, EquipmentType, LoadSummary, Page } from '@/features/loads/types'

interface Props {
  filter: BoardFilter
  setFilter: (updater: (prev: BoardFilter) => BoardFilter) => void
  setPage: React.Dispatch<React.SetStateAction<number>>
  data: Page<LoadSummary> | undefined
  isLoading: boolean
  isError: boolean
  hasActiveLoad: boolean
  availableStates: AvailableStates | undefined
  onRefresh: () => void
  onSort: (col: BoardSortBy) => void
  userEquipmentType: EquipmentType | undefined
}

const EQUIPMENT_BADGE_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  background: 'rgba(176,141,87,0.08)',
  border: '1px solid #C9A876',
  borderRadius: '4px',
  padding: '4px 10px',
  marginBottom: '12px',
  fontSize: '11px',
  fontWeight: 600,
  color: '#8C6D3F',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const COUNT_LABEL_STYLE: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#636E72',
}

export function LoadBoardTab({
  filter, setFilter, setPage, data, isLoading, isError,
  availableStates, onRefresh, onSort, userEquipmentType,
}: Props) {
  const loadCount = data?.totalElements ?? 0
  const equipmentLabel = userEquipmentType
    ? userEquipmentType.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    : null

  return (
    <section>
      {/* AC-1: Read-only equipment badge */}
      {equipmentLabel && (
        <div style={EQUIPMENT_BADGE_STYLE} data-testid="equipment-badge">
          YOUR EQUIPMENT · {equipmentLabel} · Loads matched to your rig
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        {/* AC-1: Load count label */}
        <p style={COUNT_LABEL_STYLE} data-testid="load-count-label">
          {loadCount} LOADS MATCHING YOUR RIG
        </p>
        <Button variant="secondary" onClick={onRefresh}>Refresh</Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Origin State</label>
          <select
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filter.originState ?? ''}
            onChange={(e) => {
              setFilter((f) => ({ ...f, originState: e.target.value || undefined }))
              setPage(0)
            }}
          >
            <option value="">Any</option>
            {(availableStates?.originStates ?? []).map((abbr) => (
              <option key={abbr} value={abbr}>{abbr}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Dest. State</label>
          <select
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filter.destinationState ?? ''}
            onChange={(e) => {
              setFilter((f) => ({ ...f, destinationState: e.target.value || undefined }))
              setPage(0)
            }}
          >
            <option value="">Any</option>
            {(availableStates?.destinationStates ?? []).map((abbr) => (
              <option key={abbr} value={abbr}>{abbr}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Pickup Date</label>
          <input
            type="date"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filter.pickupDate ?? ''}
            onChange={(e) => {
              setFilter((f) => ({ ...f, pickupDate: e.target.value || undefined }))
              setPage(0)
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Delivery Date</label>
          <input
            type="date"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filter.deliveryDate ?? ''}
            onChange={(e) => {
              setFilter((f) => ({ ...f, deliveryDate: e.target.value || undefined }))
              setPage(0)
            }}
          />
        </div>
        {(filter.originState || filter.destinationState || filter.pickupDate || filter.deliveryDate) && (
          <Button
            variant="secondary"
            onClick={() => {
              setFilter(() => ({ equipmentType: userEquipmentType }))
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {isError && <ErrorBanner message="Failed to load the board. Please try again." />}

      {isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : (
        <>
          <div>
            <LoadBoardTable
              loads={data?.content ?? []}
              sortBy={filter.sortBy}
              sortDir={filter.sortDir}
              onSort={onSort}
            />
          </div>

          {data && data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                Page {data.number + 1} of {data.totalPages} ({data.totalElements} loads)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={data.number === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={data.number >= data.totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}
