import { Link } from 'react-router-dom'
import { useCreateLoad } from '@/features/loads/hooks/useCreateLoad'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { LoadForm } from '@/features/loads/components/LoadForm'
import type { LoadFormValues } from '@/features/loads/types'

export function LoadCreatePage() {
  const { mutate, isPending, error } = useCreateLoad()
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
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6">
        <Link to="/dashboard/shipper" className="text-sm text-primary-600 hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">Post a Load</h1>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <LoadForm
          onSubmit={mutate}
          defaultValues={defaultValues}
          isSubmitting={isPending}
          error={error}
          submitLabel="Post Load"
        />
      </div>
    </div>
  )
}
