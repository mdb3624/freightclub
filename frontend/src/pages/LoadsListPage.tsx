import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLoads } from '@/features/loads/hooks/useLoads'
import { useCancelLoad } from '@/features/loads/hooks/useCancelLoad'
import { usePublishLoad } from '@/features/loads/hooks/usePublishLoad'
import { LoadsTable } from '@/features/loads/components/LoadsTable'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'

export function LoadsListPage() {
  const [page, setPage] = useState(0)
  const { data, isLoading, isError } = useLoads(page)
  const { mutate: cancelLoad, isPending: isCancelling } = useCancelLoad()
  const { mutate: publishLoad, isPending: isPublishing } = usePublishLoad()

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">My Loads</h1>
        <Link to="/shipper/loads/new">
          <Button>Post a Load</Button>
        </Link>
      </div>

      {isLoading && <p className="text-center text-gray-500 py-12">Loading...</p>}
      {isError && <ErrorBanner message="Failed to load your loads. Please try again." />}

      {data && (
        <>
          <LoadsTable
            loads={data.content}
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
              <span>
                Page {data.number + 1} of {data.totalPages}
              </span>
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
    </div>
  )
}
