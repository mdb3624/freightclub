import { AppShell } from '@/components/AppShell'
import { useCreateLoad } from '@/features/loads/hooks/useCreateLoad'
import { useCreateDraft } from '@/features/loads/hooks/useCreateDraft'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { LoadForm } from '@/features/loads/components/LoadForm'
import type { LoadFormValues } from '@/features/loads/types'

export function LoadCreatePage() {
  const { mutate, isPending, error } = useCreateLoad()
  const { mutate: saveDraft, isPending: isDraftSaving, error: draftError } = useCreateDraft()
  const { data: profile } = useProfile()

  const defaultValues: Partial<LoadFormValues> = {}

  if (profile?.defaultPickupAddress1 || profile?.defaultPickupCity || profile?.defaultPickupZip) {
    defaultValues.originCity = profile.defaultPickupCity ?? ''
    defaultValues.originState = profile.defaultPickupState ?? ''
    defaultValues.originZip = profile.defaultPickupZip ?? ''
    defaultValues.originAddress1 = profile.defaultPickupAddress1 ?? ''
    defaultValues.originAddress2 = profile.defaultPickupAddress2 ?? ''
  }

  return (
    <AppShell maxWidth="xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Post a Load</h1>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <LoadForm
          onSubmit={mutate}
          onSaveDraft={saveDraft}
          defaultValues={defaultValues}
          isSubmitting={isPending}
          isDraftSaving={isDraftSaving}
          error={error ?? draftError}
          submitLabel="Post Load"
        />
      </div>
    </AppShell>
  )
}
