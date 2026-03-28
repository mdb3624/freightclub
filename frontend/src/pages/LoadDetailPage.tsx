import { useParams } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { useLoad } from '@/features/loads/hooks/useLoad'
import { useCancelLoad } from '@/features/loads/hooks/useCancelLoad'
import { LoadDetail } from '@/features/loads/components/LoadDetail'
import { ContactCard } from '@/features/loads/components/ContactCard'
import { useLoadDocuments } from '@/features/documents/hooks/useDocuments'
import { DocumentSection } from '@/features/documents/components/DocumentSection'
import { useMyRatingForLoad, useRateTrucker } from '@/features/ratings/hooks/useRatings'
import { RatingForm } from '@/features/ratings/components/RatingForm'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'

const editableStatuses = new Set(['DRAFT', 'OPEN'])
const documentStatuses = new Set(['OPEN', 'CLAIMED', 'IN_TRANSIT', 'DELIVERED', 'SETTLED'])
const ratingStatuses = new Set(['DELIVERED', 'SETTLED'])

export function LoadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: load, isLoading, isError } = useLoad(id)
  const { mutate: cancelLoad, isPending: isCancelling } = useCancelLoad()
  const { data: documents = [] } = useLoadDocuments(
    load && documentStatuses.has(load.status) ? id : undefined,
  )
  const { data: myRating } = useMyRatingForLoad(
    load && ratingStatuses.has(load.status) ? id : undefined,
  )
  const { mutate: rateTrucker, isPending: isRating } = useRateTrucker(id ?? '')

  if (isLoading) return <AppShell maxWidth="md"><p className="text-center text-gray-500 py-12">Loading...</p></AppShell>
  if (isError || !load) return <AppShell maxWidth="md"><ErrorBanner message="Load not found." /></AppShell>

  const canEdit = editableStatuses.has(load.status)
  const showTruckerContact = load.truckerContact &&
    ['CLAIMED', 'IN_TRANSIT', 'DELIVERED'].includes(load.status)
  const showDocuments = documentStatuses.has(load.status)

  return (
    <AppShell maxWidth="md">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Load Detail</h1>
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

      {load && ratingStatuses.has(load.status) && (
        <RatingForm
          loadId={load.id}
          target="TRUCKER"
          targetName={load.truckerContact?.businessName ?? load.truckerContact?.name ?? 'the trucker'}
          existingRating={myRating ?? undefined}
          onSubmit={(stars, comment) => rateTrucker({ stars, comment })}
          isPending={isRating}
        />
      )}

      {showDocuments && (
        <DocumentSection
          loadId={load.id}
          loadStatus={load.status}
          role="SHIPPER"
          documents={documents}
        />
      )}
    </AppShell>
  )
}
