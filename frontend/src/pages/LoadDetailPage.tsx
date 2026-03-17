import { Link, useParams } from 'react-router-dom'
import { useLoad } from '@/features/loads/hooks/useLoad'
import { useCancelLoad } from '@/features/loads/hooks/useCancelLoad'
import { LoadDetail } from '@/features/loads/components/LoadDetail'
import { ContactCard } from '@/features/loads/components/ContactCard'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'

const editableStatuses = new Set(['DRAFT', 'OPEN'])

export function LoadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: load, isLoading, isError } = useLoad(id)
  const { mutate: cancelLoad, isPending: isCancelling } = useCancelLoad()

  if (isLoading) return <p className="text-center text-gray-500 py-12">Loading...</p>
  if (isError || !load) return <ErrorBanner message="Load not found." />

  const canEdit = editableStatuses.has(load.status)
  const showTruckerContact = load.truckerContact &&
    ['CLAIMED', 'IN_TRANSIT', 'DELIVERED'].includes(load.status)

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6">
        <Link to="/dashboard/shipper" className="text-sm text-primary-600 hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">Load Detail</h1>
      </div>

      {showTruckerContact && (
        <div className="mb-4">
          <ContactCard title="Assigned Trucker" contact={load.truckerContact!} />
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <LoadDetail load={load} />

        {canEdit && (
          <div className="mt-6 flex gap-3 border-t border-gray-100 pt-6">
            <Link to={`/shipper/loads/${load.id}/edit`}>
              <Button variant="secondary">Edit Load</Button>
            </Link>
            <Button
              variant="secondary"
              className="text-red-600 border-red-300 hover:bg-red-50"
              isLoading={isCancelling}
              onClick={() => cancelLoad(load.id)}
            >
              Cancel Load
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
