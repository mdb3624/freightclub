import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { useLoads } from '@/features/loads/hooks/useLoads'
import { useCancelLoad } from '@/features/loads/hooks/useCancelLoad'
import { LoadsTable } from '@/features/loads/components/LoadsTable'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { TableSkeleton } from '@/components/ui/Skeleton'

export function ShipperDashboard() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const { data, isLoading, isError, isFetching } = useLoads(page)
  const { mutate: cancelLoad, isPending: isCancelling } = useCancelLoad()

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: ['loads'] })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">FreightClub</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user?.firstName} {user?.lastName}
          </span>
          <Link to="/profile" className="text-sm text-primary-600 hover:underline">
            My Profile
          </Link>
          <Button variant="secondary" onClick={logout}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">My Loads</h2>
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

        {isLoading && <TableSkeleton rows={5} cols={8} />}
        {isError && <ErrorBanner message="Failed to load your loads. Please try again." />}

        {data && (
          <>
            <LoadsTable
              loads={data.content}
              onCancel={cancelLoad}
              isCancelling={isCancelling}
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
      </main>
    </div>
  )
}
