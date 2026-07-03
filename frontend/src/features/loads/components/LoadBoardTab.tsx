import { LoadBoardTable } from './LoadBoardTable'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { TableSkeleton } from '@/components/ui/Skeleton'
import type { BoardFilter, BoardSortBy, EquipmentType, LoadSummary, Page } from '@/features/loads/types'

interface Props {
  filter: BoardFilter
  setPage: React.Dispatch<React.SetStateAction<number>>
  data: Page<LoadSummary> | undefined
  isLoading: boolean
  isError: boolean
  onRefresh: () => void
  onSort: (col: BoardSortBy) => void
  userEquipmentType: EquipmentType | undefined
}

const EQUIPMENT_ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 10,
  padding: '8px 10px',
  background: '#161616',
  borderRadius: 8,
  border: '1px solid #2A2A2A',
}

const EQUIPMENT_LABEL_STYLE: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '.07em',
  color: '#636E72',
}

const EQUIPMENT_PILL_STYLE: React.CSSProperties = {
  padding: '2px 10px',
  borderRadius: 9999,
  background: 'rgba(201,168,118,.1)',
  border: '1px solid #C9A876',
  color: '#C9A876',
  fontSize: 12,
  fontWeight: 700,
}

const COUNT_LABEL_STYLE: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#636E72',
}

export function LoadBoardTab({
  filter, setPage, data, isLoading, isError,
  onRefresh, onSort, userEquipmentType,
}: Props) {
  const loadCount = data?.totalElements ?? 0
  const equipmentLabel = userEquipmentType
    ? userEquipmentType.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    : null

  return (
    <section>
      {/* Read-only equipment badge — profile-driven, no filter controls */}
      {equipmentLabel && (
        <div style={EQUIPMENT_ROW_STYLE} data-testid="equipment-badge">
          <span style={EQUIPMENT_LABEL_STYLE}>YOUR EQUIPMENT</span>
          <span style={EQUIPMENT_PILL_STYLE}>{equipmentLabel}</span>
          <span style={{ fontSize: 11, color: '#636E72', marginLeft: 'auto' }}>Loads matched to your rig</span>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <p style={COUNT_LABEL_STYLE} data-testid="load-count-label">
          {loadCount} LOADS MATCHING YOUR RIG
        </p>
        <Button variant="secondary" onClick={onRefresh}>Refresh</Button>
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
