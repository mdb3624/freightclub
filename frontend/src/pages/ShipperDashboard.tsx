import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useLoads } from '@/features/loads/hooks/useLoads'
import { useLoadCounts } from '@/features/loads/hooks/useLoadCounts'
import { useCancelLoad } from '@/features/loads/hooks/useCancelLoad'
import { usePublishLoad } from '@/features/loads/hooks/usePublishLoad'
import { LoadsTable } from '@/features/loads/components/LoadsTable'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { TableSkeleton } from '@/components/ui/Skeleton'

const STATUS_TILES = [
  { status: 'OPEN',       label: 'Open',       color: 'bg-blue-50 border-blue-200 text-blue-800' },
  { status: 'CLAIMED',    label: 'Claimed',    color: 'bg-amber-50 border-amber-200 text-amber-800' },
  { status: 'IN_TRANSIT', label: 'In Transit', color: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
  { status: 'DELIVERED',  label: 'Delivered',  color: 'bg-green-50 border-green-200 text-green-800' },
]

export function ShipperDashboard() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const { data, isLoading, isError, isFetching } = useLoads(page)
  const { data: counts } = useLoadCounts()
  const { mutate: cancelLoad, isPending: isCancelling } = useCancelLoad()
  const { mutate: publishLoad, isPending: isPublishing } = usePublishLoad()

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: ['loads'] })
    queryClient.invalidateQueries({ queryKey: ['load-counts'] })
  }

  return (
    <AppShell maxWidth="6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Loads</h1>
          <p className="mt-1 text-gray-600">
            Welcome back, {user?.firstName}. Post and manage your loads here.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleRefresh} isLoading={isFetching}>
            Refresh
          </Button>
          <Link to="/shipper/loads/new">
            <Button>Post a Load</Button>
          </Link>
        </div>
      </div>

      {counts && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATUS_TILES.map(({ status, label, color }) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(statusFilter === status ? null : status)}
              className={`rounded-lg border px-4 py-3 text-left transition-all ${color} ${
                statusFilter === status ? 'ring-2 ring-offset-1 ring-current' : 'hover:opacity-80'
              }`}
            >
              <p className="text-2xl font-bold">{counts[status] ?? 0}</p>
              <p className="text-xs font-medium mt-0.5">{label}</p>
            </button>
          ))}
        </div>
      )}

      {isLoading && <TableSkeleton rows={5} cols={8} />}
      {isError && <ErrorBanner message="Failed to load your loads. Please try again." />}

      {data && (
        <>
          <LoadsTable
            loads={statusFilter ? data.content.filter((l) => l.status === statusFilter) : data.content}
            onCancel={cancelLoad}
            isCancelling={isCancelling}
            onPublish={publishLoad}
            isPublishing={isPublishing}
          />

          {data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span>Page {data.number + 1} of {data.totalPages}</span>
              <Button
                variant="secondary"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.totalPages - 1}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </AppShell>
  )
}
