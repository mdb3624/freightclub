import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShipperPageLayout } from '@/features/shipper/components/ShipperPageLayout'
import { useCreateLoad } from '@/features/loads/hooks/useCreateLoad'
import { useCreateDraft } from '@/features/loads/hooks/useCreateDraft'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { LoadForm } from '@/features/loads/components/LoadForm'
import type { LoadFormValues } from '@/features/loads/types'

const bronzeButtonStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)',
  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)',
  border: '1px solid #7A5F3A',
}

export function LoadCreatePage() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [submittedLoadId, setSubmittedLoadId] = useState<string | null>(null)

  const { mutate: createLoad, isPending, error } = useCreateLoad({
    onSuccess: (data: any) => {
      setSubmittedLoadId(data.id)
      setSubmitted(true)
    },
  })

  const { mutate: saveDraft, isPending: isDraftSaving, error: draftError } = useCreateDraft()
  const { data: profile, isLoading: profileLoading } = useProfile()

  const defaultValues: Partial<LoadFormValues> = {}

  if (profile?.defaultPickupAddress1 || profile?.defaultPickupCity || profile?.defaultPickupZip) {
    defaultValues.originCity = profile.defaultPickupCity ?? ''
    defaultValues.originState = profile.defaultPickupState ?? ''
    defaultValues.originZip = profile.defaultPickupZip ?? ''
    defaultValues.originAddress1 = profile.defaultPickupAddress1 ?? ''
    defaultValues.originAddress2 = profile.defaultPickupAddress2 ?? ''
  }

  const handleCancel = () => {
    navigate('/dashboard/shipper')
  }

  const handleCreateAnother = () => {
    setSubmitted(false)
    setSubmittedLoadId(null)
  }

  return (
    <ShipperPageLayout slotB={
      <div className="w-full space-y-6 px-6 py-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-gray-900">Create New Load</h1>
          <p className="mt-2 text-sm text-gray-600">Fill in the details below to post a load to the board</p>
        </div>

        {/* Form Container */}
        {!submitted ? (
          profileLoading ? (
            <div className="flex items-center justify-center py-12 text-sm text-gray-400">
              Loading...
            </div>
          ) : (
            <LoadForm
              onSubmit={createLoad}
              onSaveDraft={saveDraft}
              onCancel={handleCancel}
              defaultValues={defaultValues}
              isSubmitting={isPending}
              isDraftSaving={isDraftSaving}
              error={error ?? draftError}
              submitLabel="Create & Post Load"
            />
          )
        ) : submittedLoadId ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 border-l-4 border-l-green-500">
              <div className="flex items-start gap-4">
                <span className="text-3xl text-green-600 flex-shrink-0">✓</span>
                <div className="flex-1">
                  <h2 className="font-bold text-lg text-green-900">Load Posted!</h2>
                  <p className="text-sm text-gray-600 mt-1">Load ID: <span className="font-mono font-semibold">{submittedLoadId}</span></p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleCreateAnother}
                  className="flex-1 rounded-md py-2 px-4 font-medium text-white text-sm transition-all"
                  style={bronzeButtonStyle}
                >
                  Create Another
                </button>
                <button
                  onClick={() => navigate('/dashboard/shipper')}
                  className="flex-1 rounded-md bg-gray-100 px-4 py-2 font-medium text-gray-700 border border-gray-300 hover:bg-gray-200 transition-colors text-sm"
                >
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    } />
  )
}
