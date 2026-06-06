import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { useLoad } from '@/features/loads/hooks/useLoad'
import { useCancelLoad } from '@/features/loads/hooks/useCancelLoad'
import { useSettleLoad } from '@/features/loads/hooks/useSettleLoad'
import { useDisputeLoad } from '@/features/loads/hooks/useDisputeLoad'
import { LoadDetail } from '@/features/loads/components/LoadDetail'
import { ContactCard } from '@/features/loads/components/ContactCard'
import { CancelLoadModal } from '@/features/loads/components/CancelLoadModal'
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
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showDisputeForm, setShowDisputeForm] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const { data: load, isLoading, isError } = useLoad(id)
  const { mutate: cancelLoad, isPending: isCancelling } = useCancelLoad()
  const { mutate: settleLoad, isPending: isSettling } = useSettleLoad(id ?? '')
  const { mutate: disputeLoad, isPending: isDisputing } = useDisputeLoad(id ?? '')
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
              onClick={() => setShowCancelModal(true)}
            >
              Cancel Load
            </Button>
          </div>
        )}

        {showCancelModal && (
          <CancelLoadModal
            loadId={load.id}
            onConfirm={(reason) => {
              setShowCancelModal(false)
              cancelLoad({ id: load.id, reason })
            }}
            onCancel={() => setShowCancelModal(false)}
            isLoading={isCancelling}
          />
        )}
      </div>

      {load?.status === 'DELIVERED' && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-base font-semibold text-amber-900 mb-1">Confirm Delivery</h2>
          <p className="text-sm text-amber-700 mb-4">
            Did the trucker deliver this load as expected? Confirm to release payment, or file a dispute if there's an issue.
          </p>
          {!showDisputeForm ? (
            <div className="flex gap-3">
              <Button
                data-testid="settle-load-btn"
                onClick={() => settleLoad()}
                disabled={isSettling}
              >
                {isSettling ? 'Confirming…' : 'Confirm Delivery'}
              </Button>
              <Button
                data-testid="dispute-load-btn"
                variant="secondary"
                className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => setShowDisputeForm(true)}
              >
                File Dispute
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                data-testid="dispute-reason-input"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                rows={3}
                placeholder="Describe the issue with this delivery…"
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
              />
              <div className="flex gap-3">
                <Button
                  data-testid="dispute-submit-btn"
                  variant="secondary"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                  onClick={() => {
                    if (!disputeReason.trim()) return
                    disputeLoad(disputeReason.trim(), {
                      onSuccess: () => { setShowDisputeForm(false); setDisputeReason('') },
                    })
                  }}
                  disabled={isDisputing || !disputeReason.trim()}
                >
                  {isDisputing ? 'Filing…' : 'Submit Dispute'}
                </Button>
                <Button
                  data-testid="dispute-cancel-btn"
                  variant="secondary"
                  onClick={() => { setShowDisputeForm(false); setDisputeReason('') }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

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
